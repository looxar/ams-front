import Vue from "vue";

import JsonExcel from "vue-json-excel";
Vue.component("downloadExcel", JsonExcel);

import { mdiLaptop } from "@mdi/js";
Vue.component("mdiLaptop", mdiLaptop);

import { mdiDesktopClassic } from "@mdi/js";
Vue.component("mdiDesktopClassic", mdiDesktopClassic);

import Treeselect from "@riophae/vue-treeselect";
Vue.component("treeselect", Treeselect);

import { mdiHomeCity } from "@mdi/js";
Vue.component("mdiHomeCity", mdiHomeCity);

import { mdiAccountHardHat } from "@mdi/js";
Vue.component("mdiAccountHardHat", mdiAccountHardHat);

import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import axios from "axios";
import BarChart from "@/components/BarChart.vue";

export default {
  name: "deviceByDep",
  components: { BarChart },
  data() {
    return {
      expandedRegions: [],
      expandedDivisions: [],
      expandedDepartments: {},
      rows: [],
      loading: false,
      deviceByDep: [],
      error: null,

      alert: false,
      loadingEmp: false,
      loadingCC: false,
      modelEmp: null,
      modelCC: null,

      itemsCC: [],
      itemsEmp: [],
      getDeviceResult: [],
      getEmployeeResult: [],

      highlightedCc: null,
    };
  },

  mounted() {
    this.getCountDeviceByDep();

    this.loadAllData();
  },

  computed: {
    empByCC() {
      const map = new Map(); // ccLongCode -> Employee[]
      for (const e of this.itemsEmp) {
        const k = e.ccLongCode || "UNKNOWN";
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(e);
      }
      // optional: sort / dedupe
      for (const [k, arr] of map) {
        // dedupe by empId
        const seen = new Set(),
          dedup = [];
        for (const e of arr)
          if (!seen.has(e.empId)) {
            seen.add(e.empId);
            dedup.push(e);
          }
        // sort by name
        dedup.sort((a, b) =>
          String(a.empName).localeCompare(String(b.empName))
        );
        map.set(k, dedup);
      }
      return map;
    },

    regions() {
      console.log("rows sample:", this.rows.slice(0, 3)); // 👈 check raw data
      const regionMap = new Map();

      for (const r of this.rows) {
        const ccLongCodeRaw = r.ccLongCode || r.cc_long_code;
        const ccShortName = r.ccShortName || r.cc_short_name || null;
        const divisionCode = r.divisionCode || r.division_code || "UNKNOWN_DIV";
        // const empId = r.empId ?? r.emp_id ?? null;
        const devReceivedDate =
          r.devReceivedDate || r.dev_received_date || null;

        // tag rows by year (use normalized date)
        r._tag = this.tagRowByYear({
          ...r,
          devReceivedDate, // pass normalized field if needed
        });

        // region
        // region key (make sure getRegionKeyFromRow can handle this)
        const regionKey = this.getRegionKeyFromRow({
          ...r,
          ccLongCode: ccLongCodeRaw,
        });

        if (!regionMap.has(regionKey)) {
          regionMap.set(regionKey, {
            regionKey,
            regionLabel: null,
            divisions: new Map(),
            totalRecords: 0,
            newCount: 0,
            oldCount: 0,
            unknownCount: 0,
            firstDept: null,
          });
        }
        const reg = regionMap.get(regionKey);

        reg.totalRecords++;
        if (r._tag === "new") reg.newCount++;
        else if (r._tag === "old") reg.oldCount++;
        else reg.unknownCount++;

        // 🔹 division
        const divKey = divisionCode;
        if (!reg.divisions.has(divKey)) {
          reg.divisions.set(divKey, {
            divisionCode: divKey,
            divisionCount: r.divisionCount ?? 0,
            departmentCount: r.departmentCount ?? 0,
            departments: new Map(),
            totalRecords: 0,
            newCount: 0,
            oldCount: 0,
            unknownCount: 0,
            firstDept: null,
          });
        }
        const div = reg.divisions.get(divKey);

        div.totalRecords++;
        if (r._tag === "new") div.newCount++;
        else if (r._tag === "old") div.oldCount++;
        else div.unknownCount++;

        if (typeof r.divisionCount === "number")
          div.divisionCount = Math.max(div.divisionCount, r.divisionCount);
        if (typeof r.departmentCount === "number")
          div.departmentCount = Math.max(
            div.departmentCount,
            r.departmentCount
          );

        // 🔹 department key (use normalized ccLongCode)
        const deptKey = ccLongCodeRaw
          ? String(ccLongCodeRaw).toUpperCase().trim()
          : "UNKNOWN";

        if (!div.departments.has(deptKey)) {
          div.departments.set(deptKey, {
            ccLongCode: deptKey,
            ccShortName, // use normalized short name
            items: [],
            newCount: 0,
            oldCount: 0,
            unknownCount: 0,
            employees: [],
            empCount: 0,
          });
        }

        const dept = div.departments.get(deptKey);
        // if first row didn't have a name but later rows do, fill it in
        if (!dept.ccShortName && ccShortName) {
          dept.ccShortName = ccShortName;
        }

        dept.items.push({
          ...r,
          devReceivedDate, // keep normalized field for sorting later
        });

        if (r._tag === "new") dept.newCount++;
        else if (r._tag === "old") dept.oldCount++;
        else dept.unknownCount++;

        if (dept.employees.length === 0) {
          const emps = this.empByCC.get(deptKey) || [];
          dept.employees = emps;
          dept.empCount = emps.length;
        }

        // 🔹 use normalized empId when building ownerIds
        const ownerIds = new Set(
          (dept.items || [])
            .map((row) => row.empId ?? row.emp_id)
            .filter((v) => v !== null && v !== undefined)
            .map((v) => String(v))
        );

        const unowned = (dept.employees || []).filter(
          (e) => !ownerIds.has(String(e.empId))
        );

        dept.unownedEmployees = unowned;
        dept.unownedCount = unowned.length;

        // console.log("unownedEmployees", dept.unownedEmployees);
        // console.log("unownedCount", dept.unownedCount);
      }

      const beKey = this.beDateKey;

      return Array.from(regionMap.values())
        .map((reg) => {
          const divisionsArr = Array.from(reg.divisions.values())
            .map((div) => {
              const deptsArr = Array.from(div.departments.values())
                .map((d) => ({
                  ...d,
                  // items: d.items.sort((a, b) =>
                  //   String(a.deviceId).localeCompare(String(b.deviceId))
                  // ),
                  items: d.items.slice().sort((a, b) => {
                    // Newest first
                    const kb = beKey(b.devReceivedDate);
                    const ka = beKey(a.devReceivedDate);
                    if (kb !== ka) return kb - ka;
                    // tie-breaker (optional): by deviceId desc/asc as you prefer
                    return String(b.deviceId).localeCompare(String(a.deviceId));
                  }),
                }))
                .sort((a, b) =>
                  String(a.ccLongCode).localeCompare(String(b.ccLongCode))
                );

              const seenUnownedDiv = new Set();
              const divUnowned = [];
              for (const d of deptsArr) {
                for (const e of d.unownedEmployees || []) {
                  const key = String(e.empId);
                  if (!seenUnownedDiv.has(key)) {
                    seenUnownedDiv.add(key);
                    divUnowned.push(e);
                  }
                }
              }

              const seenDiv = new Set();
              const divEmployees = [];
              for (const d of deptsArr) {
                for (const e of d.employees || []) {
                  const key =
                    e.empId != null ? String(e.empId) : `n:${e.empName}`;
                  if (!seenDiv.has(key)) {
                    seenDiv.add(key);
                    divEmployees.push(e);
                  }
                }
              }

              const firstDeptDiv = div.firstDept || deptsArr[0] || null;

              console.log("divUnowned : ", divUnowned);
              return {
                ...div,
                departments: deptsArr,
                firstDept: firstDeptDiv,
                employees: divEmployees,
                empCount: seenDiv.size,
                unownedEmployees: divUnowned,
                unownedCount: seenUnownedDiv.size,
              };
            })
            .sort((a, b) =>
              String(a.divisionCode).localeCompare(String(b.divisionCode))
            );

          const seenReg = new Set();
          const regEmployees = [];
          for (const dv of divisionsArr) {
            for (const e of dv.employees || []) {
              const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;
              if (!seenReg.has(key)) {
                seenReg.add(key);
                regEmployees.push(e);
              }
            }
          }

          const regionFirstDept =
            reg.firstDept || divisionsArr[0]?.departments?.[0] || null;
          const regionLabel = regionFirstDept
            ? regionFirstDept.ccLongCode
            : reg.regionKey;

          const seenUnownedReg = new Set();
          const regUnowned = [];
          for (const dv of divisionsArr) {
            for (const e of dv.unownedEmployees || []) {
              const key = String(e.empId);
              if (!seenUnownedReg.has(key)) {
                seenUnownedReg.add(key);
                regUnowned.push(e);
              }
            }
          }

          // console.log("regUnowned : ", regUnowned);
          console.log("DEBUG region:", {
            regionKey: reg.regionKey,
            divisionsCount: divisionsArr.length,
            firstDivision: divisionsArr[0],
            regionFirstDept:
              reg.firstDept || divisionsArr[0]?.departments?.[0] || null,
          });

          return {
            ...reg,
            divisions: divisionsArr,
            firstDept: regionFirstDept,
            regionLabel,
            employees: regEmployees,
            empCount: seenReg.size,
            unownedEmployees: regUnowned,
            unownedCount: seenUnownedReg.size,
          };
        })
        .sort((a, b) => String(a.regionKey).localeCompare(String(b.regionKey)));
    },
  },

  watch: {
    "modelCC.ccLongCode"(val) {
      if (val) this.jumpToCc(val);
    },
  },

  created() {},

  methods: {
    async getCountDeviceByDep() {
      this.loading = true;
      try {
        // const response = await axios.get("http://localhost:8080/emp/getEmpAll");
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/api/dev/countDeviceByDep`
        );
        this.deviceByDep = response.data.data.data;

        // this.records60 = response.data.data.map((item) => ({
        //   recordsPerMonth: item[0],
        //   valuePerMonth: item[1],
        //   yearMonth: item[2],
        // }));
        this.rows = this.deviceByDep;
        console.log("getCountDeviceByDep-rows", this.rows);
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingEmp = false;
      }

      this.loading = false;
    },

    beYear(dateStr) {
      if (!dateStr) return null;
      const parts = String(dateStr)
        .trim()
        .split(/[-./\s]+/);
      const y = Number(parts[0]);
      return Number.isFinite(y) ? y : null;
    },

    tagRowByYear(row) {
      const y = this.beYear(row.devReceivedDate);
      if (y == null) return "unknown";
      if (y >= 2561) return "new";
      if (y <= 2560) return "old";
      return "unknown";
    },

    getRegionKeyFromRow(row) {
      const code = String(row.ccLongCode || "")
        .toUpperCase()
        .trim();
      const short = String(row.ccShortName || "").trim();

      // 1) E3010xxxxx -> E3010xx (first 6 chars)
      if (code.startsWith("E3010")) {
        return code.slice(0, 6); // e.g. E30102
      }

      // 2 & 3) E301x… (x ≠ 0): split by กฟจ
      if (/^E301/.test(code)) {
        const x = code.charAt(4);
        if (x !== "0") {
          // be lenient: กฟจ or กฟจ. with optional spaces
          const hasGFJ = /กฟจ\.?/u.test(short);
          return hasGFJ ? "E301X-GFJ" : "E301X-OTHER";
        }
        // if it’s somehow E3010 here, rule 1 would have caught it
      }

      // Others: E302… E303… -> first 4 chars
      if (/^E30[2-9]/.test(code)) return code.slice(0, 4);

      // Fallback: E### (first 4), else first 4 of whatever it is
      const m = code.match(/^E\d{3}/);
      return m ? m[0] : code.slice(0, 4);
    },

    async checkQuotaByDep() {
      this.loading = true;
      if (this.modelCC == null) {
        this.alert = true;
        window.setInterval(() => {
          this.alert = false;
          // console.log("hide alert after 3 seconds");
          this.loading = false;
        }, 3000);
      } else {
        console.log(this.modelCC["ccLongCode"]);
        // let params = [];

        // params = {
        //   region: this.modelCC["ccLongCode"],
        // };

        this.loading = false;
      }
    },

    async loadEmpData() {
      this.loadingEmp = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/emp/getEmpAll2`
        );
        this.itemsEmp = response.data.data1.map((item) => ({
          empId: item[0],
          empName: item[1],
          empDep_full: item[2],
          empRank: item[3],
          ccLongCode: item[4],
        }));
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingEmp = false;
      }
    },
    async loadCCData() {
      this.loadingCC = true;
      try {
        // const response = await axios.get("http://localhost:8080/cc/getAllCCOnlyUse");
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/cc/getAllCCOnlyUse`
        );
        // this.itemsCC = response.data.costCenter;
        console.log("itemsCC123: ", response);
        this.itemsCC = response.data.costCenter.map((item) => ({
          ccLongCode: item[0],
          ccShortName: item[1],
          ccFullName: item[2],
        }));
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingCC = false;
      }
    },

    getItemEmp(itemEmp) {
      return `${itemEmp.empId}` + " " + `${itemEmp.empName}`;
    },

    getItemCC(itemsCC) {
      return (
        `${itemsCC.ccShortName}` +
        " " +
        `${itemsCC.ccLongCode}` +
        " " +
        `${itemsCC.ccFullName}`
      );
    },

    updateCC(modelCC) {
      console.log("modelCC update " + modelCC.ccLongCode);

      this.modelCC = modelCC;

      this.modelEmp = null;
    },

    updateCCFromEmp(modelEmp) {
      // console.log("modelCC update " + modelEmp.ccLongCode);

      var result = this.itemsCC.find(
        (item) => item.ccLongCode === modelEmp.ccLongCode
      );
      // console.log("result " + result.ccLongCode);
      this.modelCC = result;
      // how can I have here the index value?
      console.log("modelCC update " + JSON.stringify(this.modelCC));
    },

    async loadAllData() {
      this.loading = true;
      await Promise.all([
        this.loadEmpData(),
        this.loadCCData(),
        this.getCountDeviceByDep(),
        this.overall(),
      ]);
      this.loading = false;
    },

    jumpToCc(ccLongCode) {
      if (!ccLongCode) return;
      const target = String(ccLongCode).trim();

      // 1) find indices (region, division, dept)
      let rIdx = -1,
        dIdx = -1,
        deptIdx = -1;
      const regs = this.regions; // your computed array

      regs.some((reg, ri) => {
        return reg.divisions.some((div, di) => {
          const i = div.departments.findIndex(
            (d) => String(d.ccLongCode) === target
          );
          if (i !== -1) {
            rIdx = ri;
            dIdx = di;
            deptIdx = i;
            return true;
          }
          return false;
        });
      });

      if (rIdx === -1) {
        // not found — handle as you like
        // this.$toast?.error('ไม่พบรหัสนี้');
        return;
      }

      // 2) expand Region → Division → Department
      // Close other expansions and open only the target path
      const regionKey = regs[rIdx].regionKey;
      const divisionCode = regs[rIdx].divisions[dIdx].divisionCode;

      // Ensure types are correct
      this.expandedRegions = [rIdx];
      this.expandedDivisions = { [regionKey]: [dIdx] };
      this.expandedDepartments = { [divisionCode]: [deptIdx] };

      // 3) after DOM updates, smooth-scroll to the dept header and flash it
      // Some nested expanders render on later ticks and may animate open.
      // Wait until the element exists AND has non-zero size before scrolling.
      const isVisible = (el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.height > 0 && rect.width > 0;
      };

      const scrollToTarget = () => {
        const el = document.getElementById(`dept-${target}`);
        if (el && isVisible(el) && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          this.highlightedCc = target;
          setTimeout(() => {
            this.highlightedCc = null;
          }, 1300);
          return true;
        }
        return false;
      };

      const retryScroll = (tries = 20, delay = 60) => {
        if (scrollToTarget()) return;
        if (tries <= 0) return;
        setTimeout(() => retryScroll(tries - 1, delay), delay);
      };

      this.$nextTick(() => {
        // first tick after we mutate expansion models
        this.$nextTick(() => {
          if (!scrollToTarget()) retryScroll();
        });
      });
    },

    beDateKey(dateStr) {
      // Accepts '2568.1.3', '2568/01/03', '2568-1-3', etc.
      if (!dateStr) return -Infinity; // push unknowns to bottom
      const [yStr, mStr = "1", dStr = "1"] = String(dateStr)
        .trim()
        .split(/[-./\s]+/);
      const y = Number(yStr),
        m = Number(mStr),
        d = Number(dStr);
      if (!Number.isFinite(y)) return -Infinity;
      // BE compare works directly; bigger BE year = newer
      return y * 10000 + m * 100 + d; // e.g., 25680103
    },

    overall() {
      const totalRecords = this.rows.length;
      let newCount = 0,
        oldCount = 0,
        unknownCount = 0;
      const ownerIds = new Set();

      for (const r of this.rows) {
        const tag = r._tag; // 'new' | 'old' | 'unknown'
        if (tag === "new") newCount++;
        else if (tag === "old") oldCount++;
        else unknownCount++;

        if (r.emId !== null && r.emId !== undefined) {
          ownerIds.add(String(r.emId));
        }
      }

      const allEmpIds = new Set();
      for (const e of this.itemsEmp || []) {
        allEmpIds.add(String(e.empId));
      }
      console.log("allEmpIds", allEmpIds);

      const unownedIds = new Set();
      for (const id of allEmpIds) {
        if (!ownerIds.has(id)) unownedIds.add(id);
      }
      console.log("unownedIds", unownedIds);

      const employeesById = new Map(
        (this.itemsEmp || []).map((e) => [String(e.empId), e])
      );
      const unownedEmployees = Array.from(unownedIds)
        .map((id) => employeesById.get(id))
        .filter(Boolean);

      return {
        totalRecords,
        newCount,
        oldCount,
        unknownCount,
        // employees
        empCount: allEmpIds.size, // unique employees overall
        ownedEmpCount: ownerIds.size, // employees that have at least 1 device
        unownedCount: unownedIds.size,
        unownedEmployees, // optional: the list
      };
    },
  },
};

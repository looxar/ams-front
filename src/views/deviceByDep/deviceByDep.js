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

      overallSummary: null,

      surplusSearch: "",
      showBackToTop: false,

      deptViewMode: "all-ge",
      deptViewModes: [
        { value: "all-ge", label: "คอมทั้งหมด ≥ พนักงาน" },
        { value: "all-lt", label: "คอมทั้งหมด < พนักงาน" },
        { value: "new-ge", label: "คอมใหม่ ≥ พนักงาน" },
        { value: "new-lt", label: "คอมใหม่ < พนักงาน" },
      ],

      employeeViewMode: "emp-no-new",
      employeeSearch: "",

      detailMode: "dept",

      counter: 0,

      // employees: [],
    };
  },

  mounted() {
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
      const regionMap = new Map();

      // ---- Phase 1: build base tree from itemsCC (all cost centers) ----
      for (const cc of this.itemsCC || []) {
        const ccLongCodeRaw = String(cc.ccLongCode || "")
          .toUpperCase()
          .trim();
        const ccShortName = cc.ccShortName || null;

        if (!ccLongCodeRaw) continue;
        if (!cc.ccShortName) console.log("actually missing in itemsCC:", cc);

        // 🔹 Region key from CC (reuse your existing logic)
        const regionKey = this.getRegionKeyFromRow({
          ccLongCode: ccLongCodeRaw,
          ccShortName: cc.ccShortName,
        });

        const divisionCode = this.getDivisionCodeFromCc(ccLongCodeRaw);

        // ensure region
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

        // ensure division
        if (!reg.divisions.has(divisionCode)) {
          reg.divisions.set(divisionCode, {
            divisionCode,
            divisionCount: 0,
            departmentCount: 0,
            departments: new Map(),
            totalRecords: 0,
            newCount: 0,
            oldCount: 0,
            unknownCount: 0,
            firstDept: null,
          });
        }
        const div = reg.divisions.get(divisionCode);

        // ensure department (even if it has 0 devices)
        if (!div.departments.has(ccLongCodeRaw)) {
          const emps = this.empByCC?.get(ccLongCodeRaw) || [];
          div.departments.set(ccLongCodeRaw, {
            ccLongCode: ccLongCodeRaw,
            ccShortName,
            items: [], // will be filled in phase 2
            newCount: 0,
            oldCount: 0,
            unknownCount: 0,
            employees: emps,
            empCount: emps.length,
            unownedEmployees: [],
            unownedCount: 0,
          });
        }
      }

      const itemsCCByCode = new Map(
        (this.itemsCC || []).map((cc) => [
          String(cc.ccLongCode).toUpperCase().trim(),
          cc,
        ])
      );
      this.itemsCCByCode = itemsCCByCode;

      // ---- Phase 2: attach device rows to existing departments ----
      const beKey = this.beDateKey;

      for (const r of this.rows || []) {
        const ccLongCodeRaw = r.ccLongCode || r.cc_long_code;
        const devReceivedDate =
          r.devReceivedDate || r.dev_received_date || null;

        const deptKey = ccLongCodeRaw
          ? String(ccLongCodeRaw).toUpperCase().trim()
          : "UNKNOWN";

        const ccMaster = this.itemsCCByCode?.get(deptKey);
        const shortName =
          r.ccShortName || r.cc_short_name || ccMaster?.ccShortName || null;

        // tag row by year (new / old / unknown)
        r._tag = this.tagRowByYear({
          ...r,
          devReceivedDate,
        });

        // const regionKey = this.getRegionKeyFromRow({
        //   ...r,
        //   ccLongCode: ccLongCodeRaw,
        // });
        const regionKey = this.getRegionKeyFromRow({
          ccLongCode: deptKey,
          ccShortName: shortName,
        });

        // Phase 2 (device rows)
        const divisionCode = this.getDivisionCodeFromCc(
          ccLongCodeRaw || r.divisionCode || r.division_code
        );

        // If some CC appears only in device data but not in itemsCC,
        // we still need to create region/div/dept for it:
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

        if (!reg.divisions.has(divisionCode)) {
          reg.divisions.set(divisionCode, {
            divisionCode,
            divisionCount: 0,
            departmentCount: 0,
            departments: new Map(),
            totalRecords: 0,
            newCount: 0,
            oldCount: 0,
            unknownCount: 0,
            firstDept: null,
          });
        }
        const div = reg.divisions.get(divisionCode);

        if (!div.departments.has(deptKey)) {
          // department exists in device data but not in itemsCC
          const emps = this.empByCC?.get(deptKey) || [];
          div.departments.set(deptKey, {
            ccLongCode: deptKey,
            ccShortName: r.ccShortName || r.cc_short_name || null,
            items: [],
            newCount: 0,
            oldCount: 0,
            unknownCount: 0,
            employees: emps,
            empCount: emps.length,
            unownedEmployees: [],
            unownedCount: 0,
          });
        }

        const dept = div.departments.get(deptKey);

        // region & division level counters
        reg.totalRecords++;
        div.totalRecords++;

        if (r._tag === "new") {
          reg.newCount++;
          div.newCount++;
          dept.newCount++;
        } else if (r._tag === "old") {
          reg.oldCount++;
          div.oldCount++;
          dept.oldCount++;
        } else {
          reg.unknownCount++;
          div.unknownCount++;
          dept.unknownCount++;
        }

        // attach device to dept
        dept.items.push({
          ...r,
          devReceivedDate,
        });

        // employees for this dept already set from empByCC in phase 1
        // we can compute unowned employees exactly as before later
      }

      // ---- Phase 3: convert maps → arrays, compute unowned, sort, etc. ----
      // Here you can mostly reuse the bottom half of your old regions()
      // (sorting departments by ccLongCode, computing regionLabel, empCount, etc.)

      return Array.from(regionMap.values())
        .map((reg) => {
          const divisionsArr = Array.from(reg.divisions.values())
            .map((div) => {
              const deptsArr = Array.from(div.departments.values())
                .map((d) => ({
                  ...d,
                  items: d.items.slice().sort((a, b) => {
                    const kb = beKey(b.devReceivedDate);
                    const ka = beKey(a.devReceivedDate);
                    if (kb !== ka) return kb - ka;
                    return String(b.deviceId).localeCompare(String(a.deviceId));
                  }),
                }))
                .sort((a, b) =>
                  String(a.ccLongCode).localeCompare(String(b.ccLongCode))
                );

              // recompute employees, unownedEmployees, empCount at division level
              const seenDiv = new Set();
              const divEmployees = [];
              const seenUnownedDiv = new Set();
              const divUnowned = [];

              for (const d of deptsArr) {
                for (const e of d.employees || []) {
                  const key =
                    e.empId != null ? String(e.empId) : `n:${e.empName}`;
                  if (!seenDiv.has(key)) {
                    seenDiv.add(key);
                    divEmployees.push(e);
                  }
                }
                for (const e of d.unownedEmployees || []) {
                  const key = String(e.empId);
                  if (!seenUnownedDiv.has(key)) {
                    seenUnownedDiv.add(key);
                    divUnowned.push(e);
                  }
                }
              }

              const firstDeptDiv = div.firstDept || deptsArr[0] || null;

              return {
                ...div,
                departments: deptsArr,
                employees: divEmployees,
                empCount: seenDiv.size,
                unownedEmployees: divUnowned,
                unownedCount: seenUnownedDiv.size,
                firstDept: firstDeptDiv,
              };
            })
            .sort((a, b) =>
              String(a.divisionCode).localeCompare(String(b.divisionCode))
            );

          // region-level employees/unowned aggregation same as before
          const seenReg = new Set();
          const regEmployees = [];
          const seenUnownedReg = new Set();
          const regUnowned = [];

          for (const dv of divisionsArr) {
            for (const e of dv.employees || []) {
              const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;
              if (!seenReg.has(key)) {
                seenReg.add(key);
                regEmployees.push(e);
              }
            }
            for (const e of dv.unownedEmployees || []) {
              const key = String(e.empId);
              if (!seenUnownedReg.has(key)) {
                seenUnownedReg.add(key);
                regUnowned.push(e);
              }
            }
          }

          const regionFirstDept =
            reg.firstDept || divisionsArr[0]?.departments?.[0] || null;
          const regionLabel = regionFirstDept
            ? regionFirstDept.ccLongCode
            : reg.regionKey;

          // console.log("DEBUG region:", {
          //   regionKey: reg.regionKey,
          //   divisionsCount: divisionsArr.length,
          //   firstDept: regionFirstDept,
          //   firstDivision: divisionsArr[0],
          //   regionFirstDept:
          //     reg.firstDept || divisionsArr[0]?.departments?.[0] || null,

          //   secondDivision: divisionsArr[1],
          //   regionSecondDept: divisionsArr[1]?.departments?.[1] || null,
          // });

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

    // allItemRichDepts() {
    //   return this.regions.flatMap((reg) => reg.itemRichDepts || []);
    // },

    // allItemPoorDepts() {
    //   return this.regions.flatMap((reg) => reg.itemPoorDepts || []);
    // },

    // ✅ ALL items (not only "new")
    totalDeptCounts() {
      let ge = 0; // departments where total items ≥ employees
      let lt = 0; // departments where total items < employees

      let totalSurplus = 0; // extra devices (all items)
      let totalShortage = 0; // missing devices (all items)

      const deptDiffs = [];

      for (const reg of this.regions || []) {
        for (const div of reg.divisions || []) {
          for (const dept of div.departments || []) {
            // employee count in this dept
            const empCount =
              typeof dept.empCount === "number"
                ? dept.empCount
                : Array.isArray(dept.employees)
                ? dept.employees.length
                : 0;

            // 🔴 HERE is the difference from totalDeptCountsNew:
            //     we use ALL items, not only tag === "new"
            const allItemsCount = Array.isArray(dept.items)
              ? dept.items.length
              : 0;

            const diff = allItemsCount - empCount;

            if (diff >= 0) {
              ge++;
              totalSurplus += diff;
            } else {
              lt++;
              totalShortage += -diff;
            }

            deptDiffs.push({
              regionKey: reg.regionKey,
              regionLabel: reg.regionLabel,
              divisionCode: div.divisionCode,
              ccLongCode: dept.ccLongCode,
              ccShortName: dept.ccShortName,
              empCount,
              allItemsCount,
              diff, // positive = surplus devices, negative = shortage
            });
          }
        }
      }

      return {
        ge, // แผนกที่ "คอมทั้งหมด" ≥ จำนวนพนักงาน
        lt, // แผนกที่ "คอมทั้งหมด" < จำนวนพนักงาน
        total: ge + lt, // จำนวนแผนกที่มีข้อมูลพนักงาน
        totalSurplus, // รวมจำนวนเครื่องที่เกิน (จากทุกแผนก)
        totalShortage, // รวมจำนวนเครื่องที่ขาด (จากทุกแผนก)
        deptDiffs, // รายละเอียดรายแผนก (ถ้าจะเอาไปแสดงในตาราง)
      };
    },

    totalDeviceCounts() {
      let newCount = 0;
      let oldCount = 0; // will include 'old'
      let unknownCount = 0; // will include 'unknown'

      for (const r of this.rows || []) {
        const devReceivedDate =
          r.devReceivedDate || r.dev_received_date || null;

        // 👉 compute tag on the fly, same logic as regions()
        const tag = this.tagRowByYear({
          ...r,
          devReceivedDate,
        });

        if (tag === "new") newCount++;
        else if (tag === "old") oldCount++;
        else unknownCount++;
      }

      return {
        new: newCount,
        old: oldCount, // only old
        unknown: unknownCount, // only unknown
        oldOrUnknown: oldCount + unknownCount, // combined group
        total: this.rows.length,
      };
    },

    totalDeptCountsNew() {
      let ge = 0;
      let lt = 0;

      let totalSurplus = 0;
      let totalShortage = 0;

      const deptDiffs = [];

      for (const reg of this.regions || []) {
        for (const div of reg.divisions || []) {
          for (const dept of div.departments || []) {
            const empCount =
              typeof dept.empCount === "number"
                ? dept.empCount
                : Array.isArray(dept.employees)
                ? dept.employees.length
                : 0;

            // count only NEW devices in this department
            const newItemsCount = (dept.items || []).filter((item) => {
              const devReceivedDate =
                item.devReceivedDate || item.dev_received_date || null;

              const tag = this.tagRowByYear({
                ...item,
                devReceivedDate,
              });

              return tag === "new";
            }).length;

            const diff = newItemsCount - empCount;

            // classify department
            if (diff >= 0) {
              ge++;
              totalSurplus += diff; // extra new devices
            } else {
              lt++;
              totalShortage += -diff; // missing new devices
            }

            // keep per-department info (optional, but very useful)
            deptDiffs.push({
              regionKey: reg.regionKey,
              regionLabel: reg.regionLabel,
              divisionCode: div.divisionCode,
              ccLongCode: dept.ccLongCode,
              ccShortName: dept.ccShortName,
              empCount,
              newItemsCount,
              diff, // positive = extra devices, negative = shortage
            });
          }
        }
      }

      return {
        ge, // แผนกที่ "คอมใหม่" เพียงพอกับพนักงาน
        lt, // แผนกที่ "คอมใหม่" ไม่พอ
        total: ge + lt, // ทั้งหมดที่มีข้อมูลพนักงาน
        // 👉 global gap metrics
        totalSurplus, // รวมจำนวน "คอมใหม่ที่เกินจากจำนวนพนักงาน" ทุกแผนก
        totalShortage, // รวมจำนวน "คอมใหม่ที่ขาดจากจำนวนพนักงาน" ทุกแผนก
        // 👉 optional: per-department details (you can use in a table)
        deptDiffs,
      };
    },

    // 1) All employees that appear in the region/division/department tree
    employeesInRegions() {
      const idSet = new Set();
      const list = [];

      for (const reg of this.regions || []) {
        for (const div of reg.divisions || []) {
          for (const dept of div.departments || []) {
            for (const e of dept.employees || []) {
              const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;

              if (!idSet.has(key)) {
                idSet.add(key);
                list.push(e);
              }
            }
          }
        }
      }

      return {
        idSet, // Set of IDs for quick lookup
        list, // Unique employee objects that exist in regions() structure
      };
    },

    // 2) Employees that exist in itemsEmp BUT never appear in any department in regions()
    employeesMissingFromDepartments() {
      const missing = [];
      const { idSet } = this.employeesInRegions;

      for (const e of this.itemsEmp || []) {
        const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;

        if (!idSet.has(key)) {
          missing.push(e);
        }
      }

      return missing;
    },

    // 3) All owner IDs from device rows
    deviceOwnerIds() {
      const owners = new Set();

      for (const r of this.rows || []) {
        const id = r.empId ?? r.emp_id ?? r.emId ?? r.em_id ?? null;
        if (id != null) owners.add(String(id));
      }

      return owners;
    },

    // 4) Employees that are in departments (regions tree) BUT do not own any device
    employeesWithDeptButNoDevice() {
      const result = [];
      const owners = this.deviceOwnerIds;
      const { list } = this.employeesInRegions;

      for (const e of list) {
        const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;

        if (!owners.has(key)) {
          result.push(e);
        }
      }

      return result;
    },

    employeesWithoutAnyDevice() {
      const map = new Map();

      const add = (e) => {
        if (!e) return;

        const id = this.getEmpId(e);
        const name = (e.empName ?? e.emp_name ?? "").trim();

        // Prefer ID-based key, fallback to name
        const key = id != null ? `id:${id}` : `name:${name}`;

        if (!map.has(key)) {
          map.set(key, e);
        }
      };

      // 1) employees whose dept never shows up in regions() (no devices in that dept)
      for (const e of this.employeesMissingFromDepartments || []) {
        add(e);
      }

      // 2) employees in regions/departments but not owner of any device
      for (const e of this.employeesWithDeptButNoDevice || []) {
        add(e);
      }

      return Array.from(map.values());
    },

    deptNewDeviceStats() {
      const result = [];

      for (const reg of this.regions || []) {
        for (const div of reg.divisions || []) {
          for (const dept of div.departments || []) {
            const empCount =
              typeof dept.empCount === "number"
                ? dept.empCount
                : Array.isArray(dept.employees)
                ? dept.employees.length
                : 0;

            const allItems = dept.items || [];
            const allItemsCount = allItems.length;

            // 🔹 count NEW devices in this department
            let newItemsCount = 0;
            const newOwnerIds = new Set();
            const anyOwnerIds = new Set();

            // for (const item of dept.items || []) {
            for (const item of allItems) {
              const devReceivedDate =
                item.devReceivedDate || item.dev_received_date || null;

              const tag = this.tagRowByYear({
                ...item,
                devReceivedDate,
              });

              const ownerId =
                item.empId ?? item.emp_id ?? item.emId ?? item.em_id ?? null;

              if (ownerId != null) {
                anyOwnerIds.add(String(ownerId));
                if (tag === "new") {
                  newItemsCount++;
                  newOwnerIds.add(String(ownerId));
                }
              }
            }

            // const diff = newItemsCount - empCount;
            const diffAll = allItemsCount - empCount;
            const diffNew = newItemsCount - empCount;

            // 🔹 employees in this department without NEW device
            const employeesWithoutNew = (dept.employees || []).filter((e) => {
              const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;
              return !newOwnerIds.has(key);
            });

            // 🔹 employees in this department without ANY device
            const employeesWithoutAny = (dept.employees || []).filter((e) => {
              const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;
              return !anyOwnerIds.has(key);
            });

            result.push({
              regionKey: reg.regionKey,
              regionLabel: reg.regionLabel,
              divisionCode: div.divisionCode,
              ccLongCode: dept.ccLongCode,
              ccShortName: dept.ccShortName,

              empCount,
              // 🔹 all devices
              allItemsCount,
              diffAll,
              // 🔹 new devices
              newItemsCount,
              diffNew,

              employeesWithoutNew,
              employeesWithoutNewCount: employeesWithoutNew.length,

              employeesWithoutAny,
              employeesWithoutAnyCount: employeesWithoutAny.length,
            });
          }
        }
      }

      return result;
    },

    deptsSurplusNewButNotEveryoneHasNew() {
      return this.deptNewDeviceStats.filter(
        (d) => d.diff > 0 && d.employeesWithoutNewCount > 0
      );
    },

    deptsShortageNew() {
      return this.deptNewDeviceStats.filter((d) => d.diff < 0);
    },

    filteredDeptsSurplusNew() {
      const keyword = (this.surplusSearch || "").toLowerCase().trim();
      const src = this.deptsSurplusNewButNotEveryoneHasNew || [];

      if (!keyword) return src;

      return src.filter((d) => {
        const region = (d.regionLabel || d.regionKey || "").toLowerCase();
        const div = (d.divisionCode || "").toLowerCase();
        const code = (d.ccLongCode || "").toLowerCase();
        const name = (d.ccShortName || "").toLowerCase();
        return (
          region.includes(keyword) ||
          div.includes(keyword) ||
          code.includes(keyword) ||
          name.includes(keyword)
        );
      });
    },

    deptViewLabel() {
      switch (this.deptViewMode) {
        case "all-ge":
          return "แผนกที่ “คอมทั้งหมด” เพียงพอหรือเกินจำนวนพนักงาน";
        case "all-lt":
          return "แผนกที่ “คอมทั้งหมด” ยังไม่เพียงพอกับจำนวนพนักงาน";
        case "new-ge":
          return "แผนกที่ “คอมใหม่ (≥ 2561)” เพียงพอหรือเกินจำนวนพนักงาน";
        case "new-lt":
          return "แผนกที่ “คอมใหม่ (≥ 2561)” ยังไม่เพียงพอกับจำนวนพนักงาน";
        default:
          return "";
      }
    },

    // which metric to use in the table (all vs new)
    deptMetricKey() {
      return this.deptViewMode.startsWith("all") ? "all" : "new";
    },

    // base list per mode
    deptBaseRows() {
      const src = this.deptNewDeviceStats || [];
      switch (this.deptViewMode) {
        case "all-ge":
          return src.filter((d) => d.diffAll >= 0);
        case "all-lt":
          return src.filter((d) => d.diffAll < 0);
        case "new-ge":
          return src.filter((d) => d.diffNew >= 0);
        case "new-lt":
          return src.filter((d) => d.diffNew < 0);
        default:
          return src;
      }
    },

    // text filter on top of the base list
    filteredDeptRows() {
      const keyword = (this.surplusSearch || "").toLowerCase().trim();
      const src = this.deptBaseRows;

      if (!keyword) return src;

      return src.filter((d) => {
        const region = (d.regionLabel || d.regionKey || "").toLowerCase();
        const div = (d.divisionCode || "").toLowerCase();
        const code = (d.ccLongCode || "").toLowerCase();
        const name = (d.ccShortName || "").toLowerCase();
        return (
          region.includes(keyword) ||
          div.includes(keyword) ||
          code.includes(keyword) ||
          name.includes(keyword)
        );
      });
    },

    employeeViewLabel() {
      switch (this.employeeViewMode) {
        case "emp-no-new":
          return "พนักงานที่ยังไม่มีคอมพิวเตอร์ใหม่ (≥ 2561)";
        case "emp-has-new":
          return "พนักงานที่มีคอมพิวเตอร์ใหม่ อย่างน้อย 1 เครื่อง";
        case "emp-no-any":
          return "พนักงานที่ไม่มีคอมพิวเตอร์เลย (ทั้งใหม่และเก่า)";
        default:
          return "";
      }
    },

    employeeBaseRows() {
      switch (this.employeeViewMode) {
        case "emp-no-new":
          return this.oldOnlyEmployees || []; // ✅ old/unknown only456
        case "emp-has-new":
          return this.newDeviceOwners || []; // ✅ has new (maybe old too)123
        case "emp-no-any":
          return this.empNotOwnAnyDevice || []; // ✅ owns nothing789
        default:
          return [];
      }
    },

    // optional: search box for employees
    employeeSearchFilteredRows() {
      const keyword = (this.employeeSearch || "").toLowerCase().trim();
      const src = this.employeeBaseRows;

      if (!keyword) return src;

      return src.filter((e) => {
        const id = (e.empId != null ? String(e.empId) : "").toLowerCase();
        const name = (e.empName || "").toLowerCase();
        const cc = (e.ccLongCode || "").toLowerCase();
        const dept = (e.empDep_full || "").toLowerCase();
        return (
          id.includes(keyword) ||
          name.includes(keyword) ||
          cc.includes(keyword) ||
          dept.includes(keyword)
        );
      });
    },

    debugEmployeePartition() {
      const totalEmployees = (this.itemsEmp || []).length;
      //123
      const newCount = this.newDeviceOwners.length;
      //456
      const oldCount = this.oldOnlyEmployees.length;
      //789
      const noneCount = this.empNotOwnAnyDevice.length;

      const sum = newCount + oldCount + noneCount;

      console.log("[DEBUG employee partition]", {
        totalEmployees,
        new: newCount,
        old: oldCount,
        none: noneCount,
        sum,
        ok: sum === totalEmployees,
      });

      return {
        totalEmployees,
        new: newCount,
        old: oldCount,
        none: noneCount,
        sum,
        ok: sum === totalEmployees,
      };
    },

    oldOwnersAny() {
      const s = new Set();

      for (const r of this.rows || []) {
        const devReceivedDate =
          r.devReceivedDate || r.dev_received_date || null;

        const tag = this.tagRowByYear({ ...r, devReceivedDate });

        if (tag === "old" || tag === "unknown") {
          const id = this.getEmpId(r);
          if (id != null) s.add(String(id).trim());
        }
      }

      return s;
    },

    newOwnersAny() {
      const s = new Set();

      for (const r of this.rows || []) {
        const devReceivedDate =
          r.devReceivedDate || r.dev_received_date || null;

        const tag = this.tagRowByYear({ ...r, devReceivedDate });

        if (tag === "new") {
          const id = this.getEmpId(r);
          if (id != null) s.add(String(id).trim());
        }
      }

      return s;
    },

    //123
    newDeviceOwners() {
      const N = this.newOwnersAny;

      return (this.itemsEmp || []).filter((e) => {
        const id = this.getEmpId(e);
        return id != null && N.has(String(id).trim());
      });
    },

    //456
    oldOnlyEmployees() {
      const O = this.oldOwnersAny; // Set
      const N = this.newOwnersAny; // Set

      return (this.itemsEmp || []).filter((e) => {
        const id = this.getEmpId(e);
        if (id == null) return false;

        const sid = String(id).trim();
        return O.has(sid) && !N.has(sid);
      });
    },

    //789
    empNotOwnAnyDevice() {
      const O = this.oldOwnersAny;
      const N = this.newOwnersAny;

      return (this.itemsEmp || []).filter((e) => {
        const id = this.getEmpId(e);
        if (id == null) return true;

        const sid = String(id).trim();
        return !O.has(sid) && !N.has(sid);
      });
    },
  },

  watch: {
    "modelCC.ccLongCode"(val) {
      if (val) this.jumpToCc(val);
    },

    employees: {
      immediate: true,

      handler(val) {
        const employees = Array.isArray(val) ? val : [];

        // if you want, you can also skip logging until data is loaded
        // if (!employees.length) return;

        //count_new123
        const newCount = this.newDeviceOwners?.length ?? 0;
        //count_old456
        const oldCount = this.oldOnlyEmployees?.length ?? 0;
        //count_none789
        const noneCount = this.empNotOwnAnyDevice?.length ?? 0;

        console.log("[WATCH employees]", {
          totalEmployees: employees.length,
          new: newCount,
          old: oldCount,
          none: noneCount,
          sum: newCount + oldCount + noneCount,
        });
      },
    },
  },

  created() {},

  methods: {
    async loadAllData() {
      this.loading = true;
      await Promise.all([
        this.loadCCData(), //load cost_center for region to department data
        this.loadEmpData(), // load employee data
        this.getCountDeviceByDep(), // load device data
      ]);
      this.overallSummary = this.overall();
      this.debugEmployeePartition;
      this.loading = false;

      console.log("[DEBUG after loadAllData]", {
        itemsEmp: this.itemsEmp?.length,
        rows: this.rows?.length,
        new: this.newDeviceOwners.length,
        oldOnly: this.oldOnlyEmployees.length,
        none: this.empNotOwnAnyDevice.length,
      });
    },

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
        console.log("getCountDeviceByDep-rows", this.rows.slice(100, 101));
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

    // getRegionKeyFromRow(row) {
    //   const code = String(row.ccLongCode || "")
    //     .toUpperCase()
    //     .trim();
    //   const short = String(row.ccShortName || "").trim();

    //   // 1) E3010xxxxx -> E3010xx (first 6 chars)
    //   if (code.startsWith("E3010")) {
    //     return code.slice(0, 6); // e.g. E30102
    //   }

    //   // 2 & 3) E301x… (x ≠ 0): split by กฟจ
    //   if (/^E301/.test(code)) {
    //     const x = code.charAt(4);
    //     if (x !== "0") {
    //       // be lenient: กฟจ or กฟจ. with optional spaces
    //       const hasGFJ = /กฟจ\.?/u.test(short);
    //       return hasGFJ ? "E301X-GFJ" : "E301X-OTHER";
    //     }
    //     // if it’s somehow E3010 here, rule 1 would have caught it
    //   }

    //   // Others: E302… E303… -> first 4 chars
    //   if (/^E30[2-9]/.test(code)) return code.slice(0, 4);

    //   // Fallback: E### (first 4), else first 4 of whatever it is
    //   const m = code.match(/^E\d{3}/);
    //   return m ? m[0] : code.slice(0, 4);
    // },
    getRegionKeyFromRow(row) {
      const code = String(row.ccLongCode || "")
        .toUpperCase()
        .trim();

      // const short = String(row.ccShortName || "").trim();

      // ---- E301 special handling ----
      if (code.startsWith("E301")) {
        const key6 = code.slice(0, 6); // e.g. E30104

        const allowed = new Set([
          "E30100",
          "E30101",
          "E30102",
          "E30103",
          "E30110",
        ]);

        // ✅ Allowed list always wins
        if (allowed.has(key6)) {
          return key6;
        }

        const rawShort = row.ccShortName;

        if (!rawShort) {
          this.counter++;
          console.warn(
            "Missing ccShortName for",
            row.ccLongCode,
            "-",
            this.counter
          );
        }

        const shortNorm = String(row.ccShortName || "")
          .replace(/[．。]/g, ".")
          .replace(/\s+/g, "")
          .trim();

        console.log("shortNorm", shortNorm, "-", this.counter);

        // ---- Name-based recheck ----
        // const hasGFJ = shortNorm.includes("กฟจ");
        const hasGFS = shortNorm.includes("กฟส");

        // กฟส. OR (กฟจ. + กฟส.) → E30110
        if (hasGFS) {
          this.counter++;
          return "E30110";
        }

        // กฟจ. only or anything else → E301-CEO
        return "E301-CEO";
      }

      // ---- Others: E302… E303… ----
      if (/^E30[2-9]/.test(code)) return code.slice(0, 4);

      // ---- Fallback ----
      const m = code.match(/^E\d{3}/);
      return m ? m[0] : code.slice(0, 4);
    },

    async checkQuotaByDep() {
      this.loading = true;
      if (this.modelCC == null) {
        this.alert = true;
        window.setInterval(() => {
          this.alert = false;
          this.loading = false;
        }, 3000);
      } else {
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
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/cc/getAllCCOnlyUse`
        );
        // console.log("itemsCC123: ", response);
        this.itemsCC = response.data.costCenter.map((item) => ({
          ccLongCode: item[0],
          ccShortName: item[1],
          ccFullName: item[2],
          // ccLongCode: item.cc_long_code,
          // ccShortName: item[1],
          // ccFullName: item.cc_full_name,
        }));
        // console.log("itemsCC sample:", this.itemsCC.slice(0, 3));
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
      this.modelCC = modelCC;
      this.modelEmp = null;
    },

    updateCCFromEmp(modelEmp) {
      var result = this.itemsCC.find(
        (item) => item.ccLongCode === modelEmp.ccLongCode
      );
      this.modelCC = result;
    },

    jumpToCc(ccLongCode) {
      console.log("jumpToCc:", ccLongCode);
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
        console.log("ไม่พบรหัสนี้");
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

          this.showBackToTop = true;

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

    // 👇 new method to go back to the suggested section
    scrollBackToSuggestions() {
      // Which mode is currently visible?
      let targetRef = null;
      if (this.detailMode === "dept") {
        targetRef = this.$refs.surplusSection;
      } else if (this.detailMode === "emp") {
        targetRef = this.$refs.employeeSection;
      }
      if (!targetRef) return;

      // Scroll smoothly to the top summary card (suggested section)
      if (this.$vuetify && this.$vuetify.goTo) {
        this.$vuetify.goTo(targetRef, {
          duration: 600,
          offset: 80,
          easing: "easeInOutCubic",
        });
      } else {
        targetRef.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // optional: hide button after going back up
      this.showBackToTop = false;
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
      //จำนวนคอมพิวเตอร์ทั้งหมด
      const totalRecords = this.rows.length;
      let newCount = 0,
        oldCount = 0,
        unknownCount = 0;
      const ownerIds = new Set();

      for (const r of this.rows) {
        const devReceivedDate =
          r.devReceivedDate || r.dev_received_date || null;
        // const tag = r._tag; // 'new' | 'old' | 'unknown'
        const tag = this.tagRowByYear({
          ...r,
          devReceivedDate,
        });

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

      const unownedIds = new Set();
      for (const id of allEmpIds) {
        if (!ownerIds.has(id)) unownedIds.add(id);
      }

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

        empCount: allEmpIds.size, // unique employees overall
        ownedEmpCount: ownerIds.size, // employees that have at least 1 device
        unownedCount: unownedIds.size,
        unownedEmployees, // optional: the list
      };
    },

    // setDeptViewMode(mode) {
    //   this.deptViewMode = mode;
    // },

    setDeptViewModeAndScroll(mode) {
      this.detailMode = "dept";
      this.deptViewMode = mode;

      // scroll to the detailed table card (ref="surplusSection")
      this.$nextTick(() => {
        const el =
          this.$refs.surplusSection ||
          document.getElementById("surplus-section");

        if (el) {
          if (this.$vuetify && this.$vuetify.goTo) {
            this.$vuetify.goTo(el, {
              duration: 600,
              offset: 80,
              easing: "easeInOutCubic",
            });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    },

    setEmployeeViewModeAndScroll(mode) {
      this.detailMode = "emp";
      this.employeeViewMode = mode;

      // scroll down to employee detail table card
      this.$nextTick(() => {
        const el =
          this.$refs.employeeSection ||
          document.getElementById("employee-section");

        if (el) {
          if (this.$vuetify && this.$vuetify.goTo) {
            this.$vuetify.goTo(el, {
              duration: 600,
              offset: 80,
              easing: "easeInOutCubic",
            });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    },

    getDivisionCodeFromCc(ccLongCode) {
      if (!ccLongCode) return "UNKNOWN_DIV";
      const code = String(ccLongCode).trim().toUpperCase();
      // keep exactly 7 chars for division
      return code.substring(0, 7);
    },

    getEmpId(obj) {
      return obj.empId ?? obj.emp_id ?? obj.emId ?? obj.em_id ?? null;
    },
  },
};

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
      }

      const beKey = this.beDateKey;

      return Array.from(regionMap.values())
        .map((reg) => {
          const divisionsArr = Array.from(reg.divisions.values())
            .map((div) => {
              // const deptsArr = Array.from(div.departments.values())
              //   .map((d) => ({
              //     ...d,
              //     items: d.items.slice().sort((a, b) => {
              //       const kb = beKey(b.devReceivedDate);
              //       const ka = beKey(a.devReceivedDate);
              //       if (kb !== ka) return kb - ka;

              //       return String(b.deviceId).localeCompare(String(a.deviceId));
              //     }),
              //   }))
              //   .sort((a, b) =>
              //     String(a.ccLongCode).localeCompare(String(b.ccLongCode))
              //   );
              const deptsArr = Array.from(div.departments.values())
                .map((d) => {
                  const items = d.items.slice().sort((a, b) => {
                    const kb = beKey(b.devReceivedDate);
                    const ka = beKey(a.devReceivedDate);
                    if (kb !== ka) return kb - ka;
                    return String(b.deviceId).localeCompare(String(a.deviceId));
                  });

                  const itemsCount = Array.isArray(items) ? items.length : 0;
                  const empCount =
                    typeof d.empCount === "number"
                      ? d.empCount
                      : Array.isArray(d.employees)
                      ? d.employees.length
                      : 0;

                  const isItemRich = itemsCount >= empCount; // 🍰 key condition

                  return {
                    ...d,
                    items,
                    itemsCount,
                    empCount,
                    isItemRich,
                    // department-level counts (0/1)
                    deptItemGECount: isItemRich ? 1 : 0,
                    deptItemLTCount: isItemRich ? 0 : 1,
                  };
                })
                .sort((a, b) =>
                  String(a.ccLongCode).localeCompare(String(b.ccLongCode))
                );

              // // 👉 classify departments at DIVISION level
              // const itemRichDepts = []; // items >= employees
              // const itemPoorDepts = []; // items < employees

              // for (const d of deptsArr) {
              //   const itemsCount = Array.isArray(d.items) ? d.items.length : 0;
              //   const empCount =
              //     typeof d.empCount === "number"
              //       ? d.empCount
              //       : Array.isArray(d.employees)
              //       ? d.employees.length
              //       : 0;

              //   if (itemsCount >= empCount) {
              //     itemRichDepts.push(d);
              //   } else {
              //     itemPoorDepts.push(d);
              //   }
              // }

              // division-level aggregates
              const divDeptItemGECount = deptsArr.reduce(
                (sum, d) => sum + (d.deptItemGECount || 0),
                0
              );
              const divDeptItemLTCount = deptsArr.reduce(
                (sum, d) => sum + (d.deptItemLTCount || 0),
                0
              );

              // optional: arrays for this division only
              const itemRichDepts = deptsArr.filter((d) => d.isItemRich);
              const itemPoorDepts = deptsArr.filter((d) => !d.isItemRich);

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

                // 👇 NEW: division-level department counts
                deptItemGECount: divDeptItemGECount,
                deptItemLTCount: divDeptItemLTCount,
                itemRichDepts,
                itemPoorDepts,
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

          // // 👉 collect all departments in this region
          // const allDeptsInRegion = divisionsArr.flatMap(
          //   (dv) => dv.departments || []
          // );

          // // 👉 classify departments at REGION level
          // const regionItemRichDepts = [];
          // const regionItemPoorDepts = [];

          // for (const d of allDeptsInRegion) {
          //   const itemsCount = Array.isArray(d.items) ? d.items.length : 0;
          //   const empCount =
          //     typeof d.empCount === "number"
          //       ? d.empCount
          //       : Array.isArray(d.employees)
          //       ? d.employees.length
          //       : 0;

          //   if (itemsCount >= empCount) {
          //     regionItemRichDepts.push(d);
          //   } else {
          //     regionItemPoorDepts.push(d);
          //   }
          // }

          // region-level department arrays
          const regionItemRichDepts = divisionsArr.flatMap(
            (dv) => dv.itemRichDepts || []
          );
          const regionItemPoorDepts = divisionsArr.flatMap(
            (dv) => dv.itemPoorDepts || []
          );

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

          // 🔹 ADD THIS: sum division counts → region counts
          const regionDeptItemGECount = divisionsArr.reduce(
            (sum, dv) => sum + (dv.deptItemGECount || 0),
            0
          );
          const regionDeptItemLTCount = divisionsArr.reduce(
            (sum, dv) => sum + (dv.deptItemLTCount || 0),
            0
          );

          console.log("DEBUG region:", {
            regionKey: reg.regionKey,
            divisionsCount: divisionsArr.length,
            firstDivision: divisionsArr[0],
            regionFirstDept:
              reg.firstDept || divisionsArr[0]?.departments?.[0] || null,

            // deptItemGECount: regionItemRichDepts.length,
            // deptItemLTCount: regionItemPoorDepts.length,
            itemRichDepts: regionItemRichDepts,
            itemPoorDepts: regionItemPoorDepts,
            // 👇 NEW: now each region has its own totals
            deptItemGECount: regionDeptItemGECount,
            deptItemLTCount: regionDeptItemLTCount,
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

            // // 👇 NEW: region-level department counts
            // deptItemGECount: regionItemRichDepts.length,
            // deptItemLTCount: regionItemPoorDepts.length,
            itemRichDepts: regionItemRichDepts,
            itemPoorDepts: regionItemPoorDepts,

            // 👇 NEW: now each region has its own totals
            deptItemGECount: regionDeptItemGECount,
            deptItemLTCount: regionDeptItemLTCount,
          };
        })
        .sort((a, b) => String(a.regionKey).localeCompare(String(b.regionKey)));
    },

    allItemRichDepts() {
      return this.regions.flatMap((reg) => reg.itemRichDepts || []);
    },

    allItemPoorDepts() {
      return this.regions.flatMap((reg) => reg.itemPoorDepts || []);
    },

    // 🔹 Global totals for all departments in all regions
    totalDeptCounts() {
      let ge = 0; // items ≥ employees
      let lt = 0; // items < employees

      for (const reg of this.regions || []) {
        ge += reg.deptItemGECount || 0;
        lt += reg.deptItemLTCount || 0;
      }

      return {
        ge, // number of departments with items ≥ employees
        lt, // number of departments with items < employees
        total: ge + lt, // total departments (with device data)
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

    // 🔹 Global department summary based only on "new" devices
    totalDeptCountsNew() {
      let ge = 0; // items(new) >= employees
      let lt = 0; // items(new) < employees

      let totalSurplus = 0; // sum of (newItemsCount - empCount) where diff > 0
      let totalShortage = 0; // sum of (empCount - newItemsCount) where diff < 0

      const deptDiffs = []; // optional: per-department detail

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

      // 1) employees whose dept never shows up in regions() (no devices in that dept)
      for (const e of this.employeesMissingFromDepartments || []) {
        const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;
        map.set(key, e);
      }

      // 2) employees in regions/departments but not owner of any device
      for (const e of this.employeesWithDeptButNoDevice || []) {
        const key = e.empId != null ? String(e.empId) : `n:${e.empName}`;
        if (!map.has(key)) {
          map.set(key, e);
        }
      }

      return Array.from(map.values());
    },

    // All employees who own at least one OLD device
    oldDeviceOwners() {
      const owners = new Set();

      for (const r of this.rows || []) {
        const devReceivedDate =
          r.devReceivedDate || r.dev_received_date || null;

        const tag = this.tagRowByYear({
          ...r,
          devReceivedDate,
        });

        if (tag === "old") {
          const id = r.empId ?? r.emp_id ?? r.emId ?? r.em_id;
          if (id != null) owners.add(String(id));
        }
      }

      return owners;
    },

    employeesWithoutAnyDevice_OwnOldDevice() {
      const oldOwners = this.oldDeviceOwners;

      return this.employeesWithoutAnyDevice.filter((e) =>
        oldOwners.has(String(e.empId))
      );
    },

    employeesWithoutAnyDevice_NoDeviceAtAll() {
      const oldOwners = this.oldDeviceOwners;

      return this.employeesWithoutAnyDevice.filter(
        (e) => !oldOwners.has(String(e.empId))
      );
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
      console.log("deptViewLabel : ",this.deptViewMode);
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
  },

  watch: {
    "modelCC.ccLongCode"(val) {
      if (val) this.jumpToCc(val);
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
        // this.overall(),
      ]);
      this.overallSummary = this.overall();
      console.log(
        "employeesMissingFromDepartments:",
        this.employeesMissingFromDepartments
      );
      console.log("count:", this.employeesMissingFromDepartments.length);

      console.log(
        "employeesWithDeptButNoDevice:",
        this.employeesWithDeptButNoDevice
      );
      console.log("count:", this.employeesWithDeptButNoDevice.length);

      console.log("employeesWithoutAnyDevice:", this.employeesWithoutAnyDevice);
      console.log("count:", this.employeesWithoutAnyDevice.length);

      console.log(
        "employeesWithoutAnyDevice_OwnOldDevice:",
        this.employeesWithoutAnyDevice_OwnOldDevice
      );
      console.log("count:", this.employeesWithoutAnyDevice_OwnOldDevice.length);

      this.loading = false;
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
      const el =
        this.$refs.surplusSection || document.getElementById("surplus-section");

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
  },
};

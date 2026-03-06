import Vue from "vue";

import JsonExcel from "vue-json-excel";
Vue.component("downloadExcel", JsonExcel);

import { mdiMicrosoftExcel } from "@mdi/js";
Vue.component("mdiMicrosoftExcel", mdiMicrosoftExcel);

import { mdiFileFindOutline } from "@mdi/js";
Vue.component("mdiFileFindOutline", mdiFileFindOutline);

import { mdiMagnify } from "@mdi/js";
Vue.component("mdiMagnify", mdiMagnify);

import { mdiQrcode } from "@mdi/js";
Vue.component("mdiQrcode", mdiQrcode);

import Treeselect from "@riophae/vue-treeselect";
Vue.component("treeselect", Treeselect);

import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import axios from "axios";

import * as XLSX from "xlsx";

import dateService from "../../services/dateService";

export default {
  name: "EventsList",
  data() {
    return {
      selectedFile: null,
      fileName: "",
      alert: false,
      expectedHeaders: [
        "สินทรัพย์",
        "SNo.",
        "InvNo.",
        "คำอธิบายของสินทรัพย์",
        "ศ.ต้นทุน",
        "ศูนย์กำไร",
        "Cap.date",
        "มูลค่าการได้มา",
        "ค่าเสื่อมสะสม",
        "มูลค่าตามบัญชี",
        "Pers.No.",
        "เลขที่ผลิตภัณฑ์",
        "Serial No.",
      ],
      tableItems: [],
      tableHeaders: [
        { text: "devPeaNo", value: "devPeaNo" },
        { text: "Description", value: "dev_description" },
        { text: "Serial No.", value: "dev_serial_no" },
        { text: "Employee ID", value: "emp_id" },
        { text: "Cost Center", value: "cc_long_code" },
        { text: "Received Price", value: "dev_received_price" },
        { text: "Left Price", value: "dev_left_price" },
        { text: "Received Date", value: "dev_received_date" },
      ],
      // separated loading flags to avoid races
      readLoading: false,
      processLoading: false,
      isReadFileValid: false,
      uploadItems: [],
      uploadAbortController: null,
      headerMap: {
        สินทรัพย์: "devPeaNo",
        คำอธิบายของสินทรัพย์: "devDescription",
        เลขที่ผลิตภัณฑ์: "devSerialNo",
        "Cap.date": "devReceivedDate",
        มูลค่าการได้มา: "devReceivedPrice",
        มูลค่าตามบัญชี: "devLeftPrice",
        "ศ.ต้นทุน": "ccLongCode",
        "Pers.No.": "empId",
        "SNo.": "SNo.",
        "Serial No.": "devSerialNo",
      },
      // headerMap: {
      //   สินทรัพย์: "devPeaNo",
      //   คำอธิบายของสินทรัพย์: "devDescription",
      //   เลขที่ผลิตภัณฑ์: "devSerialNo",
      //   "Serial no.": "devSerialNo",
      //   "Cap.date": "devReceivedDate",
      //   มูลค่าการได้มา: "devReceivedPrice",
      //   มูลค่าตามบัญชี: "devLeftPrice",
      //   "ศ.ต้นทุน": "ccLongCodeString",
      //   "Pers.No.": "empIdString",
      // },
      uploadFinish: false,
      uploadFinishtime: Date.now(),
      uploadSuccess: false,
      noMatchTableItems: [],
      noMatchTableHeaders: [
        // { text: "Description", value: "devDescription" },
        // { text: "Received Date", value: "devReceivedDate" },
        // { text: "Received Price", value: "devReceivedPrice" },
        // { text: "Concat Price Date", value: "devConcatPriceDate" },
        { text: "Description", value: "dev_description" },
        { text: "Received Date", value: "dev_received_date" },
        { text: "Received Price", value: "dev_received_price" },
        { text: "Concat Price Date", value: "dev_concat_price_date" },
      ],
      insertedCount: undefined,
      insertedCount2: undefined,
      softDeletedCount: undefined,
      missingForPreview: [],
      missingFromMap: [],
      headerAliases: {
        dev_description: ["คำอธิบายของสินทรัพย์", "คำอธิบาย"],
        dev_serial_no: ["เลขที่ผลิตภัณฑ์", "Serial no.", "Serial No."],
        devPeaNo_asset: ["สินทรัพย์"],
        devPeaNo_sno: ["SNo."],
        emp_id: ["Pers.No."],
        cc_long_code: ["ศ.ต้นทุน"],
        dev_received_price: ["มูลค่าการได้มา"],
        dev_left_price: ["มูลค่าตามบัญชี"],
        dev_received_date: ["Cap.date"],
      },
    };
  },

  watch: {},

  mounted() {},

  created() {},

  methods: {
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (
          !allowedTypes.includes(file.type) &&
          fileExtension !== "xls" &&
          fileExtension !== "xlsx"
        ) {
          this.alert = true;
          this.fileName = "";
          this.selectedFile = null;
          console.warn("Invalid file type");
          return;
        }

        this.selectedFile = file;
        this.fileName = file.name;
        this.alert = false;
        // Optional: auto upload or validate here
      }
    },

    processReadFile() {
      this.readLoading = true;
      this.uploadFinish = false;

      this.alert = false;

      const reader = new FileReader();

      const getFirstValue = (row, keys) => {
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
            return row[key];
          }
        }
        return "";
      };

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        try {
          const workbook = XLSX.read(data, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          const headerRowIndex = rows.findIndex((row) => {
            if (!Array.isArray(row)) return false;

            const nonEmptyCells = row.filter(
              (col) => String(col).trim() !== "",
            ).length;
            if (nonEmptyCells === 0) return false; // 🚫 Skip completely empty rows

            const matchCount = row.reduce((count, col) => {
              const trimmed = String(col).trim();
              return this.expectedHeaders.includes(trimmed) ? count + 1 : count;
            }, 0);

            return matchCount >= this.expectedHeaders.length / 2;
          });

          if (headerRowIndex !== -1) {
            const headerRow = rows[headerRowIndex];
            console.log(
              "✅ Found header row at index",
              headerRowIndex,
              headerRow,
            );
            const HEADER_ROW_INDEX = headerRowIndex;
            const dataRows = rows.slice(headerRowIndex + 1);
            const size = dataRows.length;
            const DISPLAY_LIMIT = 1000;
            const DISPLAY_START = Math.max(
              0,
              Math.floor(size / 2 - DISPLAY_LIMIT / 2),
            );

            const headers = rows[HEADER_ROW_INDEX].map((h) => h.trim());

            const headerSet = new Set(headers.filter(Boolean));

            const expectedFromMap = Object.keys(this.headerMap);

            const requiredForPreview = [
              "สินทรัพย์",
              "SNo.",
              ["คำอธิบายของสินทรัพย์", "คำอธิบาย"], // OR
              ["เลขที่ผลิตภัณฑ์", "Serial no.", "Serial No."], // OR
              "Pers.No.",
              "ศ.ต้นทุน",
              "มูลค่าการได้มา",
              "มูลค่าตามบัญชี",
              "Cap.date",
            ];

            const missingFromMap = expectedFromMap.filter(
              (h) => !headerSet.has(h),
            );
            const missingForPreview = requiredForPreview
              // .map((req) => {
              //   // single required header
              //   if (typeof req === "string") {
              //     return headerSet.has(req) ? null : req;
              //   }

              //   // OR-group: at least one must exist
              //   const ok = req.some((h) => headerSet.has(h));
              //   return ok ? null : `(${req.join(" OR ")})`;
              // })
              .map((group) => {
                const keys = Array.isArray(group) ? group : [group];

                const ok = keys.some((h) => headerSet.has(h));

                const okHeader = keys.find((h) => headerSet.has(h));
                console.log(
                  "✅ For preview, found header for group",
                  group,
                  "->",
                  okHeader,
                );

                return ok ? null : `(${keys.join(" OR ")})`;
              })
              .filter(Boolean);

            if (missingFromMap.length) {
              console.warn(
                "⚠️ Missing headers (from headerMap):",
                missingFromMap,
              );
            }
            if (missingForPreview.length) {
              console.warn(
                "⚠️ Missing headers (used in preview mapping):",
                missingForPreview,
              );
            }
            // (optional) show which headers exist (useful for debugging)
            // console.log("📌 Headers found:", headers);

            const allValidRecords = dataRows
              .filter((row) => {
                const assetIndex = headers.findIndex((h) => h === "สินทรัพย์");
                if (assetIndex === -1) return false;
                const isEmptyRow = row.every(
                  (cell) => String(cell).trim() === "",
                );
                const hasAssetValue =
                  row[assetIndex] && String(row[assetIndex]).trim() !== "";
                return !isEmptyRow && hasAssetValue;
              })
              .map((row) => {
                const record = {};
                headers.forEach((header, index) => {
                  record[header] = row[index] ?? "";
                });
                return record;
              });

            const previewRows = allValidRecords.slice(
              DISPLAY_START,
              DISPLAY_START + DISPLAY_LIMIT,
            );

            const formatCapDate = (rawDate) => {
              const parts = String(rawDate).trim().split(".");
              if (parts.length === 3) {
                const [day, month, year] = parts;
                const thaiYear = parseInt(year) + 543;
                return `${thaiYear}.${parseInt(month)}.${parseInt(day)}`;
              }
              return "";
            };

            this.tableItems = previewRows.map((item) => ({
              // devPeaNo: `${item["สินทรัพย์"] ?? ""}-${item["SNo."] ?? ""}`,
              // dev_description:
              //   item["คำอธิบายของสินทรัพย์"] ?? item["คำอธิบาย"] ?? "",
              // dev_serial_no:
              //   item["เลขที่ผลิตภัณฑ์"] ?? item["Serial no."] ?? "",
              // emp_id: item["Pers.No."] ?? "",
              // cc_long_code: item["ศ.ต้นทุน"] ?? "",
              // dev_received_price: item["มูลค่าการได้มา"] ?? "",
              // dev_left_price: item["มูลค่าตามบัญชี"] ?? "",
              // dev_received_date: formatCapDate(item["Cap.date"]),
              devPeaNo: `${getFirstValue(item, ["สินทรัพย์"])}-${getFirstValue(
                item,
                ["SNo."],
              )}`,
              dev_description: getFirstValue(item, [
                "คำอธิบายของสินทรัพย์",
                "คำอธิบาย",
              ]),
              dev_serial_no: getFirstValue(item, [
                "เลขที่ผลิตภัณฑ์",
                "Serial no.",
                "Serial No.",
              ]),
              emp_id: getFirstValue(item, ["Pers.No."]),
              cc_long_code: getFirstValue(item, ["ศ.ต้นทุน"]),
              dev_received_price: getFirstValue(item, ["มูลค่าการได้มา"]),
              dev_left_price: getFirstValue(item, ["มูลค่าตามบัญชี"]),
              dev_received_date: formatCapDate(
                getFirstValue(item, ["Cap.date"]),
              ),
            }));

            const mappedRecords = allValidRecords.map((row) => {
              const mapped = {};
              // mapped["devPeaNo"] = `${row["สินทรัพย์"] ?? ""}-${
              //   row["SNo."] ?? ""
              // }`.trim();
              // mapped.dev_serial_no =
              //   row["เลขที่ผลิตภัณฑ์"] ??
              //   row["Serial no."] ??
              //   row["Serial No."] ??
              //   "";
              // mapped.dev_left_price = row["มูลค่าตามบัญชี"] ?? "";
              // for (const [thaiKey, backendKey] of Object.entries(
              //   this.headerMap,
              // )) {
              //   const value = row[thaiKey] ?? "";

              //   if (backendKey === "devReceivedDate") {
              //     mapped[backendKey] = formatCapDate(value);
              //   } else if (
              //     backendKey !== "devPeaNo" &&
              //     backendKey !== "dev_serial_no"
              //   ) {
              //     mapped[backendKey] = value;
              //   }
              // }

              mapped.devPeaNo = `${getFirstValue(row, [
                "สินทรัพย์",
              ])}-${getFirstValue(row, ["SNo."])}`.trim();
              mapped.devDescription = getFirstValue(row, [
                "คำอธิบายของสินทรัพย์",
                "คำอธิบาย",
              ]);
              mapped.dev_serial_no = getFirstValue(row, [
                "เลขที่ผลิตภัณฑ์",
                "Serial no.",
                "Serial No.",
              ]);
              mapped.empId = getFirstValue(row, ["Pers.No."]);
              mapped.ccLongCode = getFirstValue(row, ["ศ.ต้นทุน"]);
              mapped.devReceivedPrice = getFirstValue(row, ["มูลค่าการได้มา"]);
              mapped.devLeftPrice = getFirstValue(row, ["มูลค่าตามบัญชี"]);
              mapped.devReceivedDate = formatCapDate(
                getFirstValue(row, ["Cap.date"]),
              );

              return mapped;
            });

            this.missingFromMap = missingFromMap; // if you computed this
            this.missingForPreview = missingForPreview; // ✅ this one for UI

            this.uploadItems = mappedRecords;
            this.isReadFileValid = allValidRecords.length > 0;
            this.readLoading = false;
          } else {
            console.warn("❌ Header row not found.");
            this.alert = true;
          }
        } catch (error) {
          console.error("❌ Failed to read Excel file", error);
          this.alert = true;
          this.readLoading = false;
        }
      };

      reader.onerror = (err) => {
        console.error("Failed to read file", err);
        this.alert = true;
        this.readLoading = false;
      };

      reader.readAsArrayBuffer(this.selectedFile);
    },

    async uploadData() {
      // if nothing to upload, ensure flags are consistent and return
      if (!this.uploadItems || this.uploadItems.length === 0) {
        console.warn("No upload items to send");
        this.uploadFinish = true;
        this.uploadSuccess = false;
        this.processLoading = false; // <- ensure cleared
        return;
      }

      this.uploadAbortController = new AbortController();
      this.processLoading = true;
      this.uploadFinish = false;

      try {
        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/temp_upload`,
          this.uploadItems,
          {
            // timeout: 120000,
            timeout: 30 * 60 * 1000,
            signal: this.uploadAbortController.signal,
          },
        );
        const { success, message } = resp.data;

        this.uploadFinish = true;
        this.uploadFinishtime = dateService.formatDateToThai(new Date());
        this.uploadSuccess = !!success;

        if (!success) {
          console.error("❌ error message uploadData:", message);
        } else {
          console.log("📦 success result:", success);
          // optional: clear the items to prevent accidental repeat uploads
          this.uploadItems = [];
        }
      } catch (error) {
        // detect cancellation
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
          console.warn("Upload cancelled by user");
        } else {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Unknown error occurred";
          console.error("❌ Upload failed:", error);
          console.error("❌ error message uploadData:", message);
          this.uploadSuccess = false;
        }
        this.uploadFinish = true;
      } finally {
        this.processLoading = false;
        this.uploadAbortController = null;
      }
    },

    async processDB() {
      try {
        this.processLoading = true;
        // Step 1
        const result1 = await this.queryStep1();
        console.log("Step 1 done:", result1);

        // Step 2
        const result2 = await this.queryStep2();
        console.log("Step 2 done:", result2);

        // Step 3
        const result3 = await this.queryStep3();
        this.noMatchTableItems = result3.data.items;
        console.log("Step 3 done:", this.noMatchTableItems);

        // Step 4
        const result4 = await this.queryStep4();
        this.insertedCount = result4.data.inserted_count;
        this.insertedCount2 = result4.data.inserted_count2;
        this.softDeletedCount = result4.data.soft_deleted_count;

        console.log("Step 4 done:", result4);
        console.log("insertedCount:", this.insertedCount);
        console.log("insertedCount2:", this.insertedCount2);
        console.log("softDeletedCount:", this.softDeletedCount);
        // All steps done

        this.processLoading = false;
      } catch (error) {
        console.error("Error during query steps:", error);
        this.processLoading = false;
      }
    },

    async queryStep1() {
      try {
        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/temp_concat`,
        );

        // const { success, message } = resp.data;
        const { success } = resp.data;

        if (success) {
          this.uploadSuccess = true;
        } else {
          this.uploadSuccess = false;
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep1";

        console.error("❌ set concat failed:", error);
        console.error("❌ error message Step1:", message);
        this.processLoading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },

    async queryStep2() {
      // Use result from Step 1
      try {
        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/update_temp_device_type`,
        );

        // const { success, message } = resp.data;
        const { success } = resp.data;

        if (success) {
          this.uploadSuccess = true;
        } else {
          this.uploadSuccess = false;
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep2";

        console.error("❌ set concat failed:", error);
        console.error("❌ error message Step2:", message);
        this.processLoading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },

    async queryStep3() {
      try {
        const resp = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/api/dev/check_no_match`,
        );

        // const { success, message } = resp.data;
        const { success } = resp.data;

        if (success) {
          this.uploadSuccess = true;
        } else {
          this.uploadSuccess = false;
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep3";

        console.error("❌ checking no match entries failed:", error);
        console.error("❌ error message Step3:", message);
        this.processLoading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },

    async queryStep4() {
      try {
        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/insert_update_master`,
        );

        // const { success, message } = resp.data;
        const { success } = resp.data;

        if (success) {
          this.uploadSuccess = true;
        } else {
          this.uploadSuccess = false;
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep4";

        console.error("❌ insert or update to master failed:", error);
        console.error("❌ error message Step4:", message);
        this.processLoading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },
  },

  computed: {
    // derived single "loading" used by UI
    loading() {
      return !!(this.readLoading || this.processLoading);
    },
    isExcelFileValid() {
      if (!this.selectedFile) return false;

      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const fileExtension = this.selectedFile.name
        .split(".")
        .pop()
        .toLowerCase();

      return (
        allowedTypes.includes(this.selectedFile.type) ||
        fileExtension === "xls" ||
        fileExtension === "xlsx"
      );
    },
  },
};

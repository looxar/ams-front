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
        // "เลขที่ผลิตภัณฑ์",
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
      loading: false,
      isReadFileValid: false,
      uploadItems: [],
      // headerMap: [
      //   { สินทรัพย์: "devPeaNo" },
      //   { คำอธิบายของสินทรัพย์: "devDescription" },
      //   { เลขที่ผลิตภัณฑ์: "devSerialNo" },
      //   { "Cap.date": "devReceivedDate" },
      //   { มูลค่าการได้มา: "devReceivedPrice" },
      //   { ค่าเสื่อมสะสม: "devLeftPrice" },
      //   { "ศ.ต้นทุน": "ccLongCode" },
      //   { "Pers.No.": "empId" },
      // ],
      headerMap: {
        สินทรัพย์: "devPeaNo",
        คำอธิบายของสินทรัพย์: "devDescription",
        // เลขที่ผลิตภัณฑ์: "devSerialNo",
        "Serial no.": "devSerialNo",
        "Cap.date": "devReceivedDate",
        มูลค่าการได้มา: "devReceivedPrice",
        มูลค่าตามบัญชี: "devLeftPrice",
        "ศ.ต้นทุน": "ccLongCodeString",
        "Pers.No.": "empIdString",
      },
      uploadFinish: false,
      uploadFinishtime: Date.now(),
      uploadSuccess: false,
      noMatchTableItems: [],
      noMatchTableHeaders: [
        { text: "Description", value: "devDescription" },
        { text: "Received Date", value: "devReceivedDate" },
        { text: "Received Price", value: "devReceivedPrice" },
        { text: "Concat Price Date", value: "devConcatPriceDate" },
      ],
      insertedCount: undefined,
      insertedCount2: undefined,
      softDeletedCount: undefined,
    };
  },

  watch: {},

  mounted() {},

  created() {},

  methods: {
    triggerFileSelect() {
      console.log("triggerFileSelect called");
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
        console.log("✅ Valid Excel file selected:", this.fileName);
        // Optional: auto upload or validate here
      }
    },
    processReadFile() {
      this.loading = true;
      this.uploadFinish = false;
      console.log("loading state:", this.loading);
      setTimeout(() => {
        console.log("loading done");
        this.loading = false;
      }, 2000);

      console.log("XLSX", XLSX);
      if (!this.selectedFile) {
        this.alert = true;
        setTimeout(() => {
          this.alert = false;
        }, 3000);
        return;
      }

      this.alert = false;

      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        console.log("check2 data", data);
        try {
          console.log("check5", XLSX.utils);
          const workbook = XLSX.read(data, { type: "array" });
          console.log("check3", workbook);

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          console.log("check4", worksheet);

          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          console.log("✅ rows", rows);

          const headerRowIndex = rows.findIndex((row) => {
            if (!Array.isArray(row)) return false;

            const nonEmptyCells = row.filter(
              (col) => String(col).trim() !== ""
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
              headerRow
            );
            const HEADER_ROW_INDEX = headerRowIndex;
            const dataRows = rows.slice(headerRowIndex + 1);
            const size = dataRows.length;
            const DISPLAY_LIMIT = 1000;
            const DISPLAY_START = Math.max(
              0,
              Math.floor(size / 2 - DISPLAY_LIMIT / 2)
            );

            const headers = rows[HEADER_ROW_INDEX].map((h) => h.trim());

            const allValidRecords = dataRows
              .filter((row) => {
                const assetIndex = headers.findIndex((h) => h === "สินทรัพย์");
                if (assetIndex === -1) return false;
                const isEmptyRow = row.every(
                  (cell) => String(cell).trim() === ""
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
              DISPLAY_START + DISPLAY_LIMIT
            );

            const formatCapDate = (rawDate) => {
              const parts = String(rawDate).trim().split(".");
              if (parts.length === 3) {
                const [day, month, year] = parts;
                const thaiYear = parseInt(year) + 543;
                return `${thaiYear}.${parseInt(month)}.${parseInt(day)}`;
              }
              return ""; // or keep rawDate if you prefer
            };

            this.tableItems = previewRows.map((item) => ({
              devPeaNo: `${item["สินทรัพย์"] ?? ""}-${item["SNo."] ?? ""}`,
              dev_description: item["คำอธิบายของสินทรัพย์"] ?? "",
              // dev_serial_no: item["เลขที่ผลิตภัณฑ์"] ?? "",
              dev_serial_no: item["Serial no."] ?? "",
              emp_id: item["Pers.No."] ?? "",
              cc_long_code: item["ศ.ต้นทุน"] ?? "",
              dev_received_price: item["มูลค่าการได้มา"] ?? "",
              dev_left_price: item["มูลค่าตามบัญชี"] ?? "",
              dev_received_date: formatCapDate(item["Cap.date"]),
            }));

            // const headerMap = {
            //   สินทรัพย์: "devPeaNo",
            //   คำอธิบายของสินทรัพย์: "devDescription",
            //   เลขที่ผลิตภัณฑ์: "devSerialNo",
            //   "Cap.date": "devReceivedDate",
            //   มูลค่าการได้มา: "devReceivedPrice",
            //   ค่าเสื่อมสะสม: "devLeftPrice",
            //   "ศ.ต้นทุน": "ccLongCode",
            //   "Pers.No.": "empId",
            //   ศูนย์กำไร: "ccLongCodeString",
            // };

            const mappedRecords = allValidRecords.map((row) => {
              const mapped = {};
              mapped["devPeaNo"] = `${row["สินทรัพย์"] ?? ""}-${
                row["SNo."] ?? ""
              }`.trim();

              for (const [thaiKey, backendKey] of Object.entries(
                this.headerMap
              )) {
                // mapped[backendKey] = row[thaiKey] ?? "";
                const value = row[thaiKey] ?? "";

                if (backendKey === "devReceivedDate") {
                  mapped[backendKey] = formatCapDate(value);
                } else if (backendKey !== "devPeaNo") {
                  // Prevent overwriting custom mapping above
                  mapped[backendKey] = value;
                }
              }
              return mapped;
            });

            this.uploadItems = mappedRecords;

            console.log(
              "uploadItems ",
              this.uploadItems[Math.floor(mappedRecords.length / 2)]
            );
            this.isReadFileValid = allValidRecords.length > 0;
            this.loading = false;
          } else {
            console.warn("❌ Header row not found.");
            this.alert = true;
          }
        } catch (error) {
          console.error("❌ Failed to read Excel file", error);
          this.alert = true;
        }
      };

      reader.onerror = (err) => {
        console.error("Failed to read file", err);
        this.alert = true;
      };

      reader.readAsArrayBuffer(this.selectedFile);
    },

    uploadData() {
      this.loading = true;
      this.uploadFinish = false;
      console.log("uploadItems.length ", this.uploadItems.length);
      axios
        .post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/temp_upload`,
          this.uploadItems
        )
        .then((resp) => {
          console.log("📦 Response:", resp.data);
          this.loading = false;
          const { success, message } = resp.data;
          this.uploadFinish = true;
          this.uploadFinishtime = dateService.formatDateToThai(new Date());
          if (success) {
            this.uploadSuccess = true;
            console.log("📦 success result:", success);
          } else {
            this.uploadSuccess = false;
            console.log("📦 success result:", success);
            console.error("❌ error message uploadData:", message);
          }
        })

        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Unknown error occurred";

          console.error("❌ Upload failed:", error);
          console.error("❌ error message uploadData:", message);
          this.loading = false;
        });
    },

    async processDB() {
      try {
        this.loading = true;
        // Step 1
        const result1 = await this.queryStep1();
        console.log("Step 1 done:", result1);

        // Step 2
        const result2 = await this.queryStep2();
        console.log("Step 2 done:", result2);

        // Step 3
        const result3 = await this.queryStep3();
        // console.log("Step 3 done:", result3);
        this.noMatchTableItems = result3.data.items;
        console.log("Step 3 done:", this.noMatchTableItems);

        // Step 4
        const result4 = await this.queryStep4();
        // this.noMatchTableItems = result3.data.items;
        // console.log("Step 4 done:", result4);
        this.insertedCount = result4.data.insertedCount;
        this.insertedCount2 = result4.data.insertedCount2;
        this.softDeletedCount = result4.data.softDeletedCount;
        console.log("Step 4 done:", result4);
        console.log("insertedCount:", this.insertedCount);
        console.log("insertedCount2:", this.insertedCount2);
        console.log("softDeletedCount:", this.softDeletedCount);
        // All steps done

        this.loading = false;
      } catch (error) {
        console.error("Error during query steps:", error);
      }
    },

    async queryStep1() {
      try {
        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/temp_concat`
        );

        const { success, message } = resp.data;

        if (success) {
          this.uploadSuccess = true;
          console.log("📦 success queryStep1:", success);
        } else {
          this.uploadSuccess = false;
          console.log("📦 failed queryStep1:", message);
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep1";

        console.error("❌ set concat failed:", error);
        console.error("❌ error message Step1:", message);
        this.loading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },

    async queryStep2() {
      // Use result from Step 1
      try {
        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/update_temp_device_type`
        );

        const { success, message } = resp.data;

        if (success) {
          this.uploadSuccess = true;
          console.log("📦 success queryStep2:", success);
        } else {
          this.uploadSuccess = false;
          console.log("📦 failed queryStep2:", message);
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep2";

        console.error("❌ set concat failed:", error);
        console.error("❌ error message Step2:", message);
        this.loading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },

    async queryStep3() {
      try {
        const resp = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/api/dev/check_no_match`
        );

        const { success, message } = resp.data;

        if (success) {
          this.uploadSuccess = true;
          console.log("📦 success queryStep3:", success);
        } else {
          this.uploadSuccess = false;
          console.log("📦 failed queryStep3:", message);
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep3";

        console.error("❌ checking no match entries failed:", error);
        console.error("❌ error message Step3:", message);
        this.loading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },

    async queryStep4() {
      console.log("inprogress queryStep4");
      try {
        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/api/dev/insert_update_master`
        );

        const { success, message } = resp.data;

        if (success) {
          this.uploadSuccess = true;
          console.log("📦 success queryStep4:", success);
        } else {
          this.uploadSuccess = false;
          console.log("📦 failed queryStep4:", message);
        }

        return resp.data; // ✅ this ensures result1 gets a value
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred queryStep4";

        console.error("❌ insert or update to master failed:", error);
        console.error("❌ error message Step4:", message);
        this.loading = false;
        throw error; // ❗ rethrow to allow processDB to handle it if needed
      }
    },
  },

  computed: {
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

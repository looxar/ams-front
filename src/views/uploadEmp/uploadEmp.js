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
      alert: false,
      selectedFile: null,
      fileName: "",

      tableItemsEmp: [],
      readLoading: false,
      processLoading: false,
      isReadFileValid: false,

      uploadItems: [],
      uploadFinish: false,
      uploadFinishtime: Date.now(),
      uploadSuccess: false,

      tableHeadersEmp: [
        { text: "รหัสพนักงาน", value: "emp_id" }, //columnB
        { text: "ชื่อ-นามสกุล", value: "emp_name" }, //columnC
        { text: "ตำแหน่ง", value: "emp_rank" }, //columnD
        { text: "สังกัด", value: "cc_short_name" }, //columnF
        { text: "รหัสต้นสังกัด", value: "cc_full_code" }, //columnG
      ],

      inserted: 0,
      updated: 0,
    };
  },

  mounted() {},

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
      this.readLoading = true;
      this.uploadFinish = false;

      console.log("XLSX", XLSX);
      if (!this.selectedFile) {
        this.alert = true;
        setTimeout(() => {
          this.alert = false;
        }, 3000);
        this.readLoading = false;
        return;
      }

      this.alert = false;

      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        try {
          console.log("check5", XLSX.utils);
          const workbook = XLSX.read(data, { type: "array" });
          console.log("check3", workbook);

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          console.log("check4", worksheet);

          // 🧾 Read as 2D array (no header row)
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // => [ [row1], [row2], ... ]
            defval: "", // default value for empty cells
          });
          console.log("✅ rows", rows);

          // === CONFIG: mapping column index (0-based) ===
          const START_DATA_ROW = 0; // change if you need to skip some top rows
          const COL_EMP_ID = 1; // column B
          const COL_EMP_NAME = 2; // column C
          const COL_EMP_RANK = 3; // column D
          const COL_CC_SHORT_NAME = 5; // column F
          const COL_CC_FULL_CODE = 6; // column G

          // 1) ตัดแถวที่เป็นข้อมูลจริง (ตัดแถวว่างออก)
          const dataRows = rows.slice(START_DATA_ROW).filter((row) => {
            if (!Array.isArray(row)) return false;
            // ตัดทิ้งแถวที่ว่างทั้งหมด
            const hasNonEmpty = row.some((cell) => String(cell).trim() !== "");
            return hasNonEmpty;
          });

          console.log("✅ dataRows", dataRows);

          // 2) map เป็น object ตาม key ที่ใช้ใน tableHeadersCC
          const allRecords = dataRows.map((row) => {
            const safe = (val) => String(val ?? "").trim();

            return {
              emp_id: safe(row[COL_EMP_ID]),
              emp_name: safe(row[COL_EMP_NAME]),
              emp_rank: safe(row[COL_EMP_RANK]),
              cc_short_name: safe(row[COL_CC_SHORT_NAME]),
              cc_full_code: safe(row[COL_CC_FULL_CODE]),
            };
          });

          // 3) preview limit (ถ้าข้อมูลเยอะ)
          const size = allRecords.length;
          const DISPLAY_LIMIT = 1000;
          const DISPLAY_START = Math.max(
            0,
            Math.floor(size / 2 - DISPLAY_LIMIT / 2)
          );

          const previewRows = allRecords.slice(
            DISPLAY_START,
            DISPLAY_START + DISPLAY_LIMIT
          );

          // 👉 ใช้กับ v-data-table: headers.value ต้องตรงกับ key ใน object
          this.tableItemsEmp = previewRows; // [{emp_id, emp_name, ...}, ...]

          // ถ้าจะส่ง backend ใช้ allRecords
          this.uploadItems = allRecords;

          this.isReadFileValid = allRecords.length > 0;
          this.readLoading = false;

          // 👉 ใช้กับ v-data-table: headers.value ต้องตรงกับ key ใน object
          this.tableItemsEmp = previewRows; // [{emp_id, emp_name, ...}, ...]

          // ถ้าจะส่ง backend ใช้ allRecords
          this.uploadItems = allRecords;

          this.isReadFileValid = allRecords.length > 0;
          this.readLoading = false;
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
      if (!this.selectedFile) {
        console.warn("No file selected");
        this.uploadFinish = true;
        this.uploadSuccess = false;
        this.processLoading = false;
        return;
      }

      this.uploadAbortController = new AbortController();
      this.processLoading = true;
      this.uploadFinish = false;

      console.log("📄 Previewing 5 rows from Excel...");
      const preview = await this.previewExcelRows(this.selectedFile);
      console.table(preview);
      try {
        const formData = new FormData();
        formData.append("file", this.selectedFile);

        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/emp/upload_emp`,
          formData,
          {
            timeout: 30 * 60 * 1000,
            signal: this.uploadAbortController.signal,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("📦 Response:", resp.data);

        const { inserted, updated } = resp.data;

        this.inserted = inserted ?? 0;
        this.updated = updated ?? 0;

        this.uploadFinish = true;
        this.uploadFinishtime = dateService.formatDateToThai(new Date());
        this.uploadSuccess = true;

        console.log("✅ Inserted:", inserted, "Updated:", updated);
      } catch (error) {
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

    async fetchCCDB() {
      this.readLoading = true;
      try {
        const resp = await axios.get(`${process.env.VUE_APP_BASE_URL}/cc/all`);

        console.log("📦 Fetch CC DB Response:", resp.data);

        this.tableItemsEmp = resp.data.map((item) => ({
          cc_long_code: item.cc_long_code,
          bus_a: item.cc_bus_a,
          profit_code: item.cc_profit_code,
          cc_short_name: item.cc_short_name,
          cc_full_name: item.cc_full_name,
        }));

        this.readLoading = false;
      } catch (error) {
        this.readLoading = false;
        console.error("❌ Fetch CC DB failed:", error);
      } finally {
        this.readLoading = false;
      }
    },
    async previewExcelRows(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // raw rows

          resolve(json.slice(0, 5)); // return first 5 rows
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    },
  },

  computed: {
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

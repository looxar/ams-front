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

      tableItemsCC: [],
      readLoading: false,
      processLoading: false,
      isReadFileValid: false,

      uploadItems: [],
      uploadFinish: false,
      uploadFinishtime: Date.now(),
      uploadSuccess: false,

      expectedHeaders: [
        "CCA",
        "Level1",
        "Level2",
        "Level3",
        "Level4",
        "Level5",
        "Level6",
        "Node Description",
        "BA",
        "PCA",
        "ชื่อ",
        "Extra Long Text",
      ],
      tableHeadersCC: [
        { text: "CCA", value: "cc_long_code" },
        { text: "BA", value: "bus_a" },
        { text: "PCA", value: "profit_code" },
        { text: "short_name", value: "cc_short_name" }, //"ชื่อ"
        { text: "full_name", value: "cc_full_name" }, //"Extra Long Text"
      ],

      inserted: 0,
      updated: 0,
    };
  },

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
                const ccIndex = headers.findIndex((h) => h === "CCA");
                if (ccIndex === -1) return false;
                const isEmptyRow = row.every(
                  (cell) => String(cell).trim() === ""
                );
                const hasAssetValue =
                  row[ccIndex] && String(row[ccIndex]).trim() !== "";
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

            this.tableItemsCC = previewRows.map((item) => ({
              cc_long_code: item["CCA"] ?? "",
              bus_a: item["BA"] ?? "",
              profit_code: item["PCA"] ?? "",
              cc_short_name: item["ชื่อ"] ?? "",
              cc_full_name: item["Extra Long Text"] ?? "",
            }));

            this.uploadItems = allValidRecords;
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
      //   if (!this.uploadItems || this.uploadItems.length === 0) {
      //     console.warn("No upload items to send");
      //     this.uploadFinish = true;
      //     this.uploadSuccess = false;
      //     this.processLoading = false; // <- ensure cleared
      //     return;
      //   }

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
      //   console.log("uploadItems[0]", this.uploadItems[0]);
      try {
        const formData = new FormData();
        formData.append("file", this.selectedFile);

        const resp = await axios.post(
          `${process.env.VUE_APP_BASE_URL}/cc/upload_cc`,
          formData,
          {
            timeout: 30 * 60 * 1000,
            signal: this.uploadAbortController.signal,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("📦 Response:", resp.data);
        // const { success, message } = resp.data;

        // Your backend currently returns UploadResult (inserted, updated)
        // so adjust how you read it:
        const { inserted, updated } = resp.data;

        this.uploadFinish = true;
        this.uploadFinishtime = dateService.formatDateToThai(new Date());
        this.uploadSuccess = true;

        console.log("✅ Inserted:", inserted, "Updated:", updated);

        // if (!success) {
        //   console.error("❌ error message uploadData:", message);
        // } else {
        //   console.log("📦 success result:", success);
        //   // optional: clear the items to prevent accidental repeat uploads
        //   this.uploadItems = [];
        // }
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
  },
  mounted() {},
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

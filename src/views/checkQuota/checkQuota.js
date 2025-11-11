import axios from "axios";

export default {
  name: "EventsList",
  data() {
    return {
      valid: null,
      // model: null,
      modelEmp: null,
      modelCC: null,
      //items: [],
      itemsCC: [],
      itemsEmp: [],
      getDeviceResult: [],
      getEmployeeResult: [],
      loadingEmp: false,
      loadingCC: false,
      deviceheaders: [
        {
          text: "เลขทรัพย์สิน",
          align: "start",
          value: "devPeaNo",
          // width: "15%",
          class: "primary--text",
        },
        {
          text: "คำอธิบายของสินทรัพย์",
          value: "devDescription",
          class: "primary--text",
          // width: "6%"
        },
        {
          text: "ชื่อผู้ครอบครอง",
          value: "empName",
          class: "primary--text",
          // width: "25%"
        },
        {
          text: "วันที่ได้รับ",
          value: "devReceivedDate",
          class: "primary--text",
          // width: "25%"
        },
      ],
      employeeheaders: [
        {
          text: "รหัสพนักงาน",
          align: "start",
          value: "empId",
          class: "primary--text",
          // width: "10%",
        },
        {
          text: "ชื่อ-นามสกุล",
          value: "empName",
          class: "primary--text",
          // width: "6%"
        },
        {
          text: "ตำแหน่ง",
          value: "empRank",
          class: "primary--text",
          // width: "25%"
        },
      ],
      checkQuotaResult: "",
      totalDeviceResult: 0,
      totalEmployeeResult: 0,
      showVRow: false,
      totalEmployee: "",
      totalDevice: "",
      alert: false,
      itemName: "",
      assetComType: [
        { id: "1", name: "1.Computer or labtop or Tablet", value: "1" },
        {
          id: "2",
          name: "2.Monitor",
          value: "2",
        },
        { id: "3", name: "3.Printer", value: "3" },
        {
          id: "4",
          name: "4.UPS",
          value: "4",
        },
        {
          id: "5",
          name: "5.อุปกรณ์สื่อสาร",
          value: "5",
        },
        {
          id: "6",
          name: "6.อุปกรณ์ประกอบหรืออุปกรณ์อื่นๆ",
          value: "6",
        },
      ],
      selectedAssetComType: {
        id: "1",
        name: "1.Computer or labtop or Tablet",
        value: "1",
      },
      setAssetComType: 1,
      jsonObj: [],
      jsonAssetComType: '{"assetComType":["1"]}',
      checked7: false,
      dialog: false,
      passwordField: "",
      wrongPassword: false,
      quotaCom: 0,
      countElectrician: 0,
      countAssistElectrician: 0,
      loading: false,
      ccLong: "",
      ccShortName: "",
      ccShortCode: "",
    };
  },

  created() {
    this.loadItemsEmp();
    this.loadItemsCC();
  },

  watch: {
    dialog: function (val) {
      if (val) {
        this.passwordField = "";
        console.log("clear password");
      }
    },
    // loadingEmp: 'updateOverallLoading',
    // loadingCC: 'updateOverallLoading',
  },

  mounted() {
    // axios.get("http://localhost:8080/cc/getAllCCOnlyUse").then((response) => {
    //   this.itemsCC = response.data.costCenter;
    // });

    // axios.get("http://localhost:8080/emp/getEmpAll").then((response) => {
    //   this.itemsEmp = response.data;
    // });

    // this.loadEmpData();
    // this.loadCCData();
    this.loadAllData();
  },

  methods: {
    async loadEmpData() {
      this.loadingEmp = true;
      try {
        // const response = await axios.get("http://localhost:8080/emp/getEmpAll");
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
      // console.log("itemsEmp ", this.itemsEmp);
    },
    async loadCCData() {
      this.loadingCC = true;
      try {
        // const response = await axios.get("http://localhost:8080/cc/getAllCCOnlyUse");
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/cc/getAllCCOnlyUse`
        );
        // this.itemsCC = response.data.costCenter;
        console.log("itemsCC ", this.itemsCC);
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
      await Promise.all([this.loadEmpData(), this.loadCCData()]);
      this.loading = false;
    },

    async checkQuota() {
      this.loading = true;
      if (this.modelCC == null) {
        this.alert = true;
        window.setInterval(() => {
          this.alert = false;
          // console.log("hide alert after 3 seconds");
        }, 3000);
      } else {
        // console.log("param device_type_id - ", this.setAssetComType);
        let params = [];

        params = {
          region: this.modelCC["ccLongCode"],
          device_type_id: this.setAssetComType,
        };
        console.log(
          "param device_type_id - ",
          params.device_type_id,
          " region ",
          params.region
        );
        if (this.checked7 == false) {
          await axios
            // .get("http://localhost:8080/api/dev/getDevice53unpageByccId", {
            .get(
              `${process.env.VUE_APP_BASE_URL}/api/dev/getDevice53unpageByccId`,
              {
                params,
              }
            )
            .then((resp2) => {
              // this.getDeviceResult = resp2.data.dataDevice;
              
              this.getDeviceResult = resp2.data.dataDevice.map((item) => ({
                devPeaNo: item[0],
                devDescription: item[1],
                empName: item[2],
                devReceivedDate: item[3],
              }));

              console.log("getDeviceResult ", this.getDeviceResult);

              this.totalDeviceResult = resp2.data.totalItems;
            })
            .catch((error) => {
              console.log(error.resp);
            });
        } else {
          await axios
            .get(
              // "http://localhost:8080/api/dev/getDevice53unpageByccIdOnly7Year",
              `${process.env.VUE_APP_BASE_URL}/api/dev/getDevice53unpageByccIdOnly7Year`,
              {
                params,
              }
            )
            .then((resp2) => {
              // this.getAllResult = resp.data;
              // console.log(
              //   "getAllByPattern2unpage",
              //   JSON.stringify(this.getAllResult)
              // );

              this.getDeviceResult = resp2.data.dataDevice;
              this.totalDeviceResult = resp2.data.totalItems;
            })
            .catch((error) => {
              console.log(error.resp);
            });
        }
        // let params = [];
        this.ccLong = this.modelCC["ccLongCode"];
        //let ccFullName = this.modelCC["ccFullName"];
        this.ccShortName = this.modelCC["ccShortName"];
        this.ccShortCode = this.modelCC["ccLongCode"].slice(0,7);
        console.log("ccShortCode- " + this.ccShortCode);
        params = {
          region: this.ccLong,
        };
        await axios
          // .get("http://localhost:8080/emp/getEmpByccLongCode", { params })
          .get(`${process.env.VUE_APP_BASE_URL}/emp/getEmpByccLongCode`, {
            params,
          })
          .then((resp3) => {
            // console.log("getEmployeeResult ", resp3.data.dataEmployee);

            this.getEmployeeResult = resp3.data.dataEmployee.map((item) => ({
              empId: item[0],
              empName: item[1],
              empDepFull: item[2],
              empRank: item[3],
              ccLongCode: item[4],
            }));

            console.log("getEmployeeResult ", this.getEmployeeResult);

            this.totalEmployeeResult = resp3.data.totalItems;
            return;
          })
          .catch((error) => {
            console.log(error.resp);
          });

        //เช็คเงื่อนไขแผนก quota 2:3
        if (
          !this.ccLong?.startsWith("E3010") &&
          (this.ccShortName?.includes("ผปบ") ||
            this.ccShortName?.includes("ผกส") ||
            this.ccShortName?.includes("ผกป") ||
            !this.ccShortCode?.slice(-1) == "1")
        ) {
          console.log(
            "Check พชง. 3:2 " +
              this.ccShortName?.includes('ผปบ') +
              " " +
              this.ccShortName?.includes('ผกส') +
              " " +
              this.ccShortName?.includes('ผกป') +
              " " +
              this.ccShortCode +
              !this.ccShortCode?.endsWith('1')
          );
          this.countElectrician = 0;
          let electrician = "";
          this.countAssistElectrician = 0;
          // let assistElectrician = '';
          this.quotaCom = 0;
          // console.log("totalEmployeeResult " + JSON.stringify(this.getEmployeeResult[0].empRole));
          for (let i = 0; i < this.totalEmployeeResult; i++) {
            electrician = JSON.stringify(this.getEmployeeResult[i].empRole);
            if (
              electrician?.includes("พชง")
              // || electrician.includes("ชชง")
            ) {
              this.countElectrician++;
              // this.quotaCom++;
              // if(this.countElectrician % 3 == 0){
              //   this.quotaCom--;
              // }
            } else if (electrician?.includes("ชชง")) {
              this.countAssistElectrician++;
            }
          }
          console.log("countElectrician " + this.countElectrician);
          let a = this.countElectrician;
          for (let i = 1; i <= this.countElectrician; i++) {
            console.log("Compare: " + i / a);
            if (i / a < 0.67) {
              this.quotaCom++;
            }
            console.log("Com พชง:" + this.quotaCom);
            // if(this.countElectrician % 3 == 0){
            //   this.quotaCom--;
            // }
          }
          //นับ ชชง.

          this.quotaCom +=
            this.totalEmployeeResult -
            this.countElectrician -
            this.countAssistElectrician;
          console.log("quotaCom final " + this.quotaCom);

          //แผนก quota 2:3
          // if (this.totalEmployeeResult > this.totalDeviceResult) {
          //   this.checkQuotaResult =
          //     "คอมพิวเตอร์น้อยกว่าจำนวนคน " +
          //     this.totalEmployeeResult +
          //     " คน - " +
          //     this.totalDeviceResult +
          //     " เครื่อง  จากโควตาโดยประมาณ " + this.quotaCom + " เครื่อง";
          // } else if (
          //   this.totalEmployeeResult == this.totalDeviceResult ||
          //   this.totalEmployeeResult < this.totalDeviceResult
          // ) {
          this.checkQuotaResult =
            "คอมพิวเตอร์เพียงพอกับจำนวนคน " +
            this.totalEmployeeResult +
            " คน - " +
            this.totalDeviceResult +
            " เครื่อง";
          // }
        } else {
          //แผนก quota 1:1
          if (this.totalEmployeeResult > this.totalDeviceResult) {
            this.checkQuotaResult =
              "คอมพิวเตอร์น้อยกว่าจำนวนคน " +
              this.totalEmployeeResult +
              " คน - " +
              this.totalDeviceResult +
              " เครื่อง";
          } else if (
            this.totalEmployeeResult == this.totalDeviceResult ||
            this.totalEmployeeResult < this.totalDeviceResult
          ) {
            this.checkQuotaResult =
              "คอมพิวเตอร์เพียงพอกับจำนวนคน " +
              this.totalEmployeeResult +
              " คน - " +
              this.totalDeviceResult +
              " เครื่อง";
          }
        }
        this.showVRow = true;
        this.loading = false;
      }
    },

    checked7year(newValue) {
      if (this.passwordField == "itsco") {
        if (this.checked7) {
          this.checked7 = false;
        } else if (!this.checked7) {
          this.checked7 = true;
        }
        this.dialog = false;
      } else {
        this.wrongPassword = true;
      }

      console.log(newValue);
    },

    openDialog() {
      this.dialog = true;
      this.wrongPassword = false;
      console.log("openDialog");
    },

    genQuotaReport() {
      if (this.modelCC == null) {
        this.alert = true;
        window.setInterval(() => {
          this.alert = false;
          // console.log("hide alert after 3 seconds");
        }, 3000);
      } else {
        this.itemName = this.modelCC["ccFullName"];
        this.$refs.html2Pdf.generatePdf();
        // console.log("hide alert after 4 seconds");
      }
    },

    toggleAssetComType(assetComType) {
      this.jsonObj = JSON.parse(this.jsonAssetComType);
      this.jsonObj["assetComType"] = [];
      this.jsonObj["assetComType"] = assetComType;
      this.setAssetComType = assetComType;
      console.log("assetComType-" + this.setAssetComType);
    },

    // itemRowBackground: function (item) {
    //   return item.includes("พชง") || item.includes("ชชง")  ? 'style-1' : 'style-2'
    //   //return 'style-1';
    // },
  },

  computed: {
    // loading() {
    //   return this.loadingEmp || this.loadingCC;
    // },
  },
};

import Vue from "vue";
import axios from "axios";
// import DataService from "../../services/dataServices.js"; // NEW
import JsonExcel from "vue-json-excel";
Vue.component("downloadExcel", JsonExcel);

import QrcodeVue from "qrcode.vue";
Vue.component("qrcode-vue", QrcodeVue);

import { mdiQrcodeScan } from "@mdi/js";
Vue.component("mdiQrcode-Scan", mdiQrcodeScan);

import { mdiMicrosoftExcel } from "@mdi/js";
Vue.component("mdiMicrosoftExcel", mdiMicrosoftExcel);

import { mdiFileFindOutline } from "@mdi/js";
Vue.component("mdiFileFindOutline", mdiFileFindOutline);

import { mdiMagnify } from "@mdi/js";
Vue.component("mdiMagnify", mdiMagnify);

import { mdiQrcode } from "@mdi/js";
Vue.component("mdiQrcode", mdiQrcode);

// import the component
import Treeselect from "@riophae/vue-treeselect";
Vue.component("treeselect", Treeselect);
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import dateService from "../../services/dateService";

export default {
  name: "EventsList",
  data() {
    return {
      event: {},
      events: [],
      headers: [
        {
          text: "เลขทรัพย์สิน",
          align: "start",
          value: "devPeaNo",
          class: "primary--text font-size: 50%",
          // width: "10%",
        },
        {
          text: "คำอธิบายของสินทรัพย์",
          value: "devDescription",
          class: "primary--text",
          // width: "6%"
        },
        {
          text: "หมายเลขผลิตภัณฑ์",
          value: "devSerialNo",
          class: "primary--text",
          //  width: "3%"
        },
        {
          text: "วันที่โอนเข้าเป็นทุน",
          // value: "devReceivedDate",
          value: "devReceivedDate",
          class: "primary--text",
          // width: "7%"
        },
        {
          text: "มูลค่าการได้มา",
          value: "devReceivedPrice",
          class: "primary--text",
          //  width: "3%"
        },
        {
          text: "มูลค่าตามบัญชี",
          value: "devLeftPrice",
          class: "primary--text",
          // width: "3%"
        },
        {
          text: "ชื่อผู้ครอบครอง",
          // value: "tbEmployee.empName",
          value: "empName",
          class: "primary--text",
          // width: "20%",
        },
        {
          text: "รหัสพนักงาน",
          // value: "tbEmployee.empId",
          value: "empId",
          class: "primary--text",
          // width: "3%"
        },
        {
          text: "สังกัด",
          // value: "tbCostCenter.ccShortName",
          value: "ccShortName",
          class: "primary--text",
          // width: "5%",
        },
        {
          text: "ศูนย์ต้นทุน",
          // value: "tbCostCenter.ccLongCode",
          value: "ccLongCode",
          class: "primary--text",
          // width: "5%",
        },
        {
          text: "Action",
          value: "actions",
          sortable: false,
          class: "primary--text",
          align: "center",
          // width: "3%"
        },
      ],
      excelHeaders: {
        เลขทรัพย์สิน: "devPeaNo",
        คำอธิบายของสินทรัพย์: "devDescription",
        หมายเลขผลิตภัณฑ์: "devSerialNo",
        วันที่โอนเข้าเป็นทุน: "devReceivedDate",
        มูลค่าการได้มา: "devReceivedPrice",
        มูลค่าตามบัญชี: "devLeftPrice",
        ชื่อผู้ครอบครอง: {
          field: "empName",
          callback: (value) => {
            return `${value}`;
          },
        },
        รหัสพนักงาน: {
          field: "empId",
          callback: (value) => {
            return `${value}`;
          },
        },
        ศูนย์ต้นทุน: {
          field: "ccLongCode",
          callback: (value) => {
            return `${value}`;
          },
        },
        สังกัด: {
          field: "ccShortName",
          callback: (value) => {
            return `${value}`;
          },
        },
        // "Telephone 2": {
        //   field: "phone.landline",
        //   callback: (value) => {
        //     return `Landline Phone - ${value}`;
        //   },
        // },
      },
      select: [],

      typeSearch: [
        { id: "1", name: "เลขทรัพย์สิน", value: "pea_no" },
        { id: "2", name: "คำอธิบายของสินทรัพย์", value: "description" },
        { id: "3", name: "หมายเลขผลิตภัณฑ์", value: "serial" },
        { id: "4", name: "วันที่โอนเข้าเป็นทุน", value: "recieve_date" },
        { id: "5", name: "มูลค่าการได้มา", value: "price_recieve" },
        { id: "6", name: "มูลค่าตามบัญชี", value: "price_left" },
        { id: "7", name: "รหัสพนักงานผู้ครอบครอง", value: "user_id" },
        { id: "8", name: "ศูนย์ต้นทุน", value: "cost_center" },
      ],
      selectedFruits: [],
      selectedTypeSearch: [],
      appendBranch: [],
      appendType: [],
      appendText: [],
      jsonObj: [],
      jsonStrBranch: '{"branch":["*"]}',
      jsonStrType: '{"type":["*"]}',
      jsonTextSearch: '{"text":["*"]}',
      appendSearch: [],
      textSearch: "",
      // searchResult: [
      //   {
      //     pea_no: "531009537-0",
      //     description: "ระบบสายสัญญาณ (FIBER OPTIC)",
      //     serial: "",
      //     user_id: "430962",
      //     user_name: "นาง มนัสนันท์ พรรักษมณีรัฐ",
      //     cc_short_name: "ผบห.กฟฉ.2-บห.",
      //     received_date: "2551.6.18",
      //     price_recieve: "108130.85",
      //     price_left: "1",
      //     cost_center: "E301000010",
      //   },
      //   {
      //     pea_no: "531011277-0",
      //     description: "ระบบเครือข่าย Switch HUB 1 ตัว",
      //     serial: "",
      //     user_id: "505338",
      //     user_name: "นาย นนทธรรม นนทเตรียมกิจ",
      //     cc_short_name: "กบห.กบล.-บห.",
      //     received_date: "2553.7.30",
      //     price_recieve: "32700",
      //     price_left: "1",
      //     cost_center: "E301011000",
      //   },
      // ],
      getAllResult: [],
      data1: [],
      itemsPerPage: 0,
      totalItems: 0,
      footerProps: {
        "items-per-page-options": [30, 50, 100, -1],
        page: 0,
        showFirstLastPage: true,
      },
      alert: false,
      alert2: false,
      myloadingvariable: false,

      assetType: [
        { id: "1", name: "1.ทรัพย์สินคอมพิวเตอร์", value: "53" },
        {
          id: "2",
          name: "2.ทรัพย์สินคอมพิวเตอร์ มูลค่าคงเหลือ 1 บาท",
          value: "153",
        },
        { id: "3", name: "3.ทรัพย์สินทุกประเภท", value: "all" },
        {
          id: "4",
          name: "4.ทรัพย์สินทุกประเภท มูลค่าคงเหลือ 1 บาท",
          value: "1all",
        },
      ],
      selectedAssetType: {
        id: "1",
        name: "1.ทรัพย์สินคอมพิวเตอร์",
        value: "53",
      },
      setAssetType: [],
      jsonStrAssetType: '{"assetType":["53"]}',
      dataExcel: [],

      qrcode_value:
        // JSON.parse([
        JSON.stringify({
          pea_no: "531009537-0",
          description: "ระบบสายสัญญาณ (FIBER OPTIC)",
          serial: "",
          user_id: "430962",
          user_name: "นาง มนัสนันท์ พรรักษมณีรัฐ",
          cc_short_name: "ผบห.กฟฉ.2-บห.",
          received_date: "2551.6.18",
          price_recieve: "108130.85",
          price_left: "1",
          cost_center: "E301000010",
        }),
      // ]),
      qrcode_size: 128,
      dialog: false,
      dialogFixForm: false,

      editedIndex: -1,
      editedItem: {
        ccLongCodeString: "",
        devConcatPriceDate: "",
        devDescription: "",
        devLeftPrice: 0,
        devNote: "",
        devPeaNo: "",
        devReceivedDate: null, // Use a proper date format if needed
        devReceivedPrice: 0,
        devSerialNo: "",
        devUpdate: "",
        deviceId: null,
        equipment: "",
        model: "",
        contract: "",
        problem: "",
        isDeleted: false,
        tbCostCenter: {
          costCenter: "",
          costCenterCode: "",
        },
        tbDeviceType: {
          deviceTypeId: "",
          deviceTypeName: "",
        },
        tbEmployee: {
          empDepFull: "",
          empId: "",
          empName: "",
          empRank: "",
          empRole: "",
        },
        date: new Date().toISOString().split("T")[0],
      },

      formData: {
        ccShortName: "-",
        date: "-",
        type_other: "-",
        brand: "-",
        devDescription: "-",
        contract: "-",
        serial: "-",
        pea_no: "-",
        problem: "-",
        emp_name: "-",
        emp_role: "-",
        emp_id: "-",
        tel: "-",
        inspector_name: "",
        inspector_role: "",
        inspector_date: "-",
        dep_head_name: "",
        dep_head_role: "",
        dep_head_date: "-",
        inspect_dep_name:"",
      },

      groupSelected: [],
      qrcode_value2: [],
      result: [],
      selected: [],

      optionBranches: [
        {
          id: "E300",
          label: "สังกัด ผชก.(ฉ2)",
          value: "E300",
          icon: "mdi-account",
        },
        {
          id: "E3",
          label: "ทุกหน่วยงานในสังกัด กฟฉ.2",
          value: "E3",
          icon: "mdi-home-circle",
        },
        {
          id: "reg",
          label: "สำนักงาน กฟฉ.2",
          value: "E3010",
          icon: "mdi-home-circle",
          children: [
            {
              id: "reg1",
              // label: "กอก.",
              label: "กสข.",
              value: "E30100",
              icon: "mdi-home-assistant",
              // isNew: true,
            },
            {
              id: "reg2",
              label: "ฝวบ.",
              value: "E30101",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg3",
              label: "กบล.",
              value: "E301011",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg4",
              label: "กวว.",
              value: "E301012",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg5",
              // label: "กกค.",
              label: "กรย.",
              value: "E301013",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg6",
              // label: "ฝบพ.",
              label: "ฝสบ.",
              value: "E30102",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg7",
              // label: "กบญ.",
              label: "กบฟ.",
              value: "E301021",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg8",
              // label: "กซข.",
              // value: "E301022",
              label: "กบพ.",
              value: "E301024",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg9",
              // label: "กรท.",
              label: "กดส.",
              value: "E301023",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg10",
              label: "ฝปบ.",
              value: "E30103",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg11",
              label: "กปบ.",
              value: "E301031",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg12",
              label: "กบษ.",
              value: "E301032",
              icon: "mdi-home-assistant",
            },
            {
              id: "reg13",
              label: "กสฟ.",
              // value: "E301033",E301034
              value: "E301034",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "ubn",
          label: "กฟส.อบ. (L)",
          value: "E3011",
          icon: "mdi-home-circle",
          children: [
            {
              id: "ub1",
              label: "กฟจ.อบ.",
              value: "E301101",
              icon: "mdi-home-assistant",
            },
            {
              id: "ub2",
              label: "กฟส.มสส.",
              value: "E3015",
              icon: "mdi-home-assistant",
            },
            {
              id: "ub3",
              label: "กฟส.ขน.",
              value: "E3016",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "ssk",
          label: "กฟส.ศก. (L)",
          value: "E302",
          icon: "mdi-home-circle",
          children: [
            {
              id: "ssk1",
              label: "กฟจ.ศก.",
              value: "E3021",
              icon: "mdi-home-assistant",
            },
            {
              id: "ssk2",
              label: "กฟส.อพ.",
              value: "E3022",
              icon: "mdi-home-assistant",
            },
            {
              id: "ssk3",
              label: "กฟอ.ขข.",
              value: "E3023",
              icon: "mdi-home-assistant",
            },
            {
              id: "ssk4",
              label: "กฟส.รศ.",
              value: "E3024",
              icon: "mdi-home-assistant",
            },
            // {
            //   id: "ssk5",
            //   label: "กฟส.กร.",
            //   value: "E3025",
            //   icon: "mdi-home-assistant",
            // },
          ],
        },
        {
          id: "yst",
          label: "กฟส.ยส. (M)",
          value: "E303",
          icon: "mdi-home-circle",
          children: [
            {
              id: "yst1",
              label: "กฟจ.ยส.",
              value: "E3031",
              icon: "mdi-home-assistant",
            },
            {
              id: "yst2",
              label: "กฟส.พนพ.",
              value: "E3032",
              icon: "mdi-home-assistant",
            },
            {
              id: "yst3",
              label: "กฟส.มช.",
              value: "E3033",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "mhk",
          label: "กฟส.มค. (L)",
          value: "E304",
          icon: "mdi-home-circle",
          children: [
            {
              id: "mhk1",
              label: "กฟจ.มค.",
              value: "E3041",
              icon: "mdi-home-assistant",
            },
            {
              id: "mhk2",
              label: "กฟส.พภ.",
              value: "E3042",
              icon: "mdi-home-assistant",
            },
            {
              id: "mhk3",
              label: "กฟส.วป.",
              value: "E3043",
              icon: "mdi-home-assistant",
            },
            {
              id: "mhk4",
              label: "กฟจ.กพส.",
              value: "E3044",
              icon: "mdi-home-assistant",
            },
            {
              id: "mhk5",
              label: "กฟส.บบ.",
              value: "E3045",
              icon: "mdi-home-assistant",
            },
            {
              id: "mhk6",
              label: "กฟส.ชย.",
              value: "E3046",
              icon: "mdi-home-assistant",
            },
            // {
            //   id: "mhk7",
            //   label: "กฟส.กวช.",
            //   value: "E3047",
            //   icon: "mdi-home-assistant",
            // },
          ],
        },
        {
          id: "kls",
          label: "กฟส.กส. (L)",
          value: "E305",
          icon: "mdi-home-circle",
          children: [
            {
              id: "kls1",
              label: "กฟจ.กส.",
              value: "E3051",
              icon: "mdi-home-assistant",
            },
            {
              id: "kls2",
              label: "กฟส.นกศ.",
              value: "E3052",
              icon: "mdi-home-assistant",
            },
            {
              id: "kls3",
              label: "กฟส.ยต.",
              value: "E3053",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "roe",
          label: "กฟส.รอ. (L)",
          value: "E306",
          icon: "mdi-home-circle",
          children: [
            {
              id: "roe1",
              label: "กฟจ.รอ.",
              value: "E3061",
              icon: "mdi-home-assistant",
            },
            {
              id: "roe2",
              label: "กฟส.สณ.",
              value: "E3062",
              icon: "mdi-home-assistant",
            },
            {
              id: "roe3",
              label: "กฟส.กษ.",
              value: "E3063",
              icon: "mdi-home-assistant",
            },
            {
              id: "roe4",
              label: "กฟส.อส.",
              value: "E3064",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "mdh",
          label: "กฟส.มดห. (M)",
          value: "E307",
          icon: "mdi-home-circle",
          children: [
            {
              id: "mdh1",
              label: "กฟจ.มห.",
              value: "E3071",
              icon: "mdi-home-assistant",
            },
            {
              id: "mdh2",
              label: "กฟส.คช.",
              value: "E3072",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "anc",
          label: "กฟส.อจ. (M)",
          value: "E308",
          icon: "mdi-home-circle",
          children: [
            {
              id: "anc1",
              label: "กฟจ.อจ.",
              value: "E3081",
              icon: "mdi-home-assistant",
            },
            {
              id: "anc2",
              label: "กฟส.ลท..",
              value: "E3083",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "slp",
          label: "กฟส.สล. (M)",
          value: "E309",
          icon: "mdi-home-circle",
          children: [
            {
              id: "slp1",
              label: "กฟอ.สล.",
              value: "E3091",
              icon: "mdi-home-assistant",
            },
            {
              id: "slp2",
              label: "กฟส.พทง.",
              value: "E3092",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "sdj",
          label: "กฟส.สดจ. (M)",
          value: "E310",
          icon: "mdi-home-circle",
          children: [
            {
              id: "sdj1",
              label: "กฟอ.สดจ.",
              value: "E3101",
              icon: "mdi-home-assistant",
            },
            {
              id: "sdj2",
              label: "กฟส.กฉ.",
              value: "E3102",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "ktl",
          label: "กฟส.กทล. (L)",
          value: "E311",
          icon: "mdi-home-circle",
          children: [
            {
              id: "ktl1",
              label: "กฟอ.กล.",
              value: "E3111",
              icon: "mdi-home-assistant",
            },
            {
              id: "ktl2",
              label: "กฟส.ขห.",
              value: "E3112",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "dud",
          label: "กฟส.ดอ. (L)",
          value: "E312",
          icon: "mdi-home-circle",
          children: [
            {
              id: "dud1",
              label: "กฟอ.ดอ.",
              value: "E3121",
              icon: "mdi-home-assistant",
            },
            {
              id: "dud2",
              label: "กฟส.นย.",
              value: "E3122",
              icon: "mdi-home-assistant",
            },
            {
              id: "dud3",
              label: "กฟส.บฑ.",
              value: "E3123",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "wch",
          label: "กฟส.วรช. (M)",
          value: "E313",
          icon: "mdi-home-circle",
          children: [
            {
              id: "wch1",
              label: "กฟอ.วรช.",
              value: "E3131",
              icon: "mdi-home-assistant",
            },
            {
              id: "wch2",
              label: "กฟส.พมห.",
              value: "E3132",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "tpp",
          label: "กฟส.ตผ. (M)",
          value: "E314",
          icon: "mdi-home-circle",
          children: [
            {
              id: "tpp1",
              label: "กฟอ.ตผ.",
              value: "E3141",
              icon: "mdi-home-assistant",
            },
            {
              id: "tpp2",
              label: "กฟส.ขร.",
              value: "E3142",
              icon: "mdi-home-assistant",
            },
          ],
        },
        {
          id: "ktm",
          label: "กฟส.กร. (M)",
          value: "E315",
          icon: "mdi-home-circle",
        },
        {
          id: "kan",
          label: "กฟส.กวช. (M) ",
          value: "E316",
          icon: "mdi-home-circle",
        },
      ],

      value: ["reg"],
      fieldValid: false,

      selectedInspector: null,
      inspectorList: [],
      // selectedDepHead: {
      //   id: "",
      //   label: "",
      //   role: "",
      //   icon: "mdi-account",
      //   depId: "",
      // },
      selectedDepHead: null,
      depHeadList: [],
      depHeadItem: null,
      depHead: null,
      showErrorProblem: false,
      showErrorInspector: false,
      showErrorDepHead: false,
    };
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogFixForm(val) {
      val || this.closeFixForm();
    },
  },

  mounted() {
    this.myloadingvariable = true;

    this.appendBranch = JSON.stringify({ branch: "E3010" });
    console.log("appendBranch-mount, " + this.appendBranch);

    let params = {
      region: "E301000000",
      setAssetType: 53,
    };

    axios
      // .get("http://localhost:8080/api/dev/searchNoWordUnpage", { params })
      .get(`${process.env.VUE_APP_BASE_URL}/api/dev/searchNoWordUnpage`, {
        params,
      })
      .then((resp) => {
        this.getAllResult = resp;
        console.log("data mounted ", this.getAllResult);
        // this.data1 = resp.data.dataExcel;
        this.data1 = Array.isArray(resp.data.dataExcel)
          ? resp.data.dataExcel
          : [];
        this.data1 = this.data1.map((item) => ({
          id: item[0],
          devDescription: item[1],
          devPeaNo: item[2],
          devSerialNo: item[3],
          empId: item[4],
          devReceivedDate: item[5], // Convert Thai date format
          devReceivedPrice: item[6],
          devLeftPrice: item[7],
          ccLongCode: item[8],
          ccFullName: item[9],
          ccShortName: item[10],
          empName: item[11],
          empRank: item[12],
        }));
        // this.itemsPerPage = resp.data.itemsPerPage;
        this.totalItems = resp.data.totalItems;
        console.log("at mounted ", this.getAllResult.data.totalItems);
        console.log("at mounted data ", this.data1);
        this.myloadingvariable = false;
      })

      .catch((error) => {
        console.log(error.resp);
      });

    this.getInspectorList();
  },

  created() {},
  // NEW

  methods: {
    getItemPerPage(val) {
      this.itemsPerPage = val;
      console.log("setItemPerPage ", this.itemsPerPage);
      this.searchFunction();
    },

    treeselectChange: function (node) {
      // alert("changed ", value);
      console.log(node.value);
      this.jsonObj = JSON.parse(this.jsonStrBranch);
      this.jsonObj["branch"] = [];
      this.jsonObj["branch"] = node.value;
      this.appendBranch = JSON.stringify(this.jsonObj);
      console.log("b-" + this.appendBranch);
    },

    handleInspectorSelect(node) {
      console.log(node);
      this.formData.inspector_name = node.label;
      this.formData.inspector_role = node.role || "-";
      this.formData.inspect_dep_name = node.depName;
      // this.autoSetDepHeadSelect(node.depId);
    },

    handleDepHeadSelect(selectedNode) {
      // console.log(selectedNode);

      this.depHeadItem = this.depHeadList.find(
        (item) => item.depId === selectedNode.depId
      );
      console.log("depHeadItem ", this.depHeadItem);

      if (this.depHeadItem) {
        this.selectedDepHead = this.depHeadItem;
        console.log("selectedDepHead ", this.selectedDepHead);
        const role_full = this.depHeadItem.role + " " + this.depHeadItem.depName; 

        this.formData.dep_head_name = this.depHeadItem.label;
        this.formData.dep_head_role = role_full || "-";
      } else {
        this.selectedDepHead = null;
        this.formData.dep_head_name = "-";
        this.formData.dep_head_role = "-";
      }
    },

    autoSetDepHeadSelect(depId) {
      this.depHead = this.depHeadList.find((item) => item.depId === depId);
      console.log("depHead-auto ", this.depHead);
      if (this.depHead) {
        this.selectedDepHead = this.depHead; // ✅ match by object reference
        // this.formData.dep_head_name = this.selectedDepHead.label;
        this.formData.dep_head_role = this.selectedDepHead.role || "-";
      }
      // else {
      //   this.selectedDepHead = null;
      //   this.formData.dep_head_name = "-";
      //   this.formData.dep_head_role = "-";
      // }
    },

    toggleAssetType(assetType) {
      this.jsonObj = JSON.parse(this.jsonStrAssetType);
      this.jsonObj["assetType"] = [];
      this.jsonObj["assetType"] = assetType;
      this.setAssetType = JSON.stringify(this.jsonObj);
      console.log("assetType-" + JSON.stringify(this.jsonObj));
    },

    searchFunction() {
      this.qrcode_value2 = [];
      this.result = [];
      this.groupSelected = [];
      this.selected = [];
      if (this.appendBranch == "") {
        this.alert = true;
        window.setInterval(() => {
          this.alert = false;
          // console.log("hide alert after 3 seconds");
        }, 3000);
      } else {
        if (this.setAssetType.length == 0) {
          this.setAssetType = JSON.stringify({ assetType: 53 });
        }

        this.myloadingvariable = true;
        let selectedBranch = JSON.parse(this.appendBranch);

        let setAssetType2 = JSON.parse(this.setAssetType);
        // console.log("setAssetType ",this.setAssetType);
        let params = [];
        console.log("itemsPerPage", this.itemsPerPage);
        //ถ้าไม่ใส่คำค้น
        if (this.textSearch.length == 0) {
          params = {
            region: selectedBranch.branch,
            setAssetType: setAssetType2.assetType,
          };
          console.log("searchNoWordUnpage-", params);
          axios
            // .get("http://localhost:8080/api/dev/searchNoWordUnpage", {
            .get(`${process.env.VUE_APP_BASE_URL}/api/dev/searchNoWordUnpage`, {
              params,
            })
            .then((resp) => {
              this.getAllResult = resp.data;
              console.log(
                "searchNoWordUnpage-" + params["region"],
                // JSON.stringify(this.getAllResult)
                this.getAllResult
              );

              // this.data1 = resp.data.dataExcel;
              this.data1 = Array.isArray(resp.data.dataExcel)
                ? resp.data.dataExcel
                : [];
              this.data1 = this.data1.map((item) => ({
                id: item[0],
                devDescription: item[1],
                devPeaNo: item[2],
                devSerialNo: item[3],
                empId: item[4],
                devReceivedDate: item[5], // Convert Thai date format
                devReceivedPrice: item[6],
                devLeftPrice: item[7],
                ccLongCode: item[8],
                ccFullName: item[9],
                ccShortName: item[10],
                empName: item[11],
                empRank: item[12],
              }));
              // this.itemsPerPage = resp.data.itemsPerPage;
              this.totalItems = resp.data.totalItems;
              this.myloadingvariable = false;
            })
            .catch((error) => {
              console.log(error.resp);
            });
          // }
        }
        //ถ้าใส่คำค้น
        else {
          params = {
            // page: 0,
            // size: this.itemsPerPage,
            region: selectedBranch.branch,
            textSearch: this.textSearch,
            setAssetType: setAssetType2.assetType,
          };
          console.log("searchFunction ", params);

          axios
            // .get("http://localhost:8080/api/dev/searchWithWord", { params })
            .get(`${process.env.VUE_APP_BASE_URL}/api/dev/searchWithWord`, {
              params,
            })
            .then((resp) => {
              this.getAllResult = resp.data;
              console.log(
                "searchWithWord-AllResult ",
                // JSON.stringify(this.getAllResult)
                this.getAllResult
              );

              // this.data1 = resp.data.data1;
              this.data1 = Array.isArray(resp.data.data1)
                ? resp.data.data1
                : [];
              this.data1 = this.data1.map((item) => ({
                id: item[0],
                devDescription: item[1],
                devPeaNo: item[2],
                devSerialNo: item[3],
                empId: item[4],
                devReceivedDate: item[5], // Convert Thai date format
                devReceivedPrice: item[6],
                devLeftPrice: item[7],
                ccLongCode: item[8],
                ccFullName: item[9],
                ccShortName: item[10],
                empName: item[11],
                empRank: item[12],
              }));
              // console.log("searchWithWord-AllResult ", this.data1);
              // this.itemsPerPage = resp.data.itemsPerPage;
              this.totalItems = resp.data.totalItems;
              this.myloadingvariable = false;
            })
            .catch((error) => {
              console.log(error.resp);
            });
        }
      }
    },

    async fetchData2() {
      if (this.appendBranch == "") {
        this.alert = true;
        window.setInterval(() => {
          this.alert = false;
          // console.log("hide alert after 3 seconds");
        }, 3000);
      } else {
        this.dataExcel = this.data1;
        this.myloadingvariable = false;
        console.log("dataExcel : ", this.dataExcel);
        return this.dataExcel;
      }
    },

    startDownload() {
      alert("show loading");
    },
    finishDownload() {
      alert("hide loading");
    },

    editItem(item) {
      this.editedIndex = this.data1.indexOf(item);
      this.editedItem = Object.assign({}, item);
      console.log("editedItem-qr ", this.editedItem);
      (this.qrcode_value =
        // JSON.parse([
        JSON.stringify({
          pea_no: this.editedItem["devPeaNo"],
          description: this.editedItem["devDescription"],
          serial: this.editedItem["devSerialNo"],
          user_id: this.editedItem["empId"],
          user_name: this.editedItem["empName"],
          received_date: this.editedItem["devReceivedDate"],
          price_recieve: this.editedItem["devReceivedPrice"],
          price_left: this.editedItem["devLeftPrice"],
          cc_short_name: this.editedItem["ccShortName"],
          cost_center: this.editedItem["ccLongCode"],
          empRank: this.editedItem["empRank"],
        })),
        (this.dialog = true);
    },

    getInspectorList() {
      this.myloadingvariable = true;
      axios
        .get(`${process.env.VUE_APP_BASE_URL}/emp/getInspectorList`)
        .then((resp) => {
          this.getAllResult = resp.data;
          console.log("inspectorList ", this.getAllResult);

          this.inspectorList = Array.isArray(resp.data.data)
            ? resp.data.data
            : [];
          console.log("inspectorList ", this.inspectorList);

          this.inspectorList = this.inspectorList
            .filter((item) => item[2] !== "หผ.")
            .map((item) => ({
              id: item[0],
              label: item[1],
              role: item[2],
              depId: item[3],
              depName: item[4],
              icon: "mdi-account",
            }));

          this.depHeadList = Array.isArray(resp.data.data)
            ? resp.data.data
            : [];
          console.log("depHeadList ", this.depHeadList);

          this.depHeadList = this.depHeadList
            .filter((item) => item[2] == "หผ.")
            .map((item) => ({
              id: item[0],
              label: item[1],
              role: item[2],
              depId: item[3],
              depName: item[4],
              icon: "mdi-account",
            }));

          this.totalItems = resp.data.totalItems;
          this.myloadingvariable = false;
        })
        .catch((error) => {
          console.log(error.resp);
        });
    },

    showFixForm(item) {
      this.editedIndex = this.data1.indexOf(item);
      this.editedItem = Object.assign({}, item);
      // console.log("editedItem in dialogFixForm ", this.editedItem);
      this.editedItem.date = dateService.formatDateToThai(new Date())
      this.editedItem.type_other = "-";
      this.editedItem.brand = "-";
      this.editedItem.contract = "-";

      // this.formData = this.editedItem;

      this.formData = {
        ccShortName: item.ccShortName || "-",
        date: this.editedItem.date,
        type_other: "-",
        brand: "-",
        devDescription: item.devDescription || "-",
        contract: "-",
        devSerialNo: item.devSerialNo || "-",
        devPeaNo: item.devPeaNo || "-",
        empName: item.empName || "-",
        empRank: item.empRank || "-",
        empId: item.empId || "-",
        tel: item.tel || "-",
        inspector_name: "",
        inspector_role: "",
        inspector_date: "-",
        dep_head_name: "",
        dep_head_role: "",
        dep_head_date: "-",
        inspect_dep_name:"",
      };

      console.log("formData dialogFixForm ", this.formData);
      this.dialogFixForm = true;
    },

    sendFixPage() {
      let data = JSON.stringify({
        templateProjectPath: "sample/ams/506027-fixform.dito",
        templateName: "output",
        pdfVersion: "1.7",
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        // url: "http://localhost:8080/api/proxy-pdf-producer",
        url: `${process.env.VUE_APP_BASE_URL}/api/proxy-pdf-producer`,
        headers: {
          Accept: "application/pdf",
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log("PDF generated successfully.", response);
        })
        .catch((error) => {
          console.error("Error occurred while generating PDF:", error);
        });
    },

    sendpostmanecho() {
      const data = {
        name: "ChatGPT",
        message: "Hello from JavaScript!",
      };

      axios
        // .post("http://localhost:8080/api/postmanecho", data, {
        .post(`${process.env.VUE_APP_BASE_URL}/api/postmanecho`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("Response from Postman Echo:", response.data);
        })
        .catch((error) => {
          console.error("Error occurred:", error);
        });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeFixForm() {
      this.dialogFixForm = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.selectedInspector = null;
        this.selectedDepHead = null;
        this.showErrorProblem = false;
        this.showErrorInspector = null;
        this.showErrorDepHead = null;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        this.desserts.push(this.editedItem);
      }
      this.close();
    },
    enterSelect() {
      let e = this.selected.map((e) => e);
      // console.log(e.length); // logs all the selected items.
      this.qrcode_value2 = [];
      this.detail_value = [];
      this.groupSelected = e;
      console.log(this.groupSelected.length);

      let i = 0;
      this.result = this.groupSelected.map(({ devPeaNo }) => ({ devPeaNo }));
      this.result2 = this.groupSelected.map(({ devPeaNo }) => ({ devPeaNo }));
      // result.forEach((element) => {
      //   element.empId = this.groupSelected.tbEmployee.empId;
      // });
      for (i = 0; i < this.groupSelected.length; i++) {
        if (this.groupSelected[i].tbEmployee !== null) {
          this.result[i].empId = this.groupSelected[i].tbEmployee.empId;
          this.result[i].empName = this.groupSelected[i].tbEmployee.empName;
        } else {
          this.result[i].empId = "ไม่ระบุ";
          this.result[i].empName = "ไม่ระบุ";
        }
        // result[i].empId = this.groupSelected[i].tbEmployee.empId;
        // result[i].empId = this.groupSelected[i].tbEmployee.empId;
        this.result[i].devSerialNo = this.groupSelected[i].devSerialNo;
        // this.result2[i].devSerialNo =
        // this.groupSelected[i].devSerialNo;

        this.result[i].devReceivedDate = this.groupSelected[i].devReceivedDate;

        this.result[i].devReceivedPrice =
          this.groupSelected[i].devReceivedPrice;

        this.result[i].devLeftPrice = this.groupSelected[i].devLeftPrice;

        this.result[i].ccLongCode =
          this.groupSelected[i].tbCostCenter.ccLongCode;

        this.result[i].ccShortName =
          this.groupSelected[i].tbCostCenter.ccShortName;
        this.result2[i].ccShortName =
          this.groupSelected[i].tbCostCenter.ccShortName;

        this.result[i].devDescription = this.groupSelected[i].devDescription;
      }

      for (i = 0; i < this.result.length; i++) {
        console.log(JSON.stringify(this.result[i]));
        // this.qrcode_value2[i].push(JSON.stringify(this.groupSelected[i].devPeaNo)); ?region=ZC05020000
        this.detail_value.push(JSON.stringify(this.result[i]));
      }
      for (i = 0; i < this.result.length; i++) {
        console.log(JSON.stringify(this.result2[i]));
        // this.qrcode_value2[i].push(JSON.stringify(this.groupSelected[i].devPeaNo)); ?region=ZC05020000
        this.qrcode_value2.push(JSON.stringify(this.result2[i].devPeaNo));
      }
      if (this.selected.length == this.itemsPerPage) {
        alert("selected all");
      }
    },

    generateReport() {
      if (this.groupSelected.length == 0) {
        this.alert2 = true;
        window.setInterval(() => {
          this.alert2 = false;
          // console.log("hide alert after 3 seconds");
        }, 3000);
      } else {
        this.$refs.html2Pdf.generatePdf();
      }
    },

    genFixFormReport() {
      this.showErrorProblem = false,
      this.showErrorInspector = false,
      this.showErrorDepHead = false,
      console.log("genFixFormReport", this.formData);
      console.log("formData.inspector_name", this.formData.inspector_name);
      if (this.formData == null) {
        this.alert = true;
        window.setInterval(() => {
          this.alert = false;
        }, 3000);
      } else if (this.formData.problem == "" || this.formData.problem == undefined) {
        this.showErrorProblem = true;
      } else if (this.formData.inspector_name == "" || this.formData.inspector_name == undefined) {
        this.showErrorInspector = true;
      }else if (this.formData.dep_head_name == "" || this.formData.dep_head_name == undefined) {
        this.showErrorDepHead = true;
      }else {
        axios
          .post(
            // "http://localhost:8080/api/dev/redirectPdfProducer",
            `${process.env.VUE_APP_BASE_URL}/api/dev/redirectPdfProducer`,
            this.formData,
            {
              responseType: "blob",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/pdf",
              },
            }
          )
          .then((response) => {
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
            this.closeFixForm();
          })
          .catch((error) => {
            console.error("Error generating PDF:", error);
            this.alert = true;
            setTimeout(() => {
              this.alert = false;
            }, 3000);
          });
      }
    },

  },

  computed: {
    likesAllFruit() {
      return this.selectedFruits.length === this.fruits.length;
    },
    likesSomeFruit() {
      return this.selectedFruits.length > 0 && !this.likesAllFruit;
    },
    icon() {
      if (this.likesAllFruit) return "mdi-close-box";
      if (this.likesSomeFruit) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    likesAllTypeSearch() {
      return this.selectedTypeSearch.length === this.typeSearch.length;
    },
    likesSomeTypeSearch() {
      return this.selectedTypeSearch.length > 0 && !this.likesAllTypeSearch;
    },
    icon2() {
      if (this.likesAllTypeSearch) return "mdi-close-box";
      if (this.likesSomeTypeSearch) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "QR Code";
    },
    formDevPeaNo() {
      return this.editedIndex === -1 ? "New Item" : this.editedItem["devPeaNo"];
    },
    treeselectClass() {
      return {
        "treeselect-invalid": !this.fieldValid,
      };
    },
  },
};

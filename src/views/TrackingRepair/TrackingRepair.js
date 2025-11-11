import axios from "axios";
import moment from "moment";


// let url = "http://localhost:8080";
// let urlRepair = "http://localhost:8080/repair";

let url = `${process.env.VUE_APP_BASE_URL}`;
let urlRepair = `${process.env.VUE_APP_BASE_URL}/repair`;


moment.locale("th");



export default {
  name: "TrackingRepair",
  data: () => ({
    checkbox: true,
    items: [],
    value: null,
    DataTableHeaders: [
      { text: "เลขทรัพย์สิน", value: "device.devPeaNo" },
      { text: "การไฟฟ้า", value: "device.tbCostCenterTest.ccShortName" },
      { text: "คำอธิบายทรัพย์สิน", value: "device.devDescription" },
      { text: "หมายเลขผลิตภัณฑ์", value: "device.devSerialNo" },
      { text: "วันที่ส่งซ่อม", value: "sendDate" },
      { text: "ผู้ส่งซ่อม", value: "empSend.empName" },
      { text: "สถานะ", value: "repairStatus.statusName" },
      { text: "หมายเหตุ", value: "" },

    ],
    dataTableItems: [],

    dialogInfo: false,


    dialogInfoValue: [
      {
        empSendRole: null,
        peaNo: null,
        location: null,
        ccFull: null,
        stage: null,
        empOwnerName: null,
        empOwnerId: null,
        damage: null,
        adminName: null,
        admitDate: null,
        empSendName: null,
        empSendId: null,
        adminID: null,
        returnEmp: null,
        returnDate: null,
        treatment: null,
        treatComplete: null,
        discription :null,
        deviceType: null,
        empPhoneNumb : null,
      },
    ],
  }),
  mounted() {
    axios
      .get(url + "/cc/getAllCCOnlyUse",{headers: {'Access-Control-Allow-Origin': '*'}})
      .then((res) => {
        this.items = res.data.costCenter;
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get(urlRepair + "/getAllRepair",{headers: {'Access-Control-Allow-Origin': '*'}})
      .then((res) => {
        
        this.dataTableItems = res.data;
      })
      .catch((error) => {
        console.log(error);
      });
  },

  computed: {},

  methods: {
    
    formatDate(value) {
      return moment(value).format("DD MMMM YYYY HH:mm");
    },
    find(value) {
      let yy = value.ccLongCode;
      let xx = urlRepair + "/getByLocation";
      axios
        .get(xx, { headers: {'Access-Control-Allow-Origin': '*'}, params: { location: yy } })
        .then((res) => {
          this.dataTableItems = res.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    
    openDialogInfo(item) {
      // console.log(item)

      this.dialogInfoValue.peaNo = item.device.devPeaNo;
      this.dialogInfoValue.discription = item.device.devDescription;
      this.dialogInfoValue.deviceType = item.device.tbDeviceType.deviceTypeName0;
      this.dialogInfoValue.location = item.device.tbCostCenterTest.ccFullName;
      this.dialogInfoValue.ccFull = item.device.tbCostCenterTest.ccLongCode;
      this.dialogInfoValue.stage = item.repairStatus.statusName;
      this.dialogInfoValue.empOwnerId =
        item.device.tbEmployee == null ? null : item.device.tbEmployee.empId;
      this.dialogInfoValue.empOwnerName =
        item.device.tbEmployee == null ? null : item.device.tbEmployee.empName;
      this.dialogInfoValue.damage =
        item.cause == null ? null : item.cause.causeName;
      
      this.dialogInfoValue.damageDetail = item.damageDetail == null ? null : item.damageDetail;
      
      this.dialogInfoValue.admitDate =
        item.admitDate == null
          ? null
          : moment(String(item.admitDate), "YYYY-MM-DD HH:mm").format(
              "DD MMMM YYYY HH:mm"
            );
      this.dialogInfoValue.adminName =
        item.adminReceive == null ? null : item.adminReceive.adName;
      this.dialogInfoValue.adminID =
        item.adminReceive == null ? null : item.adminReceive.adEmp;
      this.dialogInfoValue.empSendName =
        item.empSend == null ? null : item.empSend.empName;
      this.dialogInfoValue.empSendId =
        item.empSend == null ? null : item.empSend.empId;
      this.dialogInfoValue.empPhoneNumb = item.empPhoneNumb;
      this.dialogInfoValue.returnEmp = 
        item.returnEmp == null ? null : item.returnEmp.empName;
      this.dialogInfoValue.sendDate =
        item.sendDate == null
          ? null
          : moment(String(item.sendDate), "YYYY-MM-DD HH:mm").format(
              "DD MMMM YYYY HH:mm"
            );
      this.dialogInfoValue.returnDate =
        item.returnDate == null
          ? null
          : moment(String(item.returnDate), "YYYY-MM-DD HH:mm").format(
              "DD MMMM YYYY HH:mm"
            );
      this.dialogInfoValue.treatment =
        item.treatment == null ? null : item.treatment;
      this.dialogInfoValue.treatComplete =
        item.treatComplete == null
          ? null
          : moment(String(item.treatComplete), "YYYY-MM-DD HH:mm").format(
              "DD MMMM YYYY HH:mm"
            );
    },
  },
};

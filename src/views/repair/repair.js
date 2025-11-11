import axios from "axios";
import { validationMixin } from "vuelidate";
import {
  required,
  maxLength,
  minLength,
  numeric,
} from "vuelidate/lib/validators";

// let url = "http://localhost:8080";
// let urlRepair = "http://localhost:8080/repair";
let url = `${process.env.VUE_APP_BASE_URL}`;

const fBody = {
  empSends: "null",
  empOwner: "null",
  device: "null",
  discription: "null",
  location: "null",
  deviceType: "null",
  damage: "null",
  empPhoneNumb: "null",
};

export default {
  name: "RepairComponent",
  mixins: [validationMixin],
  validations: {
    ccNameSeclected: { required },
    devPeaNoSelceted: { required },
    damage: { required, minLength: minLength(5), maxLength: maxLength(100) },
    empSend: {
      required,
      minLength: minLength(6),
      maxLength: maxLength(9),
      numeric,
    },
    empPhoneNumb: {
      required,
      minLength: minLength(5),
      maxLength: maxLength(10),
      numeric,
    },
  },
  data() {
    return {
      valid: false,
      dialogNote: false,
      dialogRechk: false,
      
      first5char: "",
      ccNameSeclected: "",
      devPeaNoSelceted: "",
      damage: "",
      empSend: "",
      empPhoneNumb: "",

      fBody: fBody,

      resPost: "",
      empName: [],
      itemCC: [],
      itemDevice: [],
      devDesc: [],
      empData: [],
      locationSelected: [],
    };
  },
  computed: {
    ccNameSeclectedErrors() {
      const errors = [];
      if (!this.$v.ccNameSeclected.$dirty) return errors;
      !this.$v.ccNameSeclected.required && errors.push("โปรดระบุการไฟฟ้า");
      return errors;
    },
    devPeaNoSelcetedErrors() {
      const errors = [];
      if (!this.$v.devPeaNoSelceted.$dirty) return errors;
      !this.$v.devPeaNoSelceted.required &&
        errors.push("โปรดระบุรหัสทรัพย์สิน");
      return errors;
    },
    damageErrors() {
      const errors = [];
      if (!this.$v.damage.$dirty) return errors;
      !this.$v.damage.required && errors.push("โปรดระบุอาการที่ชำรุจ");
      !this.$v.damage.minLength &&
        errors.push("พิมพ์อย่างน้อย 5 ตัวอักษร โปรดตรวจสอบ");
      !this.$v.damage.maxLength && errors.push("พิมพ์เกินที่กำหนด โปรดตรวจสอบ");
      return errors;
    },
    empSendErrors() {
      const errors = [];
      if (!this.$v.empSend.$dirty) return errors;
      !this.$v.empSend.required && errors.push("โปรดระบุรหัสพนักงาน");
      !this.$v.empSend.minLength &&
        errors.push("พิมพ์อย่างน้อย 6 ตัวอักษร โปรดตตรวจสอบ");
      !this.$v.empSend.maxLength &&
        errors.push("พิมพ์เกินที่กำหนด โปรดตรวจสอบ");
      !this.$v.empSend.numeric && errors.push("โปรดกรอกข้อมูลเป็นตัวเลข");
      return errors;
    },
    empPhoneNumbErrors() {
      const errors = [];
      if (!this.$v.empPhoneNumb.$dirty) return errors;
      !this.$v.empPhoneNumb.required && errors.push("โปรดระบุเบอร์ติดต่อกลับ");
      !this.$v.empPhoneNumb.minLength &&
        errors.push("พิมพ์อย่างน้อย 5 ตัวอักษร โปรดตรวจสอบ");
      !this.$v.empPhoneNumb.maxLength &&
        errors.push("พิมพ์เกินที่กำหนด โปรดตรวจสอบ");
      !this.$v.empPhoneNumb.numeric && errors.push("โปรดกรอกข้อมูลเป็นตัวเลข");
      return errors;
    },
  },
  mounted() {
    axios.get(url + "/cc/getAllCCOnlyUse").then((response) => {
      this.itemCC = response.data.costCenter;
    });
    
  },

  methods: {
    readFile() {
      window.open("./resume.pdf", "_blank"); //to open in new tab
    },
    async findDiscDevice(peaNo) {
      this.devPeaNoSelceted = peaNo;
      await axios
        .get(url + "/api/dev/getDeviceByPeaNo", {
          params: { PeaNo: peaNo },
        })
        .then((response) => {
          this.devDesc = response.data;
        });
    },
    async toggleBranch2(ccCode) {
      this.ccNameSeclected = ccCode;
      await axios
        .get(url + "/api/dev/getAll53", {

          params: { ccLong: this.ccNameSeclected },
        })
        .then((response) => {
          this.itemDevice = response.data;
        });
      if (ccCode.substring(0, 5) == "E3010") {
        this.first5char = 1;
      } else {
        this.first5char = 2;
      }
    },
    currentDate() {
      const current = new Date();
      const date = `${current.getDate()}/${current.getMonth() + 1
        }/${current.getFullYear()}`;
      return date;
    },
    async findEmp(empSend) {
      if (empSend == null) {
        this.empSendErrors();
        alert("โปรดระบุรหัสพนักงาน");
      } else {
        await axios
          .get(url + "/emp/getEmployeeId", {
            params: { id: empSend },
          })
          .then((response) => {
            this.empData = response.data;
            if(response.data == null){
              this.empData = "",
              alert("ไม่พบนักงานรหัสนี้")
        }
          })
          .catch((error) => {
            console.log(error);
          });
          
      }
      
    },

    continues() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        console.log("มีช่างว่าง");
      } else {


        (fBody.empSends = this.empData),
        (fBody.device = this.devDesc),
        (fBody.location = this.devDesc.tbCostCenterTest),
        (fBody.deviceType = this.devDesc.tbDeviceType),
        (fBody.empOwner = this.devDesc.tbEmployee),
        (fBody.damage = this.damage),
        (fBody.empPhoneNumb = this.empPhoneNumb);

        this.dialogRechk = true;
      }
    },
    async save() {
      await axios
            .post(url+"/repair/repair", null, {

              params: {
                empSend: this.empData.empId ,
                damage: this.damage,
                devicePeaNO: this.devPeaNoSelceted,
                empPhoneNumb : this.empPhoneNumb
              },
            })
            .then((response) => {
              this.resPost = response.status;

              alert("บันทึกสำเร็จ");
            })
            .catch((error) => {
              console.log("post Error >> ",error);
              alert("บันทึกไม่สำเร็จ โปรดตรวจสอบข้อมูล");
            });
      
      if (this.resPost == "201") {
        this.clear();
      }
    },
    clear() {
      this.$v.$reset();
      this.ccNameSeclected = "";
      this.devPeaNoSelceted = "";
      this.devDesc = "";
      this.damage = "";
      this.empSend = "";
      this.empPhoneNumb = "";
      this.empData = "";
    },
  },
};

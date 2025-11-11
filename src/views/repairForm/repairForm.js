const StaticHeader = {
    No : "",
    FromDepartment : "",
    to1: "ผปค.กรท.ฉ.2",
    to2 : "ศปค."
}
const StaticBoby = {
    subject: "ขอให้จัดซ่อมคอมพิวเตอร์ และอุปกรณ์ประกอบ",
    substance: "ขอแจ้งเครื่องชำรุจเพื่อส่งซ่อมตามรายการดังนี้",
    to1: "หผ.ปค.",
    to2: "พคค.",
    note1 : "ในกรณีที่ไม่อยู่ในสัญญาประกัน ขอให้กรท.ฉ.2 ดำเนินการซ่อมและตัดงบค่าใช้จ่ายตามบันทึกฉบับ ฉ.2 กรท(ก) 94/2564 ",
    note2 : "จึงเรียนมาเพื่อโปรดแจ้งผู้ที่เกี่ยวข้องดำเนินการต่อไปด้วย"
}
const fBody = {
    empName : "",
    damage : "",
    warranty : "",
    location : "",
    device : "",
}
const StaticFoot = {
    dot1 : ".....................................................................................................",
    dot2 : "(.....................................................)",
    dot3 : "........................................................",
    date1 : "................./................./.................",
    to1 : "อก.รท.ฉ.2",
    to2 : "ผจก.",
    note1 : "เพื่อโปรดพิจารณา อนุมัติ"
}

export default {
    name: "repairForm",
    data() {
        return {
            temp : 2,
            fBody : fBody,
            StaticHeader : StaticHeader ,
            StaticBoby: StaticBoby,
            StaticFoot : StaticFoot,
            
        }
    },
    methods: {
        currentDate() {
            const current = new Date();
            const date = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;
            return date;
        },
        download() {
            this.$refs.html2Pdf.generatePdf();
        },
        download2() {
            alert('555')
        }
    }


}
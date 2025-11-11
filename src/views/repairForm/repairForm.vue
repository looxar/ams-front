
import { image } from 'html2canvas/dist/types/css/types/image';

<template>
    <div>
        <div ref='content'>
            <v-sheet color="white" elevation="6" height="252mm" width="238mm" class="repairForm-container">
                <div class="firstForm">
                    <v-container>
                        <v-row>
                            <v-col md="12">
                                <v-img src="@/assets/logo.png" max-width="120"></v-img>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1">จาก</v-col>
                            <v-col md="5">{{ StaticHeader.FromDepartment }}</v-col>
                            <v-col md="1">ถึง</v-col>
                            <v-col md="5">
                                <div v-if="temp == 1">
                                    {{ StaticHeader.to1 }}
                                </div>
                                <div v-else-if="temp == 2">
                                    {{ StaticHeader.to2 }}</div>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1">เลขที่</v-col>
                            <v-col md="5">{{ StaticHeader.No }}</v-col>
                            <v-col md="1">วันที่</v-col>
                            <v-col md="5">{{ currentDate() }}</v-col>
                        </v-row>

                        <v-row no-gutters>
                            <v-col col="1" md="1">เรื่อง</v-col>
                            <v-col md="11">{{ StaticBoby.subject }}</v-col>
                        </v-row>
                        <v-row>
                            <hr>
                        </v-row>
                        <v-row no-gutters>
                            <v-col col="1" md="1">เรียน</v-col>
                            <v-col md="11">
                                <div v-if="temp == 1">
                                    {{ StaticBoby.to1 }}
                                </div>
                                <div v-else-if="temp == 2">
                                    {{ StaticBoby.to2 }}</div>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1"></v-col>
                            <v-col md="11">{{ StaticBoby.substance }}</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1">ประเภท</v-col>
                            <v-col md="1">{{ StaticBoby.device }}</v-col>
                            <v-col md="1">ยี่ห้อ</v-col>
                            <v-col md="2"></v-col>
                            <v-col md="1">รุ่น</v-col>
                            <v-col md="2"></v-col>
                            <v-col md="2">สัญญาเลขที่</v-col>
                            <v-col md="2"></v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="2">การรับประกัน</v-col>
                            <v-col md="3">{{ fBody.warranty }}</v-col>
                            <v-col md="2">อาการเสีย</v-col>
                            <v-col md="3">{{ fBody.damage }}</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="2">สถานที่ติดตั้ง</v-col>
                            <v-col md="10"> {{ fBody.location }}</v-col>
                        </v-row>
                        <br>
                        <v-row no-gutters>
                            <v-col md="1"></v-col>
                            <v-col md="10">
                                <table>
                                    <td>
                                        {{ StaticBoby.note1 }}
                                    </td>
                                </table>
                            </v-col>
                            <v-col md="1"></v-col>

                        </v-row>
                        <v-row>
                            <v-col md="1"></v-col>
                            <v-col md="10">
                                {{ StaticBoby.note2 }}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col md="7"></v-col>
                            <v-col md="5">&nbsp;&nbsp;&nbsp;ชื่อ {{ fBody.empName }}</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="6"></v-col>
                            <v-col md="3">ตำแหน่ง ......................................</v-col>
                            <v-col md="3">รหัสพนักงาน ..............................</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="6"></v-col>
                            <v-col md="2">เบอร์ติดต่อกลับ</v-col>
                            <v-col md="3">......................................</v-col>
                        </v-row >
                        <table width="100%">
                            <v-row no-gutters>
                                <v-col col="12" md="1">เรียน</v-col>
                                <v-col col="12" md="2">
                                    <div v-if="temp == 1">{{ StaticFoot.to1 }}</div>
                                    <div v-else-if="temp == 2">{{ StaticFoot.to2 }}</div>
                                </v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="3">ดำเนินการจัดซ่อมโดยวิธี</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="4">จัดซื้ออุปกรณ์มาเปลี่ยน เนื่องจาก</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">{{ StaticFoot.dot1 }}</v-col>

                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="4">ส่งให้บริษัทดำเนินการ เนื่องจาก</v-col>
                                <v-col col="12" md="4"></v-col>
                                <v-col col="12" md="2">อนุมัติ</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">{{ StaticFoot.dot1 }}</v-col>
                                <v-col col="12" md="2">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="4">ไม่ดำเนินการจัดดซ่อม เนื่องจาก</v-col>

                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="4">{{ StaticFoot.dot1 }}</v-col>
                                <v-col col="12" md="4"></v-col>
                                <v-col col="12" md="2">{{ StaticFoot.dot2 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="7">&nbsp;</v-col>
                                <v-col col="12" md="1">ตำแหน่ง</v-col>
                                <v-col col="12" md="4">{{ StaticFoot.dot3 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                                <v-col col="12" md="2"></v-col>
                                <v-col col="12" md="4">{{ StaticFoot.date1 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="6">{{ StaticFoot.note1 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="5">{{ StaticFoot.dot2 }}</v-col>
                            </v-row>
                            <v-row no-gutters>

                                <v-col col="12" md="1">ตำแหน่ง</v-col>
                                <v-col col="12" md="5">{{ StaticFoot.dot3 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="5">{{ StaticFoot.date1 }}</v-col>
                            </v-row>
                        </table>
                    </v-container>

                </div>

            </v-sheet>

        </div>
        <v-btn class="btn-save" @click="download()">บันทึก</v-btn>

        <VueHtml2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="true"
            :paginate-elements-by-height="1400" filename="myPDF" :pdf-quality="2" :manual-pagination="false"
            pdf-format="a4" pdf-orientation="portrait" pdf-content-width="800px" ref="html2Pdf" :html-to-pdf-options="{
                margin: [0, 0, 0, 0],
                image: { type: 'png' }
            }">
            <section slot="pdf-content">
                <div class="firstForm">
                    <v-container>
                        <v-row>
                            <v-col md="12">
                                <v-img src="@/assets/logo.png" max-width="120"></v-img>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1">จาก</v-col>
                            <v-col md="5">{{ StaticHeader.FromDepartment }}</v-col>
                            <v-col md="1">ถึง</v-col>
                            <v-col md="5">
                                <div v-if="temp == 1">
                                    {{ StaticHeader.to1 }}
                                </div>
                                <div v-else-if="temp == 2">
                                    {{ StaticHeader.to2 }}</div>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1">เลขที่</v-col>
                            <v-col md="5">{{ StaticHeader.No }}</v-col>
                            <v-col md="1">วันที่</v-col>
                            <v-col md="5">{{ currentDate() }}</v-col>
                        </v-row>

                        <v-row no-gutters>
                            <v-col col="1" md="1">เรื่อง</v-col>
                            <v-col md="11">{{ StaticBoby.subject }}</v-col>
                        </v-row>
                        <v-row>
                            <hr>
                        </v-row>
                        <v-row no-gutters>
                            <v-col col="1" md="1">เรียน</v-col>
                            <v-col md="11">
                                <div v-if="temp == 1">
                                    {{ StaticBoby.to1 }}
                                </div>
                                <div v-else-if="temp == 2">
                                    {{ StaticBoby.to2 }}</div>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1"></v-col>
                            <v-col md="11">{{ StaticBoby.substance }}</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="1">ประเภท</v-col>
                            <v-col md="1">{{ StaticBoby.device }}</v-col>
                            <v-col md="1">ยี่ห้อ</v-col>
                            <v-col md="2"></v-col>
                            <v-col md="1">รุ่น</v-col>
                            <v-col md="2"></v-col>
                            <v-col md="2">สัญญาเลขที่</v-col>
                            <v-col md="2"></v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="2">การรับประกัน</v-col>
                            <v-col md="3">{{ fBody.warranty }}</v-col>
                            <v-col md="2">อาการเสีย</v-col>
                            <v-col md="3">{{ fBody.damage }}</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="2">สถานที่ติดตั้ง</v-col>
                            <v-col md="10"> {{ fBody.location }}</v-col>
                        </v-row>
                        <br>
                        <v-row no-gutters>
                            <v-col md="1"></v-col>
                            <v-col md="10">
                                <table>
                                    <td>
                                        {{ StaticBoby.note1 }}
                                    </td>
                                </table>
                            </v-col>
                            <v-col md="1"></v-col>

                        </v-row>
                        <v-row>
                            <v-col md="1"></v-col>
                            <v-col md="10">
                                {{ StaticBoby.note2 }}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col md="7"></v-col>
                            <v-col md="5">&nbsp;&nbsp;&nbsp;ชื่อ {{ fBody.empName }}</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="6"></v-col>
                            <v-col md="3">ตำแหน่ง ......................................</v-col>
                            <v-col md="3">รหัสพนักงาน ..............................</v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col md="6"></v-col>
                            <v-col md="2">เบอร์ติดต่อกลับ</v-col>
                            <v-col md="3">......................................</v-col>
                        </v-row >
                        <table width="100%">
                            <v-row no-gutters>
                                <v-col col="12" md="1">เรียน</v-col>
                                <v-col col="12" md="2">
                                    <div v-if="temp == 1">{{ StaticFoot.to1 }}</div>
                                    <div v-else-if="temp == 2">{{ StaticFoot.to2 }}</div>
                                </v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="3">ดำเนินการจัดซ่อมโดยวิธี</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="4">จัดซื้ออุปกรณ์มาเปลี่ยน เนื่องจาก</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">{{ StaticFoot.dot1 }}</v-col>

                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="4">ส่งให้บริษัทดำเนินการ เนื่องจาก</v-col>
                                <v-col col="12" md="4"></v-col>
                                <v-col col="12" md="2">อนุมัติ</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">{{ StaticFoot.dot1 }}</v-col>
                                <v-col col="12" md="2">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="4">ไม่ดำเนินการจัดดซ่อม เนื่องจาก</v-col>

                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="4">{{ StaticFoot.dot1 }}</v-col>
                                <v-col col="12" md="4"></v-col>
                                <v-col col="12" md="2">{{ StaticFoot.dot2 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="7">&nbsp;</v-col>
                                <v-col col="12" md="1">ตำแหน่ง</v-col>
                                <v-col col="12" md="4">{{ StaticFoot.dot3 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                                <v-col col="12" md="2"></v-col>
                                <v-col col="12" md="4">{{ StaticFoot.date1 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="6">{{ StaticFoot.note1 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="6">&nbsp;</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="5">{{ StaticFoot.dot2 }}</v-col>
                            </v-row>
                            <v-row no-gutters>

                                <v-col col="12" md="1">ตำแหน่ง</v-col>
                                <v-col col="12" md="5">{{ StaticFoot.dot3 }}</v-col>
                            </v-row>
                            <v-row no-gutters>
                                <v-col col="12" md="1"></v-col>
                                <v-col col="12" md="5">{{ StaticFoot.date1 }}</v-col>
                            </v-row>
                        </table>
                    </v-container>

                </div>
            </section>
        </VueHtml2pdf>
    </div>




</template>

<script src="https://code.jquery.com/jquery-1.12.3.min.js"></script>


<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/0.9.0rc1/jspdf.min.js"></script>
<script src="./repairForm.js"></script>
<style src="./repairForm.css">
</style>
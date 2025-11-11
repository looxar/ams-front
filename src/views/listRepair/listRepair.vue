<template>
    <div>
        <v-card class="pa-2">
            <v-row>
                <v-col cols="6" md="6">
                    <v-combobox v-model="selectCCvalue" :items="CcItems" item-text="ccFullName" dense label="การไฟฟ้า">
                    </v-combobox>
                </v-col>
                <v-col cols="3" md="3">
                    <v-btn elevation="2" block color="primary" @click="lookFor(selectCCvalue)">ค้นหา</v-btn>
                </v-col>
                <v-col cols="3" md="3">
                    <v-card-text v-if="this.state == null || this.state == 0">สถานะ : รายการทั้งหมด</v-card-text>
                    <v-card-text v-else-if="this.state == 1">สถานะ : รับเครื่อง</v-card-text>
                    <v-card-text v-else-if="this.state == 2">สถานะ : กำลังดำเนินการ</v-card-text>
                    <v-card-text v-else-if="this.state == 3">สถานะ : เสร็จแล้ว</v-card-text>
                    <v-card-text v-else-if="this.state == 4">สถานะ : คืนเครื่องแล้ว</v-card-text>
                </v-col>
            </v-row>
            <v-row>
                <v-col col="3" md="2.4">
                    <v-btn elevation="2" color="#c7833d" block @click="allStste()">รายการทั้งหมด</v-btn>
                </v-col>
                <v-col col="2" md="2.4">
                    <v-btn elevation="2" color="#fdcd26" block @click="reseveInState()">รับเครื่อง</v-btn>
                </v-col>
                <v-col col="2" md="2.4">
                    <v-btn elevation="2" color="#6a97ff" block @click="inProgressState()">กำลังดำเนินการ</v-btn>
                </v-col>
                <v-col col="2" md="2.4">
                    <v-btn elevation="2" color="#6eff78" block @click="doneState()">เสร็จแล้ว</v-btn>
                </v-col>
                <v-col col="2" md="2.4">
                    <v-btn elevation="2" color="#E1BEE7" block @click="returnState()">คืนเครื่องแล้ว</v-btn>
                </v-col>
            </v-row>
            <hr />

            <v-data-table :headers="DataTableHeaders" :items="dataTableItems" :items-per-page="10" :sort-by="['sendDate']"
                :sort-desc="[true]">

                <template v-slot:item="row">
                    <tr>
                        <td>{{ row.item.device.devPeaNo }}</td>
                        <td>{{ row.item.device.tbCostCenterTest.ccShortName }}</td>
                        <td>{{ row.item.device.devDescription }}</td>
                        <td>{{ row.item.device.devSerialNo }}</td>
                        <td>{{ formatDate(row.item.sendDate) }}</td>
                        <td>{{ row.item.empSend.empId }}</td>

                        <td>
                            <v-spacer></v-spacer>
                            <div v-if="row.item.repairStatus.id == 1">
                                <v-btn block color="#fdcd26" @click="dialog1 = true; openDialog(row.item)">
                                    รับเครื่อง
                                </v-btn>
                            </div>

                            <div v-else-if="row.item.repairStatus.id == 2">
                                <v-btn block color="#6a97ff" @click="dialog2 = true; openDialog(row.item)">
                                    กำลังดำเนินการ
                                </v-btn>
                            </div>

                            <div v-else-if="row.item.repairStatus.id == 3">

                                <v-btn block color="#6eff78" @click="dialog3 = true; openDialog(row.item)">
                                    เสร็จแล้ว
                                </v-btn>

                            </div>

                            <div v-else-if="row.item.repairStatus.id == 4">
                                <v-btn disabled block color="#E1BEE7">
                                    คืนเครื่องแล้ว
                                </v-btn>
                            </div>

                        </td>

                        <td>
                            <v-btn @click="dialogInfo = true; openDialogInfo(row.item)">
                                <v-icon color="teal darken-2" small>
                                    mdi-message-text
                                </v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </template>
            </v-data-table>

            <v-dialog v-model="dialog1" persistent width="700">
                <v-card>
                    <v-toolbar color="primary" dark>
                        <span class="text-h5">รับเครื่องและอุปกรณ์</span>
                    </v-toolbar>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-card-text>
                            <v-row>
                                <!-- <v-col cols="12" sm="6">
                                    <v-select v-model="dialog1Value.adminName" :items="adminNames" item-text="adName"
                                        :rules="adNameRules" item-value="adName" label="ผู้รับเรื่อง *" required>
                                    </v-select>
                                </v-col> -->

                                <v-col cols="12" sm="12">
                                    <!-- <v-select v-model="dialog1Value.caues" :items="caues" item-text="name"
                                        :rules="causeRules" item-value="value" label="อาการเสียเบื้องต้น *" required>
                                    </v-select> -->
                                    <v-textarea fluid v-model="dialog1Value.caues" solo name="treatment"
                                        :rules="causeRules" label="ตัวอย่าง : แรมไหม้ *">
                                    </v-textarea>
                                </v-col>
                            </v-row>
                            <small>*indicates required field</small>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" text @click="dialog1 = false; reset()">
                                ยกเลิก
                            </v-btn>
                            <v-btn color="success" text @click="saveDialog1(dialog1Value)">
                                บันทึก
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>

            <v-dialog v-model="dialog2" persistent width="700">
                <v-card>
                    <v-toolbar color="primary" dark>
                        <span class="text-h5">วิธีแก้ไข</span>
                    </v-toolbar>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-card-text>
                            <v-container>
                                <v-row>

                                    <v-col cols="12" sm="12">
                                        <v-textarea fluid v-model="dialog2Value.treatment" solo name="treatment"
                                            :rules="treatmentRules" label="ดำเนินการโดยวิธี เช่น เปลี่ยนแรม *">
                                        </v-textarea>
                                    </v-col>
                                </v-row>
                            </v-container>
                            <small>*indicates required field</small>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" text @click="dialog2 = false; reset()">
                                ยกเลิก
                            </v-btn>
                            <v-btn color="success" text @click="dialog2 = false; openDialog2(dialog2Value)">
                                บันทึก
                            </v-btn>
                        </v-card-actions>
                    </v-form>

                </v-card>
            </v-dialog>

            <v-dialog v-model="dialog3" persistent width="700">
                <v-card>
                    <v-toolbar color="primary" dark>
                        <span class="text-h5">ผู้รับเครื่องคืน</span>
                    </v-toolbar>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-text-field label="รหัสพนักงานผู้รับเครื่อง" v-model="dialog3Value.returnEmp"
                                        :rules="returnEnpRules" hide-details="auto">
                                    </v-text-field>
                                </v-row>
                            </v-container>
                            <small>*indicates required field</small>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" text @click="dialog3 = false; reset()">
                                ยกเลิก
                            </v-btn>
                            <v-btn color="success" text @click="dialog3 = false; openDialog3(dialog3Value)">
                                บันทึก
                            </v-btn>
                        </v-card-actions>
                    </v-form>

                </v-card>
            </v-dialog>
            <v-dialog v-model="dialogInfo" width="75%">
                <v-card>
                    <v-toolbar color="primary" dark>
                        <span class="text-h5">รายละเอียด</span>
                        <v-spacer></v-spacer>
                        <span class="text-h5">สถานะ : {{ dialogInfoValue.repairStatus.statusName }}</span>
                    </v-toolbar>

                    <v-card-text>

                        <v-row>
                            <v-col cols="12" sm="3">
                                เลขทรัพย์สิน : <b>{{ dialogInfoValue.device.devPeaNo }}</b>
                            </v-col>
                            <v-col cols="12" sm="3">
                                การไฟฟ้า : {{ dialogInfoValue.location.ccFullName  }}
                            </v-col>
                            <v-col cols="12" sm="2">
                                ศูนย์ต้นทุน : {{ dialogInfoValue.location.ccLongCode }}
                            </v-col>
                            <v-col cols="12" sm="2">
                                ผู้ครอบครอง : <b>{{ dialogInfoValue.empOwnerDevice.empName }}</b>
                            </v-col>
                            <v-col cols="12" sm="2">
                                รหัสพนักงาน : {{ dialogInfoValue.empOwnerDevice.empId }}
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col cols="12" sm="3">
                                หมายเลขผลิตภัณฑ์ : <b>{{ dialogInfoValue.device.devSerialNo }}</b>
                            </v-col>
                            <v-col cols="12" sm="5">
                                รายละเอียดเครื่อง : <b>{{ dialogInfoValue.device.devDescription }}</b>
                            </v-col>
                            <v-col cols="12" sm="4">
                                อาการเสียเบื้องต้น : <b>{{ dialogInfoValue.damageDetail }}</b>
                            </v-col>
                        </v-row>
                        <v-row no-gutters>
                            <v-col cols="12" sm="12">
                                ประเภทเครื่อง : <p>{{ dialogInfoValue.deviceType.deviceTypeName }}</p>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="3">
                                ผู้ส่งเครื่อง : <b>{{ dialogInfoValue.empSend.empName }}</b>
                            </v-col>
                            <v-col cols="12" sm="3">
                                รหัสพนักงาน : {{ dialogInfoValue.empSend.empId }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                เบอร์ติดต่อ : {{ dialogInfoValue.empPhoneNumb }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                วันที่ส่ง : {{ dialogInfoValue.sendDate }}
                            </v-col>
                        </v-row>
                        
                        <hr />
                        <v-row>
                            <v-col cols="12" sm="3">
                                เจ้าหน้าที่รับเครื่อง : <b>{{ dialogInfoValue.adminReceiveName }}</b>
                            </v-col>
                            <v-col cols="12" sm="3">
                                รหัสพนักงาน : {{ dialogInfoValue.adminReceiveEmpID }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                เจ้าหน้าที่รับเมื่อ : {{ dialogInfoValue.adminReceiveAdmitDate }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                วันที่ซ่อมเสร็จ : {{ dialogInfoValue.treatCompleteDate }}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="6">
                                อาการเสีย : <b>{{ dialogInfoValue.cause }}</b>
                            </v-col>
                            <v-col cols="12" sm="6">
                                วิธีแก้ไข : <b>{{ dialogInfoValue.treatment }}</b>
                            </v-col>
                        </v-row>
                        <hr />
                        <v-row>
                            <v-col cols="12" sm="3">
                                ผู้รับเครื่องคืน : <b>{{ dialogInfoValue.returnEmp }}</b>
                            </v-col>
                            <!-- <v-col cols="12" sm="3">
                                    รหัสพนักงาน : {{ dialogInfoValue.returnEmpId }}
                                </v-col> -->
                            <v-col cols="12" sm="4">
                                วันที่รับเครื่องคืน : <b>{{ dialogInfoValue.returnDate }}</b>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" text @click="dialogInfo = false, printPDF()">
                            print
                        </v-btn>
                        <v-btn color="blue-darken-1" text @click="dialogInfo = false">
                            Close
                        </v-btn>
                    </v-card-actions>

                </v-card>
            </v-dialog>
        </v-card>
        <VueHtml2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="true"
            :paginate-elements-by-height="1400" filename="myPDF" :pdf-quality="2" :manual-pagination="false" pdf-format="a4"
            pdf-orientation="portrait" pdf-content-width="800px" ref="html2Pdf" :html-to-pdf-options="{
                filename: `คำร้องแจ้งซ่อม ` + dialogInfoValue.peaNo + ` .pdf`,
                margin: [0, 0, 0, 0],
                image: { type: 'jpeg', quality: 0.98, size: 20 },
                html2canvas: { dpi: 192, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }">
            <section slot="pdf-content">
                <div class="firstForm">
                    <v-row>
                        <v-col md="12">
                            <img width=150 src="@/assets/logo.png" />
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="1">จาก</v-col>
                        <v-col md="5">{{ dialogInfoValue.location.ccShortName }}</v-col>
                        <v-col md="1">ถึง</v-col>
                        <v-col md="5">
                            <div v-if="first5char == 1">{{ StaticHeader.to1 }}</div>
                            <div v-else-if="first5char == 2">{{ StaticHeader.to2 }}</div>
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
                    <v-row class="new1">
                        <hr>
                    </v-row>
                </div>
                <div class="bodyForm">
                    <v-row no-gutters>
                        <v-col col="1" md="1">เรียน</v-col>
                        <v-col md="11">
                            <div v-if="first5char == 1">{{ StaticBoby.to1 }}</div>
                            <div v-else-if="first5char == 2">{{ StaticBoby.to2 }}</div>
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="1"></v-col>
                        <v-col md="11">{{ StaticBoby.substance }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="2">เลขทรัพย์สิน</v-col>
                        <v-col md="3">{{ dialogInfoValue.device.devPeaNo }}</v-col>
                        <v-col md="2">รายละเอียด</v-col>
                        <v-col md="5">{{ dialogInfoValue.device.devDescription }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="1">ประเภท</v-col>
                        <v-col md="3">{{ dialogInfoValue.deviceType.deviceTypeName }}</v-col>
                        <v-col md="1">ยี่ห้อ</v-col>
                        <v-col md="1"></v-col>
                        <v-col md="1">รุ่น</v-col>
                        <v-col md="2"></v-col>
                        <v-col md="2">สัญญาเลขที่</v-col>
                        <v-col md="1"></v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="2">การรับประกัน</v-col>
                        <v-col md="3"> {{ this.dialogInfoValue.Warranty }} </v-col>    
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="2">อาการเสีย</v-col>
                        <v-col md="10">{{ dialogInfoValue.damageDetail }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="2">สถานที่ติดตั้ง</v-col>
                        <v-col md="10"> {{ dialogInfoValue.location.ccFullName }}</v-col>
                    </v-row>
                    <v-row class="new1">
                        <hr>
                    </v-row>
                </div>
                <div class="bodyBox">
                    <v-row no-gutters>
                        <v-col md="1"></v-col>
                        <v-col md="10">
                            {{ StaticBoby.note1 }}
                        </v-col>
                        <v-col md="1"></v-col>
                    </v-row>
                </div>
                <div>
                    <v-row>
                        <v-col md="1"></v-col>
                        <v-col md="10">
                            {{ StaticBoby.note2 }}
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col md="7"></v-col>
                        <v-col md="5">&nbsp;&nbsp;&nbsp;ชื่อ {{ dialogInfoValue.empSend.empName }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="6"></v-col>
                        <v-col md="3">ตำแหน่ง {{ dialogInfoValue.empSend.empRole }}</v-col>
                        <v-col md="3">รหัสพนักงาน {{ dialogInfoValue.empSend.empId }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="6"></v-col>
                        <v-col md="2">เบอร์ติดต่อกลับ</v-col>
                        <v-col md="3">{{ dialogInfoValue.empPhoneNumb }}</v-col>
                    </v-row>

                </div>
                <div class="bodyBox1">
                    <v-row no-gutters>
                        <v-col class="chkBeFor1">การตรวจสอบอุปกรณ์ก่อนส่งซ่อม</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="chkBeFor1">{{ dialogInfoValue.damage }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col md="7"></v-col>
                        <v-col md="5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ชื่อ&nbsp;&nbsp;&nbsp;{{ dialogInfoValue.adminName}}</v-col>
                    </v-row>
                    <v-row no-gutters>

                        <v-col style="margin-left: 65%;">&nbsp;&nbsp;&nbsp;ตำแหน่ง&nbsp;&nbsp;&nbsp;{{
                            dialogInfoValue.adminRole }}</v-col>
                    </v-row>
                    <v-row no-gutters>

                        <v-col style="margin-left: 60%;">{{ StaticFoot.date1 }}</v-col>
                    </v-row>
                </div>
                <div class="bodyBox2">
                    <v-row no-gutters>
                        <v-col class="bodyBox3">
                            <div v-if="first5char == 1" class="chkBeFor1">เรียน&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{
                                StaticHeader.to1 }}</div>
                            <div v-else-if="first5char == 2" class="chkBeFor1">เรียน&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{
                                StaticHeader.to2 }}</div>
                        </v-col>
                        <v-col class="bodyBox3">ที่ &nbsp;&nbsp;&nbsp; {{ StaticFoot.dot3 }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 2%;">ดำเนินการโดยวิธี</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 2%;">
                            <v-icon>mdi-border-all-variant</v-icon>
                            &nbsp;จัดซื้ออุปกรณ์มาเปลี่ยน
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 1%;">{{ StaticFoot.dot1 }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 2%;">
                            <v-icon>mdi-border-all-variant</v-icon>
                            &nbsp;ส่งให้บริษัทดำเนินการ
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 1%;">{{ StaticFoot.dot1 }}</v-col>
                        <v-col class="bodyBox3" style="margin-left: 30%;">อนุมัติ</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 2%;">
                            <v-icon>mdi-border-all-variant</v-icon>
                            &nbsp;ไม่ดำเนินการจัดซ่อม
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 1%;">{{ StaticFoot.dot1 }}</v-col>
                        <v-col style="margin-left: 17%;">{{ StaticFoot.dot2 }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 1%;">{{ StaticFoot.note1 }}</v-col>
                        <v-col style="margin-left: 10%;">{{ StaticFoot.dot4 }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col class="bodyBox3" style="margin-left: 62%;">{{ StaticFoot.date1 }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col style="margin-left: 8%;">{{ StaticFoot.dot2 }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col style="margin-left: 3%;">{{ StaticFoot.dot4 }}</v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col style="margin-left: 11%;">{{ StaticFoot.date1 }}</v-col>
                        <v-col style="margin-left: 11%;">หมายเลขติดตามงาน&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp; {{
                            dialogInfoValue.repairId }}</v-col>
                    </v-row>
                </div>


            </section>
        </VueHtml2pdf>
    </div>
</template>
<script src="./listRepair.js"></script>
<style src="./listRepair.css"></style>
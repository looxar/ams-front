<template>
    <div>
        <v-card class="pa-2">

            <v-container>
                <v-row>
                    <v-col cols="6" md="6">
                        <v-combobox v-model="value" :items="items" item-text="ccFullName" dense label="การไฟฟ้า">
                        </v-combobox>
                    </v-col>
                    <v-col cols="6" md="6">
                        <v-btn elevation="2" @click="find(value)">ค้นหา</v-btn>
                    </v-col>
                </v-row>
            </v-container>

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
                                <v-btn block color="#fdcd26">
                                    รับเครื่อง
                                </v-btn>
                            </div>

                            <div v-else-if="row.item.repairStatus.id == 2">
                                <v-btn block color="#6a97ff">
                                    กำลังดำเนินการ
                                </v-btn>
                            </div>

                            <div v-else-if="row.item.repairStatus.id == 3">

                                <v-btn block color="#6eff78">
                                    เสร็จแล้ว
                                </v-btn>

                            </div>

                            <div v-else-if="row.item.repairStatus.id == 4">
                                <v-btn block color="#E1BEE7">
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

            <v-dialog v-model="dialogInfo" width="80%" height="70%">
                <v-card>
                    <v-toolbar color="primary" dark>
                        <span class="text-h5">รายละเอียด</span>
                        <v-spacer></v-spacer>
                        <span class="text-h5">สถานะ : {{ dialogInfoValue.stage }}</span>
                    </v-toolbar>
                    <v-card-text class="grid-item">
                        <br />
                        <v-row>
                            <v-col cols="12" sm="2">
                                เลขทรัพย์สิน : {{ dialogInfoValue.peaNo }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                การไฟฟ้า : {{ dialogInfoValue.location }}
                            </v-col>
                            <v-col cols="12" sm="2">
                                ศูนย์ต้นทุน : {{ dialogInfoValue.ccFull }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                ผู้ครอบครอง : <b>{{ dialogInfoValue.empOwnerName }}</b>
                            </v-col>
                            <v-col cols="12" sm="2">
                                รหัสพนักงาน : {{ dialogInfoValue.empOwnerId }}
                            </v-col>
                        </v-row>
                        <hr class="new1" />
                        <v-row>
                            <v-col cols="12" sm="3">
                                ผู้ส่งเครื่อง : <b>{{ dialogInfoValue.empSendName }}</b>
                            </v-col>
                            <v-col cols="12" sm="3">
                                รหัสพนักงาน : {{ dialogInfoValue.empSendId }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                วันที่ส่ง : {{ dialogInfoValue.sendDate }}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="12">
                                อาการเสียเบื้องต้น : <b>{{ dialogInfoValue.damageDetail }}</b>
                            </v-col>
                        </v-row>
                        <hr class="new1" />
                        <v-row>
                            <v-col cols="12" sm="3">
                                เจ้าหน้ารับเครื่อง : <b>{{ dialogInfoValue.adminName }}</b>
                            </v-col>
                            <v-col cols="12" sm="3">
                                รหัสพนักงาน : {{ dialogInfoValue.adminID }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                เจ้าหน้าที่รับเมื่อ : {{ dialogInfoValue.admitDate }}
                            </v-col>
                            <v-col cols="12" sm="3">
                                วันที่ซ่อมเสร็จ : {{ dialogInfoValue.treatComplete }}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="6">
                                อาการเสีย : <b>{{ dialogInfoValue.damage }}</b>
                            </v-col>
                            <v-col cols="12" sm="6">
                                วิธีแก้ไข : <b>{{ dialogInfoValue.treatment }}</b>
                            </v-col>
                        </v-row>
                        <hr class="new1" />
                        <v-row>
                            <v-col cols="12" sm="3">
                                ผู้รับเครื่องคืน : <b>{{ dialogInfoValue.returnEmp }}</b>
                            </v-col>
                            <v-col cols="12" sm="4">
                                วันที่รับเครื่องคืน : <b>{{ dialogInfoValue.returnDate }}</b>
                            </v-col>
                        </v-row>
                        <br />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" text @click="dialogInfo = false">
                            Close
                        </v-btn>

                    </v-card-actions>

                </v-card>
            </v-dialog>

        </v-card>



    </div>
</template>
<script src="./TrackingRepair.js"></script>
<style src="./TrackingRepair.css" scoped></style>
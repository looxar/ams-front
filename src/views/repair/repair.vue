<template>
  <div>
    <v-card class="outside-card" color="purple  lighten-5">
      <v-toolbar flat color="purple" dark>
        <v-icon>mdi-database-search</v-icon>
        <v-toolbar-title class="font-weight-light"> แจ้งซ่อม </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-card-text>
        <v-form>
          <v-row>
            <v-col col="12" md="12">
              <v-autocomplete v-model="ccNameSeclected" :items="itemCC" item-text="ccFullName" item-value="ccLongCode"
                color="black" label="การไฟฟ้า" @change="
                  $v.ccNameSeclected.$touch();
                toggleBranch2(ccNameSeclected);
                " :error-messages="ccNameSeclectedErrors">
              </v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col col="12" md="6">
              <v-autocomplete v-model="devPeaNoSelceted" :items="itemDevice" item-text="devPeaNo" color="black"
                label="เลขทรัพย์สิน" @change="
                  $v.devPeaNoSelceted.$touch();
                findDiscDevice(devPeaNoSelceted);
                " :error-messages="devPeaNoSelcetedErrors">
              </v-autocomplete>
            </v-col>
            <v-col col="12" md="6">
              <v-text-field v-model="devDesc.devDescription" color="black" label="รายละเอียด" disabled></v-text-field>
            </v-col>
          </v-row>
          <v-text-field v-model="damage" color="black" label="อาการเสียเบื้องต้น" :counter="100"
            :error-messages="damageErrors">
          </v-text-field>
          <v-row>
            <v-col col="12" md="3">
              <v-text-field v-model="empSend" color="black" label="รหัสพนักงานผู้ส่ง" @keyup.enter="
                $v.empSend.$touch();
              findEmp(empSend);
              " :error-messages="empSendErrors">
              </v-text-field>
            </v-col>
            <v-col col="12" md="3">
              <v-text-field v-model="empData.empName" color="black" label="ชื่อพนักงานผู้ส่ง" disabled>
              </v-text-field>
            </v-col>
            <v-col col="12" md="3">
              <v-text-field v-model="empPhoneNumb" :error-messages="empPhoneNumbErrors" color="black"
                label="เบอร์ติดต่อกลับ"></v-text-field>
            </v-col>
            <v-col col="12" md="3">
              <v-btn color="success" block @click="
                $v.empSend.$touch();
              findEmp(empSend);
              ">
                ค้นหา
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <a @click="dialogNote = true" target="_blank">*หมายเหตุ : บันทึก ฉ.2 กรท.(ก) 97/2564 ลว.27 ม.ค. 2564</a>

        <v-spacer></v-spacer>
        <v-btn color="error" @click="clear()"> ล้างค่า </v-btn>
        <v-btn color="success" @click="continues()"> ต่อไป </v-btn>
      </v-card-actions>
    </v-card>
    <div class="text-center">
      <v-dialog v-model="dialogNote" width="700">
        <v-card>
          <v-card-text>
            <img src="@/assets/resume.jpg" width="650" />
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogNote = false">
              ปิด
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="text">
      <v-dialog v-model="dialogRechk" width="80%" height="70%">
        <v-card>
          <v-toolbar color="primary" dark>
            <span class="text-h5">รายละเอียด</span>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            
            <hr />
            <v-row>
              <v-col cols="12" sm="2">
                <b>ข้อมูลเครื่อง</b>
              </v-col>
            </v-row>
            <v-row >
              <v-col cols="12" sm="3">
                <p>การไฟฟ้า : {{ fBody.location.ccFullName }}</p>
              </v-col>
              <v-col cols="12" sm="2">
                ศูนย์ต้นทุน : {{ fBody.location.ccLongCode }}
              </v-col>
              <v-col cols="12" sm="2">
                ผู้ครอบครอง : <b>{{ fBody.empOwner.empName }}</b>
              </v-col>
              <v-col cols="12" sm="2">
                รหัสพนักงาน : {{ fBody.empOwner.empId }}
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" sm="2">
                <p>เลขทรัพย์สิน : {{ fBody.device.devPeaNo }}</p>
              </v-col>
              <v-col cols="12" sm="3">
                <p>ประเภททรัพย์สิน : {{ fBody.deviceType.deviceTypeName }}</p>
              </v-col>
              <v-col cols="12" sm="3">
                <p>อาการเสีย : {{ fBody.damage }}</p>
              </v-col>
              <v-col cols="12" sm="3">
                <p>สถานที่ติดตั้ง : {{ fBody.location.ccShortName }}</p>
              </v-col>
            </v-row>
            <hr />
            <v-row>
              <v-col cols="12" sm="2">
                <b>ผู้ส่งซ่อม</b>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="2">
                <p>ชื่อ : {{ fBody.empSends.empName }}</p>
              </v-col>
              <v-col cols="12" sm="3">
                <p>รหัสพนักงาน : {{ fBody.empSends.empId }}</p>
              </v-col>
              <v-col cols="12" sm="3">
                <p>เบอร์ติดต่อ : {{ fBody.empPhoneNumb }}</p>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="dialogRechk = false">
              แก้ไข
            </v-btn>
            <v-btn color="primary" variant="tonal" text @click="(dialogRechk = false), save()">
              บันทึก
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script src="./repair.js"></script>

<style src="./repair.css"></style>

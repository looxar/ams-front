<template>
  <div class="py-2 my-2" style="width: 100%">
    <div v-if="loading" class="d-flex align-center justify-center fill-height">
      <v-progress-circular indeterminate color="primary" size="96" width="8" />
    </div>

    <v-row v-else>
      <div>
        <v-alert
          :value="alert"
          color="red"
          dark
          border="top"
          icon="mdi-home"
          transition="slide-y-transition"
        >
          กรุณาเลือกหน่วยงานที่ต้องการตรวจสอบ
        </v-alert>
      </div>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4" md="4">
            <div>
              <v-chip
                large
                class="pl-4 pr-4 purple--text text--darken-2 custom-regname"
                style="font-size: 18px"
              >
                <v-icon medium class="mr-2" color="purple darken-2">
                  mdi-account-hard-hat </v-icon
                >จำนวนพนักงานทั้งหมด
                <b class="ml-2"> {{ itemsEmp.length }} </b>
                <span class="ml-2"> </span>
                คน
              </v-chip>
            </div></v-col
          >
          <v-col cols="12" sm="4" md="4">
            <div>
              <v-chip
                large
                class="pl-4 pr-4 purple--text text--darken-2 custom-regname"
                style="font-size: 18px"
              >
                <v-icon medium class="mr-2" color="purple darken-2">
                  mdi-laptop </v-icon
                >จำนวนคอมพิวเตอร์ทั้งหมด
                <b class="ml-2"> {{ rows.length }} </b>
                <span class="ml-2"> </span>รายการ
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div>
              <v-chip
                large
                class="pl-4 pr-4 green--text text--darken-3 custom-regnewer"
                style="font-size: 18px"
              >
                <v-icon medium class="mr-2" color="green darken-3">
                  mdi-home-city </v-icon
                >หน่วยงานที่จำนวนคอมพิวเตอร์เหมาะสมกับจำนวนพนักงาน
                <b> </b>
                <span class="ml-2"> </span>
                แห่ง
              </v-chip>
            </div></v-col
          >
        </v-row>

        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div>
              <v-chip
                large
                class="pl-4 pr-4 red--text text--darken-2 custom-emptotal"
                style="font-size: 18px"
              >
                <v-icon medium class="mr-2" color="red darken-2">
                  mdi-account-hard-hat </v-icon
                >พนักงานที่ยังใช้คอมพิวเตอร์เครื่องเก่าหรือยังไม่มีครอบครอง
                (ควรได้รับจัดสรรเพิ่มเติม ตามหลักเกณฑ์)
                <b class="ml-2"> {{ overall.unownedCount }} </b>
                <span class="ml-2"> </span>
                คน
              </v-chip>
            </div></v-col
          >
        </v-row>

        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div>
              <v-chip
                large
                class="pl-4 pr-4 indigo--text text--darken-2 custom-regtotal"
                style="font-size: 18px"
              >
                <v-icon medium class="mr-2" color="indigo darken-2">
                  mdi-home-city </v-icon
                >หน่วยงานที่จำนวนคอมพิวเตอร์มากกว่าจำนวนพนักงาน
                (นับเฉพาะคอมพิวเตอร์ที่มีอายุไม่เกิน 7 ปี)
                <b> </b>
                <span class="ml-2"> </span>
                แห่ง
              </v-chip>
            </div></v-col
          >
        </v-row>

        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div>
              <v-chip
                large
                class="pl-4 pr-4 warning--text text--darken-2 custom-regolder"
                style="font-size: 18px"
              >
                <v-icon medium class="mr-2" color="warning darken-2">
                  mdi-account-hard-hat </v-icon
                >พนักงานที่ยังใช้คอมพิวเตอร์เครื่องเก่าหรือยังไม่มีครอบครอง
                (แต่แผนก/ต้นสังกัด มีจำนวนคอมพิวเตอร์เพียงพอ)
                <b> </b>
                <span class="ml-2"> </span>
                คน
              </v-chip>
            </div></v-col
          >
        </v-row>

        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div>
              <v-chip
                large
                class="pl-4 pr-4 warning--text text--darken-2 custom-regolder"
                style="font-size: 18px"
              >
                <v-icon medium class="mr-2" color="warning darken-2">
                  mdi-account-hard-hat </v-icon
                >พนักงานที่ยังใช้คอมพิวเตอร์เครื่องเก่าหรือยังไม่มีครอบครอง
                (แต่หน่วยงานต้นสังกัด/กฟส.ต้นสังกัด มีจำนวนคอมพิวเตอร์เพียงพอ)
                <b> </b>
                <span class="ml-2"> </span>
                คน
              </v-chip>
            </div></v-col
          >
        </v-row>
      </v-card-text>

      <v-card-text class="px-12 mx-4 search-panel sticky">
        <v-form v-model="valid">
          <v-row>
            <v-col cols="12" sm="2" md="2">
              <v-autocomplete
                color="primary"
                v-model="modelEmp"
                :items="itemsEmp"
                :item-text="getItemEmp"
                label="รหัสพนักงาน"
                item-value="empId"
                :loading="loadingEmp"
                @change="(event) => updateCCFromEmp(modelEmp)"
                return-object
              >
              </v-autocomplete>
            </v-col>
            <v-col cols="12" sm="3" md="3">
              <v-autocomplete
                color="primary"
                v-model="modelCC"
                :items="itemsCC"
                :item-text="getItemCC"
                label="การไฟฟ้า"
                item-value="ccLongCode"
                :loading="loadingCC"
                @change="(event) => updateCC(modelCC)"
                return-object
              >
              </v-autocomplete>
            </v-col>

            <v-col cols="12" sm="2" md="1" align-self="center">
              <v-btn
                elevation="3"
                @click="checkQuotaByDep"
                id="searchButton"
                class="custom-button purple--text"
                ><v-icon medium class="mr-2 v-purple"> mdi-magnify </v-icon
                ><b>ตรวจสอบ</b>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-expansion-panels
        v-model="expandedRegions"
        class="outlined-panels"
        focusable
        multiple
      >
        <!-- Region -->
        <v-expansion-panel v-for="reg in regions" :key="reg.regionKey">
          <v-expansion-panel-header class="custom-header">
            <div class="w-100 header-grid">
              <div class="text-left">
                <!-- <v-chip large color="purple" outlined> -->
                <v-chip
                  large
                  class="pl-4 pr-4 purple--text text--darken-2 custom-regname"
                  style="font-size: 18px"
                >
                  <v-icon medium class="mr-2" color="purple darken-2">
                    mdi-home-city
                  </v-icon>
                  <b>
                    {{ (reg.firstDept && reg.firstDept.ccShortName) || "—" }}
                  </b>
                  <span class="ml-2">
                    {{
                      (reg.firstDept && reg.firstDept.ccLongCode) ||
                      reg.regionKey
                    }}
                  </span>
                </v-chip>
              </div>
              <div class="text-left">
                <v-chip
                  large
                  color="white"
                  class="pl-4 pr-4 red--text text--darken-2 custom-emptotal"
                  style="font-size: 16px"
                >
                  <v-icon medium class="mr-2" color="red darken-2">
                    mdi-account-hard-hat
                  </v-icon>
                  พนักงาน
                  <span class="ml-1 mr-1">
                    <b>{{ reg.empCount }}</b></span
                  >
                  คน
                </v-chip>
              </div>
              <div class="text-left">
                <v-chip
                  large
                  color="white"
                  class="pl-4 pr-4 indigo--text text--darken-2 custom-regtotal"
                  style="font-size: 16px"
                >
                  <v-icon medium class="mr-2" color="indigo darken-2">
                    mdi-laptop
                  </v-icon>
                  จำนวนทั้งหมด :
                  <span class="ml-1 mr-1">
                    <b>{{ reg.totalRecords }}</b></span
                  >
                  รายการ</v-chip
                >
              </div>
              <div class="text-left">
                <!-- <v-badge color="green" overlap> -->
                <v-chip
                  large
                  color="white"
                  class="pl-4 pr-4 green--text text--darken-3 custom-regnewer"
                  style="font-size: 16px"
                >
                  <v-icon medium class="mr-2" color="green darken-3">
                    mdi-desktop-classic </v-icon
                  >ยังไม่ทดแทน :
                  <span class="ml-1 mr-1"
                    ><b>{{ reg.newCount }} </b></span
                  ></v-chip
                >
                <!-- </v-badge> -->
              </div>
              <div class="text-left">
                <v-chip
                  large
                  color="white"
                  class="pl-4 pr-4 warning--text text--darken-2 custom-regolder"
                  style="font-size: 16px"
                >
                  <v-icon medium class="mr-2" color="warning darken-2">
                    mdi-delete </v-icon
                  >ทดแทนแล้ว :
                  <span class="ml-1 mr-1"
                    ><b>{{ reg.oldCount }}</b></span
                  >
                  <span v-if="reg.unknownCount">
                    | ไม่ทราบ {{ reg.unknownCount }}</span
                  ></v-chip
                >
              </div>
            </div>
            <template v-slot:actions>
              <v-icon color="purple lighten-3">mdi-chevron-down</v-icon>
            </template>
          </v-expansion-panel-header>

          <v-expansion-panel-content>
            <v-expansion-panels
              v-model="expandedDivisions[reg.regionKey]"
              multiple
            >
              <v-expansion-panel
                v-for="div in reg.divisions"
                :key="div.divisionCode"
              >
                <v-expansion-panel-header>
                  <div class="w-100 header-grid">
                    <div class="text-left">
                      <b class="black--text">
                        {{
                          (div.firstDept && div.firstDept.ccShortName) || "—"
                        }}
                      </b>
                      {{ div.firstDept ? div.firstDept.ccLongCode : "" }}
                    </div>
                    <div class="text-left">
                      พนักงาน
                      <b class="black--text">{{ div.empCount }}</b> คน
                    </div>
                    <div class="text-left">
                      จำนวน
                      <b class="black--text">{{ div.totalRecords }}</b> เครื่อง
                    </div>
                    <div class="text-left">
                      ยังไม่ทดแทน <b class="black--text">{{ div.newCount }}</b>
                    </div>
                    <div class="text-left">
                      ทดแทนแล้ว <b class="black--text">{{ div.oldCount }}</b>
                      <span v-if="div.unknownCount">
                        | ไม่ทราบ {{ div.unknownCount }}</span
                      >
                    </div>
                  </div>
                </v-expansion-panel-header>

                <v-expansion-panel-content>
                  <!-- 2) Department (ccLongCode) level -->
                  <v-expansion-panels
                    v-model="expandedDepartments[div.divisionCode]"
                    multiple
                  >
                    <!-- <v-expansion-panel
                      v-for="dept in div.departments || []"
                      :key="dept.ccLongCode"
                    > -->
                    <v-expansion-panel
                      v-for="dept in div.departments"
                      :key="dept.ccLongCode"
                    >
                      <!-- <v-expansion-panel-header> -->
                      <v-expansion-panel-header
                        :id="`dept-${dept.ccLongCode}`"
                        :class="{
                          'jump-highlight': highlightedCc === dept.ccLongCode,
                        }"
                      >
                        <div class="header-grid">
                          <div class="text-left">
                            <b class="black--text">{{
                              dept.ccShortName || "—"
                            }}</b>
                            {{ dept.ccLongCode }}
                          </div>
                          <div class="text-left">
                            พนักงาน
                            <b class="black--text">{{ dept.empCount }}</b> คน
                          </div>
                          <div class="text-left">
                            จำนวน
                            <b class="black--text">{{ dept.items.length }}</b>
                            เครื่อง
                          </div>
                          <div class="text-left">
                            ยังไม่ทดแทน
                            <b class="black--text">{{ dept.newCount }}</b>
                          </div>
                          <div class="text-left">
                            ทดแทนแล้ว
                            <b class="black--text">{{ dept.oldCount }}</b>
                            <span v-if="dept.unknownCount">
                              | ไม่ทราบ {{ dept.unknownCount }}</span
                            >
                          </div>
                        </div>
                      </v-expansion-panel-header>

                      <v-expansion-panel-content>
                        <div class="dept-split">
                          <div class="pane pane-emp">
                            <div class="table-wrap">
                              <v-simple-table dense>
                                <thead>
                                  <tr>
                                    <th class="text-left">Emp ID</th>
                                    <th class="text-left">Name</th>
                                    <th class="text-left">Rank</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr
                                    v-for="e in dept.employees"
                                    :key="e.empId"
                                  >
                                    <td>{{ e.empId }}</td>
                                    <td class="text-truncate">
                                      {{ e.empName }}
                                    </td>
                                    <td>{{ e.empRank }}</td>
                                  </tr>
                                </tbody>
                              </v-simple-table>
                            </div>
                          </div>

                          <!-- Keep it simple for now: a compact table of rows in this division -->
                          <div class="pane pane-dev">
                            <div class="table-wrap">
                              <v-simple-table dense>
                                <colgroup>
                                  <col class="col-devpeano" />
                                  <col class="col-desc" />
                                  <col class="col-date" />
                                  <col class="col-tag" />
                                  <col class="col-emp" />
                                </colgroup>

                                <thead>
                                  <tr>
                                    <th class="text-center">รหัสทรัพย์สิน</th>
                                    <th class="text-center">คำอธิบาย</th>
                                    <th class="text-center">วันที่ได้รับ</th>
                                    <th class="text-center">Tag</th>
                                    <th class="text-center">ผู้ครอบครอง</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <!-- <tr
                                    v-for="row in dept.items"
                                    :key="`${row.deviceId}-${dept.ccLongCode}`"
                                  > -->
                                  <tr
                                    v-for="row in dept.items"
                                    :key="`${row.device_id || row.deviceId}-${
                                      dept.ccLongCode
                                    }`"
                                  >
                                    <td class="td-devpeano">
                                      {{ row.devPeaNo || row.dev_pea_no }}
                                    </td>
                                    <td class="td-ellipsis">
                                      {{ row.devDescription || row.dev_description }}
                                    </td>
                                    <td class="td-ellipsis">
                                      {{ row.devReceivedDate || row.dev+recieved_date}}
                                    </td>
                                    <td class="td-ellipsis">
                                      <v-chip
                                        x-small
                                        :color="
                                          row._tag === 'new'
                                            ? 'green'
                                            : row._tag === 'old'
                                            ? 'orange'
                                            : 'grey'
                                        "
                                        dark
                                      >
                                        {{
                                          row._tag === "new"
                                            ? "ยังไม่ทดแทน"
                                            : row._tag === "old"
                                            ? "ทดแทนแล้ว"
                                            : "ไม่ทราบ"
                                        }}
                                      </v-chip>
                                    </td>
                                    <td class="td-ellipsis">
                                      {{ row.empName || row.emp_name }}
                                    </td>
                                  </tr>
                                </tbody>
                              </v-simple-table>
                            </div>
                          </div>
                        </div>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
  </div>
</template>

<script src="./deviceByDep.js"></script>
<style src="./deviceByDep.css"></style>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,100,0,0"
/>

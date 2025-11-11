<template>
  <v-container fluid class="pa-4 ma-0 fill-height">

    <v-layout v-if="loading" align-center justify-center style="width: 100%;">
      <v-progress-circular
        indeterminate
        color="primary"
        size="96"
        width="8"
      ></v-progress-circular
    ></v-layout>
    <!-- </v-container> -->

    <v-layout v-else column style="width: 100%;">
      <div>
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
              <v-col cols="12" sm="2" md="2">
                <v-select
                  v-model="selectedAssetComType"
                  :items="assetComType"
                  item-value="value"
                  item-text="name"
                  label="ประเภทย่อยทรัพย์สินคอมพิวเตอร์"
                  @change="toggleAssetComType"
                >
                </v-select>
              </v-col>
              <v-col cols="12" sm="2" md="2" align-self="center">
                <template>
                  <div class="text-center">
                    <v-checkbox
                      id="checkbox"
                      readonly
                      v-model="checked7"
                      @click="openDialog"
                      label="เฉพาะทรัพย์สินอายุ 7 ปี"
                    ></v-checkbox>

                    <v-dialog v-model="dialog" width="auto">
                      <v-card>
                        <div class="container">
                          <v-card-text xs12 mb-4>
                            <h4>กรุณากรอกรหัสผ่าน เพื่อใช้งาน Function นี้</h4>
                          </v-card-text>
                        </div>
                        <div class="container">
                          <v-text-field
                            id="passworTextField"
                            class="v-text-field-password centered-input"
                            xs12
                            mb-4
                            v-model="passwordField"
                            clearable
                            type="password"
                          >
                          </v-text-field>
                        </div>

                        <div v-if="wrongPassword" class="text-center">
                          <v-card-text class="text-warning" xs12 mb-4>
                            <h4>รหัสผ่านไม่ถูกต้อง!</h4>
                          </v-card-text>
                        </div>

                        <v-card-actions>
                          <v-btn color="primary" block @click="checked7year"
                            >Check</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </div>
                </template>
              </v-col>
              <v-col cols="12" sm="2" md="1" align-self="center">
                <v-btn
                  elevation="3"
                  @click="checkQuota"
                  id="searchButton"
                  color="primary"
                  >ตรวจสอบ
                </v-btn>
              </v-col>
              <v-col cols="12" sm="2" md="1" align-self="center">
                <v-btn
                  elevation="3"
                  @click="genQuotaReport"
                  id="genQuotaReportt"
                  color="primary"
                  >สร้างรายงาน</v-btn
                >
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <div>
          <template>
            <div>
              <VueHtml2pdf
                :show-layout="false"
                :float-layout="true"
                :enable-download="true"
                :preview-modal="true"
                :paginate-elements-by-height="1400"
                filename="modelCC"
                :pdf-quality="2"
                :manual-pagination="false"
                pdf-format="a4"
                pdf-orientation="portrait"
                pdf-content-width="800px"
                ref="html2Pdf"
                :html-to-pdf-options="{
                  margin: [5, 10, 5, 10],
                }"
              >
                <section slot="pdf-content">
                  <v-card-text>
                    <v-form>
                      <template v-if="showVRow">
                        <v-row>
                          <h5>{{ itemName }} - {{ checkQuotaResult }}</h5>
                        </v-row>
                        <v-row>
                          <H5
                            >พนักงานจำนวน {{ totalEmployeeResult }} คน -
                            ทรัพย์สินคอมพิวเตอร์จำนวน
                            {{ totalDeviceResult }} เครื่อง</H5
                          >
                        </v-row>
                      </template>
                    </v-form>

                    <v-row>
                      <v-col cols="12" sm="11" md="11">
                        <H5>พนักงานในสังกัด</H5
                        ><v-data-table
                          class="elevation-1"
                          :headers="employeeheaders"
                          :items="getEmployeeResult"
                          :hide-default-footer="true"
                          :items-per-page="-1"
                        >
                        </v-data-table>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="11" md="11"
                        ><H5>รายการทรัพย์สิน</H5>
                        <v-data-table
                          class="elevation-1 mytableReport"
                          :headers="deviceheaders"
                          :items="getDeviceResult"
                          sort-by="devReceivedDate"
                          :sort-desc="true"
                          :hide-default-footer="true"
                          :items-per-page="-1"
                        >
                        </v-data-table
                      ></v-col>
                    </v-row>
                  </v-card-text>
                </section>
              </VueHtml2pdf>
            </div>
          </template>
        </div>

        <v-card-text>
          <v-form>
            <template v-if="showVRow">
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <H3>พนักงานจำนวน {{ totalEmployeeResult }} คน</H3>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <H3
                    >ทรัพย์สินคอมพิวเตอร์จำนวน
                    {{ totalDeviceResult }} เครื่อง</H3
                  >
                </v-col> </v-row
              ><v-row>
                <v-col cols="12" sm="12" md="12">
                  <H3>{{ checkQuotaResult }}</H3>
                </v-col>
              </v-row>
            </template>
          </v-form>
        </v-card-text>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="12" md="4"
              ><H4 class="primary--text">พนักงานในสังกัด</H4
              ><v-data-table
                id="empTable"
                class="elevation-1 mytable"
                :headers="employeeheaders"
                :items="getEmployeeResult"
              >
              </v-data-table>
            </v-col>
            <v-col cols="12" sm="12" md="8"
              ><H4 class="primary--text">รายการทรัพย์สิน</H4>
              <v-data-table
                class="elevation-1 mytable"
                :headers="deviceheaders"
                :items="getDeviceResult"
                sort-by="devReceivedDate"
                :sort-desc="true"
              >
              </v-data-table
            ></v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-layout>
    <!-- </div> -->
  </v-container>
</template>

<script src="./checkQuota.js"></script>
<style src="./checkQuota.css"></style>

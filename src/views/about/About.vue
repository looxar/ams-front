<template>
  <div class="content">
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
          กรุณาเลือกขอบเขตการไฟฟ้าที่ต้องการค้นหา
        </v-alert>
      </div>
      <div>
        <v-alert
          :value="alert2"
          color="red"
          dark
          border="top"
          icon="mdi-home"
          transition="slide-y-transition"
        >
          กรุณาเลือกข้อมูลก่อนสร้าง PDF
        </v-alert>
      </div>
      <v-form>
        <v-row>
          <v-col cols="12" sm="5" md="3">
            <v-container fluid class="mt-2 mr-0 pr-0">
              <treeselect
                :multiple="false"
                :options="optionBranches"
                placeholder="โปรดเลือกการไฟฟ้า"
                :class="treeselectClass"
                v-model="value"
                v-on:select="treeselectChange"
              >
                <label
                  slot="option-label"
                  slot-scope="{ node, labelClassName }"
                  :class="labelClassName"
                >
                  <v-icon>{{ node.raw.icon }}</v-icon>
                  | {{ node.label }}
                </label>
              </treeselect>
              <treeselect-value :value="value" />
            </v-container>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-container fluid>
              <v-row>
                <v-text-field v-model="textSearch" label="ค้นหา"></v-text-field>
              </v-row>
            </v-container>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-container fluid>
              <v-row>
                <v-select
                  v-model="selectedAssetType"
                  :items="assetType"
                  item-value="value"
                  item-text="name"
                  label="ประเภททรัพย์สิน"
                  @change="toggleAssetType"
                >
                </v-select>
              </v-row>
            </v-container>
          </v-col>

          <v-col cols="12" sm="3" md="1">
            <v-container>
              <v-row>
                <v-btn
                  elevation="3"
                  @click="searchFunction"
                  id="searchButton"
                  color="primary"
                >
                  <v-icon medium class="mr-2 v-white"> mdi-magnify </v-icon>
                  <!-- <i class="nc-icon nc-zoom-split mr-2"></i> -->
                  Serach</v-btn
                >
              </v-row>
            </v-container>
          </v-col>

          <v-col cols="12" sm="3" md="2">
            <v-container>
              <v-row>
                <v-btn color="primary">
                  <download-excel
                    :fetch="fetchData2"
                    :data="dataExcel"
                    :fields="excelHeaders"
                    worksheet="My Worksheet"
                    name="filename.xls"
                  >
                    <v-icon medium class="mr-2 v-white">
                      mdi-microsoft-excel
                    </v-icon>
                    Export Excel
                  </download-excel>
                </v-btn>
              </v-row>
            </v-container>
          </v-col>

          <v-col cols="12" sm="3" md="1">
            <v-container>
              <v-row>
                <v-btn
                  elevation="3"
                  @click="generateReport"
                  id="searchButton"
                  color="primary"
                >
                  <v-icon medium class="mr-2 v-white"> mdi-qrcode </v-icon>
                  QR_Code</v-btn
                >
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-form>
    </div>

    <div>
      <template>
        <div>
          <!-- <VueHtml2pdf
            :show-layout="false"
            :float-layout="true"
            :enable-download="true"
            :preview-modal="true"
            :paginate-elements-by-height="1400"
            filename="myPDF"
            :pdf-quality="2"
            :manual-pagination="false"
            pdf-format="a4"
            pdf-orientation="portrait"
            pdf-content-width="800px"
            ref="html2Pdf"
            :html-to-pdf-options="{
              margin: [5, 10, 5, 10],
            }"
          > -->
          <Vue-Html2pdf
            :show-layout="false"
            :float-layout="true"
            :enable-download="true"
            :preview-modal="true"
            :paginate-elements-by-height="280"
            filename="myPDF"
            :pdf-quality="2"
            :manual-pagination="false"
            ref="html2Pdf"
            :html-to-pdf-options="{
              margin: [2, 1, 1, 1],
              jsPDF: {
                format: ('l', 'mm', [100, 75]),
                orientation: 'landscape',
              },
            }"
          >
            <section slot="pdf-content">
              <!-- <b-table class="paddingBetweenRows" > -->
              <b-table width="377px">
                <tr
                  id="pdf_tr"
                  style="text-align: center"
                  v-for="item in Math.ceil(qrcode_value2.length)"
                  v-bind:key="item.devPeaNo"
                  heigh="280px"
                  class="html2pdf__page-break"
                >
                  <section class="pdf-item">
                    <!-- <td rowspan="2"> -->
                    <table class="no-spacing">
                      <tr>
                        <td rowspan="5" width="40%">
                          <qrcode-vue
                            :value="qrcode_value2[item - 1]"
                            :size="qrcode_size"
                            level="H"
                          ></qrcode-vue>
                        </td>
                        <td width="20%" class="text-right">ทรัพย์สิน</td>
                        <td width="40%">
                          {{ JSON.parse(detail_value[item - 1]).devPeaNo }}
                        </td>
                      </tr>
                      <tr>
                        <td width="20%" class="text-right">การได้มา</td>
                        <td width="40%">
                          {{
                            JSON.parse(detail_value[item - 1]).devReceivedPrice
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td width="20%" class="text-right">ตามบัญชี</td>
                        <td width="40%">
                          {{ JSON.parse(detail_value[item - 1]).devLeftPrice }}
                        </td>
                      </tr>
                      <tr>
                        <td width="20%" class="text-right">ศูนย์ต้นทุน</td>
                        <td width="40%">
                          {{ JSON.parse(detail_value[item - 1]).ccLongCode }}
                        </td>
                      </tr>
                      <tr>
                        <td width="20%" class="text-right">สังกัด</td>
                        <td width="40%">
                          {{ JSON.parse(detail_value[item - 1]).ccShortName }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" class="text-right">โอนเข้าเป็นทุน</td>
                        <td width="40%">
                          {{
                            JSON.parse(detail_value[item - 1]).devReceivedDate
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" class="text-right">
                          {{ JSON.parse(detail_value[item - 1]).empName }}
                        </td>
                        <td width="40%">
                          {{ JSON.parse(detail_value[item - 1]).empId }}
                        </td>
                      </tr>
                      <tr>
                        <td>หมายเลขผลิตภัณฑ์</td>
                        <td width="60%" colspan="2">
                          <!-- {{ JSON.parse(detail_value[item - 1]).devSerialNo }} -->
                          1234567890ABCDEFGH
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3" class="wrap">
                          {{
                            JSON.parse(detail_value[item - 1]).devDescription
                          }}
                        </td>
                      </tr>

                      <!-- <tr>
                          <div class="html2pdf__page-break"></div>
                      </tr> -->
                    </table>
                  </section>
                </tr>
              </b-table>
            </section>
          </Vue-Html2pdf>
        </div>
      </template>
    </div>
    <!-- :footer-props="footerProps"
      @update:items-per-page="getItemPerPage" -->
    <v-data-table
      :headers="headers"
      :items="data1"
      :footer-props="footerProps"
      :items-per-page="itemsPerPage"
      multi-sort
      :loading="myloadingvariable"
      loading-text="Loading... Please wait"
      class="elevation-5 mytable ma-0 pa-0"
      v-model="selected"
      show-select
      @input="enterSelect()"
    >
      <!-- :server-items-length="totalItems" -->
      <!-- :footer-props="{ 'items-per-page-options': [30, 50, 100] }" -->
      <template v-slot:top>
        <v-toolbar flat>
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <qrcode-vue
                      :value="qrcode_value"
                      :size="qrcode_size"
                      level="H"
                    ></qrcode-vue>
                    <H1> {{ formDevPeaNo }} </H1>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogFixForm" max-width="800px">
            <v-card>
              <v-card-title class="text-h5"
                >เชื่อมต่อไปยังหน้าแจ้งซ่อม</v-card-title
              >
              <v-card-text>
                <v-simple-table>
                  <thead>
                    <tr>
                      <th class="text-left">Field</th>
                      <th class="text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>cost_center_name</td>
                      <td>
                        <v-text-field v-model="formData.ccShortName" />
                      </td>
                    </tr>
                    <tr>
                      <td>date</td>
                      <td><v-text-field v-model="formData.date" /></td>
                    </tr>
                    <tr>
                      <td>type_other</td>
                      <td><v-text-field v-model="formData.type_other" /></td>
                    </tr>
                    <tr>
                      <td>brand</td>
                      <td><v-text-field v-model="formData.brand" /></td>
                    </tr>
                    <tr>
                      <td>model</td>
                      <td>
                        <v-text-field v-model="formData.devDescription" />
                      </td>
                    </tr>
                    <tr>
                      <td>contract</td>
                      <td><v-text-field v-model="formData.contract" /></td>
                    </tr>
                    <tr>
                      <td>serial</td>
                      <td><v-text-field v-model="formData.devSerialNo" /></td>
                    </tr>
                    <tr>
                      <td>pea_no</td>
                      <td><v-text-field v-model="formData.devPeaNo" /></td>
                    </tr>
                    <tr>
                      <td>problem</td>
                      <td><v-text-field v-model="formData.problem" /></td>
                    </tr>
                    <tr v-if="showErrorProblem" class="error-box">
                      <td></td>
                      <td>Problem is required.</td>
                    </tr>
                    <tr>
                      <td>emp_name</td>
                      <td>
                        <v-text-field
                          v-if="formData.empName"
                          v-model="formData.empName"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>emp_role</td>
                      <td>
                        <v-text-field
                          v-if="formData.empRank"
                          v-model="formData.empRank"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>emp_id</td>
                      <td>
                        <v-text-field
                          v-if="formData.empId"
                          v-model="formData.empId"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>tel</td>
                      <td><v-text-field v-model="formData.tel" /></td>
                    </tr>
                    <!-- <tr>
                      <td>inspector_name</td>
                      <td>
                        <v-text-field v-model="formData.inspector_name" />
                      </td>
                    </tr>
                    <tr>
                      <td>inspector_role</td>
                      <td>
                        <v-text-field v-model="formData.inspector_role" />
                      </td>
                    </tr> -->
                    <tr>
                      <td>ผู้ตรวจสอบ (inspector)</td>
                      <td>
                        <treeselect
                          :multiple="false"
                          :options="inspectorList"
                          placeholder="โปรดเลือกผู้ตรวจสอบ"
                          :class="treeselectClass"
                          v-model="selectedInspector"
                          @select="handleInspectorSelect"
                        >
                          <label
                            slot="option-label"
                            slot-scope="{ node, labelClassName }"
                            :class="labelClassName"
                          >
                            <v-icon small>{{ node.raw.icon }}</v-icon>
                            | {{ node.id }} {{ node.label }} {{ node.raw.role }}
                          </label>
                        </treeselect>
                      </td>
                    </tr>
                    <tr v-if="showErrorInspector" class="error-box">
                      <td></td>
                      <td>กรุณาเลือกผู้ตรวจสอบ</td>
                    </tr>
                    <tr>
                      <td>ตำแหน่งผู้ตรวจสอบ (role)</td>
                      <td>
                        <v-text-field
                          v-model="formData.inspector_role"
                          readonly
                          placeholder="จะเติมอัตโนมัติจากการเลือกผู้ตรวจสอบ"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>inspector_date</td>
                      <td>
                        <v-text-field v-model="formData.inspector_date" />
                      </td>
                    </tr>
                    <!-- <tr>
                      <td>dep_head_name</td>
                      <td><v-text-field v-model="formData.dep_head_name" /></td>
                    </tr>
                    <tr>
                      <td>dep_head_role</td>
                      <td><v-text-field v-model="formData.dep_head_role" /></td>
                    </tr> -->
                    <tr>
                      <td>หัวหน้าผู้ตรวจสอบ</td>
                      <td>
                        <treeselect
                          :multiple="false"
                          :options="depHeadList"
                          placeholder="โปรดเลือกผู้ตรวจสอบ"
                          :class="treeselectClass"
                          v-model="selectedDepHead"
                          @select="handleDepHeadSelect"
                          :normalizer="
                            (node) => ({ id: node.id, label: node.label })
                          "
                        >
                          <label
                            slot="option-label"
                            slot-scope="{ node, labelClassName }"
                            :class="labelClassName"
                          >
                            <v-icon small>{{ node.raw.icon }}</v-icon>
                            | {{ node.id }} {{ node.label }} {{ node.raw.role }}
                            <!-- <p>Selected: {{ selectedDepHead?.role || '-' }}</p> -->
                          </label>
                        </treeselect>
                      </td>
                    </tr>
                    <tr v-if="showErrorDepHead" class="error-box">
                      <td></td>
                      <td>กรุณาเลือกหัวหน้าผู้ตรวจสอบ</td>
                    </tr>
                    <tr>
                      <td>ตำแหน่งหัวหน้าผู้ตรวจสอบ</td>
                      <td>
                        <v-text-field
                          v-model="formData.dep_head_role"
                          readonly
                          placeholder="จะเติมอัตโนมัติจากการเลือกผู้ตรวจสอบ"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>dep_head_date</td>
                      <td><v-text-field v-model="formData.dep_head_date" /></td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeFixForm"
                  >Cancel</v-btn
                >
                <v-btn color="blue darken-1" text @click="genFixFormReport"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template>
        <VueHtml2pdf
          :show-layout="false"
          :float-layout="true"
          :enable-download="true"
          :preview-modal="true"
          :paginate-elements-by-height="1400"
          filename="editedItem"
          :pdf-quality="2"
          :manual-pagination="false"
          pdf-format="a4"
          pdf-orientation="portrait"
          pdf-content-width="750px"
          ref="html2Pdf"
          :html-to-pdf-options="{
            margin: [10, 10, 10, 10],
          }"
        >
          <section slot="pdf-content">
            <h2>เอกสารแจ้งซ่อม</h2>

            <!-- <div class="section">
                  <p>
                    จาก <span class="input-line"></span> ถึง
                    <span class="input-line">กดส.ฉ.2</span>
                  </p>
                  <p>
                    เลขที่ <span class="input-line"></span> วันที่
                    <span class="input-line"></span>
                  </p>
                </div>

                <div class="section">
                  <p>เรื่อง: ขอให้จัดซ่อมเครื่องคอมพิวเตอร์ และอุปกรณ์ประกอบ</p>
                  <p>เรียน: หผ.คข</p>
                  <p>"ขอแจ้งเครื่องชำรุดเพื่อส่งซ่อมตามรายการดังนี้:"</p>

                  <div class="checkbox-group">
                    <label><input type="checkbox" /> CPU</label>
                    <label><input type="checkbox" /> Monitor</label>
                    <label><input type="checkbox" /> Printer</label>
                    <label><input type="checkbox" /> UPS</label>
                  </div>
                  <p>
                    ยี่ห้อ <span class="input-line"></span> รุ่น
                    <span class="input-line"></span> สัญญาเลขที่
                    <span class="input-line"></span>
                  </p>
                  <p>
                    รหัสเครื่อง
                    <span class="input-line"></span> รหัสทรัพย์สิน
                    <span class="input-line"></span>
                  </p>
                  <p>
                    <label><input type="checkbox" /> อยู่</label>
                    <label
                      ><input type="checkbox" /> ไม่อยู่ในสัญญารับประกัน</label
                    >
                  </p>
                  <p>
                    อาการ:
                    <span class="input-line" style="width: 400px"></span>
                  </p>
                </div>

                <div class="section">
                  <p>
                    อื่นๆ
                    <span class="input-line" style="width: 400px"></span>
                  </p>
                  <p>สัญญาเลขที่ <span class="input-line"></span></p>
                  <p>
                    รหัสเครื่อง
                    <span class="input-line"></span> รหัสทรัพย์สิน
                    <span class="input-line"></span>
                  </p>
                  <p>
                    <label><input type="checkbox" /> อยู่</label>
                    <label
                      ><input type="checkbox" /> ไม่อยู่ในสัญญารับประกัน</label
                    >
                  </p>
                  <p>
                    อาการ:
                    <span class="input-line" style="width: 400px"></span>
                  </p>
                  <p>
                    ซึ่งติดตั้งใช้งานที่
                    <span class="input-line" style="width: 400px"></span>
                  </p>
                </div>

                <div class="section">
                  <p>
                    ในกรณีที่ไม่อยู่ในสัญญารับประกัน ขอให้ กดส.ฉ.2 ดำเนินการซ่อม
                    และตัดงบค่าใช้จ่ายจากศูนย์ต้นทุนของ
                    <span class="input-line" style="width: 300px"
                      >E301023000</span
                    >
                    รหัสบัญชี <span class="input-line">53051060</span>
                  </p>
                  <p>จึงเรียนมาเพื่อโปรดแจ้งผู้เกี่ยวข้องดำเนินการต่อไปด้วย</p>
                  <div class="signature">
                    ชื่อ-สกุล
                    <span class="input-line"
                      >(.......................................................)</span
                    ><br />
                    ตำแหน่ง <span class="input-line"></span> รหัสพนักงาน
                    <span class="input-line"></span><br />
                    เบอร์โทรติดต่อกลับ <span class="input-line"></span>
                  </div>
                </div>

                <div class="section">
                  <p>การตรวจสอบอุปกรณ์ก่อนส่งซ่อม (ผคข.กดส.ฉ.2)</p>
                  <p>
                    ................................................................................................................
                  </p>
                  <div class="signature">
                    ผู้รับเครื่อง/ตรวจสอบ
                    <span class="input-line"
                      >(....................................................)</span
                    ><br />
                    ตำแหน่ง <span class="input-line"></span><br />
                    <span class="input-line"
                      >....................../.............../................</span
                    >
                  </div>
                </div>

                <div class="section">
                  <p>เรียน อก.ดส.ฉ.2</p>
                  <p>ดำเนินการซ่อมโดยวิธี:</p>
                  <div class="checkbox-group">
                    <label
                      ><input type="checkbox" /> จัดซื้ออุปกรณ์มาเปลี่ยน
                      เนื่องจาก
                      <span
                        class="input-line"
                        style="width: 400px"
                      ></span></label
                    ><br />
                    <label
                      ><input type="checkbox" /> ส่งให้บริษัทดำเนินการ เนื่องจาก
                      <span
                        class="input-line"
                        style="width: 400px"
                      ></span></label
                    ><br />
                    <label
                      ><input type="checkbox" /> ไม่ดำเนินการซ่อม เนื่องจาก
                      <span class="input-line" style="width: 400px"></span
                    ></label>
                  </div>
                  <div class="signature">
                    เพื่อโปรดพิจารณา อนุมัติ<br />
                    <span class="input-line"
                      >(....................................................)</span
                    ><br />
                    ตำแหน่ง <span class="input-line"></span><br />
                    <span class="input-line"
                      >.................../.............../................</span
                    >
                  </div>
                </div>

                <div class="section">
                  <p>ที่ ฉ.2กดส.(คข.)........../2567</p>
                  <div class="signature">
                    อนุมัติ<br />
                    <span class="input-line"
                      >(....................................................)</span
                    ><br />
                    ตำแหน่ง <span class="input-line"></span><br />
                    <span class="input-line"
                      >.................../.............../................</span
                    >
                  </div>
                </div> -->
          </section>
        </VueHtml2pdf>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon medium class="mr-2" @click="editItem(item)">
          mdi-qrcode-scan
        </v-icon>
        <v-icon medium @click="showFixForm(item)">
          mdi-folder-wrench-outline
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script src="./About.js"></script>
<style src="./about.css"></style>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,100,0,0"
/>

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

      <v-row dense class="px-4">
        <v-col cols="12" class="px-4 mb-4" lg="5" md="6" sm="12">
          <v-card outlined class="stat-card ml-4">
            <div class="stat-icon">
              <v-icon size="36" color="white">mdi-laptop</v-icon>
            </div>

            <v-card-title
              class="stat-card-title ml-8 pl-16 primary--text text--darken-1"
            >
              ภาพรวมคอมพิวเตอร์
            </v-card-title>

            <v-card-text class="pt-0 pb-0 pl-8">
              <v-list dense class="stat-list">
                <v-list-item class="stat-list-item">
                  <v-list-item-content>
                    <v-list-item-title class="list-title">
                      จำนวนคอมพิวเตอร์ในระบบ
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--primary">
                      {{ overall.totalRecords }} เครื่อง
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="list-title">
                      คอมพิวเตอร์ใหม่ (ปี 2561 -ขึ้นไป)
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--success">
                      <!-- {{ totalDeviceCounts.new }} เครื่อง -->
                      {{ overall.newCount }} เครื่อง
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="list-title">
                      คอมพิวเตอร์เก่า (≤ 2560)
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--warning">
                      <!-- {{ totalDeviceCounts.oldOrUnknown }} เครื่อง -->
                      {{ overall.oldCount + overall.unknownCount }} เครื่อง
                    </div>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" class="px-4 mb-4" lg="6" md="6" sm="12">
          <v-card outlined class="stat-card ml-4">
            <div class="stat-icon">
              <v-icon size="36" color="white">mdi-account-group</v-icon>
            </div>

            <v-card-title
              class="stat-card-title ml-4 pl-16 primary--text text--darken-1"
            >
              สถานะการครอบครองคอมพิวเตอร์ (ระดับพนักงาน)
            </v-card-title>
            <v-card-text class="pt-0 pb-0 pl-8">
              <v-list dense class="stat-list">
                <v-list-item class="stat-list-item">
                  <v-list-item-content>
                    <v-list-item-title class="list-title">
                      จำนวนพนักงานทั้งหมด
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--primary">
                      {{ itemsEmp.length }} คน
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <!-- <v-divider class="my-2"></v-divider> -->

                <v-list-item
                  class="summary-clickable"
                  :class="{
                    'summary-active': employeeViewMode === 'emp-no-new',
                  }"
                  @click="setEmployeeViewModeAndScroll('emp-no-new')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      พนักงานที่มีคอมพิวเตอร์ใหม่ อย่างน้อย 1 เครื่อง
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      พนักงานที่มีคอมพิวเตอร์ใหม่ อย่างน้อย 1 เครื่อง
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--success">
                      {{ newDeviceOwners.length }} คน
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item
                  class="summary-clickable"
                  :class="{
                    'summary-active': employeeViewMode === 'emp-has-new',
                  }"
                  @click="setEmployeeViewModeAndScroll('emp-has-new')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      พนักงานที่ยังไม่มีคอมพิวเตอร์ใหม่ (≥ 2561)
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      พนักงานที่ยังไม่มีคอมพิวเตอร์ใหม่ (≥ 2561)
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--warning">
                      {{ oldOnlyEmployees.length }} คน
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <!-- clickable 3: emp-no-any -->
                <v-list-item
                  class="summary-clickable"
                  :class="{
                    'summary-active': employeeViewMode === 'emp-no-any',
                  }"
                  @click="setEmployeeViewModeAndScroll('emp-no-any')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      ในกลุ่มข้างต้น: ไม่มีคอมพิวเตอร์เลย (ทั้งใหม่และเก่า)
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      ในกลุ่มข้างต้น: ไม่มีคอมพิวเตอร์เลย (ทั้งใหม่และเก่า)
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--cyan">
                      {{ empNotOwnAnyDevice.length }} คน
                    </div>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense class="px-4">
        <v-col cols="12" class="px-4 mb-4" lg="5" md="6" sm="12">
          <v-card outlined class="stat-card ml-4">
            <div class="stat-icon">
              <v-icon size="36" color="white">mdi-office-building</v-icon>
            </div>

            <v-card-title
              class="stat-card-title ml-4 pl-16 primary--text text--darken-1"
            >
              <div class="d-flex align-center">
                สถานะจำนวนคอมพิวเตอร์เทียบระดับแผนก
              </div>
            </v-card-title>
            <v-card-text class="pt-0 pb-0 pl-8">
              <v-list dense class="stat-list">
                <v-list-item
                  class="summary-clickable stat-list-item"
                  :class="{ 'summary-active': deptViewMode === 'all-ge' }"
                  @click="setDeptViewModeAndScroll('all-ge')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      แผนกที่ “คอมทั้งหมด” ≥ พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      แผนกที่ “คอมทั้งหมด” ≥ พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--primary">
                      {{ deptCompareSummary.totalGeEmp }} แผนก
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <!-- clickable item2: all-lt -->
                <v-list-item
                  class="summary-clickable"
                  :class="{ 'summary-active': deptViewMode === 'all-lt' }"
                  @click="setDeptViewModeAndScroll('all-lt')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      แผนกที่ “คอมทั้งหมด” &lt; พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      แผนกที่ “คอมทั้งหมด” &lt; พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--warning">
                      {{ deptCompareSummary.totalLtEmp }} แผนก
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <!-- <v-divider class="my-2"></v-divider> -->

                <v-list-item
                  class="summary-clickable"
                  :class="{ 'summary-active': deptViewMode === 'new-ge' }"
                  @click="setDeptViewModeAndScroll('new-ge')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      แผนกที่ “คอมพิวเตอร์ใหม่” ≥ พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      แผนกที่ “คอมพิวเตอร์ใหม่” ≥ พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      (คอมพิวเตอร์ใหม่ นับตั้งแต่ปี 2561 ขึ้นไป)
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--success">
                      {{ deptCompareSummary.newGeEmp }} แผนก
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item
                  class="summary-clickable"
                  :class="{ 'summary-active': deptViewMode === 'new-lt' }"
                  @click="setDeptViewModeAndScroll('new-lt')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      แผนกที่ “คอมพิวเตอร์ใหม่” &lt; พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      แผนกที่ “คอมพิวเตอร์ใหม่” &lt; พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      (คอมพิวเตอร์ใหม่ นับตั้งแต่ปี 2561 ขึ้นไป)
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--cyan">
                      {{ deptCompareSummary.newLtEmp }} แผนก
                    </div>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" class="px-4 mb-4" lg="6" md="6" sm="12">
          <v-card outlined class="stat-card ml-4">
            <div class="stat-icon">
              <v-icon size="36" color="white">mdi-home-city</v-icon>
            </div>
            <v-card-title
              class="stat-card-title ml-4 pl-16 primary--text text--darken-1"
            >
              <div class="d-flex align-center">
                สถานะจำนวนคอมพิวเตอร์เทียบระดับ กอง/กฟฟ.
              </div>
            </v-card-title>
            <v-card-text class="pt-0 pb-0 pl-8">
              <v-list dense class="stat-list">
                <v-list-item
                  class="summary-clickable stat-list-item"
                  :class="{ 'summary-active': divViewMode === 'all-ge' }"
                  @click="setDivViewModeAndScroll('all-ge')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      กอง/กฟฟ. ที่ “คอมทั้งหมด” ≥ พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      กอง/กฟฟ. ที่ “คอมทั้งหมด” ≥ พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--primary">
                      {{ divisionCompareSummary.totalGeEmp }} หน่วยงาน
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item
                  class="summary-clickable"
                  :class="{ 'summary-active': divViewMode === 'all-lt' }"
                  @click="setDivViewModeAndScroll('all-lt')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      กอง/กฟฟ. ที่ “คอมทั้งหมด” &lt; พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      กอง/กฟฟ. ที่ “คอมทั้งหมด” &lt; พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--warning">
                      {{ divisionCompareSummary.totalLtEmp }} หน่วยงาน
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <!-- <v-divider class="my-2"></v-divider> -->

                <v-list-item
                  class="summary-clickable"
                  :class="{ 'summary-active': divViewMode === 'new-ge' }"
                  @click="setDivViewModeAndScroll('new-ge')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      กอง/กฟฟ. ที่ “คอมใหม่ (≥ 2561)” ≥ พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      กอง/กฟฟ. ที่ “คอมใหม่ (≥ 2561)” ≥ พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      (คอมพิวเตอร์ใหม่ นับตั้งแต่ปี 2561 ขึ้นไป)
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--success">
                      {{ divisionCompareSummary.newGeEmp }} หน่วยงาน
                    </div>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item
                  class="summary-clickable"
                  :class="{ 'summary-active': divViewMode === 'new-lt' }"
                  @click="setDivViewModeAndScroll('new-lt')"
                >
                  <v-list-item-content>
                    <!-- <v-list-item-title class="list-title text-body-2">
                      กอง/กฟฟ. ที่ “คอมใหม่ (≥ 2561)” &lt; พนักงาน
                    </v-list-item-title> -->
                    <v-list-item-title class="list-title d-flex align-center">
                      กอง/กฟฟ. ที่ “คอมใหม่ (≥ 2561)” &lt; พนักงาน
                      <v-icon small class="ml-2" color="primary">
                        mdi-magnify
                      </v-icon>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      (คอมพิวเตอร์ใหม่ นับตั้งแต่ปี 2561 ขึ้นไป)
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <div class="action-gradient action-gradient--cyan">
                      {{ divisionCompareSummary.newLtEmp }} หน่วยงาน
                    </div>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12">
          <v-card
            class="card-top-border"
            v-if="detailMode === 'dept'"
            ref="surplusSection"
          >
            <v-card-title class="subtitle-1 font-weight-bold card-top-border">
              <v-icon left color="teal">mdi-view-list</v-icon>
              {{ deptViewLabel }}
              <v-btn
                small
                color="success"
                class="ml-2 mb-2"
                @click="exportDeptToExcel"
              >
                <v-icon left>mdi-file-excel</v-icon>
                Export Excel
              </v-btn>
            </v-card-title>

            <v-card-text
              ><v-row dense>
                <!-- 🔍 Search bar -->
                <v-text-field
                  v-model="surplusSearch"
                  label="ค้นหาแผนก / รหัส / กฟฟ. / ภาค"
                  dense
                  clearable
                  prepend-inner-icon="mdi-magnify"
                  class="mb-0"
                ></v-text-field>

                <div class="mt-0">
                  <small class="grey--text">
                    คลิกที่แถวเพื่อเลื่อนไปยังรายละเอียดแผนกด้านล่าง
                  </small>
                </div></v-row
              >
              <div class="scroll-table-10 mt-2">
                <v-simple-table dense>
                  <thead>
                    <tr>
                      <th>กลุ่มหน่วยงาน</th>
                      <th>รหัสแผนก</th>
                      <th>ชื่อแผนก</th>
                      <th>พนักงาน</th>
                      <th>คอมทั้งหมด</th>
                      <th>คอมใหม่ (≥ 2561)</th>
                      <th>
                        ส่วนต่าง ({{
                          deptMetricKey === "all"
                            ? "คอมทั้งหมด - พนักงาน"
                            : "คอมใหม่ - พนักงาน"
                        }})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="d in filteredDeptRows"
                      :key="d.ccLongCode"
                      class="clickable-row"
                      @click="jumpToCc(d.ccLongCode)"
                    >
                      <td>{{ d.divisionCode }}</td>
                      <td>{{ d.ccLongCode }}</td>
                      <td>{{ d.ccShortName }}</td>
                      <td>{{ d.empCount }}</td>
                      <td>
                        {{ d.allItemsCount }}
                      </td>
                      <td>
                        {{ d.newItemsCount }}
                      </td>
                      <td
                        :class="{
                          'green--text':
                            (deptMetricKey === 'all' ? d.diffAll : d.diffNew) >
                            0,
                          'red--text':
                            (deptMetricKey === 'all' ? d.diffAll : d.diffNew) <
                            0,
                        }"
                      >
                        {{ deptMetricKey === "all" ? d.diffAll : d.diffNew }}
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </div>
            </v-card-text>
          </v-card>

          <v-card
            class="card-top-border"
            v-if="detailMode === 'div'"
            ref="divisionSection"
          >
            <v-card-title class="subtitle-1 font-weight-bold card-top-border">
              <v-icon left color="teal">mdi-view-list</v-icon>
              {{ divViewLabel }}
            </v-card-title>

            <v-card-text
              ><v-row dense>
                <!-- 🔍 Search bar -->
                <v-text-field
                  v-model="surplusSearch"
                  label="ค้นหาแผนก / รหัส / กฟฟ. / ภาค"
                  dense
                  clearable
                  prepend-inner-icon="mdi-magnify"
                  class="mb-0"
                ></v-text-field>
                <div class="mt-0">
                  <small class="grey--text">
                    คลิกที่แถวเพื่อเลื่อนไปยังรายละเอียดแผนกด้านล่าง
                  </small>
                </div></v-row
              >
              <div class="scroll-table-10 mt-2">
                <v-simple-table class="custom-table">
                  <thead>
                    <tr>
                      <th>กลุ่มหน่วยงาน</th>
                      <th>ชื่อหน่วยงาน</th>
                      <th>พนักงาน</th>
                      <th>
                        {{
                          divMetricKey === "all"
                            ? "คอมทั้งหมด"
                            : "คอมใหม่ (≥ 2561)"
                        }}
                      </th>
                      <th>
                        ส่วนต่าง ({{
                          divMetricKey === "all"
                            ? "คอมทั้งหมด - พนักงาน"
                            : "คอมใหม่ - พนักงาน"
                        }})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="d in displayedDivRows"
                      :key="`${d.regionKey}-${d.divisionCode}`"
                      class="clickable-row"
                      @click="jumpToCc(d.ccLongCode)"
                    >
                      <td>{{ d.divisionCode }}</td>
                      <td>{{ d.divisionName }}</td>
                      <td>{{ d.empCount }}</td>
                      <td v-if="divMetricKey === 'all'">
                        {{ d.allItemsCount }}
                      </td>
                      <td v-else>{{ d.newItemsCount }}</td>
                      <td
                        :class="{
                          'green--text': d.diff > 0,
                          'red--text': d.diff < 0,
                        }"
                      >
                        {{ d.diff }}
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </div>
            </v-card-text>
          </v-card>

          <v-card
            outlined
            class="mt-4"
            v-if="detailMode === 'emp'"
            ref="employeeSection"
          >
            <v-card-title class="subtitle-1 font-weight-bold">
              <v-icon left color="deep-orange">mdi-account-search</v-icon>
              {{ employeeViewLabel }}
            </v-card-title>

            <v-card-text>
              <v-row dense>
                <v-text-field
                  v-model="employeeSearch"
                  label="ค้นหาด้วยรหัสพนักงาน / ชื่อ / แผนก"
                  dense
                  clearable
                  prepend-inner-icon="mdi-magnify"
                  class="mb-2"
                ></v-text-field>
                <div class="mt-0">
                  <small class="grey--text">
                    คลิกที่แถวเพื่อเลื่อนไปยังรายละเอียดแผนกด้านล่าง
                  </small>
                </div>
              </v-row>
              <div class="scroll-table-10 mt-2">
                <v-simple-table dense>
                  <thead>
                    <tr>
                      <th>รหัสพนักงาน</th>
                      <th>ชื่อพนักงาน</th>
                      <th>แผนก</th>
                      <th>รหัสแผนก</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="e in employeeSearchFilteredRows"
                      :key="e.empId"
                      class="clickable-row"
                      @click="jumpToCc(e.ccLongCode)"
                    >
                      <td>{{ e.empId }}</td>
                      <td>{{ e.empName }}</td>
                      <td>{{ e.empDep_full || "-" }}</td>
                      <td>{{ e.ccLongCode || "-" }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card-text class="px-12 py-0 mx-3 sticky">
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
              <!-- class="custom-button purple--text" -->
              <v-btn
                elevation="3"
                @click="checkQuotaByDep"
                id="searchButton"
                class="custom-button purple--text"
                ><v-icon medium class="mr-2 v-purple"> mdi-magnify </v-icon>
                <h5 class="mt-2 text--darken-2"><b>ตรวจสอบ</b></h5>
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
                    {{
                      reg.regionKey === "E301-CEO"
                        ? "กลุ่มบริหาร กฟจ.CEO"
                        : (reg.firstDept && reg.firstDept.ccShortName) || "—"
                    }}
                    <!-- {{ (reg.firstDept && reg.firstDept.ccShortName) || "—" }} -->
                  </b>
                  <span class="ml-2">
                    {{
                      reg.regionKey ||
                      (reg.firstDept && reg.firstDept.ccLongCode)
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
                    <!-- ✅ Division PDF button -->
                    <div class="text-left">
                      <v-btn icon @click.stop.prevent="openDivisionPdf(div)">
                        <v-badge content="DIV" color="green darken-2" overlap>
                          <v-icon size="28"> mdi-file-pdf-box </v-icon>
                        </v-badge>
                      </v-btn>
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
                          'jump-highlight':
                            highlightedCc === String(dept.ccLongCode).trim(),
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
                          <!-- ✅ PDF button -->
                          <div class="text-right">
                            <v-btn
                              icon
                              color="purple darken-1"
                              @click.stop="openDeptPdf(dept)"
                            >
                              <v-icon size="28">mdi-file-pdf-box</v-icon>
                            </v-btn>
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
                                    <th class="text-left">รหัสพนักงาน</th>
                                    <th class="text-left">ชื่อพนักงาน</th>
                                    <th class="text-left">ตำแหน่ง</th>
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
                                      {{
                                        row.devDescription ||
                                        row.dev_description
                                      }}
                                    </td>
                                    <td class="td-ellipsis">
                                      {{
                                        row.devReceivedDate ||
                                        row.dev + recieved_date
                                      }}
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
      <v-fab-transition>
        <v-btn
          v-if="showBackToTop"
          fab
          dark
          color="primary"
          fixed
          bottom
          right
          class="ma-4"
          @click="scrollBackToSuggestions"
        >
          <v-icon>mdi-arrow-up</v-icon>
        </v-btn>
      </v-fab-transition>
    </v-row>
  </div>
</template>

<script src="./deviceByDep.js"></script>
<style src="./deviceByDep.css"></style>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,100,0,0"
/>

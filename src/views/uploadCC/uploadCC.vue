<template>
  <v-container fluid class="pa-4 ma-0 fill-height">
    <v-layout v-if="loading" align-center justify-center style="width: 100%">
      <v-progress-circular
        indeterminate
        color="primary"
        size="96"
        width="8"
      ></v-progress-circular
    ></v-layout>

    <v-layout v-else column style="width: 100%">
      <div>
        <div>
          <v-alert
            :value="alert"
            color="red"
            dark
            border="top"
            icon="mdi-file-alert"
            transition="slide-y-transition"
          >
            กรุณาเลือกไฟล์ Excel (.xls หรือ .xlsx) เท่านั้น
          </v-alert>
        </div>
        <input
          type="file"
          ref="fileInput"
          @change="onFileSelected"
          style="display: none"
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
        <v-form>
          <v-row>
            <v-col cols="12" sm="none" md="1"> </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-container fluid>
                <v-row class="mt-2">
                  <v-btn
                    elevation="3"
                    color="primary"
                    @click="triggerFileSelect"
                  >
                    <v-icon medium class="mr-2 v-white">mdi-file-upload</v-icon>
                    Choose File
                  </v-btn>
                </v-row>
              </v-container>
            </v-col>

            <v-col cols="12" sm="8" md="4">
              <v-container fluid>
                <v-row>
                  <v-text-field
                    v-model="fileName"
                    label="Selected File"
                    readonly
                    prepend-icon="mdi-file"
                  ></v-text-field>
                </v-row>
              </v-container>
            </v-col>

            <v-col cols="12" sm="3" md="2">
              <v-container>
                <v-row class="mt-2">
                  <v-btn
                    elevation="3"
                    @click="processReadFile"
                    id="uploadButton"
                    color="primary"
                    :disabled="!isExcelFileValid"
                  >
                    <v-icon medium class="mr-2 v-white"> mdi-magnify </v-icon>
                    Read File</v-btn
                  >
                </v-row>
              </v-container>
            </v-col>

            <v-col cols="12" sm="3" md="2">
              <v-container>
                <v-row class="mt-2">
                  <v-btn
                    elevation="3"
                    @click="fetchCCDB"
                    id="uploadButton"
                    color="primary"
                  >
                    <v-icon medium class="mr-2 v-white"> mdi-magnify </v-icon>
                    Fetch CC DB</v-btn
                  >
                </v-row>
              </v-container>
            </v-col>

            <!-- <v-col cols="12" sm="3" md="1"> </v-col> -->
          </v-row>
        </v-form>
      </div>

      <v-col cols="12" class="pa-0">
        <v-container fluid>
          <v-data-table
            :headers="tableHeadersCC"
            :items="tableItemsCC"
            class="elevation-5 mytable ma-0 pa-0 w-100"
            style="width: 100%"
            dense
            :items-per-page="10"
          />
        </v-container>
      </v-col>
      <div>
        <v-row>
          <v-col cols="12">
            <v-container>
              <div class="mt-2">
                <v-btn
                  elevation="3"
                  @click="uploadData"
                  id="uploadButton"
                  color="primary"
                  :disabled="!isReadFileValid"
                >
                  <v-icon medium class="mr-2 v-white"> mdi-upload </v-icon>
                  Upload to DB</v-btn
                >
              </div>
            </v-container>
          </v-col></v-row
        >
        <v-row v-if="uploadFinish">
          <v-col cols="12">
            <div v-if="uploadSuccess" class="">
              <div>Upload finish {{ uploadFinishtime }}</div>
              <div>Inserted: {{ inserted }} Updated: {{ updated }}</div>
            </div>
            <div v-if="!uploadSuccess" class="">
              Upload failed {{ uploadFinishtime }}
            </div>
          </v-col>
        </v-row>
      </div>
    </v-layout>
  </v-container>
</template>

<script src="./uploadCC.js"></script>
<style src="./uploadCC.css"></style>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,100,0,0"
/>

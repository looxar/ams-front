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
        <BarChart
          :chartData="barDataByMonth"
          :options="barOptions"
          :width="600"
          :height="400"
        />
      </div>

      <div class="pt-4 ma-0" style="overflow-x: auto">
        <div :style="{ minWidth: (records60ByUser.length * 100) + 'px' }">
          <BarChart
            :chartData="barDataByUser"
            :options="barOptions"
            :height="400"
          />
        </div>
      </div>
    </v-layout>
  </v-container>
</template>

<script src="./cost60.js"></script>
<style src="./cost60.css"></style>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,100,0,0"
/>

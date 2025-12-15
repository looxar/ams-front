import Vue from "vue";

import JsonExcel from "vue-json-excel";
Vue.component("downloadExcel", JsonExcel);

import { mdiMicrosoftExcel } from "@mdi/js";
Vue.component("mdiMicrosoftExcel", mdiMicrosoftExcel);

import { mdiFileFindOutline } from "@mdi/js";
Vue.component("mdiFileFindOutline", mdiFileFindOutline);

import { mdiMagnify } from "@mdi/js";
Vue.component("mdiMagnify", mdiMagnify);

import { mdiQrcode } from "@mdi/js";
Vue.component("mdiQrcode", mdiQrcode);

import Treeselect from "@riophae/vue-treeselect";
Vue.component("treeselect", Treeselect);

import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import axios from "axios";
import BarChart from "@/components/BarChart.vue";

export default {
  name: "cost60viewer",
  components: { BarChart },
  data() {
    const numberWithCommas = (n) => {
      if (n == null) return "";
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return {
      // barData: {
      //   labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      //   datasets: [
      //     {
      //       label: "53051060 - ค่าบำรุงฯ/ซ่อม-IT",
      //       backgroundColor: "rgba(128,0,128,0.8)",
      //       data: [12, 19, 3, 5, 2, 3],
      //     },
      //   ],
      // },
      barDataByMonth: { labels: [], datasets: [] },
      barDataByUser: { labels: [], datasets: [] },
      barOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
          position: "bottom",
          labels: {
            fontSize: 16, // 🔼 increase legend label font size
            fontStyle: "bold", // optional
            fontColor: "#333", // optional
          },
        },
        // title: {
        //   display: true,
        //   padding: 30,
        //   text: "53051060 - ค่าบำรุงฯ/ซ่อม-IT ปี 2568",
        //   fontSize: 18, // 🔼 chart title font size
        //   fontStyle: "bold",
        // },
        scales: {
          yAxes: [{ ticks: { beginAtZero: true } }],
          xAxes: [{ gridLines: { display: false } }],
        },

        // ✅ Tooltip customization (hover labels)
        tooltips: {
          enabled: true,
          callbacks: {
            // title is the x-axis label
            title: (tooltipItems, data) => {
              const item = tooltipItems[0];
              return `เดือน: ${data.labels[item.index]}`;
            },
            // the main line per dataset
            label: (tooltipItem, data) => {
              const ds = data.datasets[tooltipItem.datasetIndex];
              const val = ds.data[tooltipItem.index];
              // Customize text here: add unit, format number, etc.
              return `${ds.label}: ${numberWithCommas(val)} บาท`;
            },
            // optional: footer line
            footer: (tooltipItems, data) => {
              const item = tooltipItems[0];
              const ds = data.datasets[item.datasetIndex];
              return `index: ${item.index}, dataset: ${ds.label}`;
            },
          },
          // optional: custom tooltip background/body font size, etc.
          bodyFontSize: 14,
          titleFontSize: 14,
        },

        // ✅ Value labels on bars (via chartjs-plugin-datalabels)
        plugins: {
          datalabels: {
            // place the label in/near the bar
            anchor: "end", // 'end' | 'center' | 'start'
            align: "end", // 'top' | 'right' | 'bottom' | 'left' (bar chart synonyms: 'end', 'center', 'start')
            offset: 2, // pixels away from bar edge
            clamp: true, // stay inside the chart area
            color: "#333",
            font: {
              weight: "bold",
              size: 16,
            },
            formatter: (value) => {
              // you can show raw value, or formatted, or add units
              return numberWithCommas(value);
            },
          },
        },
      },
      loading: false,
      records60ByMonth: [],
      records60ByUser: [],
      barDataAPI: {},
    };
  },

  computed: {},

  watch: {},

  mounted() {
    // Example: update data later (reactiveProp in BarChart will re-render)
    this.getCost60ByMonth();
    this.getCost60ByUser();
    // setTimeout(() => {
    //   this.barData = {
    //     ...this.barData,
    //     datasets: [{ ...this.barData.datasets[0], data: [8, 14, 6, 10, 4, 7] }],
    //   };
    // }, 3000);
  },

  created() {},

  methods: {
    async getCost60ByMonth() {
      this.loading = true;
      try {
        // const response = await axios.get("http://localhost:8080/emp/getEmpAll");
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/api/cost/cost60ByMonth`
        );
        this.records60ByMonth = response.data.data.data;

        // this.records60 = response.data.data.map((item) => ({
        //   recordsPerMonth: item[0],
        //   valuePerMonth: item[1],
        //   yearMonth: item[2],
        // }));
        this.barDataByMonth = {
          labels: this.records60ByMonth.map((i) =>
            this.formatMonth(i.yearMonth)
          ),
          datasets: [
            {
              label: "53051060 - ค่าบำรุงฯ/ซ่อม-IT รายเดือน",
              backgroundColor: "rgba(128,0,128,0.8)",
              data: this.records60ByMonth.map((i) => i.valuePerMonth),
            },
          ],
        };
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingEmp = false;
      }

      this.loading = false;
    },

    async getCost60ByUser() {
      this.loading = true;
      try {
        // const response = await axios.get("http://localhost:8080/emp/getEmpAll");
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_URL}/api/cost/cost60ByUser`
        );
        this.records60ByUser = response.data.data.data;

        // this.records60 = response.data.data.map((item) => ({
        //   recordsPerMonth: item[0],
        //   valuePerMonth: item[1],
        //   yearMonth: item[2],
        // }));
        this.records60ByUser.sort((a, b) => b.valuePerUser - a.valuePerUser);

        this.barDataByUser = {
          labels: this.records60ByUser.map((i) => i.username),
          datasets: [
            {
              label: "53051060 - ค่าบำรุงฯ/ซ่อม-IT ราย User",
              backgroundColor: "rgba(128,0,128,0.8)",
              data: this.records60ByUser.map(
                (i) => Number(i.valuePerUser).toFixed(2) // string with 2 decimals
              ),
            },
          ],
        };
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingEmp = false;
      }

      this.loading = false;
    },

    formatMonth(yearMonth) {
      const [year, month] = yearMonth.split("-"); // "2025", "01"
      return new Date(year, month - 1).toLocaleString("en-US", {
        month: "short",
      });
    },
  },
};

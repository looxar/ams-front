<template>
  <v-app>
    <component v-bind:is="layout">
      <!-- <div class="pa-4">
        <BarChart :chartData="barData" :options="barOptions" />
      </div> -->
    </component>
  </v-app>
</template>

<script>
import BaseLayout from "./layout/Base";
import BarChart from "./components/BarChart.vue";

export default {
  name: "App",

  data: () => ({}),
  components: {
    BaseLayout: BaseLayout,
    BarChart: BarChart,
  },  
  computed: {
    layout() {
      return this.$store.state.layout || "BaseLayout";
    },
  },
  methods: {
    setAuthenticated(status) {
      this.authenticated = status;
    },
    logout() {
      localStorage.clear();
      this.authenticated = false;
    },
  },
  mounted() {

  },
  // data() {
  //   return {
  //     barData: {
  //       labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  //       datasets: [
  //         { label: "Sales", backgroundColor: "#42A5F5", data: [12, 19, 3, 5, 2, 3] }
  //       ]
  //     },
  //     barOptions: { responsive: true, maintainAspectRatio: false },
  //   };
  // },
};
</script>

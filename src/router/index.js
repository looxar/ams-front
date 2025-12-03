import Vue from "vue";
import VueRouter from "vue-router";
// import Home from '../views/Home.vue'
import About from "../views/about/About.vue";
import Repair from "../views/repair/repair.vue";
import Tracking from "../views/TrackingRepair/TrackingRepair.vue";
// import repairForm from '../views/repairForm/repairForm.vue'
// import ListRepair from '../views/listRepair/listRepair.vue'
import checkQuota from "../views/checkQuota/checkQuota.vue";
import uploadDevice from "../views/uploadDevice/uploadDevice.vue";
import uploadCC from "../views/uploadCC/uploadCC.vue";
import uploadEmp from "../views/uploadEmp/uploadEmp.vue";
import cost60 from "../views/cost60/cost60.vue";
// import login from '../views/logIn/logIn.vue'
// import preRepairComponent from '../views/preRepair/preRepair.vue'
import deviceByDep from "../views/deviceByDep/deviceByDep.vue";

Vue.use(VueRouter);

// function guardMyroute(to, from, next) {
//   var isAuthenticated = false;
//   //this is just an example. You will have to find a better or
//   // centralised way to handle you localstorage data handling
//   if (sessionStorage.getItem("LoggedUser") == "true") isAuthenticated = true;
//   else isAuthenticated = false;
//   if (isAuthenticated) {
//     next(); // allow to enter route
//   } else {
//     next("/login"); // go to '/login';
//   }
// }

const routes = [
  {
    path: "/",
    redirect: "/about", // 👈 Add this redirect
  },
  // {
  //   path: '/login',
  //   name: 'login',
  //   component: login
  // },
  // {
  //   path: '/preRepair',
  //   name: 'preRepair',
  //   component: preRepairComponent
  // },
  {
    path: "/repair",
    name: "Repair",
    component: Repair,
  },
  // {
  //   path: '/listRepair',
  //   name: 'listRepair',
  //   component: ListRepair,
  //   beforeEnter: guardMyroute,
  //   meta: { requiresAuth: true },
  // },
  {
    path: "/tracking",
    name: "Tracking",
    component: Tracking,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/checkQuota",
    name: "checkQuota",
    component: checkQuota,
  },
  {
    path: "/uploadDevice",
    name: "uploadDevice",
    component: uploadDevice,
  },
  {
    path: "/uploadCC",
    name: "uploadCC",
    component: uploadCC,
  },
  {
    path: "/cost60",
    name: "cost60",
    component: cost60,
  },
  {
    path: "/deviceByDep",
    name: "deviceByDep",
    component: deviceByDep,
  },
  {
    path: "/uploadEmp",
    name: "duploadEmp",
    component: uploadEmp,
  },
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

export default router;

<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <div class="wrapper">
        <side-bar>
          <sidebar-link to="/about">
            <i class="nc-icon nc-zoom-split"></i>
            <p>ระบบตรวจสอบทรัพย์สิน</p>
          </sidebar-link>

          <sidebar-link to="/checkQuota">
            <i class="nc-icon nc-bullet-list-67"></i>
            <p>ตรวจสอบโควต้า</p>
          </sidebar-link>
        </side-bar>
      </div>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <!-- hideSidebar icon-->

      <v-toolbar-title>Assets Management System</v-toolbar-title>
      <!-- title -->
    </v-app-bar>

    <v-main>
      <router-view @click="toggleSidebar" />
      <!-- <v-main class="pa-0">
      <router-view class="full-bleed"/> -->
      <slot></slot>
    </v-main>
  </v-app>
</template>

<script>
import sideBar from "../components/SidebarPlugin/SideBar.vue";

export default {
  data: () => ({ drawer: null }),

  contents: {
    sideBar,
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
  },
};
</script>

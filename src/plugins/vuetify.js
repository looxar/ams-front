import Vue from 'vue';
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors';
import '@mdi/font/css/materialdesignicons.css'


Vue.use(Vuetify);



export default new Vuetify({
  icons: {
    iconfont: 'mdi', // default - only for display purposes
  },
  theme: {
    themes: {
      light: {
        primary: colors.purple,
        secondary: colors.grey.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3,
      },
      dark: {
        primary: colors.blue.lighten3,
      },
    },
  },
});

import VTooltip from 'v-tooltip'

// Sidebar on the right. Used as a local plugin in DashboardLayout.vue
import SideBar from './components/SidebarPlugin'
// import Notifications from './components/NotificationPlugin'
import GlobalComponents from './globalComponents'
//import GlobalDirectives from './globalDirectives'

// asset imports
import 'bootstrap/dist/css/bootstrap.css'
import './assets/sass/light-bootstrap-dashboard.scss'
import './assets/css/demo.css'

export default {
    install(Vue){
        Vue.use(VTooltip)
        Vue.use(SideBar)
        // Vue.use(Notifications)
        Vue.use(GlobalComponents)
//        Vue.use(GlobalDirectives)

    }
}
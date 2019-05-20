// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
//import the vue instance
import Vue from 'vue'

//import the App component
import App from './App'

//import the vue router
import VueRouter from 'vue-router'
Vue.use(VueRouter)

//import axios
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

//import vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'
Vue.use(Vuetify, {
  iconfont: 'mdi'
})

//import the patientList component
import PatientList from './components/PatientList'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'
locale.use(lang)

// import DataTables and DataTablesServer separately
import { DataTables, DataTablesServer } from 'vue-data-tables'
Vue.use(DataTables)
Vue.use(DataTablesServer)

// import DataTables and DataTablesServer together
import VueDataTables from 'vue-data-tables'
Vue.use(VueDataTables)


//define your routes
const routes = [
//route for the home route of the web page
{ path: '/', component: PatientList },
]

// Create the router instance and pass the `routes` option

const router = new VueRouter({
  routes, // short for routes: routes
  mode: 'history'
})
//instantiate the vue instance
new Vue({
//define the selector for the root component
  el: '#app',
  //pass the template to the root component
  template: '<App/>',
  //declare components that the root component can access
  components: { App },
  //pass in the router to the Vue instance
  router
}).$mount('#app')//mount the router on the app
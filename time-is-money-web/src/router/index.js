import { createRouter, createWebHashHistory } from 'vue-router'
import Countdown from '../views/Countdown.vue'
import Config from '../views/Config.vue'
import Record from '../views/Record.vue'

const routes = [
  { path: '/', component: Countdown },
  { path: '/config', component: Config },
  { path: '/record', component: Record }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})

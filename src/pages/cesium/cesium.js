/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-20 15:14:37
 * @LastEditTime: 2023-11-22 15:44:55
 * @Description: desc
 * @FilePath: \map-project\src\pages\cesium\cesium.js
 */
import { createApp} from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './part/router'
import App from './app.vue'
console.log(routes)
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
createApp(App).use(router).mount('#app')
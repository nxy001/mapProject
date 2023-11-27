/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-22 15:12:00
 * @LastEditTime: 2023-11-24 10:36:44
 * @Description: desc
 * @FilePath: \map-project\src\pages\cesium\part\router.js
 */
import index from './index.vue'
import flyto from './flyto.vue'
import buildingScene from './buildingScene.vue'
import entity from './entity.vue'
import imageLayer from './imageLayer.vue'
const routes = [
  {
    path: '/',
    name: 'index',
    component: index
  },
  {
    path: '/fly',
    name: 'fly',
    component: flyto
  },
  {
    path: '/buildingScene',
    name: 'buildingScene',
    component: buildingScene
  },
  {
    path: '/entity',
    name: 'entity',
    component: entity
  },
  {
    path: '/imageLayer',
    name: 'imageLayer',
    component: imageLayer
  },
]
export default routes
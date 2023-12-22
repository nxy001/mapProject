/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-22 15:12:00
 * @LastEditTime: 2023-12-14 15:08:16
 * @Description: desc
 * @FilePath: \map-project\src\pages\cesium\part\router.js
 */
import index from './index.vue'
import flyto from './flyto.vue'
import buildingScene from './buildingScene.vue'
import entity from './entity.vue'
import imageLayer from './imageLayer.vue'
import camera from './camera.vue'
import primitive from './primitive.vue'
import particle from './particle.vue'
import apiScene from './apiScene.vue'
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
  {
    path: '/camera',
    name: 'camera',
    component: camera
  },
  {
    path: '/primitive',
    name: 'primitive',
    component: primitive
  },
  {
    path: '/particle',
    name: 'particle',
    component: particle
  },
  {
    path: '/apiScene',
    name: 'apiScene',
    component: apiScene
  },
]
export default routes
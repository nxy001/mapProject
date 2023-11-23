import index from './index.vue'
import flyto from './flyto.vue'
import buildingScene from './buildingScene.vue'
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
]
export default routes
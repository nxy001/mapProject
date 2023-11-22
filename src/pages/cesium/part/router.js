import index from './index.vue'
import flyto from './flyto.vue'
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
  }
]
export default routes
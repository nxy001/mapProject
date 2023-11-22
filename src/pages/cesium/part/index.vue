<template>
  <h1>cesium地图</h1>
  <div id="cesiumContainer"></div>
</template>

<script setup>
import CesiumMethod from '../../../common/util/cesiumMethod'
const cMethod = new CesiumMethod()
import { onMounted } from 'vue';
onMounted( async ()=>{
  cMethod.loadView('cesiumContainer')
  setTimeout(()=>{
    cMethod.flyByLonlat()
  },3000)
})
   


</script>

<style scoped lang="less">
html,
body,
#app  {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#cesiumContainer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
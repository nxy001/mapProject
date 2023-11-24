<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-24 10:34:28
 * @LastEditTime: 2023-11-24 15:13:13
 * @Description: desc
 * @FilePath: \map-project\src\pages\cesium\part\entity.vue
-->
<template>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <button @click="addPolygon">添加一个多边形</button>
  </div>
</template>

<script setup>
import CesiumMethod from '@/common/util/cesiumMethod';
const cMethod = new CesiumMethod()
import { onMounted, ref } from 'vue';

onMounted( async ()=>{
  cMethod.loadView('cesiumContainer')
  setTimeout(()=>{
    cMethod.flyByLonlat({
      longitude: -104.9965,
      latitude: 39.74248,
      height: 4000
    })
  },3000)
  // 添加建筑图层  osm建筑物图层
  cMethod.addOsmBuilding()
})
// 添加一个多边形
function addPolygon() {
  const info = {
    sets: [
    [-109.080842, 45.002073], [-105.91517, 45.002073], [-104.058488, 44.996596],  
    [-104.053011, 43.002989], [-104.053011, 41.003906], [-105.728954, 40.998429],
    [-107.919731, 41.003906], [-109.04798, 40.998429], [-111.047063, 40.998429],  
    [-111.047063, 42.000709], [-111.047063, 44.476286], [-111.05254, 45.002073]],
    name: 'test',
    id: '23423'
  }
  cMethod.addPolygon('2',info,{})
  // cMethod.flyByLonlat({longitude:-109.080842, latitude:45.002073,height:100})
}


</script>

<style lang="less" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  
}
.boxs {
  position: absolute;
  top: 60px;
  left: 60px;
  button {
    cursor: pointer;
  }
}
</style>

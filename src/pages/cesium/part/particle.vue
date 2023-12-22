<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-24 10:34:28
 * @LastEditTime: 2023-12-13 13:40:22
 * @Description: 粒子系统
 * @FilePath: \map-project\src\pages\cesium\part\particle.vue
-->
<template>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <button @click="addParticle">添加粒子系统</button>
    <br>
    <br>
  
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
})
/**
 * 添加粒子系统
 */
function addParticle(){
  cMethod.addParticle()
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

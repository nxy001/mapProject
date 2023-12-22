<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-24 10:34:28
 * @LastEditTime: 2023-11-28 09:35:15
 * @Description: control of camera
 * @FilePath: \map-project\src\pages\cesium\part\camera.vue
-->
<template>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <button @click="flyToPoint">定位到一个点</button>
    <br>
    <br>
    <button @click="mapListen">添加鼠标事件监听</button>
    <br>
    <br>
    <button @click="flyAnimation">飞行动画时间控制</button>
    <br>
    <br>
    <button @click="lookAt">look at point</button>
  </div>
</template>

<script setup>
import CesiumMethod from '@/common/util/cesiumMethod';
const cMethod = new CesiumMethod()
import { onMounted, ref } from 'vue';

onMounted( async ()=>{
  cMethod.loadView('cesiumContainer')
})
// 相机定位到一个点位
function flyToPoint(){
  cMethod.cameraFlyTo([104,30,1000],{
    heading: 30,
    pitch: -60,
    roll: 0,
  })
}
// 鼠标事件监听
function mapListen(){
  cMethod.mapListen()
}

// 控制飞行动画
function flyAnimation(){
  cMethod.cameraFlyTo([104,30,1000],{},()=>{
    setTimeout(()=>{
      cMethod.cameraFlyTo([34,30,1000],{easing:'LINEAR_NONE'})
    },1000)
  })
}

// 相机聚焦一个点位
function lookAt(){
  
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

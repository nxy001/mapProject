<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-24 10:34:28
 * @LastEditTime: 2023-11-27 14:28:11
 * @Description: 可视化图像
 * @FilePath: \map-project\src\pages\cesium\part\imageLayer.vue
-->
<template>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <button @click="addMap1">添加必应地图</button>
    <br>
    <br>
    <button @click="addMap2">添加Assets地图</button>
    <br>
    <br>
    <button @click="addMap3">添加一个图片地图资源</button>
    <br>
    <br>
    <button @click="remove">删除图片底图</button>
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
// 添加必应地图
function addMap1(){
  cMethod.addImageLayerFromWorld('baseMap','AERIAL_WITH_LABELS')
}
// 添加一个cesium ion中的地图资源
function addMap2(){
  cMethod.addImageLayerFromAssetId('assetMap',3812)
}
// 添加一个图片地图资源
function addMap3(){
  cMethod.addImageLayerFromImage('imageLayer',require('../../../assets/logo.png'),{
    points:[ -180.0,
            -90.0,
            180.0,
            90]
  })
}

// 删除图片底图
function remove(){
  cMethod.removeImageLayer('imageLayer')
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

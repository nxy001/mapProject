<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-24 10:34:28
 * @LastEditTime: 2023-12-13 10:31:10
 * @Description: 可视化图像
 * @FilePath: \map-project\src\pages\cesium\part\primitive.vue
-->
<template>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <button @click="addRectangle">添加一个矩形</button>
    <br>
    <br>
    <button @click="addEllipsoidGeometry">添加椭球体</button>
    <br>
    <br>
    <button @click="updatePrimitive">更新primitive样式</button>
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
 * 添加一个矩形
 */
function addRectangle(){
  cMethod.addRectangel([-100.0,20,-90.0,30])
  cMethod.flyByLonlat({longitude:-95,latitude:25,height:90000})
}

/**
 * 添加椭球体
 */
function addEllipsoidGeometry(){
  cMethod.addEllipsoidGeometry()
}

/**
 * 更新primitive样式
 */
function updatePrimitive(){
  cMethod.changePrimitiveAppearce()
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

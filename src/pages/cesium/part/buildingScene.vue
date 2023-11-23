<template>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <button @click="addBuildingGeoJSON">添加geojson资源的building</button>
    <br>
    <br>
    <button @click="hideBuildingByIds">根据id隐藏building</button>
    <br>
    <br>
    <button @click="addBuildingTileset">根据id添加建筑物资源</button>
    <br>
    <br>
    <button  @click="hideOrShowTileSet">显示隐藏精模建筑物</button>
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
// 添加cesiumion上geojson资源
function addBuildingGeoJSON() {
  cMethod.addBuildingGeoJSON('2364164')
}
// 根据id隐藏一个建筑物
function hideBuildingByIds() {
  const ids = ['532245203','235368665','530288180','530288179','332466474','332469316']
  cMethod.hideBuildingById('osmBuilding',ids)
}

let ifShowTile = ref(false)

/**
 * 添加一个cesiumion中的建筑物图层
 */
function addBuildingTileset() {
  cMethod.addBuildingTileset('2364269')
  ifShowTile.value = true
}

/**
 * 控制建3d建筑物图层显示隐藏
 */
function hideOrShowTileSet() {
  ifShowTile.value = !ifShowTile.value
  cMethod.hideOrShowTileSet('2364269',ifShowTile.value)
}
</script>

<style lang="less" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
.boxs {
  position: absolute;
  left: 100px;
  top: 100px;
  height: 100%;
  button {
    cursor: pointer;
  }
}
</style>
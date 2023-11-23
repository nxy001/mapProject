<template>
  <h1>cesium地图</h1>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <button @click="addOnePoint">添加点位</button>
  </div>
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
   
function addOnePoint(){
    const info = {
      layerCode: 'test-point',
      name: '测试',
      id: 'test',
      longitude: -122.38985, 
      latitude: 37.61864, 
      height: -27.32,
    }
    const option = {
      icon: require('../../../assets/logo.png'),
      scale: 0.5,

    }
    cMethod.addPoint(info,option)
  }

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
.boxs {
    position: absolute;
    left: 30px;
    top: 30px;
    z-index: 1;
    button {
      cursor:pointer;
    }
  }
</style>
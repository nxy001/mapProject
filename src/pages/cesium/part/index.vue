<template>
  <h1>cesium地图</h1>
  <div id="cesiumContainer"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMDQxZTY1NC1jNDJlLTRhMjQtYWI1ZS05ODYyNGEzMTQxMzMiLCJpZCI6MTc4OTA2LCJpYXQiOjE3MDA2MTkwMTZ9.cP8Ppm9_5I6WJFimosuYEVLcbx8g0x5K-CBgmhFSkcw';

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
onMounted( async ()=>{
  const viewer = new Viewer('cesiumContainer', {
    terrain: Terrain.fromWorldTerrain(),
  }); 
  // Fly the camera to San Francisco at the given longitude, latitude, and height.
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    orientation: {
      heading: CesiumMath.toRadians(0.0),
      pitch: CesiumMath.toRadians(-15.0),
    }
  });

  // Add Cesium OSM Buildings, a global 3D buildings layer.
  const buildingTileset = await createOsmBuildingsAsync();
  viewer.scene.primitives.add(buildingTileset);   
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
<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-20 10:29:12
 * @LastEditTime: 2023-11-23 16:23:11
 * @Description: des
 * @FilePath: \map-project\src\pages\index\part\index.vue
-->
<template>
  <h1>地图模块预研</h1>
  <p>包含以下地图类型</p>
  <ul>
    <li>cesium地图</li>
    <br>
    <li>高德地图</li>
    <br>
    <li>天地图</li>
    <br>
    <li>mapbox地图</li>
  </ul>
  <br>
  <a href="/cesium.html">进入cesium地图模块</a>
  <br>
  <a href="/cesium.html#/buildingScene">cesium建筑物图层</a>
 </template>
 
 <script>
 
 export default {
   name: 'App',
   components: {
   }
 }
 </script>
 
 <style scoped>
 #app {
   font-family: Avenir, Helvetica, Arial, sans-serif;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   text-align: center;
   color: #2c3e50;
   margin-top: 60px;

 }
 </style>
 
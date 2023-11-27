<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-20 10:29:19
 * @LastEditTime: 2023-11-27 09:53:41
 * @Description: desc
 * @FilePath: \map-project\README.md
-->
# map-project

## Project setup
```
pnpm install
```

### Compiles and hot-reloads for development
```
pnpm run serve
```

### Compiles and minifies for production
```
pnpm run build
```

### Lints and fixes files
```
pnpm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
### 多页面应用

## 地图模块项目

### cesium 项目
#### cesium项目构建
```
npm install cesium
```
安装cesium 依赖后再vue.config.js 中配置静态资源路径等
使用
CopyWebpackPlugin
将 cesium的source中的资源copy到静态资源文件夹


#### 添加建筑物图层
##### 1、添加osm建筑物图层
osm建筑物图层是一个覆盖全球的公用的建筑物图层可以使用
```
createOsmBuildingsAsync
```
创建一个osm图层。 然后加入场景中去

##### 2、添加一个cesium ion平台上的场景图层
###### 2.1 添加一个geojson文件数据资源
  首先应该将geojson文件上传到cesium ion平台上，配置相关属性，然后根据资源的id添加资源
  ```
  const geoJSONURL = await IonResource.fromAssetId(id);
  // Create the geometry from the GeoJSON, and clamp it to the ground.
  const geoJSON = await GeoJsonDataSource.load(geoJSONURL, { clampToGround: true });
  const dataSource = await this.viewer.dataSources.add(geoJSON);
  // By default, polygons in CesiumJS will be draped over all 3D content in the scene.
  // Modify the polygons so that this draping only applies to the terrain, not 3D buildings.
  for (const entity of dataSource.entities.values) {
    entity.polygon.classificationType = ClassificationType.TERRAIN;
  }
  ```

  ps:  geojson 生成的polygon 通过classificationType属性可以设置polygon的投影展示方式
  ```
    // 在地形上展示polygon 并在 tile上展示polygon
   entity.polygon.classificationType = ClassificationType.BOTH;
  ```

###### 2.2 添加一个.glb 3D建筑物
  将 .glb 文件上传到Cesium Ion 平台上。设置数据类型为 3d模型（tiles as 3dTiles）
  ```
  const newBuildingTileset = await Cesium3DTileset.fromIonAssetId(assetId);
  this.viewer.scene.primitives.add(newBuildingTileset);
  ```

##### 3、控制瓦片图层显示隐藏
 设置瓦片图层的show属性
 ```
  this.tileConfig[tileCode].show = flag
 ```



#### cesium 物体加载

- 物体加载使用使用Entity初始话一个物体，并指定物体的类型及相关的材质等

- 加载一个几何多边形并进行贴地。 几何图形的点位集合不需要传入高度，同时设置  
 HeightReference: HeightReference.CLAMP_TO_GROUND, 
classificationType为ClassificationType.TERRAIN进行贴地操作

- 注意获取点位集合的两种方法
  fromDegreesArrayHeights： 获取一个包含高度的三维点位集合
  fromDegreesArray：  获取一个不包含高度的二维点位集合
- 相机控制： 使用zoomTo api 可以控制相机指向的物体，同时可以试着相机的航向等角度
- 物体控制： 介绍几种跟物体相关的api

  ```
   entity = viewer.entities.getById("uniqueId") // 根据id获取物体
  ``` 
  ```
    viewer.entities.collectionChanged.addEventListener('onChange') // 获取场景中物体集合变化事件
  ```
  ```
   picked = viewer.scene.pick(windowPosition) // 根据屏幕坐标拾取物体
  ```

#### cesium  可视化图像
- 地图底图加载使用imageryLayer添加图层，底图图层多数来源于web服务加载可能是异步的可以记住  fromProviderAsync来使用
- 底图加载依赖于底图提供程序加载底图，底图提供程序有很多，OpenStreetMapImageryProvider\SingleTileImageryProvider\TileCoordinatesImageryProvider\BingMapsImageryProvider等等
- 底图可以调整样式  比如亮度brightness 透明度alpha，等等
- 底图可以使用 raise提升显示层级   lower 下调显示层级  可以remove底图
- webgl指明 跨域媒体资源 图片视频  只有经过跨域资源共享（cors）验证的情况下才能用作webgl纹理
/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-22 15:50:49
 * @LastEditTime: 2023-11-23 18:13:19
 * @Description: desc
 * @FilePath: \map-project\src\common\util\cesiumMethod.js
 */
import { 
  Cartesian3,
  Entity,
  VerticalOrigin,
  IonResource,
  GeoJsonDataSource,
  Cesium3DTileset,
  ClassificationType,
  NearFarScalar,
  HorizontalOrigin, 
  createOsmBuildingsAsync,
  Color,
  Ion, 
  Math as CesiumMath, 
  Terrain, 
  Cesium3DTileStyle,
  Viewer 
} from 'cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMDQxZTY1NC1jNDJlLTRhMjQtYWI1ZS05ODYyNGEzMTQxMzMiLCJpZCI6MTc4OTA2LCJpYXQiOjE3MDA2MTkwMTZ9.cP8Ppm9_5I6WJFimosuYEVLcbx8g0x5K-CBgmhFSkcw';

import "cesium/Build/Cesium/Widgets/widgets.css";
class CesiumMethod {
  constructor(){
    this.viewer = null
    this.points = {} // 点位对象集合
    this.buildingsTileset = null // 建筑物图层
    this.tileConfig = {} // 瓦片图层存贮
  }
  /**
   * 创建查看器
   * @param {Element|String} dom 
   * @param {Object} options 
   */
  loadView(dom,optionsType){
    const option = this.getViewerOption(optionsType)
    this.viewer = new Viewer(dom, option); 
  }
  /**
   * 获取查看器配置 
   */
  getViewerOption(){
    return {
      terrain: Terrain.fromWorldTerrain(), // 地形服务
    }
  }
  /***
   * 根据根据三维空间点位 飞行导航
   * @param {object} longitude: 经度  latitude: 纬度  height: 高度
   * @param {object} option  {duration：飞行时间   maximumHeight:飞行时候最大高度  offset}
   */
  flyByLonlat({ longitude= -122.38985, latitude= 37.61864, height = -27.32 }={},option){
    const pointEntity = this.viewer.entities.add({ // 创建一个没有大小的物体
      position: Cartesian3.fromDegrees(longitude, latitude, height),
      point: { pixelSize: 0, color: Color.RED }
    });
    this.viewer.flyTo(pointEntity,option||{}).then(()=>{
      this.viewer.entities.remove(pointEntity) // 飞行结束后清除创建的物体
    });
  }
  /**
   * 飞行导航到物体
   * @param {entity} entity 3d物体
   * @param {object} option  {duration：飞行时间   maximumHeight:飞行时候最大高度  offset}
   */
  flyToEntity(entity,option){
    if(!entity) {
      console.error('flyToEntity方法的entity参数为空')
      return
    }
    this.viewer.flyTo(entity,option||{})
  }
  /**
   *
   * @param {Object} info {  
   *    longitude: '经度'
   *    latitude： 纬度
   *    height： 高度
   *    id: 唯一编码
   *    name: 名称
   *    layerCode: 点位类型
   * }  
   * @param {object} option 点位样式配置信息
   *  {
   *    pWidth: 图片宽度
   *    pHeight: 图片高度
   *    icon:  图片
   *    scale: 缩放比例,
   *    position: 点位位置
   *  }
   * @param {Object} callBack  回调信息
   */
  async addPoint(info, option) {
    const height = info.height || 330;
    const longitude = info.longitude - 0;
    const latitude = info.latitude - 0;
    const scenePosition = Cartesian3.fromDegrees(longitude, latitude, height);
    
    const verticalOriginConfig = {
      'bottom': VerticalOrigin.BOTTOM,
      'center': VerticalOrigin.CENTER,
      'baseline': VerticalOrigin.BASELINE,
      'top': VerticalOrigin.TOP,
    }
  
    const point = new Entity({
      position: scenePosition,
      name: info.name,
      id: info.id,
      billboard: {
        image: option.icon,
        show: true,
        width: option.pWidth||100,
        height: option.pHeight||110,
        horizontalOrigin: HorizontalOrigin.CENTER,
        scale: option.scale||1,
        scaleByDistance: new NearFarScalar(1000, 1, 10000, 0.4),
        verticalOrigin: verticalOriginConfig[option.position||'center'], // 默认居中
      },

    });
    this.viewer.entities.add(point);

    const layerCode = info.layerCode;
    if (layerCode) {
      if (this.points[layerCode] && this.points[layerCode].length > 0) {
        this.points[layerCode].push(point);
      } else {
        this.points[layerCode] = [point];
      }
    } else {
      this.points.default.push(point);
    }
  }
  /**
   * 添加osm建筑图层
   */
  async addOsmBuilding(){
    const buildingsTileset = await createOsmBuildingsAsync();
    this.viewer.scene.primitives.add(buildingsTileset);
    this.tileConfig['osmBuilding'] = buildingsTileset
  }

  /**
   * 根据geojson 文件添加建筑物
   * @param {String} id  CesiumIon 平台中的资源
   */
  async addBuildingGeoJSON(id) {
    // Load the GeoJSON file from Cesium ion.
    const geoJSONURL = await IonResource.fromAssetId(id);
    // Create the geometry from the GeoJSON, and clamp it to the ground.
    const geoJSON = await GeoJsonDataSource.load(geoJSONURL, { clampToGround: true });
    // Add it to the scene.
    const dataSource = await this.viewer.dataSources.add(geoJSON);
    // By default, polygons in CesiumJS will be draped over all 3D content in the scene.
    // Modify the polygons so that this draping only applies to the terrain, not 3D buildings.
    for (const entity of dataSource.entities.values) {
      entity.polygon.classificationType = ClassificationType.BOTH;
    }
    // Move the camera so that the polygon is in view.
    this.viewer.flyTo(dataSource);
  }
  /**
   * 根据建筑物id 隐藏建筑物
   * @param {String} tileCode 瓦片图层索引
   * @param {Array} elementIds 建筑物id
   */
  hideBuildingById(tileCode,elementIds){
    if( !this.tileConfig[tileCode]) {
      console.error('没有找到该图层')
      return
    }
    const conditions = []
    elementIds.forEach(id=>{
      conditions.push(
        ['${elementId} === '+id, false]
      )
    })
    this.tileConfig[tileCode].style = new Cesium3DTileStyle({
      // Create a style rule to control each building's "show" property.
      show: {
        conditions : [
          // Any building that has this elementId will have `show = false`.
          ...conditions,
          // If a building does not have one of these elementIds, set `show = true`.
          [true, true]
        ]
      },
      // Set the default color style for this particular 3D Tileset.
      // For any building that has a `cesium#color` property, use that color, otherwise make it white.
      color: "Boolean(${feature['cesium#color']}) ? color(${feature['cesium#color']}) : color('#ffffff')"
    })
  }

  /**
   * 根据cesiumion上资源加载建筑物图层
   * @param {String} assetId 
   */
  async addBuildingTileset(assetId) {
    const newBuildingTileset = await Cesium3DTileset.fromIonAssetId(assetId);
    this.viewer.scene.primitives.add(newBuildingTileset);
    // Move the camera to the new building.
    this.viewer.flyTo(newBuildingTileset)

    this.tileConfig[assetId] = newBuildingTileset
  }

  /**
   * 控制瓦片图层显示隐藏
   * @param {String} tileCode 瓦片图层索引 
   * @param {Boolean} flag  显示： true  隐藏：false
   */
  hideOrShowTileSet(tileCode,flag) { // 显示隐藏瓦片图层
    if(this.tileConfig[tileCode]) {
      this.tileConfig[tileCode].show = flag
    }
  }



}
export default CesiumMethod

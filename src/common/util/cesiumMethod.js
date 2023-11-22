/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-22 15:50:49
 * @LastEditTime: 2023-11-22 18:23:03
 * @Description: desc
 * @FilePath: \map-project\src\common\util\cesiumMethod.js
 */
import { Cartesian3, createOsmBuildingsAsync, Color,Ion, Math as CesiumMath, Terrain, Viewer } from 'cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMDQxZTY1NC1jNDJlLTRhMjQtYWI1ZS05ODYyNGEzMTQxMzMiLCJpZCI6MTc4OTA2LCJpYXQiOjE3MDA2MTkwMTZ9.cP8Ppm9_5I6WJFimosuYEVLcbx8g0x5K-CBgmhFSkcw';

import "cesium/Build/Cesium/Widgets/widgets.css";
class CesiumMethod {
  constructor(){
    this.viewer = null
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
   * @param {Object} info 定位信息  暂时不用
   *  {
   *    longitude: '经度'
   *    latitude： 纬度
   *    height： 高度
   *    icon:  图片
   *    scale: 缩放比例
   *  }
   * @param {Object} callBack  回调信息
   */
  async addPoint(info, option) {
    // const height = info.height || 330;
    // const longitude = info.longitude - 0;
    // const latitude = info.latitude - 0;
    // const scenePosition = Cartesian3.fromDegrees(longitude, latitude, height);
    // const point = new Cesium.Entity({
    //   position: scenePosition,
    //   name: info.name,
    //   id: info.id,
    //   billboard: {
    //     image: option.bImg,
    //     show: true,
    //     width: 111,
    //     height: 110,
    //     horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    //     scale: option.scale||1,
    //     scaleByDistance: new Cesium.NearFarScalar(1000, 1, 10000, 0.4),
    //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
    //   },

    // });
    // this.viewer.entities.add(point);

    // const layerCode = info.layerCode;
    // if (layerCode) {
    //   if (this.points[layerCode] && this.points[layerCode].length > 0) {
    //     this.points[layerCode].push(point);
    //   } else {
    //     this.points[layerCode] = [point];
    //   }
    // } else {
    //   this.points.default.push(point);
    // }
  }
}
export default CesiumMethod

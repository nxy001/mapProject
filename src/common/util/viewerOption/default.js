/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-12-14 14:52:43
 * @LastEditTime: 2023-12-14 16:14:10
 * @Description: viewer option属性默认配置
 * @FilePath: \map-project\src\common\util\viewerOption\default.js
 */
import { 
  Terrain, 
} from 'cesium';
export default {
  /**
   * 匹配规则
   * 当type为default 或者不指明type的时候加载该配置
   * @param {String} type 
   */
  rule(type) {
    return type === 'default' || !type
  },
  /**
   * 添加viewer默认配置
   */
  async handler() {
    return {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      homeButton: false,
      geocoder: false,
      navigationHelpButton: false,
      timeline: false,
      infoBox:false,
      sceneModePicker:false,
      // baseLayer:false,
      terrain: Terrain.fromWorldTerrain(), // 地形服务
    }
  }
}

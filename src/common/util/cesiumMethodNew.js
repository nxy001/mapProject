/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-22 15:50:49
 * @LastEditTime: 2023-12-22 15:40:48
 * @Description: 构建cesium一般业务api
 * 1.  创建cesium 3d地图场景  完成
 * 2.  加载web二维底图、高程服务  完成
 * 3.  加载一类点位 完成
 * 4.  删除一类点位  完成
 * 5.  删除一个点位  完成
 * 6.  加载一类区域边界 完成
 * 7.  删除一类区域边界 完成
 * 8.  删除一个区域边界 完成
 * 9.  鼠标监听物体 悬浮、点击事件  完成
 * 10. 展示点击事件弹框  完成
 * 11. 点位热力图加载  完成
 * 13. 点位聚合制作 完成
 * 14. 控制视角定位 或者将摄像头定位到固定的经纬度 或者物体上  完成
 * 15. 设置两个或者多个点位之间的经纬度的飞线特效
 * 16. 设置中心点的扩散效果
 * 17. 设置地图上光墙效果
 * 18. 地图后期设置。 抗锯齿、光照强度、光照其他设置、场景亮度等，辉光开启等
 * 19. 构造简单的粒子效果等
 * @FilePath: \map-project\src\common\util\cesiumMethodNew.js
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
  HeightReference,
  createOsmBuildingsAsync,
  StripeMaterialProperty,
  HeadingPitchRange,
  Color,
  Ion, 
  Math as CesiumMath, 
  Terrain, 
  Cesium3DTileStyle,
  Viewer, 
  defined,
  defaultValue,
  ImageryLayer,
  IonWorldImageryStyle,
  IonImageryProvider,
  SingleTileImageryProvider,
  Cartesian2,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  EasingFunction,
  Transforms,
  Rectangle,
  GeometryInstance,
  RectangleGeometry,
  EllipsoidSurfaceAppearance,
  Material,
  Primitive,
  ColorGeometryInstanceAttribute,
  PerInstanceColorAppearance,
  EllipsoidGeodesic,
  EllipsoidGeometry,
  Matrix4,
  Geometry,
  CircleGeometry,
  ParticleSystem,
  WebMapTileServiceImageryProvider,
  ArcGisMapServerImageryProvider,
  CircleEmitter,
  DistanceDisplayCondition,
  LabelStyle,
  CustomDataSource
} from 'cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMDQxZTY1NC1jNDJlLTRhMjQtYWI1ZS05ODYyNGEzMTQxMzMiLCJpZCI6MTc4OTA2LCJpYXQiOjE3MDA2MTkwMTZ9.cP8Ppm9_5I6WJFimosuYEVLcbx8g0x5K-CBgmhFSkcw';

import "cesium/Build/Cesium/Widgets/widgets.css";
import CesiumHeatmap from "/public/Cesium-HeatmapNew.js"
import primitiveMethod from './primitiveMethod'
// 加载viewerOption文件夹下所有文件
const files = require.context('./viewerOption', true, /.*\.js/)
const optionModules = []
files.keys().forEach(item => {
  optionModules.push(files(item))
})


class CesiumMethod {
  constructor(){
    this.viewer = null
    this.points = {
      default:[]
    } // 点位对象集合
    this.polygons = {
      default:[]
    }  // 集合图形集合
    this.buildingsTileset = null // 建筑物图层
    this.tileConfig = {} // 瓦片图层存贮
    this.imageLayers = {} // 可视化图片地图
    this.clusters = {} // 点位聚合图层集合
    this.clusterPoints = {} // 聚合点位集合
    this.primitiveCollection = {} // primitive 集合
    this.mousemoveCallBack = null // 当前entity的mousemove回调。 记录用以处理movemove移出后的回调
    // 点位热力图范围
    this.bounds = {
      west: 102.0,
      east: 105.0,
      south: 29.5,
      north: 32.0,
    };
    // 热力图数组
    this.heatMaps = [];
  }
  /**
   * 创建查看器
   * @param {Element|String} dom           地图容器html元素 或者元素对应id
   * @param {Object}         optionsType   cesium viewer基本配置
   * @param {Function}       callBack      viewer 加载后的回调函数
   */
  async loadView(dom,optionsType,callBack){
    const option = await this.getViewerOption(optionsType)
    this.viewer = new Viewer(dom, option); 
    if(callBack) {
      callBack()
    }
  }
  /**
   * 获取viewer 相关配置
   * {
   * animation：        Boolean        是否显示动画控件
   * baseLayerPicker：  boolean        是否先是底图切换控件
   * fullscreenButton： Boolean        是否显示全屏控件
   * timeline：         Boolean        是否显示时间线控件
   * infoBox:           Boolean        是否显示infoBox控件
   * sceneModePicker：  Boolean        是否显示场景模式切换控件
   * terrain：          Object|false   地形服务
   * baseLayer:         Object|false   地球仪最底部的底图
   * }
   */
  getViewerOption(type){
    return new Promise(resolve=>{
      optionModules.forEach( async item=>{
        const flag = item.default.rule(type)
        if(flag) {
          const reuslt = await item.default.handler()
          resolve(reuslt)
        }
      })
    })
  }
  /**
   * 配置camera属性
   * @param {Object} option       longitude:经度、laitude:纬度、height:高度
   * @param {Obejct} orientation  heading: 航向角、pitch：俯仰角、 roll 翻滚角
   */
  setCameraOption(option={},orientation={}){
    this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        option.longitude,
        option.latitude,
        option.height
      ),
      orientation: {
        heading: 0.6203504179808403,
        pitch: -0.5787021157033392,
        roll: 1.2434497875801753e-13,
        ...orientation
      },
    });
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
   * 将viewer 查看器定位到物体
   * @param {entity} entity 3d物体
   * @param {object} option  {heading   pitch }
   */
  zoomToEntity(entity, option={}){
    if(option.heading && option.pitch) {
      const heading = CesiumMath.toRadians(option.heading);
      const pitch = CesiumMath.toRadians(option.pitch)
      const headingPitchRange = new HeadingPitchRange(heading,pitch)
      this.viewer.zoomTo(entity,headingPitchRange)
    }else {
      this.viewer.zoomTo(entity)
    }
  }

  /**
   * 设置二维底图
   * @param {String} type 底图类型  现在支持 天地图  arcgis  图片地图
   * @param {Object} option 地图相关配置
   */
  setFloorMap (type,option) {
    switch(type) {
      case 'tdt': // 加载天地图地图
        this.loadTdt(option)
        break
      case 'arcgis': // 加载arcgis地图
        this.loadArcgis(option)
        break
      case 'image': // 加载图片底图
        this.loadImageMap(option)
        break
    }
  }
  /**
   * 添加天地图
   * @param {Object} option  底图功能配置项
   */
  loadTdt(option={}){
    this.viewer.imageryLayers.addImageryProvider(new WebMapTileServiceImageryProvider({
      url: option.url||"http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=df6c2eca4ff62eef60b808421b447edc",
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
    }));

    //影像注记
    this.viewer.imageryLayers.addImageryProvider(new WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=df6c2eca4ff62eef60b808421b447edc",
      layer: "tdtAnnoLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
    }))
  }

  /**
   * 加载arcgis底图
   * @param {Object} option 
   */
  async loadArcgis(option={}) {
    // 加载ArcGIS在线地图
    const esri = await ArcGisMapServerImageryProvider.fromUrl(
      option.url||"https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    );
    this.viewer.imageryLayers.addImageryProvider(esri)

    //影像注记
    // this.viewer.imageryLayers.addImageryProvider(new WebMapTileServiceImageryProvider({
    //   url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=df6c2eca4ff62eef60b808421b447edc",
    //   layer: "tdtAnnoLayer",
    //   style: "default",
    //   format: "image/jpeg",
    //   tileMatrixSetID: "GoogleMapsCompatible",
    // }))
  }

  /**
   * 添加图片底图
   * @param {Object} option 
   */
  async loadImageMap(option = {}) {
    const imageLayer = ImageryLayer.fromProviderAsync(
      SingleTileImageryProvider.fromUrl(
       option.image||require( "../assets/ma4.webp"),
        {
          rectangle: Rectangle.fromDegrees(
            -180.0,
            -90.0,
            180.0,
            90
          )
        }
      )
    )
    this.viewer.imageryLayers.add(imageLayer)
  }


  /**
   * 加载面geojson并拉伸高度
   * @param {Cesium.Viewer} viewer ：Cesium的Viewer
   * @param {String} url ：geojson文件的地址
   * @param {String} exHeightFieldName ：拉伸高度字段名称
   */
  addExtrudedGeoJson( url, exHeightFieldName) {
    const promise = new GeoJsonDataSource.load(url);
    promise.then((datasource) => {
      this.viewer.dataSources.add(datasource);   // 加载这个geojson资源 
      const entities = datasource.entities.values;
      for (let index = 0; index < entities.length; index++) {
        const entity = entities[index];
        entity.polygon.heightReference = HeightReference.RELATIVE_TO_GROUND;  // 贴地
        entity.polygon.height = 0;  // 距地高度0米
        entity.polygon.extrudedHeightReference = HeightReference.RELATIVE_TO_GROUND; //拉伸
        entity.polygon.extrudedHeight = entity.properties[exHeightFieldName]; // 拉伸高度
        entity.polygon.outline = true;
        entity.polygon.outlineColor = Color.BLACK;
      }
    });
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
   *    pWidth: 图片宽度 默认100
   *    pHeight: 图片高度  默认 100
   *    icon:  图片
   *    scale: 缩放比例 默认1
   *    position: 点位位置 默认底部
   *    show: 是否显示广告牌 默认show
   *    ifGround： 点位是否贴地 默认贴地
   *    maxDistance: 最远距离： 设置点位显示的范围，可以用来优化点位显示\
   *    label: {
   *      text: 显示问题  如果不存在则读取 name
   *      font: 字体设置  字号 字体类型  粗体  斜体等等
   *      color: 字体颜色  默认是白色
   *     bgColor: 背景颜色  默认黑色
   *    offsetX ： 横向偏移
   *     offsetY： 纵向偏移
   *    }
   *  }
   * @param {Object} callBack  回调信息
   * 
   * 注意：1.  heightReference属性设置高度参考，默认是none
   *          值为：CLAMP_TO_GROUND并且高度为空的时候 可以置为贴地效果
   */
  async addImagePoint(info, option,callBack) {
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
    // 广告牌的设置
    const billboard = {
      image: option.icon,
      show: option.show || true,
      width: option.pWidth||100,
      height: option.pHeight||100,
      horizontalOrigin: HorizontalOrigin.CENTER,
      scale: option.scale||1,
      verticalOrigin: verticalOriginConfig[option.position||'bottom'], // 默认居中
      heightReference: HeightReference.CLAMP_TO_GROUND,
    }
    // 不贴地时候设置高度
    if(!option.ifGround) {
      billboard.height = option.pHeight||100
    }
    if(option.maxDistance) {
      billboard.distanceDisplayCondition  = new DistanceDisplayCondition(0.0, option.maxDistance)  
    }
    // 点位  文字说明
    let label = {}
    if(option.label) {
      const labelInfo = option.label || {}
      label = {
        text: labelInfo.text || info.name || '',
        font: labelInfo.font || "10px", //字体样式
        fillColor: Color.fromCssColorString(labelInfo.color||'#fff'), //字体颜色
        backgroundColor:  Color.fromCssColorString(labelInfo.bgColor||'#000'), //背景颜色
        showBackground: true, //是否显示背景颜色
        style: LabelStyle.FILL, //label样式
        verticalOrigin: VerticalOrigin.BOTTOM, //垂直位置
        horizontalOrigin: HorizontalOrigin.CENTER, //水平位置
        pixelOffset: new Cartesian2(labelInfo.offsetX||5, labelInfo.offsetY||-5),
        heightReference: HeightReference.CLAMP_TO_GROUND,
      }
      if(labelInfo.height) {
        label.height = labelInfo.height
      }
      if(option.maxDistance) {
        label.distanceDisplayCondition  = new DistanceDisplayCondition(0.0, option.maxDistance)  
      }
    }
    const point = new Entity({
      position: scenePosition,
      name: info.name,
      id: info.id,
      label,
      billboard,
    });
    point.typeLabel='point'
    this.viewer.entities.add(point);
    const attributes = info
    // 将回调函数存储
    if(callBack?.clickCallBack) { // 具有点击事件回调
      attributes.clickCallBack = callBack.clickCallBack
    }
    if(callBack?.mousemoveCallBack) { // 具有鼠标悬浮事件回调
      attributes.mousemoveCallBack = callBack.mousemoveCallBack
    }
    point.attributes = attributes
    // 按类别保存添加的点位
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
   *    ifGround： 点位是否贴地 默认贴地
   *    maxDistance: 最远距离： 设置点位显示的范围，可以用来优化点位显示\
   *      text: 显示问题  如果不存在则读取 name
   *      font: 字体设置  字号 字体类型  粗体  斜体等等
   *      color: 字体颜色  默认是白色
   *     bgColor: 背景颜色  默认黑色
   *    offsetX ： 横向偏移
   *     offsetY： 纵向偏移
   *  }
   * @param {Object} callBack  回调信息
   * 
   * 注意：1.  heightReference属性设置高度参考，默认是none
   *          值为：CLAMP_TO_GROUND并且高度为空的时候 可以置为贴地效果
   */
  async addLabel(info,option,callBack) {
    const height = info.height || 330;
    const longitude = info.longitude - 0;
    const latitude = info.latitude - 0;
    const scenePosition = Cartesian3.fromDegrees(longitude, latitude, height);
    const label = {
      text: info.name,
      font: option.font || "10px", //字体样式
      fillColor: Color.fromCssColorString(option.color||'#fff'), //字体颜色
      backgroundColor:  Color.fromCssColorString(option.bgColor||'#000'), //背景颜色
      showBackground: true, //是否显示背景颜色
      style: LabelStyle.FILL, //label样式
      verticalOrigin: VerticalOrigin.BOTTOM, //垂直位置
      horizontalOrigin: HorizontalOrigin.CENTER, //水平位置
      pixelOffset: new Cartesian2(option.offsetX||5, option.offsetY||-5),
      heightReference: HeightReference.CLAMP_TO_GROUND,
    }
    if(option.height) {
      label.height = option.height
    }
    if(option.maxDistance) {
      label.distanceDisplayCondition  = new DistanceDisplayCondition(0.0, option.maxDistance)  
    }

    const point = new Entity({
      position: scenePosition,
      name: info.name,
      id: info.id,
      label,
    });
    point.typeLabel='point'
    this.viewer.entities.add(point);
    const attributes = info
    // 将回调函数存储
    if(callBack?.clickCallBack) { // 具有点击事件回调
      attributes.clickCallBack = callBack.clickCallBack
    }
    if(callBack?.mousemoveCallBack) { // 具有鼠标悬浮事件回调
      attributes.mousemoveCallBack = callBack.mousemoveCallBack
    }

    // 按类别保存添加的点位
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
   * 
   * @param {String} arrayType: 边界数据不包含高度： 2， 边界数据包含高度： 3
   * @param {Object} Info: 经纬度数据
   *   sets: {Array} 经纬度数据   eg：[[经度，纬度],[经度，纬度]]
   *   name： 名称
   *   id：标识
   *   layerCode: 类别标识
   * @param {Object} option : 样式属性配置
   *        {
   *          color: 填充颜色
   *          opacity： 不透明度
   *          outline： 是否显示outline
   *          outlineColor： outline的颜色 
   *        }
   */
  addPolygon(arrayType,info, option, callBack) {
    let polygon = null
    const sets = info.sets.flat()
    if(arrayType=='2') {
      polygon = new Entity({
        name: info.name||'',
        polygon: {
          hierarchy: Cartesian3.fromDegreesArray(sets),
          material: Color.fromCssColorString(option.color||'#ff0000').withAlpha(option.opacity||0.6),
          outline: option.outline || false,
          HeightReference: HeightReference.CLAMP_TO_GROUND, // 贴地
          outlineColor: Color.fromCssColorString(option.outlineColor||'#000000'),
          classificationType: ClassificationType.TERRAIN,
        }
      })
    }else {
      polygon = new Entity({
        name: info.name||'',
        polygon: {
          hierarchy: Cartesian3.fromDegreesArrayHeights(sets),
          height: option.height || 0,
          material: Color.fromCssColorString(option.color||'#ff0000').withAlpha(option.opacity||1),
          outline: option.outline || false,
          HeightReference: HeightReference.CLAMP_TO_GROUND, // 贴地
          outlineColor: Color.fromCssColorString(option.outlineColor||'#000000'),
        }
       
      })
    }
    polygon.typeLabel = 'polygon'

    const attributes = info
    // 将回调函数存储
    if(callBack?.clickCallBack) { // 具有点击事件回调
      attributes.clickCallBack = callBack.clickCallBack
    }
    if(callBack?.mousemoveCallBack) { // 具有鼠标悬浮事件回调
      attributes.mousemoveCallBack = callBack.mousemoveCallBack
    }
    polygon.attributes = attributes

    this.viewer.entities.add(polygon);

    const layerCode = info.layerCode;
    if (layerCode) {
      if (this.polygons[layerCode] && this.polygons[layerCode].length > 0) {
        this.polygons[layerCode].push(polygon);
      } else {
        this.polygons[layerCode] = [polygon];
      }
    } else {
      this.polygons.default.push(polygon);
    }
    
  }

  /**
   * 删除一类多边形对象
   * @param {String} layerCode 类别编码 
   */
  removePolygon(layerCode) {
    const arr = this.polygons[layerCode] || []
    arr.forEach(item=>{
      this.viewer.entities.remove(item)
    })
    this.polygons[layerCode] = []
  }

  /**
   * 根据layerCode类别，从一系列entity中刷选 attribute值为value的物体 删除
   * @param {String} layerCode 物体类型
   * @param {String} attribute 删除依据的属性名称
   * @param {String} value 刷出依据的属性值
   */
  removeOnePolygon(layerCode,attribute,value) {
    const arr = this.polygons[layerCode] || []
    for(let i=arr.length-1;i>-1;i--) {
      if(arr[i].attributes[attribute] === value) {
        this.viewer.entities.remove(arr[i])
        this.polygons[layerCode].splice(i,1)
      }
    }
  }

  /**
   * 添加聚合点位图层
   * @param {String} name : 聚合图层名称
   * @param {Object} option : 聚合图层配置
   * pixelRange： 扩展屏幕空间边界框的像素范围。
   * minimumClusterSize： 可以群集的最小屏幕空间对象。
   * enabled：是否启用群集。
   */
  addClusterLayer(name, option = {}) {
    if (!this.clusters[name]) {
      const dataSource = new CustomDataSource(name);
      const pixelRange = option.pixelRange || 15;
      const minimumClusterSize = option.minimumClusterSize || 3;
      const enabled = option.enabled || true;

      dataSource.clustering.enabled = enabled;
      dataSource.clustering.pixelRange = pixelRange;
      dataSource.clustering.minimumClusterSize = minimumClusterSize;
      this.viewer.dataSources.add(dataSource);
      this.clusters[name] = dataSource;

      let removeListener;
      const customStyle = () => {
        if (defined(removeListener)) {
          removeListener();
          removeListener = undefined;
        } else {
          removeListener = dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
            cluster.label.show = true;
            cluster.label.fillColor = Color.fromCssColorString('rgba(255,255,255,1)');
            cluster.label.backgroundColor = Color.TRANSPARENT;
            cluster.label.outlineWidth = 0;
            cluster.label.font = 'italic 12pt Source Han Sans CN';
            cluster.label.pixelOffset = new Cartesian2(0, -25);
            cluster.label.horizontalOrigin = HorizontalOrigin.CENTER, //水平位置

            cluster.billboard.show = true;
            cluster.billboard.id = cluster.label.id;

            cluster.billboard.verticalOrigin = VerticalOrigin.CENTER;
            cluster.billboard.horizontalOrigin = HorizontalOrigin.CENTER;
            cluster.billboard.pixelOffset = new Cartesian2(0, -20);
            const num = clusteredEntities.length;
            if (num >= 5000) {
              cluster.billboard.image = require('../assets/num_level_3.png');
              cluster.billboard.width = 85;
              cluster.billboard.height = 66;
            } else if (num >= 1000) {
              cluster.billboard.image = require('../assets/num_level_3.png');
              cluster.billboard.width = 85;
              cluster.billboard.height = 66;
            } else if (num >= 500) {
              cluster.billboard.image = require('../assets/num_level_3.png');
              cluster.billboard.width = 85;
              cluster.billboard.height = 66;
            } else if (num >= 100) {
              cluster.billboard.image = require('../assets/num_level_3.png');
              cluster.billboard.width = 85;
              cluster.billboard.height = 66;
            } else if (num >= 50) {
              cluster.billboard.image = require('../assets/num_level_2.png');
              cluster.billboard.width = 65;
              cluster.billboard.height = 66;
            } else if (num >= 20) {
              cluster.billboard.image = require('../assets/num_level_2.png');
              cluster.billboard.width = 65;
              cluster.billboard.height = 66;
            } else if (num >= 10) {
              cluster.billboard.image = require('../assets/num_level_2.png');
              cluster.billboard.width = 65;
              cluster.billboard.height = 66;
            } else if (num >= 2) {
              cluster.billboard.image = require('../assets/num_level_1.png');
              cluster.billboard.width = 45;
              cluster.billboard.height = 66;
            }
          });
        }
        // force a re-cluster with the new styling
        const pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;
      };
      customStyle();
    }
  }


  /**
   * @param {Object} name 聚合图层名称
   * @param {Object} info 定位信息
   *  {
   *    longitude: '经度'
   *    latitude： 纬度
   *    height： 高度
   *    name: 点位名称
   *    id: '' 点位id
   *    icon:  图片
   *    layerCode: 点位类别
   *  }
   * @param {object} option 点位样式配置信息
   *  {
   *    pWidth: 图片宽度 默认100
   *    pHeight: 图片高度  默认 100
   *    icon:  图片
   *    scale: 缩放比例 默认1
   *    position: 点位位置 默认底部
   *    show: 是否显示广告牌 默认show
   *    ifGround： 点位是否贴地 默认贴地
   *    maxDistance: 最远距离： 设置点位显示的范围，可以用来优化点位显示\
   *   
   *  }
   */
  addClusterPoint(name, info = {}, option = {},callBack) {
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
     // 广告牌的设置
     const billboard = {
      image: option.icon,
      show: option.show || true,
      width: option.pWidth||100,
      height: option.pHeight||100,
      horizontalOrigin: HorizontalOrigin.CENTER,
      scale: option.scale||1,
      verticalOrigin: verticalOriginConfig[option.position||'bottom'], // 默认居中
      heightReference: HeightReference.CLAMP_TO_GROUND,
    }
    // 不贴地时候设置高度
    if(!option.ifGround) {
      billboard.height = option.pHeight||100
    }
    if(option.maxDistance) {
      billboard.distanceDisplayCondition  = new DistanceDisplayCondition(0.0, option.maxDistance)  
    }
    
    const point = new Entity({
      position: scenePosition,
      name: info.name,
      id: info.id,
      billboard,
    });

    
    const attributes = info
    // 将回调函数存储
    if(callBack?.clickCallBack) { // 具有点击事件回调
      attributes.clickCallBack = callBack.clickCallBack
    }
    if(callBack?.mousemoveCallBack) { // 具有鼠标悬浮事件回调
      attributes.mousemoveCallBack = callBack.mousemoveCallBack
    }
    point.attributes = attributes
    

    if (this.clusters[name]) {
      this.clusters[name].entities.add(point);
      const type = info.layerCode
      if (!this.clusterPoints[type]) {
        this.clusterPoints[type] = [point];
      } else {
        this.clusterPoints[type].push(point);
      }
    }
  }

  /**
   * @param {String} name 聚合图层名称
   * @param {String} type 点位类型
   * 删除聚合中的一类型点位
   */
  removeClusterPoints(name, type) {
    if (this.clusters[name]) {
      const entities = this.clusters[name].entities;
      if (this.clusterPoints[type] && this.clusterPoints[type].length > 0) {
        this.clusterPoints[type].forEach((item) => {
          entities.remove(item);
        });
        this.clusterPoints[type] = null;
      }
    }
  }

  /*
   * @name: 添加点位热力图
   * @param {data} 点位信息 数据格式 [{x:经度，y:纬度，value:10},......] value 一般传10 颜色程度1-100 调整
   * @param {valueMin} 最小值
   * @param {valueMax} 最大值
   * @return:
   */
  addHeatPointMap(id, data, valueMin = 0, valueMax = 1, option = {}) {
    const viewer = this.viewer;
    const bounds = this.bounds;
    const heatMap = CesiumHeatmap.create(viewer, bounds, option);
    heatMap.id = id;
    heatMap.setWGS84Data(valueMin, valueMax, data);
    this.heatMaps.push(heatMap);
  }

  /**
   * @name: 移除or隐藏热力图
   * @param {Array} ids 热力图id
   * @return:
   */
  removeHeat(ids,) {
    if (ids && ids.length > 0) {
      ids.forEach((d) => {
        const index = this.heatMaps.findIndex((item) => {
          return d === item.id;
        });
        if (index > -1) {
            this.viewer.entities.remove(this.heatMaps[index]._layer);
            this.heatMaps.splice(index, 1);
        }
      });
    } else {
      this.heatMaps.forEach((item) => {
        this.viewer.entities.remove(item._layer);
      });
      this.heatMaps = [];
    }
  }
  
  /**
   * 显示或者隐藏热力图层
   * @param {Array} ids 热力图id
   * @param {Boolean} ifShow 显示或者隐藏热力图
   */
  showOrHideHeat(ids,ifShow){
    if (ids && ids.length > 0) {
      ids.forEach((d) => {
        const index = this.heatMaps.findIndex((item) => {
          return d === item.id;
        });
        if (index > -1) {
          if (ifShow) {
            this.heatMaps[index]._layer.show = true;
            this.heatMaps[index].isHide = false;
          } else {
            this.heatMaps[index]._layer.show = false;
            this.heatMaps[index].isHide = true;
          }
        }
      });
    } else {
      if (ifShow) {
        this.heatMaps.forEach((item) => {
          item._layer.show = true;
          item.isHide = false;
        });
      } else {
        this.heatMaps.forEach((item) => {
          item._layer.show = false;
          item.isHide = true;
        });
      }
    }
  }
   /**
   * 添加一条飞线
   * @param {Object} info 飞线配置信息
   * start: 起始点 [经度，纬度]
   * end： 终止点 [经度， 纬度]
   * id: 飞线编码
   * name: 飞线名称
   * @param {Object} option 飞线配置
   * {
   * height: 飞线最高高度
   *   pointNum: 飞线构成点位数量  （越多飞线越平滑也越耗性能）
   *   lineWidth: 线宽
   *   lineColor: 线条颜色 支持数组
   *   flowingColor: 锚点颜色
   *   flowingWidth: 锚点宽度
   *          speed: 锚点速度
*      headSize: ,
      tailsize: ,
      widthoffset: ,
      coresize: 
   * }
   */
  addFlowingLine(info,option){
    const {start,end} = info
    const [normalLine,anchorLine] = primitiveMethod.addFlowingLine(start,end,option)
    normalLine.attributes = info
    anchorLine.attributes = info
    this.viewer.scene.primitives.add(normalLine)
    this.viewer.scene.primitives.add(anchorLine)

    if (!this.primitiveCollection['flowing']) {
      this.primitiveCollection['flowing'] = [normalLine,anchorLine];
    } else {
      this.primitiveCollection['flowing'].push(normalLine,anchorLine);
    }

  }
  /**
   * 删除飞线
   * 
   * @param {String} id  飞线标识
   */
  removeFlowingLine(id){
    const flowingArr = this.primitiveCollection['flowing']||[]
    for(let i= flowingArr.length-1;i>-1;i--) {
      if(!id||flowingArr[i].attributes.id === id) {
        this.viewer.scene.primitives.remove(flowingArr[i])
        this.primitiveCollection['flowing'].splice(i,1)
      }
      }
  }
  /**
   * 添加一个前提
   * @param {Object} info 墙体信息
   * {
   *    id: 墙体编码  用户标识（删除会用到）
   *   name: 名称
   *  lonlats:  [[经度，位图],...]  墙体点位
   *  height: 墙体高度
   * }
   * @param {Object} option  墙体样式配置信息
   * {
   *  color: 墙体颜色  css类型
   *  speed： 墙体光幕动画  默认是0 没有动画
  *  diffuseRate: 漫反射指数  默认是2.0  越小  样式越亮
   * colorImage: 待用透明效果的图片  用于动画
   * }
   */
  addWall(info,option){
    const primitive = primitiveMethod.getWallPrimitive(info,option)
    primitive.attributes = info
    this.viewer.scene.primitives.add(primitive)
    if (!this.primitiveCollection['wall']) {
      this.primitiveCollection['wall'] = [primitive];
    } else {
      this.primitiveCollection['wall'].push(primitive);
    }
  }

  /**
   * 删除墙体
   * @param {String} id  墙体标识
   */
  removeWall(id){
    const wallArr = this.primitiveCollection['wall']||[]
    for(let i= wallArr.length-1;i>-1;i--) {
      if(!id||wallArr[i].attributes.id === id) {
        this.viewer.scene.primitives.remove(wallArr[i])
        this.primitiveCollection['wall'].splice(i,1)
      }
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
   * 根据屏幕坐标采摘场景中的物体
   * @param {Cartesian2} 屏幕坐标
   */
  pickEntity(windowPosition){
    if(!windowPosition) return 
    const picked = this.viewer.scene.pick(windowPosition);
    if (defined(picked)) {
      const id = defaultValue(picked.id, picked.primitive.id);
      if (id instanceof Entity) {
        return id;
      }
    }
    return undefined
  }
  /**
   * 添加场景事件监听
   * clickCallBack 鼠标点击事件回调
   * mousemoveCallBack 鼠标move事件回调
   * 
   * 1. 回调函数绑定在对象的attributes属性中。该属性还包含添加物体的info信息
   * 2. 鼠标click事件 对应cesium中的LEFT_CLICK 
   * 3. 鼠标movemove事件 对应cesium中的 MOUSE_MOVE事件
   * 4. cesium没有针对entity的mouseout鼠标事件。方法通过对mousemove事件借助记录最后一次mousemove回调来模拟mouseout事件
   */
  mapListen(){
    var handler = new ScreenSpaceEventHandler(this.viewer.canvas);
    // 鼠标点击事件
    handler.setInputAction( (event)=> {
      var pickedPosition = this.viewer.scene.pickPosition(event.position);
      if (defined(pickedPosition)) {
        const obj = this.pickEntity(event.position)
        if(obj?.attributes) {
          const attributes = obj.attributes
          if(attributes?.clickCallBack) {
            attributes.clickCallBack(attributes,event.position)
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK)

    // 鼠标mover事件
    handler.setInputAction( (event)=> {
      var pickedPosition = this.viewer.scene.pickPosition(event.endPosition);
      if (defined(pickedPosition)) {
        const obj = this.pickEntity(event.endPosition)
        if(obj?.attributes) {
          const attributes = obj.attributes
          if(attributes?.mousemoveCallBack) {
            this.mousemoveCallBack = attributes.mousemoveCallBack
            attributes.mousemoveCallBack(attributes,event.endPosition)
          }
        } else if(this.mousemoveCallBack){
          this.mousemoveCallBack() // 传空 模拟moseout事件
          this.mousemoveCallBack = null
        }
      } else if(this.mousemoveCallBack){
        this.mousemoveCallBack() // 传空 模拟moseout事件
        this.mousemoveCallBack = null
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)
  }
  /**
   * 删除单个点位（图像点位、文字点位）
   * @param {String} layerCode 点位类型
   */
  removePoint(layerCode) {
    const arr = this.points[layerCode] || []
    arr.forEach(item=>{
      this.viewer.entities.remove(item)
    })
    this.points[layerCode] = []
  }
  /**
   * 同removePoint方法
   * @param {*} layerCode 
   */
  removeLabel(layerCode) {
    this.removePoint(layerCode)
  }
  /**
   * 根据layerCode类别，从一系列entity中刷选 attribute值为value的物体 删除
   * @param {String} layerCode 物体类型
   * @param {String} attribute 删除依据的属性名称
   * @param {String} value 刷出依据的属性值
   */
  removeOnePoint(layerCode,attribute,value) {
    const arr = this.points[layerCode] || []
    for(let i=arr.length-1;i>-1;i--) {
      if(arr[i].attributes[attribute] === value) {
        this.viewer.entities.remove(arr[i])
        this.points[layerCode].splice(i,1)
      }
    }
  }
  /**
     * 根据layerCode类别，从一系列entity中刷选 attribute值为value的物体 删除
   * @param {String} layerCode 物体类型
   * @param {String} attribute 删除依据的属性名称
   * @param {String} value 刷出依据的属性值
   */
  removeOneLabel(layerCode,attribute,value) {
    this.removePoint(layerCode,attribute,value)
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
  
  /**
   * 根据id获取实体对象
   * @param {String} id 实体id
   * 
   */
  getEntityById(id){
    const entity = this.viewer.entities.getById(id)
    return entity
  }

  /**
   * 物体变动监听
   * @param {Function} callBack  物体变动监听回调函数
   */
  entitiesChangeListen(callBack){
    this.viewer.entities.collectionChanged.addEventListener(callBack)
  }

  

  /**
   * 添加必应地图
   * @param {String} layerCode 图层索引字段
   * @param {String} type 仅支持三种类型  AERIAL： 航空图像，AERIAL_WITH_LABELS：带有道路覆盖层的航空图像，ROAD：没有额外图像的道路
   */
  addImageLayerFromWorld(layerCode,type){
    const layers = this.viewer.imageryLayers
    const worldlayer = ImageryLayer.fromWorldImagery({
      style: IonWorldImageryStyle[type]
    })
    layers.add(worldlayer)
    this.imageLayers[layerCode] = worldlayer

  }

  /**
   * 根据ion 资源id加载图层
   * @param {String} layerCode 图层索引字段
   * @param {String|Number} id ion资源编码
   * @param {Object} option 样式设置
   *  eg
   *  {
   *    alpha: 不透明度
   *    brightness: 亮度  
   *  }
   */
  addImageLayerFromAssetId(layerCode,id,option ={}){
    const layers = this.viewer.imageryLayers
    const imageLayer = ImageryLayer.fromProviderAsync(
      IonImageryProvider.fromAssetId(id)
    );
    layers.add(imageLayer)
    for(let key in option) {
      imageLayer[key] = option[key]
    }
    this.imageLayers[layerCode] = imageLayer
  }

  /**
   * 根据图片 创建一个图层
   * @param {String} layerCode 图层索引字段
   * @param {Image|Url} image 图片
   * @param {Object} option {
   *    points: 必填，不图片覆盖的经纬度范围 一个左下角经纬度 一个是右上角经纬度
   *          eg: [ -75.0,28.0,-67.0,29.75]
   * }
   *  
   */
  addImageLayerFromImage(layerCode,image,option){
    const layers = this.viewer.imageryLayers
    const imageLayer = ImageryLayer.fromProviderAsync(
      SingleTileImageryProvider.fromUrl(
        image,
        {
          rectangle: Rectangle.fromDegrees(
           ...option.points
          )
        }
      )
    )
    layers.add(imageLayer)
    this.imageLayers[layerCode] = imageLayer  
  }

  /**
   * 根据底图索引删除对应的底图
   * @param {*} layerCode 
   */
  removeImageLayer(layerCode) {
    if(this.imageLayers[layerCode]) {
      this.viewer.imageryLayers.remove(this.imageLayers[layerCode])
    }
  }

  /**
   * 摄像机flyto 一个点
   * @param {Array} point 点位 [经度，纬度，高度]
   * @param {*} option 
   *  {
   *      heading: 航向，
   *      pitch: 俯仰角
   *      roll： 滚动
   *      easing: 动画类型
   *      during： 动画时间
   *  }
   * callBack 动画结束回调
   */
  cameraFlyTo(point,option={},callBack = function(){}){
    const orientation = {};
    if(option.heading) orientation.heading = CesiumMath.toRadians(option.heading)
    if(option.pitch) orientation.pitch = CesiumMath.toRadians(option.pitch)
    if(option.roll) orientation.roll = CesiumMath.toRadians(option.roll)
    if(point) {
      this.viewer.camera.flyTo(
        {
          destination: Cartesian3.fromDegrees(...point),
          orientation,
          complete: callBack,
          easingFunction: option.easing?EasingFunction[option.easing]:EasingFunction.LINEAR_NONE,
          duration: option.duration||3
        }
      )
    }
  }

  


  /**
   * 相机定位聚焦到一个点位
   */
  lookAtTransform(center){
    center = Cartesian3.fromDegrees(...center)
    const transform = Transforms.eastNorthUpToFixedFrame(center);
    this.viewer.scene.camera.lookAtTransform(
      transform,
      new HeadingPitchRange(0, -Math.PI / 4, 2900))
  }
  /**
   * 添加一个矩形对象
   * @param {Array} point 点位数组  （左下 右上点位）
   */
  addRectangel(point){
    const instance = new GeometryInstance({
      geometry: new RectangleGeometry({
        rectangle: Rectangle.fromDegrees(...point),
        vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT
      }),
      attributes : {
        color : new ColorGeometryInstanceAttribute(0.0, 0.0, 1.0, 0.8)
      }
    })
    var anotherInstance = new GeometryInstance({
      geometry : new RectangleGeometry({
        rectangle : Rectangle.fromDegrees(-85.0, 20.0, -75.0, 30.0),
        vertexFormat : EllipsoidSurfaceAppearance.VERTEX_FORMAT
      }),
      attributes : {
        color : new ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.8)
      }
    });
    const primitive = new Primitive({
      geometryInstances: [anotherInstance,instance],
      // appearance: new EllipsoidSurfaceAppearance({
      //   material: Material.fromType('Stripe')
      // })
      appearance : new PerInstanceColorAppearance()
    })
    this.viewer.scene.primitives.add(primitive)
  }

  /**
   * 测试方法  添加连个椭球体
   */
  addEllipsoidGeometry(){
    const ellipsoidGeometry = new EllipsoidGeometry({
      vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      radii: new Cartesian3(300000.0,200000.0,150000.0)
    })
    const cyanEllipsoidInstance = new GeometryInstance({
      geometry: ellipsoidGeometry,
      modelMatrix: Matrix4.multiplyByTranslation(
        Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-100.0,40.0)),
        new Cartesian3(0.0,0.0,150000.0),
        new Matrix4()
      ),
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(Color.CYAN)
      }
    })
    const orangeEllipsoidInstance = new GeometryInstance({
      geometry: ellipsoidGeometry,
      modelMatrix: Matrix4.multiplyByTranslation(
        Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-100.0,40.0)),
        new Cartesian3(0.0,0.0,450000.0),
        new Matrix4()
      ),
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(Color.ORANGE)
      }
    })
    const primitive = new Primitive({
      geometryInstances:[cyanEllipsoidInstance,orangeEllipsoidInstance],
      appearance: new PerInstanceColorAppearance({
        translucent: false,
        closed: true
      })
    })
    this.viewer.scene.primitives.add(primitive)
  }

  /**
   * 测试：更新primitive样式
   */
  changePrimitiveAppearce(){
    const circleInstance  = new GeometryInstance({
      geometry: new CircleGeometry({
        center: Cartesian3.fromDegrees(-95.0,43.0,300.0),
        radius: 250000.0,
        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      }),
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(new Color(1.0,0.0,0.0,0.5)),
      },
      id: 'circle'
    })
    const primitive  = new Primitive({
      geometryInstances: circleInstance,
      appearance: new PerInstanceColorAppearance({
        translucent: false,
        closed: true,
      })
    })
    this.viewer.scene.primitives.add(primitive)
    setInterval(()=>{
      const attributes = primitive.getGeometryInstanceAttributes('circle')
      attributes.color = ColorGeometryInstanceAttribute.toValue(new Color.fromRandom({alpha: 0.5}))
    },2000)
  }

  /**
   *测试： 添加一个粒子系统
   */
  addParticle(){
    const particle = new ParticleSystem({
      image: require('../../assets/snow.png'),
      imageSize: new Cartesian2(20,20),
      startScale:1.0,
      endScale: 4.0,
      particleLife: 1.0,
      speed: 5.0,
      emitter: new CircleEmitter(0.5),
      emissionRate: 5.0,
      modelMatrix: Matrix4.fromTranslation(
        this.viewer.scene.camera.position
      ),
      // lifetime: 16.0,
    })
    this.viewer.scene.primitives.add(particle)
  }
}
export default CesiumMethod

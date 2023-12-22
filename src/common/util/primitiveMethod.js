import { 
  PolylineGeometry, 
  GeometryInstance, 
  Primitive,
  PolylineColorAppearance,
  PolylineMaterialAppearance,
  Color,
  Material,
  Cartesian3,
  Cartographic,
  Ellipsoid,
  HermiteSpline,
  VertexFormat,
  WallGeometry,
  MaterialAppearance,
} from "cesium";
import getPathData from './common/setPathData'
import {FlowingLineMaterialGLSL} from './material/custom-material'
export default {
  /**
   * 添加一条飞线
   * @param {Array} start 起始点
   * @param {Array} end 终止点
   * @param {Object} option 飞线配置
   * {
   * height: 飞线最高高度
   *   pointNum: 飞线构成点位数量  （越多飞线越平滑也越耗性能）
   *   lineWidth: 线宽
   *   lineColor: 线条颜色 
   *   flowingColor: 锚点颜色
   *   flowingWidth: 锚点宽度
   *          speed: 锚点速度
*      headSize: ,
      tailsize: ,
      widthoffset: ,
      coresize: 
   * }
   */
  addFlowingLine(start,end,option={}) {
    const color = Color.fromCssColorString(option.lineColor||'#f00')
    const points = getPathData.getBSRPoints(start,end, option.height||1000, option.pointNum||10)
    const cPoints = []
    points.forEach(item=>{
      cPoints.push(Cartesian3.fromDegrees(...item))
    })

    const length = points.length
    const colors = []
    for (let i = 0; i < length; ++i) {
      let alpha = 0;
      if (i < length / 2) {
        alpha = (i / length) * 2 * 0.6 + 0.5;
      } else {
        alpha = ((length - i) / length) * 2 * 0.6 + 0.5;
      }
      colors.push(
        Color.fromRandom({
          red: color.red,
          green: color.green,
          blue: color.blue,
          alpha: alpha,
        }),
      );
    }


    const primitiveNormal = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: cPoints,
          width: option.lineWidth||2.0,
          vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
          // colors,
          // colorsPerVertex: true
        }),
      }),
      appearance: new PolylineMaterialAppearance({
        translucent: true,
        material: new Material({
          fabric: {
            type: 'Color',
            uniforms: {
              color: new Color(color.red,color.green,color.blue,0.3)
            }
          }
        }),
      })
    })



    const FlowingLineMaterial = new Material({
      fabric: {
        type: 'FlowingLineMaterial',
        uniforms: {
          color: Color.fromCssColorString(option.flowingColor||'#f00'),
          speed: option.speed||1.5,
          headsize: option.headsize || 0.05,
          tailsize: option.tailsize||0.5,
          widthoffset: option.widthoffset||0.1,
          coresize: option.coresize||0.05,
        },
        source: FlowingLineMaterialGLSL,
      }
    })
    const flowingPrimive = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: cPoints,
          width: option.flowingWidth || 20, 
          vertexFormat:  PolylineMaterialAppearance.VERTEX_FORMAT
        })
      }),
      appearance: new PolylineMaterialAppearance({
        material: FlowingLineMaterial
      })
    })

    return [primitiveNormal,flowingPrimive]

  },
  /**
   * 添加一个前提
   * 1. 当传递颜色值为黑色的时候  墙面材质反应的是传入图片的样式，漫反射强度可能有些低 可以通过调低diffuseRate调高漫反射强度
   * 2. 当传递颜色值为白色的时候  图片基本无作用
   * @param {Object} info 墙体信息
   * {
   *  lonlats:  [[经度，位图],...]  墙体点位
   *  height: 墙体高度
   * }
   * @param {Object} option  墙体样式配置信息
   * {
   *  color: 墙体颜色  css类型
   *  speed： 墙体光幕动画  默认是0 没有动画
   * colorImage: 待用透明效果的图片  用于动画
   *  diffuseRate: 漫反射指数  默认是2.0  越小  样式越亮
   * }
   * @returns 墙体primitive
   */
  getWallPrimitive (info,option){
    const lonlats = info.lonlats||[]
    const heights = new Array(lonlats.length).fill(info.height||6000.0)
    const wallInstance = new GeometryInstance({
      geometry: new WallGeometry({
        positions: Cartesian3.fromDegreesArray(lonlats.flat()),
        maximumHeights: heights,
        vertexFormat: MaterialAppearance.VERTEX_FORMAT
      })
    })

    let image = option.colorImage||require('../assets/colors1.png'), //选择自己的动态材质图片
    color = Color.fromCssColorString(option.color || 'rgba(0, 255, 255, 1)'),
    speed = option.speed || 0.0,
    diffuseRate = option.diffuseRate||2.0,
    source =
    'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
  {\n\
      czm_material material = czm_getDefaultMaterial(materialInput);\n\
      vec2 st = materialInput.st;\n\
      vec4 colorImage = texture(image, vec2(fract((st.t - speed*czm_frameNumber*0.005)), st.t));\n\
      vec4 fragColor;\n\
      fragColor.rgb = color.rgb / 1.0;\n\
      fragColor = czm_gammaCorrect(fragColor);\n\
      material.alpha = colorImage.a * color.a;\n\
      material.diffuse = (colorImage.rgb+color.rgb)/diffuseRate;\n\
      material.emission = fragColor.rgb;\n\
      return material;\n\
  }'


    const primitive = new Primitive({
      geometryInstances: [wallInstance],
      appearance: new MaterialAppearance({
        material: new Material({
          fabric: {
            type: 'PolylinePulseLink',
            uniforms: {
              color: color,
              image: image,
              speed: speed,
              diffuseRate: diffuseRate,
            },
            source: source,
          },
          translucent: true,
        })
      })
    })
    return primitive
  }
}
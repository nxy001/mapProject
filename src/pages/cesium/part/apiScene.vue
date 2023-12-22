<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-24 10:34:28
 * @LastEditTime: 2023-12-22 17:13:48
 * @Description: 基础场景api测试
 * @FilePath: \map-project\src\pages\cesium\part\apiScene.vue
-->
<template>
  <div id="cesiumContainer"></div>
  <div class="boxs">
    <select name="点位类型" id="select-point"  @change="selectPoint">
      <option v-for="item in pointList" :key="item.value" :value="item.value">{{ item.name }}</option>
    </select>
    <br>
    <br>
    <button v-show="chosedPoint" @click="addPoint">添加点位</button>
    <br>
    <br>
    <button v-show="chosedPoint" @click="removePoint">删除点位</button>
    <br>
    <br>
    
    <button v-show="chosedPoint" @click="addText">添加文字</button>
    <br>
    <br>
    <button @click="addArea">添加区域边界</button>
    <br>
    <br>
    <button @click="removeArea">清除区域边界</button>
    <br>
    <br>
    <button @click="removeAreaJj">删除锦江区</button>
    <br>
    <br>
    <button @click="addCluster">添加点位聚合</button>
    <br>
    <br>
    <button @click="removeCluster">删除点位聚合</button>

    <br>
    <br>
    <button @click="addHeatMap">添加点位热力图</button>
    <br>
    <br>
    <button @click="showOrHideHeat">显示或者隐藏点位热力图</button>
    <br>
    <br>
    <button @click="removeHeat">移出点位热力图</button>

    <br>
    <br>
    <button  @click="addFlowingLine">添加飞线</button>

    <br>
    <br>
    <button  @click="removeFlowingLine">删除飞线</button>


    <br>
    <br>
    <button  @click="addWall">添加墙体</button>
    <br>
    <br>
    <button  @click="removeWall">清除墙体</button>
  

    <div v-show="clickName" class="click-info" :style="clickPosition">{{ clickName }}</div>
    <div v-show="hoverName" class="hover-info" :style="hoverPosition">{{ hoverName }}</div>

    <div v-show="areaclickName" class="area-click-info" :style="areaclickPosition">{{ areaclickName }}</div>
    <div v-show="areahoverName" class="area-hover-info" :style="areahoverPosition">{{ areahoverName }}</div>
  </div>
</template>

<script setup>
import CesiumMethod from '@/common/util/cesiumMethodNew';
const cMethod = new CesiumMethod()
import { onMounted, ref,reactive } from 'vue';
const areaData = require('../utils/cd.json')

const pointList = reactive([
  {
    name: '红色点位',
    value: 0,
    type: 'red',
    img: require('../../../common/assets/mark-point-red.png')
  },
  {
    name: '黄色点位',
    type: 'yellow',
    value: 1,
    img: require('../../../common/assets/mark-point-yellow.png')

  },
  {
    name: '蓝色点位',
    type: 'blue',
    value: 2,
    img: require('../../../common/assets/mark-point-blue.png')

  },
  {
    name: '绿色点位',
    type: 'green',
    value: 3,
    img: require('../../../common/assets/mark-point-green.png')

  }
])
onMounted( async ()=>{
  console.log(111)
  cMethod.loadView('cesiumContainer','default',()=>{
    // 添加web地图
    cMethod.setFloorMap('arcgis',{}) 
    // 添加地图监听
    cMethod.mapListen()
    // 添加拉伸几何体
    cMethod.addExtrudedGeoJson(require('../../../common/util/data.json'), 'height')
    // 设置摄像头参数
    cMethod.setCameraOption({
      longitude: 104.06935091, 
      latitude: 30.46195347,
      height: 20000
    },{
      heading: 0,
      pitch: -45,
    })

  })
})
let chosedPoint = reactive(pointList[0])
/**
 * 添加点位
 */
let clickName = ref('')
let clickPosition = ref('')
let hoverName = ref('')
let hoverPosition = ref('')
function addPoint(){
  cMethod.removePoint(chosedPoint.type)

  for(let i=0;i<1000;i++) {
    const longitude = Math.random()*(104.53-102.54)+102.54
    const latitude = Math.random()*(31.26-30.05)+30.05
    const info = {
      longitude,
      latitude,
      id: `${chosedPoint.type}-${i}`,
      name: `${chosedPoint.name}-${i}`,
      layerCode: chosedPoint.type,
      test: '这是一个测试字段',
      height: 300
    }
    const option = {
      pWidth: 40,
      pHeight: 75,
      icon: chosedPoint.img,
      maxDistance: 1000000.0,
      label: {
        font: '10px;宋体;',
        color: '#f00',
        bgColor: 'rgba(0,0,0,0.1)',
        offsetY: -180
      }
    }
    cMethod.addImagePoint(info,option,{
      clickCallBack: (info,position) => {
        clickName.value = info.name
        clickPosition.value = `position:absolute;z-index:9;left:${position.x}px;top:${position.y-20}px;`
      },
      mousemoveCallBack:(info,position) => {
        if(!info || !position){
          hoverName.value = ''
          hoverPosition.value = ''
        } else {
          hoverName.value = info.name
          hoverPosition.value = `position:absolute;z-index:9;left:${position.x}px;top:${position.y-20}px;`
        } 
      },
    })
  }
}
/**
 * 删除一些点位
 */
function removePoint() {
  cMethod.removePoint(chosedPoint.type)
}
/**
 * 添加一个文字
 */
function addText(){
  for(let i=0;i<1000;i++) {
    const longitude = Math.random()*(104.53-102.54)+102.54
    const latitude = Math.random()*(31.26-30.05)+30.05
    const info = {
      longitude,
      latitude,
      id: `${chosedPoint.type}-${i}`,
      name: `${chosedPoint.name}-${i}`,
      layerCode: chosedPoint.type,
      text: '这是一个测试字段',
      height: 300
    }
    const option = {
      maxDistance: 100000.0,
      font: '10px;宋体;',
      color: '#f00',
      bgColor: 'rgba(0,0,0,0.1)',
    }
    cMethod.addLabel(info,option,{
      clickCallBack: (info,position) => {
        console.log(info)
      },
      mouseoverCallBack:(info,position) => {

      },
      mouseoutCallBack:()=> {

      }
    })
  }
}
/**
 * 选择点位类型  下拉选择change事件  
 * @param {*} e 
 */
function selectPoint(e) {
  const index = e.target.value
  chosedPoint = pointList[index]
}

const areaclickName = ref('')
const areaclickPosition = ref('')
const areahoverName = ref('')
const areahoverPosition = ref('')
/**
 * 添加区域边界
 */
function addArea (){
  const arr = areaData.features
  const colors = ['rgba(102, 160, 255, 0.4)', 'rgba(48, 194, 255, 0.4)', 'rgba(83, 87, 255, 0.4)', 'rgba(225, 83, 255, 0.4)', 'rgba(225, 83, 255,0.4)', 'rgba(72, 244, 226, 0.4)', 'rgba(255, 64, 113, 0.4)', 'rgba(62, 244, 139, 0.4)',
      'rgba(138, 68, 255, 0.4)', 'rgba(255, 202, 41, 0.4)', 'rgba(245, 243, 101, 0.4)', 'rgba(255, 88, 190, 0.4)', 'rgba(255, 174, 68, 0.4)', 'rgba(255, 142, 87, 0.4)']
  cMethod.removePolygon('area')
  arr.forEach((item,index)=>{
    const name = item.properties.name
    const id = item.properties.adcode
    const geometrys = item.geometry.coordinates[0][0]
    const theColor = colors[index % colors.length]
    cMethod.addPolygon('2',{
      name,
      id,
      layerCode:'area',
      sets: geometrys
    },{
      color: theColor,
      opacity: 0.4,
      outline: 1,
      outlineColor: theColor,
    },{
      clickCallBack: (info,position)=> {
        if(info) {
          areaclickName.value = info.name
          areaclickPosition.value = `position:absolute;z-index:9;left:${position.x}px;top:${position.y-20}px;`
        }
      },
      mousemoveCallBack: (info,position) =>{
        if(!info || !position){
          areahoverName.value = ''
          areahoverPosition.value = ''
        } else {
          areahoverName.value = info.name
          areahoverPosition.value = `position:absolute;z-index:9;left:${position.x}px;top:${position.y-20}px;`
        } 
      }
    })
  })
}
/**
 * 清除区域边界
 */
function removeArea() {
  cMethod.removePolygon('area')
}
/**
 * 删除锦江区边界
 */
function removeAreaJj() {
  cMethod.removeOnePolygon('area','name','锦江区')
}

/**
 * 添加点位聚合
 */
function addCluster() {
  cMethod.addClusterLayer('clusterPoint')
  for(let i=0;i<10000;i++) {
    const longitude = Math.random()*(104.53-102.54)+102.54
    const latitude = Math.random()*(31.26-30.05)+30.05

    cMethod.addClusterPoint('clusterPoint',{
      longitude,
      latitude,
      layerCode: 'my-test-point',
      name: `测试点位-${i}`,
      id:`test-${i}`,
    },{
      pWidth: 40,
      pHeight: 75,
      ifGround: true,
      icon: require('../../../common/assets/mark-point-blue.png')
    },{
      clickCallBack:(info,position)=>{
        alert(info.name)
      },
      mousemoveCallBack:(info,position) => {
        console.log(info)
      }
    })
  }
}

/**
 * 删除聚合点位
 */
function removeCluster() {
  cMethod.removeClusterPoints('clusterPoint','my-test-point')
}
let showHeat = false
/**
 * 添加点位热力图
 */
function addHeatMap () {
    showHeat = true
    const data = []
    for(let i=0;i<5000;i++) {
      const x = Math.random()*(104.53-102.54)+102.54
      const y = Math.random()*(31.26-30.05)+30.05
      data.push({
        x,
        y,
        value: 1,
      })
    }
    cMethod.addHeatPointMap('test-heatmap',data,0,10)
}

/**
 * 显示隐藏点位热力图
 */
function showOrHideHeat() {
  showHeat = !showHeat
  cMethod.showOrHideHeat(['test-heatmap'],showHeat)
}

/**
 * 移出点位热力图
 */
function removeHeat(){
  cMethod.removeHeat(['test-heatmap'])
}


/**
 * 添加飞线 
 */
function addFlowingLine(){
  const flowingPoint = [
    [
      103.76258028,
      30.96465927
    ],
    [
      103.72030957,
      30.88146794
    ],
    [
      103.67928232,
      30.79393277
    ],
    [
      103.65068829,
      30.65713379
    ],
    [
      103.70041991,
      30.51157338
    ],
    [
      103.85458434,
      30.46336214
    ],
    [
      104.04733626,
      30.36357856
    ],
    [
      104.19163515,
      30.38944636
    ],
    [
      104.4352568,
      30.41853239
    ],
    [
      104.4839819,
      30.5267474
    ],
    [
      104.69574732,
      30.68965054
    ],
    [
      104.6657641,
      30.79917382
    ],
    [
      104.55519879,
      31.04032943
    ],
    [
      104.49897919,
      31.21037983
    ],
    [
      104.06420325,
      31.22961166
    ],
    [
      103.84306737,
      31.13341353
    ],
    [
      103.63504983,
      31.12860106
    ],
    [
      103.60131763,
      31.06441162
    ],
    [
      103.76258028,
      30.96465927
    ]
  ]
  const start = [
    104.07344805,
    30.66568325
  ]
  flowingPoint.forEach((item,i)=>{
    cMethod.addFlowingLine({
      id: `flowing-${i}`,
      start, 
      end:item,
      name: `飞线-${i}`
    },{
      pointNum:1000,
      speed: 2,
      height: 20000,
    })
  })


    const flowing2 =[
    [
      104.51659179,
      30.82325214
    ],
    [
      104.70824012,
      30.71687201
    ],
    [
      104.73537518,
      30.59431716
    ],
    [
      104.64548587,
      30.43069539
    ],
    [
      104.55390166,
      30.38388873
    ],
    [
      104.44026978,
      30.37218367
    ],
    [
      104.32324602,
      30.34438249
    ],
    [
      104.23166224,
      30.36486747
    ],
    [
      104.1315984,
      30.39705559
    ],
    [
      104.08750234,
      30.4599336
    ],
    [
      104.04679805,
      30.5373846
    ],
    [
      104.0230537,
      30.60309666
    ],
    [
      103.99930932,
      30.70376896
    ],
    [
      104.01626906,
      30.77374019
    ],
    [
      104.08580529,
      30.82472892
    ],
    [
      104.21131019,
      30.87132361
    ],
    [
      104.34699107,
      30.88442427
    ],
    [
      104.41483161,
      30.88733532
    ],
    [
      104.47079995,
      30.8800576
    ],
    [
      104.51659179,
      30.82325214
    ]
  ]
  flowing2.forEach((item,i)=>{
    cMethod.addFlowingLine({
      id: `flowing2-${i}`,
      start:[104.31815871,30.6979357], 
      end:item,
      name: `飞线2-${i}`
    },{
      pointNum:1000,
      height: 10000,
      lineColor: '#00ff4e',
      flowingColor: '#d9ea27',
      speed: 3,
    })
  })
  
}

/**
 * 移除飞线
 */ 
function removeFlowingLine () {
  cMethod.removeFlowingLine()
}

/**
 * 添加墙体
 */
function addWall(){
  const points = [
    [
      104.51659179,
      30.82325214
    ],
    [
      104.70824012,
      30.71687201
    ],
    [
      104.73537518,
      30.59431716
    ],
    [
      104.64548587,
      30.43069539
    ],
    [
      104.55390166,
      30.38388873
    ],
    [
      104.44026978,
      30.37218367
    ],
    [
      104.32324602,
      30.34438249
    ],
    [
      104.23166224,
      30.36486747
    ],
    [
      104.1315984,
      30.39705559
    ],
    [
      104.08750234,
      30.4599336
    ],
    [
      104.04679805,
      30.5373846
    ],
    [
      104.0230537,
      30.60309666
    ],
    [
      103.99930932,
      30.70376896
    ],
    [
      104.01626906,
      30.77374019
    ],
    [
      104.08580529,
      30.82472892
    ],
    [
      104.21131019,
      30.87132361
    ],
    [
      104.34699107,
      30.88442427
    ],
    [
      104.41483161,
      30.88733532
    ],
    [
      104.47079995,
      30.8800576
    ],
    [
      104.51659179,
      30.82325214
    ]
  ]
  cMethod.addWall({
    id: 'test',
    name: '测试墙体',
    lonlats: points,
    height: 8000.0,

  },{
    colorImage: require('../../../common/assets/colors3.png'),
    color: 'rgba(0, 0, 0,1)',
    diffuseRate: 0.6,
    speed: 2.0
  })
}
/**
 * 添加墙体
 */
 function removeWall(){
  cMethod.removeWall()
}
</script>

<style lang="less" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  
}
.boxs {
  position: absolute;
  top: 60px;
  left: 60px;
  button {
    cursor: pointer;
  }

  .click-info {
    padding: 0.1rem;
    background: rgba(255,255,255,0.4);
    font-size: 14px;
    border-radius: 2px;
  }
  .hover-info {
    padding: 0.1rem;
    background: rgba(255,255,255,0.4);
    font-size: 14px;
    border-radius: 2px;
    color: aqua;
  }
  .area-click-info {
    padding: 0.1rem;
    background: rgba(255,255,255,0.4);
    font-size: 14px;
    border-radius: 2px;
  }
  .area-hover-info {
    padding: 0.1rem;
    background: rgba(255,255,255,0.4);
    font-size: 14px;
    border-radius: 2px;
    color: aqua;
  }
}
</style>

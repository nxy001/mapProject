<!--
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-20 10:29:19
 * @LastEditTime: 2023-11-22 11:08:57
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
#### cesium基础场景加载

#### cesium 点位加载

#### cesium 边界加载

#### cesium  事件模块
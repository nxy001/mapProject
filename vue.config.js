/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-20 10:29:12
 * @LastEditTime: 2023-11-22 13:56:30
 * @Description: desc
 * @FilePath: \map-project\vue.config.js
 */
const { defineConfig } = require('@vue/cli-service')

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const entryConfigFun = require('./productConfig')
const entryConfig = entryConfigFun()
var isProduct = process.env.NODE_ENV === "production" ? true: false
var buildProjectName = process.argv[3]
const pages = isProduct?entryConfig.createEntryConfig_build(buildProjectName):entryConfig.createEntryConfig_dev()
console.log(pages)
module.exports = defineConfig({
  transpileDependencies: true,
  pages,
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: []
    }
  },
  lintOnSave: false,
  configureWebpack: {
    devtool: 'source-map',
    output: {
      sourcePrefix: ''
    },
    resolve: {
      fallback: { "https": false, "zlib": false, "http": false, "url": false },
      mainFiles: ['index', 'Cesium']
    },
    plugins: [
      // Copy Cesium Assets, Widgets, and Workers to a static directory
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
          { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
          { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
          { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }
        ]
      }),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify('/')
      })
    ],
  },
})

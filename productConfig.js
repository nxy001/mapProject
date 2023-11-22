/*
 * @Author: NIXY
 * @LastEditors: NIXY
 * @Date: 2023-11-20 14:14:29
 * @LastEditTime: 2023-11-22 09:32:21
 * @Description: desc
 * @FilePath: \map-project\productConfig.js
 */
var glob = require('glob')
module.exports=function(){
  let entryConfig = {
    moduleList: [],
    // 开发的页面配置默认编译pages下的所有子项目
    createEntryConfig_dev(){
      let entryList = {}
      glob.sync('./src/pages/**/*').forEach(item=>{
        let projectName = item.split('/')[3]
        if(!this.moduleList.includes(projectName)) {
          this.moduleList.push(projectName)
        }
      })
      console.log(this.moduleList)
      for(const name of this.moduleList) {
        entryList[name+'1'] = {
          'entry': `./src/pages/${name}/${name}.js`,
          'template':`./src/pages/${name}/${name}.html`,
          filename: `${name}.html`
        }
      }
      return entryList
    },
    createEntryConfig_build(projectName) {
      let entryList = {}
      entryList[projectName] = {
        'entry': `src/pages/${projectName}/${projectName}.js`
      }
      return entryList
    },
  }
  return entryConfig
}

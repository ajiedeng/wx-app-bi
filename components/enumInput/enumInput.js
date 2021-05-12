// components/enumInput/enumInput.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    enums:{
      type: Object,
      value: null
    },
    title:{
      type: String,
      value: "单元格"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showSheet:false
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {

    },
    moved: function () { },
    detached: function () { },
  },


  /**
   * 组件的方法列表
   */
  methods: {
    onSheetClose:function(){
      this.setData({
        showSheet:false
      })
    },
    onSheetSelect:function(event){
      const { value, name} = event.detail
      this.setData({
        content:name
      })

      this.triggerEvent('changed', {value, name})
    },
    onClick:function () {

      const {enums} = this.data
      if(enums){
        this.setData({
          showSheet:true,
          sheetActions:Object.keys(enums).map(key => ({
            name: enums[key],
            value: key,
          })),
        })
      }

    }
  }
})

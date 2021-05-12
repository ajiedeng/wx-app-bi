// pages/mettingRoom/components/alertModule.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onLoad() {
      console.log(this.data.show)
    }
  }
})

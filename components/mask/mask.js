Component({
  properties: {
    maskStyle: {
      type: 'String',
      value: ''
    },
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
    },
    close() {
      this.triggerEvent('close', true)
    },
    protect() {
      return;
    }
  }
})

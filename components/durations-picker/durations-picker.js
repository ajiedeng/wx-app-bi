// components/durations-picker/durations-picker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "单元格"
    },
    errorMessage: {
        type: String,
        value: ''
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    showDatetimePicker: false,
    columns: ['半小时', '1小时', '2小时', '3小时', '4小时', '8小时', '全天（24小时）'],
    columnsSec: {
      0: 0.5,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 8,
      6: 24
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClick: function () {

      this.setData({
          showDatetimePicker: true,
      })

    },
    onConfirm(event) {
      const { picker, value, index } = event.detail;
      const content = value;
      this.setData({
          showDatetimePicker: false,
          content
      })
      this.triggerEvent('change', this.data.columnsSec[index] * 60)
    },
  
    onCancel() {
      this.setData({
        showDatetimePicker: false
      })
    },
    onClose () {
        this.setData({ showDatetimePicker: false });
    }
  }
})

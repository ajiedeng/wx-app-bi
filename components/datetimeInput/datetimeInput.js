// components/datetimeInput/datetimeInput.js
import {formatTime as defaultFormatter} from '../../utils/util'

const currentYear = new Date().getFullYear()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: "单元格"
        },
        type: {
            //date time year-month datetime
            type: String,
            value: 'datetime',
        },
        minDate: {
            type: Number,
            value: new Date(currentYear - 10, 0, 1).getTime(),
            observer: 'updateValue',
        },
        maxDate: {
            type: Number,
            value: new Date(currentYear + 10, 11, 31).getTime(),
            observer: 'updateValue',
        },
        value: {
            type: null,
        },
        formatter: {
            type: null,
            value: defaultFormatter,
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
        filter(type, options) {
            const date = new Date()
            const minutes = date.getMinutes();
            if (type === 'minute') {
                const arr = ['00', '30']
                let arr2 = options.filter(option => option % 30 === 0)
                return arr2.length ? arr2 : arr;
            }
            if (type === 'hour' && minutes >= 30) {
                return options.filter((option, index) => {
                    if (index !== 0) {
                        return option
                    }
                })
            }
            return options;
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onPickerConfirm(event) {
            const {detail} = event
            const {formatter, type} = this.data
            let content

            if (type === 'date' || type === 'datetime') {
                content = formatter(new Date(detail))
            } else {
                content = detail
            }
            this.setData({
                showDatetimePicker: false,
                content
            })

            // this.triggerEvent('change', {value:detail})
            this.triggerEvent('change', detail)
        },

        onPickerCancel() {
            this.setData({
                showDatetimePicker: false
            })
        },

        onClick: function () {

            this.setData({
                showDatetimePicker: true,
            })

        },
        onClose () {
            this.setData({ 
                showDatetimePicker: false 
            });
        }

    }
})

import {formatDate, formatTime} from "../../utils/util";

const getPickerRangeForInt = ({min = 0, max = 100, step = 1}) => {
    const result = []
    for (let i = min; i < max; i += step) {
        result.push({
            id: i,
            name: i
        })
    }
    //push 最后一个
    result.push({
        id: max,
        name: max
    })
    return result
}

const getPickRangeForEnum = ({enum: enumFiled}) => {
    return Object.keys(enumFiled).map(key => {
        return {
            id: parseInt(key),
            name: enumFiled[key]
        }
    })
}

function getIndexFromValue(range, value) {
    if (range) {
        for (let i = 0; i < range.length; i++) {
            if (range[i].id + '' === value + '') {
                return i
            }
        }
    }
    // return -1
}

/*

valueToFormData : 把当前的值转换成表单组件需要的值，比如 slider  view text picker中需要的入参。未定义则返回原值
formDataToValue : 把从表单组件中获得到值，转换成真实的值（符合《VT字段类型定义 》）。未定义则返回原值

valueToText : 把当前的值转成显示需要的值 （大多数情况下和valueToFormData相同，但比如在原生的picker组件中就不行，其入参需要是1,2这种index，组件会自动进行显示文案）。
              如果改方法未定义，会使用valueToFormData的值

getRules: 返回表单校验的规则，会和其大类的规则进行合并（并集）

*/

export const transformers =  {
    'extlink': {
        getRules: ({label}) => {
            return [
                {
                    url: true,
                    message: `请输入正确的${label}`
                }
            ]
        }
    },
    'email': {
        getRules: ({label}) => {
            return [{
                email: true,
                message: `请输入正确的${label}`
            }]
        }
    },
    'phonenumber': {
        getRules: ({label}) => {
            return [
                {
                    mobile: true,
                    message: `请输入正确的${label}`
                }
            ]
        }
    },
    'link': {
        formDataToValue: (formData) => {
            if (formData && formData[0]) {
                return formData[0].url
            }
        },
        valueToFormData: (value) => {
            return value ? [{
                url: value,
            }] : null
        },
        // getDisplayInfo: (config) => {
        //
        // },
        // getRules: ({label}) => {
        //     return [
        //         {
        //             url: true,
        //             message: `请输入正确的${label}`
        //         }
        //     ]
        // }
    },
    'enum': {
        getDisplayInfo: (config) => {
            return {
                range: getPickRangeForEnum(config)
            }
        },
        valueToFormData: (value, displayInfo) => {
            if(value == null){
                return value;
            }
            return getIndexFromValue(displayInfo.range, value)
        },
        formDataToValue: (formData, displayInfo) => {
            return displayInfo.range[parseInt(formData)].id
        },
        valueToText:(value, displayInfo)=>{
            return displayInfo['enum'][value]
        }
    },
    'int': {
        getDisplayInfo: (config) => {
            return {
                range: getPickerRangeForInt(config)
            }
        },
        formDataToValue: (formData, displayInfo) => {
            return displayInfo.range[parseInt(formData)].id
        },
        valueToFormData: (value, displayInfo) => {
            if(value == null){
                return value;
            }
            return getIndexFromValue(displayInfo.range, value)
        },
        valueToText: (value, displayInfo) => {
            return value
        },
    },
    'string': {
        getRules: ({maxlength, label}) => {
            if (maxlength != null) {
                return [
                    {
                        maxlength: maxlength,
                        message: `${label}超出了最大长度${maxlength}`
                    }
                ]
            }
        }
    },
    'float': {
        valueToFormData: (value, {multiple = 1}) => {
            if(value == null){
                return value;
            }
            return value / multiple
        },
        formDataToValue: (value, {multiple = 1}) => {
            return value * multiple
        }
    },
    'ref': {
        valueToFormData: (value, {column}, entity) => {
            return entity[column + ".name"]
        },
    },
    'timestamp': {
        valueToFormData: (value, displayInfo) => {
            if (value) {
                const date = new Date(value * 1000)
                return formatTime(date)
            }
        },
        formDataToValue: (value, {multiple = 1}) => {
            return value / 1000 | 0
        },
        getDisplayInfo: (config, value) => {
            return {
                currentDate: value ? value * 1000 : new Date().getTime(),
                pickerType: 'datetime'
            }
        }
    },
    'date': {
        valueToFormData: (value, displayInfo) => {
            if (value) {
                const date = new Date(value * 1000)
                return formatDate(date)
            }
        },
        formDataToValue: (value, {multiple = 1}) => {
            //需要忽略掉时间
            const date = new Date(value)
            date.setHours(0)
            date.setMinutes(0)
            date.setSeconds(0)
            date.setMilliseconds(0)

            return date.getTime() / 1000 | 0
        },
        getDisplayInfo: (config, value) => {
            return {
                currentDate: value ? value * 1000 : new Date().getTime(),
                pickerType: 'date'
            }
        }
    },
    'time': {
        valueToFormData: (value, displayInfo) => {
            if (value) {
                const hour = (value / 3600) | 0, minute = Math.floor(value / 60) % 60
                return [hour, minute].map(n => {
                    n = n.toString()
                    return n[1] ? n : '0' + n
                }).join(':')
            }
        },
        formDataToValue: (value) => {
            const [hours, minus] = value.split(':').map(s => parseInt(s))
            return hours * 3600 + minus * 60
        },
        getDisplayInfo: (config, value) => {
            const current = new Date()
            return {
                currentDate: value ? [(value / 3600) | 0, Math.floor(value / 60) % 60].join(':') : current.getHours() + ':' + current.getMinutes(),
                pickerType: 'time'
            }
        }
    },
    'meetingperiod': {
        valueToFormData: (value, displayInfo, entity) => {
            const {starttime: startTime, endtime: endTime} = entity
            return startTime == null || endTime == null ? undefined : [startTime, endTime].map(time => {
                const hours = (time + 1) / 3600 | 0, minutes = (time + 1) % 3600 / 60 | 0
                const formatNumber = n => {
                    n = n.toString()
                    return n[1] ? n : '0' + n
                }
                return `${formatNumber(hours)}:${formatNumber(minutes)}`
            }).join('-')
        },

    },
    'relateusers':{
        valueToFormData: (value, displayInfo, entity) => {
            return `已选择（${value?value.length:0}）`
        },
    }

}
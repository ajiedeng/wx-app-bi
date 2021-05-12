import {formatDate, formatTime} from "../../utils/util";
import {MEETING_ROOM_RESERVATION_PID} from "../../utils/specialPIDs";
import {transformers} from './transformers'

const identical = e => e


export class Transformer {

    constructor(vtConfig, filter, isEdit) {
        this.isEdit = isEdit

        const {columns, pid} = vtConfig
        this.config = columns.reduce((obj, item) => {
            const {column} = item
            if (!filter || filter(item)) {
                obj[column] = item
            }
            return obj
        }, {})

    }


    isEditable(key) {

        const {column, type, required} = this.config[key]
        /*
          fixed 是否不可编辑； true-可新增但不可编辑 false-可以编辑；与required结合使用
        */
        const readonlyColumns = new Set(['did', 'creator', 'createtime', 'owner', 'updatetime',
            'organization',
            'companyid',
            'ccusers',
            'relatedusers', 'pid'])
        return !readonlyColumns.has(column) && required !== 3
    }

    getKeys() {
        return Object.keys(this.config)
    }

    getFormData(entity) {
        const keys = Object.keys(this.config)
        if (!entity) {
            return {}
        }
        return keys.reduce((result, key) => {
            result[key] = this.valueToFormData(key, entity[key], entity)
            return result
        }, {})
    }

    getDisplayInfos(entity) {
        entity = entity || {}
        const keys = Object.keys(this.config)
        return keys.reduce((result, key) => {
            result[key] = this.getDisplayInfoByKey(key, entity[key])
            return result
        }, {})
    }

    getFormValidateRules() {
        const keys = Object.keys(this.config)
        return keys.map(key => {
            const config = this.config[key]
            let {type, spec} = config
            let getSpecRules, getTypeRules
            if (spec === 'link' || spec === 'imglink') {
                spec = 'link'
            }

            if (transformers[spec]) {
                getSpecRules = transformers[spec].getRules
            }
            if (transformers[type]) {
                getTypeRules = transformers[type].getRules
            }

            const ruleObject = {
                    name: key,
                    rules: []
                }
                //同时需要其父类的校验规则进行合并
            ;[getSpecRules, getTypeRules].forEach(fun => {
                if (fun) {
                    const rules = fun(config)
                    if (rules) {
                        ruleObject.rules.push(...rules)
                    }
                }
            })
            //通用的限制
            const {canbeempty, label} = config
            if (!canbeempty) {
                ruleObject.rules.push({
                    // message: `${label}不能为空`,
                    validator: (rule, value) => {
                        //自带的require：true 会对0进行误判，所以在此重新实现
                        if (value == null || value === '') {
                            return `${label}不能为空`
                        }
                    }
                })
            }

            return ruleObject
        }, [])
    }


    getTransformer({type, spec}, name) {
        if (name !== 'valueToFormData' && name !== 'formDataToValue' && name !== 'getDisplayInfo' && name !== 'valueToText') {
            throw 'name参数传错了'
        }
        if (spec === 'link' || spec === 'imglink') {
            spec = 'link'
        }
        //优先小类然后大类中的方法
        for (const item of [spec, type]) {
            if (transformers[item] && transformers[item][name]) {
                return transformers[item][name]
            }
        }
    }

    formDataToValue(key, formData) {
        if (!this.config[key]) {
            return formData
        }
        //用于提交
        const formDataToValue = this.getTransformer(this.config[key], 'formDataToValue')
        if (formDataToValue) {
            return formDataToValue(formData, this.getDisplayInfoByKey(key))
        } else {
            return formData
        }
    }

    valueToFormData(key, value, entity) {
        //用于显示或者校验或者both
        const config = this.config[key]
        // if (value == null) {
        //     //可能有问题？
        //     return value
        // }
        if (!config) {
            return value
        }
        const valueToFormData = this.getTransformer(config, 'valueToFormData')
        if (valueToFormData) {
            return valueToFormData(value, this.getDisplayInfoByKey(key), entity)
        } else {
            return value
        }

    }

    valueToText(key, value, entity) {
        if (!this.config[key]) {
            return value
        }
        const valueToText = this.getTransformer(this.config[key], 'valueToText')
        if (valueToText) {
            return valueToText(value, this.getDisplayInfoByKey(key), entity)
        } else {
            return this.valueToFormData(key, value, entity)
        }
    }

    getDisplayInfoByKey(key, value) {
        const config = this.config[key]
        const getDisplayInfo = this.getTransformer(config, 'getDisplayInfo')
        let infos = {}
        if (getDisplayInfo) {
            infos = getDisplayInfo(config, value)
        }
        infos.editable = this.isEdit ? this.isEditable(key) : true
        return {...this.config[key], ...infos}
    }


}



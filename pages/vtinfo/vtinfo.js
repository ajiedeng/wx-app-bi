import {createStoreBindings} from "mobx-miniprogram-bindings";
import {getEntityByID, getFiltersByPID, getVtConfigByPid, isEntityCompleted, store} from "../../store/store";
import {printAndUpload} from "../../utils/logger";

const {fetchData} = require("../../utils/net")
const {formatTime, simpleModal} = require("../../utils/util")

function columnsArrayToObj(columns) {
    /*
    {
                  "column" : "status",
                  "label" : "状态",
                  "type" : "enum", // 只会有数字枚举
                  "enum" : {
                      "0" :  "OK",
                      "1" : "ERR",
                  }
              },

    */

    if (!columns) {
        return {}
    }

    return columns.reduce((obj, item) => {
        obj[item.column] = item
        return obj
    }, {})
}

function valToText(val, column) {
    if (val == null) {
        return '未知'
    }
    let text;
    switch (column.type) {
        case 'enum':
            text = column.enum[val + '']
            break;
        case 'float':
            text = val / column.multiple
            break;
        case 'timestamp':
            if (val > 0) {
                let date = new Date(val * 1000)
                text = formatTime(date)
            } else {
                text = '未知'
            }
            break;
        default:
            break;
    }
    if (text == null || Number.isNaN(text)) {
        text = val
    }
    return text
}

function isEditadle({column, type}) {
    const readonlyColumns = new Set(['did', 'creator', 'createtime', 'owner', 'updatetime',
        'organization',
        'companyid',
        'ccusers',
        'relatedusers', 'pid'])
    return type !== 'timestamp' && type !== 'ref' && !readonlyColumns.has(column)
}

function getRange(columnInfo) {
    switch (columnInfo.type) {
        case 'enum':
            const {enum: enums} = columnInfo

            return Object.keys(enums).map(key => {
                return {
                    id: parseInt(key),
                    name: enums[key]
                }
            })
        case 'int':
            const {min, max, step = 1} = columnInfo, result = []
            for (let i = min; i < max; i += step) {
                result.push({
                    id: i,
                    name: i
                })
            }
            result.push({
                id: max,
                name: max
            })
            return result
        case 'timestamp':
            return ''
        default:
            return null;
    }
}

function getIndexFromRange(range, id) {
    if (range) {
        for (let i = 0; i < range.length; i++) {
            if (range[i].id + '' === id + '') {
                return i
            }
        }
    }
    return -1
}

const logger = wx.getRealtimeLogManager()
// pages/vtinfo/vtinfo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // items: []
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // const {did, pid} = options
        // const did = "1000d486010000000000a55e213bc1e5", pid= "000000000000000000000000d4860100"

        this.did = options.did
        this.pid = options.pid

        this.storeBindings = createStoreBindings(this, {
            store,
            fields: {
                entity: () => getEntityByID(this.did),
                vtConfig: () => getVtConfigByPid(this.pid),
                items: () => {
                    try {
                        const data = getEntityByID(this.did), vtconfig = getVtConfigByPid(this.pid)
                        if (!data || !vtconfig) {
                            return []
                        }
                        const columnMap = columnsArrayToObj(vtconfig.columns)
                        this.columnMap = columnMap
                        const items = []

                        for (let column of Object.keys(columnMap)) {

                            const columnInfo = columnMap[column]
                            if (columnInfo.candisplay) {

                                const editable = isEditadle(columnInfo)

                                const text = valToText(data[column + '.name'] || data[column], columnInfo)
                                const label = columnInfo.label
                                const range = getRange(columnInfo)

                                items.push({
                                    label,
                                    text,
                                    editable,
                                    column,
                                    type: columnInfo.type,
                                    range,
                                    index: getIndexFromRange(range, data[column])
                                })
                            }
                        }
                        return items
                    } catch (e) {
                        printAndUpload.error('服务器返回格式有误', '/sfsaas/api/filter/vtinfo', data, e)
                        simpleModal('数据解析失败')
                    }
                },
                title: () => {
                    let vtConfig = getVtConfigByPid(this.pid)
                    return vtConfig ? vtConfig.name : ''
                }

            },
            actions: ['updateEntityAndVtConfig','updateEntityByID'],
        })

        wx.nextTick(()=>{
            if(!this.data.entity || !this.data.vtConfig || !isEntityCompleted(this.data.entity)){
                fetchData({
                    url: "/sfsaas/api/filter/vtinfo",
                    requestData: {
                        did:this.did, pid:this.pid
                    }
                }).then(({data}) => {
                    try {
                        //扫码的情况下PID可能不存在
                        this.pid = data.vtconfig.pid
                        this.updateEntityAndVtConfig(data)
                    }catch (e) {
                        printAndUpload.error('服务器返回格式有误', '/sfsaas/api/filter/vtinfo', data, e)
                        simpleModal('服务器返回格式有误')
                    }

                })
            }
        })


    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.storeBindings.destroyStoreBindings()
    },


    edit(event) {
        const column = event.currentTarget.dataset.column
        const info = this.columnMap[column]

        console.error('called!!!', column, info)
        const {did, pid} = this, {entity} = this.data
        wx.navigateTo({
            url: '../vtinfo_edit/vtinfo_edit',
            events: {
                // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                acceptDataFromOpenedPage: (data) => {
                    // console.log('acceptDataFromOpenedPage', data)
                    // Object.assign(baseData.data, data)
                    // this.renderPage(baseData)
                }
            },
            success(res) {
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromOpenerPage', {
                    did,
                    pid,
                    config: info,
                    val: entity[column]
                })
            }
        })
    },
    bindPickerChange(event) {
        const findRange = column => {
            for (let item of this.data.items) {
                if (item.column === column) {
                    return item.range
                }
            }
        }

        const column = event.currentTarget.dataset.column
        const rangeIndex = event.detail.value

        const range = findRange(column)
        const newValue = range[rangeIndex].id
        const currentValue = this.data.entity[column]
        console.log('newValue currentValue', newValue, currentValue)

        if (newValue !== currentValue) {
            this.updataVTInfo({
                [column]: newValue
            })

        }
    },
    updataVTInfo(data) {

        fetchData({
            url: "/sfsaas/api/vtcommon/update",
            requestData: {
                did: this.did,
                pid: this.pid,
                data
            }
        }).then(data => {
            this.updateEntityByID(this.did,data)
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
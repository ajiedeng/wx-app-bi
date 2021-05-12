// pages/space/ac.js
import {AC_PID, CLEANING_PID, CURTAIN_PID, LIGHT_PID} from "../../utils/specialPIDs";
import {controlDevice, getDeviceBySpace} from "./services";
import {fetchData} from "../../utils/net";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {getEntityByID, getEntityByIDs, getVtConfigByPid, store} from "../../store/store";
import {alertAndGoBack, hideLoading, showLoading, simpleModal} from "../../utils/util";
import {printAndUpload} from "../../utils/logger";


function generateDevice(entity, vtConfig, controllableKeys) {
    const vtConfigMap = vtConfig.columns.reduce((obj, item) => {
        obj[item.column] = item
        return obj
    }, {})

    const device = {
        name: entity.name,
        did: entity.did,
        features: []
    }
    controllableKeys.forEach(key => {
        const config = vtConfigMap[key]
        const {type, label} = config
        const value = entity[key]
        if (type === 'enum') {
            device.features.push({
                value: config.enum[value] || '请选择',
                label,
                primitiveValue: value,
                key
            })
        } else if (type === 'int') {
            device.features.push({
                value: value == null ? '请选择' : value,
                label,
                primitiveValue: value,
                key
            })
        }
    })
    return device

}

const ALL_IN_ONE_ID = 'ALL_IN_ONE_ID'
const UPDATE_INTERVAL = 5000

const CONTROLLABLE_KEYS = {
    [AC_PID]: ['pwr', 'temp', 'ac_mode', 'ac_mark'],
    [LIGHT_PID]: ['pwr'],
    [CURTAIN_PID]: ['curtain_ctrl']
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showSheet: false,
        sheetActions: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.spaceId = options.spaceId
        this.pid = options.pid
        // this.pid = AC_PID
        // this.spaceId = options.spaceId
        // this.spaceId = '1000b386010000000000a3837e6a3f2b'
        // this.spaceId = '1000b386010000000000917dab398fe4'

        const controllableKeys = CONTROLLABLE_KEYS[this.pid]
        if (!controllableKeys) {
            alertAndGoBack('暂不支持该设备')
            printAndUpload.error('暂不支持该设备', this.pid)
            return
        }
        this.controllableKeys = controllableKeys
        this.setData({
            title: options.name || '设备'
        })

        this.storeBindings = createStoreBindings(
            this, {
                store,
                fields: {
                    vtConfig: () => {
                        const vtConfig = getVtConfigByPid(this.pid)
                        if (vtConfig) {
                            return vtConfig.columns.reduce((obj, item) => {
                                obj[item.column] = item
                                return obj
                            }, {})
                        }
                    },
                    devices: () => {
                        //不访问这玩意就不能刷新
                        const fuck = store.entities
                        console.error('====devices====', fuck.toString())

                        const vtConfig = getVtConfigByPid(this.pid), entities = getEntityByIDs(this.deviceIds || [])
                        if (!this.deviceIds || !vtConfig || !entities) {
                            return
                        }

                        const result = []
                        entities.forEach(entity => {
                            result.push(generateDevice(entity, vtConfig, controllableKeys))
                        })

                        return result
                    },
                    // allInOne: () => {
                    //     const vtConfig = getVtConfigByPid(this.pid)
                    //     if (!vtConfig || !this.deviceIds || this.deviceIds.length === 0) {
                    //         return;
                    //     }
                    //     return generateDevice({name: '总控', did: 'na'}, vtConfig, controllableKeys)
                    // }
                },
                actions: ['updateVtConfig', 'addOrUpdateEntities']
            }
        )
        this.loadInitData(controllableKeys)
    },

    startUpdateDevice() {
        let running = false
        this.updateIntervalID = setInterval(() => {
            if (running) {
                return;
            }
            running = true
            getDeviceBySpace(this.spaceId, this.pid, {autoLoading: false, alertOnError: false}).then(devices => {
                if (!devices || devices.length <= 0) {
                    // simpleModal('该空间没有设备', '该空间没有设备', () => {
                    //     wx.navigateBack()
                    // })
                    // return
                    wx.showToast({
                        title: '该空间没有设备',
                        icon: 'none'
                    })
                }
                this.deviceIds = devices ? devices.map(device => device.did) : []
                this.addOrUpdateEntities(devices, this.pid)
            }).catch(e => {
                printAndUpload.error('后台查询错误', e)
            }).finally(() => {
                running = false
            })
        }, UPDATE_INTERVAL)
    },

    stopUpdateDevice() {
        console.error('clearInterval', this.updateIntervalID + '')
        clearInterval(this.updateIntervalID)
    },

    loadInitData(controllableKeys) {
        showLoading()
        getDeviceBySpace(this.spaceId, this.pid, {autoLoading: false}).then(devices => {
            if (!devices || devices.length <= 0) {
                alertAndGoBack('该空间没有设备')
                throw {handled: true, msg: 'no device,no need to alert the user'}
            } else {
                this.deviceIds = devices.map(device => device.did)
                console.error('  this.deviceIds ', this.deviceIds)
                this.addOrUpdateEntities(devices, this.pid)
            }
        }).then(() => {
            const vtConfig = getVtConfigByPid(this.pid)
            if (!vtConfig) {
                return fetchData({
                    url: " /sfsaas/api/module/config",
                    requestData: {
                        pid: this.pid
                    },
                    autoLoading: false
                }).then(({data}) => {
                    this.updateVtConfig(data.data)

                    this.updateAllInOneDevice({}, data.data)
                })
            } else {
                this.updateAllInOneDevice({}, vtConfig)
            }
        }).then(() => {
            this.startUpdateDevice()
        }).finally(() => {
            hideLoading()
            // setTimeout(() => this.startUpdateDevice(), UPDATE_INTERVAL)
        })
    },

    updateAllInOneDevice(entity/*, vtConfig*/) {
        const currentDevice = this._allInOneMock || {}
        this._allInOneMock = {...currentDevice, ...entity}
        this.setData({
            allInOne: generateDevice({
                ...this._allInOneMock,
                name: '总控',
                did: ALL_IN_ONE_ID
            }, getVtConfigByPid(this.pid), this.controllableKeys)
        })
    },

    featureClicked(event) {
        const {did, key, primitive} = event.currentTarget.dataset
        const vtConfig = this.data.vtConfig[key]
        const {type} = vtConfig

        if (type === 'enum') {
            const sheetActions = Object.keys(vtConfig.enum).map(value => ({
                name: vtConfig.enum[value],
                did,
                key,
                value
            }))
            this.setData({
                showSheet: true,
                sheetActions
            })
        } else if (type === 'int') {
            let {max, min, step} = vtConfig
            step = step || 1
            max = max || 35
            min = min || 16
            console.error(max, min, step, 'primitiveValue' + primitive)
            this.setData({
                showSliderPopup: true,
                max, min, step,
                currentKey: key,
                currentLabel: vtConfig.label,
                currentDevice: did,
                sliderValue: primitive
            })
        }
    },

    onSheetClose() {
        this.setData({
            showSheet: false
        })
    },

    onSheetSelect(event) {
        console.log(event.detail);
        const {did, key, value} = event.detail
        const cmd = {
            [key]: parseInt(value)
        }
        if (did === ALL_IN_ONE_ID) {
            this.groupControl(cmd).then(() => {

            }).catch(e => {
                //忽略
            })
        } else {
            this.singleControl(did, cmd)
        }


    },

    onSliderChange(event) {
        const {value} = event.detail
        const {currentDevice, currentKey} = this.data

        const cmd = {
            [currentKey]: parseInt(value)
        }

        if (currentDevice === ALL_IN_ONE_ID) {
            this.groupControl(cmd).then(() => {
                this.setData({
                    showSliderPopup: false
                })
            }).catch(e => {
                //忽略
            })
        } else {
            this.singleControl(currentDevice, cmd).then(() => {
                this.setData({
                    showSliderPopup: false
                })
            })
        }


    },

    singleControl(did, cmd) {
        return controlDevice(this.pid, did, cmd, true).then(() => {
            wx.showToast({
                title: '控制成功',
                icon: 'none'
            })
        })
    },


    groupControl(cmd) {
        const promises = []
        this.deviceIds.forEach(id => {
            const deviceInfo = {
                name: getEntityByID(id).name
            }
            promises.push(controlDevice(this.pid, id, cmd, false, false)
                .then(result => ({...deviceInfo, data: result}))
                .catch(e => {
                    return {
                        ...deviceInfo,
                        error: e
                    }
                }))

        })

        return Promise.all(promises).then(results => {
            const errorInfo = ''
            let count = 0
            const errorDeviceNames = []
            results.forEach(({error, name}) => {
                if (error) {
                    ++count
                    errorDeviceNames.push(name)
                }
            })
            if (errorDeviceNames.length != 0) {
                simpleModal(`${count}/${promises.length}个设备控制失败`, errorDeviceNames.join(',') + '控制失败')
                throw 'control fail'
            } else {
                this.updateAllInOneDevice(cmd)
                wx.showToast({
                    title: '控制成功',
                    icon: 'none'
                })
            }
        })

    },


    onSliderPopupClose() {
        this.setData({
            showSliderPopup: false
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
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.stopUpdateDevice()
        this.storeBindings.destroyStoreBindings()
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
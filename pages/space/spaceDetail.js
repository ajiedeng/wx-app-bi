// pages/space/spaceDetail.js
import {createStoreBindings, keys} from "mobx-miniprogram-bindings";
import {getCurrentEntity, getEntityByID, getVtConfigByPid, isEntityCompleted, store} from "../../store/store";
import {fetchData} from "../../utils/net";
import {printAndUpload} from "../../utils/logger";
import {notifyError} from "../../utils/util";
import {controlDevice, getDeviceBySpace} from "./services";
import {AC_PID, CLEANING_PID, CURTAIN_PID, LIGHT_PID, SECURITY_PID, SPACE_PID, CAST_SCREEN_PID} from "../../utils/specialPIDs";


const models = {
    [AC_PID]: {
        icon: './images/icon_kongtiao.svg',
        label: '空调',
        requirePermissions: ['read', 'write'],
        pid: AC_PID,
        detailPage: '/pages/space/ac'
    },
    [LIGHT_PID]: {
        icon: './images/icon_zhaoming.svg',
        label: '照明',
        requirePermissions: ['read', 'write'],
        pid: LIGHT_PID,
        detailPage: '/pages/space/ac'
    },
    [CURTAIN_PID]: {
        icon: './images/icon_xiangqing.svg',
        label: '窗帘',
        requirePermissions: ['read', 'write'],
        pid: CURTAIN_PID,
        detailPage: '/pages/space/ac'
    },
    [CLEANING_PID]: {
        icon: './images/icon_baojie.svg',
        label: '保洁',
        requirePermissions: ['read', 'write', 'create'],
        pid: CLEANING_PID,
        detailPage: '/pages/space/cleaning'
    },
    [SECURITY_PID]: {
        icon: './images/icon_xunjian.svg',
        label: '巡检',
        requirePermissions: ['read', 'write', 'create'],
        pid: SECURITY_PID,
    },
    [CAST_SCREEN_PID]: {
        icon: './images/icon_xiangqing.svg',
        label: '投屏',
        requirePermissions: ['read', 'write', 'create'],
        pid: CAST_SCREEN_PID,
        detailPage: '/pages/screenCast/screenCast'
    },
    [SPACE_PID]: {
        icon: './images/icon_xiangqing.svg',
        label: '详情',
        pid: SPACE_PID,
        detailPage: '/pages/addVt/addVt'
    },

}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        items: [
            models[SPACE_PID]
        ],
        devicesPidArr: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.pid = options.pid
        this.did = options.did
        // this.pid = SPACE_PID
        // this.did = '1000b386010000000000a3837e6a3f2b'
        this.storeBindings = createStoreBindings(
            this, {
                store,
                fields: {
                    entity: () => getEntityByID(this.did),
                    vtConfig: () => getVtConfigByPid(this.pid),
                    evnStates: () => {
                        const vtConfig = getVtConfigByPid(this.pid), entity = getEntityByID(this.did)
                        const envItems = {
                            'envtemp': {label: '温度', unit: '℃'},
                            'envhumid': {label: '湿度', unit: '%'},
                            'envlux': {label: '光照', unit: ''},
                            'pir_detected': {label: '人体'}
                        }
                        if (vtConfig && entity && vtConfig.columns) {
                            return Object.keys(envItems).map(key => {
                                const entityValue = entity[key]
                                const {type, multiple, enum: enumDesc} = vtConfig.columns.filter(({column}) => column === key)[0]
                                // console.error(type, multiple, enumDesc, entityValue, key)
                                let value;
                                if (type === 'float' && multiple) {
                                    value = entityValue / multiple
                                } else if (type === 'enum' && enumDesc) {
                                    value = enumDesc[entityValue]
                                } else {
                                    value = entityValue
                                }
                                const {label, unit} = envItems[key]
                                if (unit) {
                                    value += unit
                                }
                                return {
                                    label, value
                                }
                            })
                        }
                    },
                },
                actions: ['updateEntityAndVtConfig', 'updateQueryConditions']
            }
        )
        
        this.updatePageItems(Object.keys(models).slice(0, -1))

        this.updateInfo(true)
        this.checkDevicesExist();
        this.intervalId = setInterval(this.updateInfo,5000)

    },

    updateInfo(alertError){
        fetchData({
            url: "/sfsaas/api/filter/vtinfo",
            requestData: {
                did: this.did,
                pid: this.pid
            },
            alertOnError:alertError
        }).then(({data}) => {
            try {
                console.log(data, 'data')
                this.updateEntityAndVtConfig(data)
            } catch (e) {
                printAndUpload.error('服务器返回格式有误', '/sfsaas/api/filter/vtinfo', data, e)
                if (alertError){
                    notifyError(e, '服务器返回格式有误')
                }
            }
        })
    },

    async updatePageItems(pids) {
        for (const pid of pids) {
            try {
                const result = await this.checkDevicesExist(pid)
                console.log(result, 'result1')
                const currentModels = this.data.items.slice(0, -1)
                if (result) {
                    this.setData({
                        items: [...currentModels, models[pid], models[SPACE_PID]]
                    })
                }
            } catch (e) {
                notifyError(e, `查询${models[pid].label}权限失败`)
            }
        }
    },
    checkDevicesExist(pid) {
        if (pid === 'na' || !pid) {return}
        return fetchData({
            url: "/sfsaas/api/filter/query",
            requestData: {
                did: '',
                pid: pid,
                page: 1,
                pagesize: 500,
                filter: [{space: [this.did]}]
            },
            alertOnError:false
        }).then(({data}) => {
            if (data.result.total) {
                return true
            } else {
                return false;
            }
        })
    },
    // checkPermission(pid, actions) {
    //     return fetchData({
    //         url: '/sfsaas/api/role/user/perm',
    //         requestData: {
    //             pid
    //         },
    //         autoLoading: false
    //     }).then(({data}) => {
    //         if (!data.result) {
    //             return
    //         }
    //         for (const action of actions) {
    //             const right = data.result[action]
    //             if (right <= 0) {
    //                 return false
    //             }
    //         }
    //         return true
    //     })
    // },

    modelClicked(event) {
        const {pid} = event.currentTarget.dataset
        console.log('did', this.did, pid);
        const params = `pid=${pid}&did=${this.did}&spaceId=${this.did}&name=${models[pid].label}`
        const pagePath = models[pid].detailPage
        if(pid ===  CAST_SCREEN_PID) {
            getDeviceBySpace(this.did, CAST_SCREEN_PID, {autoLoading: false}).then((devices) => {
                if (devices.length === 1) {
                    const params = `pid=${pid}&did=${devices[0].did}`
                    wx.navigateTo({
                        url: pagePath + '?' + params,
                    })
                } else {
                    // 当前空间下有多个投屏时，列表显示
                    const params = `pid=${pid}&label=${models[pid].label}&filter=${encodeURIComponent(
                        JSON.stringify([{
                            space: [this.did]
                        }]))}`
                    wx.navigateTo({
                        url: '/pages/filters/filters' + '?' + params,
                    })
                }
            });
        } else {
            wx.navigateTo({
                url: pagePath + '?' + params,
            })
        }
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
        clearInterval(this.intervalId)
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
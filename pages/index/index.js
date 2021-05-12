//index.js
import {CAST_SCREEN_PID, DOOR_PID,INVITE_VISITOR_PID, goCertainDetailPage, goCertainPage} from "../../utils/specialPIDs";

import {fetchData} from '../../utils/net'
import {
    getUserInfo, getCookie, getBindUUIDFlag, getMembers
} from '../../utils/loginInfo'
import {
    showLoading,
    hideLoading, notifyError, simpleModal, handleUrlParams
} from '../../utils/util'

import {
    FIXED_MODULE, ICON_MAPS
} from './indexConfig'
import {printAndUpload} from "../../utils/logger";
import {filterQuery, getFilters, vtControl, vtInfo} from "../commonServices";
import {isLogged} from "../../utils/loginInfo";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {getEntityByID, getFiltersByPID, store} from "../../store/store";
import {getDidFromQRCode, getQueryFromQRCode, getPidFromQRCode, isDidCode, isPidCode} from "../../utils/qrCode";
import {getMyScreenCast} from "./myScreenCast";
import {goVisitorPageIfNeeded, isVisitorUrl, isVisitorUser} from "../visitor/isVisitor";
import {getQueryFromUrl} from "../screenCast/url";
import {getMemberLists} from '../../utils/member'
import { pidBehavior, transfer } from '../../utils/codeBehavior'

Page({
    data: {
        morning: new Date().getHours() < 12,
        loading: false,
        pullDownFlag: false,
        // color: '#000',
        background: '#fff',
        show: true,
        animated: false,
        latitude: 0,
        longitude: 0,
        passwordDialogShow: false,
        oneButton: [{
            text: '知道了'
        }],
        password: ''
    },
    known(e) {
        this.setData({
            passwordDialogShow: false
        })
    },
    getPassword({
                    scene,
                    did
                }) {
        fetchData({
            url: '/sfsaas/api/entrance/password',
            extraHeader: {
                'companyid': getUserInfo(true).companyid,
                'loginsession': getUserInfo(true).loginsession,
                'reqUserId': getUserInfo(true).userid,
                'userDid': getUserInfo(true).did,
            },
            requestData: scene ? {
                scene
            } : {
                did
            },
            autoLoading: false,
            alertOnError: false
        })
            .then(res => {
                hideLoading();
                this.setData({
                    password: res.data.password,
                    passwordDialogShow: true
                })
            })
            .catch(error => {
                hideLoading();
                notifyError(error, '动态密码获取失败')
            })
    },
    //事件处理函数
    goToListDetail: function (e) {
        const {pid, label, filter} = e.currentTarget.dataset
        console.error('===============', pid, label, filter)
        const url = `/pages/filters/filters?pid=${pid}&label=${label}`
        wx.navigateTo({
            url: filter ? `${url}&filter=${filter}` : url
            // url: '/pages/mettingRoom/mettingRoom'
        })
    },
    goTotimecard: function () {
        // wx.navigateTo({
        //     url: '../timecard/timecard',
        // }
        wx.showToast({
            title: '暂未支持',
            icon: 'none'
        })
    },
    noThisScanCode() {
        wx.showToast({
            title: '未知二维码',
            icon: 'none'
        })
    },
    getLocation() {
        console.time('getLocation');
        const that = this;
        return wx.getLocation({
            type: 'wgs84'
        })
            .then(res => {
                const latitude = res.latitude * 1000000;
                const longitude = res.longitude * 1000000
                that.setData({
                    latitude,
                    longitude
                })
                console.timeEnd('getLocation');
                return {
                    latitude,
                    longitude
                }
            }).catch(error => notifyError(error, 'GPS信息获取失败，请检查相关权限'))
    },
    login() {
        return wx.login().then(res => res.code).catch(error => notifyError(error, '微信登录失败'));
    },
    getScene(path) {
        let urlParams = path.split('?')[1];
        let paramsArr = urlParams.split('&'),
            params = {};
        paramsArr.forEach(pStr => {
            let key = pStr.split('=')[0],
                val = decodeURIComponent(pStr.split('=')[1]);
            params[key] = val;
        });
        return params.scene
    },
    openDoor(scene) {
        showLoading();
        let params = {
            scene
        };
        this.setData(params);
        return this.login()
            .then(js_code => params['js_code'] = js_code)
            .then(res => this.getLocation())
            .then(({
                       latitude,
                       longitude
                   }) => fetchData({
                url: '/vt/guardmanage/control/opendoor',
                extraHeader: {
                    'companyid': getUserInfo(true).companyid,
                    'loginsession': getUserInfo(true).loginsession,
                    'reqUserId': getUserInfo(true).userid,
                    'userDid': getUserInfo(true).did,
                },
                requestData: {
                    latitude,
                    longitude,
                    ...params
                },
                autoLoading: false,
                alertOnError: false
            }))
            .then(res => {
                hideLoading();
                wx.showToast({
                    title: res.data.status === 0 ? '开门成功' : res.data.msg
                })
            })
            .catch(error => {
                console.log('直接开门失败', error);
                //获取密码开门
                return this.getPassword({
                    scene
                });
            })
    },
    naviScan() {
        wx.scanCode().then(res => {
            console.log('--scanCode--res', res);

            if (isDidCode(res.result)) {
                this.handleDidUrl(res.result)
            } else if (isPidCode(res.result)) {
                this.handlePidUrl(res.result)
            } else if (res.path) {
                //门禁二维码
                let scene = this.getScene(res.path);
                return this.openDoor(scene);
            } else {
                this.noThisScanCode()
            }

        }).catch(e => console.log('--scan--err--', e))
    },
    handleDidUrl(url){
        const did = getDidFromQRCode(url)
        const queries = getQueryFromQRCode(url)
        if (queries && queries.act === 'transfer') {
            transfer({did,...queries})
        } else if(queries && queries.act && queries.param){
            //控制设备
            vtInfo(did).then(entity=>{
                const {pid} = getEntityByID(did)
                vtControl({
                    did,
                    pid: pid,
                    act: queries.act,
                    cmd: JSON.parse(queries.param)
                },{
                    alertOnError: pid !== DOOR_PID
                }).then(()=>{
                    wx.showToast({
                        title:'操作成功'
                    })
                },e=>{
                    if(pid === DOOR_PID){
                        this.getPassword({
                            did
                        });
                    }
                })
            })
        }else {
            goCertainDetailPage({did})
        }
    },
    handlePidUrl(url) {
        const pid = getPidFromQRCode(url);
        const queries = getQueryFromQRCode(url)
        pidBehavior({pid, ...queries});
    },
    toggleMenu(e) {
        wx.navigateTo({
            url: '../logout/logout',
        })
    },
    goTaskPages() {
        wx.navigateTo({
            url: '/legacy/task/pages/taskManage',
        })
    },
    queryCounts(pid, filters) {
        if (filters && filters.length > 0) {
            return filterQuery(pid, {
                "filterID": filters[0].did,
                "page": 1,
                "pageSize": 20
            }, {
                autoLoading: false,
                alertOnError: false
            }).then(result => {
                return result.total
            })
        }
    },
    getIndexData(silent) {
        let fetchArr = FIXED_MODULE.map(item =>
            getFilters(item.pid, {autoLoading: false, alertOnError: false})
                .then(filters => this.queryCounts(item.pid, filters))
        )

        fetchArr.push(fetchData({
            url: '/sfsaas/api/app/module',
            autoLoading: false,
            alertOnError: false
        }).then(res => {
            // const today = new Date()
            // const year = today.getFullYear()
            // const month = today.getMonth() + 1
            // const day = today.getDate()
            // if(year === 2020 && month===9&& day===16){
            //     this.setData({
            //         myList:[{
            //             pid: "0000000000000000000000003c870100",
            //             name: "我的状态"
            //         }]
            //     })
            //     return
            // }
            if (res && res.data && res.data.data) {
                this.setMyList(res.data.data)
            }
        }))
        fetchArr.push(
            getMyScreenCast().then(list => {
                console.error('getMyScreenCast', list)
                // const current = store.myList || []
                // this.setMyList([
                //     {
                //         pid: CAST_SCREEN_PID,
                //         name: "我的投屏",
                //     },
                //     ...current
                // ])

                if (list) {
                    const current = store.myList || []
                    this.setMyList([{
                        pid: CAST_SCREEN_PID,
                        name: "我的投屏",
                        filter: encodeURIComponent(JSON.stringify([{
                            userdid: [getUserInfo(true).userid]
                        }]))
                    },
                        ...current
                    ])
                }
            })
        )


        return Promise.all(fetchArr).catch(error => {
            if (!silent) {
                notifyError(error, '数据获取失败')
            }
            printAndUpload.error('getIndexData:', error)
        })
    },
    onLoad: function (query) {
        // 检查从公众号跳转进来的参数，如果没有登录，或者参数中带有page的，进入control
        const params = handleUrlParams(query);
        if (!isLogged() || query.page) {
            wx.reLaunch({
                url: `/pages/control/control${params ? '?' + params : ''}`,
            })
        }
        //点击推送消息
        if (query.did) {
            goCertainDetailPage(query)
        }

        if(goVisitorPageIfNeeded(query.q)){
            if (query.q) {
                const qStr = decodeURIComponent(query.q)
                if (isDidCode(qStr)) {
                    this.handleDidUrl(qStr)
                }
            }
            return
        }

        
        //扫描小程序二维码
        if (query.scene) {
            this.openDoor(decodeURIComponent(query.scene))
        }
        //扫描普通二维码
        if (query.q) {
            const qStr = decodeURIComponent(query.q)
            if (isDidCode(qStr)) {
                this.handleDidUrl(qStr)
            }
            if (isPidCode(qStr)) {
                this.handlePidUrl(qStr)
            }
        }

        this.storeBindings = createStoreBindings(this, {
            store,
            fields: {
                vtList: () => {
                    return FIXED_MODULE.map(item => {
                        const filters = getFiltersByPID(item.pid) || []
                        const firstFilter = filters[0]
                        const filterDetail = firstFilter ? store.listByFilter[firstFilter.did] : null
                        return {...item, value: filterDetail ? filterDetail.total : null}
                    })
                },
                myList: () => {
                    return store.myList
                }
            },
            actions: ['setMyList']
        })
        this.getIndexData();
        this.setData({
            iconMaps: ICON_MAPS,
            vtList: FIXED_MODULE
        })
        getMemberLists();
    },

    onShow() {
        if (this.runInBackground) {
            this.getIndexData(true)
        }
        this.runInBackground = false
    },
    onHide() {
        this.runInBackground = true
    },
    onPullDownRefresh() {
        // this.getIndexData();
    },
    onUnload: function () {
        if (this && this.storeBindings && this.storeBindings.destroyStoreBindings) {
            this.storeBindings.destroyStoreBindings()
        }
    }
})
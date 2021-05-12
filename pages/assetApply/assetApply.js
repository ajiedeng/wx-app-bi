// pages/assetApply/assetApply.js
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {getCurrentEntity, getEntityByID, getVtConfigByPid, store} from "../../store/store";
import {getRecord} from "./applyRecord";
import {getUserInfo} from "../../utils/loginInfo";
import {fetchData} from '../../utils/net'
import {simpleModal} from "../../utils/util";
import {SPACE_PID, VT_RECORD_PID} from "../../utils/specialPIDs";
import {vtControl, vtInfo} from "../commonServices";
import drawQrcode from "../../utils/weapp.qrcode.esm";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        infoItems: [
            {label: '名称', key: 'name'},
            {label: '型号', key: 'model'},
            {label: '编码', key: 'assetcode'},
            {label: '数量', key: 'count'},
            {label: '拥有人', key: 'owner.name'}
        ],
        applyNumber: 1,
        applyUser: {
            name: ''
        },
        record: null,
        error: null,
        qualifiedToApply: false,
        codeVisiable: false,
        isOwner: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({title: '物资领用'})

        this.pid = options.pid
        this.did = options.did
        if (options.to) {
            this.to = options.to
            this.getApplyUserInfo();
        }
        if (options.param) {
            this.param = JSON.parse(decodeURIComponent(options.param))
            this.getSpaceInfo();
        }
        this.storeBindings = createStoreBindings(
            this, {
                store,
                fields: {
                    assetEntity: () => getEntityByID(this.did),
                    spaceDid: () => getEntityByID(this.did).space,
                    spaceName: () => getEntityByID(this.did)['space.name'],
                }
            }
        )
    },

    chooseSpace() {
        wx.navigateTo({
            url: `/pages/filters/filters?pid=${SPACE_PID}&chooseMode=true&label=选择空间`,//&key=${field}
            events: {
                // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                acceptDataFromOpenedPage: (data) => {
                    this.setData({
                        spaceDid: data.did,
                        spaceName: data.name
                    })
                },
            },
            success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                // res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
            }
        })
    },

    applyClicked() {
        if (!this.data.spaceDid) {
            return wx.showToast({
                icon: 'none',
              title: '请选择空间',
            })
        }
        if (this.data.applyNumber <= 0) {
            return wx.showToast({
                icon: 'none',
              title: '请正确输入领用数量',
            })
        }
        this.createCode();
        return;
        const {applyNumber, spaceDid, assetEntity, qualifiedToApply} = this.data
        this.createCode();
        return;
        if (!qualifiedToApply) {
            return
        }
        const {assetcode, count, owner, model} = assetEntity

        this.createCode();
        return;

        const applianceCount = Number(applyNumber)
        if (Number.isNaN(applianceCount) || applianceCount <= 0) {
            simpleModal('请输入正确的领用数量')
            return
        }

        if (applianceCount > count) {
            simpleModal('领用数量不能大于库存')
            return
        }
        vtControl({
            pid: VT_RECORD_PID,
            act: "create",
            cmd: {
                name: 'apply',
                assetdid: this.did,
                assetcode: assetcode,
                materialcount: count,
                appliancecount: applianceCount,
                applicant: getUserInfo(true).did,
                materialowner: owner,
                targetspace: spaceDid
            }
        }).then(() => {
            wx.showToast({
                title: '领用成功',
                icon: 'none'
            })
            wx.navigateBack()
        })
    },

    checkQualifiedToApply({applyNumber, error, record}) {
        const {assetEntity} = this.data
        
        let qualified
        if (applyNumber == null || error || (record && record.taskstatus === 0) || !assetEntity /*|| assetEntity.count == null*/) {
            qualified = false
        } else {
            const applianceCount = Number(applyNumber)
            qualified = assetEntity.count == null ? applianceCount > 0 : (applianceCount <= assetEntity.count && applianceCount > 0)
        }
        this.setData({
            qualifiedToApply: qualified
        })
    },

    bindKeyInput: function (e) {
        const applyNumber = e.detail.value
        this.setData({
            applyNumber
        })
        this.checkQualifiedToApply(this.data)
    },
    bindApplyUser(e) {
        const user = this.to ? [{userdid: this.to}] : []
        wx.navigateTo({
          url: `/pages/member/memberList/memberList?selected=${encodeURIComponent(JSON.stringify(user))}&singlePick=true`,
          events: {
            // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
            acceptDataFromOpenedPage: (data) => {
                this.setData({
                    applyUser: data[0],
                    'applyUser.name': data[0].name
                })
            },
          }
        })
    },
    createCode() {
        this.setData({
            codeVisiable: true
        })
        wx.createSelectorQuery()
        .select('#qrCode')
        .fields({
            node: true,
            size: true,
        })
        .exec((res) => {
            if (!res) { return; }
            const userdid = wx.getStorageSync('LoginInfo').userInfo.did;
            const param = {space: this.data.spaceDid}
            let canvas = res[0].node;
            drawQrcode({
                canvas,
                canvasId: 'qrCode',
                width: res[0].width,
                height: res[0].height,
                text: `https://office.ibroadlink.com/did/${this.did}?act=transfer&to=${userdid}&param=${JSON.stringify(param)}`,
            })
        })
        this.fetchDevicesOwner();
    },
    closeCode() {
        this.setData({
            codeVisiable: false
        })
        if (this.timer) {
            clearInterval(this.timer)
        }
    },
    // 获取申请人信息
    getApplyUserInfo () {
        let memberList = wx.getStorageSync('MemberList');
        memberList.list.forEach(item => {
            item.list.forEach(user => {
                if (user.did === this.to) {
                    this.setData({
                        applyUser: user,
                        'applyUser.name': user.name
                    })
                }
            })
        })
    },
    back() {
        wx.navigateBack()
    },
    agree() {
        const info = getUserInfo();
        // 需要防抖
        fetchData({
            url: '/vtservice/v1/devControl',
            requestData: {
                did: this.did,
                pid: this.pid, //创建时必须传入,did为空
                act: 'set',
                cmd:{
                    space: this.param.space, //chown时必须传入
                } //创建和设置时有效
            },
            extraHeader: {
                requserid: info.userid
            }
        }).then(({data}) => {
            if (data.status === 0) {
                this.devMove();
            }
        })
    },
    // 转移
    devMove() {
        const info = getUserInfo();
        fetchData({
            url: '/vtservice/v1/devControl',
            requestData: {
                did: this.did,
                pid: this.pid, //创建时必须传入,did为空
                act: 'chown',
                cmd:{
                    owner: this.data.applyUser.userid, //chown时必须传入
                } //创建和设置时有效
            },
            extraHeader: {
                requserid: info.userid
            }
        }).then(({data}) => {
            if (data.status === 0) {
                wx.showToast({
                  title: '资产转移成功',
                })
                setTimeout(() => {
                    this.back()
                }, 1000);
            }
        })
    },
    getSpaceInfo() {
        fetchData({
            url: '/sfsaas/api/filter/vtinfo',
            requestData: {
              pid: SPACE_PID,
              did: this.param.space
            },
            autoLoading: false,
            extraHeader: {
                xcolumn: true,
                xquery: true
            }
        }).then(({data}) => {
            this.setData({
                spaceDid: data.data.did,
                spaceName: data.data.name
            })
        })
    },
    // 轮询当前设备是否是自己的设备
    fetchDevicesOwner() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        const userinfo = getUserInfo()
        this.timer = setInterval(() => {
            vtInfo(this.did).then((data) => {
                if (data.data.owner === userinfo.did) {
                    clearInterval(this.timer);
                    this.setData({
                        isOwner: true,
                        codeVisiable: false,
                        assetEntity: data.data
                    })
                }
            })
        }, 3000)
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
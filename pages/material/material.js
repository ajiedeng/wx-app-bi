import {AC_PID, CLEANING_PID, goCertainDetailPage, LIGHT_PID, SECURITY_PID, SPACE_PID} from "../../utils/specialPIDs";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {getEntityByID, getVtConfigByPid, store} from "../../store/store";
import {notifyError} from "../../utils/util";
import {fetchData} from "../../utils/net";
import {getSpaceCode} from "./getSpaceCode";
import {getUserInfo} from "../../utils/loginInfo";
import {getDidFromQRCode} from "../../utils/qrCode";
import {vtControl} from "../commonServices";

// pages/material/material.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        items: [
            {
                icon: './images/icon_xiangqing.svg',
                label: '详情',
                onClick: 'goDetail'
            },
            {
                icon: './images/icon_xunjian.svg',
                label: '入库',
                onClick: 'storage'
            }
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.pid = options.pid
        this.did = options.did

        this.storeBindings = createStoreBindings(
            this, {
                store,
                fields: {
                    entity: () => getEntityByID(this.did),
                    vtConfig: () => getVtConfigByPid(this.pid)
                }
            }
        )

    },

    goDetail() {

        wx.navigateTo({
            url: `/pages/addVt/addVt?pid=${this.pid}&did=${this.did}`,
        })
    },


    storage() {
        wx.scanCode().then(res => {
            console.log('--scanCode--res', res);
            const spaceId = getDidFromQRCode(res.result)
            if (spaceId) {

                return getSpaceCode(spaceId).then(spaceCode=>vtControl({
                    did: this.did,
                    pid: this.pid,
                    act: "set",
                    cmd: {
                        space:spaceId,
                        spacecode:spaceCode
                    }
                })).then(()=>vtControl({
                    did: this.did,
                    pid: this.pid,
                    act: "chown",
                    cmd: {owner:getUserInfo(true).userid}
                })).then(()=>{
                    wx.redirectTo({
                        url:'./storeSuccess'
                    })
                })
            } else {
                throw '入库失败，二维码信息有误'
            }
        }).then(()=>{
            wx.showToast({
                title: '入库成功',
                icon: 'none'
            })
        }).catch(e => {
            if(e && !e.handled && !(e.errMsg && e.errMsg.indexOf('fail cancel') !== -1)){
                notifyError(e)
            }else{
                console.error(e)
            }

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
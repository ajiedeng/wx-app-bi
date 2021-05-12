//index.js
//获取应用实例
import {store} from "../../store/store";

const app = getApp()
const {fetchData} = require('../../utils/net')
const {deleteLoginInfo, getUserInfo} = require('../../utils/loginInfo')

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        menushow: true,
        nickName: "",
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        loading: false,
        // color: '#000',
        background: '#fff',
        show: true,
        animated: false
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {

        // if (app.globalData.userInfo) {
        //   this.setData({
        //     userInfo: app.globalData.userInfo,
        //     hasUserInfo: true
        //   })
        // } else if (this.data.canIUse){
        //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //   // 所以此处加入 callback 以防止这种情况
        //   app.userInfoReadyCallback = res => {
        //     this.setData({
        //       userInfo: res.userInfo,
        //       hasUserInfo: true
        //     })
        //   }
        // } else {
        //   // 在没有 open-type=getUserInfo 版本的兼容处理
        //   wx.getUserInfo({
        //     success: res => {
        //       app.globalData.userInfo = res.userInfo
        //       this.setData({
        //         userInfo: res.userInfo,
        //         hasUserInfo: true
        //       })
        //     }
        //   })
        // }

        this.setData({
            menushow: true,
            nickName: getUserInfo(true).nickname || '昵称'
        });
    },
    // getUserInfo: function(e) {
    //   console.log(e)
    //   app.globalData.userInfo = e.detail.userInfo
    //   this.setData({
    //     userInfo: e.detail.userInfo,
    //     hasUserInfo: true,
    //   })
    // },
    btnclick: function () {
        this.setData({
            menushow: true,
            nickName: getUserInfo(true).nickname || '昵称'
        });
        console.log('getUserInfo:', getUserInfo());
    },
    outLeftMenu: function () {
        // const isOutLogin = getUserInfo(true).loginsession;
        // if(!isOutLogin){
        //   this.setData({
        //     menushow: false
        //   });
        //   return
        // }
        fetchData({
            url: '/sfsaas/api/user/logout',
            requestData: {
                "loginsession": getUserInfo(true).loginsession
            },
            checkLoggedIn: false
        }).then((res) => {
            console.log('res==', res);
        }).finally(e => {
            this.setData({
                menushow: false
            });
            deleteLoginInfo();
            wx.reLaunch({
                url: '../beforelogin/beforelogin',
            })
            store.reset()
        })
    }
})

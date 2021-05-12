// pages/login/login.js
import {saveLogin} from "./saveLogin";
import {saveBindUUIDFlag} from "../../utils/loginInfo";
import {bindUUID} from "./bindUUID";

const {fetchData} = require('../../utils/net')
const {simpleModal, handleUrlParams} = require('../../utils/util')
const {saveLoginInfo,getUserInfo} = require('../../utils/loginInfo')

const sha1 = require('./sha1')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        //发送验证倒计时
        countdown: 0,
        useVCode: true,//使用验证码登录，false使用密码
        formData: {},
        rules: [{
            name: 'mobile',
            rules: [{
                required: true,
                message: '请输入手机号码'
            }, {
                mobile: true,
                message: '手机号码格式不对'
            }],
        },
            {
                name: 'vcode',
                rules: {
                    required: true,
                    message: '请输入验证码或密码'
                },
            }
        ],
        options: {}
    },

    switch() {
        this.setData({
            useVCode: !this.data.useVCode
        })
    },

    formInputChange(e) {
        const {
            field
        } = e.currentTarget.dataset
        this.setData({
            [`formData.${field}`]: e.detail.value
        })
    },

    handlerValidErrors(...errors) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
            this.setData({
                error: errors[firstError[0]].message
            })

        }
    },

    getVcode() {
        if (!this.data.countdown) {
            this.selectComponent('#form').validateField('mobile', (valid, errors) => {
                console.log('valid', valid, errors)
                if (valid) {
                    let {mobile} = this.data.formData
                    fetchData({
                        url: '/sfsaas/api/user/logincode',
                        requestData: {
                            "countrycode": "0086",
                            "phone": mobile,
                            "email": ""
                        },
                        checkLoggedIn: false
                    }).then(() => {
                        this.setData({
                            countdown: 60
                        }, function () {
                            this.inervalID = setInterval(() => {
                                const {countdown} = this.data
                                if (countdown > 0) {
                                    this.setData({
                                        countdown: countdown - 1
                                    })
                                } else {
                                    clearInterval(this.inervalID)
                                }
                            }, 1000)
                        })
                    })
                } else {
                    this.handlerValidErrors(errors)
                }
            })
        }
    },

    requestLogin() {
        const {useVCode} = this.data
        const {mobile, vcode} = this.data.formData
        if (useVCode) {
            return fetchData({
                url: '/sfsaas/api/user/login',
                requestData: {
                    "countrycode": "0086",
                    "phone": mobile,
                    "code": vcode,
                    "email": ""
                },
                checkLoggedIn: false
            })
        } else {
            return fetchData({
                url: '/sfsaas/api/user/pwdlogin',
                requestData: {
                    "countrycode": "0086",
                    "phone": mobile,
                    "password": sha1(vcode + '4969fj#k23#'),
                    "email": ""
                },
                checkLoggedIn: false
            })
        }
    },
/* not used anymore (delete it later)  by doudehou
    bindGetUserInfo(res){
        console.log(res.detail)

        fetchData({
            url: '/alarmer/v1/wechat/user/bind',
            requestData: {
                "countrycode": "0086",
                "phone": mobile,
                "password": sha1(vcode + '4969fj#k23#'),
                "email": ""
            },
            checkLoggedIn: false
        })
    },
*/
    submitForm(res) {
        console.log(res.detail)
        if(!res.detail || !res.detail.encryptedData){
            return
        }
        // const {} = res.datail
        this.selectComponent('#form').validate((valid, errors) => {
            console.log('valid', valid, errors)
            if (valid) {
                this.requestLogin().then(({data, cookies}) => {
                    saveLogin(cookies, data)

                    const {encryptedData,iv} = res.detail
                    const {wxLoginCode} = this.data
                    const params = handleUrlParams(this.data.options);
                    return bindUUID(wxLoginCode,encryptedData,iv).then(()=>{
                        wx.reLaunch({
                            url: `/pages/control/control${params ? '?' + params : ''}`,
                        })
                    }).catch(() => {
                        wx.reLaunch({
                            url: `/pages/control/control${params ? '?' + params : ''}`,
                        })
                    })

                }).catch(e=>{
                    wx.login().then(({code}) => {
                        this.setData({
                            wxLoginCode:code
                        })
                    })
                })
            } else {
                this.handlerValidErrors(...errors)
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            options
        })
        wx.login().then(({code}) => {
            this.setData({
                wxLoginCode:code
            })
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
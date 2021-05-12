// pages/beforelogin/beforelogin.js
import { isLogged } from "../../utils/loginInfo";
import { fetchData } from '../../utils/net';
import { saveLogin } from "../login/saveLogin";
import { getApplyInfo, getLastApply } from "../visitor/isVisitor";
import {bindUUID} from "../login/bindUUID";
import { handleUrlParams } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // color: '#000',
    background: '#fff',
    show: true,
    animated: false,
    userInfo: {},
    options: {},
    preVisitor: false
  },
  goCountLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
    })
    if (options.page && options.page === '/pages/visitor/apply') {
      this.setData({
        preVisitor: true
      })
    }
    const newApplyFlag =  this.newApplyFlag = options.newApply
    const logged =  isLogged()
    this.wxLogin()
    const applyInfo = getApplyInfo()
    this.setData({
        logged: logged,
        department: applyInfo.companyID,
        departmentName: applyInfo.companyName,
        visituser: applyInfo.inviterID,
        visituserName: applyInfo.inviterName,
    })
  },
  blLogin(res) {
    const logged = false;//isLogged()

    const loginPromise = logged ? Promise.resolve() : new Promise((resolve, reject) => {
      const { errMsg, iv, encryptedData, nickname, phone } = res.detail
      this.iv = iv;
      this.encryptedData = encryptedData;
      this.nickname = nickname
      this.phone = phone
      if (!iv || !encryptedData) {
        reject('获取用户手机号失败')
        return
      }

      const { loginCode } = this.data
      fetchData({
        url: '/sfsaas/api/user/wechatlogin',
        requestData: {
          "jscode": loginCode,
          "extra": JSON.stringify({ iv, encryptedData })
        },
        checkLoggedIn: false
      }).then(({ data, cookies }) => {

        saveLogin(cookies, data)
        
        resolve(data)

        //更新login code 提供后续表单使用 ${params ? '?' + params : ''}
        this.wxLogin()
        let params = handleUrlParams(this.data.options);




        let info = data.info;
        // 如果用户没有关注公众号，将获取不到 unionid，所以暂时简单忽略掉 bind
        if (info.unionid === undefined) {
          wx.reLaunch({
            url: `/pages/control/control${params ? '?' + params : ''}`,
          })
          return;
        }


        bindUUID(loginCode, encryptedData,iv, info.companyid, info.did, info.unionid).then(()=>{
          wx.reLaunch({
            url: `/pages/control/control${params ? '?' + params : ''}`,
          })
        })
      }, (e) => {
        //更新login code 提供用户再次点击授权
        this.wxLogin()
        reject(e)
      })
    })
  },

  wxLogin() {
    this.setData({
      loginCode: null,
    })
    wx.login().then(res => {
      if (res.code) {
        //发起网络请求
        this.setData({
          loginCode: res.code
        })
      } else {
        console.log('登录失败！' + res.errMsg)
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
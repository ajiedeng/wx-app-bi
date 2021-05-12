// pages/control/control.js
import { getCookie, getUserInfo, getBindUUIDFlag } from '../../utils/loginInfo';
import { handleUrlParams } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    targetUrl: '',
    targetUrlList: {
      0: '/pages/index/index',
      1: '/pages/visitor/apply',
      2: '/pages/visitor/apply'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options
    })
    const loginCookie = getCookie()
    const bindUUIDFlag = getBindUUIDFlag()
    //检查是否已经登录
    // 如果用户没有关注公众号，将获取不到 unionid，所以暂时简单忽略掉 bind
    if (!loginCookie/* || !bindUUIDFlag*/) {
        wx.showToast({
            title: '请先登录',
            icon: 'success',
            duration: 2000
        })
        this.forceLogin()
        return
    } else {
      const userinfo = getUserInfo()
      this.getUserIdentity(userinfo.staffstatus);
    }
  },
  // 强制登录
  forceLogin() {
    const currentPage = getCurrentPages().pop()
    const loginUrl = 'pages/beforelogin/beforelogin'
    let params = handleUrlParams(this.data.options);
    if (currentPage.route !== loginUrl) {
        wx.reLaunch({
            url: `/pages/beforelogin/beforelogin${params ? '?' + params : ''}`
        })
    }
  },
  // 判断是访客或是员工
  getUserIdentity(status) {
    let targetUrl = '/pages/index/index';
    const hasPage = this.hasPage();
    const params = handleUrlParams(this.data.options);
    let userStatus = status;
    if (!String(userStatus)) {
      userStatus = 2;
    }
    targetUrl = this.data.targetUrlList[userStatus]
    targetUrl = hasPage ? this.data.targetUrl : targetUrl;
    wx.reLaunch({
      url: `${targetUrl}${params ? '?'+ params : ''}`
    })
  },
  hasPage() {
    const options = this.data.options;
    if (options.page) {
      this.setData({
        targetUrl: options.page
      })
      delete this.data.options.page;
      return true
    }
    return false
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
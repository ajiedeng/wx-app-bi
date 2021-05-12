// pages/meetingMem/meetingMem.js
import {fetchData} from "../../../utils/net"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // mp-navigation-bar
    loading: false,
    show: true,
    animated: false,
    pullDownFlag: false,
    color: '#000000',
    background: '#FFFFFF',
    latitude: 0,
    longitude: 0,
    passwordDialogShow: false,
    // mp-navigation-bar
    meetingMember: '与会人员',
    contentHeight: null,
    currentStatus: 0,
    member: {
      noRes: 0,
      agree: 0,
      disAgree: 0
    },
    memberInfo: [],
    memberList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.did = options.did
    this.getMeetingMemberList();
  },
  // 获取与会人员列表
  getMeetingMemberList: function () {
    fetchData({
      url: "/vt/meetingroom/reservation/detail",
      requestData: {
          did: this.did
      },
      extraHeader: this.data.extraHeader
    }).then(({data}) => {
      try {
        this.setData({
          memberInfo: data.data.relateusers
        })
        this.getTabNumber();
        this.getTopNum();
        this.changeMember(0);
      } catch (e) {
          notifyError(e, '服务器返回格式有误')
      }
    })
  },
  // 返回上一页
  goBack: function () {
    wx.navigateBack();
  },
  // 顶部页签数字
  getTabNumber: function () {
    let member = {
      noRes: 0,
      agree: 0,
      disAgree: 0
    }
    this.data.memberInfo.forEach(item => {
      switch(item.attendstatus) {
        case 0:
          member.noRes++;
          break;
        case 1:
          member.agree++;
          break;
        case 2:
          member.disAgree++;
          break;
        default:
          break;
      }
    })
    this.setData({
      member: member
    })
  },
  // 顶部切换
  changeMember: function (e) {
    let status = typeof e === 'object' ? e.currentTarget.dataset.status : e;
    let data = this.data.memberInfo.filter(item => {
      return Number(item.attendstatus) === Number(status);
    })
    this.setData({
      currentStatus: Number(status),
      memberList: data
    })
  },
  //设置内容距离顶部的高
  getTopNum: function() {
    let self = this;
    const query = wx.createSelectorQuery()
    query.select('#content').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      self.setData({
        contentHeight: res[0].top // #the-id节点的上边界坐标
      })
    })
  }
})
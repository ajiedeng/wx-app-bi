// pages/meetingRoom/meetingRoom.js
import {fetchData} from "../../../utils/net"
import {notifyError, formatDate, isIPhone} from "../../../utils/util"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    meetingInfo: {},
    extraHeader: {
      reqUserId: ''
    },
    // mp-navigation-bar
    loading: false,
    show: true,
    animated: false,
    pullDownFlag: false,
    color: '#FFFFFF',
    background: '#007FFF',
    latitude: 0,
    longitude: 0,
    passwordDialogShow: false,
    // mp-navigation-bar

    // 是否邀请创建人
    isInviteCreator: true,
    // 中间列表信息
    meetingContent: [{
      label: '会议室',
      key: 'roomName',
      value: '',
    }, {
      label: '主题',
      key: 'name',
      value: '',
    },{
      label: '会议日期',
      key: 'meetingdate',
      value: ''
    },{
      label: '会议时间',
      key: 'duration',
      value: ''
    },{
      label: '会议组织者',
      key: 'createusername',
      value: ''
    },{
      label: '与会人员',
      key: 'relateuser',
      value: {
        invited: 0,
        agreed: 0,
        disAgreed: 0
      }
    },{
      label: '备注',
      key: 'note',
      value: ''
    }],

    // 导航下方的状态信息
    meetingAppointment: '会议室预约',
    meetingDetail: '会议室详情',
    meetingStatusMsg: '', // 会议室预约状态
    meetingStatusNote: '',// 状态下面的提示消息
    meetingStatus: null,// 状态对应的图标
    meetingCancelReason: '',
    meetingTypeList: [
      {
        src: './image/success.svg',
        status: '审核中',
      }, {
        src: './image/success.svg',
        status: '预约成功',
      }, {
        src: './image/shibai.svg',
        status: '预约失败',
      }, 
      {
        src: './image/quxiao.svg',
        status: '预约取消',
      }, 
      {
        src: './image/biangeng.svg',
        status: '预约变更',
      }, 
      {
        src: './image/dengdai.svg',
        status: '会议即将开始',
      }, 
      {
        src: './image/huiyizhong.svg',
        status: '会议中',
      }, 
      {
        src: './image/dengdai.svg',
        status: '会议即将结束',
      }, 
      {
        src: './image/success.svg',
        status: '会议结束',
      }
    ],
    stragyList: {
      edit: [1, 4, 5, 6, 7],
      cancle: [1,4,5],
      preOver: [6,7],
      continue: [7],
      agree: [1,4,5],
    },
    statusStragy: {
      editShow: false,
      cancleShow: false,
      preOverShow: false,
      continueShow: false,
      agreeShow: false
    },
    bottomTemplate: 'endOrCon', // 底部选用模板
    //不参与
    disagreeErr: false,
    disagreeShow: false,
    disaggreeReason: '',
    agree: { // 参加，不参加会议， hasChoosed 是否已经选择，isAgree 是否参加会议
      hasChoosed: false,
      isAgree: false
    },
    // 判断是否是创建人，编辑 取消预约是否显示
    isCreator: false,
    // 取消预约
    showCancle: false,
    cancleReason: '',
    reasonErrShow: false, // 当用户不输入点击确认时显示
  },
  /**
   * 点击参加或不参加会议
   * @param {*} hasChoosed  // 是否已经选择
   * @param {*} isAgree   // 是否同意参加会议
   */
  agreeMeeting: function (event) {
    const hasChoosed = event.currentTarget.dataset.haschoosed;
    const isAgree = event.currentTarget.dataset.isagree;
    if (isAgree === 'true') {
      this.agreeMeetingFun(hasChoosed === 'true', isAgree === 'true')
    } else {
      this.setData({
        disagreeShow: true
      })
    }

  },
  // 参与不参与接口
  agreeMeetingFun: function (hasChoosed, isAgree) {
    //  1-参加，2-不参加
    fetchData({
      url: '/vt/meetingroom/reservation/relateuser/confirm',
      requestData: {
        'reservationdid': this.data.meetingInfo.did,
        'attendstatus': isAgree ? 1 : 2,
        'reason': this.data.disaggreeReason
      },
      extraHeader: this.data.extraHeader
    }).then(() => {
      this.setData({
        agree: {
          hasChoosed: hasChoosed,
          isAgree: isAgree
        }
      })
      if (!isAgree) {
        this.closeDis()
      }
      wx.showToast({
        title: this.data.agree.isAgree ? '参与成功' : '不参与成功'
      })
      this.getMeetingDetail();
    })
  },
  // 提前结束会议
  meetingPreEndFun: function (e) {
    let self = this;
    wx.showModal({
      title: '',
      content: '确认提前结束会议？',
      success (res) {
        if (res.confirm) {
          self.endOfMeeting();
        }
      }
    })
  },
  // 结束会议
  endOfMeeting: function () {
    fetchData({
      url: '/vt/meetingroom/reservation/over',
      requestData: {
        "did": this.did,
      },
      extraHeader: this.data.extraHeader
    }).then(({data})=> {
      // 结束成功后，返回会议室预约列表
      this.goBack();
    })
    
  },
  // 会议续约
  meetingAddTime: function (e) {
    this.meetingDelay();
  },
  // 会议室续约时间
  meetingDelay: function () {
    fetchData({
      url: '/vt/meetingroom/reservation/daley',
      requestData: {
        "did": this.did,
      },
      extraHeader: this.data.extraHeader
    }).then(({data})=> {
      wx.showToast({
        title: '续约成功',
        icon: 'success',
        duration: 1000
      })
      this.getMeetingDetail();
    })
  },
  // 查看与会人员
  checkMeetingMem: function (e) {
    wx.navigateTo({
      url: `/pages/meeting/meetingMem/meetingMem?did=${this.did}`,
    })
  },
  // 返回上一页
  goBack: function () {
    this.closeModule();
    wx.navigateBack();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onLoad: function (options) {
    this.pid = options.pid
    this.did = options.did
    this.setData({
      extraHeader: {
        reqUserId: wx.getStorageSync('LoginInfo').userInfo.userid || ''
      }
      
    })
    wx.nextTick(() => {
      if (this.did) {
        this.getMeetingDetail();
      }
    })
  },
  // 获取会议室详情
  getMeetingDetail: function () {
    fetchData({
      url: "/vt/meetingroom/reservation/detail",
      requestData: {
          did: this.did
      },
      extraHeader: this.data.extraHeader
    }).then(({data}) => {
      try {
          this.setData({
            meetingInfo: data.data
          });
          this.checkIsCreator();
          this.getMeetingStatus();
          this.putValueOnPage();
      } catch (e) {
          notifyError(e, '服务器返回格式有误')
      }
    })
  },
  // 判断当前是否是创建人, 同时判断是否邀请自己
  checkIsCreator: function () {
    let self = this;
    wx.getStorage({
      key: 'LoginInfo',
      success (res) {
        const userid = res.data.userInfo.userid;
        const meetingCreatorid = self.data.meetingInfo.createuserid;
        const userinfo = self.data.meetingInfo.relateusers.find(item => {
          return item.userdid === res.data.userInfo.did
        })
        self.setData({
          isCreator: userid === meetingCreatorid,
          isInviteCreator: Boolean(userinfo)
        })
        self.checkIsReadyChoose(self.data.meetingInfo.relateusers);
      }
    })
  },
  // 给会议室预约页面信息赋值
  putValueOnPage: function () {
    let data = [];
    this.data.meetingContent.forEach((item, index) => {
      if (this.data.meetingInfo.hasOwnProperty(item.key)) {
        const value = this.data.meetingInfo[item.key];
        item.value = item.key === 'meetingdate' ? formatDate(new Date(value * 1000)) : value;
      } else {
        switch (item.key) {
          case 'roomName':
            item.value = this.data.meetingInfo.room.name;
            break;
          case 'relateuser':
            const mem = this.data.meetingInfo.relateusers;
            item.value.invited = mem.length || 0;
            item.value.disAgreed = mem.length && mem.filter(item => {
              return item.attendstatus === 2;
            }).length || 0;
            item.value.agreed = mem.length && mem.filter(item => {
              return item.attendstatus === 1;
            }).length || 0;

            break;
          case 'duration':
            const {starttime, endtime} = this.data.meetingInfo
            item.value = `${this.timeFormat(starttime)}-${this.timeFormat(endtime)}`;
            break;
          default:
            break;
        }
      }
      data.push(item);
    })
    this.setData({
      meetingContent: data
    });
  },
  // 获取会议室状态
  getMeetingStatus: function () {
    let status = this.data.meetingInfo.reservstatus;
    let reason = this.data.meetingInfo.reason;
    let _this = this.data.stragyList;
    this.setData({
      meetingStatus: status,
      meetingCancelReason: reason,
      statusStragy: {
        editShow: _this.edit.includes(status),
        cancleShow: _this.cancle.includes(status),
        preOverShow: _this.preOver.includes(status),
        continueShow: _this.continue.includes(status),
        agreeShow: _this.agree.includes(status)  
      }
    })
  },
  // 时间处理方法
  timeFormat: function (value) {
    let time = Number(value + 1);
    let h = Math.floor(time/3600);
    let m = Math.floor(time%3600/60);
    if (h < 10) { h = `0${h}`; }
    if (m < 10) { m = `0${m}`; }
    return `${h}:${m}`;
  },
  // 编辑按钮事件
  onEdit: function () {
    wx.navigateTo({
      url: `/pages/addVt/addVt?pid=${this.pid}&did=${this.did}`,
    })
  },
  // 取消预约事件
  onCanclePre: function () {
    this.setData({
      showCancle: true
    })
  },
  // 关闭弹窗
  closeModule: function () {
    this.setData({
      showCancle: false,
      cancleReason: '',
      reasonErrShow: false
    })
  },
  // 更改取消预约的值
  cancleReason:function (e) {
    let key = e.currentTarget.dataset.reason;
    let value = e.detail.value;
    let map = {
      reasonErrShow: !value
    }
    map[key] = value;
    this.setData(map);
  },
  // 校验
  checkReason: function (e) {
    let value = e.detail.value;
    if (value && this.data.reasonErrShow) {
      this.setData({
        reasonErrShow: false
      })
    }
  },
  // 确认取消预约
  confirmConcle: function () {
    if (!this.data.cancleReason) { return; }
    fetchData({
      url: '/vt/meetingroom/reservation/cancel',
      requestData: {
        "did": this.did,
        'reason': this.data.cancleReason
      },
      extraHeader: this.data.extraHeader
    }).then(({data})=> {
      // 取消成功后，返回会议室预约列表
      this.setData({
        showCancle: false,
        cancleReason: ''
      });
      this.goBack();
    })
  },

  // 关闭不参与弹窗
  closeDis: function () {
    this.setData({
      disagreeErr: false,
      disagreeShow: false,
      disaggreeReason: '',
    })
  },
  // 更改取消预约的值
  disaggreeReason:function (e) {
    let key = e.currentTarget.dataset.reason;
    let value = e.detail.value;
    let map = {
      disagreeErr: !value
    }
    map[key] = value;
    this.setData(map);
  },
  // 校验
  checkdisReason: function (e) {
    let value = e.detail.value;
    if (value && this.data.disagreeErr) {
      this.setData({
        disagreeErr: false
      })
    }
  },
  // 确认不参与俄
  confirmDis: function () {
    if (!this.data.disaggreeReason) { return; }
    this.agreeMeetingFun(true, false);
  },
  // 用户是否已经选择参与或不参与
  checkIsReadyChoose: function () {
    let userid = wx.getStorageSync('LoginInfo').userInfo.did || '';
    let attendstatus = 0;
    let userinfo;
    if (!this.data.meetingInfo.relateusers.length) {return;}
    userinfo = this.data.meetingInfo.relateusers.find(item => {
      return item.userdid === userid
    })
    attendstatus = userinfo ? userinfo.attendstatus : attendstatus
    this.setData({
      agree: {
        hasChoosed: attendstatus === 0 ? false : true,
        isAgree: attendstatus === 1 ? true : false
      }
    })
  },
   /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getMeetingDetail();
  },
})
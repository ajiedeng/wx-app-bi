//index.js
//获取应用实例

const {
  fetchData:fetchRequest
} = require('../../utils/net');
const {getUserInfo} = require('../../utils/loginInfo')

const app = getApp()

const fetchData = function (url,data) {
  return fetchRequest({
    url,
    requestData:data,
    checkLoggedIn:true,
    autoLoading:false
  })
}

// const ondutyTag = ['正常','迟到','未打卡'];
// const offdutyTag = ['正常','早退'];

function getClockTime() {
  const date = new Date();
  const hours = date.getHours();
  const mins = date.getMinutes();
  const seconds = date.getSeconds();
  return (hours > 9 ? hours : '0' + hours) + ':' + (mins > 9 ? mins : '0' + mins) + ':' + (seconds > 9 ? seconds : '0' + seconds)
}

function getDateString(time) {
  const date = time ? new Date(time) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const _date = date.getDate();
  console.log('-----date-query-', year + '-' + (month > 9 ? month : '0' + month) + '-' + (_date > 9 ? _date : '0' + _date))
  return year + '-' + (month > 9 ? month : '0' + month) + '-' + (_date > 9 ? _date : '0' + _date)
}

function checkcardTimerToday(createtime) { //createtime为时间戳秒数
  return getDateString() === getDateString(createtime * 1000)
}

function secondsToTime(seconds, type, ondutytime) {
  let time = 0,
    tag = '正常';
  const curTime = new Date();
  if (seconds > 0) {
    const _date = new Date(seconds * 1000);
    const hours = _date.getHours();
    const minutes = _date.getMinutes();
    time = (hours > 9 ? hours : '0' + hours) + ':' + (minutes > 9 ? minutes : '0' + minutes)
  }
  if (type === 'on') {
    if (seconds > (curTime.setHours(9, 0, 0, 0) / 1000)) {
      tag = '迟到';
    }
    // else if(seconds==0 && curTime.getTime()>curTime.setHours(12,0,0,0)){
    //   tag = '未打卡';
    // }
  } else {
    if (seconds - ondutytime < 32400) {
      tag = '早退';
    }
  }
  return {
    time,
    tag
  }
}

function updateDutyInfo({
  ondutytime = 0,
  offdutytime = 0
}) {
  console.log('---onduty---', secondsToTime(ondutytime, 'on'));
  return {
    "onduty": secondsToTime(ondutytime, 'on'),
    "offduty": secondsToTime(offdutytime, 'off', ondutytime)
  }
}

// const userInfo = getLoginInfo().info;
let locationError = false;

Page({
  data: {
    ondutyTag: '',
    offdutyTag: '',
    morning: new Date().getHours() < 12,
    offdutytime: '',
    clockTime: getClockTime(),
    lateFlag: new Date().getTime() > new Date().setHours(9, 0, 0, 0),
    offdutytype: 2,
    ondutytime: '',
    ondutytype: 2,
    cardInfo: {},
    latitude: 0,
    longitude: 0,
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // userInfo: getLoginInfo().info,
    circleBtnShow: true,
    circleTxt: '定位中...',
    loading: false,
    // color: '#000',
    background: '#fff',
    show: true,
    animated: false
  },
  //事件处理函数
  goToListDetail: function (e) {
    console.log('----goToListDetail-----', e.currentTarget.dataset.pid);
    wx.navigateTo({
      url: '../logs/logs' + '?pid=' + e.currentTarget.dataset.pid
    })
  },
  errorHandle({
    error,
    errorMsg,
    circleBtnShow=false,
    circleTxt
  }) {
    if (!error.handled) {
      console.log(`---${errorMsg}---`, error);
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      })
    }else{
      setTimeout(function () {
        wx.hideLoading()
      }, 100)
    }
    let _data; 
    if(circleTxt){
      locationError = true;
      _data = {circleBtnShow,circleTxt,latitude: 0,longitude: 0} 
    }else{
      _data = {circleBtnShow}
    }
    this.setData(_data)
  },

  addTimecard() {
    fetchData('/sfsaas/api/vtcommon/create', {
        "pid": "000000000000000000000000d4860100",
        "data": {
          name: getUserInfo(true).nickname + ' ' + getDateString() + ' 打卡记录',
          ondutytime: parseInt(new Date().getTime() / 1000),
          ondutylongitude: this.data.latitude,
          ondutylatitude: this.data.longitude,
          offdutylongitude: this.data.latitude,
          offdutylatitude: this.data.longitude,
          offdutytime: 0,
          ondutytype: 2,
          offdutytype: 2
        }
      }, true, false)
      .then(e => this.getTimecard(false))
      .catch(error => this.errorHandle({
        error,
        errorMsg: '考勤任务添加出错'
      }))
    // .finally(e=>this.getTimecard(false));
  },
  modifyTimecard() {
    fetchData('/sfsaas/api/vtcommon/update', {
        "pid": "000000000000000000000000d4860100",
        "did": this.data.cardInfo.did,
        "data": {
          name: getUserInfo(true).nickname + ' ' + getDateString() + ' 打卡记录',
          offdutylongitude: this.data.latitude,
          offdutylatitude: this.data.longitude,
          offdutytime: parseInt(new Date().getTime() / 1000),
          offdutytype: 2
        }
      }, true, false)
      .then(e => this.getTimecard(false))
      .catch(error => this.errorHandle({
        error,
        errorMsg: '考勤任务更新出错'
      }))
    // .finally(e=>this.getTimecard(false));
  },

  addOrModifyCard() {
    console.log('----------this.data---', this.data);
    wx.showLoading({
      title: '加载中',
    })
    if (!this.data.latitude && !this.data.longitude) { //未获取到位置信息
      console.log('---get--location-');
      this.getLocation().then(res=>this.getTimecard());
      return
    }
    if (!this.data.ondutytime) { //如果没有上班时间数据，需要添加打上班卡信息，下班时间传0
      // 考勤任务增加
      this.addTimecard();
    } else { //有上班时间且下班时间为0，表示需要打下班卡,或者更新下班卡
      this.modifyTimecard()
    }

  },
  updatecircleTxt(updateCmd) {
    if(!(this.data.latitude&&this.data.longitude)){
      return '定位中...';
    }else if(!updateCmd.ondutytime){
      return '上班打卡';
    }else if(updateCmd.ondutytime && updateCmd.offdutytime===0){
      return '下班打卡';
    }else{
      return '更新打卡';
    }

  },
  updateData(res,loadingFlag) {
    console.log('kaoqing--detail', res);
    let updateCmd = null;
    if (res && res.data && res.data.result && res.data.result.data) { //有数据
      let filterBydid = res.data.result.data.filter((item) => item.creator === getUserInfo().did);
      console.log('---filterBydid--', filterBydid);
      if (filterBydid && filterBydid[0] && checkcardTimerToday(filterBydid[0].createtime)) {//筛选出当天数据
        const dutyInfo = updateDutyInfo({
          ondutytime: filterBydid[0].ondutytime,
          offdutytime: filterBydid[0].offdutytime,
        });
        updateCmd = {
          cardInfo: filterBydid[0],
          ondutytime: dutyInfo.onduty.time, //0-未打卡
          offdutytime: dutyInfo.offduty.time,
          ondutyTag: dutyInfo.onduty.tag,
          offdutyTag: dutyInfo.offduty.tag,
        };
        if (dutyInfo.onduty.time) {
          updateCmd.morning = false
        }
        if(!locationError){//获取到位置信息，则更新圆圈内的文案
          updateCmd.circleTxt = this.updatecircleTxt(updateCmd);
        }
        
      } else { //无当天数据
        updateCmd = {
          ondutytime: '',
          offdutytime: ''
        }
        if(!locationError){
          updateCmd.circleTxt = '上班打卡'
        }
      }
    } else { //无任何数据
      updateCmd = {
        ondutytime: '',
        offdutytime: '',
      }
      if(!locationError){
        updateCmd.circleTxt = '上班打卡'
      }
    }
    this.setData(updateCmd);

    if(!loadingFlag){//表示操作后的查询更新
      wx.showToast({
        title: '操作成功'
      })
    }else{
      if(!locationError){//位置出错时，解决loading与toast同时出现覆盖问题
        setTimeout(function () {
          wx.hideLoading()
        }, 100)
      }
    }

  },

  getTimecard(loadingFlag = true) {//考情任务查询
    console.error('---locationError---',locationError);
    if (loadingFlag && !locationError) {
      wx.showLoading({
        title: '加载中',
      })
    }
    fetchData('/sfsaas/api/filter/list', {
        "pid": "000000000000000000000000d4860100"
      }, true, false)
      .then(res => {
        console.log('kaoqing', res);
        return fetchData('/sfsaas/api/filter/query', {
          "did": res.data.result[0].did,
          "page": 1,
          "pagesize": 20,
          "filter": [{
            "creator": [getUserInfo(true).did]
          }],
          "sort": {
            "column": "createtime", // 排序字段
            "type": "desc" // 排序方式；asc-升序（由小到大） desc-降序（由大到小）
          }
        }, true, false)
      })
      .then(res => this.updateData(res,loadingFlag))
      .catch(error => this.errorHandle({
        error,
        errorMsg: '考勤任务数据查询出错'
      }));
  },

  getLocation() {
    console.time('getLocation');
    const that = this;
    return wx.getLocation({
      type: 'wgs84'
     })
     .then(res=>{
        const latitude = res.latitude * 1000000;
        const longitude = res.longitude * 1000000
        //  console.log('----latitude,longitude---',latitude,longitude);
        that.setData({
          latitude,
          longitude
        })
        locationError = false;
        console.timeEnd('getLocation');
     }).catch(error=>this.errorHandle({error,errorMsg:'GPS位置信息获取失败，请检查相关权限设置',circleBtnShow:true,circleTxt:'获取位置'}))
  },

  onLoad () {
    locationError = false;
    this.timer = setInterval(() => this.setData({
      clockTime: getClockTime()
    }), 1000)
    console.log('---getLoginInfo---', getUserInfo());

     //位置查询 => 任务信息查询
     this.getLocation().then(res=>this.getTimecard());
  },
  onShow (){
    //位置查询 => 任务信息查询
    this.getLocation().then(res=>this.getTimecard());
  },
  onUnload() {
    clearInterval(this.timer);
  }
})
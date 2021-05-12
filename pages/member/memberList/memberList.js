import { fetchData } from "../../../utils/net"
import { MEETING_MEMBER } from '../../../utils/specialPIDs'
import { simpleModal } from "../../../utils/util"

import { getFirstChart, getMemberLists } from '../../../utils/member'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage: 1,
    filter: [{ staffstatus: ["0"] }],
    chartSource: [],
    selectedMemberList: [],
    deleteTempMember: [],
    selectedNumb: 0,
    searchValue: '',
    searchResultList: [],
    searchSelectTemp: [],
    filterList: [
      { text: '姓名', value: 'name' },
      { text: '部门名称', value: 'organizationid.name' },
      { text: '电话', value: 'phonenumber' }
    ],
    filteValue: 'name',
    searchHolder: '姓名'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.singlePick) {
      this.singlePick = true;
    }
    this.getTopNum();
    this.getMemberLists();
    this.hasSelected(options);
  },
  // 获取一页的人员列表, 并page+1
  getMemberLists() {
    getMemberLists();
    let memberList = wx.getStorageSync('MemberList') || [];
    this.setData({
      chartSource: memberList.list
    })
  },
  // 多选择, 并更新已选人数
  onSelect(event) {
    if (this.singlePick) { this.singlePickAct() }
    const { index, charts } = event.currentTarget.dataset
    const findindex = this.data.chartSource.findIndex(item => {
      return item.firstChart === charts
    })
    let selectedNumb = this.data.selectedNumb;
    const selected = `chartSource[${findindex}].list[${index}].selected`
    if (!this.data.chartSource[findindex].list[index].selected) {
      selectedNumb++;
    } else {
      selectedNumb--;
    }
    this.setData({
      selectedNumb,
      [selected]: !this.data.chartSource[findindex].list[index].selected
    })
  },
  // 展示已选
  onCheckSelect() {
    if (!this.data.selectedNumb) { return }
    const selectedArr = this.getAlreadySelected();
    this.setData({
      selectedMemberList: selectedArr,
      selectedShow: true
    })
  },
  // 已选列表
  getAlreadySelected() {
    if (!this.data.selectedNumb) { return [] }
    const selectedArr = [];
    this.data.chartSource.forEach(item => {
      item.list.forEach(list => {
        if (!list.selected) { return }
        selectedArr.push(list)
      })
    })
    return selectedArr;
  },
  // 关闭已选
  onCheckClose() {
    this.setData({
      selectedShow: false,
      deleteTempMember: []
    })
  },
  // 删除已选
  onSelectedDel(event) {
    const index = event.currentTarget.dataset.index
    const deleted = this.data.selectedMemberList.splice(index, 1)
    const deleteTempMember = this.data.deleteTempMember.concat(deleted)
    this.setData({
      deleteTempMember,
      selectedMemberList: this.data.selectedMemberList
    })
    this.onConfirmDel();
  },
  // 确认删除
  onConfirmDel() {
    this.data.deleteTempMember.forEach(item => {
      const index = this.data.chartSource.findIndex(chart => {
        return chart.firstChart === item.chart
      })
      this.data.chartSource[index].list.find((mem, index) => {
        return mem.did === item.did
      }).selected = false
    })
    if (this.data.selectedNumb - this.data.deleteTempMember.length === 0) {
      this.setData({
        selectedShow: false
      })
    }
    this.setData({
      deleteTempMember: [],
      selectedNumb: this.data.selectedNumb - this.data.deleteTempMember.length,
      chartSource: this.data.chartSource
    })
  },
  // 确认取消
  onCancelDel() {
    this.setData({
      selectedShow: false,
      deleteTempMember: []
    })
  },
  // 确认选择
  confirmMemberList() {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('acceptDataFromOpenedPage', this.getAlreadySelected())
    wx.navigateBack()
  },
  // 搜索
  onSearch() {
    this.data.chartSource.forEach(item => {
      let hiddenNum = 0;
      item.list.forEach(mem => {
        let hidden = !mem[this.data.filteValue].toLocaleLowerCase().includes(this.data.searchValue.toLocaleLowerCase())
        hiddenNum += hidden ? 1 : 0;
        mem.hidden = hidden
      })
      item.hidden = hiddenNum === item.list.length;
    })
    this.setData({
      chartSource: this.data.chartSource
    })
  },
  onChange(e) {
    this.setData({
      searchValue: e.detail,
    });
    if (this.timer) { clearTimeout(this.timer) }
    this.timer = setTimeout(() => {
      this.onSearch()
      this.timer = null;
    }, 0);
  },
  onCloseSearchView() {
    this.setData({
      searchValue: '',
      searchResultList: []
    })
  },
  // 拨打电话
  makePhoneCall(event) {
    const { phone } = event.currentTarget.dataset
    wx.makePhoneCall({
      phoneNumber: phone,
      fail(res) {
        // simpleModal('拨号失败', res.errMsg || res.msg || res)
      }
    })
  },
  //设置内容距离顶部的高
  getTopNum () {
    let self = this;
    const query = wx.createSelectorQuery()
    query.select('#srcollview').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      self.setData({
        contentHeight: res[0].top + 70 // #the-id节点的上边界坐标
      })
    })
  },
  // 生成字母数组对象
  createChartArr(member) {
    if (!member.name) { return }
    const firstChart = getFirstChart(member.name);
    member.chart = firstChart;
    member.selected = member.selected === true
    const index = this.data.chartSource.findIndex(item => {
      return item.firstChart === firstChart;
    })
    if (index < 0) { return }
    const isExist = this.data.chartSource[index].list.some(item => { return item.did === member.did });
    if (!isExist) {
      const chartIndex = `chartSource[${index}].list`
      this.setData({
        [chartIndex]: this.data.chartSource[index].list.concat([member])
      })
    }
  },
  onSelectMenuChange(e) {
    const text = this.data.filterList.find(item => {
      return item.value === e.detail
    }).text
    this.setData({
      filteValue: e.detail,
      searchHolder: text
    })
    this.onChange({ detail: this.data.searchValue })
  },
  hasSelected(options) {
    const selected = JSON.parse(decodeURIComponent(options.selected));
    if (!selected.length) { return; }
    selected.forEach(userdid => {
      this.data.chartSource.forEach(item => {
        const selected = item.list.find(list => {
          return list.did === userdid.userdid
        })
        if (!selected) { return }
        selected.selected = true
      })
    })
    this.setData({
      chartSource: this.data.chartSource,
      selectedNumb: selected.length
    })
  },
  // 当单选时，点击后去掉上一个人的点击
  singlePickAct() {
    if (this.data.searchResultList.length) {
      this.data.searchResultList.forEach(item => {
        item.selected = false
      })
    }
    this.data.chartSource.forEach(item => {
      item.list.forEach(mem => {
        mem.selected = false
      })
    })
    this.setData({
      selectedNumb: 0,
      searchResultList: this.data.searchResultList,
      chartSource: this.data.chartSource
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
    getMemberLists(1, true)
    this.getMemberLists();
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
// pages/meeting/meetingRoomList/meetingRoomList.js
import {fetchData} from "../../../utils/net"
import {MEETING_ROOM_PID} from '../../../utils/specialPIDs'
import {notifyError, formatDate, isIPhone} from "../../../utils/util"
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
		color: '#FFFFFF',
		background: '#FFFFFF',
		latitude: 0,
		longitude: 0,
		passwordDialogShow: false,
		// mp-navigation-bar
		meetingList: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const selected = JSON.parse(decodeURIComponent(options.selected));
		this.getMeetingLists(selected);
		this.getTopNum();
	},
	// 获取会议室列表
	getMeetingLists(selected) {
		fetchData({
			url: 'sfsaas/api/filter/query',
			requestData: {
				did: '',
				pid: MEETING_ROOM_PID,
				filter: [],
				page: 1,
				pagesize: 500,
				filter: []
			},
			extraHeader: {
				xquery: true
			}
		}).then(({data}) => {
			data.result.data.forEach(item => {
				if (item.did === selected) {
					item.selected = true
				} else {
					item.selected = false
				}
			})
			data.result.data.sort((a, b) => {
				return a.name.localeCompare(b.name);
			})
			this.setData({
				meetingList: data.result.data
			})
		})
	},
	chooseMeetingRoom(event) {
		const did = event.currentTarget.dataset.did;
		const entity = this.data.meetingList.find(item => {
			return item.did === did;
		})
		const eventChannel = this.getOpenerEventChannel()
		eventChannel.emit('acceptDataFromOpenedPage', entity)
		wx.navigateBack()
	},
	//设置内容距离顶部的高
  getTopNum: function() {
    let self = this;
    const query = wx.createSelectorQuery()
    query.select('#meetingList').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      self.setData({
        contentHeight: res[0].top // #the-id节点的上边界坐标
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
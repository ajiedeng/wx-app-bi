// pages/assetTransfer/assetTransfer.js
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { getEntityByID, getVtConfigByPid, store } from "../../store/store";
import { getTopNum } from "../../utils/util";
import { toJS } from 'mobx-miniprogram';
import { vtTransfer } from './vtInfoTransfer'
import { SPACE_PID, VT_RECORD_PID } from "../../utils/specialPIDs";
import drawQrcode from "../../utils/weapp.qrcode.esm";
import { getUserInfo } from "../../utils/loginInfo";
import { fetchData } from '../../utils/net'
import { vtControl, vtInfo } from "../commonServices";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		topHeight: 0,
		columns: [],
		entities: {},
		newColumns: [],
		codeVisiable: false,
		applyUser: {
			name: ''
		},
		spaceDid: '',
		spaceName: '',
		isOwner: false,
		paramList: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		this.setData({
			topHeight: getTopNum('transfer')
		})
		this.pid = options.pid
		this.did = options.did
		if (options.to) {
			this.to = options.to
			this.getTransferUserInfo();
		}
		if (options.param) {
			this.param = JSON.parse(decodeURIComponent(options.param))
		}
		this.storeBindings = createStoreBindings(
			this, {
			store,
			fields: {
				assetEntity: () => {
					return getEntityByID(this.did);
				},
				assetVtconfig: () => {
					return getVtConfigByPid(this.pid);
				},
				spaceDid: () => getEntityByID(this.did).space,
				spaceName: () => getEntityByID(this.did)['space.name'],
			}
		}
		)
		wx.nextTick(() => {
			if (!this.data.assetEntity) {
				wx.showToast({
					icon: 'none',
					title: '资产信息未查询成功，请重试！'
				})
			} else {
				const { columns } = this.data.assetVtconfig;
				let column = columns.toJS();
				let entities = this.data.assetEntity;
				let newColumns = new vtTransfer(entities, column).getFormatData()
				this.setData({
					columns: column,
					entities,
					newColumns
				})
			}
		})
	},
	onApply() {
		this.createCode();
	},
	createCode() {
		if (!this.enableApply()) {
			return;
		}
		this.setData({
			codeVisiable: true
		})
		wx.createSelectorQuery()
			.select('#qrCode')
			.fields({
				node: true,
				size: true,
			})
			.exec((res) => {
				if (!res) { return; }
				const userdid = wx.getStorageSync('LoginInfo').userInfo.did;
				const param = { space: this.data.spaceDid }
				let canvas = res[0].node;
				drawQrcode({
					canvas,
					canvasId: 'qrCode',
					width: res[0].width,
					height: res[0].height,
					text: `https://office.ibroadlink.com/did/${this.did}?act=transfer&to=${userdid}&param=${JSON.stringify(param)}`,
				})
			})
		this.fetchDevicesOwner();
	},
	onClose(e) {
		this.setData({
			codeVisiable: false
		})
	},
	chooseLink(e) {
		if (this.data.isOwner) { return; }
		const { pid, label } = e.currentTarget.dataset
		wx.navigateTo({
			url: `/pages/filters/filters?pid=${pid || SPACE_PID}&chooseMode=true&label=${label}`,//&key=${field}
			events: {
				acceptDataFromOpenedPage: (data) => {
					if (this.data.applyUser.name) {
						const index = this.data.paramList.findIndex(item => {
							if (item.type === 'ref') {
								return item.pid === pid
							}
						})
						const column = this.data.paramList[index];
						column.did = data.did;
						column.name = data.name;
						this.setData({
							[`paramList[${index}]`]: column
						})
					} else {
						this.setData({
							spaceDid: data.did,
							spaceName: data.name
						})
					}
				}
			}
		})
	},
	chooseApplyUser() {
		const user = this.to ? [{ userdid: this.to }] : []
		wx.navigateTo({
			url: `/pages/member/memberList/memberList?selected=${encodeURIComponent(JSON.stringify(user))}&singlePick=true`,
			events: {
				// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
				acceptDataFromOpenedPage: (data) => {
					this.setData({
						applyUser: data[0],
						'applyUser.name': data[0].name
					})
				},
			}
		})
	},
	enableApply() {
		if (!this.data.spaceName) {
			wx.showToast({
				icon: 'none',
				title: '请选择空间',
			})
			return false;
		}
		return true;
	},
	// 获取申请人信息
	getTransferUserInfo() {
		fetchData({
			url: '/sfsaas/api/filter/query',
			requestData: {
				pid: "000000000000000000000000af860100",
				did: '',
				filter: [{did: [this.to]}],
				page: 1,
				pagesize: 10,
			},
			extraHeader: {
				xcolumn: true,
				xquery: true
			}
		}).then(({data}) => {
			const user = data.result.data[0];
			if (user.did === this.to) {
				this.setData({
					applyUser: user,
					'applyUser.name': user.name
				})
				this.setParamsColumn(this.param);
			}
		})
	},
	back() {
		wx.navigateBack()
	},
	agree() {
		const info = getUserInfo();
		for (const key in this.param) {
			if (this.param.hasOwnProperty(key)) {
				const value = this.param[key];
				if (typeof value === 'object') {
					this.param[key] = value.did
				}
			}
		}
		if (Object.keys(this.param).length !== 0) {
			fetchData({
				url: '/vtservice/v1/devControl',
				requestData: {
					did: this.did,
					pid: this.pid, //创建时必须传入,did为空
					act: 'set',
					cmd: this.param
				},
				extraHeader: {
					requserid: info.userid
				}
			}).then(({ data }) => {
				if (data.status === 0) {
					this.devMove();
				}
			})
		} else {
			this.devMove();
		}
	},
	// 转移
	devMove() {
		const info = getUserInfo();
		fetchData({
			url: '/vtservice/v1/devControl',
			requestData: {
				did: this.did,
				pid: this.pid, //创建时必须传入,did为空
				act: 'chown',
				cmd: {
					owner: this.data.applyUser.userid, //chown时必须传入
				} //创建和设置时有效
			},
			extraHeader: {
				requserid: info.userid
			}
		}).then(({ data }) => {
			if (data.status === 0) {
				wx.showToast({
					title: '资产转移成功',
				})
				setTimeout(() => {
					this.back()
				}, 1000);
			}
		})
	},
	getSpaceInfo() {
		fetchData({
			url: '/sfsaas/api/filter/vtinfo',
			requestData: {
				pid: SPACE_PID,
				did: this.param.space
			},
			autoLoading: false,
			extraHeader: {
				xcolumn: true,
				xquery: true
			}
		}).then(({ data }) => {
			this.setData({
				spaceDid: data.data.did,
				spaceName: data.data.name
			})
		})
	},
	setParamsColumn(params) {
		let paramsList = []
		for (const key in params) {
			if (params.hasOwnProperty(key)) {
				const column = this.data.columns.find(column => {
					return column.column === key;
				})
				if (!column) { return }
				paramsList.push(column)
			}
		}
		this.setData({
			paramList: new vtTransfer(params, paramsList).getFormatData()
		})
	},
	// 轮询当前设备是否是自己的设备
	fetchDevicesOwner() {
		if (this.timer) {
			clearInterval(this.timer)
		}
		const userinfo = getUserInfo()
		this.timer = setInterval(() => {
			vtInfo(this.did).then((data) => {
				if (data.data.owner === userinfo.did) {
					clearInterval(this.timer);
					this.setData({
						isOwner: true,
						codeVisiable: false,
						newColumns: new vtTransfer(data.data, this.data.columns).getFormatData()
					})
				}
			})
		}, 3000)
	},
	clickLink() {

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
		if (this.timer) clearInterval(this.timer);
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
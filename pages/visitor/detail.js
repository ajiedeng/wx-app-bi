// pages/visitor/detail.js
import {fetchData} from "../../utils/net";
import {formatDate} from "./util";
import drawQrcode from "../../utils/weapp.qrcode.esm";
import {goCertainDetailPage, INVITE_VISITOR_PID, MEETING_ROOM_RESERVATION_PID} from "../../utils/specialPIDs";
import {deleteLastApplyId} from "./isVisitor";
import {store} from "../../store/store";
import {formatTime} from "./util";
import {bd09togcj02} from '../../utils/latandlng.map'
import {isLogged, getUserInfo} from "../../utils/loginInfo";

var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fields: [
            {
                name: '来访人姓名',
                key: 'visitorname'
            }, {
                name: '来访人手机号',
                key: 'visitorphone'
            }, {
                name: '来访事由',
                key: 'visitreason'
            }, {
                name: '来访时间',
                key: 'visitTimeText'
            }, {
                name: '访问时长',
                key: 'visitduration'
            }, {
                name: '所在单位',
                key: 'visitorcompany'
            }, {
                name: '来访人数',
                key: 'visitornum'
            },  {
                name: '车牌号码',
                key: 'carnum'
            },{
                name: '备注',
                key: 'description'
            }
        ],
        applyState: {
            0: {
                image: 'icon_dengdai.png',
                text: '等待审核'
            },
            1: {
                image: 'icon_quxiao.png',
                text: '已取消'
            },
            2: {
                image: 'icon_success.png',
                text: '预约成功'
            },
            3: {
                image: 'icon_shibai.png',
                text: '预约失败'
            }
        },
        isCreator: false
    },
    // 获取公司经纬度
    getCompanyAddress(dep) {
        fetchData({
            url: 'sfsaas/api/visitor/getconfig',
            requestData: {
                department: dep
            }
        }).then(({data}) => {
            this.setData({
                'apply.longitude': data.longitude,
                'apply.latitude': data.latitude
            })
        })
    },
    //地址导航
    gotoMap: function (e) {
        var that = this;
        var info = e.currentTarget.dataset.info;
        const apply = this.data.apply;
        let tudeArr = bd09togcj02(apply.longitude, apply.latitude);
        wx.openLocation({ //​使用微信内置地图查看位置。
            latitude: tudeArr[1], //要去的纬度-地址
            longitude: tudeArr[0], //要去的经度-地址
        })
    },
    cancelOrReapply() {
        // deleteLastApplyId()
        // wx.redirectTo({
        //     url: `/pages/visitor/apply`
        // })
        const {apply} = this.data
        const {status} = apply
        if(apply.expired+'' !=='1' && (apply.status +''==='2' || apply.status+''==='0')){
            const _this = this;
            wx.showModal({
                title: '访客预约',
                content: '是否取消预约？',
                success (res) {
                    if (res.confirm) {
                        fetchData({
                            url: "/sfsaas/api/visitor/cancel",
                            requestData: {
                                did: _this.id,
                                reason: 'no reason'
                            }
                        }).then(({data}) => {
                            const {apply} = _this.data
                            _this.setData({
                                apply: {...apply, status: 1}
                            })
                        })
                    } else if (res.cancel) {
                        return
                    }
                }
            })
            
        }else{
            wx.redirectTo({
                url: `/pages/visitor/apply?newApply=true`
            })
        }

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.listenerBtnGetLocation();
        if (options.taskdid) {
            this.taskdid = options.taskdid
        }
        this.id = options.id
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
        fetchData({
            url: "/sfsaas/api/visitor/info",
            requestData: {
                did: this.id,
            },
            checkLoggedIn: false
        }).then(({data}) => {
            const apply = data.result
            const isCreator = apply.creator === getUserInfo().did;
            this.setData({
                isCreator
            })
            this.applyIsChecked(apply);
            apply.visitTimeText = formatTime(new Date(apply.visittime * 1000))
            this.setData({
                apply
            })
            this.getCompanyAddress(apply.department);
            this.crateQrcode(apply);
        })
    },
    // 画二维码
    crateQrcode(apply) {
        this.timer = setTimeout(() => {
            if (apply.status =='2') {
                this.createSelectorQuery()
                .select('#qrCode')
                .fields({
                    node: true,
                    size: true,
                })
                .exec((res) => {
                    if (!res.length && res[0]) { return; }
                    let canvas = res[0].node;
                    try{
                        drawQrcode({
                            canvas,
                            canvasId: 'qrCode',
                            width: res[0].width,
                            height: res[0].height,
                            padding: 10,
                            text: `https://office.ibroadlink.com/did/${this.id}/`,
                        })
                    } catch(err) {
                        console.log(err);
                    }
                })
            }
        }, 500);
    },
    // 判断预约是否审核，若没有审核则跳转到任务审核界面
    applyIsChecked(apply) {
        if (!this.taskdid) { return; }
        const applyStatus = apply.status;
        if (applyStatus === 0 && this.jumped === undefined) {
            this.jumped = true; // we only jump once in a session.
            goCertainDetailPage({did: this.taskdid});
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        if (this.timer) {
            clearTimeout(this.timer);
            delete this.timer;
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        if (this.timer) {
            clearTimeout(this.timer);
            delete this.timer;
        }
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

    },
    /**
     * 监听定位到当前位置 给省市区默认值
     */
    listenerBtnGetLocation: function () {
        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: 'NUHBZ-FAK3X-Q2I4U-ZIDOX-YUIUO-2ZBC5' // 必填
        });
    }
})



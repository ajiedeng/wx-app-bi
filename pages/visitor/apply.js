import {goCertainDetailPage, INVITE_VISITOR_PID, VT_RECORD_PID} from "../../utils/specialPIDs";
import {isLogged, getUserInfo} from "../../utils/loginInfo";
import {fetchData} from '../../utils/net';
import {saveLogin} from "../login/saveLogin";
import {formatTime, formatDate} from "./util";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {getCurrentEntity, getEntityByID, getVtConfigByPid, store} from "../../store/store";
import {getApplyInfo, getLastApply, getLastApplyId, saveApplyID} from "./isVisitor";
import {vtControl} from "../commonServices";
import {simpleModal, handleUrlParams} from "../../utils/util";
import {bindUUID} from "../login/bindUUID";

const fields = {
    visitusername: {
        title: '被访人',
        type: 'text',
        validator(value) {
            if (!value) {
                return '被访人不能为空'
            }
        }
    },
    suffixphone: {
        title: '手机号后4位',
        type: 'text',
        validator(value) {
            if (!/^[0-9]{4}$/.test(value)) {
                return '手机尾号应为4位数字'
            }
        }
    },
    visitorname: {
        title: '来访人姓名',
        type: 'text',
        validator(value) {

        }
    },
    visitorphone: {
        title: '来访人手机号',
        type: 'number',
        validator(value) {
            if (!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(value)) {
                return '格式不正确'
            }
        }
    },
    visitreason: {
        title: '来访事由',
        type: 'text',
        validator(value) {

        }
    },
    visittime: {
        title: '来访时间',
        type: 'datetime',
        validator(value) {

        }
    },
    visitduration: {
        title: '访问时长',
        type: 'select',
        validator(value) {

        }
    },
    visitorcompany: {
        title: '所在单位',
        type: 'text',
        validator(value) {

        }
    },
    visitornum: {
        title: '来访人数',
        type: 'number',
        validator(value) {
        }
    },
    carnum: {
        title: '车牌号码',
        optional: true,
        type: 'text',
        validator(value) {
            if(!value) { return}
            function isVehicleNumber(vehicleNumber) {

                var xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;

                var creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;

                if (vehicleNumber.length === 7) {

                    return creg.test(vehicleNumber);

                } else if (vehicleNumber.length === 8) {

                    return xreg.test(vehicleNumber);

                } else {

                    return false;

                }

            }

            if (!isVehicleNumber(value)) {
                return '车牌号格式错误'
            }
        }
    },
    description: {
        title: '备注',
        type: 'textarea',
        optional: true,
        validator(value) {

        }
    }
}

function isEmpty(val) {
    return val == null || val === ''

}

function isEmptyError(error) {
    if (!Object.keys(error).length) return true
    console.log(error, 'error');
    for (let key of Object.keys(error)) {
        if (error[key]) {
            console.log(fields[key], 'key')
            wx.showToast({
                icon: 'none',
              title: `${fields[key].title}${error[key]}`,
            })
            return false
        }
    }
    return true
}

// pages/visitor/apply.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showAuth: false,
        logged: false,
        fields: ['visitorname', 'visitorphone', 'visitreason', 'visittime','visitduration', 'visitorcompany', 'visitornum', 'carnum', 'description'].map(key => {
            const obj = fields[key]
            obj.key = key
            return obj
        }),
        form: {},
        error: {},
        formatTime : formatTime,
        today:new Date().getTime(),
        options: {}
    },

    inputChange(event) {

        const {key} = event.currentTarget.dataset
        const value = event.detail

        const {validator, optional, type} = fields[key]
        if (isEmpty(value) && !optional) {
            this.setData({
                [`error.${key}`]: '该项不能为空'
            })
        } else if (validator) {
            this.setData({
                [`error.${key}`]: validator(value) || null
            })
        }
        this.setData({
            [`form.${key}`]: value
        })
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            options
        })
        const newApplyFlag =  this.newApplyFlag = options.newApply
        const logged = isLogged()
        this.setData({
            logged
        })
        const params = handleUrlParams(options)
        if (!logged) {
            wx.reLaunch({
              url: `/pages/control/control${params ? '?' + params : ''}`,
            })
        }
        this.handleVisitorDetail(options);
    },
    // 判断当前用户是否是访客，如果是，判断是否有未完成的访客申请；如果有则跳到detail，如果没有则显示表单
    handleVisitorDetail(options) {
        const userinfo = getUserInfo();
        if (userinfo.staffstatus !== 2) {
            wx.reLaunch({
              url: '/pages/index/index',
            })
        }
        const userdid = userinfo.did;
        fetchData({
            url: "/sfsaas/api/filter/query",
            requestData: {
                did: '',
                pid: INVITE_VISITOR_PID,
                filter: [{creator: [userdid]}, {expired: ["0"]}],
                page: 1,
                pagesize: 500,
                sort: {column: "", type: ""},
            },
            extraHeader: {
                xcolumn: true
            }
        }).then(({data}) => {
            const total = data.result.total;
            if (Number(total)) {
                goCertainDetailPage(data.result.data[0]);
            }
        })
    },

    save() {

        const {form, error} = this.data

        const nullError = Object.keys(fields).filter(f => !fields[f].optional).reduce((error, item) => {
            if (isEmpty(form[item])) {
                error[item] = '该项不能为空'
            }
            return error
        }, {})


        const allErrors = {...error, ...nullError}
        this.setData({
            error: allErrors
        })
        if (isEmptyError(allErrors)) {
            const data = {...form}

            data.visittime = formatTime(new Date(parseInt(data.visittime)))

            vtControl({
                pid: INVITE_VISITOR_PID,
                act: "create",
                cmd: data
            }).then(res=>{
                console.error(res)
                const did = res.data.cmd.did
                saveApplyID(did)
                wx.redirectTo({
                    url: `/pages/visitor/detail?id=${did}`
                })
            })
        }
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
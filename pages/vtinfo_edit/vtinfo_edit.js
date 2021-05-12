//index.js
//获取应用实例
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../store/store";

const {
    fetchData
} = require('../../utils/net');

const app = getApp()

Page({
    data: {
        error: false,
        changeFlag: false,
        pid: '',
        did: '',
        val: '',
        type: 'text',//text,number,digit,idcard
        multiple: 1000000,
        label: '',
        maxlength: 140,
        column: ''// key,待更新关键字
    },
    changeVal(e) {
        console.log('-typeof--changeVal', typeof e.detail.value);
        let change = {
            val: e.detail.value,
            changeFlag: true
        };
        if ((e.detail.value.trim().length === 0) || (this.data.type === 'digit' && (e.detail.value <= 0 || !/^[0-9]*(\.[0-9]*)?$/.test(e.detail.value)))) {
            change.error = '请输入有效数据';
        } else {
            change.error = false;
        }
        this.setData(change)
    },
    errorHandle({
                    error,
                    errorMsg
                }) {
        if (!error.handled) {
            console.log(`---${errorMsg}---`, error);
            wx.showToast({
                title: errorMsg,
                icon: 'none'
            })
        } else {
            setTimeout(function () {
                wx.hideLoading()
            }, 100)
        }
    },
    save() {
        if (this.data.error) {
            wx.showToast({
                title: this.data.error,
                icon: 'none'
            });
            return
        }
        const valData = {
            [this.data.column]: this.data.type === 'digit' ? parseFloat(this.data.val) * this.data.multiple : this.data.val
        }
        let updateCmd = {
            "pid": this.data.pid,
            "did": this.data.did,
            "data": valData
        };
        console.log('--save--cmd', updateCmd);
        fetchData({url: '/sfsaas/api/vtcommon/update', requestData: updateCmd})
            .then(res => {
                // const eventChannel = this.getOpenerEventChannel()
                // eventChannel.emit('acceptDataFromOpenedPage', valData);

                this.updateEntityByID(this.data.did,valData)
                wx.navigateBack()
            })
            .catch(error => this.errorHandle({
                error,
                errorMsg: `出错了`
            }))
    },
    onLoad() {
        this.storeBindings = createStoreBindings(
            this, {
                store,
                actions: ['updateEntityByID']
            }
        )
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.on && eventChannel.on('acceptDataFromOpenerPage', (data) => {
            console.log('---vtinfo_edit--', data);
            let {config, val, ...rest} = data;
            let {type, multiple, label, maxlength, column} = config;
            if (type === 'string') {
                type = 'text';
            } else if (type === 'float') {
                type = 'digit';
                val = parseFloat(val / multiple)
            }
            this.setData({...rest, val, type, multiple, label, maxlength, column});
        })

    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.storeBindings.destroyStoreBindings()
    },
})
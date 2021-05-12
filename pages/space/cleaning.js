// pages/space/cleaning.js
import {CLEANING_PID} from "../../utils/specialPIDs";
import {getLastCleaningRecord} from "./services";
import {uploadFile} from "../addVt/uploadFile";
import {notifyError} from "../../utils/util";
import {fetchData} from "../../utils/net";
import {vtControl} from "../commonServices";


function getClockTime() {
    const date = new Date();
    const hours = date.getHours();
    const mins = date.getMinutes();
    const seconds = date.getSeconds();
    return (hours > 9 ? hours : '0' + hours) + ':' + (mins > 9 ? mins : '0' + mins) + ':' + (seconds > 9 ? seconds : '0' + seconds)
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        lastRecord: null,
        image: null,
        clockTime: getClockTime(),
        done: false,
        isDisinfect: false,
        isClean: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.pid = CLEANING_PID
        this.spaceId = options.spaceId

        // this.spaceId = '1000b386010000000000a3837e6a3f2b'

        getLastCleaningRecord(this.spaceId).then(lastRecord => {
            this.setData({
                lastRecord
            })
        })


        this.clockTimer = setInterval(() => this.setData({
            clockTime: getClockTime()
        }), 1000)
    },

    afterRead(event) {
        const {file: {path}, name} = event.detail

        this.setData({
            image: [{
                url: path,
                status: 'uploading',
                message: '上传中',
            }]
        })
        // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
        uploadFile(path, name).then((result) => {

            this.setData({
                image: [{
                    url: result.url,
                    status: 'done',
                    message: '上传完成',
                    isImage: true,
                }]
            })
        }).catch(error => {
            this.setData({
                image: [{
                    url: path,
                    status: 'failed',
                    message: '上传失败',
                },]
            })
            notifyError(error, '上传失败')
        })
    },

    imgDelete() {
        this.setData({
            image: null
        })
    },

    submitClean() {
        const {image, isDisinfect, isClean} = this.data
        if (image && image[0] && image[0].status === 'done') {
            const command = {
                name: '保洁打卡',
                cleanpictures: image[0].url,
                space: this.spaceId,
                isdisinfect: isDisinfect ? 1 : 0,
                isclean: isClean ? 1 : 0
            }
            vtControl({
                pid: this.pid,
                act: "create",
                cmd: command
            }).then(() => {
                this.setData({
                    done: true
                })

                wx.showToast({
                    title: '打卡成功',
                    icon: 'none'
                })
            })
        }
    },

    switchChange(event) {
        const {value} = event.detail
        const {field} = event.currentTarget.dataset
        this.setData({
            [field]: value
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
        clearInterval(this.clockTimer)
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
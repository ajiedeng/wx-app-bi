// pages/screenCast/chooseImage.js
import {uploadFile} from "../addVt/uploadFile";
import {notifyError} from "../../utils/util";
import {CAST_SCREEN_PID} from "../../utils/specialPIDs";
import {getQueryFromUrl} from "./url";
import {fetchData} from "../../utils/net";
import {getUserInfo} from "../../utils/loginInfo";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        fileList: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        if (options.url) {
            const url = decodeURIComponent(options.url)

            const fileName = getQueryFromUrl(url, 'name'), fileId = getQueryFromUrl(url, 'fileid')
            if (fileName && fileId && fileName.endsWith('.zip')) {
                fetchData({
                    url: ' /vt/staticfile/zip/fileinfo',
                    method: 'GET',
                    requestData: {
                        "fileid": fileId
                    },
                    extraHeader: {
                        reqUserId: getUserInfo(true).userid,
                    }
                }).then(({data}) => {
                    const files = data && data.data && data.data.files ? data.data.files : null
                    if (files) {
                        const list = files.map(({url, name}) => ({url: url + '&name=' + name}))
                        this.setData({
                            fileList: list
                        })
                    }
                })
            } else {
                this.setData({
                    fileList: [
                        {
                            url: url,
                        }]
                })
            }
        }

    },

    afterRead(event) {
        const {file} = event.detail
        console.error('file', file)

        // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
        const fileArr = Array.isArray(file) ? file : []

        const currentFileList = this.data.fileList ? [...this.data.fileList] : []
        const newFileList = fileArr.map(({path, name}) => ({
            url: path,
            status: 'uploading',
            message: '上传中',
        }))

        this.setData({
            fileList: [...currentFileList,
                ...newFileList]
        })

        fileArr.map(({path, name}, i) => {

            const index = currentFileList.length + i

            return uploadFile(path, name, CAST_SCREEN_PID, 'url').then((result) => {
                console.error(result.url)

                const fileList = this.data.fileList
                fileList[index] = {
                    url: result.url,
                    status: 'done',
                    message: '上传完成',
                }
                this.setData({
                    // fileList: [...fileList,]
                    fileList
                })
            }).catch(error => {
                const fileList = this.data.fileList
                fileList[index] = {
                    url: path,
                    status: 'failed',
                    message: '上传失败',
                }

                this.setData({
                    // fileList: [...fileList,]
                    fileList
                })
                // notifyError(error, '上传失败')
            })
        })


    },

    imgDelete(event) {
        console.error('imgDelete', event)
        const {index} = event.detail

        const {fileList} = this.data
        if (!fileList) {
            return
        }

        const firstHalf = fileList.slice(0, index), lastHalf = fileList.slice(index + 1)

        this.setData({
            fileList: [...firstHalf, ...lastHalf]
        })

        //todo
        //删除文件
        // const fileID = this.data.entity.fileid
        // fetchData({
        //     method:'DELETE',
        //     url:` /vt/staticfile/delete/${fileID}`,
        //     extraHeader:{
        //         reqUserId:getUserInfo(true).userid
        //     }
        // }).then((res)=>{
        //     console.log(res)
        // })
    },

    save() {
        const {fileList} = this.data
        const ids = []
        for(let file of fileList){
            const id  = getQueryFromUrl(file.url, 'fileid')
            if(id && file.status === 'done'){
                ids.push(id)
            }else{
                console.error('忽略文件：',JSON.stringify(file))
            }
        }
        console.error(ids)

        return fetchData({
            url: '/vt/staticfile/zip/compress',
            requestData: {
                "fileids": ids
            },
            extraHeader: {
                reqUserId: getUserInfo(true).userid,
                apppid: CAST_SCREEN_PID,
                appfield: 'url'
            }
        }).then(({data}) => {
            //清空store中的数据
            // this.clearFilterByPid(this.pid)
            const eventChannel = this.getOpenerEventChannel()
            eventChannel.emit('acceptDataFromOpenedPage', {url: data.data.url})
            wx.navigateBack()
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
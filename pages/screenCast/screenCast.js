//0：压缩包；1：音乐；2：视频；3：网页；4：图片；

import {CAST_SCREEN_PID, FILE_PID} from "../../utils/specialPIDs";
import {printAndUpload} from "../../utils/logger";
import {getEntityByID, store} from "../../store/store";
import {notifyError, simpleModal} from "../../utils/util";
import {uploadFile} from "../addVt/uploadFile";
import {fetchData} from "../../utils/net";
import {getUserInfo} from "../../utils/loginInfo";
import {controlScreen, getFileName} from "./services";

const ZIP = '0', MUSIC = '1', VIDEO = '2', WEB = '3', IMAGE = '4', PPT = '5', DASHBOARD = 'dashboard'
const ALL_TYPES = {
    [ZIP]: {
        // label: '压缩包',
        label: '图片',
        fileVtType: 255,
        exts: ['zip']
    },
    [MUSIC]: {
        label: '音乐',
        fileVtType: 5,
        exts: ["aif", "cda", "mid", "midi", "mp3", "mpa", "ogg", "wav", "wma", "wpl"]
    },
    [VIDEO]: {
        label: '视频',
        fileVtType: 4,
        exts: ["3g2", "3gp", "avi", "flv", "h264", "m4v", "mkv", "mov", "mp4", "mpg", "mpeg", "rm", "swf", "vob", "wmv"]
    },
    [WEB]: {
        label: '网页',
        // fileVtType:5,
        // exts:['mp2']
    },
    [IMAGE]: {
        label: '图片',
        fileVtType: 6,
        exts: ["ai", "bmp", "gif", "ico", "jpeg", "jpg", "png", "ps", "psd", "svg", "tif", "tiff"]
    },
    [PPT]: {
        label: 'PPT',
        fileVtType: 3,
        exts: ['ppt', 'pptx']
    },
    [DASHBOARD]: {
        label: 'dashboard',
    }
}


const ALL_OCCUPY_TIME = {
    "30": '半小时不操作自动退出',
    "60": '一小时不操作自动退出',
    '720': '半天不操作自动退出',
    "1440": '一天不操作自动退出',
    "43200": '一个月不操作自动退出',
}
//0：暂停；1：播放；2：下一个；3：上一个；4：快进；5：倒放；6：音量加；7：音量减；8：静音
const PAUSE = 0, PLAY = 1, NEXT = 2, PREV = 3, FORWARD = 4, BACKWARD = 5
//上传文件类型选择
const MESSAGE_FILE = 'MESSAGE_FILE', VT_FILE = 'VT_FILE', LOCAL_VIDEO_FILE = 'LOCAL_VIDEO_FILE',
    LOCAL_IMAGE_FILE = 'LOCAL_IMAGE_FILE'

// pages/screenCast/screenCast.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: null,
        url: null,
        occupyTime: 60,
        horizontal: false,

        showSheet: false,
        ALL_TYPES,
        ALL_OCCUPY_TIME,
        ZIP, MUSIC, VIDEO, WEB, IMAGE, PPT, DASHBOARD,
        showInputDialog: false,
        PAUSE,
        website: 'https://',
        screenTimer: null,
    },

    showTypesSheet() {

        const sheetActions = Object.keys(ALL_TYPES).map(key => ({
            name: ALL_TYPES[key].label,
            value: key,
            key: 'type'
        }))


        this.setData({
            showSheet: true,
            sheetActions: sheetActions.filter(({value}) => value !== ZIP)
        })
    },

    chooseOccupyTime() {
        this.setData({
            showSheet: true,
            sheetActions: Object.keys(ALL_OCCUPY_TIME).map(key => ({
                name: ALL_OCCUPY_TIME[key],
                value: key,
                key: 'occupyTime'
            }))
        })
    },

    chooseFile() {
        const {type} = this.data
        if (type == null) {
            return
        }

        if (type === WEB) {
            this.setData({
                showInputDialog: true
            })
            return
        }

        const messageFileAction = {
            value: MESSAGE_FILE,
            name: '会话文件'
        }, vtFileAction = {
            value: VT_FILE,
            name: '线上文件'
        }

        let actions;
        if (type === VIDEO) {
            actions = [
                {
                    ...messageFileAction,
                    type: 'video'
                },
                vtFileAction,
                {
                    value: LOCAL_VIDEO_FILE,
                    name: '本地'
                }
            ]
        } else if (type === IMAGE || type === ZIP) {
            actions = [
                {
                    ...messageFileAction,
                    multiple: 10,
                    type: 'image'
                },
                vtFileAction,
                {
                    value: LOCAL_IMAGE_FILE,
                    name: '本地'
                }
            ]
        } else {
            actions = [
                {
                    ...messageFileAction,
                    type: 'file'
                },
                vtFileAction,
            ]
        }

        this.setData({
            sheetActions: actions,
            showSheet: true
        })
    },

    chooseVideoFile() {
        wx.chooseVideo({
            sourceType: ['album', 'camera'],
            // maxDuration: 60,
            camera: 'back',

        }).then(res => {
            console.error('chooseVideoFile', res)
            return uploadFile(res.tempFilePath, null, CAST_SCREEN_PID, 'url').then(result => {
                this.setScreenData({url: result.url})
            })
        }).catch(e => {
            printAndUpload.error(e)
            if (e && e.errMsg && e.errMsg.indexOf('cancel') !== -1) {
                return
            }
            notifyError(e)
        })
    },

    chooseMessageFile({multiple = 1, fileType = 'file'}) {
        const {type} = this.data
        wx.chooseMessageFile({
            count: multiple,
            type: fileType,
            extension: ALL_TYPES[type].exts
        }).then(res => {
            // tempFilePath可以作为img标签的src属性显示图片
            console.error(res.tempFiles)
            const [{name, path}] = res.tempFiles
            const ext = path.indexOf('.') === -1 ? '' : path.split('.').pop()

            const match = ALL_TYPES && ALL_TYPES[type].exts.find(i => i.toLowerCase() === ext.toLowerCase())
            console.error(ext, name, match)
            //todo 文件校验暂时屏蔽，zip和image问题
            // if (match) {
            return uploadFile(path, name, CAST_SCREEN_PID, 'url').then(result => {
                this.setScreenData({url: result.url})
            })
            // } else {
            //     throw '文件类型错误，请重新选择'
            // }

        }).catch(e => {
            printAndUpload.error(e)
            if (e && e.errMsg && e.errMsg.indexOf('cancel') !== -1) {
                return
            }
            notifyError(e)
        })
    },

    chooseVtFiles() {
        const {type} = this.data
        const filter = encodeURIComponent(JSON.stringify([
                {
                    "filetype": [ALL_TYPES[type].fileVtType]
                },
                // {
                //     "time1" : [ "2020-09-01" ] // 查询指定日期
                // },
                // {
                //     "time2" : [ "2020-09-01", "2020-09-31" ] // 查询指定时间段
                // }
            ],
        ))
        wx.navigateTo({
            url: `/pages/filters/filters?pid=${FILE_PID}&chooseMode=true&label=文件&filter=${filter}`,//&key=${field}
            events: {
                // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                acceptDataFromOpenedPage: ({did}) => {
                    const entity = getEntityByID(did)
                    this.setScreenData({url: entity.url})
                },
            },
            success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                // res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
            }
        })
    },

    onSheetClose() {
        this.setData({
            showSheet: false,
        })
    },
    onSheetSelect(event) {
        const {type, occupyTime, url} = this.data

        const {key, value, multiple, type: fileType} = event.detail
        if (value === MESSAGE_FILE) {
            this.chooseMessageFile({
                multiple, fileType,
            })
        } else if (value === VT_FILE) {
            this.chooseVtFiles()
        } else if (value === LOCAL_VIDEO_FILE) {
            this.chooseVideoFile()
        } else if (value === LOCAL_IMAGE_FILE) {
            const {url} = this.data
            const search = url ? '?url=' + encodeURIComponent(url) : ''
            wx.navigateTo({
                url: `./chooseImage` + search,//&key=${field}
                events: {
                    // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                    acceptDataFromOpenedPage: (data) => {
                        this.setScreenData({
                            url: data.url,
                            type: ZIP
                        })
                    },
                },
                success: function (res) {
                    // 通过eventChannel向被打开页面传送数据
                    // res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
                }
            })
        } else if (key === 'type') {
            if (value + '' !== type + '') {
                this.setScreenData({
                    url: null,
                    type: value
                })
            }
        } else {
            this.setScreenData({
                [key]: value
            })
        }
    },


    setScreenData(data) {

        const currentData = {...this.data}

        ;['type', 'occupyTime', 'url', 'horizontal'].forEach(i => {
            if (data[i] !== undefined) {
                currentData[i] = data[i]
            }
        })

        if (currentData.type === WEB) {
            currentData.fileName = currentData.url
        } else {
            currentData.fileName = getFileName(currentData.url)
        }

        if (currentData.type === DASHBOARD) {
            currentData.url = 'placeholder'
        }

        this.setData(currentData)
        const fulfil = !['type', 'occupyTime', 'url'].find(i => currentData[i] == null)
        if (fulfil) {
            // this.castScreen()
            this.setData({
                showReady: true
            })
        }
    },

    control(event) {
        const {type, occupyTime, url, vtControl} = this.data
        if (type == null || occupyTime == null || url == null) {
            wx.showToast({
                title: '请选择完整数据',
                icon: 'none'
            })
            return
        }
        const {operation} = event.currentTarget.dataset
        let control = PLAY

        if (operation === 'next') {
            control = type === VIDEO ? FORWARD : NEXT
        } else if (operation === 'prev') {
            control = type === VIDEO ? BACKWARD : PREV
        } else if (operation === 'play') {
            control = vtControl === PAUSE ? PLAY : PAUSE
            // this.setData({
            //     playing: !playing
            // })
        }
        // this.castScreen(control)
        controlScreen(this.did, {
            vtcontrol: control,
            pwr: 1
        }).then(data => {
            this.setData({
                vtControl: control
            })
        })

    },

    castScreen(control = 0) {
        const {occupyTime, horizontal} = this.data
        let {url, type} = this.data
        let preQ
        if (type === DASHBOARD) {
            preQ = fetchData({
                method: 'GET',
                url: "/sfsaas/api/user/token"
            }).then(({data}) => {
                const token = data ? (data.token || data.data.token) : null
                url = `https://office.ibroadlink.com/#/index?token=${token}`
                type = WEB
            })
        } else {
            preQ = Promise.resolve()
        }

        return preQ.then(() => {
            return controlScreen(this.did, {
                type: parseInt(type),
                url: url,
                idletime: parseInt(occupyTime),
                vtcontrol: control,
                pwr: 1,
                nickname: getUserInfo(true).nickname,
                // screenorientation: horizontal ? 0 : 1
            })
        }).then(() => {
            this.setData({vtControl: control})
        })

    },

    exit() {
        const did = this.did
        wx.showModal({
            title: '确认',
            content: '是否确认退出',
            success(res) {
                if (res.confirm) {
                    controlScreen(did, {
                        pwr: 0,
                        userdid: '',
                        nickname: '',
                        url: ''
                    }).then(() => {
                        wx.navigateBack()
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },

    onInputDialogConfirm(event) {
        const {dialog} = event.detail
        const {website} = this.data
        const re = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
        if (re.test(website)) {
            this.setScreenData({
                url: website,
            })
            this.setData({
                showInputDialog: false
            })
        } else {
            wx.showToast({
                title: '网址格式不正确',
                icon: 'none'
            })
            dialog.stopLoading()
        }
    },
    onInputDialogCancel() {
        this.setData({
            showInputDialog: false
        })
    },

    orientationChange(event) {
        this.setScreenData({horizontal: event.detail.value})
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // this.pid = options.pid
        this.did = options.did
        this.pid = CAST_SCREEN_PID
        // this.did = '24dfa7d316ec0000468701002331885f'

        const entity = getEntityByID(this.did)

        this.init(entity)
        console.error('投屏设备：', entity)
        fetchData({
            url: "/sfsaas/api/filter/vtinfo",
            requestData: {
                did: this.did, pid: this.pid
            }
        }).then(({data}) => {
            try {
                //扫码的情况下PID可能不存在
                store.updateEntityAndVtConfig(data)
                this.init(getEntityByID(this.did))
            } catch (e) {
                printAndUpload.error('服务器返回格式有误', '/sfsaas/api/filter/vtinfo', data, e)
                notifyError(e, '服务器返回格式有误')
            }
        })
        this.getCurrentScreenInfo();
    },
    //获取当前投屏信息
    getCurrentScreenInfo() {
        this.screenTimer = setInterval(() => {
            if (!this.data.occupyByOther) {
                fetchData({
                    url: "/sfsaas/api/filter/vtinfo",
                    requestData: {
                        did: this.did, pid: this.pid
                    }
                }).then(({data}) => {
                    //扫码的情况下PID可能不存在
                    store.updateEntityAndVtConfig(data)
                    const entity = getEntityByID(this.did)
                    if (entity.userdid !== getUserInfo(true).userid) {
                        this.setData({
                            occupyByOther: entity["nickname"] || '其他用户'
                        })
                    }
                })
            }
        }, 10000)
    },
    init(entity) {
        if (!entity) {
            this.setData({
                occupyByOther: 'unknown'
            })
            return
        }

        this.setData({
            deviceName: entity.name,
            pwr: entity.pwr
        })

        if (!entity.userdid) {
            controlScreen(this.did, {
                // pwr: 1,
                userdid: getUserInfo(true).userid,
                nickname: getUserInfo(true).nickname
            }).then(() => {

            })
        } else if (entity.userdid !== getUserInfo(true).userid) {
            this.setData({
                occupyByOther: entity["nickname"] || '其他用户'
            })
        } else {
            this.setData({
                deviceName: entity.name,
                url: entity.url,
                type: entity.type + '',
                occupyTime: entity.idletime || 60,
                playTime: entity.playtime,
                switchingEffect: entity.switchingeffect,
                // horizontal: entity.screenorientation === 0,
                //todo
                fileName: entity.type === WEB ? entity.url : getFileName(entity.url),
                showReady: entity.url && entity.type && entity.vtcontrol === PAUSE,
            })
        }
    },

    readyClicked() {
        this.castScreen(PLAY).then(() => this.setData({
                showReady: false,
                casting: true
            })
        )
    },

    showPlayTimePicker() {
        this.setData({
            showPlayTimePicker: true,
            formatter(type, value) {
                if (type === 'minute') {
                    return `${value}秒`;
                } else if (type === 'hour') {
                    return `${value}分`;
                }
                return value;
            },
        })
    },

    onPlayTimePickerCancel() {
        this.setData({
            showPlayTimePicker: false,
        })
    },

    onPlayTimePickerCloseConfirm(event) {
        const [minute, second] = event.detail.split(':').map(i => parseInt(i))
        const playTime = minute * 60 + second

        this.controlPlayTime(playTime).then(() => {
            this.setData({
                showPlayTimePicker: false
            });
        })
    },

    showSwitchingEffectPicker() {
        // 0：无；1：出现；2：淡出；3：飞入；4：擦除；5：随机线条；6：缩放；7：旋转
        this.setData({
            showSwitchingEffectPicker: true,
            switchingEffects: [
                {text: '无'},
                {text: '出现'},
                {text: '淡出'},
                {text: '飞入'},
                {text: '擦除'},
                {text: '随机线条'},
                {text: '缩放'},
                {text: '旋转'}
            ],
        })
    },
    onSwitchingEffectPickerCancel() {
        this.setData({
            showSwitchingEffectPicker: false,
        })
    },
    onSwitchingEffectPickerConfirm(event) {
        const {picker, value, index} = event.detail;
        controlScreen(this.did, {
            switchingeffect: index,
        }).then(() => {
            this.setData({
                showSwitchingEffectPicker: false,
                switchingEffect: index
            });
        })
    },

    tabChange(event) {
        const {index} = event.detail

        if (index === 0) {
            this.controlPlayTime(0)
        } else {
            this.controlPlayTime(30)
        }
    },

    controlPlayTime(time) {
        return controlScreen(this.did, {
            playtime: time,
        }).then(() => {
            this.setData({
                playTime: time
            })
        })
    },

    stopCast() {
        controlScreen(this.did, {
            // url: '',
            pwr: 0,
        }).then(() => {
            this.setData({
                showReady: true,
                casting: false,
                vtControl: 0
            })
        })
    },
    // 我要投屏
    onControlScreen () {
        this.stopCast();
        controlScreen(this.did, {
            // pwr: 1,
            userdid: getUserInfo(true).userid,
            nickname: getUserInfo(true).nickname
        }).then(() => {
            const entity = getEntityByID(this.did);
            this.cleanScreenData();
            this.init(entity);
            this.setData({
                occupyByOther: ''
            })
        })
    },
    // 清空页面显示数据
    cleanScreenData () {
        const data = {
            type: null,
            url: null,
            occupyTime: 60,
            horizontal: false,
        }
        const currentData = {...this.data}
        
        ;['type', 'occupyTime', 'url', 'horizontal'].forEach(i => {
            if (data[i] !== undefined) {
                currentData[i] = data[i]
            }
        })
        currentData.fileName = ''
        if (currentData.type === DASHBOARD) {
            currentData.url = 'placeholder'
        }
        this.setData(currentData)
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    }
    ,

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    }
    ,

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    }
    ,

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearInterval(this.screenTimer);
    }
    ,

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    }
    ,

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }
    ,

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
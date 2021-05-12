// pages/addVt/addVt.js
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {getCurrentEntity, getEntityByID, getVtConfigByPid,updateCurrentEntity, isEntityCompleted, store} from "../../store/store";
import {printAndUpload} from "../../utils/logger";
import {uploadFile, openFile, download} from "./uploadFile";

import {fetchData} from "../../utils/net"
import {notifyError, simpleModal} from "../../utils/util"

import {Transformer} from "./Transformer";
import {addVt, editVt} from "../commonServices";
import {MATERIAL_PID, MEETING_MEMBER, MEETING_ROOM_RESERVATION_PID} from "../../utils/specialPIDs";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        error: null,
        modified: false,
        isEdit: false,
    },

    createBindings(bindingFunction) {
        const vtConfig = getVtConfigByPid(this.pid)
        if (!vtConfig) {
            return;
        }
        let {pid, columns} = vtConfig
        if (this.pid === MEETING_ROOM_RESERVATION_PID) {
            const jumpColumns = ['did', 'deputyorganizer', 'updator', 'createtime', 'updatetime', 'reservstatus', 'creator']
            columns = columns.map(item => {
                if (item.column === 'meetingdate') {
                    //系统中的timestamp 不正确，会议日期应该为date，所以在此特殊修改
                    return {...item, type: 'date', min: new Date().getTime()}
                }
                if (jumpColumns.includes(item.column)) {
                    return;
                }
                return item
            }).filter(item => {
                if (item) {
                    return item;
                }
            })
            //在增加一个额外的区间选择类型
            columns = [...columns, {
                canbeempty: false,
                candisplay: true,
                column: "meetingperiod",
                type: "meetingperiod",
                isdisplay: true,
                label: "会议时间段",
                required: 1,
                rw: 3,
                // defaultvalue: 1597024728,
                // emptyvalue: null,
                // fixed: false,
                // format: "HH:mm",
                // refdisplay: false,
                uniquedisplay: false
            },{
                canbeempty: true,
                candisplay: true,
                column: "relateusers",
                type: "relateusers",
                isdisplay: true,
                label: "与会人员",
                required: 1,
                pid:MEETING_MEMBER,
                rw: 3,
                // defaultvalue: 1597024728,
                // emptyvalue: null,
                // fixed: false,
                // format: "HH:mm",
                // refdisplay: false,
                uniquedisplay: false
            }, {
                canbeempty: true,
                candisplay: true,
                column: "note",
                defaultvalue: "",
                emptyvalue: null,
                fixed: false,
                isdisplay: true,
                label: "备注",
                maxlength: 128,
                refdisplay: true,
                required: 1,
                rw: 3,
                spec: "singleline",
                type: "string",
                uniquedisplay: false
            }]
        } else if (this.pid === MATERIAL_PID) {
            //在物料详情页面首行添加显示did，便于入库操作
            columns = columns.map(item => {
                if (item.column === 'did') {
                    //系统中的timestamp 不正确，会议日期应该为date，所以在此特殊修改
                    return {...item, candisplay: true}
                }
                return item
            })
        }
        const transformer = new Transformer({pid, columns}, this.columnFilter, !!this.did)
        return bindingFunction(transformer)
    },


    //返回false则不显示
    columnFilter(item) {
        const {required, candisplay, type, column} = item

        if (this.pid === MEETING_ROOM_RESERVATION_PID && (column === 'starttime' || column === 'endtime')) {
            return false
        }
        /*
            1-新增时展示 2-编辑时展示（同时展示required=1的字段）
            3-由系统赋值（前端新增或编辑时忽略此字段）；新增数据时，只提供required=1的字段;
        */

        if (this.did /*如果是编辑*/) {
            return /*(required === 1 || required ===2 ) &&*/ candisplay
        } else {
            return required === 1
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.pid = options.pid
        //如果存在就是编辑状态
        this.did = options.did
        // this.did = '1000e186010000000000a4734969872a'
        // this.pid = '000000000000000000000000e1860100'

        this.setData({
            isEdit: !!this.did
        })


        this.storeBindings = createStoreBindings(
            this, {
                store,
                fields: {
                    originEntity: () => getEntityByID(this.did),
                    currentEntity: () => getCurrentEntity(),
                    vtConfig: () => getVtConfigByPid(this.pid),
                    formData: () => this.createBindings((transformer) => {
                        const entity = getCurrentEntity()
                        return transformer.getFormData(entity)
                    }),
                    formInfo: () => {
                        const entity = getCurrentEntity()
                        return this.createBindings(transformer => transformer.getDisplayInfos(entity))
                    },
                    keys: () => this.createBindings(transformer => transformer.getKeys()),
                    rules: () => this.createBindings(transformer => transformer.getFormValidateRules())
                },
                actions: ['updateVtConfig', 'clearFilterByPid', 'updateEntityAndVtConfig', 'updateEntityByID', 'setCurrentEntity', 'updateCurrentEntity', 'addOrUpdateEntities']
            }
        )
        wx.nextTick(() => {
            if (!this.did) {
                //新增VT
                if (!this.data.vtConfig) {
                    fetchData({
                        url: "/sfsaas/api/module/config",
                        requestData: {
                            pid: this.pid
                        }
                    }).then(({data}) => {
                        this.updateVtConfig(data.data)
                    })
                }
                //更新当前编辑或者新增的entity 于stroe中
                this.setCurrentEntity(this.did)
                let codeParams = null;
                if (options.param) {
                    codeParams = JSON.parse(decodeURIComponent(options.param))
                    for (const key in codeParams) {
                        if (codeParams.hasOwnProperty(key)) {
                            const value = codeParams[key];
                            if (value.constructor === Object) {
                                this.updateEntity({
                                    [key]: value.did,
                                    [`${key}.name`]: value.name
                                })
                            } else {
                                this.updateEntity({
                                    [key]: value
                                })
                            }
                        }
                    }
                }
                if (this.pid === MEETING_ROOM_RESERVATION_PID) {
                    this.updateEntity({
                        ['relateusers']: [{
                            'userdid':wx.getStorageSync('LoginInfo').userInfo.did,
                            'notify': 0 
                        }]
                    })
                }
            } else {
                //如果是编辑
                //修改为在任何情况下都获取
                fetchData({
                    url: "/sfsaas/api/filter/vtinfo",
                    requestData: {
                        did: this.did, pid: this.pid
                    }
                }).then(({data}) => {
                    try {
                        //扫码的情况下PID可能不存在
                        this.pid = data.vtconfig.pid
                        this.updateEntityAndVtConfig(data)
                        //更新当前编辑或者新增的entity 于stroe中
                        this.setCurrentEntity(this.did)
                    } catch (e) {
                        printAndUpload.error('服务器返回格式有误', '/sfsaas/api/filter/vtinfo', data, e)
                        notifyError(e, '服务器返回格式有误')
                    }

                })
                if (this.pid === MEETING_ROOM_RESERVATION_PID) {
                    this.getMeetingRoomData()
                }
                //更新当前编辑或者新增的entity 于stroe中
                this.setCurrentEntity(this.did)

            }

        })
    },
    // 获取会议室预约数据
    getMeetingRoomData() {
        fetchData({
            url: "/vt/meetingroom/reservation/detail",
            requestData: {
                did: this.did, pid: this.pid
            },
            extraHeader: {
                reqUserId: wx.getStorageSync('LoginInfo').userInfo.userid || ''
            }
        }).then(({data}) => {
            let {note, relateusers} = data.data;
            relateusers.forEach(item => {
                item.did = item.userdid
            })
            this.addOrUpdateEntities(relateusers, this.pid);
            this.updateCurrentEntity({note, relateusers})
        })
    },
    formChange(event) {
        const {
            field
        } = event.currentTarget.dataset
        const formValue = event.detail.value
        this.updateEntityWithFormValue(field, formValue)
    },


    updateEntityWithFormValue(key, formValue) {
        const {vtConfig, isEdit} = this.data
        const transformer = new Transformer(vtConfig, this.columnFilter, isEdit)
        const realValue = transformer.formDataToValue(key, formValue)
        this.updateEntity({
            [key]: realValue
        })
    },

    showDatetimePicker(event) {
        const {field} = event.currentTarget.dataset

        this.setData({
            showDatetimePicker: true,
            currentKey: field
        })
    },

    showPeriodPickerPicker(event) {
        const {field} = event.currentTarget.dataset
        const {currentEntity = {}} = this.data
        if (!currentEntity.meetingdate || !currentEntity.meetingroom) {
            wx.showToast({
                title: '请先选择会议室与日期',
                icon: 'none'
            })
            return;
        }
        this.setData({
            showPeriodPickerPicker: true,
            currentKey: field
        })
    },

    onPeriodPickerCancel() {
        this.setData({
            showPeriodPickerPicker: false,
        })
    },

    onPeriodPickerUpdate(event) {
        this.updateEntity(event.detail)
    },


    onPickerConfirm(event) {
        const {currentKey: key} = this.data, {detail} = event
        console.error(detail)
        this.updateEntityWithFormValue(key, detail)
        this.setData({
            showDatetimePicker: false
        })
    },

    onPickerCancel() {
        this.setData({
            showDatetimePicker: false
        })
    },

    getDiff(base, current) {
        if (!base) {
            return current
        }
        return Object.keys(current).reduce((diff, key) => {
            //todo 是否需要排除!key.endsWith('.name')  待定
            if (base[key] !== current[key]) {
                if (!diff) {
                    diff = {}
                }
                diff[key] = current[key]
                return diff
            }
            return diff
        }, null)
    },

    submitForm() {
        const {currentEntity, originEntity, isEdit} = this.data
        this.selectComponent('#addVtForm').validate((valid, errors) => {
            try {
                const data = this.getDiff(originEntity, currentEntity)
                if (!data) {
                    printAndUpload.error('data为空')
                    return;
                }
                //过滤掉ref对于的.name属性
                const trimmedData = Object.keys(data).reduce((result, key) => {
                    if (!key.endsWith('.name')) {
                        result[key] = data[key]
                    }
                    return result
                }, {})
                if (valid) {
                    let task
                    if (isEdit) {
                        task = editVt(this.pid, this.did, trimmedData)
                    } else {
                        task = addVt(this.pid, trimmedData)
                    }
                    task.then(() => {
                        wx.showToast({
                            title: '保存成功',
                            icon: 'none'
                        })
                        if (wx.disableAlertBeforeUnload) {
                            wx.disableAlertBeforeUnload()
                        }
                        wx.navigateBack()
                    })
                } else {
                    this.handlerValidErrors(...errors)
                }
            } catch (e) {
                printAndUpload.error(e)
            }
        })
    },

    handlerValidErrors(...errors) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
            this.setData({
                error: errors[firstError[0]].message
            })

        }
    },
    afterRead(event) {
        const {file: {path, name}} = event.detail
        console.error(path, name)
        const {
            field
        } = event.currentTarget.dataset

        this.setData({
            [`formData.${field}`]: [{
                url: path,
                status: 'uploading',
                message: '上传中',
            },]
        })
        // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
        uploadFile(path, name, this.pid, field).then((result) => {
            this.updateEntity({
                [field]: result.url
            })

            // this.setData({
            //     [`formInfo.items[${index}].fileList`]: [
            //         {
            //             url: result.url,
            //             status: 'done',
            //             message: '上传完成',
            //         }
            //     ],
            //     [`formInfo.items[${index}].originValue`]: result.url,
            //     [`formInfo.data.${field}`]: result.url
            // })
        }).catch(error => {
            this.setData({
                [`formData.${field}`]: [{
                    url: path,
                    status: 'failed',
                    message: '上传失败',
                },]
            })
            notifyError(error, '上传失败')
        })
    },

    imgDelete(event) {
        console.error('imgDelete', event)
        const {
            field, index
        } = event.currentTarget.dataset

        this.updateEntity({
            [field]: null
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

    clickPreview(event) {
        // console.error('clickPreview!!', event)

        const {
            field,
        } = event.currentTarget.dataset

        const {url} = this.data.formData[field][0]
        let fileType = ''

        try {
            let lastDotIndex = url.lastIndexOf('.')
            fileType = lastDotIndex !== -1 ? url.substring(lastDotIndex + 1) : ''
        } catch (e) {
            printAndUpload.error(e, path)
        }
        console.error(fileType)
        const imageTypes = ['gif', 'jpeg', 'jpg', 'png']
        if (!imageTypes.find(t => t.toLowerCase() === fileType.toLowerCase())) {
            download(url)
                .then(res => openFile(res.tempFilePath, fileType))
                .catch(error => {
                    notifyError(error, '打开文件失败')
                })
        }
    },

    refClicked(event) {
        const {field, pid, multiple} = event.currentTarget.dataset
        if (!pid || !field) {
            simpleModal('未能找到相关数据')
        }
        let url = `/pages/filters/filters?pid=${pid}&chooseMode=true&label=${this.data.formInfo[field].label}`
        if (field === 'meetingroom') {
            const currentVal = this.data.currentEntity[field] || ''
            url = `/pages/meeting/meetingRoomList/meetingRoomList?selected=${encodeURIComponent(JSON.stringify(currentVal))}`
        }

        if(multiple){
            const currentVal = this.data.currentEntity[field] || []
            url += `&multipleMode=true&selected=${encodeURIComponent(JSON.stringify(currentVal.map(i => i.userdid)))}`
        }
        if (field === 'relateusers') {
            const currentVal = this.data.currentEntity[field] || []
            url = `/pages/member/memberList/memberList?selected=${encodeURIComponent(JSON.stringify(currentVal))}`
        }
        wx.navigateTo({
            url: url,
            events: {
                // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                acceptDataFromOpenedPage: (data) => {
                    if(Array.isArray(data)){
                        this.updateEntity({
                            [field]: data.map(item => ({
                                'userdid':item.did,
                                'notify': 0 
                            }))
                        })
                    }else{
                        this.updateEntity({
                            [field]: data.did,
                            [`${field}.name`]: data.name
                        })
                    }
                },
            },
            success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                // res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
            }
        })
    },

    updateEntity(updates) {
        this.updateCurrentEntity(updates)
        wx.nextTick(() => {
            const {currentEntity, originEntity} = this.data
            const data = this.getDiff(originEntity, currentEntity)
            if (data) {
                this.setData({
                    modified: true
                })
                if (wx.enableAlertBeforeUnload) {
                    wx.enableAlertBeforeUnload({
                        message: '确定放弃当前修改并且退出吗？'
                    })
                }
            } else {
                this.setData({
                    modified: false
                })
                if (wx.disableAlertBeforeUnload) {
                    wx.disableAlertBeforeUnload()
                }
            }
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
        this.setCurrentEntity(null)
        delete this.meetingRoomData
        delete this.relateusers
        this.storeBindings.destroyStoreBindings()
    },
    // 关闭时间弹窗
    onClose() {
        this.setData({
            showDatetimePicker: false
        })
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
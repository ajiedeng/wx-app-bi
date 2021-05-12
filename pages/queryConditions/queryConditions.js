//queryConditions.js
import {
    fetchData
} from '../../utils/net'
import {
    createStoreBindings
} from "mobx-miniprogram-bindings";
import {
    getVtConfigByPid,
    getVtFilterCondition,
    store
} from "../../store/store";

function getDayStartEnd(date = new Date()) {
    let dayStart, dayEnd
    if (date instanceof Date) {
        dayStart = (new Date(date.getFullYear(), date.getMonth(), date.getDate(), '00', '00', '00')).getTime();
        dayEnd = (new Date(date.getFullYear(), date.getMonth(), date.getDate(), '23', '59', '59')).getTime();
    } else { //时间戳
        const _date = new Date(date);
        dayStart = (new Date(_date.getFullYear(), _date.getMonth(), _date.getDate(), '00', '00', '00')).getTime();
        dayEnd = (new Date(_date.getFullYear(), _date.getMonth(), _date.getDate(), '23', '59', '59')).getTime();
    }
    return {
        dayStart,
        dayEnd
    }
}

Page({
    data: {
        curCondition: null,
        popupLabelShow: false,
        popupCheckboxShow: false,
        enumNames: [],
        enumSelectedVal: 0,
        startDate: getDayStartEnd().dayStart,
        endDate: getDayStartEnd().dayEnd,
        startDatePickerShow: false,
        endDatePickerShow: false
    },
    getConfig() {
        fetchData({
            url: "/sfsaas/api/module/config",
            requestData: {
                pid: this.pid
            }
        }).then(({
            data
        }) => {
            this.updateVtConfig(data.data)
        })
    },
    getEnumNames(enumObj) {
        const enumNames = [];
        for (let key in enumObj) {
            if (enumObj.hasOwnProperty(key)) {
                enumNames.push({key,val:enumObj[key]})
            }
            // enumNames[key] = enumObj[key]
        }
        console.log('----enumSelectedVal--', enumNames);
        this.setData({
            enumNames,
            enumSelectedVal: enumNames[0].key,
            curCondition: {
                ...this.data.curCondition,
                value: enumNames[0].key
            }
        })

    },
    initTypeSetting(type, index) {
        if (type === 'string') {
            this.setData({
                curCondition: {
                    ...this.data.curCondition,
                    value: ''
                }
            });
        } else if (type === 'timestamp') {
            this.setData({
                curCondition: {
                    ...this.data.curCondition,
                    value: [this.data.startDate / 1000, this.data.endDate / 1000]
                }
            });
        } else if (type === 'enum') {
            this.getEnumNames(this.data.vtConfigColumns[index].enum);
        }
    },
    onInputChange(event) {
        this.setData({
            curCondition: {
                ...this.data.curCondition,
                value: event.detail
            }
        });
    },
    checkboxToggle(event) {
        const {
            index
        } = event.currentTarget.dataset;
        // const checkbox = this.selectComponent(`.checkboxes-${index}`);
        // checkbox.toggle();
        this.setData({
            curCondition: {
                ...this.data.curCondition,
                value: index
            },
            enumSelectedVal: index
        });
    },
    onAllConfirm() {
        let value = this.data.curCondition && this.data.curCondition.value;
        if (value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0)) {
            return wx.showToast({
                title: '请完善筛选条件',
                icon: 'none',
                duration: 2000
            })
        }
        console.log('conditions', this.data.curCondition.column, this.data.curCondition.value)
        this.updateQueryConditions({
            [this.data.curCondition.column]: this.data.curCondition.value
        }, this.pid);
        wx.navigateBack();
    },
    onPickerConfirm(event) {
        const {
            index
        } = event.detail;
        this.setData({
            curCondition: this.data.vtConfigColumns[index]
        });
        this.initTypeSetting(this.data.vtConfigColumns[index].type, index)
        this.toggleLabelPopup();
    },
    onDatePickerConfirm(e) {
        const type = e.currentTarget.dataset.type
        if (type === 'start') {
            let endDate = this.data.endDate;
            if (e.detail > endDate) {
                endDate = getDayStartEnd(e.detail).dayEnd;
            }
            const _dateArr = [e.detail / 1000, endDate / 1000];
            this.setData({
                curCondition: {
                    ...this.data.curCondition,
                    value: _dateArr
                },
                startDate: e.detail,
                endDate
            });

        } else if (type === 'end') {
            let startDate = this.data.startDate;
            if (e.detail < startDate) {
                startDate = getDayStartEnd(e.detail).dayStart;
            }
            const _dateArr = [startDate / 1000, e.detail / 1000];
            this.setData({
                curCondition: {
                    ...this.data.curCondition,
                    value: _dateArr
                },
                startDate,
                endDate: e.detail
            });

        }
        this.toggleDatePickerPopup(e)
    },
    onDatePickerChange(e) {
        console.log(`change---acted`)
    },
    toggleLabelPopup() {
        this.setData({
            popupLabelShow: !this.data.popupLabelShow
        })
    },
    toggleCheckboxPopup() {
        this.setData({
            popupCheckboxShow: !this.data.popupCheckboxShow
        })
    },
    toggleDatePickerPopup(e) {
        const type = e.currentTarget.dataset.type
        if (type === 'start') {
            this.setData({
                startDatePickerShow: !this.data.startDatePickerShow
            })
        } else if (type === 'end') {
            this.setData({
                endDatePickerShow: !this.data.endDatePickerShow
            })
        } else {
            this.setData({
                startDatePickerShow: false,
                endDatePickerShow: false
            })
        }
    },
    onLoad: function (option) {
        this.pid = option.pid;
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: {
                vtConfigColumns: () => getVtConfigByPid(this.pid).columns && getVtConfigByPid(this.pid).columns.filter(function (_item) {
                    // 过滤掉'ref'字段数据
                    return _item.type !== 'ref'
                })
            },
            actions: ['updateVtConfig', 'updateQueryConditions']
        });
        this.getConfig();
    },
    onShow() {

    },
    onHide() {

    },
    onUnload: function () {
        this.storeBindings.destroyStoreBindings()
    },
})
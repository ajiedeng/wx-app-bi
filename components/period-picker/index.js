import {VantComponent} from '../../miniprogram_npm/@vant/weapp/common/component';
import {pickerProps} from './shared';
import {
    expiredSlots,
    generatePeriod,
    generateSlots,
    getSlotIdByDate,
    getSlotsID,
    getTimePeriod, rangeToMap
} from "./slot";
import {getUserInfo} from "../../utils/loginInfo";
import {fetchData} from "../../utils/net"
import {store} from "../../store/store";
import {updatePicker, updateTimePeriod} from "./update";

VantComponent({
    classes: ['active-class', 'toolbar-class', 'column-class'],
    props: Object.assign(Object.assign({}, pickerProps), {
        valueKey: {
            type: String,
            value: 'text',
        },
        show: {
            type: Boolean,
            value: false,
            observer(show) {
                if (show) {
                    const {selectedSlots} = this.data
                    let slotId;
                    if (selectedSlots && Object.keys(selectedSlots).length > 0) {
                        slotId = Object.keys(selectedSlots).sort()[0]
                    } else {
                        slotId = getSlotIdByDate(new Date())
                    }
                    setTimeout(() => {
                        this.setData({
                            slotId
                        })
                    }, 100)
                }
            }
        },
        toolbarPosition: {
            type: String,
            value: 'top',
        },
        defaultIndex: {
            type: Number,
            value: 0,
        },
        columns: {
            type: Array,
            value: generatePeriod(),
            observer(columns = []) {
                this.simple = columns.length && !columns[0].values;
                this.children = this.selectAllComponents('.van-picker__column');
                if (Array.isArray(this.children) && this.children.length) {
                    this.setColumns().catch(() => {
                    });
                }
            },
        },
        // date: {
        //     type: Number,
        //     value: new Date().getTime()
        // },
        // roomId: {
        //     type: String,
        // }

        entity: {
            type: Object,
            value: null,
            observer(newEntity, oldEntity) {
                updatePicker.call(this, ...arguments)
            }
        }
    }),
    data: {},
    created() {

        console.error('create')
    },
    beforeCreate() {
        this.children = [];
    },
    methods: {
        noop() {
        },
        clickOverlay() {
            if (this.data.loading) {
                //直接关闭弹框
                this.triggerEvent('cancel')
            }
        },
        itemClicked(event) {
            const {slot: slotStr} = event.currentTarget.dataset
            const slot = parseInt(slotStr)
            const {occupiedSlots = {}, expiredSlots = {}, selectedSlots = {}} = this.data
            if (occupiedSlots[slot] || expiredSlots[slot]) {
                return
            }
            const selectedIds = Object.keys(selectedSlots || {}).map(i => parseInt(i)).sort()
            let minSlot, maxSlot
            if (selectedIds.length > 0) {
                minSlot = selectedIds[0]
                maxSlot = selectedIds[selectedIds.length - 1]
            }


            if (minSlot == null || maxSlot == null) {
                minSlot = maxSlot = slot
            } else if (slot < minSlot) {
                minSlot = slot
            } else if (slot > maxSlot) {
                maxSlot = slot
            } else if (maxSlot - slot < slot - minSlot) {
                maxSlot = slot - 1
            } else {
                minSlot = slot + 1
            }

            for (let i = minSlot; i <= maxSlot; i++) {
                if (occupiedSlots[i] || expiredSlots[i]) {
                    wx.showToast({
                        title: '必须选择连续的时间',
                        icon: 'none'
                    })
                    return;
                }
            }
            this.setData({selectedSlots: rangeToMap(minSlot, maxSlot)})
        },

        setColumns() {
            const {data} = this;
            const columns = this.simple ? [{values: data.columns}] : data.columns;
            const stack = columns.map((column, index) =>
                this.setColumnValues(index, column.values)
            );
            return Promise.all(stack);
        },
        emit(event) {
            const {type} = event.currentTarget.dataset;
            if (this.simple) {
                this.$emit(type, {
                    value: this.getColumnValue(0),
                    index: this.getColumnIndex(0),
                });
            } else {
                this.$emit(type, {
                    value: this.getValues(),
                    index: this.getIndexes(),
                });
            }
        },
        confirm(event) {
            const {selectedSlots = {}, date} = this.data

            const slots = Object.keys(selectedSlots)
            if (slots.length === 0) {
                wx.showToast({
                    title: '请选择时间',
                    icon: 'none'
                })
                return
            }

            updateTimePeriod.call(this, slots)

            //直接关闭弹框
            this.triggerEvent('cancel')
        },
        onChange(event) {
            if (this.simple) {
                this.$emit('change', {
                    picker: this,
                    value: this.getColumnValue(0),
                    index: this.getColumnIndex(0),
                });
            } else {
                this.$emit('change', {
                    picker: this,
                    value: this.getValues(),
                    index: event.currentTarget.dataset.index,
                });
            }
        },
        // get column instance by index
        getColumn(index) {
            return this.children[index];
        },
        // get column value by index
        getColumnValue(index) {
            const column = this.getColumn(index);
            return column && column.getValue();
        },
        // set column value by index
        setColumnValue(index, value) {
            const column = this.getColumn(index);
            if (column == null) {
                return Promise.reject(new Error('setColumnValue: 对应列不存在'));
            }
            return column.setValue(value);
        },
        // get column option index by column index
        getColumnIndex(columnIndex) {
            return (this.getColumn(columnIndex) || {}).data.currentIndex;
        },
        // set column option index by column index
        setColumnIndex(columnIndex, optionIndex) {
            const column = this.getColumn(columnIndex);
            if (column == null) {
                return Promise.reject(new Error('setColumnIndex: 对应列不存在'));
            }
            return column.setIndex(optionIndex);
        },
        // get options of column by index
        getColumnValues(index) {
            return (this.children[index] || {}).data.options;
        },
        // set options of column by index
        setColumnValues(index, options, needReset = true) {
            const column = this.children[index];
            if (column == null) {
                return Promise.reject(new Error('setColumnValues: 对应列不存在'));
            }
            const isSame =
                JSON.stringify(column.data.options) === JSON.stringify(options);
            if (isSame) {
                return Promise.resolve();
            }
            return column.set({options}).then(() => {
                if (needReset) {
                    column.setIndex(0);
                }
            });
        },
        // get values of all columns
        getValues() {
            return this.children.map((child) => child.getValue());
        },
        // set values of all columns
        setValues(values) {
            const stack = values.map((value, index) =>
                this.setColumnValue(index, value)
            );
            return Promise.all(stack);
        },
        // get indexes of all columns
        getIndexes() {
            return this.children.map((child) => child.data.currentIndex);
        },
        // set indexes of all columns
        setIndexes(indexes) {
            const stack = indexes.map((optionIndex, columnIndex) =>
                this.setColumnIndex(columnIndex, optionIndex)
            );
            return Promise.all(stack);
        },
        onClose () {
            this.setData({ show: false });
        }
    },
});

//search.js
import {
    fetchData
} from '../../utils/net'
import {
    createStoreBindings
} from "mobx-miniprogram-bindings";
import {
    getVtConfigByPid,
    store
} from "../../store/store";

Page({
    data: {

        searchTxt: '',
        navBarHeight: 0,
        barBoxWidth: 0,
        barBoxTop: 0,
        searchHeight: 0
    },
    back() {
        wx.navigateBack();
    },
    filterColumns(vtConfig) {
        return vtConfig && vtConfig.columns ? vtConfig.columns.filter(function (item) {
            return item.type === 'string'
        }) : [];
    },
    getDefaultColumn(queryConditions, filterColumns) {
        const columnArr = filterColumns.map(item => item.column);
        const keyArr = queryConditions ? Object.keys(queryConditions).reverse().concat(['name']) : ['name'];
        for (let i = 0; i < keyArr.length; i++) {
            if (columnArr.includes(keyArr[i])) {
                return keyArr[i]
            }
        }
        return columnArr[0] || ''
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
    setNavBarHeight() {
        const systemInfo = wx.getSystemInfoSync();
        // 胶囊按钮位置信息
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
        const navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
        // 自定义内容宽度 = 屏幕宽度-胶囊宽度-3*胶囊距离右距离
        const barBoxWidth = systemInfo.screenWidth - menuButtonInfo.width - 3 * (systemInfo.screenWidth - menuButtonInfo.right);
        //距离顶部距离
        const barBoxTop = menuButtonInfo.top;
        //胶囊高度
        const searchHeight = menuButtonInfo.height;

        this.setData({
            navBarHeight,
            barBoxWidth,
            barBoxTop,
            searchHeight
        })
    },
    selectColumn(e) {
        const {
            column
        } = e.currentTarget.dataset;
        this.setData({
            searchColumn: column
        })
        if (this.data.searchTxt) {
            this.updateBack({
                [column]: this.data.searchTxt
            })
        }

    },
    onClear() {
        this.setData({
            searchTxt: ''
        })
    },
    onChange(event) {
        const searchTxt = event.detail.trim();
        this.setData({
            searchTxt
        })
    },
    onSearch(event) {
        const searchTxt = event.detail.trim();
        this.setData({
            searchTxt
        })
        if (searchTxt.length <= 0) {
            return wx.showToast({
                title: '请填写搜索关键词',
                icon: 'none',
                duration: 2000
            })
        }
        if (this.data.searchColumn.length <= 0) {
            return wx.showToast({
                title: '请指定搜索内容类别',
                icon: 'none',
                duration: 2000
            })
        }
        this.updateBack({
            [this.data.searchColumn]: searchTxt
        })
    },
    selectHistory(e) {
        const {
            value,
            key
        } = e.currentTarget.dataset;
        this.setData({
            searchTxt: value,
            searchColumn: key
        });
        this.updateBack({
            [key]: value
        })
    },
    clearSearchHistory() {
        this.clearQueryHistory();
    },
    updateBack(update) {
        this.updateQueryConditions(update, this.pid);
        this.back();
    },
    onLoad: function (option) {
        console.log(JSON.stringify(store.historyConditions))
        this.pid = option.pid;
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: {
                filterVtConfig: () => this.filterColumns(getVtConfigByPid(this.pid)),
                historyConditions: () => store.historyConditions,
                searchColumn: () => this.getDefaultColumn(store.queryConditions, this.filterColumns(getVtConfigByPid(this.pid))),
            },
            actions: ['updateVtConfig', 'updateQueryConditions', 'clearQueryHistory']
        });
        this.getConfig();
        this.setNavBarHeight();
    },
    onShow() {

    },
    onHide() {

    },
    onUnload: function () {
        this.storeBindings.destroyStoreBindings()
    },
})
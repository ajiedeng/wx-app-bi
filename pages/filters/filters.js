// pages/filters.js
import {goCertainDetailPage, isContactsVt, TASK_PID, CAST_SCREEN_PID, INVITE_VISITOR_PID} from "../../utils/specialPIDs";

const {
    fetchData
} = require('../../utils/net')
const {simpleModal, formatTime} = require('../../utils/util')

import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {getEntityByID, getFiltersByPID, getQueryConditions, getVtConfigByPid, store} from '../../store/store'
import {fetchVtConfigByPid, filterQuery, getFilters} from "../commonServices";
import {Transformer} from "../addVt/Transformer";
import {printAndUpload} from "../../utils/logger";

const pagesize = 20

function getNextPage({list, total} = {}) {
    if (!list || total == null) {
        return 1
    }
    if (list.length >= total) {
        return -1
    }
    const currentPage = Math.floor(list.length / pagesize)
    return currentPage + 1
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // filters: [],
        // dataByDid: {
        //     //did:{isFectching:boolean,list:[],total:number}
        // },
        currentFilter: null,
        loadingState: {
            /*
            filterid1:true,
            filterid2:false
            */
        },

    },

    bindscrolltolower() {
        this.fetchListByFilterID(this.data.currentFilter)
    },

    onFilterTagClick(event) {
        const did = event.currentTarget.dataset.did
        console.error(did)
        if (did !== this.data.currentFilter) {
            this.selectFilterTag(did)
        }
    },

    //默认情况下，在当前列表为空的时候采取获取数据
    //refresh为true，那么就强制刷新
    selectFilterTag(filterID, refresh) {
        this.setData({
            currentFilter: filterID,
        })
        const currentDataPiece = this.data.listByFilter[filterID]
        if (refresh) {
            this.fetchListByFilterID(filterID, true)
        } else if (!currentDataPiece || currentDataPiece.total == null || !currentDataPiece.list) {
            this.fetchListByFilterID(filterID)
        }
    },

    listScrollViewHeight() {
        // 然后取出navbar和header的高度
        // 根据文档，先创建一个SelectorQuery对象实例
        let query = wx.createSelectorQuery().in(this);
        // 然后逐个取出navbar和header的节点信息
        // 选择器的语法与jQuery语法相同
        query.select('#filtersView').boundingClientRect();
        query.select('#filtersNvabar').boundingClientRect();
        query.select('#searchBar').boundingClientRect();
        // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
        query.exec((res) => {
            // 分别取出navbar和header的高度
            const height = res.reduce((sum, cur) => {
                return sum + cur.height
            }, 0)

            // 然后就是做个减法
            let scrollViewHeight = wx.getSystemInfoSync().windowHeight - height;
            console.error('scrollViewHeight:', scrollViewHeight)
            // 算出来之后存到data对象里面
            this.setData({
                //为啥减60我也不清楚 ，反正就这样吧
                scrollViewHeight: scrollViewHeight - 40
            });
        });
    },

    async fetchListByFilterID(filterID, refresh) {
        const currentDataPiece = this.data.listByFilter[filterID] || {}
        //如果是强制刷新就从第一页获取
        const nextPage = refresh ? 1 : getNextPage(currentDataPiece)

        const loadingFlagPath = `loadingState.${filterID}`
        if (nextPage > 0) {
            this.setData({
                currentFilter: filterID,
                [loadingFlagPath]: true
            })

            try {
                const conditions = getQueryConditions()
                const conditionFilters = conditions && Object.keys(conditions).length > 0 ? Object.keys(conditions).map(key => {
                    //数组被mobx包装后，无法通过Array.isArray判断是否为数组
                    const value = conditions[key].map ? conditions[key] : [conditions[key]]
                    return {[key]: value.map(i => i + '')}
                }) : []

                const filter = [...conditionFilters,...this.filterInUrl]

                const result = await filterQuery(this.pid, {
                    filterID,
                    "page": nextPage,
                    "pageSize": pagesize,
                    filter: filter
                })

                this.setData({
                    currentFilter: filterID,
                    [loadingFlagPath]: false
                })

            } catch (e) {
                console.error(e)
                if (!e.handled) {
                    simpleModal('处理数据出错')
                }

                printAndUpload.error('服务器返回vt list出错', '/sfsaas/api/filter/query', e)
                this.setData({
                    currentFilter: filterID,
                    [loadingFlagPath]: false
                })
            }

        } else {
            this.setData({
                currentFilter: filterID
            })
        }
    },

    async fetchFilterTags(pid) {
        let data;
        try {
            const filters = await getFilters(pid)
            if (filters && filters.length > 0) {
                //更新store中的filters
                this.selectFilterTag(filters[0].did, true)
            }
        } catch (e) {
            if (!e || !e.handled) {
                simpleModal('标签数据有误')
                printAndUpload.error('服务器返回filter有误', '/sfsaas/api/filter/list', data, e)
            }
            // wx.navigateBack({
            //   delta: 1,
            // })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.listScrollViewHeight()
        // const pid = "'000000000000000000000000cf860100'"
        this.pid = options.pid
        this.filterInUrl = options.filter ? JSON.parse(decodeURIComponent(options.filter)) : []
        console.error(this.filterInUrl)
        // this.pid = '000000000000000000000000a6860100'
        const selectedItems = options.selected ? JSON.parse(decodeURIComponent(options.selected)) : []
        this.setData({
            title: options.label,
            canAdd: !this.isTimeCardVt() && !options.chooseMode,
            isContactsVt: isContactsVt(this.pid),
            //选择模式，供其他模块选择
            chooseMode:!!options.chooseMode,
            //是否可以多选
            multipleMode:options.multipleMode === 'true',
            //已选中的id，url中为数组，在此转为对象
            selectedItems:selectedItems.reduce((obj,item)=>{
                obj[item] = true
                return obj
            },{}),
            selectedNumber:selectedItems.length
        })

        //清楚上次的搜索条件
        store.clearQueryConditions()

        this.storeBindings = createStoreBindings(this, {
            store,
            fields: {
                filters: () => getFiltersByPID(this.pid),
                vtConfig: () => getVtConfigByPid(this.pid),
                listByFilter: () => {
                    const filters = getFiltersByPID(this.pid)
                    const vtConfig = getVtConfigByPid(this.pid)
                    
                    if (filters && vtConfig) {
                        const result = {} //{total:100,list:[{obj},{obj},{obj}]}
                        const transformer = new Transformer(vtConfig)
                        filters.forEach(({did}) => {
                            const {total, list} = store.listByFilter[did] || {}
                            result[did] = {
                                total,
                                list: list ? list.map(did => {
                                    const entity = getEntityByID(did) || {}
                                    return Object.keys(entity).reduce((sum, key) => {
                                        sum[key] = transformer.valueToText(key, entity[key], entity)
                                        return sum
                                    }, {})
                                }) : null
                            }
                        })
                        return result
                    } else {
                        return {}
                    }
                },
                queryConditions: () => {
                    console.error('queryConditions1', this.data.queryConditions, this.data.currentFilter)
                    if (this.data.queryConditions !== undefined && this.data.currentFilter) {
                        console.error('queryConditions2')
                        store.clearFilterByPid(this.pid)
                        this.fetchListByFilterID(this.data.currentFilter, true)
                    }
                    return getQueryConditions()
                },
                queryConditionArray: () => {
                    const conditions = getQueryConditions()
                    const vtConfig = getVtConfigByPid(this.pid)
                    if (conditions && vtConfig) {
                        const transformer = new Transformer(vtConfig)
                        return Object.keys(conditions).map(key => {
                            let text
                            const condition = conditions[key]
                            // console.error('-------',key, JSON.stringify(condition))
                            if (condition.map) {
                                text = condition.map(i => transformer.valueToText(key, i)).join('-')
                            } else {
                                text = transformer.valueToText(key, condition)
                            }
                            return {text, key}
                        })
                    }
                }
            },
            actions: ['setFilters', 'queryVtByFilterSuccess', 'updateEntityByID', 'deleteQueryConditionByKey'],
        })

        wx.nextTick(() => {
            if (this.data.filters) {
                //如果有缓存，先显示缓存
                this.selectFilterTag(this.data.filters[0].did)
            }
            fetchVtConfigByPid(this.pid)
            //重新获取
            this.fetchFilterTags(this.pid)
        })

    },

    onRefresh() {
        //列表下拉刷新
        this.fetchListByFilterID(this.data.currentFilter, true).finally(() => {
            this.setData({
                refresherTriggered: false,
            })
        })
    },

    makePhoneCall(event) {
        const {phone} = event.currentTarget.dataset
        wx.makePhoneCall({
            phoneNumber: phone,
            fail(res) {
                simpleModal('拨号失败', res.errMsg || res.msg || res)
            }
        })
    },

    back() {
        wx.navigateBack()
    },

    addVt() {
        if (this.isTaskVt()) {
            wx.navigateTo({
                url: `/legacy/task/pages/taskCreate`,
            })
        } else if(this.pid === INVITE_VISITOR_PID){
            wx.navigateTo({
                url: `/pages/visitor/invite`,
            })
        }else {
            wx.navigateTo({
                url: `/pages/addVt/addVt?pid=${this.pid}`,
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.storeBindings.destroyStoreBindings()
    },

    gotoDetail(did) {
        goCertainDetailPage({did})
    },

    goBack(did) {
        const entity = getEntityByID(did)
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.emit('acceptDataFromOpenedPage', entity)
        wx.navigateBack()
    },

    confirmSelect(){
        const {selectedItems} = this.data
        const entities = Object.keys(selectedItems).filter(did=>selectedItems[did]).map(id=> getEntityByID(id))
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.emit('acceptDataFromOpenedPage', entities)
        wx.navigateBack()
    },

    chooseItem(event) {
        const {chooseMode,multipleMode,selectedItems} = this.data
        const did = event.currentTarget.dataset.did
        if (!did) {
            simpleModal('未能找到did')
            return
        }
        if (chooseMode && !multipleMode) {
            this.goBack(did)
        }else if(chooseMode && multipleMode){
            const items = {...selectedItems}
            items[did] = !items[did];
            const selectedNumber = Object.keys(items).filter(did=>items[did]).length
            this.setData({
                selectedItems:items,
                selectedNumber
            })
        }else {
            this.gotoDetail(did)
        }
    },

    isTaskVt() {
        return this.pid === TASK_PID
    },

    isTimeCardVt() {
        return this.pid === '000000000000000000000000d4860100'
    },

    deleteQueryCondition(event) {
        wx.showModal({
            title: '确认删除',
            content: '确认删除该条件吗？',
            showCancel: true,
            success: (res) => {
                if (res.confirm) {

                    const key = event.currentTarget.dataset.key
                    console.error('deleteQueryCondition:', key)
                    this.deleteQueryConditionByKey(key)
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (this.data.currentFilter) {
            //如果是任务列表，就直接刷新当前
            this.selectFilterTag(this.data.currentFilter, this.isTaskVt())
        }

    },
    clickSearchInput() {
        wx.navigateTo({
            url: `/pages/search/search?pid=${this.pid}`,
        })
    },
    clickSearchFilter() {
        wx.navigateTo({
            url: `/pages/queryConditions/queryConditions?pid=${this.pid}`,
        })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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
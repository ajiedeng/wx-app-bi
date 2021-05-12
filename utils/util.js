import { printAndUpload } from "./logger";
import { getCookie } from "../legacy/utils/loginInfo";

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatDate = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return [year, month, day].map(formatNumber).join('/')
}


const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}


function simpleModal(title, content, callback) {
    wx.showModal({
        title: title,
        content: content || title,
        showCancel: false,
        success: callback
    })
}

export function alertAndGoBack(title, content) {
    simpleModal(title, content || title, () => {
        wx.navigateBack()
    })
}


let loadingTimerId;

function showLoading() {
    if (loadingTimerId) {
        clearTimeout(loadingTimerId)
    }
    loadingTimerId = setTimeout(() => {
        wx.showLoading({
            fail: () => {
            },
            title: '加载中',
            mask: true
        })
    }, 500)
}

function hideLoading() {
    if (loadingTimerId) {
        clearTimeout(loadingTimerId)
        loadingTimerId = null
    }
    wx.hideLoading({
        fail: () => {
        }
    })
}

function notifyError(error, modalTitle/*如果为false则不显示Modal*/) {

    printAndUpload.error('notifyError:', error, modalTitle)

    let msg, title
    if (error == null) {
        msg = '未知错误'
    } else if (typeof error === 'object') {
        msg = error.msg || error.errMsg || error.message
        if (!msg) {
            msg = error.toString() === '[object Object]' ? JSON.stringify(error) : error.toString()
        }
        if (error.status != null && error.status !== 0) {
            msg = error.status + ':' + msg
        }
    } else {
        msg = error
    }

    const standerError = {
        msg,
        raw: error
    }
    title = modalTitle || '发生错误'

    if (modalTitle !== false) {
        simpleModal(title, msg)
        //代表已经被处理过
        standerError.handled = true
    }
    return standerError
}

export const appendCookieToUrl = function (url) {
    const cookie = getCookie()
    return cookie && url ? url + '&' + cookie : url
}
function throttle(fn, delay) {
    let timer = null;
    console.log(fn, 'throttle');
    return function () {
        let _this = this;
        let args = arguments;
        if (timer) { return; }
        timer = setTimeout(() => {
            fn.apply(_this, args);
            timer = null;
        }, delay);
    }
}
const isIPhone = () => {
    let screenHeight = wx.getSystemInfoSync().screenHeight
    let bottom = wx.getSystemInfoSync().safeArea.bottom
    return screenHeight !== bottom
}
// 处理了url中的params
function handleUrlParams(options) {
    if (!Object.keys(options).length) { return }
    const paramsArr = [];
    for (const key in options) {
        if (options.hasOwnProperty(key)) {
            const element = options[key];
            paramsArr.push(`${key}=${element}`);
        }
    }

    return paramsArr.join('&');
}
//设置内容距离顶部的高
function getTopNum(id) {
    const query = wx.createSelectorQuery()
    query.select(`#${id}`).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
        return res[0].top
    })
}
function dateFormat(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "H+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
function timeFormat(value) {
    let time = Number(value) + 1;
    let h = Math.floor(time/3600);
    let m = Math.floor(time%3600/60);
    if (h < 10) { h = `0${h}`; }
    if (m < 10) { m = `0${m}`; }
    return `${h}:${m}`;
}
export {
    formatTime,
    simpleModal,
    showLoading,
    hideLoading,
    notifyError,
    throttle,
    isIPhone,
    handleUrlParams,
    getTopNum,
    timeFormat,
    dateFormat
}

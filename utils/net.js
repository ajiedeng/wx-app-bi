import {notifyError} from "./util";
import {getBindUUIDFlag} from "./loginInfo";

export const baseUrl = 'https://office.ibroadlink.com/'
// export const baseUrl = 'https://officetest2.ibroadlink.com/'
// export const baseUrl = 'https://officesf.ibroadlink.com/'
// exports.baseUrl = baseUrl

function forceLogin() {
    const currentPage = getCurrentPages().pop()
    const loginUrl = 'pages/beforelogin/beforelogin'
    if (currentPage.route !== loginUrl) {
        wx.reLaunch({
            url: '/pages/beforelogin/beforelogin'
        })
    }
}

const {simpleModal, showLoading, hideLoading} = require("./util")
const {getCookie, getUserInfo} = require('./loginInfo')

const logger = wx.getRealtimeLogManager()

function joinPath(base, extend) {
    base = base.trim()
    extend = extend.trim()
    if (base.endsWith('/')) {
        base = base.substring(0, base.length - 1)
    }

    if (extend.startsWith('/')) {
        extend = extend.substring(1)
    }
    return base + '/' + extend
}

export const fetchData = function ({
                                       url,
                                       requestData = {},
                                       checkLoggedIn = true/*在发送前是否检查已经登录，默认为true*/,
                                       autoLoading = true/*boolean,是否显示loading*/,
                                       extraHeader = {}/*请求header扩展项*/,
                                       alertOnError = true,
                                       method = 'POST'
                                   }) {

    return new Promise(function (rev, rej) {

        function notifyReject(error, title/*该参数存在则提示用户*/) {
            if (title && alertOnError) {
                rej(notifyError(error ,title))
            }else{
                rej(error)
            }

        }

        const loginCookie = getCookie()
        const bindUUIDFlag = getBindUUIDFlag()
        //检查是否已经登录
        // 如果用户没有关注公众号，将获取不到 unionid，所以暂时简单忽略掉 bind 的状态
        if (checkLoggedIn && (!loginCookie/* || !bindUUIDFlag */)) {
            console.error('request',url,'not login')
            rej({msg: '请先登录'})
            wx.showToast({
                title: '请先登录',
                icon: 'success',
                duration: 2000
            })
            forceLogin()
            return
        }

        if (autoLoading) {
            showLoading()
        }
        //正式请求
        wx.request({
            method: method || "POST",
            url: joinPath(baseUrl, url),
            data: requestData,
            header: {
                'content-type': 'application/json', // 默认值
                'Cookie': loginCookie,
                'companyid': getUserInfo(true).companyid,
                ...extraHeader
            },
            success(reps) {
                const {data} = reps
                console.log(url, requestData, '\n', data, reps)

                if (reps.statusCode === 200) {
                    if (data.status === -45592) {
                        //-45592 登录超时 或 没有登录；需要重新登录
                        notifyReject(data)
                        forceLogin()
                    } else if (data.status === 0) {
                        rev(reps)
                    } else {
                        logger.error("网络请求失败", url, requestData, reps)
                        notifyReject(data, `请求失败`)
                    }
                } else {
                    notifyReject(`服务器返回错误码：${reps.statusCode}`, '请求错误')
                }

            },
            fail(e) {
                logger.info("网络错误", url, requestData, e)
                notifyReject(e, "网络错误")
            },
            complete() {
                if (autoLoading) {
                    hideLoading()
                }
            }
        })
    })
}
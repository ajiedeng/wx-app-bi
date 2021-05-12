
const LOGIN_COOKIE = 'LoginInfo'
const BIND_UUID_FLAG = 'BindUUIDFlag'

export function saveBindUUIDFlag(flag) {
    wx.setStorageSync(BIND_UUID_FLAG, flag)
}

export function getBindUUIDFlag() {
    return wx.getStorageSync(BIND_UUID_FLAG)
}

function saveLoginInfo(token, userInfo) {
    try {
        wx.setStorageSync(LOGIN_COOKIE, {
            cookieToken: token.split(';')[0],
            userInfo
        })
    } catch (e) {
        console.error(e)
    }
}

function getLoginInfo() {
    return wx.getStorageSync(LOGIN_COOKIE)
}

function deleteLoginInfo() {
    wx.removeStorageSync(LOGIN_COOKIE)
}

function getUserInfo(returnEmptyObjIfNotExisted) {
    let userInfo;
    const login = getLoginInfo()
    if (login) {
        userInfo = login.userInfo
    }
    if (!userInfo && returnEmptyObjIfNotExisted) {
        return {}
    }

    return userInfo

}

function getCookie() {
    const info = getLoginInfo()
    if (info) {
        return info.cookieToken
    }
}

export function isLogged() {
    const info = getLoginInfo()
    return info && info.cookieToken
}

export {
    saveLoginInfo,
    // getLoginInfo,
    deleteLoginInfo,
    getCookie,
    getUserInfo
}
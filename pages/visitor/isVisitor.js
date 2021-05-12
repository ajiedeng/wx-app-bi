import {CLEANING_PID, goCertainDetailPage, INVITE_VISITOR_PID} from "../../utils/specialPIDs";
import {getUserInfo, isLogged} from "../../utils/loginInfo";
import {filterQuery} from "../commonServices";
import {store} from "../../store/store";

const APPLY_INFO = 'APPLY_INFO'
const LAST_APPLY_ID = 'LAST_APPLY_ID'

export function isVisitorUrl(url) {
    if(!url){
        return
    }
    const baseUrl = 'https://office.ibroadlink.com/visitor/'

    if(url.startsWith(baseUrl)){
        const infoStr = url.substring(baseUrl.length)
        const [companyID,companyName,inviterID,inviterName] = infoStr.split('/')
        wx.setStorageSync(APPLY_INFO, {
            companyID,companyName,inviterID,inviterName
        })

        return true
    }
}

export function saveApplyID(id) {
    wx.setStorageSync(LAST_APPLY_ID, id)
}
export function deleteLastApplyId() {
    wx.removeStorageSync(LAST_APPLY_ID)
}

export function getLastApplyId() {
    return wx.getStorageSync(LAST_APPLY_ID)
}

export function getApplyInfo() {
    return wx.getStorageSync(APPLY_INFO)
}

export function getLastApply() {
    const userDid = getUserInfo(true).did

    return filterQuery(INVITE_VISITOR_PID, {
        "pid": INVITE_VISITOR_PID,
        "page": 1,
        "pageSize": 1,
        "filter": [
            {
                // "space": [spaceId],
                "creator": [userDid]
            }
        ],
        "sort": {
            "column": "createtime",  // 排序字段
            "type": "desc" // 排序方式；asc-升序（由小到大） desc-降序（由大到小）
        }
    },{checkLoggedIn: false}).then(({list}) => {
        if (list && list.length > 0) {
            store.setLastVisitorApplyRecord(list[0])
            return list[0]
        }
    })
}


export function goVisitorPageIfNeeded(qStr) {

    if(qStr && isVisitorUrl(decodeURIComponent(qStr))){
        wx.redirectTo({
            url: `/pages/visitor/apply?newApply=true`
        })
        return true
    }else if(getLastApplyId()){
        wx.redirectTo({
            url: `/pages/visitor/detail?id=${getLastApplyId()}`
        })
        return true
    }else if (getApplyInfo()){
        wx.redirectTo({
            url: `/pages/visitor/apply`
        })
        // if(isLogged()){
        //     getLastApply().then((record)=>{
        //         if(record){
        //             wx.redirectTo({
        //                 url: `/pages/visitor/detail?newApply=true`
        //             })
        //         }else{
        //             wx.redirectTo({
        //                 url: `/pages/visitor/apply`
        //             })
        //         }
        //     })
        // }else{
        //     wx.redirectTo({
        //         url: `/pages/visitor/detail?newApply=true`
        //     })
        // }

        return true
    }
}

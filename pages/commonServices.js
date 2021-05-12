import {fetchData} from '../utils/net'
import {MEETING_ROOM_RESERVATION_PID} from "../utils/specialPIDs";
import {getUserInfo} from "../utils/loginInfo";
import {getEntityByID, store} from "../store/store";
import {printAndUpload} from "../utils/logger";
import {notifyError} from "../utils/util";
import { toJS } from 'mobx-miniprogram';

export const vtInfo = (did, fetchOptions = {}) => {
    return fetchData({
        url: "/sfsaas/api/filter/vtinfo",
        requestData: {
            did: did
        },
        ...fetchOptions
    }).then(({data}) => {
        try {
            store.updateEntityAndVtConfig(data)
            return data
        } catch (e) {
            printAndUpload.error('服务器返回格式有误', '/sfsaas/api/filter/vtinfo', data, e)
            notifyError(e, '服务器返回格式有误')
        }
    })
}

export const filterQuery = (pid, {filterID, page = 1, pageSize = 20, ...restData}, options) => {
    const {extraHeader = {}, ...restOpts} = options || {}
    return fetchData({
        url: '/sfsaas/api/filter/query',
        requestData: {
            "did": filterID,
            "page": page,
            "pagesize": pageSize,
            ...restData
        },
        extraHeader: {
            ...extraHeader,
            xcolumn: 'ignore'
        },
        ...restOpts
    }).then(({data}) => {
        if (data && data.result) {
            let {total, data: list} = data.result || {}
            if (list == null) {
                list = []
            }
            if (filterID) {
                store.queryVtByFilterSuccess(pid, filterID, total, list, page === 1)
            }
            return {total, list}
        } else {
            return {total: 0}
        }
    })
}


export const addVt = (pid, data, fetchOptions) => {
    let q
    if (pid === MEETING_ROOM_RESERVATION_PID) {
        q = fetchData({
            url: '/vt/meetingroom/reservation/create',
            requestData: data,
            extraHeader: {
                reqUserId: getUserInfo(true).userid
            },
        })
    } else {
        q = vtControl({
            pid: pid,
            act: "create",
            cmd: data
        })
    }

    return q.then(() => {
        //清空store中的数据
        store.clearFilterByPid(pid)
    })
}


export const vtControl = function (data, fetchOptions) {
    const {extraHeader = {}, ...rest} = fetchOptions || {}

    return fetchData({
        url: '/vtservice/v1/devControl',
        requestData: data,
        extraHeader: {
            reqUserId: getUserInfo(true).userid,
            ...extraHeader
        },
        ...rest
    })
}

export const editVt = (pid, did, data, fetchOptions) => {
    let q
    if (pid === MEETING_ROOM_RESERVATION_PID) {
        const meetingRoomReservation = getEntityByID(did)
        const reservation = ["did", "name", "meetingroom", "starttime", "endtime", "meetingdate", "deputyorganizer", "relateusers", "note"].reduce((obj, cur) => {
            obj[cur] = cur in data ? data[cur] : meetingRoomReservation[cur]
            if (cur === 'relateusers') {
                let userinfo = toJS(obj[cur])
                userinfo.forEach(item => {
                    item.userdid = item.userdid ? item.userdid : item.did
                })
                obj[cur] = userinfo;
            }
            return obj
        }, {})

        q = fetchData({
            url: '/vt/meetingroom/reservation/modify',
            requestData: {
                ...reservation, did
            },
            extraHeader: {
                reqUserId: getUserInfo(true).userid
            },
        })
    } else {
        // q = fetchData({
        //     url: "/sfsaas/api/vtcommon/update",
        //     requestData: {
        //         did: did,
        //         pid: pid,
        //         data: data
        //
        //     }
        // })
        q = vtControl({
            did: did,
            pid: pid,
            act: "set",
            cmd: data
        })
    }

    return q.then(() => {
        store.updateEntityByID(did, data)
    })
}

export function getFilters(pid, options) {
    return fetchData({
        url: '/sfsaas/api/filter/list',
        requestData: {
            "pid": pid
        },
        ...options
    }).then(({data}) => {
        console.log(data, 'filters');
        let filters = data.result.map(({did, name, pid}) => ({did, name, pid}))
        if (filters.length > 0) {
            //更新store中的filters
            store.setFilters(pid, filters)
            // store.selectFilterTag(filters[0].did)
        }
        return filters
    })
}


export function fetchVtConfigByPid(pid) {
    return fetchData({
        url: "/sfsaas/api/module/config",
        requestData: {
            pid: pid
        }
    }).then(({data}) => {
        store.updateVtConfig(data.data)
    })
}

export function getPid(did) {
    return fetchData({
        url: "/sfsaas/api/filter/getpid",
        requestData: {
            did
        }
    }).then(({data}) => {
        return data.pid;
    })
}
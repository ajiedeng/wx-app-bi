import {getUserInfo} from "../../utils/loginInfo";
import {fetchData} from "../../utils/net";
import {CLEANING_PID} from "../../utils/specialPIDs";
import {filterQuery, vtControl} from "../commonServices";

export const getLastCleaningRecord = function (spaceId) {
    const userDid = getUserInfo(true).did

    return filterQuery(CLEANING_PID, {
        "pid": CLEANING_PID,
        "page": 1,
        "pageSize": 1,
        "filter": [
            {
                "space": [spaceId],
                "creator": [userDid]
            }
        ],
        "sort": {
            "column": "createtime",  // 排序字段
            "type": "desc" // 排序方式；asc-升序（由小到大） desc-降序（由大到小）
        }
    }).then(({list}) => {
        if (list && list.length > 0) {
            return list[0]
        }
    })

}

export const getDeviceBySpace = (spaceId, pid, otherOptions = {}) => {

    return filterQuery(pid, {
        "pid": pid,
        "page": 1,
        "pageSize": 100,
        "filter": [
            {
                "space": [spaceId],
            }
        ],
        "sort": {
            "column": "name",  // 排序字段
            "type": "asc" // 排序方式；asc-升序（由小到大） desc-降序（由大到小）
        }
    }, otherOptions).then(({list}) => {
        if (list && list.length > 0) {
            return list
        }
    })
}

export const controlDevice = (pid, did, cmd, showLoading, alertOnError = true) => {
    return vtControl({
        pid,
        did,
        act: "set",
        cmd
    },{
        autoLoading: showLoading,
        alertOnError,
    }).then(() => {
        //清空store中的数据
        // this.clearFilterByPid(this.pid)
    })
}
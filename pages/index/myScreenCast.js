import {filterQuery} from "../commonServices";
import {CAST_SCREEN_PID} from "../../utils/specialPIDs";
import {getUserInfo} from "../../utils/loginInfo";

export const getMyScreenCast = () => {

    return filterQuery(CAST_SCREEN_PID, {
        "pid": CAST_SCREEN_PID,
        "page": 1,
        "pageSize": 100,
        "filter": [
            {
                userdid: [getUserInfo(true).userid]
            }
        ],
        "sort": {
            "column": "name",  // 排序字段
            "type": "asc" // 排序方式；asc-升序（由小到大） desc-降序（由大到小）
        }
    }, {autoLoading: false, alertOnError: false}).then(({list}) => {
        if (list && list.length > 0) {
            return list
        }
    }).catch(e=>{
        //忽略
    })
}
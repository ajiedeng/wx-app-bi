import {getUserInfo} from '../../utils/loginInfo'
import {filterQuery} from "../commonServices";

export function getRecord(pid, assetDid) {

    const userDid = getUserInfo(true).did

    return filterQuery(pid,{
        "pid": pid,
        "page": 1,
        "pageSize": 100,
        "filter": [
            {
                "assetdid": [assetDid],
                "applicant": [userDid]
            }
        ],
        "sort": {
            "column": "createtime",  // 排序字段
            "type": "desc" // 排序方式；asc-升序（由小到大） desc-降序（由大到小）
        }
    }).then((result)=>{
        if(result && result.list && result.list.length>0 &&
            result.list[0].taskstatus === 0 ){
            return result.list[0]
        }
    })

}
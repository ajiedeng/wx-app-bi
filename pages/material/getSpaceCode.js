import {fetchData} from "../../utils/net";
import {SPACE_PID} from "../../utils/specialPIDs";

const MAX_LIMIT = 100
export const getSpaceCode = function (spaceId, spaceCode = '',count=0) {
    return fetchData({
        url: "/sfsaas/api/filter/vtinfo",
        requestData: {
            did: spaceId,
            pid: SPACE_PID
        }
    }).then(({data}) => {
        count++
        if(count>MAX_LIMIT){
            throw `已经向上查找了${count}级，达到了上限`
        }
        const {upperlevel: upperLevel, code} = data.data
        const newSpaceCode = code ? (
            spaceCode ?  code + '-' + spaceCode : code
        ) : spaceCode
        if (!code || !upperLevel) {
            console.error(`经过了${count}次的查找`)
            return newSpaceCode
        } else {
            return getSpaceCode(upperLevel,newSpaceCode,count)
        }

    })
}
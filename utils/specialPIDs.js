import {getEntityByID, store} from "../store/store";
import {fetchData} from "./net";
import {printAndUpload} from "./logger";
import {notifyError} from "./util";
import {getUserInfo} from "./loginInfo";
import {vtInfo, getPid} from "../pages/commonServices";

export const ASSET_PID = '0000000000000000000000003e870100' //固定资产pid
export const CONSUMABLES_PID = '0000000000000000000000003f870100' //办公耗材pid

export const COMPANY_CONTACTS_PID = '000000000000000000000000d1860100' //公司通讯录
export const CLIENT_CONTACTS_PID = '00000000000000000000000039870100'//客户通讯录

export const TASK_PID = '000000000000000000000000a6860100' //任务
export const SPACE_PID = '000000000000000000000000b3860100'

export const VT_RECORD_PID = '0000000000000000000000004c870100'

export const AC_PID = '0000000000000000000000000f120100'
export const LIGHT_PID = '00000000000000000000000017120100'
export const CLEANING_PID = '000000000000000000000000c4860100'
export const CURTAIN_PID = '0000000000000000000000001b120100'
export const SECURITY_PID = 'na'

export const DOOR_PID = '00000000000000000000000076880100'

export const MEETING_ROOM_RESERVATION_PID = '000000000000000000000000e1860100'
// 会议室pid
export const MEETING_ROOM_PID = '000000000000000000000000df860100'
//物料
export const MATERIAL_PID = '000000000000000000000000d9860100'

//投屏
export const CAST_SCREEN_PID = '00000000000000000000000046870100'

export const FILE_PID = '000000000000000000000000d0860100'

export const INVITE_VISITOR_PID = '000000000000000000000000e0860100'

export const MEETING_MEMBER = '000000000000000000000000af860100'

export const isContactsVt = pid => pid === COMPANY_CONTACTS_PID || pid === CLIENT_CONTACTS_PID || pid === MEETING_MEMBER /*会议副组织者*/

export const isAssetVt = pid => pid === ASSET_PID || pid === CONSUMABLES_PID

export const goCertainPage = (entity,redirect, options) => {
    const {did, pid} = entity
    const {taskdid} = options;
    handleRequestVtinfo(did, pid);
    entity = Object.assign(entity, getEntityByID(did));
    const userDid = getUserInfo(true).did
    const goPage = redirect?wx.redirectTo:wx.navigateTo
    if (isAssetVt(pid) && entity.owner !== userDid /*&& 不用判断数量 entity.count > 0*/) {
        goPage({
            url: `/pages/assetTransfer/assetTransfer?did=${did}&pid=${pid}`
        })
    } else if (pid === SPACE_PID) {
        wx.reLaunch({
          url: `/pages/space/spaceDetail?did=${did}&pid=${pid}`,
        })
    } else if (pid === TASK_PID) {
        const path = '/legacy/task/pages/taskDetail?jobid='
        if (entity.jobId) {
            goPage({
                url: path + entity.jobId,
            })
        } else {
            fetchData({
                url: "/sfadapter/v1/oldid",
                requestData: {
                    did
                }
            }).then(({data}) => {
                const {oldid: jobId} = data
                goPage({
                    url: path + jobId,
                })
                store.updateEntityByID(did, {jobId})
            })
        }
    } else if (pid === MATERIAL_PID) {
        goPage({
            url: `/pages/material/material?did=${did}&pid=${pid}`
        })
    } else if (pid === CAST_SCREEN_PID) {
        goPage({
            url: `/pages/screenCast/screenCast?did=${did}&pid=${pid}`
        })
    }else if (pid === MEETING_ROOM_RESERVATION_PID) {
        goPage({
            url: `/pages/meeting/meetingRoom/meetingRoom?did=${did}&pid=${pid}`
        })
    }else if (pid === INVITE_VISITOR_PID) {
        wx.redirectTo({
            url: `/pages/visitor/detail?id=${did}${taskdid ? '&taskdid='+ taskdid : ''}`
        })
    }else {
        goPage({
            url: `/pages/addVt/addVt?did=${did}&pid=${pid}`,
        })
    }

}

export const goCertainDetailPage = (options,redirect) => {
    // const entity = getEntityByID(did)
    // if (!entity) {
    //     fetchData({
    //         url: "/sfsaas/api/filter/vtinfo",
    //         requestData: {
    //             did: did
    //         }
    //     }).then(({data}) => {
    //         try {
    //             store.updateEntityAndVtConfig(data)
    //             goCertainPage(getEntityByID(did))
    //         } catch (e) {
    //             printAndUpload.error('服务器返回格式有误', '/sfsaas/api/filter/vtinfo', data, e)
    //             notifyError(e, '服务器返回格式有误')
    //         }
    //
    //     })
    // } else {
    //     goCertainPage(entity)
    // }


    getPid(options.did).then((data) => {
        goCertainPage({did: options.did, pid: data},redirect, options)
    })
}
// 判断是否需要请求vtinfo接口
function handleRequestVtinfo(did, pid){
    return new Promise(resolve => {
        vtInfo(did).then(() => {
            resolve();
        })
    })
}
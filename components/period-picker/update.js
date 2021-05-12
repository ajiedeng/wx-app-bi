import {expiredSlots, getSlotIdByDate, getSlotsID, getTimePeriod} from "./slot";
import {fetchData} from "../../utils/net";
import {getUserInfo} from "../../utils/loginInfo";
import {store} from "../../store/store";

const compareFields = (obj1, obj2, ...fields) => {
    if (obj1 === obj2) {
        return true
    }
    if (obj1 == null || obj2 == null) {
        return false
    }

    for (let f of fields) {
        if (obj1[f] !== obj2[f]) {
            return false
        }
    }
    return true

}

export const updatePicker = function (newEntity, oldEntity) {

    console.error('updatePicker :', newEntity, oldEntity)

    const {meetingdate: meetingDate, meetingroom: meetingRoom} = newEntity || {}

    if (!compareFields(newEntity, oldEntity, 'meetingdate', 'meetingroom') && meetingDate && meetingRoom) {
        //清空当前的会议开始与结束日期,第一次加载时候例外
        if(oldEntity && oldEntity.meetingroom && oldEntity.meetingdate){
            updateTimePeriod.call(this,[])
        }

        this.setData({
            loading: true,
        })

        fetchData({
            url: '/vt/meetingroom/reservation/web/list',
            extraHeader: {
                reqUserId: getUserInfo(true).userid
            },
            requestData: {
                "meetingdate": newEntity.meetingdate, //日期
                "meetingroom": newEntity.meetingroom //会议室的did

            }
        }).then(({data}) => {
            const {list} = data
            const occupiedSlots = list ? list.map(item => item.slotid) : []
            console.error('getSlotIdByDate:', getSlotIdByDate(new Date()), '======')
            this.setData({
                loading: false,
                occupiedSlots: occupiedSlots.reduce((slotsMap, currentValue) => {
                    const selectedSlots = getSlotsID(newEntity.starttime, newEntity.endtime) || {}
                    if(!selectedSlots[currentValue]){
                        slotsMap[currentValue] = true
                    }
                    return slotsMap
                }, {}),
                expiredSlots: expiredSlots(meetingDate),
            })
        })
    }

    if (!compareFields(newEntity, oldEntity, 'starttime', 'endtime')) {
        this.setData({
            selectedSlots: getSlotsID(newEntity.starttime, newEntity.endtime)
        })
    }
}

export const updateTimePeriod = function (slots) {
    const {startTime, endTime} = !slots || slots.length === 0 ? {startTime: null, endTime: null} : getTimePeriod(slots)

    this.triggerEvent('update',{
        starttime: startTime,
        endtime: endTime,
    })
}
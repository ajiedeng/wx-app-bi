const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const generateSlot = index => {
    const hour = index / 2 | 0
    let minute = index % 2 === 0 ? 0 : 30
    return `${formatNumber(hour)}:${formatNumber(minute)}`
}

export const generatePeriod = () => {
    const result = []
    for (let i = 0; i < 48; i++) {
        result.push(`${generateSlot(i)}:${generateSlot(i + 1)}`)
    }
    return result
}


export const expiredSlots = timeStamp => {

    const now = new Date()

    const result = {}
    for (let i = 0; i < 48; i++) {
        const minutes = (i + 1) * 30
        const hour = minutes / 60 | 0, minute = minutes % 60
        const date = new Date(timeStamp * 1000)
        date.setHours(hour)
        date.setMinutes(minute)
        date.setSeconds(0)
        date.setMilliseconds(0)
        if (date < now) {
            result[i] = true
        }
    }
    return result
}


export const getSlotIdByDate = (date) => {
    const minutes = date.getHours() * 60 + date.getMinutes()
    return minutes / 30 | 0
}

export const getTimePeriod = (slotIDs) => {
    slotIDs = slotIDs.sort().map(i => parseInt(i))
    const begin = slotIDs[0], end = slotIDs[slotIDs.length - 1]

    return {startTime: begin * 30 * 60, endTime: (end + 1) * 30 * 60 - 1 /*要减去一秒，防止进入下一个周期*/}
}

export const getSlotsID = (beginTime, endTime) => {
    if (beginTime == null || endTime == null) {
        return null
    }
    const [start, end] = [beginTime, endTime].map(time => {
        return time / 1800 | 0
    })
    return rangeToMap(start,end)
}

/*
    1,8 => {1:true,2:true;3:true,....,8:true}
*/
export const rangeToMap = (min,max)=>{
    const obj = {}
    for (let i = min; i <= max; i++) {
        obj[i] = true
    }
    return obj
}

const form1 = /\bdid:\/\/(\w+)\b/, form2 = /\b(https|http):\/\/.+\/did\/(\w+)\b/
const pid1 = /\bpip:\/\/(\w+)\b/, pid2 = /\b(https|http):\/\/.+\/pid\/(\w+)\b/
export function isDidCode(str) {
    return form1.test(str) || form2.test(str)
}
export function isPidCode(str) {
    return pid1.test(str) || pid2.test(str)
}

export function getDidFromQRCode(str) {
    if(!str){
        return
    }
    let result
    if(result = form1.exec(str)){
        return result[1]
    }

    if(result = form2.exec(str)){
        return result[2]
    }
}
export function getPidFromQRCode(str) {
    if(!str){
        return
    }
    let result
    if(result = pid1.exec(str)){
        return result[1]
    }

    if(result = pid2.exec(str)){
        return result[2]
    }
}


export function getQueryFromQRCode(str) {
    const queryIndex = str.indexOf('?')
    if(queryIndex === -1){
        return
    }
    const queryStr = str.substring(queryIndex+1)

    const query = {}
    queryStr.split('&').forEach(item=>{
        const [key,val] = item.split('=')
        query[key] = val
    })
    return query
}

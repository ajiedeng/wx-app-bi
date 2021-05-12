import {saveBindUUIDFlag,getUserInfo} from "../../utils/loginInfo"
import {fetchData} from'../../utils/net'

export function bindUUID(code,encryptedData,iv, companyid, did, unionid) {
    return fetchData({
        url: '/alarmer/v1/wechat/user/bind',
        checkLoggedIn: false,
        requestData: unionid === undefined ? {
            "companyid": getUserInfo(true).companyid,
            "did":getUserInfo(true).did,
            "jscode":code,
            "encuserinfo":encryptedData, //从中解出unionid
            "iv":iv
        } : {
            "companyid": companyid,
            "did": did,
            "unionid": unionid
        }
    }).then(()=>{
        saveBindUUIDFlag(true)
    })
}
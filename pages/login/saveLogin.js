import {saveLoginInfo} from "../../utils/loginInfo";

export function saveLogin(cookies, data) {
    console.log(cookies, data, 'cookies');
    for (let i = cookies.length - 1; i >= 0; i--) {
        let cookie = cookies[i]
        if (cookie.startsWith('bl-sf-auth-session')) {
            saveLoginInfo(cookie, data.info)
            return true
        }
    }
    return false
}

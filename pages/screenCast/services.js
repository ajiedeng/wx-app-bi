import {printAndUpload} from "../../utils/logger";
import {fetchData} from "../../utils/net";
import {getUserInfo} from "../../utils/loginInfo";
import {CAST_SCREEN_PID} from "../../utils/specialPIDs";
import {getQueryFromUrl} from "./url";
import {vtControl} from "../commonServices";

export function getFileName(urlStr) {
    return getQueryFromUrl(urlStr, 'name') || urlStr
}


export function controlScreen(did, cmd) {
    return vtControl({
        pid: CAST_SCREEN_PID,
        did,
        act: "set",
        cmd
    }).then(() => {
        //清空store中的数据
        // this.clearFilterByPid(this.pid)
    })
}
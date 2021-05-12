import {printAndUpload} from "../../utils/logger";

export function getQueryFromUrl(url, name) {
    if (!url || !name) {
        return null
    }
    try {
        const queries = url.split("?")[1].split('&')

        for (let q of queries) {
            if (q.startsWith(name + '=')) {
                return decodeURIComponent(q.split('=')[1])
            }
        }
    } catch (e) {
        printAndUpload.error(e)
        return null
    }
}
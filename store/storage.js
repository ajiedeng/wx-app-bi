import {store} from "./store";
import {printAndUpload} from "../utils/logger";

const key = 'APP_STATE'

export const saveState = () => {
    wx.setStorage({
        key,
        data: JSON.stringify(store)
    })
}

export const getState = () => {
    const state = wx.getStorageSync(key)

    if(state){
        try{
            return typeof state === "string" ? JSON.parse(state) : state
        }catch (e) {
            printAndUpload('APP_STATE',)
        }
    }

}
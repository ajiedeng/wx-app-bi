import {CLIENT_CONTACTS_PID, COMPANY_CONTACTS_PID, TASK_PID} from "../../utils/specialPIDs";

export const FIXED_MODULE = [
    { //任务数据
        "dataKey": 'task',
        "value": null,
        "label": "任务   ",
        "pid": TASK_PID,
        "img": "./image/task.svg"
    },
    { //公司通讯录
        "dataKey": 'contact',
        "value": null,
        "label": "公司通讯录",
        "pid": COMPANY_CONTACTS_PID,
        "img": "./image/contact.svg"

    },
    { //客户通讯录
        "dataKey": 'companyContact',
        "value": null,
        "label": "客户通讯录",
        "pid": CLIENT_CONTACTS_PID,
        "img": "./image/contact.svg"

    }
]

export const DEFAULT_ICON =  './image/doc.svg'

export const ICON_MAPS = {
    "000000000000000000000000ce860100": './image/Reminder.svg', //提醒
    "000000000000000000000000cf860100": './image/memo.svg', //备忘录
    "000000000000000000000000d6860100": './image/receipt.svg', // name: "发票"
    "0000000000000000000000004a870100": './image/activity.svg', // name: "活动"
    "0000000000000000000000004b870100": './image/sign.svg', // name: "活动报名"
    "000000000000000000000000d0860100": './image/doc.svg', // name: "文件"
    "0000000000000000000000003c870100": './image/mine.svg', // name: "我的状态",
    DEFAULT_ICON
}
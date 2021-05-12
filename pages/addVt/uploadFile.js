import {getCookie} from "../../utils/loginInfo";
import {hideLoading, showLoading} from "../../utils/util";

const {baseUrl} = require('../../utils/net')
const {deleteLoginInfo, getUserInfo} = require('../../utils/loginInfo')

export function uploadFile(path,name,appPid = 'test',appField='url') {

    const ext = path.substring(path.lastIndexOf('.')+1)
    return new Promise(function (resolve,reject) {
        wx.uploadFile({
            url: baseUrl+'vt/staticfile/upload', // 仅为示例，非真实的接口地址
            filePath: path,
            name: 'file',
            formData: {
                'filename': name || new Date().getTime()+'.'+ext
            },
            header:{
                companyid:getUserInfo(true).companyid,
                reqUserId:getUserInfo(true).userid,
                'Cookie': getCookie(),
                apppid:appPid,
                appfield:appField
            },
            // formData: {user: 'test'},
            success({data}) {
                console.error('success!!',data)
                try {
                    if(typeof data === "string"){
                        data = JSON.parse(data)
                    }
                    console.error(data)
                    if(data.status === 0){
                        resolve(data)
                    }else{
                        reject(data)
                    }
                }catch (e) {
                    reject(e)
                }

                // 上传完成需要更新 fileList
            },
            fail(error){
                console.error(error)
                reject(error)
            }
        });
    })
}

export function download(path) {
    showLoading()
    return new Promise(function (resolve,reject) {
        wx.downloadFile({
            url: path, //仅为示例，并非真实的资源
            header:{
                'Cookie': getCookie(),
            },
            success(res){
                if (res.statusCode === 200) {
                    resolve(res)
                }
            },
            fail(error) {
                reject(error)
            },
            complete(res) {
                hideLoading()
            }
        })
    })
}


export function openFile(path,fileType) {
    //todo  后期统一promise化
    return new Promise(function (resolve,reject) {
        wx.openDocument({
            filePath: path,
            fileType,
            success: function (res) {
                resolve(res)
            },
            fail(error) {
                reject(error)
            }
        })
    })
}
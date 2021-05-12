import { fetchData } from './net'
import {vtInfo, getPid} from "../pages/commonServices";
import {getEntityByID, getVtConfigByPid, store} from "../store/store";

const behaviorStrategy = {
  create: ({pid, param}) => {
    wx.navigateTo({
      url: `/pages/addVt/addVt?pid=${pid}&param=${encodeURIComponent(JSON.stringify(param))}`,
    })
  }
}

async function pidBehavior ({pid, act, param}) {
  let params = null
  if (param) {
    params = JSON.parse(param);
  }
  const newParam = await getParamsDetail({pid, param: params});
  behaviorStrategy[act]({pid, param: newParam})
}

async function getParamsDetail({pid, param}) {
  let data = ''
  data = await fetchConfig({pid, param})
  return columnsDetail(param, data)
}
async function columnsDetail(param, data) {
  let params = {}
  for (const key in param) {
    if (param.hasOwnProperty(key)) {
      const column = data.columns.find(item => {
        return item.column === key
      })
      if (column) {
        let value = param[column.column]
        switch (column.type) {
          case 'ref':
            const {did, name} = await fetchVtinfo(column.pid, value)
            params[column.column] = {did, name}
            break;
          default:
            params[column.column] = value
            break;
        }
      }
    }
  }
  return params;
}
function fetchConfig({pid}) {
  return new Promise(resolve => {
    fetchData({
      url: '/sfsaas/api/module/config',
      requestData: {
        pid: pid,
      },
      autoLoading: false
    }).then(({data}) => {
      resolve(data.data)
    })
  })
}
function fetchVtinfo(pid, did) {
return new Promise(resolve => {
    fetchData({
      url: '/sfsaas/api/filter/vtinfo',
      requestData: {
        pid: pid,
        did: did
      },
      autoLoading: false
    }).then(({data}) => {
      resolve(data.data)
    })
  })
}

// 物资转移
function transfer ({did, to, param}) {
  getPid(did).then((data) => {
    vtInfo(did).then(async (vtinfo) => {
      let params = {};
      if (param) {
        params = JSON.parse(param);
      }
      const newParam = await columnsDetail(params, vtinfo.vtconfig)
      wx.navigateTo({
        url: `/pages/assetTransfer/assetTransfer?did=${did}&pid=${data}${to ? '&to=' + to : ''}${params ? '&param=' + encodeURIComponent(JSON.stringify(newParam)) : ''}`,
      })
    })

  })
}
export {
  pidBehavior,
  transfer
}
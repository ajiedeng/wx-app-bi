const levels = ['info','log','debug','error']

export const print = levels.reduce((obj,level)=>{
  obj[level] = (...args)=>console[level](...args)
  return obj
},{})


export const uploadLog = levels.reduce((obj,level)=>{
  obj[level] = (...args)=> wx.getRealtimeLogManager()[level](...args)
  return obj
},{})

export const printAndUpload = levels.reduce((obj,level)=>{
  obj[level] = (...args)=> {
    uploadLog[level](...args)
    print[level](...args)
  }
  return obj
},{})

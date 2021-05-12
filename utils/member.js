import { fetchData } from "./net"
const pinyin = require("./pinyin/web-pinyin")
let chartSource = []
function getMembers(page = 1, more=false) {
  const memberlist = wx.getStorageSync('MemberList') || {
    list: [],
    timeout: null
  };
  if (!more && memberlist.timeout && new Date().getTime() - memberlist.timeout < 3600000) {
    return;
  }
  memberlist.list = [];
  fetchData({
    url: '/sfsaas/api/filter/query',
    requestData: {
      did: '',
      pid: '000000000000000000000000af860100',
      filter: [{ staffstatus: ["0"] }], // 筛选条件
      page: page,
      pagesize: 500,
    },
    autoLoading: false,
    extraHeader: {
      xcolumn: true,
      xquery: true
    }
  }).then(({ data }) => {
    let total = 0;
    if (!data.result.data) { return; }
    data.result.data.forEach(item => {
      const meminfo = {
        did: item.did,
        name: item.name,
        'organizationid.name': item['organizationid.name'],
        phonenumber: item.phonenumber,
        userid: item.userid,
        hidden: false
      }
      createChartArr(meminfo)
    })
    chartSource = chartSource.sort((a, b) => {
      return a.firstChart.localeCompare(b.firstChart);
    })
    chartSource.forEach(item => {
      item.list.sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
      total += item.list.length;
    })
    memberlist.list = memberlist.list.concat(chartSource);
    memberlist.timeout = new Date().getTime();
    wx.setStorage({
      data: memberlist,
      key: 'MemberList',
    })
    if (total < data.result.total) {
      getMembers(++page, true)
    }
  })
}
// 汉字首字母转换拼音
function getFirstChart(name) {
  return pinyin(name, {
    style: pinyin.STYLE_NORMAL
  }).join('')[0].toUpperCase();
}
// 获取首字母，并将数据存储到chartsource的对应list中
function createChartArr(member) {
  if (!member.name) { return }
  const firstChart = getFirstChart(member.name);
  member.chart = firstChart;
  member.selected = member.selected === true
  let index = chartSource.findIndex(item => {
    return item.firstChart === firstChart;
  })
  if (index < 0) {
    chartSource.push({
      firstChart,
      list: []
    })
    index = chartSource.length - 1;
  }
  const isExist = chartSource[index].list.some(item => { return item.did === member.did });
  if (!isExist) {
    chartSource[index].list.push(member)
  }
}
// 获取一页的人员列表, 并page+1
function getMemberLists(page=1, more=false) {
  getMembers(page, more);
}
export {
  getMemberLists,
  getFirstChart
}
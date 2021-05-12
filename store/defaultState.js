export const defaultState = {
    /*
    {
        key:value,
        key:[date1,date2]   //如果是datestamp time date
          name:'苏',
        createtime:[1600455404,1600755404],
        taskstate:1
    }
    * */
    queryConditions: null,

    /*
       [
        {key:'name',value:'abc'},
        // {key:'status',value:1}
       ]
   * */

    historyConditions:null,

    myList:[
        /*
            {
                pid:'xxxx',
                name:'提醒'
            },
            ...
        */
    ],
    entities: {

        //did:entity
        //entity有一个特殊字段'_completed':false,来表示信息是否已经完整了，即在详情界面的时候是否需要再去获取
        /*'1000d486010000000000eec90ba44606':{
            '_complete':false,
            //程序后期加上的（原始记录里面没有）
            'pid':'0000000000000000000000'

            createtime: 1594347245
            creator: "1000af86010000000000887cc61b7a9c"
            creator.name: "王龙"
            did: "1000d486010000000000eec90ba44606"
            name: "王龙 2020-07-10 打卡记录1"
            offdutytime: 0
            offdutytype: 2
            ondutytime: 1594347243
            ondutytype: 2
            organization: "1000b086010000000000341caf5b9d50"
            organization.name: "南京H5"
            owner: "1000af86010000000000887cc61b7a9c"
            owner.name: "王龙"
            updatetime: 1594804035
        }
*/
    },
    //当前被编辑或者新增的VT
    currentEntity: null,
    filters: {
        //pid:[filterObject,filterObject]
        /*
        '000000000000000000000000d4860100':[
            {
                clientconfig: "{}",
                columns: (8) ["name", "creator", "createtime", "updatetime", "ondutytime", "offdutytime", "ondutytype", "offdutytype"],
                condition: [],
                did: "1000b5860100000000006698b8bb5dfe",
                editable: true,
                name: "总览",
                pid: "000000000000000000000000d4860100"，
            }
        ]
        */
    },

    vtConfig: {
        //pid:vtconfig
        /*'000000000000000000000000d4860100':{
            columns: (22) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
            iscommonvt: true
            ishidden: false
            istaskrelated: false
            name: "考勤"
            pid: "000000000000000000000000d4860100"
            sortnum: 10,
        }*/
    },

    listByFilter: {
        /*
        filterId:{
            //该filter下的总数量
            total:100
            list:[did1,did2,did3]
        };
        * */
    },

    //最近一次访客预约信息
    lastVisitorApplyRecord:null
}
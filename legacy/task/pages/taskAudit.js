"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _asyncToGenerator(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,a){function n(r,i){try{var o=t[r](i),s=o.value}catch(e){return void a(e)}if(!o.done)return Promise.resolve(s).then(function(e){n("next",e)},function(e){n("throw",e)});e(s)}return n("next")})}}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,a=Array(e.length);t<e.length;t++)a[t]=e[t];return a}return Array.from(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},_createClass=function(){function e(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,a,n){return a&&e(t.prototype,a),n&&e(t,n),t}}(),_wepy=require("./../../npm/wepy/lib/wepy.js"),_wepy2=_interopRequireDefault(_wepy),_topBar=require("./../../components/topBar.js"),_topBar2=_interopRequireDefault(_topBar),_moduleInfo=require("./../../components/moduleInfo.js"),_moduleInfo2=_interopRequireDefault(_moduleInfo),_http=require("./../../utils/http.js"),_utils=require("./../../utils/utils.js"),_utils2=_interopRequireDefault(_utils),_wxApi=require("./../../utils/wxApi.js"),_wxApi2=_interopRequireDefault(_wxApi),_toast=require("./../../mixins/toast.js"),_toast2=_interopRequireDefault(_toast),_commonApi=require("./../../mixins/commonApi.js"),_commonApi2=_interopRequireDefault(_commonApi),_slot=require("./../../utils/slot.js"),_formatfile=require("./../../utils/formatfile.js"),year,month,day,taskAudit=function(e){function t(){var e,a,n,r;_classCallCheck(this,t);for(var i=arguments.length,o=Array(i),s=0;s<i;s++)o[s]=arguments[s];return a=n=_possibleConstructorReturn(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(o))),n.$repeat={},n.$props={topTaskAudit:{"xmlns:v-bind":"","v-bind:isBackShow.sync":"isBackShow","xmlns:v-on":"",bindparentBackFn:"parentBackFn"},moduleAudit:{"v-bind:jobModule.sync":"jobModule","v-bind:isShow.sync":"isShow","v-bind:isBackShow.sync":"isBackShow","v-bind:txValue.sync":"txValue","v-bind:flag.sync":"flag"}},n.$events={topTaskAudit:{"v-on:topNavFn":"getScrollHeight"},moduleAudit:{"v-on:getFlag":"getFlag","v-on:emitJsNode":"emitJsNode","v-on:toSelectParterners":"toSelectParterners","v-on:toSelectRoom":"toSelectRoom"}},n.components={topTaskAudit:_topBar2.default,moduleAudit:_moduleInfo2.default},n.data={userInfo:{},jobAudit:{jobId:"",nextId:"",showType:0,action:2},replyIndex:0,replyValue:"OK",defaultReply:["OK","重新填写","同意","空"],properties:[],flowNodes:[],jobInfo:{},jobModule:[],fileImages:[],tempFilePaths:[],tempFiles:[],index:0,txValue:"",auditReason:"",loadUrl:"",flag:!1,isShow:!1,isTx:null,index8:0,i:0,isBackShow:!0,height:0,preload:{},meetingDid:"",meetingData:{isreserved:"0",isreservedname:"",did:"",name:"",meetingroom:"",meetingroomname:"",mtstartdate:_utils2.default.formatDateday(),mtenddate:"",mtdate:"",mttime:"",starttime:null,endtime:null,meetingdate:parseInt(Date.now()/1e3),deputyorganizer:"",deputyorganizername:"",note:"",relateusers:[],relatelabels:"",iscanfind:""}},n.mixins=[_commonApi2.default,_toast2.default],n.events={getFlag:function(e){this.flag=e},parentBackFn:function(){_wepy2.default.navigateBack()}},n.methods={getScrollHeight:function(e,t){var a=this.$parent.globalData.windowWH||{},n=a.height;n=n||667,this.height=n-e},auditReasonChange:function(e){if(_utils2.default.emojiReg(e.detail.value))return this.taskCreatTip("文本不能包含表情符号");this.auditReason=e.detail.value,this.$apply()},returnBack:function(){_wepy2.default.navigateBack({delta:1})},previewImage:function(e,t){_wepy2.default.previewImage({current:e,urls:t})},uploadDescFile:function(){var e=this;this.flag=!0,this.fileImages=[],wx.chooseImage({count:1,success:function(t){e.tempFilePaths=t.tempFilePaths,e.tempFiles=t.tempFiles,e.fileImages=[].concat(_toConsumableArray(e.fileImages),_toConsumableArray(t.tempFilePaths)),e.$apply()},fail:function(t){t.errMsg&&"chooseImage:fail cancel"!==t.errMsg&&e.failFileUpload()}})},deleteUploadFile:function(e){this.fileImages.splice(e,1)},textareaBlur:function(e){if(_utils2.default.emojiReg(e.detail.value))return this.taskCreatTip("文本不能包含表情符号");this.$broadcast("textareaBlur",e.detail.value)},textareaChange:function(e){this.$broadcast("textareaChange",e.detail.value)},saveTx:function(){this.isBackShow=!0,this.isShow=!1},replyChange:function(e){this.replyIndex=e.detail.value,this.replyValue=this.defaultReply[this.replyIndex],this.replyValue="空"!==this.replyValue?this.replyValue+"。":""},confirmAudit:function(){var e=this;this.fileImages.length>0?this.addImages(this.fileImages,this.tempFiles,function(t){e.skip(t)}):this.skip([{}])},emitJsNode:function(){function e(){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,a,n=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t={job_info:{job_name:this.jobInfo.job_name,creat_user_name:this.jobInfo.creat_user_name,issue_class:this.jobInfo.issue_class,issue_class_name:this.jobInfo.issue_class_name,issue_sub_class:this.jobInfo.issue_sub_class,issue_sub_class_name:this.jobInfo.issue_sub_class_name,task_info:"",desc_info:this.jobInfo.modelList||{},dead_line:"",status:"N",class:5,time_out:this.timeoutValue,multi_attach_buff:[],task_numb:this.taskNumb}},t.job_info.desc_info=JSON.stringify(t.job_info.desc_info),e.prev=2,e.next=5,(0,_http.changeNodeFromJS)(t);case 5:if(a=e.sent,a.node_owners){e.next=8;break}return e.abrupt("return");case 8:a.node_owners.forEach(function(){var e=_asyncToGenerator(regeneratorRuntime.mark(function e(t){var r,i,o,s;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.owner,i=n.flowNodes.find(function(e){return e.node_name===t.node_name}),i=i&&i.node_id,o={job_id:n.jobAudit.jobId,node_id:i,node_name:r.node_name,user_id:r.userid,role_name:r.nickname,reason:"",keep_cc:0},e.next=6,(0,_http.putAssignUser)(o);case 6:s=e.sent,s&&0===s.status?console.log("emitJsNode",s):_wxApi2.default.logMethod("log","putAssignUser = "+JSON.stringify(a),_wepy2.default.$instance.globalData.logInfo);case 8:case"end":return e.stop()}},e,n)}));return function(t){return e.apply(this,arguments)}}()),this.$apply(),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(2),_wxApi2.default.logMethod("log","changeNodeFromJS = "+JSON.stringify(e.t0),_wepy2.default.$instance.globalData.logInfo);case 15:case"end":return e.stop()}},e,this,[[2,12]])}));return e}(),toSelectRoom:function(e){var t=this;this.flag=!0;var a=this.jobModule[e].value.meetingroom;wx.navigateTo({url:"/pages/meeting/meetingRoomList/meetingRoomList?selected="+encodeURIComponent(JSON.stringify(a||"")),events:{acceptDataFromOpenedPage:function(a){t.jobModule[e].value.meetingroom!==a.did&&(t.jobModule[e].value.mttime="",t.jobModule[e].value.starttime=null,t.jobModule[e].value.endtime=null),t.jobModule[e].value.meetingroom=a.did,t.jobModule[e].value.meetingroomname=a.name,t.$broadcast("meetingroomEmit",t.jobModule[e].value)}},success:function(e){}})},toSelectParterners:function(e){var t=this;this.flag=!0;var a=this.jobModule[e].value.relateusers;wx.navigateTo({url:"/pages/member/memberList/memberList?selected="+encodeURIComponent(JSON.stringify(a||[])),events:{acceptDataFromOpenedPage:function(a){var n=a.map(function(e){return{userdid:e.did,notify:0}}),r=n.length;t.jobModule[e].value.relateusers=n,t.jobModule[e].value.relatelabels=0===r?"":"已选择"+r,t.$broadcast("parternersEmit",t.jobModule[e].value),t.$apply()}},success:function(e){}})}},r=a,_possibleConstructorReturn(n,r)}return _inherits(t,e),_createClass(t,[{key:"onLoad",value:function(e,t){t=t||{},this.preload=t.preload?t.preload:{}}},{key:"onShow",value:function(){this.userInfo=this.$parent.globalData.userInfo;var e=this.preload.jobAudit||"{}";if(e&&(e=JSON.parse(e),this.jobAudit.jobId=e.jobId||"",this.jobAudit.nextId=e.nextId||"",this.jobAudit.showType=e.showType||"",this.jobAudit.action=e.action||""),this.flag)return this.flag=!1;this.getProperties(),this.getTaskMinnode()}},{key:"getTaskMinnode",value:function(){function e(){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,_http.queryTaskMinnode)({job_id:this.jobAudit.jobId});case 2:t=e.sent,this.flowNodes=t.noder,this.$apply();case 5:case"end":return e.stop()}},e,this)}));return e}()},{key:"getProperties",value:function(){function e(){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,a,n,r,i,o,s,l,u,d,c,f,m,p,h,b,y,_,g,v,x,k,j,w,I=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,_http.queryJobInfo)({job_id:this.jobAudit.jobId});case 2:return t=e.sent,t&&0===t.status&&(this.jobInfo=t.info||{},this.jobInfo.modelList=JSON.parse(this.jobInfo.desc_info||"[]")),a=null,n=!1,r={flowid:this.jobAudit.jobId,nodeid:this.jobAudit.nextId},this.loadUrl=this.$parent.globalData.baseUrl+"cloudproject/v1/query/file",i=this.jobInfo.modelList||[],e.next=11,(0,_http.queryTaskFlow)(r);case 11:if((o=e.sent)&&0===o.status)if(this.properties=o.p_list?o.p_list:[],s=String(o.pt_show_type)||"1",o.pt_show_list_str&&(this.ptShowList=JSON.parse(o.pt_show_list_str)),l=[],u=void 0,d=void 0,this.properties.forEach(function(e,t){i.forEach(function(t,r){if(t.sumLowIndex=!1,t.sumUpIndex=!1,null==t.value&&(t.value=""),"车牌号码"===t.modelname&&(n=!t.value),"来访时间"===t.modelname&&t.value){if("string"==typeof t.value){var i=t.value.replace(/-/g,"/");a=new Date(i)-0,I.meetingData.meetingdate=parseInt(a/1e3),a=_utils2.default.formatDateday(a)}else"number"==typeof t.value&&(a=t.value,I.meetingData.meetingdate=a,a=_utils2.default.formatDateday(new Date(1e3*a)));I.meetingData.mtstartdate=a,I.meetingData.mtenddate=a,I.meetingData.mtdate=a}if(e.ename===t.modelname){switch(t.canShow=!0,t.shouldHide=!1,"1"===t.isRelyProperty&&"0"===t.relyDecorate&&(u=r),"1"===t.isRelyProperty&&"1"===t.relyDecorate&&(d=r),s){case"1":t.canShow=!0;break;case"2":t.canShow=!1,I.ptShowList.indexOf(t.modelname)>=0&&(t.canShow=!0);break;case"3":I.ptShowList.indexOf(t.modelname)>=0&&(t.canShow=!1)}if("2"!==t.modeltype&&"10"!==t.modeltype||t.value||(t.value=""),"5"===t.modeltype&&t.enumList.forEach(function(a,n){a===t.value&&(e.value=a,e.selectedIndex=n)}),"4"===t.modeltype||"3"===t.modeltype){var o=t.value&&JSON.parse(t.value);t.multi_attach_buff=o||[],t.attachfileArr=o||[],t.fileNameArr=[],t.imgUrlArr=[],t.multi_attach_buff.length>0&&t.multi_attach_buff.forEach(function(e){if(e){var a=I.loadUrl+"?sourceid="+e.source_id+"&loginSession="+I.userInfo.loginsession+"&requserid="+I.userInfo.userid;if(t.imgUrlArr.push((0,_formatfile.appendCookieToUrl)(a)),t.fileNameArr.push(e.file_name),e.file_name&&e.file_name.indexOf(".")>0){var n=e.file_name.split(".")[e.file_name.split(".").length-1].toLowerCase();"jpg"===n||"jpeg"===n||"png"===n?(e.downloadUrl=(0,_formatfile.appendCookieToUrl)(a),e.isImg=!0):(e.downloadUrl=a,e.isImg=!1)}}})}if("9"===t.modeltype&&"1"===t.dateForm&&(t.value||(t.value="请选择"),t.startDate="1971-01-01",t.endDate="2100-12-31"),"9"===t.modeltype&&"2"===t.dateForm){t.value||(t.value="请选择");var c=t.value;c&&"请选择"!==c||(c=new Date),t.multiIndex=_utils2.default.handleTimePicker(c).multiIndex.slice(0,5),t.multiArray=_utils2.default.handleTimePicker(c).multiArray.slice(0,5)}if("8"===t.modeltype)if(t.tbodyArray.length>0)t.tbodyArray.forEach(function(e){e.forEach(function(e){if(e.value=e.content,"date"===e.columnsType&&(e.startDate="1971-01-01",e.endDate="2100-12-31"),"datetime"===e.columnsType){var t=e.content;t&&"请选择"!==t||(t=new Date),e.multiIndex=_utils2.default.handleTimePicker(t).multiIndex.slice(0,5),e.multiArray=_utils2.default.handleTimePicker(t).multiArray.slice(0,5)}if("select"===e.columnsType&&e.selectList.length>0&&(e.content||(e.value="",e.selectedIndex=0,e.selectedOption=""),e.selectList.forEach(function(t,a){t===e.selectedOption&&(e.selectedIndex=a,e.value=t)})),"file"===e.columnsType){var a="object"===_typeof(e.fileInfo);e.multi_attach_buff=a?[e.fileInfo]:[],e.attachfileArr=a?[e.fileInfo]:[],e.fileNameArr=[],e.imgUrlArr=[],e.multi_attach_buff.length>0&&e.multi_attach_buff.forEach(function(t){if(t){var a=I.loadUrl+"?sourceid="+t.source_id+"&loginSession="+I.userInfo.loginsession+"&requserid="+I.userInfo.userid;if(e.imgUrlArr.push((0,_formatfile.appendCookieToUrl)(a)),e.fileNameArr.push(t.file_name),t.file_name&&t.file_name.indexOf(".")>0){var n=t.file_name.split(".")[t.file_name.split(".").length-1].toLowerCase();"jpg"===n||"jpeg"===n||"png"===n?(t.downloadUrl=(0,_formatfile.appendCookieToUrl)(a),t.isImg=!0):(t.downloadUrl=a,t.isImg=!1)}}})}})});else{var f=t.tableObj.columns.length;if(t.tbodyArray=[],t.tableTotalArr=new Array(f).fill(""),t.tableObj.rows.length>0)t.tableObj.rows.forEach(function(e){var a=[];t.tableObj.columns.forEach(function(t){var n={columnsName:t.columnsName,rowsName:e,columnsType:t.columnsType,content:""};"date"===n.columnsType&&(n.content||(n.content="请选择"),n.value=n.content,n.startDate="1971-01-01",n.endDate="2100-12-31"),"datetime"===n.columnsType&&(n.content||(n.content="请选择"),n.value=n.content,n.multiTableIndex=_utils2.default.handleTimePicker().multiIndex.slice(0,5),n.multiTableArray=_utils2.default.handleTimePicker().multiArray.slice(0,5)),"select"===n.columnsType&&t.selectList.length>0&&(n.value||(n.value=""),n.selectList=t.selectList,n.selectedIndex=n.selectList.findIndex(function(e){return n.selectedOption===e})||""),a.push(n)}),t.tbodyArray.push(a)});else{var m=[];t.tableObj.columns.forEach(function(e){var t={columnsName:e.columnsName,rowsName:"",columnsType:e.columnsType,content:""};"date"===t.columnsType&&(t.content||(t.content="请选择"),t.value=t.content,t.startDate="1971-01-01",t.endDate="2100-12-31"),"datetime"===t.columnsType&&(t.content||(t.content="请选择"),t.value=t.content,t.multiIndex=_utils2.default.handleTimePicker().multiIndex.slice(0,5),t.multiArray=_utils2.default.handleTimePicker().multiArray.slice(0,5)),"select"===t.columnsType&&e.selectList.length>0&&(t.value||(t.value=""),t.selectList=e.selectList,t.selectedIndex=t.selectList.findIndex(function(e){return t.selectedOption===e})||""),"file"===t.columnsType&&(t.fileInfo={},t.fileNameArr=[],t.attachfileArr=[],t.multi_attach_buff=[],t.imgUrlArr=[]),m.push(t)}),t.tbodyArray.push(m)}}l.push(t)}})}),this.properties.length>0&&(u&&!d?(c=i.filter(function(e){return"1"===e.isRelyProperty&&"1"===e.relyDecorate}),c[0]&&(f=this.properties.find(function(e){return e.ename===c[0].modelname}))&&(c[0].sumUpIndex=!0,l=[].concat(_toConsumableArray(l),_toConsumableArray(c)))):!u&&d?(m=i.filter(function(e){return"1"===e.isRelyProperty&&"0"===e.relyDecorate}),m[0]&&(p=this.properties.find(function(e){return e.ename===m[0].modelname}))&&(m[0].sumLowIndex=!0,l=[].concat(_toConsumableArray(l),_toConsumableArray(m)))):u||d||(h=i.filter(function(e){return"1"===e.isRelyProperty&&"1"===e.relyDecorate}),b=i.filter(function(e){return"1"===e.isRelyProperty&&"0"===e.relyDecorate}),h[0]&&(y=this.properties.find(function(e){return e.ename===h[0].modelname}))&&(h[0].sumUpIndex=!0,l=[].concat(_toConsumableArray(l),_toConsumableArray(h))),b[0]&&(_=this.properties.find(function(e){return e.ename===b[0].modelname}))&&(b[0].sumLowIndex=!0,l=[].concat(_toConsumableArray(l),_toConsumableArray(b))))),g={},l.forEach(function(e,t){if(n&&("是否同意车辆进入"!==e.modelname&&"是否免费停车"!==e.modelname||(e.shouldHide=!0)),"11"===e.modeltype&&(e.value||(e.value=Object.assign({},I.meetingData,{relateusers:[{userdid:I.userInfo.did,notify:0}],relatelabels:"已选择1"})),e.value)){var a="string"==typeof e.value?JSON.parse(e.value)||{}:e.value,r=a.did;r&&!g[r]&&(g[r]={index:t,did:r})}}),this.jobModule=l,console.log("jobModule",l),v=_utils2.default.isEmptyObj(g))setTimeout(function(){I.$apply()},0);else for(x in g)k=g[x],j=k.index,w=k.did,this.queryMeetingInfo(j,w);case 13:case"end":return e.stop()}},e,this)}));return e}()},{key:"formatDateData",value:function(e,t){if(!year||!day&&0!==day){var a=_utils2.default.formatDateTime(new Date);a=a.split(/[-:\s]/),year=parseInt(a[0]),month||(month=a[1]),day=parseInt(a[2])-1}switch(1===e&&30===day&&(t+1===7||t-1==7||t+1===8||t-1==8)&&("07"===month||"08"===month&&8!==t)||(day=30===day?day-1:day),e){case 0:year=t+1971;break;case 1:month=_utils2.default.addZeroToTime(t+1);break;case 2:day=t}}},{key:"skip",value:function(){function e(e){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(t){var a,n,r,i,o,s,l,u,d,c,f,m,p,h,b,y,_,g,v,x,k=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(this.replyValue=2===this.jobAudit.action?"":this.replyValue,!(this.jobModule&&this.jobModule.length>0)){e.next=131;break}a=0;case 3:if(!(a<this.jobModule.length)){e.next=101;break}if(n=this.jobModule[a],"1"!==n.modeltype&&"2"!==n.modeltype&&"5"!==n.modeltype){e.next=17;break}if("1"!==n.isRequired){e.next=16;break}if(n.value&&"请选择"!==n.value&&"请输入"!==n.value){e.next=12;break}return r="5"===n.modeltype?"请选择":"请输入",e.abrupt("return",this.taskCreatTip(r+n.modelname));case 12:if(!n.value||!_utils2.default.emojiReg(n.value)){e.next=14;break}return e.abrupt("return",this.taskCreatTip(n.modelname+"不能包含表情符号"));case 14:e.next=17;break;case 16:"0"===n.isRequired&&(n.value&&"请选择"!==n.value&&"请输入"!==n.value||(n.value=""));case 17:if("3"!==n.modeltype&&"4"!==n.modeltype){e.next=28;break}if(0!==n.attachfileArr.length){e.next=27;break}if("1"!==n.isRequired){e.next=23;break}return e.abrupt("return",this.taskCreatTip("请上传"+n.modelname));case 23:n.attachfileArr=[],n.fileNameArr=[],n.multi_attach_buff=[],n.imgUrlArr=[];case 27:n.value=JSON.stringify(n.attachfileArr);case 28:if("6"!==n.modeltype){e.next=31;break}if("1"!==n.isRequired||0!==n.valueList.length){e.next=31;break}return e.abrupt("return",this.taskCreatTip("请选择"+n.modelname));case 31:if("9"!==n.modeltype){e.next=34;break}if("1"!==n.isRequired||n.value&&"请选择"!==n.value&&"请输入"!==n.value){e.next=34;break}return e.abrupt("return",this.taskCreatTip("请选择"+n.modelname));case 34:if("10"!==n.modeltype){e.next=37;break}if("1"!==n.isRequired||n.value&&"请选择"!==n.value&&"请输入"!==n.value){e.next=37;break}return e.abrupt("return",this.taskCreatTip("请输入"+n.modelname));case 37:if("8"!==n.modeltype){e.next=59;break}if(i=n.tbodyArray,o=!1,!(i&&i.length>0)){e.next=59;break}s=0;case 42:if(!(s<i.length)){e.next=57;break}l=i[s],u=0;case 45:if(!(u<l.length)){e.next=54;break}if(d=l[u],o||(o=d.content&&"请选择"!==d.content||d.selectedOption||0===d.selectedOption),!(c="1"===d.columnsRequired&&((!d.content||"请选择"===d.content)&&"select"!==d.columnsType||"select"===d.columnsType&&!d.selectedOption))){e.next=51;break}return e.abrupt("return",this.taskCreatTip(n.modelname+"：表格里有必填项未填，请检查"));case 51:u++,e.next=45;break;case 54:s++,e.next=42;break;case 57:if("1"!==n.isRequired||o){e.next=59;break}return e.abrupt("return",this.taskCreatTip(n.modelname+"：表格里有必填项未填，请检查"));case 59:if("11"!==n.modeltype){e.next=98;break}if(n.value||(n.value=Object.assign({},this.meetingData)),!n.value){e.next=98;break}if(n.value="string"==typeof n.value?JSON.parse(n.value)||{}:n.value,"1"!==n.value.isreserved){e.next=67;break}n.value="",e.next=82;break;case 67:if("0"!==n.value.isreserved){e.next=82;break}if(n.value.name){e.next=72;break}return e.abrupt("return",this.taskCreatTip("请输入会议室预约主题"));case 72:if(n.value.meetingroom){e.next=76;break}return e.abrupt("return",this.taskCreatTip("请选择会议室"));case 76:if(n.value.mttime){e.next=80;break}return e.abrupt("return",this.taskCreatTip("请选择会议时间"));case 80:if(0!==n.value.relateusers.length){e.next=82;break}return e.abrupt("return",this.taskCreatTip("请选择与会人员"));case 82:if("0"!==n.value.isreserved){e.next=98;break}if(n.value.did){e.next=92;break}return e.next=86,(0,_http.meetingCreate)({did:"",name:n.value.name,meetingroom:n.value.meetingroom,starttime:n.value.starttime,endtime:n.value.endtime,meetingdate:n.value.meetingdate,deputyorganizer:"",note:n.value.note,relateusers:n.value.relateusers});case 86:if(f=e.sent,0===f.status){e.next=89;break}return e.abrupt("return",this.taskCreatTip("创建会议室预约失败: "+f.msg));case 89:n.value.did=f.did,e.next=98;break;case 92:if(!n.value.iscanfind){e.next=98;break}return e.next=95,(0,_http.meetingModify)({did:n.value.did,name:n.value.name,meetingroom:n.value.meetingroom,starttime:n.value.starttime,endtime:n.value.endtime,meetingdate:n.value.meetingdate,deputyorganizer:"",note:n.value.note,relateusers:n.value.relateusers});case 95:if(m=e.sent,0===m.status){e.next=98;break}return e.abrupt("return",this.taskCreatTip("更新会议室预约失败: "+m.msg));case 98:a++,e.next=3;break;case 101:for(p=0;p<this.jobModule.length;p++)for(h=0;h<this.jobInfo.modelList.length;h++)this.jobModule[p].modelname===this.jobInfo.modelList[h].modelname&&(this.jobInfo.modelList[h]=this.jobModule[p]);return b={jobinfo:{job_id:this.jobAudit.jobId,job_name:this.jobInfo.job_name,creat_user_name:this.jobInfo.creat_user_name,desc_info:this.jobInfo.modelList||[],dead_line:"",status:this.jobInfo.status,multi_attach_buff:[]}},b.jobinfo.desc_info.forEach(function(e){if("9"===e.modeltype&&"2"===e.dateForm&&(e.multiIndex=[],e.multiArray=[]),"11"===e.modeltype&&(e.value?"1"===e.value.isreserved?e.value=null:e.value="object"===_typeof(e.value)?JSON.stringify(e.value):e.value:e.value=null),"8"===e.modeltype)for(var t=0;t<e.tbodyArray.length;t++)for(var a=e.tbodyArray[t],n=0;n<a.length;n++){var r=a[n];if(("text"===r.columnsType||"urllink"===r.columnsType||"textarea"===r.columnsType)&&r.content&&_utils2.default.emojiReg(r.content))return k.taskCreatTip(r.columnsName+"不能包含表情符号");"datetime"===r.columnsType&&(r.multiTableIndex=[],r.multiTableArray=[]),"file"===r.columnsType&&(r.fileInfo&&r.fileInfo.source_id?r.value=JSON.stringify([r.fileInfo]):r.value="")}}),b.jobinfo.desc_info=JSON.stringify(b.jobinfo.desc_info),e.prev=105,e.next=108,(0,_http.queryJob)(b);case 108:if(!(y=e.sent)||0!==y.status){e.next=123;break}return _={flow_id:this.jobAudit.jobId,next_id:this.jobAudit.nextId,class:5,dismissal:this.replyValue+this.auditReason,source_id:t[0].source_id||"",file_name:t[0].file_name||"",desc_info:this.jobInfo.desc_info},e.prev=111,e.next=114,(0,_http.flowMove)(_);case 114:g=e.sent,g&&0===g.status?_wepy2.default.navigateBack():_wxApi2.default.logMethod("log","flowMove = "+JSON.stringify(g),_wepy2.default.$instance.globalData.logInfo),e.next=121;break;case 118:e.prev=118,e.t0=e.catch(111),_wxApi2.default.logMethod("log","flowMove = "+JSON.stringify(e.t0),_wepy2.default.$instance.globalData.logInfo);case 121:e.next=124;break;case 123:_wxApi2.default.logMethod("log","queryJob = "+JSON.stringify(y),_wepy2.default.$instance.globalData.logInfo);case 124:e.next=129;break;case 126:e.prev=126,e.t1=e.catch(105),_wxApi2.default.logMethod("log","queryJob = "+JSON.stringify(e.t1),_wepy2.default.$instance.globalData.logInfo);case 129:e.next=142;break;case 131:return v={flow_id:this.jobAudit.jobId,next_id:this.jobAudit.nextId,class:5,dismissal:this.replyValue+this.auditReason,source_id:t[0].source_id||"",file_name:t[0].file_name||"",desc_info:this.jobInfo.desc_info},e.prev=132,e.next=135,(0,_http.flowMove)(v);case 135:x=e.sent,x&&0===x.status?_wepy2.default.navigateBack():_wxApi2.default.logMethod("log","flowMove = "+JSON.stringify(x),!1),e.next=142;break;case 139:e.prev=139,e.t2=e.catch(132),_wxApi2.default.logMethod("log","flowMove = "+JSON.stringify(e.t2),_wepy2.default.$instance.globalData.logInfo);case 142:case"end":return e.stop()}},e,this,[[105,126],[111,118],[132,139]])}));return e}()},{key:"addImages",value:function(){function e(e,a,n){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(t,a,n){var r,i,o;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:r=[],e.prev=1,i=0;case 3:if(!(i<t.length)){e.next=12;break}return e.next=6,(0,_http.uploadFile)({filePath:t[i],formData:{file:a}});case 6:o=e.sent,o=JSON.parse(o),o.sourceid&&r.push({file_name:t[i],source_id:o.sourceid});case 9:i++,e.next=3;break;case 12:e.next=17;break;case 14:e.prev=14,e.t0=e.catch(1),_wxApi2.default.logMethod("log","uploadFile = "+JSON.stringify(e.t0),_wepy2.default.$instance.globalData.logInfo);case 17:n&&n(r);case 18:case"end":return e.stop()}},e,this,[[1,14]])}));return e}()},{key:"queryMeetingInfo",value:function(){function e(e,a){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(t,a){var n,r,i,o,s,l,u,d,c,f,m;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,(0,_http.queryMeetingInfo)({did:a});case 2:if(n=e.sent,0===n.status){for(r=n.data||{},i=(0,_slot.generateStampTime)(r.starttime,r.endtime),o=r.relateusers,s=0,l=0,u="",d=o.length,c=0;c<d;c++)f=o[c],1===f.attendstatus?s++:2===f.attendstatus&&l++;d>0&&(u="已邀请"+d+"人,"+s+"人参加,"+l+"人不参加"),this.jobModule[t].value={isreserved:"0",isreservedname:"是",did:r.did||"",name:r.name||"",meetingroom:r.meetingroom||"",meetingroomname:r.room.name||"",mtstartdate:_utils2.default.formatDateday(),mtenddate:"",mtdate:_utils2.default.formatDateday(1e3*r.meetingdate)||"",mttime:i||"",starttime:r.starttime||null,endtime:r.endtime||null,meetingdate:r.meetingdate||"",deputyorganizer:r.deputyorganizer||"",deputyorganizername:r.deputyorganizername||"",note:r.note||"",relateusers:r.relateusers||[],relatelabels:u,iscanfind:!0}}else m=this.jobModule[t].value,m?(m="string"==typeof m?JSON.parse(m)||{}:m,m=Object.assign(this.meetingData,m,{iscanfind:!1})):m=Object.assign(this.meetingData,{iscanfind:!1}),this.jobModule[t].value=m;this.$apply();case 5:case"end":return e.stop()}},e,this)}));return e}()}]),t}(_wepy2.default.page);Page(require("./../../npm/wepy/lib/wepy.js").default.$createPage(taskAudit,"task/pages/taskAudit"));
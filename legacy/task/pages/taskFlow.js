"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _asyncToGenerator(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,o){function n(r,a){try{var s=t[r](a),i=s.value}catch(e){return void o(e)}if(!s.done)return Promise.resolve(i).then(function(e){n("next",e)},function(e){n("throw",e)});e(i)}return n("next")})}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var o=0;o<t.length;o++){var n=t[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,o,n){return o&&e(t.prototype,o),n&&e(t,n),t}}(),_wepy=require("./../../npm/wepy/lib/wepy.js"),_wepy2=_interopRequireDefault(_wepy),_topBar=require("./../../components/topBar.js"),_topBar2=_interopRequireDefault(_topBar),_http=require("./../../utils/http.js"),wxApis=require("./../../utils/wxApi.js"),taskFlow=function(e){function t(){var e,o,n,r;_classCallCheck(this,t);for(var a=arguments.length,s=Array(a),i=0;i<a;i++)s[i]=arguments[i];return o=n=_possibleConstructorReturn(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(s))),n.$repeat={},n.$props={toptaskFlow:{"xmlns:v-on":"",bindparentBackFn:"parentBackFn"}},n.$events={toptaskFlow:{"v-on:topNavFn":"getScrollHeight"}},n.components={toptaskFlow:_topBar2.default},n.events={parentBackFn:function(){_wepy2.default.navigateBack()}},n.data={preload:{},jobId:"",flowNodes:[],normalNodes:[],abnormalNodes:[],jobInfo:{},isNormalNode:!1,hasAbnormal:!1,isGetNode:!1,height:0},n.methods={getScrollHeight:function(e,t){var o=this.$parent.globalData.windowWH||{},n=o.height;n=n||667,this.height=n-e}},r=o,_possibleConstructorReturn(n,r)}return _inherits(t,e),_createClass(t,[{key:"getTaskMinnodew",value:function(){function e(){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,o,n,r=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,(0,_http.queryTaskMinnode)({job_id:this.jobId});case 3:t=e.sent,this.flowNodes=t.noder,this.isGetNode=!0,o=0;case 7:if(!(o<t.noder.length)){e.next=17;break}if("ENDING"===t.noder[o].node_id){e.next=12;break}this.normalNodes.push(t.noder[o]),e.next=14;break;case 12:return this.normalNodes.push(t.noder[o]),e.abrupt("break",17);case 14:o++,e.next=7;break;case 17:n=0;case 18:if(!(n<this.normalNodes.length)){e.next=25;break}if(this.normalNodes[n].node_id!==this.jobInfo.status){e.next=22;break}return this.isNormalNode=!0,e.abrupt("break",25);case 22:n++,e.next=18;break;case 25:this.isNormalNode||"TERMINATION"===this.jobInfo.status||(this.hasAbnormal=!0,this.dealWithAbnormal(this.jobInfo.status)),this.normalNodes.forEach(function(e){e.node_id===r.jobInfo.status?e.isInhand=!0:e.isInhand=!1}),this.$apply(),e.next=33;break;case 30:e.prev=30,e.t0=e.catch(0),wxApis.logMethod("log","queryTaskMinnode = "+JSON.stringify(e.t0),_wepy2.default.$instance.globalData.logInfo);case 33:case"end":return e.stop()}},e,this,[[0,30]])}));return e}()},{key:"dealWithAbnormal",value:function(e){for(var t=0;t<this.normalNodes.length;t++)if(e===this.normalNodes[t].node_id){this.abnormalNodes.push(this.normalNodes[t]);for(var o=0;o<this.abnormalNodes.length;o++)this.abnormalNodes[o].node_id===this.jobInfo.status?this.abnormalNodes[o].isInhand=!0:this.abnormalNodes[o].isInhand=!1;return void this.$apply()}for(var n="",r=0;r<this.flowNodes.length;r++)if(e===this.flowNodes[r].node_id){this.abnormalNodes.push(this.flowNodes[r]),n=this.flowNodes[r].next_id;break}this.dealWithAbnormal(n)}},{key:"onLoad",value:function(e,t){t=t||{},this.preload=t.preload||{}}},{key:"onShow",value:function(){var e=this.preload.jobInfo||{};this.jobInfo=e.jobInfo||{},this.jobId=this.jobInfo.job_id||"",this.isGetNode||this.getTaskMinnodew()}}]),t}(_wepy2.default.page);Page(require("./../../npm/wepy/lib/wepy.js").default.$createPage(taskFlow,"task/pages/taskFlow"));
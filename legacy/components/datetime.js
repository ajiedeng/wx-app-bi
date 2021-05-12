"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,a,n){return a&&e(t.prototype,a),n&&e(t,n),t}}(),_wepy=require("./../npm/wepy/lib/wepy.js"),_wepy2=_interopRequireDefault(_wepy),_utils=require("./../utils/utils.js"),_utils2=_interopRequireDefault(_utils),year,month,day,datetime=function(e){function t(){var e,a,n,r;_classCallCheck(this,t);for(var i=arguments.length,o=Array(i),u=0;u<i;u++)o[u]=arguments[u];return a=n=_possibleConstructorReturn(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(o))),n.config={},n.props={item:{type:Object,default:{},twoWay:!0},index:{type:Number,default:0}},n.data={},n.methods={multiTimeChange:function(e){this.item.multiIndex=e.detail.value;var t=[];t=this.item.multiIndex.map(function(e,t){return 0===t&&(e+=1971),1===t&&e<=12&&(e+=1),2===t&&e<=31&&(e+=1),e<10&&(e=_utils2.default.addZeroToTime(e)),e}),this.item.value=t[0]+"-"+t[1]+"-"+t[2]+" "+t[3]+":"+t[4],this.item.content=this.item.value},multiTimeColumnChange:function(e){var t=e.detail,a=t.column,n=t.value;if(this.formatDateData(a,n),1===a){var r=_utils2.default.getMonthDay(year,month);this.item.multiArray[2]=r,this.item.multiIndex[2]=parseInt(_utils2.default.addZeroToTime(day))}this.item.multiIndex[a]=parseInt(_utils2.default.addZeroToTime(n))}},r=a,_possibleConstructorReturn(n,r)}return _inherits(t,e),_createClass(t,[{key:"onLoad",value:function(){}},{key:"onShow",value:function(){}},{key:"formatDateData",value:function(e,t){if(!year||!day&&0!==day){var a=_utils2.default.formatDateTime(new Date);a=a.split(/[-:\s]/),year=parseInt(a[0]),month||(month=a[1]),day=parseInt(a[2])-1}switch(1===e&&30===day&&(t+1===7||t-1==7||t+1===8||t-1==8)&&("07"===month||"08"===month&&8!==t)||(day=30===day?day-1:day),e){case 0:year=t+1971;break;case 1:month=_utils2.default.addZeroToTime(t+1);break;case 2:day=t}}}]),t}(_wepy2.default.component);exports.default=datetime;
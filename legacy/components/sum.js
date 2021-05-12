"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),_wepy=require("./../npm/wepy/lib/wepy.js"),_wepy2=_interopRequireDefault(_wepy),_utils=require("./../utils/utils.js"),_utils2=_interopRequireDefault(_utils),_toast=require("./../mixins/toast.js"),_toast2=_interopRequireDefault(_toast),sum=function(e){function t(){var e,r,n,o;_classCallCheck(this,t);for(var i=arguments.length,u=Array(i),a=0;a<i;a++)u[a]=arguments[a];return r=n=_possibleConstructorReturn(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(u))),n.config={},n.props={item:{type:Object,default:{},twoWay:!0},index:{type:Number,default:0}},n.data={},n.mixins=[_toast2.default],n.methods={sumChange:function(e){if(isNaN(Number(e.detail.value)))return this.taskCreatTip("此输入框必须填写数字");if(_utils2.default.emojiReg(e.detail.value))return this.taskCreatTip("文本不能包含表情符号");var t=_utils2.default.financial(e.detail.value);this.$emit("sumChange",this.index,t)}},o=r,_possibleConstructorReturn(n,o)}return _inherits(t,e),_createClass(t,[{key:"onLoad",value:function(){}},{key:"onShow",value:function(){}}]),t}(_wepy2.default.component);exports.default=sum;
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),_wepy=require("./../npm/wepy/lib/wepy.js"),_wepy2=_interopRequireDefault(_wepy),selector=function(e){function t(){var e,n,i,r;_classCallCheck(this,t);for(var o=arguments.length,s=Array(o),u=0;u<o;u++)s[u]=arguments[u];return n=i=_possibleConstructorReturn(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(s))),i.config={navigationBarTitleText:"",navigationStyle:"custom"},i.props={item:{type:Object,default:{},twoWay:!0},index:{type:Number,default:0}},i.data={},i.methods={enumChange:function(e){var t=void 0;if(this.item.enumList){var n=this.item.enumList[e.detail.value];this.item.value=n,this.item.content=n,t=this.item.enumList.findIndex(function(e){return e===n})}else{var i=this.item.selectList[e.detail.value];this.item.value=i,this.item.content=i,this.item.selectedOption=i,t=this.item.selectList.findIndex(function(e){return e===i})}this.item.selectedIndex=t,this.$emit("emitJsNode",this.index)}},r=n,_possibleConstructorReturn(i,r)}return _inherits(t,e),_createClass(t,[{key:"onLoad",value:function(){}},{key:"onShow",value:function(){}}]),t}(_wepy2.default.component);exports.default=selector;
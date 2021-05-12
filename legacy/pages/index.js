"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _asyncToGenerator(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function a(o,r){try{var i=t[o](r),s=i.value}catch(e){return void n(e)}if(!i.done)return Promise.resolve(s).then(function(e){a("next",e)},function(e){a("throw",e)});e(s)}return a("next")})}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,n,a){return n&&e(t.prototype,n),a&&e(t,a),t}}(),_wepy=require("./../npm/wepy/lib/wepy.js"),_wepy2=_interopRequireDefault(_wepy),_utils=require("./../utils/utils.js"),_utils2=_interopRequireDefault(_utils),_toast=require("./../mixins/toast.js"),_toast2=_interopRequireDefault(_toast),_http=require("./../utils/http.js"),_commonApi=require("./../mixins/commonApi.js"),_commonApi2=_interopRequireDefault(_commonApi),wxApis=require("./../utils/wxApi.js"),Index=function(e){function t(){var e,n,a,o;_classCallCheck(this,t);for(var r=arguments.length,i=Array(r),s=0;s<r;s++)i[s]=arguments[s];return n=a=_possibleConstructorReturn(this,(e=t.__proto__||Object.getPrototypeOf(t)).call.apply(e,[this].concat(i))),a.data={userInfo:{},swiperData:[{title:"新手指引",tip:"如何使用BroadLink 智慧办公小程序"},{title:"新手指引",tip:"如何使用BroadLink 智慧办公小程序"},{title:"新手指引",tip:"如何使用BroadLink 智慧办公小程序"}],qrCode:{title:"扫码开门",imgSrc:"../assets/images/index/item_1.png"},menusData:[{title:"任务管理",url:"/task/pages/taskManage",imgSrc:"../assets/images/index/task.png"}],date:_utils2.default.formatDate(new Date),isLogin:!1,startX:0,startY:0},a.mixins=[_toast2.default,_commonApi2.default],a.methods={scanQRCode:function(){var e=this;wx.scanCode({onlyFromCamera:!0,scanType:"qrCode",success:function(t){if(wxApis.logMethod("log","scanQRCode = "+JSON.stringify(t),_wepy2.default.$instance.globalData.logInfo),!t)return e.removeScene(),e.showUnpassedCode();try{var n=JSON.parse(t.result);if(!n||!n.scene)return e.showMalformedQrCode();e.$parent.globalData.params.scene=n.scene}catch(n){var a=t.path||"",o=a.indexOf("?scene=");if(o<0)return e.removeScene(),e.showInvalidQrCode();e.$parent.globalData.params.scene=a.substring(o+7)}e.wxLogin()},fail:function(t){e.removeScene(),t.errMsg&&"scanCode:fail cancel"!==t.errMsg&&e.showUnpassedCode(JSON.stringify(t))}})},touchS:function(e){1===e.touches.length&&(this.startX=e.touches[0].clientX,this.startY=e.touches[0].clientY)},touchE:function(e){var t=this;if(1===e.changedTouches.length){var n=e.changedTouches[0].clientX,a=e.changedTouches[0].clientY,o=t.startX-n,r=t.startX-a;o>50&&(r<50||r>-50)&&_wepy2.default.switchTab({url:"/pages/user"})}}},a.config={disableScroll:!0},o=n,_possibleConstructorReturn(a,o)}return _inherits(t,e),_createClass(t,[{key:"onShareAppMessage",value:function(){return{title:"BroadLink 智慧办公 - 首页",path:"/pages/index"}}},{key:"onLoad",value:function(e){if(e&&e.scene){var t=decodeURIComponent(e.scene||"");t&&t.length>0&&(this.$parent.globalData.params.scene=t,this.checkIsLogin(),this.wxLogin())}}},{key:"onReady",value:function(){var e=this,t=this;wx.getSystemInfo({success:function(t){e.$parent.globalData.system=t.system,t.windowWidth&&(e.$parent.globalData.windowWH={width:t.windowWidth,height:t.screenHeight})},fail:function(e){t.wxFailGetSetting(JSON.stringify(e))}})}},{key:"onShow",value:function(){this.checkIsLogin(),this.removeStorage()}},{key:"checkIsLogin",value:function(){var e=_wepy2.default.getStorageSync("EXPIREDTIME");+new Date-e<=26784e5?(this.isLogin=this.$parent.globalData.isLogin,this.userInfo=this.$parent.globalData.userInfo||{}):(this.isLogin=!1,this.userInfo={},this.$parent.globalData.isLogin=!1,this.$parent.globalData.userInfo={},_wepy2.default.removeStorageSync("userInfo"),_wepy2.default.removeStorageSync("EXPIREDTIME"))}},{key:"authority",value:function(){function e(e){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function e(t){var n,a,o,r;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(n=this,n.userInfo.userid){e.next=4;break}return n.removeScene(),e.abrupt("return",_wepy2.default.navigateTo({url:"/pages/login/login"}));case 4:if(n.$parent.globalData.locationInfo.latitude){e.next=6;break}return e.abrupt("return",n.locationAuth());case 6:if((a=n.getModuleInfo(n.$parent.globalData.params.scene))&&!(a.length<3)){e.next=10;break}return n.removeScene(),e.abrupt("return",n.showErrQrCode(n.$parent.globalData.params));case 10:return o={js_code:t,dev_id:a[1],dev_la:n.$parent.globalData.locationInfo.latitude,dev_lo:n.$parent.globalData.locationInfo.longitude,qr_id:a[2]},e.prev=11,e.next=14,(0,_http.isAuthority)(o);case 14:r=e.sent,0===r.status?n.showOpenedInfo():wxApis.logMethod("log","open door = "+JSON.stringify(r),_wepy2.default.$instance.globalData.logInfo),n.removeScene(),e.next=23;break;case 19:e.prev=19,e.t0=e.catch(11),n.removeScene(),wxApis.logMethod("log","open door = "+JSON.stringify(e.t0),_wepy2.default.$instance.globalData.logInfo);case 23:case"end":return e.stop()}},e,this,[[11,19]])}));return e}()},{key:"getModuleInfo",value:function(e){var t=decodeURIComponent(e);if(t.length>0){var n=t.split("://");if(n.length<=1)return!1;t=n[1];var a=t.split("/");return!(a.length<=1)&&(a.unshift(n[0]),a)}return!1}},{key:"locationAuth",value:function(){var e=this;wx.getSetting({success:function(t){!1===t.authSetting["scope.userLocation"]?wx.showModal({title:"是否要打开设置页面",content:"需要获取您的地理位置信息, 请到小程序的设置打开地理位置授权",success:function(e){!0===e.confirm&&wx.openSetting()},fail:function(t){e.wxFailGetSetting(JSON.stringify(t))}}):wx.getLocation({type:"wgs84",success:function(t){e.$parent.globalData.locationInfo={latitude:t.latitude,longitude:t.longitude},e.$parent.globalData.params.scene&&e.wxLogin()},fail:function(){return e.removeScene(),e.showLocation()}})},fail:function(t){return e.removeScene(),e.wxFailGetSetting(JSON.stringify(t))}})}},{key:"wxLogin",value:function(){var e=this;wx.login({success:function(t){if(!t.code)return e.removeScene(),e.WXFailLogin();e.authority(t.code)},fail:function(){return e.removeScene(),e.WXFailLogin()}})}},{key:"removeScene",value:function(){var e=this;e.$parent.globalData.params.scene="",e.$apply()}}]),t}(_wepy2.default.page);Page(require("./../npm/wepy/lib/wepy.js").default.$createPage(Index,"pages/index"));
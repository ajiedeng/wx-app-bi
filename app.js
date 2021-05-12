'use strict';

import {store} from "./store/store";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wepy = require('./legacy/npm/wepy/lib/wepy.js');

var _wepy2 = _interopRequireDefault(_wepy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import './legacy/npm/wepy-async-function/index'
import {printAndUpload} from './utils/logger.js'
import {saveState} from "./store/storage";

var _require2 = require('./utils/loginInfo.js'),
    getCookie = _require2.getCookie,
    getUserInfo = _require2.getUserInfo;

var _class = function (_wepy$app) {
  _inherits(_class, _wepy$app);

  function _class() {
    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

    _this.globalData = {
      // 基础路径
      loginUrl: 'https://acs-so.ibroadlink.com/',
      baseUrl: require('./utils/net.js').baseUrl,
      // baseUrl: 'https://deploycentertest.ibroadlink.com/',
      // loginUrl: 'https://deploycentertest.ibroadlink.com/',
      // 博联用户信息
      userInfo: {},
      // 是否第一次登录
      isFirstTime: true,
      // 自定义版本
      version: '2.0.6',
      // 微信用户信息
      wxUserInfo: {},
      // 地理位置信息
      locationInfo: {},
      // 场景参数
      params: {},
      // 打印日志
      logInfo: false,
      // 所有用户
      allUsers: [],
      // 处理后的负责人
      allChargers: {},
      // 抄送人信息
      ccInfo: {},
      // 任务分类信息
      issueInfo: {},
      // 任务列表tab
      tabsInfo: {},
      // 是否登录
      isLogin: false,
      // 页面跳转任务id
      jobId: '',
      // 屏幕宽高
      windowWH: {
        width: 375,
        height: 667
      },
      // 评论@ID
      atIds: [],
      // 评论@ID带nickname
      atIdLists: []
    };
    _this.config = {
      pages: ['pages/index', 'pages/login', 'pages/user'],
      'subPackages': [{
        'root': 'task',
        'name': 'task',
        'independent': false,
        'pages': ['pages/taskManage', 'pages/taskDetail', 'pages/taskAudit', 'pages/taskFlow', 'pages/taskCreate', 'pages/taskDraft', 'pages/taskCreateSearch', 'pages/taskCC', 'pages/taskCharger']
      }],
      permission: {
        'scope.userLocation': {
          desc: '是否允许获取您的位置'
        }
      },
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#1C245F',
        navigationBarTitleText: '',
        navigationBarTextStyle: 'white',
        navigationStyle: 'custom'
        // enablePullDownRefresh: true
      },
      tabBar: {
        selectedColor: '#324EBD',
        borderStyle: 'black',
        backgroundColor: '#ffffff',
        list: [{
          pagePath: 'pages/index',
          text: '首页',
          iconPath: './assets/images/common/tab_1_unselected.png',
          selectedIconPath: './assets/images/common/tab_1_selected.png'
        }, {
          pagePath: 'pages/user',
          text: '我的',
          iconPath: './assets/images/common/tab_2_unselected.png',
          selectedIconPath: './assets/images/common/tab_2_selected.png'
        }]
      },
      networkTimeout: {
        request: 10000,
        downloadFile: 10000
      },
      sitemapLocation: 'sitemap.json'
    };

    _this.use('requestfix');
    _this.use('promisify');
    _this.intercept('request', {
      config: function config(p) {
        this.getStorage(p);
        // 编译模式调试
        // p.header.userid = '00d4f1bd7189100a58f1c0562af1498d'
        // p.header.loginSession = '6e1f140d1471da7c6d4247ca139db75c'
        var url = p.url !== _wepy2.default.$instance.globalData.loginUrl + 'cloud/office/cerberus/longin';
        if (!p.header.userid && url) {
          _wepy2.default.navigateTo({ url: '/pages/beforelogin/beforelogin' });
        }
        return p;
      },
      success: function success(p) {
        return p;
      },
      fail: function fail(p) {
        return p;
      }
    });
    _this.intercept('uploadFile', {
      config: function config(p) {
        this.getStorage(p);
        p.header['Content-Type'] = 'multipart/form-data';
        return p;
      },
      success: function success(p) {
        return p.data;
      },
      fail: function fail(p) {
        return p;
      }
    });
    return _this;
  }

  /**
   *        全局数据
   */


  _createClass(_class, [{
    key: 'onLaunch',
    value: function onLaunch() {
      _wepy2.default.$instance.globalData = _wepy2.default.$instance.globalData || {};
      this.autoUpdate();
      // let _this = this
      try {
        var _require3 = require('./utils/loginInfo.js'),
            _getCookie = _require3.getCookie,
            _getUserInfo = _require3.getUserInfo;
        /* eslint-disable no-extra-boolean-cast */


        if (_getCookie()) {
          _wepy2.default.$instance.globalData.isLogin = true;
          // if (typeof userInfo === 'object') {
          //   wepy.setStorageSync('userInfo', JSON.stringify(userInfo))
          _wepy2.default.$instance.globalData.userInfo = _getUserInfo();
          //   // wepy.setStorage({
          //   //   key: 'userInfo',
          //   //   value: JSON.stringify(userInfo)
          //   // })
          // } else {
          //   wepy.$instance.globalData.userInfo = JSON.parse(decodeURIComponent(userInfo))
          // }
        }
      } catch (error) {
        _wepy2.default.showToast({
          title: '\u6570\u636E\u8F6C\u6362\u5931\u8D25\uFF1A' + error
        });
      }
      //恢复上次状态
      store.restore()
    }
  }, {
    key: 'onLoad',
    value: function onLoad() {}
    /**
     * 小程序切前台
     */

  }, {
    key: 'onShow',
    value: function onShow() {
      // wepy.$instance.globalData.logInfo = wxApis.getLogger()
      if (_wepy2.default.$instance.globalData.isFirstTime) {
        _wepy2.default.$instance.globalData.isFirstTime = false;
      }
    }

    /**
     * 小程序进入后台
     */

  }, {
    key: 'onHide',
    value: function onHide(res) {
      _wepy2.default.$instance.globalData.isFirstTime = false;

      saveState()
    }

    /**
     * 小程序错误
     */

  },
  //   {
  //   key: 'onError',
  //   value: function onError(error) {
  //     printAndUpload.error('wx.onError', error);
  //
  //     _wepy2.default.showToast({
  //       title: 'onError:' + JSON.stringify(error),
  //       icon: 'none',
  //       duration: 5000
  //     });
  //   }
  //
  //   /**
  //    * 小程序页面找不到
  //    */
  //
  // },
    {
    key: 'onPageNotFound',
    value: function onPageNotFound(res) {
      if(printAndUpload.error){
        printAndUpload.error('onPageNotFound = ' , JSON.stringify(res));
      }
      _wepy2.default.redirectTo({ url: '/pages/index/index' });

      // wxApis.logMethod(
      //   'warn',
      //   'onPageNotFound = ' + JSON.stringify(res),
      //   wepy.$instance.globalData.logInfo
      // )
      // wepy.redirectTo({ url: '/pages/index' })
    }

    /**
     * 获取用户信息之后的回调
     */

  }, {
    key: 'userInfoReadyCallback',
    value: function userInfoReadyCallback(res) {
      if (!!res && !!res.userInfo) {
        _wepy2.default.$instance.globalData.wxUserInfo = res.userInfo || {};
      }
    }

    /**
     * 获取设置header
     */

  }, {
    key: 'getStorage',
    value: function getStorage(p) {
      // if (userInfo && !userInfo.userid) {
      //   userInfo = wepy.getStorageSync('userInfo') ? JSON.parse(wepy.getStorageSync('userInfo')) : {}
      // }
      var userInfo = getUserInfo(true);

      _wepy2.default.$instance.globalData.userInfo = userInfo;

      p.header.Cookie = getCookie();
      p.header.companyid = userInfo.companyid;
      p.header.userid = userInfo.userid;
    }

    /**
     * 小程序自动更新
     */

  }, {
    key: 'autoUpdate',
    value: function autoUpdate() {
      var self = this;
      // 获取小程序更新机制兼容
      if (wx.canIUse('getUpdateManager')) {
        var updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          if (res.hasUpdate) {
            wx.showModal({
              title: '更新提示',
              content: '检测到新版本，是否下载新版本并重启小程序？',
              success: function success(res) {
                if (res.confirm) {
                  self.downLoadAndUpdate(updateManager);
                } else if (res.cancel) {
                  wx.showModal({
                    title: '温馨提示~',
                    content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
                    showCancel: false,
                    confirmText: '确定更新',
                    success: function success(res) {
                      if (res.confirm) {
                        self.downLoadAndUpdate(updateManager);
                      }
                    }
                  });
                }
              }
            });
          }
        });
      } else {
        // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        });
      }
    }
    /**
     * 下载小程序新版本并重启应用
     */

  }, {
    key: 'downLoadAndUpdate',
    value: function downLoadAndUpdate(updateManager) {
      wx.showLoading();
      updateManager.onUpdateReady(function () {
        wx.hideLoading();
        updateManager.applyUpdate();
      });
      updateManager.onUpdateFailed(function () {
        wx.showModal({
          title: '已经有新版本了哟~',
          content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开~'
        });
      });
    }
  }]);

  return _class;
}(_wepy2.default.app);


App(require('./legacy/npm/wepy/lib/wepy.js').default.$createApp(_class, {"noPromiseAPI":["createSelectorQuery"]}));

function handlerUnexpectedError(e) {
  printAndUpload.error('wx.onError', e);
  require('./utils/util').simpleModal('内部错误',
      typeof e === 'object' ? JSON.stringify(e) :e)
}

wx.onError(handlerUnexpectedError)
wx.onUnhandledRejection(({reason,promise})=>{
  console.error('onUnhandledRejection:',reason)
  if(!reason){
    return
  }

  if(typeof reason === 'object' && reason.handled){
    return
  }
  if(typeof reason === 'object'){
    reason =  reason.msg || reason.errMsg || reason.message || reason
  }

  if(typeof reason === 'object'){
    reason = reason.toString() || JSON.stringify(reason)
  }else{
    reason = reason+''
  }
  if(reason.indexOf("handled")!==-1 ||
      reason.indexOf("hideLoading")!==-1 ||
      reason.indexOf("showLoading")!==-1 ){
    return
  }
  handlerUnexpectedError(reason)
})

if(typeof Promise.prototype.finally==='undefined'){
  Promise.prototype.finally = function (f) {
    return this.then(function (value) {
      return Promise.resolve(f()).then(function () {
        return value;
      });
    }, function (err) {
      return Promise.resolve(f()).then(function () {
        throw err;
      });
    });
  };
}

// require('./_wepylogs.js')

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6WyJyZXF1aXJlIiwicHJpbnRBbmRVcGxvYWQiLCJnZXRDb29raWUiLCJnZXRVc2VySW5mbyIsImdsb2JhbERhdGEiLCJsb2dpblVybCIsImJhc2VVcmwiLCJ1c2VySW5mbyIsImlzRmlyc3RUaW1lIiwidmVyc2lvbiIsInd4VXNlckluZm8iLCJsb2NhdGlvbkluZm8iLCJwYXJhbXMiLCJsb2dJbmZvIiwiYWxsVXNlcnMiLCJhbGxDaGFyZ2VycyIsImNjSW5mbyIsImlzc3VlSW5mbyIsInRhYnNJbmZvIiwiaXNMb2dpbiIsImpvYklkIiwid2luZG93V0giLCJ3aWR0aCIsImhlaWdodCIsImF0SWRzIiwiYXRJZExpc3RzIiwiY29uZmlnIiwicGFnZXMiLCJwZXJtaXNzaW9uIiwiZGVzYyIsIndpbmRvdyIsImJhY2tncm91bmRUZXh0U3R5bGUiLCJuYXZpZ2F0aW9uQmFyQmFja2dyb3VuZENvbG9yIiwibmF2aWdhdGlvbkJhclRpdGxlVGV4dCIsIm5hdmlnYXRpb25CYXJUZXh0U3R5bGUiLCJuYXZpZ2F0aW9uU3R5bGUiLCJ0YWJCYXIiLCJzZWxlY3RlZENvbG9yIiwiYm9yZGVyU3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJsaXN0IiwicGFnZVBhdGgiLCJ0ZXh0IiwiaWNvblBhdGgiLCJzZWxlY3RlZEljb25QYXRoIiwibmV0d29ya1RpbWVvdXQiLCJyZXF1ZXN0IiwiZG93bmxvYWRGaWxlIiwic2l0ZW1hcExvY2F0aW9uIiwidXNlIiwiaW50ZXJjZXB0IiwicCIsImdldFN0b3JhZ2UiLCJ1cmwiLCJ3ZXB5IiwiJGluc3RhbmNlIiwiaGVhZGVyIiwidXNlcmlkIiwibmF2aWdhdGVUbyIsInN1Y2Nlc3MiLCJmYWlsIiwiZGF0YSIsImF1dG9VcGRhdGUiLCJlcnJvciIsInNob3dUb2FzdCIsInRpdGxlIiwicmVzIiwiSlNPTiIsInN0cmluZ2lmeSIsImljb24iLCJkdXJhdGlvbiIsIndhcm4iLCJyZWRpcmVjdFRvIiwiQ29va2llIiwiY29tcGFueWlkIiwic2VsZiIsInd4IiwiY2FuSVVzZSIsInVwZGF0ZU1hbmFnZXIiLCJnZXRVcGRhdGVNYW5hZ2VyIiwib25DaGVja0ZvclVwZGF0ZSIsImhhc1VwZGF0ZSIsInNob3dNb2RhbCIsImNvbnRlbnQiLCJjb25maXJtIiwiZG93bkxvYWRBbmRVcGRhdGUiLCJjYW5jZWwiLCJzaG93Q2FuY2VsIiwiY29uZmlybVRleHQiLCJzaG93TG9hZGluZyIsIm9uVXBkYXRlUmVhZHkiLCJoaWRlTG9hZGluZyIsImFwcGx5VXBkYXRlIiwib25VcGRhdGVGYWlsZWQiLCJhcHAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUNBO2VBQ3lCQSxRQUFRLGdCQUFSLEM7SUFBbEJDLGMsWUFBQUEsYzs7Z0JBQzBCRCxRQUFRLG1CQUFSLEM7SUFBMUJFLFMsYUFBQUEsUztJQUFXQyxXLGFBQUFBLFc7Ozs7O0FBRWhCLG9CQUFjO0FBQUE7O0FBQUE7O0FBQUEsVUF5Q2RDLFVBekNjLEdBeUNEO0FBQ1g7QUFDQUMsZ0JBQVUsZ0NBRkM7QUFHWEMsZUFBU04sUUFBUSxhQUFSLEVBQXVCTSxPQUhyQjtBQUlYO0FBQ0E7QUFDQTtBQUNBQyxnQkFBVSxFQVBDO0FBUVg7QUFDQUMsbUJBQWEsSUFURjtBQVVYO0FBQ0FDLGVBQVMsT0FYRTtBQVlYO0FBQ0FDLGtCQUFZLEVBYkQ7QUFjWDtBQUNBQyxvQkFBYyxFQWZIO0FBZ0JYO0FBQ0FDLGNBQVEsRUFqQkc7QUFrQlg7QUFDQUMsZUFBUyxLQW5CRTtBQW9CWDtBQUNBQyxnQkFBVSxFQXJCQztBQXNCWDtBQUNBQyxtQkFBYSxFQXZCRjtBQXdCWDtBQUNBQyxjQUFRLEVBekJHO0FBMEJYO0FBQ0FDLGlCQUFXLEVBM0JBO0FBNEJYO0FBQ0FDLGdCQUFVLEVBN0JDO0FBOEJYO0FBQ0FDLGVBQVMsS0EvQkU7QUFnQ1g7QUFDQUMsYUFBTyxFQWpDSTtBQWtDWDtBQUNBQyxnQkFBVTtBQUNSQyxlQUFPLEdBREM7QUFFUkMsZ0JBQVE7QUFGQSxPQW5D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QUFPLE9BREk7QUFFWGtCLDZCQUFTLDhCQUZFO0FBR1hJLGdDQUFZLEtBSEQ7QUFJWEMsaUNBQWEsTUFKRjtBQUtYN0IsNkJBQVMsaUJBQVNPLEdBQVQsRUFBYztBQUNyQiwwQkFBSUEsSUFBSWtCLE9BQVIsRUFBaUI7QUFDZlQsNkJBQUtVLGlCQUFMLENBQXVCUCxhQUF2QjtBQUNEO0FBQ0Y7QUFUVSxtQkFBYjtBQVdEO0FBQ0Y7QUFuQlUsYUFBYjtBQXFCRDtBQUNGLFNBekJEO0FBMEJELE9BNUJELE1BNEJPO0FBQ0w7QUFDQUYsV0FBR00sU0FBSCxDQUFhO0FBQ1hqQixpQkFBTyxJQURJO0FBRVhrQixtQkFBUztBQUZFLFNBQWI7QUFJRDtBQUNGO0FBQ0Q7Ozs7OztzQ0FHa0JMLGEsRUFBZTtBQUMvQkYsU0FBR2EsV0FBSDtBQUNBWCxvQkFBY1ksYUFBZCxDQUE0QixZQUFZO0FBQ3RDZCxXQUFHZSxXQUFIO0FBQ0FiLHNCQUFjYyxXQUFkO0FBQ0QsT0FIRDtBQUlBZCxvQkFBY2UsY0FBZCxDQUE2QixZQUFZO0FBQ3ZDakIsV0FBR00sU0FBSCxDQUFhO0FBQ1hqQixpQkFBTyxXQURJO0FBRVhrQixtQkFBUztBQUZFLFNBQWI7QUFJRCxPQUxEO0FBTUQ7Ozs7RUEvUzBCN0IsZUFBS3dDLEciLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgd2VweSBmcm9tICd3ZXB5J1xuLy8gaW1wb3J0ICd3ZXB5LWFzeW5jLWZ1bmN0aW9uJ1xuY29uc3Qge3ByaW50QW5kVXBsb2FkfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nLmpzJylcbmNvbnN0IHtnZXRDb29raWUsIGdldFVzZXJJbmZvfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9naW5JbmZvJylcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgd2VweS5hcHAge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy51c2UoJ3JlcXVlc3RmaXgnKVxuICAgIHRoaXMudXNlKCdwcm9taXNpZnknKVxuICAgIHRoaXMuaW50ZXJjZXB0KCdyZXF1ZXN0Jywge1xuICAgICAgY29uZmlnIChwKSB7XG4gICAgICAgIHRoaXMuZ2V0U3RvcmFnZShwKVxuICAgICAgICAvLyDnvJbor5HmqKHlvI/osIPor5VcbiAgICAgICAgLy8gcC5oZWFkZXIudXNlcmlkID0gJzAwZDRmMWJkNzE4OTEwMGE1OGYxYzA1NjJhZjE0OThkJ1xuICAgICAgICAvLyBwLmhlYWRlci5sb2dpblNlc3Npb24gPSAnNmUxZjE0MGQxNDcxZGE3YzZkNDI0N2NhMTM5ZGI3NWMnXG4gICAgICAgIGxldCB1cmwgPSAocC51cmwgIT09IHdlcHkuJGluc3RhbmNlLmdsb2JhbERhdGEubG9naW5VcmwgKyAnY2xvdWQvb2ZmaWNlL2NlcmJlcnVzL2xvbmdpbicpXG4gICAgICAgIGlmICghcC5oZWFkZXIudXNlcmlkICYmIHVybCkge1xuICAgICAgICAgIHdlcHkubmF2aWdhdGVUbyh7IHVybDogJy9wYWdlcy9sb2dpbi9sb2dpbicgfSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcFxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3MgKHApIHtcbiAgICAgICAgcmV0dXJuIHBcbiAgICAgIH0sXG4gICAgICBmYWlsIChwKSB7XG4gICAgICAgIHJldHVybiBwXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmludGVyY2VwdCgndXBsb2FkRmlsZScsIHtcbiAgICAgIGNvbmZpZyAocCkge1xuICAgICAgICB0aGlzLmdldFN0b3JhZ2UocClcbiAgICAgICAgcC5oZWFkZXJbJ0NvbnRlbnQtVHlwZSddID0gJ211bHRpcGFydC9mb3JtLWRhdGEnXG4gICAgICAgIHJldHVybiBwXG4gICAgICB9LFxuICAgICAgc3VjY2VzcyAocCkge1xuICAgICAgICByZXR1cm4gcC5kYXRhXG4gICAgICB9LFxuICAgICAgZmFpbCAocCkge1xuICAgICAgICByZXR1cm4gcFxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogICAgICAgIOWFqOWxgOaVsOaNrlxuICAgKi9cbiAgZ2xvYmFsRGF0YSA9IHtcbiAgICAvLyDln7rnoYDot6/lvoRcbiAgICBsb2dpblVybDogJ2h0dHBzOi8vYWNzLXNvLmlicm9hZGxpbmsuY29tLycsXG4gICAgYmFzZVVybDogcmVxdWlyZSgnLi91dGlscy9uZXQnKS5iYXNlVXJsLFxuICAgIC8vIGJhc2VVcmw6ICdodHRwczovL2RlcGxveWNlbnRlcnRlc3QuaWJyb2FkbGluay5jb20vJyxcbiAgICAvLyBsb2dpblVybDogJ2h0dHBzOi8vZGVwbG95Y2VudGVydGVzdC5pYnJvYWRsaW5rLmNvbS8nLFxuICAgIC8vIOWNmuiBlOeUqOaIt+S/oeaBr1xuICAgIHVzZXJJbmZvOiB7fSxcbiAgICAvLyDmmK/lkKbnrKzkuIDmrKHnmbvlvZVcbiAgICBpc0ZpcnN0VGltZTogdHJ1ZSxcbiAgICAvLyDoh6rlrprkuYnniYjmnKxcbiAgICB2ZXJzaW9uOiAnMi4wLjYnLFxuICAgIC8vIOW+ruS/oeeUqOaIt+S/oeaBr1xuICAgIHd4VXNlckluZm86IHt9LFxuICAgIC8vIOWcsOeQhuS9jee9ruS/oeaBr1xuICAgIGxvY2F0aW9uSW5mbzoge30sXG4gICAgLy8g5Zy65pmv5Y+C5pWwXG4gICAgcGFyYW1zOiB7fSxcbiAgICAvLyDmiZPljbDml6Xlv5dcbiAgICBsb2dJbmZvOiBmYWxzZSxcbiAgICAvLyDmiYDmnInnlKjmiLdcbiAgICBhbGxVc2VyczogW10sXG4gICAgLy8g5aSE55CG5ZCO55qE6LSf6LSj5Lq6XG4gICAgYWxsQ2hhcmdlcnM6IHt9LFxuICAgIC8vIOaKhOmAgeS6uuS/oeaBr1xuICAgIGNjSW5mbzoge30sXG4gICAgLy8g5Lu75Yqh5YiG57G75L+h5oGvXG4gICAgaXNzdWVJbmZvOiB7fSxcbiAgICAvLyDku7vliqHliJfooah0YWJcbiAgICB0YWJzSW5mbzoge30sXG4gICAgLy8g5piv5ZCm55m75b2VXG4gICAgaXNMb2dpbjogZmFsc2UsXG4gICAgLy8g6aG16Z2i6Lez6L2s5Lu75YqhaWRcbiAgICBqb2JJZDogJycsXG4gICAgLy8g5bGP5bmV5a696auYXG4gICAgd2luZG93V0g6IHtcbiAgICAgIHdpZHRoOiAzNzUsXG4gICAgICBoZWlnaHQ6IDY2N1xuICAgIH0sXG4gICAgLy8g6K+E6K66QElEXG4gICAgYXRJZHM6IFtdLFxuICAgIC8vIOivhOiuukBJROW4pm5pY2tuYW1lXG4gICAgYXRJZExpc3RzOiBbXVxuICB9XG5cbiAgY29uZmlnID0ge1xuICAgIHBhZ2VzOiBbXG4gICAgICAncGFnZXMvaW5kZXgnLFxuICAgICAgJ3BhZ2VzL2xvZ2luJyxcbiAgICAgICdwYWdlcy91c2VyJ1xuICAgIF0sXG4gICAgJ3N1YlBhY2thZ2VzJzogW3tcbiAgICAgICdyb290JzogJ3Rhc2snLFxuICAgICAgJ25hbWUnOiAndGFzaycsXG4gICAgICAnaW5kZXBlbmRlbnQnOiBmYWxzZSxcbiAgICAgICdwYWdlcyc6IFtcbiAgICAgICAgJ3BhZ2VzL3Rhc2tNYW5hZ2UnLFxuICAgICAgICAncGFnZXMvdGFza0RldGFpbCcsXG4gICAgICAgICdwYWdlcy90YXNrQXVkaXQnLFxuICAgICAgICAncGFnZXMvdGFza0Zsb3cnLFxuICAgICAgICAncGFnZXMvdGFza0NyZWF0ZScsXG4gICAgICAgICdwYWdlcy90YXNrRHJhZnQnLFxuICAgICAgICAncGFnZXMvdGFza0NyZWF0ZVNlYXJjaCcsXG4gICAgICAgICdwYWdlcy90YXNrQ0MnLFxuICAgICAgICAncGFnZXMvdGFza0NoYXJnZXInXG4gICAgICBdXG4gICAgfV0sXG4gICAgcGVybWlzc2lvbjoge1xuICAgICAgJ3Njb3BlLnVzZXJMb2NhdGlvbic6IHtcbiAgICAgICAgZGVzYzogJ+aYr+WQpuWFgeiuuOiOt+WPluaCqOeahOS9jee9ridcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvdzoge1xuICAgICAgYmFja2dyb3VuZFRleHRTdHlsZTogJ2xpZ2h0JyxcbiAgICAgIG5hdmlnYXRpb25CYXJCYWNrZ3JvdW5kQ29sb3I6ICcjMUMyNDVGJyxcbiAgICAgIG5hdmlnYXRpb25CYXJUaXRsZVRleHQ6ICcnLFxuICAgICAgbmF2aWdhdGlvbkJhclRleHRTdHlsZTogJ3doaXRlJyxcbiAgICAgIG5hdmlnYXRpb25TdHlsZTogJ2N1c3RvbSdcbiAgICAgIC8vIGVuYWJsZVB1bGxEb3duUmVmcmVzaDogdHJ1ZVxuICAgIH0sXG4gICAgdGFiQmFyOiB7XG4gICAgICBzZWxlY3RlZENvbG9yOiAnIzMyNEVCRCcsXG4gICAgICBib3JkZXJTdHlsZTogJ2JsYWNrJyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgICAgbGlzdDogW1xuICAgICAgICB7XG4gICAgICAgICAgcGFnZVBhdGg6ICdwYWdlcy9pbmRleCcsXG4gICAgICAgICAgdGV4dDogJ+mmlumhtScsXG4gICAgICAgICAgaWNvblBhdGg6ICcuL2Fzc2V0cy9pbWFnZXMvY29tbW9uL3RhYl8xX3Vuc2VsZWN0ZWQucG5nJyxcbiAgICAgICAgICBzZWxlY3RlZEljb25QYXRoOiAnLi9hc3NldHMvaW1hZ2VzL2NvbW1vbi90YWJfMV9zZWxlY3RlZC5wbmcnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwYWdlUGF0aDogJ3BhZ2VzL3VzZXInLFxuICAgICAgICAgIHRleHQ6ICfmiJHnmoQnLFxuICAgICAgICAgIGljb25QYXRoOiAnLi9hc3NldHMvaW1hZ2VzL2NvbW1vbi90YWJfMl91bnNlbGVjdGVkLnBuZycsXG4gICAgICAgICAgc2VsZWN0ZWRJY29uUGF0aDogJy4vYXNzZXRzL2ltYWdlcy9jb21tb24vdGFiXzJfc2VsZWN0ZWQucG5nJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBuZXR3b3JrVGltZW91dDoge1xuICAgICAgcmVxdWVzdDogMTAwMDAsXG4gICAgICBkb3dubG9hZEZpbGU6IDEwMDAwXG4gICAgfSxcbiAgICBzaXRlbWFwTG9jYXRpb246ICdzaXRlbWFwLmpzb24nXG4gIH1cblxuICBvbkxhdW5jaCAoKSB7XG4gICAgd2VweS4kaW5zdGFuY2UuZ2xvYmFsRGF0YSA9IHdlcHkuJGluc3RhbmNlLmdsb2JhbERhdGEgfHwge31cbiAgICB0aGlzLmF1dG9VcGRhdGUoKVxuICAgIC8vIGxldCBfdGhpcyA9IHRoaXNcbiAgICB0cnkge1xuICAgICAgY29uc3Qge2dldENvb2tpZSwgZ2V0VXNlckluZm99ID0gcmVxdWlyZSgnLi91dGlscy9sb2dpbkluZm8nKVxuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tZXh0cmEtYm9vbGVhbi1jYXN0ICovXG4gICAgICBpZiAoZ2V0Q29va2llKCkpIHtcbiAgICAgICAgd2VweS4kaW5zdGFuY2UuZ2xvYmFsRGF0YS5pc0xvZ2luID0gdHJ1ZVxuICAgICAgICAvLyBpZiAodHlwZW9mIHVzZXJJbmZvID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyAgIHdlcHkuc2V0U3RvcmFnZVN5bmMoJ3VzZXJJbmZvJywgSlNPTi5zdHJpbmdpZnkodXNlckluZm8pKVxuICAgICAgICB3ZXB5LiRpbnN0YW5jZS5nbG9iYWxEYXRhLnVzZXJJbmZvID0gZ2V0VXNlckluZm8oKVxuICAgICAgICAvLyAgIC8vIHdlcHkuc2V0U3RvcmFnZSh7XG4gICAgICAgIC8vICAgLy8gICBrZXk6ICd1c2VySW5mbycsXG4gICAgICAgIC8vICAgLy8gICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkodXNlckluZm8pXG4gICAgICAgIC8vICAgLy8gfSlcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gICB3ZXB5LiRpbnN0YW5jZS5nbG9iYWxEYXRhLnVzZXJJbmZvID0gSlNPTi5wYXJzZShkZWNvZGVVUklDb21wb25lbnQodXNlckluZm8pKVxuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHdlcHkuc2hvd1RvYXN0KHtcbiAgICAgICAgdGl0bGU6IGDmlbDmja7ovazmjaLlpLHotKXvvJoke2Vycm9yfWBcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgb25Mb2FkICgpIHt9XG4gIC8qKlxuICAgKiDlsI/nqIvluo/liIfliY3lj7BcbiAgICovXG4gIG9uU2hvdyAoKSB7XG4gICAgLy8gd2VweS4kaW5zdGFuY2UuZ2xvYmFsRGF0YS5sb2dJbmZvID0gd3hBcGlzLmdldExvZ2dlcigpXG4gICAgaWYgKHdlcHkuJGluc3RhbmNlLmdsb2JhbERhdGEuaXNGaXJzdFRpbWUpIHtcbiAgICAgIHdlcHkuJGluc3RhbmNlLmdsb2JhbERhdGEuaXNGaXJzdFRpbWUgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDlsI/nqIvluo/ov5vlhaXlkI7lj7BcbiAgICovXG4gIG9uSGlkZSAocmVzKSB7XG4gICAgd2VweS4kaW5zdGFuY2UuZ2xvYmFsRGF0YS5pc0ZpcnN0VGltZSA9IGZhbHNlXG4gIH1cblxuICAvKipcbiAgICog5bCP56iL5bqP6ZSZ6K+vXG4gICAqL1xuICBvbkVycm9yKGVycm9yKSB7XG4gICAgcHJpbnRBbmRVcGxvYWQuZXJyb3IoJ3d4Lm9uRXJyb3InLCBlcnJvcilcblxuICAgIHdlcHkuc2hvd1RvYXN0KHtcbiAgICAgIHRpdGxlOiBgb25FcnJvcjoke0pTT04uc3RyaW5naWZ5KGVycm9yKX1gLFxuICAgICAgaWNvbjogJ25vbmUnLFxuICAgICAgZHVyYXRpb246IDUwMDBcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIOWwj+eoi+W6j+mhtemdouaJvuS4jeWIsFxuICAgKi9cbiAgb25QYWdlTm90Rm91bmQocmVzKSB7XG4gICAgcHJpbnRBbmRVcGxvYWQud2Fybignb25QYWdlTm90Rm91bmQgPSAnICsgSlNPTi5zdHJpbmdpZnkocmVzKSlcbiAgICB3ZXB5LnJlZGlyZWN0VG8oeyB1cmw6ICcvcGFnZXMvaW5kZXgvaW5kZXgnIH0pXG5cbiAgICAvLyB3eEFwaXMubG9nTWV0aG9kKFxuICAgIC8vICAgJ3dhcm4nLFxuICAgIC8vICAgJ29uUGFnZU5vdEZvdW5kID0gJyArIEpTT04uc3RyaW5naWZ5KHJlcyksXG4gICAgLy8gICB3ZXB5LiRpbnN0YW5jZS5nbG9iYWxEYXRhLmxvZ0luZm9cbiAgICAvLyApXG4gICAgLy8gd2VweS5yZWRpcmVjdFRvKHsgdXJsOiAnL3BhZ2VzL2luZGV4JyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPlueUqOaIt+S/oeaBr+S5i+WQjueahOWbnuiwg1xuICAgKi9cbiAgdXNlckluZm9SZWFkeUNhbGxiYWNrIChyZXMpIHtcbiAgICBpZiAoISFyZXMgJiYgISFyZXMudXNlckluZm8pIHtcbiAgICAgIHdlcHkuJGluc3RhbmNlLmdsb2JhbERhdGEud3hVc2VySW5mbyA9IHJlcy51c2VySW5mbyB8fCB7fVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5borr7nva5oZWFkZXJcbiAgICovXG4gIGdldFN0b3JhZ2UgKHApIHtcbiAgICAvLyBpZiAodXNlckluZm8gJiYgIXVzZXJJbmZvLnVzZXJpZCkge1xuICAgIC8vICAgdXNlckluZm8gPSB3ZXB5LmdldFN0b3JhZ2VTeW5jKCd1c2VySW5mbycpID8gSlNPTi5wYXJzZSh3ZXB5LmdldFN0b3JhZ2VTeW5jKCd1c2VySW5mbycpKSA6IHt9XG4gICAgLy8gfVxuICAgIGNvbnN0IHVzZXJJbmZvID0gZ2V0VXNlckluZm8odHJ1ZSlcblxuICAgIHdlcHkuJGluc3RhbmNlLmdsb2JhbERhdGEudXNlckluZm8gPSB1c2VySW5mb1xuXG4gICAgcC5oZWFkZXIuQ29va2llID0gZ2V0Q29va2llKClcbiAgICBwLmhlYWRlci5jb21wYW55aWQgPSB1c2VySW5mby5jb21wYW55aWRcbiAgICBwLmhlYWRlci51c2VyaWQgPSB1c2VySW5mby51c2VyaWRcbiAgfVxuXG4gIC8qKlxuICAgKiDlsI/nqIvluo/oh6rliqjmm7TmlrBcbiAgICovXG4gIGF1dG9VcGRhdGUoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgLy8g6I635Y+W5bCP56iL5bqP5pu05paw5py65Yi25YW85a65XG4gICAgaWYgKHd4LmNhbklVc2UoJ2dldFVwZGF0ZU1hbmFnZXInKSkge1xuICAgICAgY29uc3QgdXBkYXRlTWFuYWdlciA9IHd4LmdldFVwZGF0ZU1hbmFnZXIoKVxuICAgICAgdXBkYXRlTWFuYWdlci5vbkNoZWNrRm9yVXBkYXRlKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAvLyDor7fmsYLlrozmlrDniYjmnKzkv6Hmga/nmoTlm57osINcbiAgICAgICAgaWYgKHJlcy5oYXNVcGRhdGUpIHtcbiAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgdGl0bGU6ICfmm7TmlrDmj5DnpLonLFxuICAgICAgICAgICAgY29udGVudDogJ+ajgOa1i+WIsOaWsOeJiOacrO+8jOaYr+WQpuS4i+i9veaWsOeJiOacrOW5tumHjeWQr+Wwj+eoi+W6j++8nycsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgaWYgKHJlcy5jb25maXJtKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kb3duTG9hZEFuZFVwZGF0ZSh1cGRhdGVNYW5hZ2VyKVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5jYW5jZWwpIHtcbiAgICAgICAgICAgICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICAgICAgICAgICAgdGl0bGU6ICfmuKnppqjmj5DnpLp+JyxcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfmnKzmrKHniYjmnKzmm7TmlrDmtonlj4rliLDmlrDnmoTlip/og73mt7vliqDvvIzml6fniYjmnKzml6Dms5XmraPluLjorr/pl67nmoTlk6Z+JyxcbiAgICAgICAgICAgICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgY29uZmlybVRleHQ6ICfnoa7lrprmm7TmlrAnLFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZG93bkxvYWRBbmRVcGRhdGUodXBkYXRlTWFuYWdlcilcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyDlpoLmnpzluIzmnJvnlKjmiLflnKjmnIDmlrDniYjmnKznmoTlrqLmiLfnq6/kuIrkvZPpqozmgqjnmoTlsI/nqIvluo/vvIzlj6/ku6Xov5nmoLflrZDmj5DnpLpcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcbiAgICAgICAgY29udGVudDogJ+W9k+WJjeW+ruS/oeeJiOacrOi/h+S9ju+8jOaXoOazleS9v+eUqOivpeWKn+iDve+8jOivt+WNh+e6p+WIsOacgOaWsOW+ruS/oeeJiOacrOWQjumHjeivleOAgidcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiDkuIvovb3lsI/nqIvluo/mlrDniYjmnKzlubbph43lkK/lupTnlKhcbiAgICovXG4gIGRvd25Mb2FkQW5kVXBkYXRlKHVwZGF0ZU1hbmFnZXIpIHtcbiAgICB3eC5zaG93TG9hZGluZygpXG4gICAgdXBkYXRlTWFuYWdlci5vblVwZGF0ZVJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgIHd4LmhpZGVMb2FkaW5nKClcbiAgICAgIHVwZGF0ZU1hbmFnZXIuYXBwbHlVcGRhdGUoKVxuICAgIH0pXG4gICAgdXBkYXRlTWFuYWdlci5vblVwZGF0ZUZhaWxlZChmdW5jdGlvbiAoKSB7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJ+W3sue7j+acieaWsOeJiOacrOS6huWTn34nLFxuICAgICAgICBjb250ZW50OiAn5paw54mI5pys5bey57uP5LiK57q/5ZWmfu+8jOivt+aCqOWIoOmZpOW9k+WJjeWwj+eoi+W6j++8jOmHjeaWsOaQnOe0ouaJk+W8gH4nXG4gICAgICB9KVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==
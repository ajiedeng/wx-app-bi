'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wepy = require('./../../npm/wepy/lib/wepy.js');

var _wepy2 = _interopRequireDefault(_wepy);

var _topBar = require('./../../components/topBar.js');

var _topBar2 = _interopRequireDefault(_topBar);

var _skeleton = require('./../../components/skeleton.js');

var _skeleton2 = _interopRequireDefault(_skeleton);

var _http = require('./../../utils/http.js');

var _commonApi = require('./../../mixins/commonApi.js');

var _commonApi2 = _interopRequireDefault(_commonApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var wxApis = require('./../../utils/wxApi.js');
var endWords = '';
var isNum;

var taskVtUsers = function (_wepy$page) {
  _inherits(taskVtUsers, _wepy$page);

  function taskVtUsers() {
    var _ref;

    var _temp, _this2, _ret;

    _classCallCheck(this, taskVtUsers);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = taskVtUsers.__proto__ || Object.getPrototypeOf(taskVtUsers)).call.apply(_ref, [this].concat(args))), _this2), _this2.config = {}, _this2.$repeat = {}, _this2.$props = { "topMeetingUser": { "xmlns:v-on": "", "bindparentBackFn": "parentBackFn" }, "userSkeleton": {} }, _this2.$events = { "topMeetingUser": { "v-on:topNavFn": "getScrollHeight" } }, _this2.components = {
      topMeetingUser: _topBar2.default,
      userSkeleton: _skeleton2.default
    }, _this2.props = {}, _this2.data = {
      preload: {},
      isFocus: false,
      inputSearch: '',
      isSkeleton: true,
      lineHeight: 0,
      winHeight: 0,
      top: 0,
      height: 0,
      hidden: true,
      endWords: '',
      showWords: '',
      trans: '0.1',
      scrollTopId: '',
      meetingUsers: {},
      meetingArr: {},
      meetingId: '',
      relateUsers: [],
      meetingLibUsers: ''
    }, _this2.mixins = [_commonApi2.default], _this2.events = {
      // parentBackFn
      parentBackFn: function parentBackFn() {
        _wepy2.default.navigateBack();
      }
    }, _this2.methods = {
      searchFocus: function searchFocus() {
        this.isFocus = true;
      },

      // 获取列表高度
      getScrollHeight: function getScrollHeight(h, evt) {
        var _this = this;
        var windowWH = _this.$parent.globalData.windowWH || {};
        var height = windowWH.height;
        height = height || 667;
        var query = wx.createSelectorQuery();
        query.select('#topMeetingSearch').boundingClientRect();
        query.exec(function (res) {
          query.select('#tabsUserXScroll').boundingClientRect();
          query.exec(function (res1) {
            _this.height = height - res[0].height - h - res1[0].height;
            _this.$apply();
          });
          _this.$apply();
        });
      },
      searchChange: function searchChange(e) {
        if (e.detail.value.trim() === '') {
          return;
        }
        this.inputSearch = e.detail.value.trim();
        var tempcharger = {
          'A': [], 'B': [], 'C': [], 'D': [], 'E': [], 'F': [], 'G': [], 'H': [], 'I': [], 'J': [], 'K': [], 'L': [], 'M': [], 'N': [], 'O': [], 'P': [], 'Q': [], 'R': [], 'S': [], 'T': [], 'U': [], 'V': [], 'W': [], 'X': [], 'Y': [], 'Z': [], 'UN': []
        };
        var meetingLibUsers = JSON.parse(this.meetingLibUsers || '{}');

        var _loop = function _loop(key) {
          meetingLibUsers[key].forEach(function (item) {
            if (item.nickname.indexOf(e.detail.value) > -1) {
              tempcharger[key].push(item);
            }
          });
        };

        for (var key in meetingLibUsers) {
          _loop(key);
        }
        for (var key in tempcharger) {
          if (tempcharger[key].length === 0) {
            delete tempcharger[key];
          }
        }
        this.meetingUsers = tempcharger;
      },

      // 确定选择与会人员
      multiConfirm: function multiConfirm() {
        console.log(this.relateUsers);
        this.$parent.globalData.relateUsers = this.relateUsers;
        _wepy2.default.navigateBack();
      },
      bindCharger: function bindCharger(subItem, key, index) {
        var _this3 = this;

        subItem.checked = !subItem.checked;
        this.meetingUsers[key][index].checked = subItem.checked;
        if (subItem.checked) {
          this.relateUsers.push({
            userdid: subItem.did,
            name: subItem.name,
            notify: 0
          });
        } else {
          this.relateUsers.forEach(function (item, index) {
            if (item.userdid === subItem.did) {
              _this3.relateUsers.splice(index, 1);
            }
          });
        }
      },

      // 获取文字信息
      getWords: function getWords(e) {
        var id = e.target.id;
        this.endWords = id;
        isNum = id;
        this.showWords = this.endWords;
      },

      // 设置文字信息
      setWords: function setWords(e) {
        var id = e.target.id;
        this.scrollTopId = id;
      },
      chStart: function chStart(e) {
        this.trans = '0.3';
        this.hidden = false;
        this.top = e.target.offsetTop > 10 ? e.target.offsetTop - 3 * this.lineHeight / 5 : 3;
      },

      // 触发结束选择
      chEnd: function chEnd(e) {
        this.trans = '0.1';
        this.hidden = true;
        this.scrollTopId = this.endWords;
      },

      // 滑动选择用户
      chMove: function chMove(e) {
        var _this = this;
        var y = e.touches[0].clientY;
        var offsettop = 0;
        var height = 0;
        wx.createSelectorQuery().select('#charMeetingLine').boundingClientRect(function (rect) {
          offsettop = rect.top;
          var meetingArr = _this.meetingArr;
          console.log('chMove', meetingArr);
          // 获取y轴最大值
          // height = _this.$parent.globalData.windowWH.height
          // height = height - _this.height + 10 + _this.lineHeight * meetingArr.length
          height = _this.lineHeight * meetingArr.length + offsettop;
          // 判断选择区域,只有在选择区才会生效
          if (y > offsettop && y < parseInt(height)) {
            var num = parseInt((y - offsettop) / _this.lineHeight);
            endWords = meetingArr[num];
            // 这里 把endWords 绑定到this 上，是为了手指离开事件获取值
            _this.endWords = endWords;
          }
          // 去除重复，为了防止每次移动都赋值 ,这里限制值有变化后才会有赋值操作，
          if (isNum !== num) {
            isNum = num;
            _this.showWords = _this.endWords;
            _this.scrollTopId = _this.endWords;
            _this.top = _this.lineHeight * num + 10 - _this.lineHeight / 3;
            _this.$apply();
          }
          // 节点的上边界坐标
        }).exec();
      }
    }, _temp), _possibleConstructorReturn(_this2, _ret);
  }

  _createClass(taskVtUsers, [{
    key: 'getAllmeetingUsers',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var res, allmeetingUsers, _dealWithUsers, chargerChild, meetingArr;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _http.queryVtUsers)({ name: '', page: 0, pagesize: 9999 });

              case 2:
                res = _context.sent;

                if (res && res.status === 0) {
                  allmeetingUsers = res.result;

                  allmeetingUsers = this.handleRepeat(allmeetingUsers, 'userid');
                  if (this.relateUsers.length > 0) {
                    this.relateUsers.forEach(function (item1) {
                      allmeetingUsers.forEach(function (item2) {
                        if (item1.userdid === item2.did) {
                          item2.checked = true;
                        }
                      });
                    });
                  }
                  _dealWithUsers = this.dealWithUsers(allmeetingUsers, { name: 'nickname', id: 'userid' }), chargerChild = _dealWithUsers.chargerChild, meetingArr = _dealWithUsers.chargerArr;

                  this.meetingUsers = chargerChild;
                  this.meetingLibUsers = JSON.stringify(chargerChild);
                  this.meetingArr = meetingArr;
                  // console.log('getAllmeetingUsers', this.meetingArr)
                  this.isSkeleton = false;
                  this.$apply();
                } else {
                  wxApis.logMethod('log', 'queryUserByrole = ' + JSON.stringify(res), _wepy2.default.$instance.globalData.logInfo);
                }
                // } catch (error) {
                //   wxApis.logMethod(
                //     'log',
                //     'taskCC = ' + JSON.stringify(error),
                //     false
                //   )
                // }

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAllmeetingUsers() {
        return _ref2.apply(this, arguments);
      }

      return getAllmeetingUsers;
    }()
  }, {
    key: 'onLoad',
    value: function onLoad(options, preload) {
      preload = preload || {};
      this.preload = preload.preload || {};
      // const eventChannel = wx.getOpenerEventChannel()
      // eventChannel.emit('acceptDataFromOpenedPage', [])
      // eventChannel.on('acceptDataFromOpenerPage', (data) => {
      //   console.log(data)
      // })
    }
  }, {
    key: 'onShow',
    value: function onShow() {
      this.isFocus = false;
      var windowWH = this.$parent.globalData.windowWH || {};
      var height = windowWH.height;
      height = height || 667;
      if (height < 768) {
        this.lineHeight = (height - 100) / 27;
      } else {
        this.lineHeight = 28;
      }
      this.winHeight = height - 40;
      this.relateUsers = this.$parent.globalData.relateUsers || [];
      console.log(this.relateUsers);
      this.getAllmeetingUsers();
    }
  }]);

  return taskVtUsers;
}(_wepy2.default.page);


Page(require('./../../npm/wepy/lib/wepy.js').default.$createPage(taskVtUsers , 'task/pages/taskVtUsers'));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhc2tWdFVzZXJzLmpzIl0sIm5hbWVzIjpbInd4QXBpcyIsInJlcXVpcmUiLCJlbmRXb3JkcyIsImlzTnVtIiwidGFza1Z0VXNlcnMiLCJjb25maWciLCIkcmVwZWF0IiwiJHByb3BzIiwiJGV2ZW50cyIsImNvbXBvbmVudHMiLCJ0b3BNZWV0aW5nVXNlciIsInRvcEJhciIsInVzZXJTa2VsZXRvbiIsInNrZWxldG9uIiwicHJvcHMiLCJkYXRhIiwicHJlbG9hZCIsImlzRm9jdXMiLCJpbnB1dFNlYXJjaCIsImlzU2tlbGV0b24iLCJsaW5lSGVpZ2h0Iiwid2luSGVpZ2h0IiwidG9wIiwiaGVpZ2h0IiwiaGlkZGVuIiwic2hvd1dvcmRzIiwidHJhbnMiLCJzY3JvbGxUb3BJZCIsIm1lZXRpbmdVc2VycyIsIm1lZXRpbmdBcnIiLCJtZWV0aW5nSWQiLCJyZWxhdGVVc2VycyIsIm1lZXRpbmdMaWJVc2VycyIsIm1peGlucyIsImNvbW1vbkFwaSIsImV2ZW50cyIsInBhcmVudEJhY2tGbiIsIndlcHkiLCJuYXZpZ2F0ZUJhY2siLCJtZXRob2RzIiwic2VhcmNoRm9jdXMiLCJnZXRTY3JvbGxIZWlnaHQiLCJoIiwiZXZ0IiwiX3RoaXMiLCJ3aW5kb3dXSCIsIiRwYXJlbnQiLCJnbG9iYWxEYXRhIiwicXVlcnkiLCJ3eCIsImNyZWF0ZVNlbGVjdG9yUXVlcnkiLCJzZWxlY3QiLCJib3VuZGluZ0NsaWVudFJlY3QiLCJleGVjIiwicmVzIiwicmVzMSIsIiRhcHBseSIsInNlYXJjaENoYW5nZSIsImUiLCJkZXRhaWwiLCJ2YWx1ZSIsInRyaW0iLCJ0ZW1wY2hhcmdlciIsIkpTT04iLCJwYXJzZSIsImtleSIsImZvckVhY2giLCJpdGVtIiwibmlja25hbWUiLCJpbmRleE9mIiwicHVzaCIsImxlbmd0aCIsIm11bHRpQ29uZmlybSIsImNvbnNvbGUiLCJsb2ciLCJiaW5kQ2hhcmdlciIsInN1Ykl0ZW0iLCJpbmRleCIsImNoZWNrZWQiLCJ1c2VyZGlkIiwiZGlkIiwibmFtZSIsIm5vdGlmeSIsInNwbGljZSIsImdldFdvcmRzIiwiaWQiLCJ0YXJnZXQiLCJzZXRXb3JkcyIsImNoU3RhcnQiLCJvZmZzZXRUb3AiLCJjaEVuZCIsImNoTW92ZSIsInkiLCJ0b3VjaGVzIiwiY2xpZW50WSIsIm9mZnNldHRvcCIsInJlY3QiLCJwYXJzZUludCIsIm51bSIsInBhZ2UiLCJwYWdlc2l6ZSIsInN0YXR1cyIsImFsbG1lZXRpbmdVc2VycyIsInJlc3VsdCIsImhhbmRsZVJlcGVhdCIsIml0ZW0xIiwiaXRlbTIiLCJkZWFsV2l0aFVzZXJzIiwiY2hhcmdlckNoaWxkIiwiY2hhcmdlckFyciIsInN0cmluZ2lmeSIsImxvZ01ldGhvZCIsIiRpbnN0YW5jZSIsImxvZ0luZm8iLCJvcHRpb25zIiwiZ2V0QWxsbWVldGluZ1VzZXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7OztBQUNBLElBQU1BLFNBQVNDLFFBQVEsc0JBQVIsQ0FBZjtBQUNBLElBQUlDLFdBQVcsRUFBZjtBQUNBLElBQUlDLEtBQUo7O0lBRXFCQyxXOzs7Ozs7Ozs7Ozs7OzttTUFDbkJDLE0sR0FBUyxFLFNBQ1ZDLE8sR0FBVSxFLFNBQ1hDLE0sR0FBUyxFQUFDLGtCQUFpQixFQUFDLGNBQWEsRUFBZCxFQUFpQixvQkFBbUIsY0FBcEMsRUFBbEIsRUFBc0UsZ0JBQWUsRUFBckYsRSxTQUNUQyxPLEdBQVUsRUFBQyxrQkFBaUIsRUFBQyxpQkFBZ0IsaUJBQWpCLEVBQWxCLEUsU0FDVEMsVSxHQUFhO0FBQ1ZDLHNCQUFnQkMsZ0JBRE47QUFFVkMsb0JBQWNDO0FBRkosSyxTQUlaQyxLLEdBQVEsRSxTQUVSQyxJLEdBQU87QUFDTEMsZUFBUyxFQURKO0FBRUxDLGVBQVMsS0FGSjtBQUdMQyxtQkFBYSxFQUhSO0FBSUxDLGtCQUFZLElBSlA7QUFLTEMsa0JBQVksQ0FMUDtBQU1MQyxpQkFBVyxDQU5OO0FBT0xDLFdBQUssQ0FQQTtBQVFMQyxj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ckI7QUFDQSxXQUFLQSxPQUFMLEdBQWVBLFFBQVFBLE9BQVIsSUFBbUIsRUFBbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7Ozs2QkFDUztBQUNSLFdBQUtDLE9BQUwsR0FBZSxLQUFmO0FBQ0EsVUFBSTRCLFdBQVcsS0FBS0MsT0FBTCxDQUFhQyxVQUFiLENBQXdCRixRQUF4QixJQUFvQyxFQUFuRDtBQUNBLFVBQUl0QixTQUFTc0IsU0FBU3RCLE1BQXRCO0FBQ0FBLGVBQVNBLFVBQVUsR0FBbkI7QUFDQSxVQUFJQSxTQUFTLEdBQWIsRUFBa0I7QUFDaEIsYUFBS0gsVUFBTCxHQUFrQixDQUFDRyxTQUFTLEdBQVYsSUFBaUIsRUFBbkM7QUFDRCxPQUZELE1BRU87QUFDTCxhQUFLSCxVQUFMLEdBQWtCLEVBQWxCO0FBQ0Q7QUFDRCxXQUFLQyxTQUFMLEdBQWlCRSxTQUFTLEVBQTFCO0FBQ0EsV0FBS1EsV0FBTCxHQUFtQixLQUFLZSxPQUFMLENBQWFDLFVBQWIsQ0FBd0JoQixXQUF4QixJQUF1QyxFQUExRDtBQUNBMEMsY0FBUUMsR0FBUixDQUFZLEtBQUszQyxXQUFqQjtBQUNBLFdBQUtvRixrQkFBTDtBQUNEOzs7O0VBak9zQzlFLGVBQUs4RCxJOztrQkFBekIvRixXIiwiZmlsZSI6InRhc2tWdFVzZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgd2VweSBmcm9tICd3ZXB5J1xuaW1wb3J0IHRvcEJhciBmcm9tICcuLi8uLi9jb21wb25lbnRzL3RvcEJhcidcbmltcG9ydCBza2VsZXRvbiBmcm9tICcuLi8uLi9jb21wb25lbnRzL3NrZWxldG9uJ1xuaW1wb3J0IHsgcXVlcnlWdFVzZXJzIH0gZnJvbSAnLi4vLi4vdXRpbHMvaHR0cCdcbmltcG9ydCBjb21tb25BcGkgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbW1vbkFwaSdcbmNvbnN0IHd4QXBpcyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3d4QXBpLmpzJylcbnZhciBlbmRXb3JkcyA9ICcnXG52YXIgaXNOdW1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgdGFza1Z0VXNlcnMgZXh0ZW5kcyB3ZXB5LnBhZ2Uge1xuICBjb25maWcgPSB7fVxuICRyZXBlYXQgPSB7fTtcclxuJHByb3BzID0ge1widG9wTWVldGluZ1VzZXJcIjp7XCJ4bWxuczp2LW9uXCI6XCJcIixcImJpbmRwYXJlbnRCYWNrRm5cIjpcInBhcmVudEJhY2tGblwifSxcInVzZXJTa2VsZXRvblwiOnt9fTtcclxuJGV2ZW50cyA9IHtcInRvcE1lZXRpbmdVc2VyXCI6e1widi1vbjp0b3BOYXZGblwiOlwiZ2V0U2Nyb2xsSGVpZ2h0XCJ9fTtcclxuIGNvbXBvbmVudHMgPSB7XG4gICAgdG9wTWVldGluZ1VzZXI6IHRvcEJhcixcbiAgICB1c2VyU2tlbGV0b246IHNrZWxldG9uXG4gIH1cbiAgcHJvcHMgPSB7XG4gIH1cbiAgZGF0YSA9IHtcbiAgICBwcmVsb2FkOiB7fSxcbiAgICBpc0ZvY3VzOiBmYWxzZSxcbiAgICBpbnB1dFNlYXJjaDogJycsXG4gICAgaXNTa2VsZXRvbjogdHJ1ZSxcbiAgICBsaW5lSGVpZ2h0OiAwLFxuICAgIHdpbkhlaWdodDogMCxcbiAgICB0b3A6IDAsXG4gICAgaGVpZ2h0OiAwLFxuICAgIGhpZGRlbjogdHJ1ZSxcbiAgICBlbmRXb3JkczogJycsXG4gICAgc2hvd1dvcmRzOiAnJyxcbiAgICB0cmFuczogJzAuMScsXG4gICAgc2Nyb2xsVG9wSWQ6ICcnLFxuICAgIG1lZXRpbmdVc2Vyczoge30sXG4gICAgbWVldGluZ0Fycjoge30sXG4gICAgbWVldGluZ0lkOiAnJyxcbiAgICByZWxhdGVVc2VyczogW10sXG4gICAgbWVldGluZ0xpYlVzZXJzOiAnJ1xuICB9XG4gIG1peGlucyA9IFtjb21tb25BcGldXG4gIGV2ZW50cyA9IHtcbiAgICAvLyBwYXJlbnRCYWNrRm5cbiAgICBwYXJlbnRCYWNrRm4oKSB7XG4gICAgICB3ZXB5Lm5hdmlnYXRlQmFjaygpXG4gICAgfVxuICB9XG4gIG1ldGhvZHMgPSB7XG4gICAgc2VhcmNoRm9jdXMoKSB7XG4gICAgICB0aGlzLmlzRm9jdXMgPSB0cnVlXG4gICAgfSxcbiAgICAvLyDojrflj5bliJfooajpq5jluqZcbiAgICBnZXRTY3JvbGxIZWlnaHQoaCwgZXZ0KSB7XG4gICAgICBsZXQgX3RoaXMgPSB0aGlzXG4gICAgICBsZXQgd2luZG93V0ggPSBfdGhpcy4kcGFyZW50Lmdsb2JhbERhdGEud2luZG93V0ggfHwge31cbiAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3dXSC5oZWlnaHRcbiAgICAgIGhlaWdodCA9IGhlaWdodCB8fCA2NjdcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gd3guY3JlYXRlU2VsZWN0b3JRdWVyeSgpXG4gICAgICBxdWVyeS5zZWxlY3QoJyN0b3BNZWV0aW5nU2VhcmNoJykuYm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIHF1ZXJ5LmV4ZWMocmVzID0+IHtcbiAgICAgICAgcXVlcnkuc2VsZWN0KCcjdGFic1VzZXJYU2Nyb2xsJykuYm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgcXVlcnkuZXhlYyhyZXMxID0+IHtcbiAgICAgICAgICBfdGhpcy5oZWlnaHQgPSBoZWlnaHQgLSByZXNbMF0uaGVpZ2h0IC0gaCAtIHJlczFbMF0uaGVpZ2h0XG4gICAgICAgICAgX3RoaXMuJGFwcGx5KClcbiAgICAgICAgfSlcbiAgICAgICAgX3RoaXMuJGFwcGx5KClcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHNlYXJjaENoYW5nZSAoZSkge1xuICAgICAgaWYgKGUuZGV0YWlsLnZhbHVlLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLmlucHV0U2VhcmNoID0gZS5kZXRhaWwudmFsdWUudHJpbSgpXG4gICAgICBsZXQgdGVtcGNoYXJnZXIgPSB7XG4gICAgICAgICdBJzogW10sICdCJzogW10sICdDJzogW10sICdEJzogW10sICdFJzogW10sICdGJzogW10sICdHJzogW10sICdIJzogW10sICdJJzogW10sICdKJzogW10sICdLJzogW10sICdMJzogW10sICdNJzogW10sICdOJzogW10sICdPJzogW10sICdQJzogW10sICdRJzogW10sICdSJzogW10sICdTJzogW10sICdUJzogW10sICdVJzogW10sICdWJzogW10sICdXJzogW10sICdYJzogW10sICdZJzogW10sICdaJzogW10sICdVTic6IFtdXG4gICAgICB9XG4gICAgICBsZXQgbWVldGluZ0xpYlVzZXJzID0gSlNPTi5wYXJzZSh0aGlzLm1lZXRpbmdMaWJVc2VycyB8fCAne30nKVxuICAgICAgZm9yIChsZXQga2V5IGluIG1lZXRpbmdMaWJVc2Vycykge1xuICAgICAgICBtZWV0aW5nTGliVXNlcnNba2V5XS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChpdGVtLm5pY2tuYW1lLmluZGV4T2YoZS5kZXRhaWwudmFsdWUpID4gLTEpIHtcbiAgICAgICAgICAgIHRlbXBjaGFyZ2VyW2tleV0ucHVzaChpdGVtKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGtleSBpbiB0ZW1wY2hhcmdlcikge1xuICAgICAgICBpZiAodGVtcGNoYXJnZXJba2V5XS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBkZWxldGUgdGVtcGNoYXJnZXJba2V5XVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLm1lZXRpbmdVc2VycyA9IHRlbXBjaGFyZ2VyXG4gICAgfSxcbiAgICAvLyDnoa7lrprpgInmi6nkuI7kvJrkurrlkZhcbiAgICBtdWx0aUNvbmZpcm0oKSB7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnJlbGF0ZVVzZXJzKVxuICAgICAgdGhpcy4kcGFyZW50Lmdsb2JhbERhdGEucmVsYXRlVXNlcnMgPSB0aGlzLnJlbGF0ZVVzZXJzXG4gICAgICB3ZXB5Lm5hdmlnYXRlQmFjaygpXG4gICAgfSxcbiAgICBiaW5kQ2hhcmdlciAoc3ViSXRlbSwga2V5LCBpbmRleCkge1xuICAgICAgc3ViSXRlbS5jaGVja2VkID0gIXN1Ykl0ZW0uY2hlY2tlZFxuICAgICAgdGhpcy5tZWV0aW5nVXNlcnNba2V5XVtpbmRleF0uY2hlY2tlZCA9IHN1Ykl0ZW0uY2hlY2tlZFxuICAgICAgaWYgKHN1Ykl0ZW0uY2hlY2tlZCkge1xuICAgICAgICB0aGlzLnJlbGF0ZVVzZXJzLnB1c2goe1xuICAgICAgICAgIHVzZXJkaWQ6IHN1Ykl0ZW0uZGlkLFxuICAgICAgICAgIG5hbWU6IHN1Ykl0ZW0ubmFtZSxcbiAgICAgICAgICBub3RpZnk6IDBcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVsYXRlVXNlcnMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbS51c2VyZGlkID09PSBzdWJJdGVtLmRpZCkge1xuICAgICAgICAgICAgdGhpcy5yZWxhdGVVc2Vycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8g6I635Y+W5paH5a2X5L+h5oGvXG4gICAgZ2V0V29yZHMgKGUpIHtcbiAgICAgIHZhciBpZCA9IGUudGFyZ2V0LmlkXG4gICAgICB0aGlzLmVuZFdvcmRzID0gaWRcbiAgICAgIGlzTnVtID0gaWRcbiAgICAgIHRoaXMuc2hvd1dvcmRzID0gdGhpcy5lbmRXb3Jkc1xuICAgIH0sXG4gICAgLy8g6K6+572u5paH5a2X5L+h5oGvXG4gICAgc2V0V29yZHMgKGUpIHtcbiAgICAgIHZhciBpZCA9IGUudGFyZ2V0LmlkXG4gICAgICB0aGlzLnNjcm9sbFRvcElkID0gaWRcbiAgICB9LFxuICAgIGNoU3RhcnQgKGUpIHtcbiAgICAgIHRoaXMudHJhbnMgPSAnMC4zJ1xuICAgICAgdGhpcy5oaWRkZW4gPSBmYWxzZVxuICAgICAgdGhpcy50b3AgPSBlLnRhcmdldC5vZmZzZXRUb3AgPiAxMCA/IGUudGFyZ2V0Lm9mZnNldFRvcCAtICgzICogdGhpcy5saW5lSGVpZ2h0IC8gNSkgOiAzXG4gICAgfSxcbiAgICAvLyDop6blj5Hnu5PmnZ/pgInmi6lcbiAgICBjaEVuZCAoZSkge1xuICAgICAgdGhpcy50cmFucyA9ICcwLjEnXG4gICAgICB0aGlzLmhpZGRlbiA9IHRydWVcbiAgICAgIHRoaXMuc2Nyb2xsVG9wSWQgPSB0aGlzLmVuZFdvcmRzXG4gICAgfSxcbiAgICAvLyDmu5HliqjpgInmi6nnlKjmiLdcbiAgICBjaE1vdmUoZSkge1xuICAgICAgbGV0IF90aGlzID0gdGhpc1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0uY2xpZW50WVxuICAgICAgdmFyIG9mZnNldHRvcCA9IDBcbiAgICAgIHZhciBoZWlnaHQgPSAwXG4gICAgICB3eC5jcmVhdGVTZWxlY3RvclF1ZXJ5KClcbiAgICAgICAgLnNlbGVjdCgnI2NoYXJNZWV0aW5nTGluZScpXG4gICAgICAgIC5ib3VuZGluZ0NsaWVudFJlY3QoZnVuY3Rpb24ocmVjdCkge1xuICAgICAgICAgIG9mZnNldHRvcCA9IHJlY3QudG9wXG4gICAgICAgICAgdmFyIG1lZXRpbmdBcnIgPSBfdGhpcy5tZWV0aW5nQXJyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2NoTW92ZScsIG1lZXRpbmdBcnIpXG4gICAgICAgICAgLy8g6I635Y+Weei9tOacgOWkp+WAvFxuICAgICAgICAgIC8vIGhlaWdodCA9IF90aGlzLiRwYXJlbnQuZ2xvYmFsRGF0YS53aW5kb3dXSC5oZWlnaHRcbiAgICAgICAgICAvLyBoZWlnaHQgPSBoZWlnaHQgLSBfdGhpcy5oZWlnaHQgKyAxMCArIF90aGlzLmxpbmVIZWlnaHQgKiBtZWV0aW5nQXJyLmxlbmd0aFxuICAgICAgICAgIGhlaWdodCA9IF90aGlzLmxpbmVIZWlnaHQgKiBtZWV0aW5nQXJyLmxlbmd0aCArIG9mZnNldHRvcFxuICAgICAgICAgIC8vIOWIpOaWremAieaLqeWMuuWfnyzlj6rmnInlnKjpgInmi6nljLrmiY3kvJrnlJ/mlYhcbiAgICAgICAgICBpZiAoeSA+IG9mZnNldHRvcCAmJiB5IDwgcGFyc2VJbnQoaGVpZ2h0KSkge1xuICAgICAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KCh5IC0gb2Zmc2V0dG9wKSAvIF90aGlzLmxpbmVIZWlnaHQpXG4gICAgICAgICAgICBlbmRXb3JkcyA9IG1lZXRpbmdBcnJbbnVtXVxuICAgICAgICAgICAgLy8g6L+Z6YeMIOaKimVuZFdvcmRzIOe7keWumuWIsHRoaXMg5LiK77yM5piv5Li65LqG5omL5oyH56a75byA5LqL5Lu26I635Y+W5YC8XG4gICAgICAgICAgICBfdGhpcy5lbmRXb3JkcyA9IGVuZFdvcmRzXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIOWOu+mZpOmHjeWkje+8jOS4uuS6humYsuatouavj+asoeenu+WKqOmDvei1i+WAvCAs6L+Z6YeM6ZmQ5Yi25YC85pyJ5Y+Y5YyW5ZCO5omN5Lya5pyJ6LWL5YC85pON5L2c77yMXG4gICAgICAgICAgaWYgKGlzTnVtICE9PSBudW0pIHtcbiAgICAgICAgICAgIGlzTnVtID0gbnVtXG4gICAgICAgICAgICBfdGhpcy5zaG93V29yZHMgPSBfdGhpcy5lbmRXb3Jkc1xuICAgICAgICAgICAgX3RoaXMuc2Nyb2xsVG9wSWQgPSBfdGhpcy5lbmRXb3Jkc1xuICAgICAgICAgICAgX3RoaXMudG9wID0gX3RoaXMubGluZUhlaWdodCAqIG51bSArIDEwIC0gX3RoaXMubGluZUhlaWdodCAvIDNcbiAgICAgICAgICAgIF90aGlzLiRhcHBseSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIOiKgueCueeahOS4iui+ueeVjOWdkOagh1xuICAgICAgICB9KVxuICAgICAgICAuZXhlYygpXG4gICAgfVxuICB9XG4gIGFzeW5jIGdldEFsbG1lZXRpbmdVc2VycyAoKSB7XG4gICAgLy8gdHJ5IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBxdWVyeVZ0VXNlcnMoeyBuYW1lOiAnJywgcGFnZTogMCwgcGFnZXNpemU6IDk5OTkgfSlcbiAgICBpZiAocmVzICYmIHJlcy5zdGF0dXMgPT09IDApIHtcbiAgICAgIGxldCBhbGxtZWV0aW5nVXNlcnMgPSByZXMucmVzdWx0XG4gICAgICBhbGxtZWV0aW5nVXNlcnMgPSB0aGlzLmhhbmRsZVJlcGVhdChhbGxtZWV0aW5nVXNlcnMsICd1c2VyaWQnKVxuICAgICAgaWYgKHRoaXMucmVsYXRlVXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnJlbGF0ZVVzZXJzLmZvckVhY2goaXRlbTEgPT4ge1xuICAgICAgICAgIGFsbG1lZXRpbmdVc2Vycy5mb3JFYWNoKGl0ZW0yID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtMS51c2VyZGlkID09PSBpdGVtMi5kaWQpIHtcbiAgICAgICAgICAgICAgaXRlbTIuY2hlY2tlZCA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgbGV0IHsgY2hhcmdlckNoaWxkLCBjaGFyZ2VyQXJyOiBtZWV0aW5nQXJyIH0gPSB0aGlzLmRlYWxXaXRoVXNlcnMoYWxsbWVldGluZ1VzZXJzLCB7IG5hbWU6ICduaWNrbmFtZScsIGlkOiAndXNlcmlkJyB9KVxuICAgICAgdGhpcy5tZWV0aW5nVXNlcnMgPSBjaGFyZ2VyQ2hpbGRcbiAgICAgIHRoaXMubWVldGluZ0xpYlVzZXJzID0gSlNPTi5zdHJpbmdpZnkoY2hhcmdlckNoaWxkKVxuICAgICAgdGhpcy5tZWV0aW5nQXJyID0gbWVldGluZ0FyclxuICAgICAgLy8gY29uc29sZS5sb2coJ2dldEFsbG1lZXRpbmdVc2VycycsIHRoaXMubWVldGluZ0FycilcbiAgICAgIHRoaXMuaXNTa2VsZXRvbiA9IGZhbHNlXG4gICAgICB0aGlzLiRhcHBseSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHd4QXBpcy5sb2dNZXRob2QoXG4gICAgICAgICdsb2cnLFxuICAgICAgICAncXVlcnlVc2VyQnlyb2xlID0gJyArIEpTT04uc3RyaW5naWZ5KHJlcyksXG4gICAgICAgIHdlcHkuJGluc3RhbmNlLmdsb2JhbERhdGEubG9nSW5mb1xuICAgICAgKVxuICAgIH1cbiAgICAvLyB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vICAgd3hBcGlzLmxvZ01ldGhvZChcbiAgICAvLyAgICAgJ2xvZycsXG4gICAgLy8gICAgICd0YXNrQ0MgPSAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IpLFxuICAgIC8vICAgICBmYWxzZVxuICAgIC8vICAgKVxuICAgIC8vIH1cbiAgfVxuICBvbkxvYWQgKG9wdGlvbnMsIHByZWxvYWQpIHtcbiAgICBwcmVsb2FkID0gcHJlbG9hZCB8fCB7fVxuICAgIHRoaXMucHJlbG9hZCA9IHByZWxvYWQucHJlbG9hZCB8fCB7fVxuICAgIC8vIGNvbnN0IGV2ZW50Q2hhbm5lbCA9IHd4LmdldE9wZW5lckV2ZW50Q2hhbm5lbCgpXG4gICAgLy8gZXZlbnRDaGFubmVsLmVtaXQoJ2FjY2VwdERhdGFGcm9tT3BlbmVkUGFnZScsIFtdKVxuICAgIC8vIGV2ZW50Q2hhbm5lbC5vbignYWNjZXB0RGF0YUZyb21PcGVuZXJQYWdlJywgKGRhdGEpID0+IHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgLy8gfSlcbiAgfVxuICBvblNob3cgKCkge1xuICAgIHRoaXMuaXNGb2N1cyA9IGZhbHNlXG4gICAgbGV0IHdpbmRvd1dIID0gdGhpcy4kcGFyZW50Lmdsb2JhbERhdGEud2luZG93V0ggfHwge31cbiAgICBsZXQgaGVpZ2h0ID0gd2luZG93V0guaGVpZ2h0XG4gICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDY2N1xuICAgIGlmIChoZWlnaHQgPCA3NjgpIHtcbiAgICAgIHRoaXMubGluZUhlaWdodCA9IChoZWlnaHQgLSAxMDApIC8gMjdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saW5lSGVpZ2h0ID0gMjhcbiAgICB9XG4gICAgdGhpcy53aW5IZWlnaHQgPSBoZWlnaHQgLSA0MFxuICAgIHRoaXMucmVsYXRlVXNlcnMgPSB0aGlzLiRwYXJlbnQuZ2xvYmFsRGF0YS5yZWxhdGVVc2VycyB8fCBbXVxuICAgIGNvbnNvbGUubG9nKHRoaXMucmVsYXRlVXNlcnMpXG4gICAgdGhpcy5nZXRBbGxtZWV0aW5nVXNlcnMoKVxuICB9XG4gfVxuIl19
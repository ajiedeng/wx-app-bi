"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.appendCookieToUrl=void 0;var _loginInfo=require("./loginInfo.js"),appendCookieToUrl=exports.appendCookieToUrl=function(o){var e=(0,_loginInfo.getCookie)();return e&&o?o+"&"+e:o};
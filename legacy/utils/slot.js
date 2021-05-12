"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _slicedToArray=function(){function e(e,r){var t=[],n=!0,o=!1,a=void 0;try{for(var u,i=e[Symbol.iterator]();!(n=(u=i.next()).done)&&(t.push(u.value),!r||t.length!==r);n=!0);}catch(e){o=!0,a=e}finally{try{!n&&i.return&&i.return()}finally{if(o)throw a}}return t}return function(r,t){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),formatNumber=function(e){return e=e.toString(),e[1]?e:"0"+e},generateSlot=exports.generateSlot=function(e){var r=e/2|0,t=e%2==0?0:30;return formatNumber(r)+":"+formatNumber(t)},generatePeriod=exports.generatePeriod=function(){for(var e=[],r=0;r<48;r++)e.push(generateSlot(r)+":"+generateSlot(r+1));return e},expiredSlots=exports.expiredSlots=function(e){for(var r=e&&1e3*e-Date.now()>0?new Date(1e3*e):new Date,t={},n=0;n<48;n++){var o=30*(n+1),a=o/60|0,u=o%60,i=new Date(1e3*e);i.setHours(a),i.setMinutes(u),i.setSeconds(0),i.setMilliseconds(0),i<r&&(t[n]=!0)}return t},getSlotIdByDate=exports.getSlotIdByDate=function(e){return(60*e.getHours()+e.getMinutes())/30|0},getTimePeriod=exports.getTimePeriod=function(e){return e=e.sort().map(function(e){return parseInt(e)}),{startTime:30*e[0]*60,endTime:30*(e[e.length-1]+1)*60-1}},getSlotsID=exports.getSlotsID=function(e,r){if(null==e||null==r)return null;var t=[e,r].map(function(e){return e/1800|0}),n=_slicedToArray(t,2),o=n[0],a=n[1];return rangeToMap(o,a)},rangeToMap=exports.rangeToMap=function(e,r){for(var t={},n=e;n<=r;n++)t[n]=!0;return t},generateTime=exports.generateTime=function(e,r){return e=e.split(":"),r=r.split(":"),"00"===r[3]?(r[3]="59",r[2]=formatNumber(r[2]-1)):"30"===r[3]&&(r[3]="29"),e[0]+":"+e[1]+"-"+r[2]+":"+r[3]},generateStampTime=exports.generateStampTime=function(e,r){if(!e||!r)return"";var t=parseInt(e/3600),n=parseInt((e-3600*t)/60),o=parseInt(r/3600),a=parseInt((r-3600*o)/60);return formatNumber(t)+":"+formatNumber(n)+"-"+formatNumber(o)+":"+formatNumber(a)};
function getNzhObjByLang(n,e){return{encodeS:function(e,t){return t=utils.extend({ww:!0,tenMin:!0},t),nzhClass.CL.call(n,e,t)},encodeB:function(n,t){return t=utils.extend({ww:!0},t),nzhClass.CL.call(e,n,t)},decodeS:function(){return nzhClass.unCL.apply(n,arguments)},decodeB:function(){return nzhClass.unCL.apply(e,arguments)},toMoney:function(n,t){return t=utils.extend({ww:!0},t),nzhClass.toMoney.call(e,n,t)}}}var nzhClass=require(".//index.js"),utils=require("./utils.js");module.exports=getNzhObjByLang;
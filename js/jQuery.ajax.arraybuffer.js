/*
 jQuery.ajax.arraybuffer
 https://github.com/vobruba-martin/jquery.ajax.arraybuffer
 Copyright (C) 2016 Martin Vobruba
 Licensed MIT (/blob/master/LICENSE.md)
*/
'use strict';jQuery.each(["arraybuffer","blob"],function(r,h){jQuery.ajaxTransport(h,function(a){var p=0,l={},k=jQuery.ajaxSettings.xhr(),k=!!k&&"withCredentials"in k;window.attachEvent&&window.attachEvent("onunload",function(){for(var a in l)l[+a](void 0,!0)});if(!a.crossDomain||k){var d=null;return{send:function(c,k){var e,b=a.xhr(),n=++p;b.open(a.type+"",a.url+"",a.async,a.username,a.password);b.responseType=h;if(a.xhrFields)for(e in a.xhrFields)b[e]=a.xhrFields[e];a.mimeType&&b.overrideMimeType&&
b.overrideMimeType(a.mimeType);a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)void 0!==c[e]&&b.setRequestHeader(e,c[e]+"");b.send(a.hasContent&&a.data||null);d=function(e,c){var f,m,g;if(d&&(c||4===b.readyState))if(delete l[n],d=null,b.onreadystatechange=jQuery.noop,c)4!==b.readyState&&b.abort();else{g={};f=b.status;try{"arraybuffer"===h&&(g.arraybuffer=b.response),"blob"===h&&(g.blob=b.response)}catch(q){}try{m=b.statusText}catch(q){m=""}f||!a.isLocal||
a.crossDomain||"arraybuffer"!==h?f||!a.isLocal||a.crossDomain||"blob"!==h?1223===f&&(f=204):f=g.blob?200:404:f=g.arraybuffer?200:404}g&&k(+f,m+"",g,b.getAllResponseHeaders())};a.async?4===b.readyState?window.setTimeout(d):b.onreadystatechange=l[n]=d:d()},abort:function(){d&&d(void 0,!0)}}}})});
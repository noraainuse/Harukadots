/*
 *  This file is part of Stream Recorder  v2.2.2  <https://www.hlsloader.com/>
 *  Note that the source code is copyrighted. We do not grant you the right to modify or distribute it.
 */

const _export_=void(navigator.userAgent.includes("Chrome")?chrome:"object"==typeof browser?browser:chrome).runtime.onMessage.addListener(((e,o,t)=>{const{cmd:s,params:r}=e,c=o.tab?.id;return o.frameId,"message_to_offscreen"===e.type&&((async()=>{if("b2o_fetch_request"!==s)return _LOG_&&console.log(...logGen(c,"rt.onMessage","unkown cmd : "+s)),t(!0);{const{url:e,method:o,headers:s,timeout:c,revokeList:n}=r;(e=>{if(e)for(const o of e)URL.revokeObjectURL(o)})(n),fetch(e,{method:o||"GET",mode:"cors",credentials:"include",headers:s}).then((e=>e.ok?e.blob():t({ok:!1,message:e.status}))).then((e=>{const o=URL.createObjectURL(e);return setTimeout((()=>{URL.revokeObjectURL(o)}),1e4),t({ok:!0,blobUrl:o})})).catch((e=>t({ok:!1,message:e.messsage})))}})(),!0)}));
const INSTALLED_AT_KEY = "installedAt";
const UPDATE_POPUP_RESTRICTION_KEY = "updatePopupRestriction";

const IS_ADDITIONAL_BLOCKING_ENABLED_KEY = "isAdditionalBlockingEnabled";
const ADS_KEY = "ads";
const ANNOTATIONS_KEY = "annotations";
const YOUTUBE_AD_REGEX_KEY = "youtubeAdRegex";
const AD_BLOCKING_SELECTORS_KEY = "adBlockingSelectors";
const DAILYMOTION_AD_BLOCKING_SELECTORS_KEY = "dailymotionAdBlockingSelectors";
const DAILYMOTION_AD_REGEX_KEY = "dailymotionAdRegex";
const POPUP_CONFIG_KEY = "popupConfig";

const API_URL = "https://api.adblock-for-youtube.com";
// const API_URL = "https://dev-api-adblock-for-youtube.herokuapp.com";

const youtubeAdRegexesFallback = [
  "(googleads.g.doubleclick.net)",
  "(=adunit&)",
  "(/pubads.)",
  "(/pubads_)",
  "(/api/ads/)",
  "(/googleads_)",
  "(innovid.com)",
  "(/pagead/lvz?)",
  "(/pagead/gen_)",
  "(doubleclick.com)",
  "(google.com/pagead/)",
  "(youtube.com/pagead/)",
  "(googlesyndication.com)",
  "(www.youtube.com/get_midroll_)",
];

const youtubeAnnotationsRegexes = ["(annotations_invideo)"]

const adBlockingSelectorsFallback = [
  "#player-ads",
  "#merch-shelf",
  "#masthead-ad",
  "#offer-module",
  ".ytp-ad-button",

  "ytd-ad-slot-renderer",
  ".ytd-ad-slot-renderer",
  ".ytp-ad-progress-list",

  // ".ytd-merch-shelf-renderer",
  "ytd-companion-slot-renderer",
  ".ytd-companion-slot-renderer",
  ".ytd-in-feed-ad-layout-renderer",
  ".ytd-action-companion-ad-renderer",
  ".ytp-ad-player-overlay-flyout-cta",
  "ytd-promoted-sparkles-web-renderer",

  ".ad-showing > .html5-video-container",
  ".ytd-player-legacy-desktop-watch-ads-renderer",
  ".ytd-rich-item-renderer > ytd-ad-slot-renderer",
  'a[href^="https://www.googleadservices.com/pagead/aclk?"]',
  "#contents > ytd-rich-item-renderer:has(> #content > ytd-ad-slot-renderer)",

  "ytd-display-ad-renderer",
  ".ytd-carousel-ad-renderer",
  "ytd-compact-promoted-video-renderer",
  ".ytd-promoted-sparkles-text-search-renderer",
  ".masthead-ad-control",
  "#ad_creative_3",
  "#footer-ads",

  "ytd-promoted-video-renderer",
  ".ad-container",
  ".ad-div",
  ".video-ads",
  ".ytd-mealbar-promo-renderer",
  ".sparkles-light-cta",
  "#watch-channel-brand-div",
  "#watch7-sidebar-ads",

  '[target-id="engagement-panel-ads"]',
]

const dailymotionAdBlockingSelectorsFallback = [
  'div[class^="NewWatchingDiscovery__adSection"]',
  'div[class^="DisplayAd"]',
]

// const defaultPopupConfig = {
//   type: "mobile",
//   isEnabled: false,
//   doNotShowAgainMinutes: 120,
// };

const setConstantScriptString = 'function setConstant(e,t,n="",r="",i=!1){if(e&&matchStackTrace(n,Error().stack)){var o,s=!1,a=noopArray(),u=noopObject();if("undefined"===t)o=void 0;else if("false"===t)o=!1;else if("true"===t)o=!0;else if("null"===t)o=null;else if("emptyArr"===t)o=a;else if("emptyObj"===t)o=u;else if("noopFunc"===t)o=noopFunc;else if("noopCallbackFunc"===t)o=noopCallbackFunc;else if("trueFunc"===t)o=trueFunc;else if("falseFunc"===t)o=falseFunc;else if("throwFunc"===t)o=throwFunc;else if("noopPromiseResolve"===t)o=noopPromiseResolve;else if("noopPromiseReject"===t)o=noopPromiseReject;else if(/^\\d+$/.test(t)){if(nativeIsNaN(o=parseFloat(t))||Math.abs(o)>32767)return}else if("-1"===t)o=-1;else if(""===t)o="";else if("yes"===t)o="yes";else{if("no"!==t)return;o="no"}["asFunction","asCallback","asResolved","asRejected",].includes(r)&&(o=({asFunction:e=>function(){return e},asCallback:e=>function(){return function(){return e}},asResolved:e=>Promise.resolve(e),asRejected:e=>Promise.reject(e)})[r](o));var c=!1,l=function e(t){return c||(c=void 0!==t&&void 0!==o&&typeof t!=typeof o&&null!==t)},f=function t(n,r,a,u){if(!u.init(n[r]))return!1;var c,l=Object.getOwnPropertyDescriptor(n,r);if(l instanceof Object){if(!l.configurable){var f="Property \'".concat(r,"\' is not configurable");return console.log(f),!1}n[r]&&(n[r]=o),l.set instanceof Function&&(c=l.set)}return Object.defineProperty(n,r,{configurable:a,get:()=>u.get(),set(t){if(void 0!==c&&c(t),t instanceof Object){var n=e.split(".").slice(1);i&&!s&&(s=!0,t=new Proxy(t,{get:function e(t,r,i){return n.reduce(function(e,t,n,r){var i=null==e?void 0:e[t];return n===r.length-1&&i!==o&&(e[t]=o),i||e},t),Reflect.get(t,r,i)}}))}u.set(t)}}),!0};!function e(t,n){var r=getPropertyInChain(t,n),i=r.base,s=r.prop,a=r.chain,u={factValue:void 0,init(e){return this.factValue=e,!0},get(){return this.factValue},set(t){this.factValue!==t&&(this.factValue=t,t instanceof Object&&e(t,a))}};if(!a){f(i,s,!1,{init:e=>!l(e),get:()=>o,set(e){l(e)&&(o=e)}})&&hit();return}if(void 0!==i&&null===i[s]){f(i,s,!0,u);return}(i instanceof Object||"object"==typeof i)&&isEmptyObject(i)&&f(i,s,!0,u);var c=t[s];(c instanceof Object||"object"==typeof c&&null!==c)&&e(c,a),f(i,s,!0,u)}(window,e)}}function hit(){try{var e=console.log.bind(console),t=console.trace.bind(console);e("".concat(""," setconstant trace start")),t&&t(),e("".concat(""," trace end"))}catch(n){}}function noopArray(){return[]}function noopObject(){return{}}function noopFunc(){}function noopCallbackFunc(){return noopFunc}function trueFunc(){return!0}function falseFunc(){return!1}function throwFunc(){throw Error()}function noopPromiseReject(){return Promise.reject()}function noopPromiseResolve(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"{}",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"basic";if("undefined"!=typeof Response){var r=new Response(e,{status:200,statusText:"OK"});return"opaque"===n?Object.defineProperties(r,{body:{value:null},status:{value:0},statusText:{value:""},url:{value:""},type:{value:n}}):Object.defineProperties(r,{url:{value:t},type:{value:n}}),Promise.resolve(r)}}function getPropertyInChain(e,t){var n=t.indexOf(".");if(-1===n)return{base:e,prop:t};var r=t.slice(0,n);if(null===e)return{base:e,prop:r,chain:t};var i=e[r];return(t=t.slice(n+1),(e instanceof Object||"object"==typeof e)&&isEmptyObject(e)||null===i)?{base:e,prop:r,chain:t}:void 0!==i?getPropertyInChain(i,t):(Object.defineProperty(e,r,{configurable:!0}),{base:e,prop:r,chain:t})}function matchStackTrace(e,t){if(!e||""===e||shouldAbortInlineOrInjectedScript(e,t))return!0;var n=toRegExp(e),r=t.split("\\n").slice(2).map(function(e){return e.trim()}).join("\\n");return getNativeRegexpTest().call(n,r)}function nativeIsNaN(e){return(Number.isNaN||window.isNaN)(e)}function isEmptyObject(e){return 0===Object.keys(e).length&&!e.prototype}function shouldAbortInlineOrInjectedScript(e,t){var n="injectedScript",r=function e(t){return t.includes("inlineScript")},i=function e(t){return t.includes(n)};if(!(r(e)||i(e)))return!1;var o=window.location.href,s=o.indexOf("#");-1!==s&&(o=o.slice(0,s));var a=t.split("\\n").slice(2).map(function(e){return e.trim()}).map(function(e){var t=/(.*?@)?(\\S+)(:\\d+):\\d+\\)?$/.exec(e);if(t){var r=t[2];if(null!==(o=r)&&void 0!==o&&o.startsWith("(")&&(r=r.slice(1)),null!==(s=r)&&void 0!==s&&s.startsWith("<anonymous>")){r=n;var i,o,s,a,u=void 0!==t[1]?t[1].slice(0,-1):e.slice(0,t.index).trim();null!==(a=u)&&void 0!==a&&a.startsWith("at")&&(u=u.slice(2).trim()),i="".concat(u," ").concat(r).trim()}else i=r}else i=e;return i});if(a){for(var u=0;u<a.length;u+=1)if(r(e)&&o===a[u]||i(e)&&a[u].startsWith(n))return!0}return!1}function getNativeRegexpTest(){var e=Object.getOwnPropertyDescriptor(RegExp.prototype,"test"),t=null==e?void 0:e.value;if(e&&"function"==typeof e.value)return t;throw Error("RegExp.prototype.test is not a function")}function toRegExp(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";if(""===e)return RegExp(".?");var t,n,r=e.lastIndexOf("/"),i=e.substring(r+1),o=e.substring(0,r+1),s=(t=o,n=i,t.startsWith("/")&&t.endsWith("/")&&!t.endsWith("\\\\/")&&function e(t){if(!t)return!1;try{return RegExp("",t),!0}catch(n){return!1}}(n)?n:"");return e.startsWith("/")&&e.endsWith("/")||s?RegExp((s?o:e).slice(1,-1),s):RegExp(e.replace(/\'/g, "\'").replace(/\\\\"/g,\'"\').replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&"))}setConstant("ytInitialPlayerResponse.playerAds","undefined"),setConstant("ytInitialPlayerResponse.adSlots","undefined"),setConstant("ytInitialPlayerResponse.playerConfig.ssapConfig","undefined"),setConstant("ytInitialPlayerResponse.streamingData.serverAbrStreamingUrl","undefined"),setConstant("ytInitialPlayerResponse.adPlacements","undefined"),setConstant("playerResponse.adPlacements","undefined");'
const trustedReplaceFetchResponseScriptString = 'function trustedReplaceFetchResponse(e="",t="",r=""){if("undefined"!=typeof fetch&&"undefined"!=typeof Proxy&&"undefined"!=typeof Response){if(""===e&&""!==t){console.log("Pattern argument should not be empty string");return}var n,a=""===e&&""===t,c=Request.prototype.clone,o=fetch,s=!1,i=function i(u,p,l){return(n=getFetchData(l,c),a)?(console.log("fetch( ".concat(objectToString(n)," )"),!0),Reflect.apply(u,p,l)):(s=matchRequestProps(r,n))?o.apply(null,l).then(function(r){return r.text().then(function(n){var a="*"===e?/(\\n|.)*/:toRegExp(e),c=n.replace(a,t),o=forgeResponse(r,c);return hit(),o}).catch(function(){var e=objectToString(n),t="Response body can\'t be converted to text: ".concat(e);return console.log(t),Reflect.apply(u,p,l)})}).catch(function(){return Reflect.apply(u,p,l)}):Reflect.apply(u,p,l)};fetch=new Proxy(fetch,{apply:i})}}function hit(){try{var e=console.log.bind(console),t=console.trace.bind(console);e("".concat(""," trusted replace fetch response trace start")),t&&t(),e("".concat(""," trace end"))}catch(r){}}function getFetchData(e,t){var r,n,a={},c=e[0];if(c instanceof Request){var o=t.call(c),s=getRequestData(o);r=s.url,n=s}else r=c,n=e[1];return a.url=r,n instanceof Object&&Object.keys(n).forEach(function(e){a[e]=n[e]}),a}function objectToString(e){return e&&"object"==typeof e?isEmptyObject(e)?"{}":Object.entries(e).map(function(e){var t=e[0],r=e[1],n=r;return r instanceof Object&&(n="{ ".concat(objectToString(r)," }")),"".concat(t,\':"\').concat(n,\'"\')}).join(" "):String(e)}function matchRequestProps(e,t){if(""===e||"*"===e)return!0;var r,n=parseMatchProps(e);if(isValidParsedData(n)){var a=getMatchPropsData(n);r=Object.keys(a).every(function(e){var r=a[e],n=t[e];return Object.prototype.hasOwnProperty.call(t,e)&&"string"==typeof n&&(null==r?void 0:r.test(n))})}else console.log("Invalid parameter: ".concat(e)),r=!1;return r}function forgeResponse(e,t){var r=e.bodyUsed,n=e.headers,a=e.ok,c=e.redirected,o=e.status,s=e.statusText,i=e.type,u=e.url,p=new Response(t,{status:o,statusText:s,headers:n});return Object.defineProperties(p,{url:{value:u},type:{value:i},ok:{value:a},bodyUsed:{value:r},redirected:{value:c}}),p}function toRegExp(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";if(""===e)return RegExp(".?");var t,r,n=e.lastIndexOf("/"),a=e.substring(n+1),c=e.substring(0,n+1),o=(t=c,r=a,t.startsWith("/")&&t.endsWith("/")&&!t.endsWith("\\\\/")&&function e(t){if(!t)return!1;try{return RegExp("",t),!0}catch(r){return!1}}(r)?r:"");return e.startsWith("/")&&e.endsWith("/")||o?RegExp((o?c:e).slice(1,-1),o):RegExp(e.replace(/\'/g, "\'").replace(/\\\\"/g,\'"\').replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&"))}function isValidStrPattern(e){var t,r=escapeRegExp(e);"/"===e[0]&&"/"===e[e.length-1]&&(r=e.slice(1,-1));try{t=RegExp(r),t=!0}catch(n){t=!1}return t}function escapeRegExp(e){return e.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&")}function isEmptyObject(e){return 0===Object.keys(e).length&&!e.prototype}function getRequestData(e){return Object.fromEntries(getRequestProps().map(function(t){var r=e[t];return[t,r]}))}function getRequestProps(){return["url","method","headers","body","credentials","cache","redirect","referrer","referrerPolicy","integrity","keepalive","signal","mode",]}function parseMatchProps(e){var t={};return e.split(" ").forEach(function(e){var r,n=e.indexOf(":"),a=e.slice(0,n);if(r=a,getRequestProps().includes(r)){var c=e.slice(n+1);t[a]=c}else t.url=e}),t}function isValidParsedData(e){return Object.values(e).every(function(e){return isValidStrPattern(e)})}function getMatchPropsData(e){var t={};return Object.keys(e).forEach(function(r){t[r]=toRegExp(e[r])}),t}trustedReplaceFetchResponse(\'/"adPlacements.*?([A-Z]"}|"}{2,4})}],/\',"","player?"),trustedReplaceFetchResponse(\'/"adSlots.*?}]}}],/\',"","player?"),trustedReplaceFetchResponse("/\\"adSlots.*?\\}\\}\\],\\"adBreakHeartbeatParams/", "\\"adBreakHeartbeatParams", "player?");'

const defaultPopupsConfig = {
  isAntiAdblockPopupEnabled: false,
  isUpdatePopupEnabled: false,
  isRateUsPopupEnabled: false,
  isOtherStreamingPopupEnabled: false,
  configurablePopup: {
    type: "mobile",
    isEnabled: false,
    doNotShowAgainMinutes: 120,
  },
};

const settings = {
  [ADS_KEY]: true,
  [ANNOTATIONS_KEY]: false,
  [YOUTUBE_AD_REGEX_KEY]: youtubeAdRegexesFallback,
  [AD_BLOCKING_SELECTORS_KEY]: adBlockingSelectorsFallback,
  [DAILYMOTION_AD_REGEX_KEY]: [],
  [DAILYMOTION_AD_BLOCKING_SELECTORS_KEY]: dailymotionAdBlockingSelectorsFallback,
  [POPUP_CONFIG_KEY]: defaultPopupsConfig,
};

const setToChromeStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

const getFromChromeStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}

const getActiveTab = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
      }

      const [tab] = tabs;
      resolve(tab);
    });
  });
}

const initializeAdditionalBlocking = async () => {
  const isAdditionalBlockingEnabled = await getFromChromeStorage(IS_ADDITIONAL_BLOCKING_ENABLED_KEY);

  if (isAdditionalBlockingEnabled) {
    settings[IS_ADDITIONAL_BLOCKING_ENABLED_KEY] = true;
  }
};

const setToStorageAndSettings = (fieldName, value) => {
  setToChromeStorage(fieldName, value);
  settings[fieldName] = value;
};

const fetchServerData = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/adregex?version=${chrome.runtime.getManifest().version}`
    );
    return await response.json();
  } catch (e) {
    console.log(e);
    return null;
  }
};

const updateSettingsFromServer = async () => {
  const response = await fetchServerData();
  if (!response) return;

  const {
    regexRules,
    adBlockingSelectors,
    popupConfig,
    dailymotionAdRegex,
    dailymotionAdBlockingSelectors,
  } = response;

  settings[POPUP_CONFIG_KEY] = popupConfig;
  setToStorageAndSettings(AD_BLOCKING_SELECTORS_KEY, adBlockingSelectors);
  setToStorageAndSettings(YOUTUBE_AD_REGEX_KEY, regexRules);
  setToStorageAndSettings(DAILYMOTION_AD_BLOCKING_SELECTORS_KEY, dailymotionAdBlockingSelectors);
  setToStorageAndSettings(DAILYMOTION_AD_REGEX_KEY, dailymotionAdRegex);
}

const setInstalledAtKey = async () => {
  const installedAt = await getFromChromeStorage(INSTALLED_AT_KEY);

  if (!installedAt) {
    await setToChromeStorage(INSTALLED_AT_KEY, Date.now());
  }
};

let assignedRuleIds = 1;

const deleteAllDynamicRules = async () => {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((r) => r.id);

  assignedRuleIds = 1;
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
  });
};

const makeUrlFilterRulesFromRegexesArray = (regexes, domain) => {
  return regexes.map((regex) => {
    const urlFilterRule = regex.replace("(", "*").replace(")", "*");

    return {
      action: {
        type: "block",
      },
      condition: {
        urlFilter: urlFilterRule,
        initiatorDomains: [domain],
      },
      id: assignedRuleIds++,
    };
  });
};

const addDynamicRulesFromRegexesArray = async (regexesArray = settings[YOUTUBE_AD_REGEX_KEY], domain = "youtube.com") => {
  const addRules = makeUrlFilterRulesFromRegexesArray(regexesArray, domain);
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules,
  });
};

const safeTabReload = async (tabId) => {
  try {
    await chrome.tabs.reload(tabId);
  } catch (e) {
    console.log(e);
  }
}

const storesChangesCallBack = async (data) => {
  const YOUTUBE_REGEX = /^https?:\/\/(\w*.)?youtube.com/i;
  const DAILY_MOTION_REGEX = /^https?:\/\/(\w*.)?dailymotion.com/i;

  for (const [key, { newValue }] of Object.entries(data)) {
    if ([ADS_KEY, ANNOTATIONS_KEY].includes(key)) {
      settings[key] = newValue;
    }

    if (key === ADS_KEY) {
      newValue ? await addDynamicRulesFromRegexesArray() : await deleteAllDynamicRules();
      const activeTab = await getActiveTab();

      if (activeTab) {
        const isNeedReloadTab =
          YOUTUBE_REGEX.test(activeTab.url) || (settings[IS_ADDITIONAL_BLOCKING_ENABLED_KEY] && DAILY_MOTION_REGEX.test(activeTab.url));
        isNeedReloadTab && await safeTabReload(activeTab.id);
      }
    }

    if (key === IS_ADDITIONAL_BLOCKING_ENABLED_KEY) {
      if (newValue) {
        addDynamicRulesFromRegexesArray(settings[DAILYMOTION_AD_REGEX_KEY], "dailymotion.com");
      }
    }
  }
}

const onMessageCallback = ({ action, href, message }, { tab }, sendResponse) => {
  if (action === "PAGE_READY") {
    const { id } = tab;
    if (settings[ADS_KEY]) {
      const script = setConstantScriptString + trustedReplaceFetchResponseScriptString;
      executeScriptOnPage(id, script);
    }

    const response = {
      enabled: settings[ADS_KEY],
      adBlockSelectors: settings[AD_BLOCKING_SELECTORS_KEY],
      isAdditionalBlockingEnabled: settings[IS_ADDITIONAL_BLOCKING_ENABLED_KEY],
      dailymotionAdBlockingSelectors: settings[DAILYMOTION_AD_BLOCKING_SELECTORS_KEY],
      popupConfig: settings[POPUP_CONFIG_KEY],
    };

    sendResponse(response);
  } else if (action === "ENABLE_ADDITIONAL_BLOCKING") {
    setToStorageAndSettings(IS_ADDITIONAL_BLOCKING_ENABLED_KEY, true);
    sendResponse(true);
  }
}

const initializeSettings = async () => {
  for (const key of Object.keys(settings)) {
    const dataFromStorage = await getFromChromeStorage(key);
    if (dataFromStorage !== undefined) {
      settings[key] = dataFromStorage;
    }
  }
}

const init = async () => {
  await deleteAllDynamicRules();
  await initializeSettings();

  await setInstalledAtKey();
  await initializeAdditionalBlocking();
  await updateSettingsFromServer();

  if (settings[ADS_KEY]) {
    await addDynamicRulesFromRegexesArray();

    if (settings[IS_ADDITIONAL_BLOCKING_ENABLED_KEY]) {
      await addDynamicRulesFromRegexesArray(settings[DAILYMOTION_AD_REGEX_KEY], "dailymotion.com");
    }
  }

  if (settings[ANNOTATIONS_KEY]) {
    await addDynamicRulesFromRegexesArray(youtubeAnnotationsRegexes);
  }

  // Sync setting changes from other conext parts of the extension
  chrome.storage.onChanged.addListener(storesChangesCallBack);

  chrome.runtime.onMessage.addListener(onMessageCallback);
};
init();

const details = chrome.runtime.getManifest();

const installUrl = `https://get.adblock-for-youtube.com/install?v=${details.version}&xtid=${chrome.runtime.id}`;
const uninstallUrl = `https://get.adblock-for-youtube.com/uninstall?v=${details.version}&xtid=${chrome.runtime.id}`;

chrome.runtime.setUninstallURL(uninstallUrl);

chrome.runtime.onInstalled.addListener(({ reason }, previousVersion) => {
  if (reason === "install") {
    // Initially set settings
    setToStorageAndSettings(ADS_KEY, true);
    setToStorageAndSettings(ANNOTATIONS_KEY, false);
    chrome.tabs.create({ url: installUrl });
  }

  if (reason === "update") {
    setToStorageAndSettings(ADS_KEY, true);
    setToStorageAndSettings(ANNOTATIONS_KEY, false);

    chrome.storage.local.remove([UPDATE_POPUP_RESTRICTION_KEY], () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
      }
    });
  }
});

function injectedFunction(script, scriptId) {
  if (window[scriptId]) return;

  const policy = trustedTypes.createPolicy('default', {
    createScript: (input) => input,
  });

  const safeScriptContent = policy.createScript(script);

  window[scriptId] = true;
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('type', 'text/javascript');
  scriptTag.textContent = safeScriptContent;
  const parent = document.head || document.documentElement;
  parent.appendChild(scriptTag);
  parent.removeChild(scriptTag);
}

async function executeScriptOnPage(tabId, script) {
  const injectionString = `(()=>{try {${script};} catch (e) {console.log(e)}})();`;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: injectedFunction,
      injectImmediately: true,
      world: 'MAIN',
      args: [injectionString, 'aby-38oj8EJVO3Uu7t4G9PdfI'],
    });
  } catch (e) {
    console.log(`Error to execute script on tab ${tabId}: `, chrome.runtime.lastError, e);
  }
}

// reload every 24h to calculate DAU
setTimeout(async function () {
  await chrome.runtime.reload();
}, 86400 * 1000);

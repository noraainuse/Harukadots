var url_matches = [
	"/themes"
];

function verifyPath(matches) {
	var path = window.location.pathname;
	for (let match of matches) {
		var match_regex = new RegExp(`^${match.replace(/\*/g, ".*")}$`);
		var path_match = path.match(match_regex);
		if (path_match?.index == 0) {
			return true;
		} else {
			var path_split = path.split("/");
			if (path_split.length < 2) continue;
			try {
				if (Intl.getCanonicalLocales(path_split[1]).length > 0) {
					locale_subpath = "/" + path_split.slice(2).join("/");
					path_match = locale_subpath.match(match_regex);
					if (path_match?.index == 0) {
						return true;
					}
				}
			} catch (_) {
				continue;
			}
		}
	}
	return false;
}

//Make sure we're on the right page here, factoring in locale subpaths (Ex: "/en-us/"). 
//The content script matches defined in manifest.json should mostly handle this, but this is accounts for edge cases.
//In RoPro v2.0 this will be an ES6 imported module function.
if (!verifyPath(url_matches)) throw new Error('RoPro Error: Invalid path!');

var wishlistHTML = `<div style="position:relative;" class="container-header content">
      <h1>RoPro ${chrome.i18n.getMessage("TradeOffers")} <img class="offers-icon-big" style="height:30px;margin-bottom:5px;margin-left:5px;" src="${chrome.runtime.getURL('/images/offers_icon.svg')}"></h1>
	  <button id="createOfferButton" type="button" class="btn-fixed-width-lg btn-growth-lg" style="margin-top:-40px;background-color:#0084dd;border:0px;font-size:18px;padding:5px;float:right;">${chrome.i18n.getMessage("CreateOffer")}</button>
	  <button id="refreshOffers" type="button" class="btn-fixed-width-lg btn-growth-lg" style="margin-right:200px;margin-top:-40px;background-color:lime green;border:0px;font-size:18px;padding:5px;float:right;">Refresh Offers</button>
	  <span id="offersLoading" style="width: 100px; height: 15px; float:right;display:none;position:absolute;top:14px;right:380px;" class="spinner spinner-default"></span>
	</div>
   <resellers-pane class="ng-isolate-scope">
		<ul style="border:none;" id="wishlistOffers" class="vlist">
			
		</ul>
		<div id="seemore_wishlist" style="display:none;" class="ajax-comments-more-button-container" itemid="387256603" page="0">
                <button type="button" style="width:1100px;" class="btn-control-sm rbx-comments-see-more">${chrome.i18n.getMessage("SeeMore")}</button>
            </div>
   </resellers-pane>`

var myTheme = null

var theme = "dark"
if ($('.light-theme').length > 0) {
	var theme = "light"
}

var profileThemeBoxHTML = `<div style="margin-top:4px;margin-left:15px;margin-bottom:15px;">
<h1 style="display:inline-block;" class="ng-binding">RoPro Themes</h1>
<h7 style="display:block;margin-top:-10px;">${chrome.i18n.getMessage("OtherRoproUsersWillSeeYourThemeWhenTheyVisitYourProfile")}</h7>
<button id="saveTheme" type="button" class="btn-fixed-width-lg btn-growth-lg" style="background-color:#0084dd;border:0px;font-size:18px;padding:5px;margin-top:-40px;float:right;margin-right:10px;">${chrome.i18n.getMessage("RemoveTheme")}</button>
</div><div class="section-content"><p id="themeResponseText"></p>

<div class="content theme-color" style="width:100%;float:left;margin-top:0px;height:auto;padding:20px;padding-bottom:0px;border-radius:10px;border-bottom-left-radius:0px;border-bottom-right-radius:0px;"><h3 style="margin-bottom:-10px;">Default Themes</h3><h7 id="defaultThemesSubtitle" style="font-size:14px;margin-top:-10px;display:none;"></h7><br><br></div><div class="content theme-color" style="width:100%;height:240px;float:left;padding:0px;padding-bottom:20px;padding-left:0px;border-radius-top:0px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;position:relative;" id="roproThemeContainer">
<div id="themesLeftArrow" class="ropro-theme-arrow" style="position:absolute;top:95px;left:25px;"><img src="${chrome.runtime.getURL('/images/left_arrow.svg')}"></div><div class="ropro-theme-arrow" id="themesRightArrow" style="position:absolute;top:95px;right:25px;"><img src="${chrome.runtime.getURL('/images/right_arrow.svg')}"></div><span style="display: inline-block; width: 200px; height: 25px; visibility: initial !important;margin-top:95px;margin-left:calc(50% - 100px);" class="spinner spinner-default" id="profileThemesLoader"></span><div style="position:relative;width:auto;height:240px;margin:auto;padding:auto;white-space:nowrap;overflow-x:hidden;padding-top:10px;"><div id="profileThemeCardBox" style="position:absolute;left:0px;top:0px;padding-top:10px;"></div></div></div><br>

<div class="content theme-color" style="width:100%;float:left;margin-top:20px;height:auto;padding:20px;padding-bottom:0px;border-radius:10px;border-bottom-left-radius:0px;border-bottom-right-radius:0px;"><h3 style="margin-bottom:-10px;">Animated Themes <img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:20px;margin:0px;margin-right:5px;margin-top:-3px;"></h3><h7 style="font-size:14px;margin-top:-10px;">Officially licensed video themes. Toggle between 4K & HD. Hover to see a preview.</h7><li id="video-upgrade-button" style="float:right;background-color:#0084DD;border:none;border-radius:10px;"><a href="https://ropro.io/upgrade?ref=video" target="_blank" class="btn-growth-md btn-secondary-md" style="border:none;color:white;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:25px;margin:-5px;margin-right:5px;margin-top:-7px;">Upgrade to Plus</a></li><br><br></div><div class="content theme-color" style="width:100%;height:310px;float:left;padding:0px;padding-bottom:20px;padding-left:0px;border-radius-top:0px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;position:relative;" id="roproVideoThemeContainer">
<div id="videoThemesLeftArrow" class="ropro-theme-arrow" style="position:absolute;top:95px;left:25px;"><img src="${chrome.runtime.getURL('/images/left_arrow.svg')}"></div><div class="ropro-theme-arrow" id="videoThemesRightArrow" style="position:absolute;top:95px;right:25px;"><img src="${chrome.runtime.getURL('/images/right_arrow.svg')}"></div><span style="display: inline-block; width: 200px; height: 25px; visibility: initial !important;margin-top:95px;margin-left:calc(50% - 100px);" class="spinner spinner-default" id="videoThemesLoader"></span><div style="position:relative;width:auto;height:310px;margin:auto;padding:auto;white-space:nowrap;overflow-x:hidden;padding-top:10px;"><div id="videoThemeCardBox" style="position:absolute;left:0px;top:0px;padding-top:10px;"></div></div></div><br>

<br><div class="content theme-color" style="width:100%;float:left;margin-top:20px;margin-bottom:20px;padding:20px;border-radius:10px;display:none;"><h3 style="margin-top:5px;margin-bottom:-10px;">Custom Profile Themes<div style="display:inline-block;font-size:10px;vertical-align:top;margin-top:2px;margin-left:3px;"> BETA</div></h3><h7 style="font-size:14px;margin-top:-10px;">Use Roblox decals to create custom profile themes. </h7><p style="font-size:11px;margin-top:5px;">• Scaling, repetition, and background color are fully customizable.<br>• Other RoPro users will see your custom theme when they visit your profile. <br>• Any Roblox decal you use for a theme must be publicly available and not violate the <a href="https://roblox.com/info/terms"><u>Roblox</u></a> or <a href="https://ropro.io/terms/"><u>RoPro</u></a> Terms of Service. <br>• Equipping a Roblox decal which violates the <a href="https://en.help.roblox.com/hc/en-us/articles/203313410-Roblox-Community-Standards"><u>Roblox Community Standards</u></a> will result in a suspension or ban from using RoPro Custom Themes. <br>• You can report profile themes to RoPro moderation by clicking 'Report Profile Theme' next to the Report Abuse button.</p><br>
<div style="position:relative;height:auto;"><div id="customThemeOuter" class="import-decal-outer" style="padding:0px;padding-left:0px;padding-right:0px;width:auto;margin-left:0px;margin-top:-10px;overflow:hidden;">
<div style="margin-top:-10px;margin-bottom:10px;height:240px;min-height:110px;position:relative;" id="customThemeBox">
	<div style="height:200px;width:920px;transform:scale(0.7);float:left;margin-left:-100px;margin-right:-320px;padding-right:-50px;"><div id="decalScrollLeft" style="display:block;transform:scale(0.8);margin-top:-20px;" class="scroller prev disabled" role="button" aria-hidden="true"><div class="arrow"><span class="icon-games-carousel-left"></span></div></div><div id="decalSearchResults" style="width:900px;height:200px;"><span style="transform:scale(1.25);display: inline-block; width: 200px; height: 25px; visibility: initial !important;margin:auto;margin-left:220px;margin-top:65px;" id="customThemeLoader" class="spinner spinner-default"></span></div><div id="decalScrollRight" style="transform:scale(0.8);margin-top:-20px;left:650px;" class="scroller next disabled" role="button" aria-hidden="true"><div class="arrow"><span class="icon-games-carousel-right"></span></div></div><input id="decalSearch" style="width:650px;height:auto;" class="form-control input-field" placeholder="Search decal name or directly enter a decal's Roblox ID..." value=""><div style="margin-top:5px;margin-left:5px;"><a target="_blank" href="https://www.roblox.com/develop/library?CatalogContext=2&amp;SortAggregation=5&amp;LegendExpanded=true&amp;Category=8"><b>+ Find More Decal IDs</b></a><a style="margin-left:15px;" target="_blank" href="https://www.roblox.com/develop?View=13"><b>+ Upload Decals</b></a></div></div><div style="height:200px;width:360px;margin-top:20px;;float:right;border-left: 2px solid #656668;padding:20px;"><div style="display:inline-block;float:left;"><div class="item-card-thumb-container">
	<thumbnail-2d class="item-card-thumb "><span style="width:100%; height:100%;" class="thumbnail-2d-container"> <img id="selectedDecal" class="ng-scope ng-isolate-scope" title="" alt="" style="background-color:#656668;" default-src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="></span> </thumbnail-2d>
</div><div id="selectedDecalName" style="font-size:12px;font-weight:bold;text-align:center;width:126px;">Resolution: <br>256 x 256</div></div><div style="float:right;"><div style="font-size:12px;margin-left:5px;">Decal Width (%):
</div><input id="percentFill" placeholder="Width (%)" class="form-control input-field" style="font-size:10px;" type="number" value=10 max="100" min="1"><div style="font-size:12px;margin-left:5px;margin-top:5px;">Background Color:
<br></div>
<input id="colorHex" placeholder="Color Hex (#FFFFF)" class="form-control input-field" style="font-size:10px;"><a target="_blank" href="https://htmlcolorcodes.com"><img style="position:absolute;width:20px;right:-2px;margin-top:-26px;" src="${chrome.runtime.getURL('/images/info_icon.png')}"></a>
<div style="margin-left:5px;font-size:12px;margin-top:5px;" class="checkbox">
	<input id="repeatDecal" checked="true" type="checkbox">
	<label for="repeatDecal"> Repeat Decal</label>
</div>
</div>
</div>
</div>
</div>
<li class="rbx-upgrade-now" id="customThemeCTA" style="width:400px;text-align:center;display:none;z-index:10000!important;position:absolute;top:80px;left:calc(50% - 200px);"><span style="font-weight:bold;font-size:18px;margin-right:5px;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:40px;margin-top:-3px;margin-right:5px;">RoPro Plus Feature</span><br><a style="margin-left:0px;width:150px;margin-top:15px;" target="_blank" href="https://ropro.io/?upgrade" class="btn-growth-md btn-secondary-md" id="upgrade-now-button">Upgrade RoPro</a></li>
</div>
</div>
<div class="content theme-color" style="width: 48.5%; float: left; margin-top: 20px; height: auto; margin-bottom: 0px; padding: 20px 20px 10px; border-radius: 10px; padding-bottom: 38px;"><h3 style="margin-bottom:-10px;">Foreground Opacity</h3><div style="height:70px;margin:auto;width:100%;text-align:center;margin-bottom:15px;"><input id="foregroundOpacitySlider" type="range" oninput="this.parentNode.childNodes[1].innerText = this.value + '%'" step="5" min="30" max="100" value="100" style="margin-top:20px;margin-left:10px;margin-right:20px;display:block;width:calc(100% - 140px);display:inline-block;float:left;"><div style="font-weight:500;font-size:20px;background-color:#191B1D;padding:10px;border-radius:10px;display:block;width:100px;margin-top:17px;display:inline-block;float:left;color:white;">100%</div></div>
</div>
<div class="content theme-color" id="backdropBlurSection" style="width: 48.5%; float: left; margin-top: 20px; height: auto; margin-bottom: 0px; padding: 20px 20px 10px; border-radius: 10px; margin-left: 3%;"><h3 style="margin-bottom:-10px;margin-left:3%;">Backdrop Blur</h3><div style="height:70px;margin:auto;width:100%;text-align:center;margin-bottom:15px;"><input id="backdropBlurSlider" type="range" oninput="this.parentNode.childNodes[1].innerText = this.value + ' px'" step="1" min="0" max="15" value="0" style="margin-top:20px;margin-left:10px;margin-right:20px;display:block;width:calc(100% - 140px);display:inline-block;float:left;"><div style="font-weight:500;font-size:20px;background-color:#191B1D;padding:10px;border-radius:10px;display:block;width:100px;margin-top:17px;display:inline-block;float:left;color:white;">0 px</div></div><div style="display:inline-block;float:right;"><span class="icon-status-alert" style="transform:scale(0.8);"></span><b style="font-size:13px;"> Blur may cause lag on lower end devices.</b></div>
</div>
<div class="content theme-color" style="width: 100%; float: left; margin-top: 20px; height: auto; margin-bottom: 10px; padding: 20px 20px 10px; border-radius: 10px;" id="hslUpsell"><h3 style="margin-bottom:-10px;">Theme Color Adjustments<div style="display:inline-block;font-size:10px;vertical-align:top;margin-top:2px;margin-left:3px;"></div></h3><h7 style="font-size:14px;margin-top:-10px;">Adjust the hue (color), saturation, and lightness of your theme.</h7><li style="float:right;background-color:#0084DD;border:none;border-radius:10px;margin-top:-10px;"><a href="https://ropro.io/upgrade?ref=hsl" target="_blank" class="btn-growth-md btn-secondary-md" style="border:none;color:white;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:25px;margin:-5px;margin-right:5px;margin-top:-7px;">Upgrade to Plus</a></li>
<br><br></div>
<div class="content theme-color" style="width:100%;float:left;margin-top:20px;height:auto;margin-bottom:10px;padding:20px;border-radius:10px;padding-bottom:10px;"><h3 style="margin-bottom:-10px;">Global Theme<div style="display:inline-block;font-size:10px;vertical-align:top;margin-top:2px;margin-left:3px;"></div></h3><h7 style="font-size:14px;margin-top:-10px;">Display your theme across all Roblox pages. If disabled, your theme will only appear on your profile.</h7>
<button style="float:right;transform:scale(1.2);margin-right:5px;margin-top:-5px;border-radius:7px;" id="global-themes-toggle" class="ropro-toggle btn-toggle">
<span class="toggle-flip" style="border-radius:7px;"></span>
<span id="toggle-on" class="toggle-on"></span>
<span id="toggle-off" class="toggle-off"></span>
</button><br><br></div>
</div>
</div>`

var flagButtonHTML = `<li class="ropro-theme-element" style="display:inline-block;cursor:pointer;width:150px;height:200px;background-color:#009DE1;border-radius:20px;padding:0px;margin-left:10px;margin-right:10px;border:5px solid white;posittion:relative;background-color:#232527;">
<h1 style="color:white;position:absolute;top:50px;left:24px;">Flags<br>&nbsp;&nbsp;🏳️</h1><img style="width:100%;height:100%;border-radius:10px;" src="${chrome.runtime.getURL('/images/empty.png')}">
</li>`

var ropro_themes = null
var profileThemeName = null
var themeDivs = []
var decalDivs = []
var colorAdjustments = {h: 0, s: 1, l: 1}

function fetchThemes() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getDefaultThemes.php"},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchThemesV2() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getThemesV2.json?1"},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchVideoThemesV2() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getVideoThemesV2.json"},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchTheme(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getProfileTheme.php?userid=" + userID}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchSetting(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSetting", setting: setting}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchDecals(keyword) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://search.roblox.com/catalog/json?CatalogContext=2&Subcategory=8&Keyword=" + keyword + "&SortAggregation=5&PageNumber=1&LegendExpanded=true&Category=8"}, 
			function(data) {
				resolve(data)
			}
		)
	})
} 

function fetchDecalImageId(decalId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getDecalImage.php?id=" + decalId}, 
			function(data) {
				resolve(data)
			}
		)
	})
} 

function updateGlobalTheme() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "UpdateGlobalTheme"}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function saveTheme(userID, themeName, version = 1) {
	colorAdjusted = colorAdjustments['h'] != 0 || colorAdjustments['s'] != 1 || colorAdjustments['l'] != 1
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/saveProfileTheme.php?userid=" + userID + "&themename=" + themeName + "&version=" + version + (colorAdjusted ? "&h=" + parseInt(colorAdjustments['h']) + "&s=" + parseFloat(colorAdjustments['s']) + "&l=" + parseFloat(colorAdjustments['l']) : "")},
			function(data) {
				resolve(data)
			}
		)
	})
}

function getUserId() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetUserID"}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

function checkVerification() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "CheckVerification"}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
}

function addCard(theme) {
	profileThemeCardHTML = `<div themejson='${encodeURI(JSON.stringify(theme))}' style="display:inline-block;width:48px;height:48px;margin:2px;margin-left:5px;margin-right:5px;margin-bottom:5px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
<img class="item-card-thumb-container" style="width:100%;height:100%;" src="${stripTags(theme['thumbnail'])}">
<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
</a></div>`
	div = document.createElement('div')
	div.innerHTML += profileThemeCardHTML
	if ('animated' in theme) {
		// Animated themes removed.
		return
	} else {
		profileThemeCardBox = document.getElementById('profileThemeCardBox')
		themeDivs.push(div)
		if (themeDivs.length > 151) {
			div.style.display = "none"
		}
	}
	profileThemeCardBox.appendChild(div)
	$(div).click(function(){
		theme = JSON.parse(decodeURI(this.getElementsByClassName('thumbnail-2d-container')[0].getAttribute('themejson')))
		console.log(theme)
		addTheme(theme)
	})
}

async function doThemeResponse(response){
	responseElement = document.getElementById('themeResponseText')
	responseElement.style.marginBottom = "10px"
	if (response == "ERROR: NOT SUBSCRIBED") {
		responseElement.innerHTML = 'Error: Animated themes are only available for subscribers. <a style="display:inline-block;" class="btn-primary-md ng-binding" target="_blank" href="https://ropro.io#plus">Upgrade</a>'
	} else if(response == "SUCCESSFULLY REMOVED") {
		responseElement.innerHTML = 'Successfully removed profile theme. Other users will not see a theme on your profile!'
		await setStorage("globalTheme", "")
	} else if(response == "SUCCESS") {
		responseElement.innerHTML = 'Successfully updated profile theme. Other users will be able to see your theme now!'
		var myId = await getStorage('rpUserID')
		if (typeof myId != "undefined" && await getStorage('globalThemesToggle')) {
			data = await fetchTheme(parseInt(myId))
			if (data.theme != null) {
				await setStorage("globalTheme", data.theme)
			}
		}
	} else if(response.startsWith("ERROR_INFO: ")) {
		responseText = response.replace("ERROR_INFO: ", "")
		responseElement.innerHTML = stripTags(responseText)
	} else {
		responseElement.innerHTML = 'Error: Unknown error, please try again later.'
	}
}

async function addThemeBox() {
	var content = document.getElementsByClassName('content')[0]
	content.innerHTML += profileThemeBoxHTML
	if (document.getElementById('roproThemeFrame') != null && document.getElementById('roproThemeFrame').getAttribute('h') != null) {
		colorAdjustments['h'] = parseInt(document.getElementById('roproThemeFrame').getAttribute('h'))
		colorAdjustments['s'] = parseInt(document.getElementById('roproThemeFrame').getAttribute('s'))
		colorAdjustments['l'] = parseInt(document.getElementById('roproThemeFrame').getAttribute('l'))
	}
	if (await fetchSetting("animatedProfileThemes")) {
		document.getElementById('video-upgrade-button').style = "float:right;border:none;border-radius:10px;"
		document.getElementById('video-upgrade-button').innerHTML = `<div style="float:right;margin-left:5px;font-size:20px;margin-top:-7px;margin-right:35px;font-weight:bold;">4K</div><button style="float:right;transform:scale(1.2);margin-right:5px;margin-top:-5px;border-radius:7px;" id="video-theme-toggle" class="ropro-video-toggle btn-toggle">
		<span class="toggle-flip" style="border-radius:7px;"></span>
		<span id="toggle-on" class="toggle-on"></span>
		<span id="toggle-off" class="toggle-off"></span>
		</button><div style="float:right;margin-right:10px;font-size:20px;margin-top:-7px;font-weight:bold;">HD</div><br><p style="float:right;font-size:10px;margin-right:0px;text-align:center;"> 4K will cause lag on some devices,<br>HD video themes are recommended;<br>other users will see your theme in HD</p>`
		if (document.getElementById('roproThemeFrame') != null && document.getElementById('roproThemeFrame').getAttribute('src').includes('_4K.mp4')) {
			document.getElementById('video-theme-toggle').setAttribute('class', 'ropro-video-toggle btn-toggle on')
		}
		$('.ropro-video-toggle').click(function() {
			if (document.getElementById('roproThemeFrame').getAttribute('src').includes('_4K.mp4')) {
				setTimeout(function() {
					document.getElementById('video-theme-toggle').setAttribute('class', 'ropro-video-toggle btn-toggle')
				}, 100)
				document.getElementById('roproThemeFrame').setAttribute('src', document.getElementById('roproThemeFrame').getAttribute('src').replace('_4K.mp4', '_HD.mp4'))
				document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
			} else if (document.getElementById('roproThemeFrame').getAttribute('src').includes('_HD.mp4')) {
				setTimeout(function() {
					document.getElementById('video-theme-toggle').setAttribute('class', 'ropro-video-toggle btn-toggle on')
				}, 100)
				document.getElementById('roproThemeFrame').setAttribute('src', document.getElementById('roproThemeFrame').getAttribute('src').replace('_HD.mp4', '_4K.mp4'))
				document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
			}
		})	
	}
	document.getElementById('saveTheme').addEventListener("click", async function(){
		if (await checkVerification()) {
			if (this.innerHTML == chrome.i18n.getMessage("SaveTheme")) {
				if (myTheme != null && myTheme.hasOwnProperty('version') && myTheme['version'] == 2) {
					var themeName = myTheme['name'].replace("_HD.mp4", ".mp4").replace("_4K.mp4", ".mp4")
					if (themeName.endsWith('.mp4')) {
						if (document.getElementById('video-theme-toggle').classList.contains('on')) {
							themeName = themeName.replace('.mp4', '_4K.mp4')
						} else {
							themeName = themeName.replace('.mp4', '_HD.mp4')
						}
					}
					userID = await getStorage("rpUserID")
					response = await saveTheme(userID, themeName, 2)
					doThemeResponse(response)
					this.innerHTML = chrome.i18n.getMessage("RemoveTheme")
					if (await fetchSetting('globalThemes')) {
						updateGlobalTheme()
					}
				} else {
					document.getElementById('themeResponseText').innerHTML = ""
					userID = await getStorage("rpUserID")
					response = await saveTheme(userID, profileThemeName, 2)
					doThemeResponse(response)
					this.innerHTML = chrome.i18n.getMessage("RemoveTheme")
					if (await fetchSetting('globalThemes')) {
						updateGlobalTheme()
					}
				}
				setStorage("foregroundOpacity", parseInt(document.getElementById('foregroundOpacitySlider').value) / 100)
				setStorage("backdropBlur", parseInt(document.getElementById('backdropBlurSlider').value))
				setStorage("colorAdjustments", colorAdjustments)
			} else {
				userID = await getStorage("rpUserID")
				response = await saveTheme(userID, "remove")
				doThemeResponse(response)
				document.getElementById('container-main').style.backgroundImage = ""
				document.getElementById('container-main').style.backgroundColor = ""
				if (document.getElementById('roproThemeFrame') != null) {
					document.getElementById('roproThemeFrame').remove()
				}
			}
		} else {
			alert("You must verify your user with RoPro at roblox.com/home before updating your theme.")
		}
	})
	if (await fetchSetting('themeColorAdjustments')) {
		addColorAdjustments()
	}
	setTimeout(async function() {
		if (await fetchSetting('globalThemes')) {
			document.getElementById('global-themes-toggle').classList.add('on')
		}
		document.getElementById('global-themes-toggle').addEventListener('click', async function() {
			if (await fetchSetting('globalThemes')) {
				document.getElementById('global-themes-toggle').setAttribute('class', 'ropro-toggle btn-toggle')
				settings = await getStorage("rpSettings")
				settings["globalThemes"] = false
				console.log(settings)
				setStorage("rpSettings", settings)
			} else {
				document.getElementById('global-themes-toggle').setAttribute('class', 'ropro-toggle btn-toggle on')
				settings = await getStorage("rpSettings")
				settings["globalThemes"] = true
				console.log(settings)
				setStorage("rpSettings", settings)
				updateGlobalTheme()
			}	
		})
	}, 100)
	document.getElementById('foregroundOpacitySlider').addEventListener('input', function() {
		opacity = parseInt(this.value) / 100
		setForegroundOpacity(opacity)
		document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
	})
	var foregroundOpacity = await getStorage('foregroundOpacity')
	if (typeof foregroundOpacity != 'undefined') {
		document.getElementById('foregroundOpacitySlider').value = parseInt(parseFloat(foregroundOpacity) * 100)
		document.getElementById('foregroundOpacitySlider').parentNode.childNodes[1].innerText = parseInt(parseFloat(foregroundOpacity) * 100) + '%'
		setForegroundOpacity(parseFloat(foregroundOpacity))
	}
	document.getElementById('backdropBlurSlider').addEventListener('input', function() {
		pixels = parseInt(this.value)
		setBackdropBlur(pixels)
		document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
	})
	var backdropBlur = await getStorage('backdropBlur')
	if (typeof backdropBlur != 'undefined') {
		document.getElementById('backdropBlurSlider').value = parseInt(backdropBlur)
		document.getElementById('backdropBlurSlider').parentNode.childNodes[1].innerText = parseInt(backdropBlur) + ' px'
		setBackdropBlur(parseInt(backdropBlur))
	}
}

function addTheme(theme) {
	if (theme.hasOwnProperty('version') && theme['version'] == 2) {
		myTheme = theme
		if (document.getElementById('roproThemeFrame') == null) {
			var div = document.createElement('div')
			if (theme['name'].endsWith('.mp4')) {
				themeFrame = `<iframe id="roproThemeFrame" src="https://api.ropro.io/themeFrameVideo.php?theme=${document.getElementById('video-theme-toggle').classList.contains('on') ? stripTags(theme['name']).replace(".mp4", "_4K.mp4") : stripTags(theme['name']).replace(".mp4", "_HD.mp4")}" frameborder="0" style="top:0;left:0;position:absolute;border:0;width:100%;height:100%;z-index:-1;"></iframe>`
			} else {
				themeFrame = `<iframe id="roproThemeFrame" src="https://api.ropro.io/themeFrame.php?theme=${stripTags(theme['name'])}" frameborder="0" style="top:0;left:0;position:absolute;border:0;width:100%;height:100%;z-index:-1;"></iframe>`
			}
			div.innerHTML = themeFrame
			document.getElementById('container-main').appendChild(div.childNodes[0])
		} else {
			if (theme['name'].endsWith('.mp4')) {
				document.getElementById('roproThemeFrame').src = `https://api.ropro.io/themeFrameVideo.php?theme=${document.getElementById('video-theme-toggle').classList.contains('on') ? stripTags(theme['name']).replace(".mp4", "_4K.mp4") : stripTags(theme['name']).replace(".mp4", "_HD.mp4")}`
			} else {
				document.getElementById('roproThemeFrame').src = `https://api.ropro.io/themeFrame.php?theme=${stripTags(theme['name'])}`
			}
		}
		mainContainer = document.getElementById('container-main')
		profileContainer = document.getElementsByClassName('content')[0]
		profileContainer.style.padding = "20px"
		profileContainer.style.paddingTop = "10px"
		mainContainer.style.borderRadius = "20px"
		mainContainer.style.padding = "20px"
		document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
		if (document.getElementById('accoutrements-slider') != null) {
			document.getElementById('accoutrements-slider').setAttribute('style', 'width:470px;transform:scale(0.95);margin-left:-7px;')
		}
		contentContainer = document.getElementsByClassName('content')
		contentContainer = contentContainer[0]
		contentContainer.style.borderRadius = "10px"
	} else {
		themeName = theme['name']
		profileThemeName = theme['name']
		if ('repeat' in theme){
			repeat = theme['repeat']
		} else {
			repeat = "repeat"
		}
		if ('width' in theme) {
			width = theme['width']
		} else {
			width = "100%"
		}
		if ('color' in theme) {
			color = theme['color']
		} else {
			color = ""
		}
		themeImages = theme['images'].split(",")
		mainContainer = document.getElementById('container-main')
		profileContainer = document.getElementsByClassName('content')[0]
		profileContainer.style.padding = "20px"
		profileContainer.style.paddingTop = "10px"
		if (themeImages.length == 1) {
			mainContainer.style.backgroundImage = `url(${stripTags(themeImages[0])})`
			mainContainer.style.backgroundSize = width
		} else {
			mainContainer.style.backgroundImage = `url(${stripTags(themeImages[0])}), url(${stripTags(themeImages[1])})`
			mainContainer.style.backgroundPosition = "left top, right top"
			if (width == "100% 100%") {
				mainContainer.style.backgroundSize = "50% 100%"
			} else {
				mainContainer.style.backgroundSize = "50%"
			}
			if (repeat == "repeat") {
				repeat = "repeat-y"
			}
		}
		mainContainer.style.backgroundColor = color
		mainContainer.style.backgroundRepeat = repeat
		mainContainer.style.borderRadius = "20px"
		mainContainer.style.padding = "20px"
		document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
		if (document.getElementById('accoutrements-slider') != null) {
			document.getElementById('accoutrements-slider').setAttribute('style', 'width:470px;transform:scale(0.95);margin-left:-7px;')
		}
		contentContainer = document.getElementsByClassName('content')
		contentContainer = contentContainer[0]
		contentContainer.style.borderRadius = "10px"
	}
}

var curr_decal_page = 0

async function addDecals(keyword) {
	document.getElementById('decalSearchResults').innerHTML = `<span style="transform:scale(1.25);display: inline-block; width: 200px; height: 25px; visibility: initial !important;margin:auto;margin-left:220px;margin-top:65px;" class="spinner spinner-default"></span>`
	decalResults = await fetchDecals(keyword)
	console.log(decalResults)
	document.getElementById('decalSearchResults').innerHTML = ``
	curr_decal_page = 0
	decalDivs = []
	for (i = 0; i < decalResults.length; i++) {
		decal = decalResults[i]
		div = document.createElement('div')
		div.innerHTML = `<li class="item-card" style="float:left;height:200px;">
							<div style="display:inline-block;" class="item-card-container">
								<a decal-id="${parseInt(decal.AssetId)}" class="item-card-link">
									<div class="item-card-thumb-container">
										<thumbnail-2d class="item-card-thumb "><span style="width:100%; height:100%;" class="thumbnail-2d-container"> <img src="${stripTags(decal.ThumbnailUrl)}" class="ng-scope ng-isolate-scope" title="" alt=""></span> </thumbnail-2d>
									</div>
									<div class="text-overflow item-card-name">${stripTags(decal.Name)}</div>
								</a>	
							</div>
						</li>`
		decalDiv = div.childNodes[0]
		if (i >= 5) {
			if (i == 5) {
				document.getElementById('decalScrollRight').classList.remove('disabled')
			}
			decalDiv.style.display = "none"
		}
		document.getElementById('decalSearchResults').appendChild(decalDiv)
		decalDivs.push(decalDiv)
		decalDiv.getElementsByClassName('item-card-link')[0].addEventListener('click', async function() {
			decalId = parseInt(this.getAttribute('decal-id'))
			decalImageId = await fetchDecalImageId(decalId)
			if (isPositiveInteger(decalImageId)) {
				document.getElementById('selectedDecal').src = `https://assetdelivery.roblox.com/v1/asset?id=${parseInt(decalImageId)}`
				document.getElementById('selectedDecal').setAttribute('active', 'true')
				document.getElementById('selectedDecal').setAttribute('decal-id', parseInt(decalId))
				document.getElementById('selectedDecal').setAttribute('decal-image-id', parseInt(decalImageId))
			}
		})
	}
}

function isPositiveInteger(n) {
	return !isNaN(parseInt(n)) && parseInt(n).toString() == n
}

function isHex(hex) {
	hex = hex.replace("#", "")
	return typeof hex === 'string'
	&& hex.length === 6
	&& !isNaN(Number('0x' + hex))
}

var curr_theme_page = 0

async function loadThemes() {
	ropro_themes = await fetchThemes()
	themeDivs = []
	addThemeBox()
	for (i = 0; i < ropro_themes.length; i++){
		theme = ropro_themes[i]
		addCard(theme)
	}
	pager = document.createElement('div')
	pager.innerHTML = `<div class="theme-color" style="width:100%;float:left;margin-top:0px;height:auto;border-bottom-left-radius:10px;border-bottom-right-radius:10px;"><ul style="float:left;margin-left:calc(50% - 1151px/2);margin-top:10px;display:none;" class="pager" data-toggle="pager"><li id="roproThemePagerPrev" class="pager-prev disabled"><a href="#"><span class="icon-left"></span></a></li><li class="pager-cur"><span style="width:10px;" id="ropro-current-page">1</span></li><li class="pager-total"><span>of</span><a>${parseInt(Math.ceil(themeDivs.length / 151))}</a></li><li id="roproThemePagerNext" class="pager-next"><a href="#"><span class="icon-right"></span></a></li></ul></div>`
	document.getElementById('profileThemeCardBox').parentNode.insertBefore(pager.childNodes[0], document.getElementById('profileThemeCardBox').nextElementSibling)
	document.getElementById('roproThemePagerNext').addEventListener('click', function() {
		if (!(curr_theme_page * 151 + 151 > themeDivs.length)) {
			curr_theme_page++
			document.getElementById('roproThemePagerPrev').classList.remove('disabled')
			document.getElementById('ropro-current-page').innerText = parseInt(curr_theme_page + 1)
			if (curr_theme_page * 151 + 151 > themeDivs.length) {
				this.classList.add('disabled')
			}
			for (i = 0; i < themeDivs.length; i++) {
				themeDivs[i].style.display = "none"
			}
			for (i = curr_theme_page * 151; i < Math.min(curr_theme_page * 151 + 151, themeDivs.length); i++) {
				themeDivs[i].style.display = "block"
			}
		}
	})
	document.getElementById('roproThemePagerPrev').addEventListener('click', function() {
		if (curr_theme_page * 151 - 151 >= 0) {
			curr_theme_page--
			document.getElementById('roproThemePagerNext').classList.remove('disabled')
			document.getElementById('ropro-current-page').innerText = parseInt(curr_theme_page + 1)
			if (!(curr_theme_page * 151 - 151 >= 0)) {
				this.classList.add('disabled')
			}
			for (i = 0; i < themeDivs.length; i++) {
				themeDivs[i].style.display = "none"
			}
			for (i = curr_theme_page * 151; i < Math.min(curr_theme_page * 151 + 151, themeDivs.length); i++) {
				themeDivs[i].style.display = "block"
			}
		}
	})
	if (await fetchSetting('customProfileThemes')) {
		document.getElementById('customThemeOuter').style.filter = "initial"
		document.getElementById('customThemeOuter').style.backgroundColor = "initial"
		document.getElementById('customThemeBox').style.filter = "initial"
		document.getElementById('customThemeBox').style.pointerEvents = "initial"
		document.getElementById('customThemeCTA').remove()
		addDecals("tileable")
	} else {
		document.getElementById('customThemeLoader').remove()
	}
	$("#decalSearch").on('keyup', async function (e) {
		if (e.key === 'Enter' || e.keyCode === 13) {
			if (isPositiveInteger(this.value)) {
				decalImageId = await fetchDecalImageId(parseInt(this.value))
				if (isPositiveInteger(decalImageId)) {
					document.getElementById('selectedDecal').src = `https://assetdelivery.roblox.com/v1/asset?id=${parseInt(decalImageId)}`
					document.getElementById('selectedDecal').setAttribute('active', 'true')
					document.getElementById('selectedDecal').setAttribute('decal-id', parseInt(this.value))
					document.getElementById('selectedDecal').setAttribute('decal-image-id', parseInt(decalImageId))
				}
			} else {
				addDecals(stripTags(this.value))
			}
		}
	})
	document.getElementById('decalScrollRight').addEventListener('click', function() {
		if (!(curr_decal_page * 5 + 5 > decalDivs.length)) {
			curr_decal_page++
			document.getElementById('decalScrollLeft').classList.remove('disabled')
			if (curr_decal_page * 5 + 5 > decalDivs.length) {
				this.classList.add('disabled')
			}
			for (i = 0; i < decalDivs.length; i++) {
				decalDivs[i].style.display = "none"
			}
			for (i = curr_decal_page * 5; i < Math.min(curr_decal_page * 5 + 5, decalDivs.length); i++) {
				decalDivs[i].style.display = "block"
			}
		}
	})
	document.getElementById('decalScrollLeft').addEventListener('click', function() {
		if (curr_decal_page * 5 - 5 >= 0) {
			curr_decal_page--
			document.getElementById('decalScrollRight').classList.remove('disabled')
			if (!(curr_decal_page * 5 - 5 >= 0)) {
				this.classList.add('disabled')
			}
			for (i = 0; i < decalDivs.length; i++) {
				decalDivs[i].style.display = "none"
			}
			for (i = curr_decal_page * 5; i < Math.min(curr_decal_page * 5 + 5, decalDivs.length); i++) {
				decalDivs[i].style.display = "block"
			}
		}
	})
	document.getElementById('selectedDecal').addEventListener('load', function() {
		if (this.getAttribute('active') == 'true') {
			if (document.getElementById('percentFill').value > 25 && document.getElementById('selectedDecal').naturalWidth < 500) {
				document.getElementById('percentFill').value = 25
				alert("This decal is too low quality. To set the decal width more than 25% please use a decal that is at least 500 pixels wide.")
			}
			if (document.getElementById('percentFill').value > 50 && document.getElementById('selectedDecal').naturalWidth < 1000) {
				document.getElementById('percentFill').value = 50
				alert("This decal is too low quality. To set the decal width more than 50% please use a decal that is at least 1000 pixels wide.")
			}
			document.getElementById('container-main').style.backgroundImage = `url(https://assetdelivery.roblox.com/v1/asset?id=${parseInt(this.getAttribute('decal-image-id'))})`
			document.getElementById('container-main').style.backgroundRepeat = document.getElementById('repeatDecal').checked ? "repeat" : "no-repeat"
			document.getElementById('container-main').style.backgroundSize = isPositiveInteger(document.getElementById('percentFill').value.replace("%", "")) ? parseInt(document.getElementById('percentFill').value.replace("%", "")) + "%" : "10%"
			document.getElementById('container-main').style.backgroundColor = isHex(document.getElementById('colorHex').value) ? "#" + document.getElementById('colorHex').value.replace("#", "").substring(0, 6) : "transparent"
			document.getElementById('container-main').style.backgroundPosition = "top right"
			document.getElementById('selectedDecalName').innerText = "Resolution: \n" + document.getElementById('selectedDecal').naturalWidth + " x " + document.getElementById('selectedDecal').naturalHeight
		}
	})
	document.getElementById('percentFill').addEventListener('input', function() {
		this.value = parseInt(this.value)
		if (this.value > 100) {
			this.value = 100
		}
		if (this.value > 25 && document.getElementById('selectedDecal').naturalWidth < 500) {
			this.value = 25
			alert("This decal is too low quality. To set the decal width more than 25% please use a decal that is at least 500 pixels wide.")
		}
		if (this.value > 50 && document.getElementById('selectedDecal').naturalWidth < 1000) {
			this.value = 50
			alert("This decal is too low quality. To set the decal width more than 50% please use a decal that is at least 1000 pixels wide.")
		}
		document.getElementById('container-main').style.backgroundSize = isPositiveInteger(document.getElementById('percentFill').value.replace("%", "")) ? parseInt(document.getElementById('percentFill').value.replace("%", "")) + "%" : "10%"
	})
	document.getElementById('repeatDecal').addEventListener('click', function() {
		document.getElementById('container-main').style.backgroundRepeat = document.getElementById('repeatDecal').checked ? "repeat" : "no-repeat"
	})
	document.getElementById('colorHex').addEventListener('input', function() {
		document.getElementById('container-main').style.backgroundColor = isHex(document.getElementById('colorHex').value) ? "#" + document.getElementById('colorHex').value.replace("#", "").substring(0, 6) : "transparent"
	})
}

function addOpenThemesButton(){
	div = document.createElement('div')
	div.setAttribute("class", "profile-themes-button")
	div.innerHTML += `<a id="openThemes" style="margin-left:10px;display:inline-block;" class="btn-primary-md ng-binding">Themes<img style="margin:-5px;margin-top:-7px;margin-right:-2px;margin-left:3px;width:20px;" src="${chrome.runtime.getURL(`/images/paint_icon_${$('.light-theme').length == 0 ? "dark":"light"}.png`)}"></a>`
	document.getElementsByClassName('header-title')[0].appendChild(div)
	document.getElementById('openThemes').addEventListener('click', function(){
		if (this.innerHTML == `Themes<img style="margin:-5px;margin-top:-7px;margin-right:-2px;margin-left:3px;width:20px;" src="${chrome.runtime.getURL(`/images/paint_icon_${$('.light-theme').length == 0 ? "dark":"light"}.png`)}">`) {
			loadThemes()
			this.innerHTML = `Close Themes<img style="margin:-5px;margin-top:-7px;margin-right:-2px;margin-left:3px;width:20px;" src="${chrome.runtime.getURL(`/images/paint_icon_${$('.light-theme').length == 0 ? "dark":"light"}.png`)}">`
		} else {
			this.innerHTML = `Themes<img style="margin:-5px;margin-top:-7px;margin-right:-2px;margin-left:3px;width:20px;" src="${chrome.runtime.getURL(`/images/paint_icon_${$('.light-theme').length == 0 ? "dark":"light"}.png`)}">`
			document.getElementById('profileThemesSelectorBox').remove()
		}
	})
}

function shuffle(array) {
	let index = array.length,  rand;
	while (index != 0) {
		rand = Math.floor(Math.random() * index);
		index--;
		[array[index], array[rand]] = [
		array[rand], array[index]];
	}
	return array;
}

function insertAfter(newNode, existingNode) {
	existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function doColorAdjustment(colorAdjustments) {
	document.getElementById('roproThemeFrame').contentWindow.postMessage({
		'type': 'color-adjustment',
		'h': colorAdjustments.h,
		's': colorAdjustments.s,
		'l': colorAdjustments.l
		}, "*");
}

async function addColorAdjustments() {
	document.getElementById('hslUpsell').remove()
	var div = document.createElement('div')
	div.innerHTML = `<div class="content theme-color" style="width: 31.5%; float: left; margin-top: 20px; height: auto; margin-bottom: 0px; padding: 20px 20px 20px; border-radius: 10px;"><h3 style="margin-bottom:-10px;">Rotate Hue</h3><div style="height:70px;margin:auto;width:100%;text-align:center;margin-bottom:15px;"><input id="rotateHueSlider" type="range" oninput="this.parentNode.childNodes[1].innerText = this.value + '°'" step="1" min="0" max="360" value="0" style="margin-top:20px;margin-left:10px;margin-right:20px;display:block;width:calc(100% - 140px);display:inline-block;float:left;"><div style="font-weight:500;font-size:20px;background-color:#191B1D;padding:10px;border-radius:10px;display:block;width:100px;margin-top:17px;display:inline-block;float:left;color:white;">0°</div></div>
	</div>
	
	<div class="content theme-color" style="width: 31.5%; float: left; margin-top: 20px; height: auto; margin-bottom: 0px; padding: 20px 20px 20px; border-radius: 10px; margin-left: 2.5%;"><h3 style="margin-bottom:-10px;">Adjust Saturation</h3><div style="height:70px;margin:auto;width:100%;text-align:center;margin-bottom:15px;"><input id="adjustSaturationSlider" type="range" oninput="this.parentNode.childNodes[1].innerText = this.value + '%'" step="5" min="0" max="200" value="100" style="margin-top:20px;margin-left:10px;margin-right:20px;display:block;width:calc(100% - 140px);display:inline-block;float:left;"><div style="font-weight:500;font-size:20px;background-color:#191B1D;padding:10px;border-radius:10px;display:block;width:100px;margin-top:17px;display:inline-block;float:left;color:white;">100%</div></div>
	</div>
	
	<div class="content theme-color" style="width: 31.5%; float: left; margin-top: 20px; height: auto; margin-bottom: 0px; padding: 20px 20px 20px; border-radius: 10px; margin-left: 2.5%;"><h3 style="margin-bottom:-10px;">Adjust Lightness</h3><div style="height:70px;margin:auto;width:100%;text-align:center;margin-bottom:15px;"><input id="adjustLightnessSlider" type="range" oninput="this.parentNode.childNodes[1].innerText = this.value + '%'" step="5" min="0" max="200" value="100" style="margin-top:20px;margin-left:10px;margin-right:20px;display:block;width:calc(100% - 140px);display:inline-block;float:left;"><div style="font-weight:500;font-size:20px;background-color:#191B1D;padding:10px;border-radius:10px;display:block;width:100px;margin-top:17px;display:inline-block;float:left;color:white;">100%</div></div>
	</div>`
	insertAfter(div, document.getElementById('backdropBlurSection'))
	document.getElementById('rotateHueSlider').parentNode.childNodes[1].innerText = parseInt(colorAdjustments['h']) + "°"
	document.getElementById('rotateHueSlider').value = parseInt(colorAdjustments['h'])
	document.getElementById('adjustSaturationSlider').value = parseInt(parseFloat(colorAdjustments['s']) * 100)
	document.getElementById('adjustSaturationSlider').parentNode.childNodes[1].innerText = parseInt(parseFloat(colorAdjustments['s']) * 100) + "%"
	document.getElementById('adjustLightnessSlider').value = parseInt(parseFloat(colorAdjustments['l']) * 100)
	document.getElementById('adjustLightnessSlider').parentNode.childNodes[1].innerText = parseInt(parseFloat(colorAdjustments['l']) * 100) + "%"
	document.getElementById('rotateHueSlider').addEventListener('input', function() {
		colorAdjustments['h'] = parseInt(this.value)
		doColorAdjustment(colorAdjustments)
		document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
	})
	document.getElementById('adjustSaturationSlider').addEventListener('input', function() {
		colorAdjustments['s'] = parseInt(this.value) / 100
		doColorAdjustment(colorAdjustments)
		document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
	})
	document.getElementById('adjustLightnessSlider').addEventListener('input', function() {
		colorAdjustments['l'] = parseInt(this.value) / 100
		doColorAdjustment(colorAdjustments)
		document.getElementById('saveTheme').innerHTML = chrome.i18n.getMessage("SaveTheme")
	})
}

async function addThemeCard(theme) {
	profileThemeCardHTML = `<li ropro-theme="${stripTags(theme['theme'])}" class="ropro-theme-element" style="display:inline-block;cursor:pointer;width:150px;height:200px;background-color:#009DE1;border-radius:20px;padding:0px;margin-left:10px;margin-right:10px;">
	<img src="data:image/jpeg;charset=utf-8;base64,${stripTags(theme['thumbnail'])}" style="width:100%;height:100%;border-radius:10px;">
	</li>`
	div = document.createElement('div')
	div.innerHTML += profileThemeCardHTML
	profileThemeCardBox = document.getElementById('profileThemeCardBox')
	card = div.childNodes[0]
	profileThemeCardBox.appendChild(card)
	var theme = {'name': theme['theme'], 'version': 2}
	$(card).click(function(){
		addTheme(theme)
		colorAdjustments = {h: 0, s: 1, l: 1}
		if (document.getElementById('rotateHueSlider') != null) {
			document.getElementById('rotateHueSlider').value = 0
			document.getElementById('rotateHueSlider').parentNode.childNodes[1].innerText = '0°'
		}
		if (document.getElementById('adjustSaturationSlider') != null) {
			document.getElementById('adjustSaturationSlider').value = 100
			document.getElementById('adjustSaturationSlider').parentNode.childNodes[1].innerText = '100%'
		}
		if (document.getElementById('adjustLightnessSlider') != null) {
			document.getElementById('adjustLightnessSlider').value = 100
			document.getElementById('adjustLightnessSlider').parentNode.childNodes[1].innerText = '100%'
		}
	})
}

async function addVideoThemeCard(theme) {
	videoThemeCardHTML = `<li ropro-theme="${stripTags(theme['theme'])}" class="ropro-theme-element" style="position:relative;display:inline-block;cursor:pointer;width:150px;height:266.666px;background-color:#009DE1;border-radius:20px;padding:0px;margin-left:10px;margin-right:10px;">
	<img src="data:image/jpeg;charset=utf-8;base64,${stripTags(theme['thumbnail'])}" style="width:100%;height:100%;border-radius:10px;">
	</li>`
	div = document.createElement('div')
	div.innerHTML += videoThemeCardHTML
	videoThemeCardBox = document.getElementById('videoThemeCardBox')
	var card = div.childNodes[0]
	videoThemeCardBox.appendChild(card)
	var theme = {'name': theme['theme'] + ".mp4", 'version': 2}
	$(card).click(async function(){
		if (await fetchSetting("animatedProfileThemes")) {
			addTheme(theme)
			colorAdjustments = {h: 0, s: 1, l: 1}
			if (document.getElementById('rotateHueSlider') != null) {
				document.getElementById('rotateHueSlider').value = 0
				document.getElementById('rotateHueSlider').parentNode.childNodes[1].innerText = '0°'
			}
			if (document.getElementById('adjustSaturationSlider') != null) {
				document.getElementById('adjustSaturationSlider').value = 100
				document.getElementById('adjustSaturationSlider').parentNode.childNodes[1].innerText = '100%'
			}
			if (document.getElementById('adjustLightnessSlider') != null) {
				document.getElementById('adjustLightnessSlider').value = 100
				document.getElementById('adjustLightnessSlider').parentNode.childNodes[1].innerText = '100%'
			}	
		} else {
			window.open("https://ropro.io/upgrade?ref=videoclick")
		}
	})
	$(card).mouseenter(function() {
		var div = document.createElement('div')
		div.innerHTML = `<video src="https://cdn.ropro.io/assets/thumbnails/${stripTags(theme['name'])}" autoplay="" muted="" loop="" style="height:100%;border-radius:10px;position:absolute;top:0;left:0;"></video>`
		card.appendChild(div.childNodes[0])
	})
	$(card).mouseleave(function() {
		if (card.getElementsByTagName('video').length > 0) {
			card.getElementsByTagName('video')[0].remove()
		}
	})
}
   
async function loadThemesV2() {
	addThemeBox()
	var themes = await fetchThemesV2()
	if (document.getElementsByName('user-data').length > 0 && document.getElementsByName('user-data')[0].getAttribute('data-isunder13') == "true") {
		for (var i = themes['themes'].length - 1; i >= 0; i--) {
			if (themes['themes'][i].hasOwnProperty('flag')) {
				themes['themes'].splice(i, 1)
			}
		}
	}
	shuffle(themes['themes'])
	document.getElementById('profileThemeCardBox').innerHTML = ""
	for(var i = 0; i < themes['themes'].length; i++) {
		addThemeCard(themes['themes'][i])
	}
	var themeWidth = 170;
	var themeStep = Math.floor((document.getElementById('roproThemeContainer').offsetWidth - 100) / themeWidth);
	document.getElementById('profileThemeCardBox').parentNode.style.width = "calc(" + parseInt(themeWidth) + "px * " + themeStep + ")"
	document.getElementById('themesRightArrow').addEventListener('click', function() {
		if (parseInt(document.getElementById('profileThemeCardBox').style.left.replace("px", "")) < -1 * themes['themes'].length * themeWidth + themeStep * themeWidth * 2) {
			document.getElementById('profileThemeCardBox').style.left = "0px"
		} else {
			document.getElementById('profileThemeCardBox').style.left = (parseInt(document.getElementById('profileThemeCardBox').style.left.replace("px", "")) - themeStep * themeWidth) + "px"
		}
	})
	document.getElementById('themesLeftArrow').addEventListener('click', function() {
		if (parseInt(document.getElementById('profileThemeCardBox').style.left.replace("px", "")) >= 0) {
			document.getElementById('profileThemeCardBox').style.left = (-1 * themes['themes'].length * themeWidth + themeStep * themeWidth) + "px"
		} else {
			document.getElementById('profileThemeCardBox').style.left = (parseInt(document.getElementById('profileThemeCardBox').style.left.replace("px", "")) + themeStep * themeWidth) + "px"
		}
	})
	document.getElementById('profileThemesLoader').remove()
}

async function loadVideoThemesV2() {
	var themes = await fetchVideoThemesV2()
	shuffle(themes['themes'])
	document.getElementById('videoThemeCardBox').innerHTML = ""
	for(var i = 0; i < themes['themes'].length; i++) {
		addVideoThemeCard(themes['themes'][i])
	}
	var themeWidth = 170;
	var themeStep = Math.floor((document.getElementById('roproVideoThemeContainer').offsetWidth - 100) / themeWidth);
	document.getElementById('videoThemeCardBox').parentNode.style.width = "calc(" + parseInt(themeWidth) + "px * " + themeStep + ")"
	document.getElementById('videoThemesRightArrow').addEventListener('click', function() {
		if (parseInt(document.getElementById('videoThemeCardBox').style.left.replace("px", "")) < -1 * themes['themes'].length * themeWidth + themeStep * themeWidth * 2) {
			document.getElementById('videoThemeCardBox').style.left = "0px"
		} else {
			document.getElementById('videoThemeCardBox').style.left = (parseInt(document.getElementById('videoThemeCardBox').style.left.replace("px", "")) - themeStep * themeWidth) + "px"
		}
	})
	document.getElementById('videoThemesLeftArrow').addEventListener('click', function() {
		if (parseInt(document.getElementById('videoThemeCardBox').style.left.replace("px", "")) >= 0) {
			document.getElementById('videoThemeCardBox').style.left = (-1 * themes['themes'].length * themeWidth + themeStep * themeWidth) + "px"
		} else {
			document.getElementById('videoThemeCardBox').style.left = (parseInt(document.getElementById('videoThemeCardBox').style.left.replace("px", "")) + themeStep * themeWidth) + "px"
		}
	})
	document.getElementById('videoThemesLoader').remove()
}

async function doMain() {
	var contentInterval = setInterval(function() {
		clearInterval(contentInterval)
		try{
			document.getElementsByClassName('content')[0].style.height = "initial"
			loadThemesV2()
			loadVideoThemesV2()
			document.title = 'RoPro Themes'
		}catch{
			doMain()
		}
	}, 500)
	var containerInterval = setInterval(function() {
		if (document.getElementById('container-main') != null) {
			clearInterval(containerInterval)
			document.getElementById('container-main').style.minHeight = "3000px"
		}
	}, 100)
}

doMain()
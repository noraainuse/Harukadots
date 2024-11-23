var url_matches = [
	"/sandbox"
];

function verifyPath(matches) {
	if (!window.location.host.endsWith(".roblox.com")) return false;
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
//The content script matches defined in manifest.json should mostly handle this, but this accounts for edge cases.
//In RoPro v2.0 this will be an ES6 imported module function.
if (!verifyPath(url_matches)) throw new Error('RoPro Error: Invalid path!');

var sandboxHTML = `
<div style="margin-top:4px;margin-left:15px;">
	<h1 style="display:inline-block;" class="ng-binding">RoPro Avatar Sandbox <img class="sandbox-icon-big" style="height:60px;margin-bottom:0px;" src="${chrome.runtime.getURL('/images/empty.png')}"></h1>
	<div id="upgradeCTA" style="margin-top:20px;float:right;display:inline-block;" class="upgrade-cta catalog-header"> <div style="display:inline-block;margin-right:5px;" class="ng-binding upgradeText">Upgrade to save your outfits!</div>
	<a style="display:inline-block;" class="btn-primary-md ng-binding upgradeButtonText" target="_blank" href="https://ropro.io#plus">Upgrade</a> </div>
	<div style="pointer-events: none;position:relative;display:inline-block;float:left;max-height:610px;" id = "maincontent">
		<div style="pointer-events:initial;position:relative;width:970px;z-index:1;" class="sandbox-frame" id="sandboxFrame">
		<iframe class="sandbox-iframe" style="z-index:1;position:absolute;display:block;width:970px;display:none;" id="loaderView" src="https://ropro.io/render/?load"></iframe>
			<iframe class="sandbox-iframe" style="z-index:1;" id="sandboxView" src="https://ropro.io/render/?load"></iframe>
			<span id="fullscreenToggle" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" style="opacity:0.5;position:absolute;bottom:10px;right:10px;z-index:100;width:40px;height:37px;display:none;" class="sandbox-fullscreen-toggle fullscreen toggle-three-dee btn-control btn-control-small ng-binding"><img id="fullscreenImage" src="${chrome.runtime.getURL('/images/fullscreen_0.png')}" style="height:20px;margin:-10px;" onclick=""></span>
			<div style="position: absolute; bottom: 5px; left: 10px; z-index: 100; " class="avatar-type-toggle pill-toggle ng-scope" data-toggle="tooltip" title="" data-original-title="Switch between 2D and 3D rendering in the Avatar Sandbox"> <input type="radio" id="radio-2D" value="2D" checked=true class="ng-pristine ng-untouched ng-valid ng-not-empty" name="17"> <label for="radio-2D">2D</label> <input type="radio" id="radio-3D" value="3D" class="ng-pristine ng-untouched ng-valid ng-not-empty" name="18"> <label for="radio-3D">3D</label> </div>
			<div style="position: absolute; bottom: 5px; left: 90px; z-index: 100; " class="avatar-type-toggle pill-toggle ng-scope" data-toggle="tooltip" title="Switch between classic R6 avatar and more expressive next generation R15 avatar"> <input type="radio" id="radio-R6" value="R6" class="ng-pristine ng-untouched ng-valid ng-not-empty" name="15"> <label for="radio-R6">R6</label> <input type="radio" id="radio-R15" value="R15" class="ng-pristine ng-untouched ng-valid ng-not-empty" name="16"> <label for="radio-R15">R15</label> </div>
			</div>
			<div style="float:left;position:relative;width:277px;" id="wearing">
				<h5 style="padding-bottom:0px;" class="ng-binding"><span class="outfitCostText">Outfit Cost:</span> <span>
					<span id="outfitCostLoading" style="margin:-7px;transform: scale(0.6); width: 100px; height: 25px; visibility: initial !important;" class="spinner spinner-default"></span>
					<div id="outfitCostDiv" style="display:none;">
					<span style="margin-left:-5px;margin-right:-8px;margin-bottom:2px;transform: scale(0.6);" id="nav-robux" class="icon-robux-28x28 roblox-popover-close"></span>
					<span style="font-size:15px;" class="rbx-text-navbar-right text-header" id="outfitCostRobux">
				</span></div></span></h5>
				<h3 style="padding-bottom:0px;" class="ng-binding currentlyWearingText">Currently Wearing</h3>
				<p style="margin-top:-2px;font-size:13px;" class="ng-binding clickAnItemText">Click an item to unequip it.</p>
				<div style="line-height:0px;pointer-events:initial;" id="wearingContainer"></div>
			</div>
			<div style="position:relative;width:277px;" id="backgroundChoice">
			<div style="margin-top:5px;float:left;position:relative;width:277px;height:240px;pointer-events:initial;display:none;" id="roproMerch">
				<h3 style="padding-bottom:0px;" class="ng-binding"><span class="roproMerchText">RoPro Merch</span> </h3>
				
				<p id="merchSubtitle" style="margin-top:-2px;font-size:13px;" class="ng-binding merchText">Buy four or more shirts/pants to unlock a special "RoPro Donor" profile icon.</p>
				<div id="scrollLeft" style="margin-top: 70px; height: 170px; margin-left: 10px; width: 20px; display: block;" class="scroller prev disabled" role="button" aria-hidden="true"><div class="arrow"><span style="transform:scale(0.8);margin-left:-4px;" class="icon-games-carousel-left"></span></div></div>
				<div style="pointer-events:initial;line-height:0px;margin-top:5px;margin-left:-10px;" id="merchContainer">
				</div>
				<div id="scrollRight" style="margin-top: 70px; height: 170px; margin-right: 18px; width: 20px; display: block;" class="scroller next" role="button" aria-hidden="true"><div style="transform:scale(0.8);margin-right:-9px;" class="arrow"><span class="icon-games-carousel-right"></span></div></div>
			</div>
			<div style="pointer-events:initial;margin-top:10px;float:left;position:relative;width:277px;height:80px;">
				<h3 style="padding-bottom:0px;" class="ng-binding"><span>Advanced Equip</span> </h3>
				<div>
				<input id="advancedEquipInput" style="border-radius:5px;margin-bottom:0px;margin-top:2px;padding-left:10px;" class="form-control input-field" placeholder="Enter Item ID" maxlength="50" ng-keypress="" ng-model="">
				</div>
			</div>
				<!--<h3 style="margin-top:5px;float:left;padding-bottom:0px;" class="ng-binding backgroundText">Background</h3>
				<p style="float:left;margin-top:-2px;font-size:13px;" class="ng-binding chooseBackgroundText">Choose a background below.</p>
				<div style="float:left;pointer-events:initial;" id="backgroundContainer">
				<div><div id="default" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/default_background.png">
				<img src="${chrome.runtime.getURL('/images/checkmark_done.gif')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="sky" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/sky_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="crossroads" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/crossroads_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="roblox_hq" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/roblox_hq_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="trade_hangout" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/trade_hangout_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="playground" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/playground_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="shuttle2" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/shuttle2_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="school" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/school_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="oval_office" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/oval_office_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>
				<div><div id="pirate" style="display:inline-block;width:50px;height:50px;margin:2px;" class="thumbnail-2d-container background-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="https://ropro.io/3dviewer/backgrounds/pirate_background.png">
				<img src="${chrome.runtime.getURL('/images/empty.png')}" class="background-checkmark-image active" style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-57px;top:-52px;">
				</a>
				</div></div>-->
							<div style="margin-top:5px;float:left;position:relative;width:277px;" id="roproOutfits">
				<!--<h3 style="padding-bottom:0px;" class="ng-binding">RoPro Outfits </h3>
				<p style="margin-top:-2px;font-size:13px;" class="ng-binding">Try on pre-made outfits.</p>
				<div style="pointer-events:initial;" id="premadeOutfitContainer"></div>-->
			</div>
			<div style="pointer-events:initial;margin-top:5px;float:left;position:relative;width:277px;height:100px;" id="myOutfits">
				<h3 style="padding-bottom:0px;" class="ng-binding"><span class="myOutfitsText">My Outfits</span> <button id="createOutfitButton" type="button" class="btn-fixed-width-lg btn-growth-lg" style="margin-top:7px;background-color:#0084dd;border:0px;width:60px;font-size:15px;padding:2px;float:right;">Save</button></h3>
				<div style="display:none;" id="outfitNameGroup" class="outfit-input-group">
				<input id="outfitNameInput" style="border-radius:5px;margin-bottom:0px;margin-top:2px;padding-left:10px;" class="form-control input-field outfit-name-input" placeholder="Outfit Name" maxlength="50" ng-keypress="" ng-model="">
				<p style="margin-left:3px;margin-bottom:10px;font-size:12px;" class="ng-binding pressEnterKeyText">Press the enter key to submit outfit name.
				</p></div>
				<p id="outfitSubtitle" style="margin-top:-2px;font-size:13px;" class="ng-binding nameAndSaveText">Name and save your outfit.</p>
				<div style="pointer-events:initial;line-height:0px;" id="outfitContainer"></div>
			</div>
				</div>
			</div>
	</div>
	<div class="catalog-tabs" style="float:right;" id="catalogcontent">
		<a index="1" style="font-size:13px;" class="catalog-tab active">Accessories</a>
		<a index="2" style="font-size:13px;" class="catalog-tab">Limiteds</a>
		<a index="4" style="font-size:13px;" class="catalog-tab">Faces</a>
		<a index="5" style="font-size:13px;" class="catalog-tab">Layered</a>
		<a index="5" style="font-size:13px;" class="catalog-tab">Classic</a>
		<a index="6" style="font-size:13px;" class="catalog-tab">Characters</a>
	</div>
	<div id="Accessories">
	</div>
	<div id="Limiteds">
	</div>
	<div id="Faces">
	</div>
	<div id="Layered">
	</div>
	<div id="Classic">
	</div>
	<div id="Characters">
	</div>
</div>
`

var wearing = []
var wearingCostDict = {}
var wearingInfoDict = {}
var assetTypeDict = {}
var assetPriceDict = {}
var userID = 1
var playerType = "R15"

var sorts = {
	"Accessories":{"All Accessories":"?category=Accessories&limit=30&sortType=1&sortAggregation=1&subcategory=Accessories", "Gear": "?category=Accessories&limit=30&subcategory=Gear", "Hats": "?category=Accessories&limit=30&subcategory=HeadAccessories", "Hair": "?category=BodyParts&limit=30&subcategory=HairAccessories", "Face":"?category=Accessories&limit=30&subcategory=FaceAccessories", "Neck":"?category=Accessories&limit=30&subcategory=NeckAccessories", "Shoulder":"?category=Accessories&limit=30&subcategory=ShoulderAccessories", "Front":"?category=Accessories&limit=30&subcategory=FrontAccessories", "Back":"?category=Accessories&limit=30&subcategory=BackAccessories", "Waist":"?category=Accessories&limit=30&subcategory=WaistAccessories"},
	"Limiteds":{"All Limiteds":"?category=Accessories&limit=30&salesTypeFilter=2&sortAggregation=1&sortType=1&subcategory=Accessories"},
	"Faces":{"Faces": "?category=BodyParts&limit=30&subcategory=Faces", "Heads":"?category=BodyParts&limit=30&subcategory=Heads"},
	"Layered":{"T-Shirts":"?category=Clothing&limit=30&subcategory=TShirtAccessories", "Shirts":"?category=Clothing&limit=30&subcategory=ShirtAccessories", "Sweaters": "?category=Clothing&limit=30&subcategory=SweaterAccessories", "Jackets": "?category=Clothing&limit=30&subcategory=JacketAccessories", "Pants": "?category=Clothing&limit=30&subcategory=PantsAccessories", "Shorts": "?category=Clothing&limit=30&subcategory=ShortsAccessories", "Dresses/Skirts": "?category=Clothing&limit=30&subcategory=DressSkirtAccessories", "Shoes": "?category=Clothing&limit=30&subcategory=ShoesBundles"},
	"Classic":{"Shirts":"?category=Clothing&limit=30&subcategory=ClassicShirts", "Pants":"?category=Clothing&limit=30&subcategory=ClassicPants", "T-Shirts": "?category=Clothing&limit=30&subcategory=ClassicTShirts"},
	"Characters":{"Characters":"?category=Characters&sortAggregation=5&sortType=2&limit=30"}
	}
var subsort = {
	"Accessories":["",""],
	"Limiteds":["",""],
	"Faces":["",""],
	"Layered":["",""],
	"Classic":["",""],
	"Characters":["",""]
	}
var cursors = {
	"Accessories":["",""],
	"Limiteds":["",""],
	"Faces":["",""],
	"Layered":["",""],
	"Classic":["",""],
	"Characters":["",""]
	}
var currentTab = "Accessories"
var currentSort = "Most Popular"
var currentPage = null
var activeTab = null
var pageLoading = false
var tabs = {}
var background = "default"
var currentAnimation = null
var thumbnailConfig = {"thumbnailId": 2, "thumbnailType": "2d", "size": "420x420"}
var scales = {"bodyType": 0, "depth": 0, "head": 0, "height": 0, "proportion": 0, "width": 0}
var playerAvatarType = {}
var bodyColors = {}
var assets = []
var avatarRules = {}
var bodyColorPalette = {}
var layeredClothingOrder = {64: 7, 65: 7, 68: 7, 67: 10, 66: 4, 69: 5, 72: 6, 70: 3, 71: 3}

function fetchAvatarRules() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://avatar.roblox.com/v1/avatar-rules"}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchAssetsView(renderParameters, overrideCancelled = false) {
	return new Promise(resolve => {
		function getURL(renderParameters) {
			chrome.runtime.sendMessage({greeting: "PostValidatedURL", url:"https://avatar.roblox.com/v1/avatar/render", jsonData: renderParameters}, 
				function(data) {
					if (overrideCancelled || renderParameters == JSON.stringify(getRenderParameters())) {
						if (data == null) {
							setTimeout(function(){
								getURL(renderParameters)
							}, 2000)
						} else {
							if (data.state == "Completed") {
								resolve(data.imageUrl)
							} else {
								setTimeout(function(){
									getURL(renderParameters)
								}, 2000)
							}
						}
					} else {
						resolve("CANCELLED")
					}
				})
		}
		getURL(renderParameters)
	})
}

function fetchAssetsView2D(assetIds) {
	return new Promise(resolve => {
		function getURL(assetIds) {
			chrome.runtime.sendMessage({greeting: "GetURL", url:"https://avatar.roblox.com/v1/try-on/2d?assetIds="+assetIds.join(",")+"&width=420&height=420&format=png&addAccoutrements=false"}, 
				function(data) {
					if (data != "ERROR") {
						resolve(data.url)
					} else {
						setTimeout(function(){
							getURL(assetIds)
						}, 2000)
					}
				})
		}
		getURL(assetIds)
	})
}

function fetchMerch() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getMerch.php"},
			function(data) {
					resolve(data.split(','))
			})
	})
}

function fetchCurrentlyWearing(userId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://avatar.roblox.com/v1/users/"+userId+"/avatar"}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchBundleDetails(bundleId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://catalog.roblox.com/v1/bundles/details?bundleIds=" + bundleId}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchBundleDetailsBulk(bundleIds) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://catalog.roblox.com/v1/bundles/details?bundleIds=" + bundleIds.join(",")}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchBundleThumbnailsBulk(bundleIds) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://thumbnails.roblox.com/v1/bundles/thumbnails?size=420x420&format=Png&isCircular=false&bundleIds=" + bundleIds.join(",")}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchOutfitDetails(outfitId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://avatar.roblox.com/v1/outfits/" + outfitId + "/details"}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchPage(sort, keyword, cursor) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://catalog.roblox.com/v1/search/items" + sort + "&cursor=" + cursor + "&keyword=" + keyword + "&includeNotForSale=true"}, 
			function(data) {
					resolve(data)
			})
	})
}

function createNewOutfit(outfitAssets, outfitName, outfitThumbnail, userId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/createOutfit.php?userid=" + userId + "&outfitAssets=" + outfitAssets.join(",") + "&outfitName=" + outfitName + "&outfitThumbnail=" + outfitThumbnail}, 
			function(data) {
					resolve(data)
			})
	})
}

function updateThumbnail(userID, outfitAssets, newThumbnail) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/updateOutfitThumbnail.php?userid=" + userID + "&outfitAssets=" + outfitAssets.join(",") + "&outfitThumbnail=" + newThumbnail}, 
			function(data) {
					resolve(data)
			})
	})
}

function deleteOutfit(userID, outfitAssets) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/deleteOutfit.php?userid=" + userID + "&outfitAssets=" + outfitAssets.join(",")}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchDetails(items) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostValidatedURL", url:"https://catalog.roblox.com/v1/catalog/items/details", jsonData: JSON.stringify(items)}, 
			function(data) {
				if (data != null) {
					for (var i = 0; i < data.data.length; i++) {
						assetTypeDict[data.data[i].id] = data.data[i].assetType
					}
					resolve(data)
				} else {
					itemArray = {"data": []}
					for (i = 0; i < items.items.length; i++) {
						itemArray["data"].push({
							"id": items.items[i].id,
							"itemType": "Asset",
							"assetType": 18,
							"name": "",
							"description": "",
							"productId": -1,
							"genres": [
							  "TownAndCity"
							],
							"itemStatus": [],
							"creatorType": "User",
							"creatorTargetId": 1,
							"creatorName": "ROBLOX",
							"lowestPrice": -1,
							"unitsAvailableForConsumption": 0,
							"favoriteCount": 0,
							"offSaleDeadline": null
						  })
					}
					resolve(itemArray)
				}
			})
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

function fetchOutfits(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/loadOutfits.php?userid=" + userID}, 
			function(data) {
					resolve(data)
			})
	})
}

var activeBatch = null
var assetBatch = new Set()
var itemBatch = {}

async function fetchAssetDetails(assetId) {
	return new Promise(async resolve => {
		assetBatch.add(assetId)
		if (activeBatch == null) {
			activeBatch = new Promise(resolveBatch => {
				setTimeout(function() {
					try {
						activeBatch = null
						var items = []
						var batch = Array.from(assetBatch)
						assetBatch = new Set()
						for (var i = 0; i < batch.length; i++) {
							items.push(`{"id":${parseInt(batch[i])},"itemType":"Asset"}`)
						}
						chrome.runtime.sendMessage({greeting: "PostValidatedURL", url:"https://catalog.roblox.com/v1/catalog/items/details", jsonData: `{"items":[${items.join(",")}]}`}, 
							function(data) {
								for (var i = 0; i < data.data.length; i++) {
									itemBatch[data.data[i].id] = data.data[i]
								}
								resolveBatch()
						})
					} catch(e) {
						resolveBatch()
					}
				}, 500)
			})
		}
		await activeBatch
		if (itemBatch.hasOwnProperty(assetId)) {
			resolve(itemBatch[assetId])
		} else {
			resolve({"id":-1,"itemType":"Asset","assetType":41,"name":"Error","description":"","productId":-1,"genres":["All"],"itemStatus":[],"itemRestrictions":[],"creatorHasVerifiedBadge":true,"creatorType":"User","creatorTargetId":1,"creatorName":"Roblox","price":0,"offSaleDeadline":null})
		}
	})
}

function fetchLimitedSellers(assetId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://economy.roblox.com/v1/assets/" + assetId + "/resellers?cursor=&limit=10"}, 
			function(data) {
					resolve(data)
			})
	})
}

var thumbnailCache = {}

function setAssetThumbnail(id) {
	if (id in thumbnailCache) {
		$('.ropro-image-' + parseInt(id)).attr("src", stripTags(thumbnailCache[id]))
		return thumbnailCache[id]
	}
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURLCached", url:"https://api.ropro.io/getAssetThumbnailUrl.php?id=" + parseInt(id)}, 
			function(data) {
					thumbnailCache[id] = data
					resolve(data)
					$('.ropro-image-' + parseInt(id)).attr("src", stripTags(data))
			})
	})
}

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
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

function getRenderParameters() {
	params = {}
	params["avatarDefinition"] = {"assets": wearing, "bodyColors": bodyColors, "playerAvatarType": playerAvatarType, "scales": scales}
	params["thumbnailConfig"] = thumbnailConfig
	return params
}

function addCommas(nStr){
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function totalOutfitCost() {
	total = 0
	offsale = 0
	for (key in wearingCostDict) {
		if (wearingCostDict[key] != null) {
			total += wearingCostDict[key]
		} else {
			offsale += 1
		}
	}
	return [total, offsale]
}

function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }

 var merchCount = 0
 var merchStep = 3
 var merchPage = 0

 async function addMerch(id, name, price) {
	merchCount++
	merchContainer = document.getElementById('merchContainer')
	merchHTML = `<div style="float:left;margin-left:1px;margin-right:1px;"><div style="width:76px;" class="item-card-container remove-panel"><div class="item-card-link">
	<a class="item-card-thumb-container">
	<thumbnail-2d id="${parseInt(id)}" type="Asset" style="overflow:visible;height:76px;width:76px;position:relative;" class="item-card-thumb-container item-card-thumb ng-isolate-scope  ${parseInt(id)}">
	<span class="thumbnail-2d-container">
	<img class="item-card-image" style="height:76px;width:76px;position:absolute;margin-left:5px;margin-top:5px;" src="${chrome.runtime.getURL('/images/empty.png')}"></span>
	<img style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-50px;top:-35px;" class="checkmark-image " src="${chrome.runtime.getURL('/images/checkmark_start.png')}">
	</thumbnail-2d> </a> </div> <div style="width:76px;" class="item-card-caption"> <div class="item-card-equipped ng-hide"> <div class="item-card-equipped-label"></div>
	<span class="icon-check-selection"></span> </div>
	<a target="_blank" href="https://www.roblox.com/catalog/${parseInt(id)}/item" class="item-card-name-link">
	<div style="float:left;margin-top:5px;font-size:13px;width:85px;" title="${stripTags(name)}" class="text-overflow item-card-name ng-binding">${stripTags(name)}</div>
	<div class="action-button"><button type="button" class="btn-fixed-width btn-growth-sm " style="width:80px;height:30px;margin-top:0px;"><div class="text-overflow item-card-price font-header-2 text-subheader margin-top-none" style="float:left;margin-top:-3px;margin-left:7px;">
	<span style="margin-top:-2px;" class="icon icon-robux-white-16x16"></span><span style="margin-left:4px;color:white;" class="text-robux-tile">${parseInt(price)}</span></div></button></div>
	</a></div></div></div>`
	li = document.createElement('li')
	li.setAttribute('style', 'height: 170px; width: 76px; margin-left: 10px; margin-right: 5px; display: inline-block;')
	li.classList.add("ropro-merch")
	if (merchCount > merchStep) {
		li.style.display = "none"
	}
	li.innerHTML = merchHTML
	li.getElementsByClassName('item-card-thumb')[0].addEventListener('click', async function() {
		if ($(this).find('.checkmark-image').attr('class').includes('active')) {
			$(this).find('.checkmark-image').attr('src', chrome.runtime.getURL('/images/checkmark_end.png'))
			$(this).find('.checkmark-image').removeClass('active')
			removeItem(parseInt($(this).attr('id')))
		} else {
			$(this).find('.checkmark-image').addClass('active')
			$(this).find('.checkmark-image').attr('src',chrome.runtime.getURL('/images/checkmark.png'))
			function changeImage(checkmark) {
				setTimeout(function(){
					$(checkmark).find('.checkmark-image').attr('src',chrome.runtime.getURL('/images/checkmark_done.gif'))
				}, 400)
			}
			changeImage(this)
			addItem(parseInt($(this).attr('id')))
		}
	})
	merchContainer.appendChild(li)
 }

 var assetDetailsCache = {}

 async function calculateCost(assetId) {
	 document.getElementById("outfitCostLoading").style.display = "inline-block"
	 document.getElementById("outfitCostDiv").style.display = "none"
	 if (assetId != -1) {
		 if (assetId in assetDetailsCache) {
			 assetDetails = assetDetailsCache[assetId]
		 } else {
			 assetDetailsCache[assetId] = await fetchAssetDetails(assetId)
			 assetDetails = assetDetailsCache[assetId]
		 }
		 $(".wearing-" + assetId).html(stripTags(assetDetails.name))
		 wearingInfoDict[assetId] = stripTags(assetDetails.name)
		 if (assetDetails.hasOwnProperty('lowestPrice')) {
			 if (assetDetails.lowestPrice != null) {
				 wearingCostDict[assetId] = assetDetails.lowestPrice
				 $(".wearing-robux-" + assetId).html(addCommas(assetDetails.lowestPrice))
			 } else {
				 wearingCostDict[assetId] = null
				 $(".wearing-robux-" + assetId).html("Offsale")
			 }
		 } else {
			 if (assetDetails.price != null) {
				 wearingCostDict[assetId] = assetDetails.price
				 $(".wearing-robux-" + assetId).html(addCommas(assetDetails.price))
			 } else {
				 wearingCostDict[assetId] = null
				 $(".wearing-robux-" + assetId).html("Offsale")
			 }
		 }
	 }
	 cost = totalOutfitCost()
	 if (cost[1] == 0) {
		 costString = addCommas(parseInt(cost[0]))
	 } else {
		 costString = addCommas(parseInt(cost[0])) + "<b style='font-size:10px;'> + " + parseInt(cost[1]) + " offsale</b>"
	 }
	 document.getElementById("outfitCostRobux").innerHTML = costString
	 document.getElementById("outfitCostLoading").style.display = "none"
	 document.getElementById("outfitCostDiv").style.display = "inline-block"
 }

function addOutfit(userID, assets, name, thumbnail) {
	outfitHTML = `<div class="outfit-delete" style="z-index:10000;position:absolute;top:-8px;right:-8px;white-space:nowrap;"><a><img style="z-index:10000;height:15px;" src="${chrome.runtime.getURL('/images/close_button.png')}"></a></div>
				<div class="outfit-name input-group input-field">${stripTags(name)}</div>
				<div assets='${JSON.stringify(assets)}' outfit-name="${stripTags(name)}" style="display:inline-block;width:85px;height:85px;margin:2px;" class="thumbnail-2d-container outfit-selector"><a style="position:relative;">
				<img class="item-card-thumb-container" style="width:100%;height:100%;" src="${stripTags(thumbnail)}">
				</a>
				</div>`
	div = document.createElement('div')
	div.setAttribute('class', 'outfit-div')
	div.setAttribute('style', 'display:inline-block;width:85px;height:85px;position:relative;margin:2px;')
	div.innerHTML = outfitHTML
	document.getElementById('outfitContainer').insertBefore(div, document.getElementById('outfitContainer').childNodes[0])
	div.getElementsByClassName('outfit-delete')[0].addEventListener('click', function() {
		this.parentNode.remove();
		deleteOutfit(userID, assets);
	});
	div.getElementsByClassName('outfit-selector')[0].addEventListener('click', async function() {
		ids = getIds(wearing)
		var itemsArray = []
		for (i = 0; i < ids.length; i++) {
			delete wearingCostDict[ids[i]]
			itemsArray.push({"id":ids[i],"itemType":"Asset"})
		}
		calculateCost(-1)
		wearing = []
		await fetchDetails({"items":itemsArray})
		addItemBulk(assets)
	})
	return div
}

async function updateOutfitThumbnail(userID, div, outfitAssets) {
	var params = getRenderParameters()
	params["thumbnailConfig"] = {"thumbnailId": 2, "thumbnailType": "2d", "size": "420x420"}
	url = await fetchAssetsView(JSON.stringify(params), true)
	url = stripTags(url)
	if (url == 'CANCELLED') {
		updateOutfitThumbnail(userID, div, outfitAssets)
	} else {
		div.getElementsByTagName('img')[1].setAttribute('src', url);
		await updateThumbnail(userID, outfitAssets, url);
	}
}

async function createOutfit(name) {
	outfitAssets = [...getIds(wearing)]
	//var params = getRenderParameters()
	//params["thumbnailConfig"] = {"thumbnailId": 2, "thumbnailType": "2d", "size": "420x420"}
	//url = await fetchAssetsView(JSON.stringify(params))
	url = chrome.runtime.getURL('/images/empty.png')
	userId = await getUserId()
	createOutfitReq = await createNewOutfit(outfitAssets, stripTags(name), url, userId)
	if (createOutfitReq == "1") {
		div = addOutfit(userId, outfitAssets, stripTags(name), url)
		updateOutfitThumbnail(userId, div, outfitAssets)
		document.getElementById('outfitSubtitle').innerHTML = chrome.i18n.getMessage("SuccessfullyCreatedOutfit")
		document.getElementById('outfitNameGroup').style.display = "none"
		document.getElementById('createOutfitButton').innerHTML = "Save"
		document.getElementById('outfitSubtitle').style.display = "block"
		document.getElementById('outfitNameInput').value = ""
	} else {
		document.getElementById('outfitSubtitle').innerHTML = "Error: You already have this outfit."
		document.getElementById('outfitNameGroup').style.display = "none"
		document.getElementById('createOutfitButton').innerHTML = "Save"
		document.getElementById('outfitSubtitle').style.display = "block"
		document.getElementById('outfitNameInput').value = ""
	}
}

const paidList = () => {
	let paidItems = []
	const addPaidItem = (item) => {
		paidItems.push(item)
	}
	const getPaidItems = () => {
		return paidItems
	}
	return {
		addPaidItem,
		getPaidItems
	}
}

const paidItemsList = paidList()

function createItem(name, assetId, price, limited, limitedU, itemType, thumbnail, bundleType = "") {
	li = document.createElement('li')
	li.style.height = "200px"
	li.style.width = "126px"
	li.style.marginLeft = "5px"
	li.style.marginRight = "5px"
	li.style.display = "inline-block"
	if (getIds(wearing).includes(assetId)) {
		active = "active"
		src = chrome.runtime.getURL('/images/checkmark_done.gif')
	} else {
		active = ""
		src = chrome.runtime.getURL('/images/checkmark_start.png')
	}
	if (thumbnail.length == 0) {
		thumbnail = chrome.runtime.getURL('/images/empty.png')
	}
	if (itemType == "Bundle") {
		subdirectory = "bundles"
	} else {
		subdirectory = "catalog"
	}
	console.log(bundleType)
	if ((itemType == "Bundle" || itemType == "61") && price != "Free" && bundleType != "Shoes") {
		//paidItemsList.addPaidItem(parseInt(assetId))
	}
	itemHTML = `<div style="float:left;margin-left:1px;margin-right:1px;"><div class="item-card-container remove-panel"><div class="item-card-link">
	<a class="item-card-thumb-container">
	<thumbnail-2d id=${parseInt(assetId)} type="${stripTags(itemType)}" style="overflow:visible;height:126px;width:126px;position:relative;" class="item-card-thumb-container item-card-thumb ng-isolate-scope ${active} ${parseInt(assetId)}">
	<span class="thumbnail-2d-container">
	<img class="item-card-image ropro-image-${parseInt(assetId)}" style="height:126px;width:126px;position:absolute;" src="${stripTags(thumbnail)}">
	</span>
	<img style="pointer-events:none;transform:scale(0.4);overflow:visible;width:164px;height:126px;position:absolute;right:-50px;top:-35px;" class="checkmark-image ${active}" src="${src}">
	</thumbnail-2d> </a> </div> <div class="item-card-caption"> <div class="item-card-equipped ng-hide"> <div class="item-card-equipped-label"></div>
	<span class="icon-check-selection"></span> </div>
	<a target="_blank" href="https://www.roblox.com/${subdirectory}/${parseInt(assetId)}/item" class="item-card-name-link">
	<div style="float:left;margin-top:5px;" title="${stripTags(name)}" class="text-overflow item-card-name ng-binding">${stripTags(name)}</div>
	${price == "" ? `` : `<div class="text-overflow item-card-price font-header-2 text-subheader margin-top-none">
	${price == "Offsale" || price == "Free" ? '' : '<span class="icon icon-robux-16x16"></span><span style="margin-left:4px;" class="text-robux-tile">'}${price == "Offsale" ? stripTags(price) : price == "Free" ? stripTags(price) : addCommas(parseInt(price))}
	</span></div>`}
	</a></div></div></div>`
	li.innerHTML = itemHTML
	return li
}

function createTab(tabName) {
tabList = ""
firstTab = null
count = 1
for (sort in sorts[tabName]) {
	if (firstTab == null) {
		firstTab = sort
	}
	if (activeTab == null) {
		activeTab = tabName
		currentTab = tabName
		currentSort = Object.keys(sorts[tabName])[0]
	}
	tabList += `<li class="dropdown-custom-item" class="ng-scope"> <a style="font-size:13px;">${stripTags(sort)}</a></li>`
	count++
}

div = document.createElement("div")
tabHTML = `
<div id="navbar-universal-search" style="margin-top:10px;margin-right:14px;float:right;width:680px;" role="search">
   <div class="search-container">
      <div class="input-group">
         <input style="width:530px;unicode-bidi:bidi-override!important;direction:LTR!important;" class="input-field sandbox-search" placeholder="Search" maxlength="50"> 
         <div style="width:150px;" class="input-group-btn">
            <button style="height:38px;" type="button" class="input-dropdown-btn category-options ng-scope"> <span style="font-size:13px;" class="text-overflow rbx-selection-label ng-binding">${stripTags(firstTab)}</span> <span class="icon-down-16x16"></span> </button> 
            <ul page="0" style="width:150px;display:block;" class="dropdown_menu dropdown_menu-4 dropdown-menu dropdown-custom">
				${tabList}
            </ul>
            <button class="sandbox-search-button input-addon-btn" type="submit"> <span class="icon-search"></span> </button> 
         </div>
      </div>
   </div>
</div>`

itemContentHTML = `
<div style="width:680px;min-height:50px;margin-right:14px;float:right;margin-top:10px;" class="item-content">
<ul page="0" class="item-list hlist item-cards-stackable">
<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>
</ul>
</div>
`

div.innerHTML = tabHTML + itemContentHTML
return div
}

function createUpgradeModal() {
    modalDiv = document.createElement('div')
    modalDiv.setAttribute('id', 'standardUpgradeModal')
    modalDiv.setAttribute('class', 'upgrade-modal')
    modalDiv.style.zIndex = 100000
    modalHTML = `<div id="standardUpgradeModal" style="z-index:10000;display:block;" class="upgrade-modal"><div style="background-color:#232527;position:absolute;width:500px;height:500px;left:-webkit-calc(50% - 250px);top:-webkit-calc(50% - 250px);" class="modal-content upgrade-modal-content">
    <span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
    <h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:20px;left:40px;"><img style="width:70px;left:0px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}"> RoPro Plus Feature</h2><div style="font-family:HCo Gotham SSm;color:white;font-size:17px;position:absolute;top:115px;left:200px;width:270px;">Trying on paid Characters & saving Sandbox Outfits is only available for<br><b><img style="width:20px;margin-top:-3px;margin-right:3px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}">RoPro Plus</b><br>subscribers.</div><div style="font-family:HCo Gotham SSm;color:white;font-size:18px;position:absolute;top:270px;left:200px;width:270px;"><u>More Subscription Benefits:</u>
    <ul style="margin-left:20px;font-size:12px;font-family:HCo Gotham SSm;">
    <li style="list-style-type:circle;">Fastest Server &amp; Server Size Sort</li>
    <li style="list-style-type:circle;">More Game Filters &amp; Like Ratio Filter</li><li style="list-style-type:circle;">Trade Value &amp; Demand Calculator</li><li style="list-style-type:circle;">More Game Playtime Sorts</li><li style="list-style-type:circle;">And many more! Find a full list <a style="text-decoration:underline;cursor:pointer;" href="https://ropro.io#plus" target="_blank">here</a>.</li></ul>
    </div><video width="70%" height="100%" style="pointer-events: none;position:absolute;top:10px;left:-70px;transform:scale(2);" src="" autoplay="" loop="" muted=""></video>
    <a href="https://ropro.io#plus" target="_blank"><button type="button" style="font-family:HCo Gotham SSm;position:absolute;left:25px;top:440px;width:450px;" class="btn-growth-sm PurchaseButton">Upgrade</button></a>
    </div></div>`
    modalDiv.innerHTML += modalHTML
    body = document.getElementsByTagName('body')[0]
    body.insertBefore(modalDiv, body.childNodes[0])
    $('.upgrade-modal-close').click(function(){
        document.getElementById('standardUpgradeModal').remove()
    })
}

function upgradeModal() {
    createUpgradeModal()
    document.getElementById('standardUpgradeModal').getElementsByTagName('video')[0].src = `https://ropro.io/dances/dance${(Math.floor(Math.random() * 18) + 1)}.webm`
    document.getElementById('standardUpgradeModal').style.display = "block"
}

var bundleThumbnails = {}

async function updatePage(cursor, keyword, back) {
	setTimeout(function(){
		pageLoading = false
	},500)
	if (pageLoading == false) {
		pageLoading = true
		mySort = sorts[currentTab][currentSort]
		catalogPage = await fetchPage(mySort, keyword, cursor)
		if (catalogPage != null) {
			itemDetails = await fetchDetails({"items":catalogPage.data})
			itemList = currentPage.getElementsByClassName('item-list')[0]
			newCursor = catalogPage.nextPageCursor
			oldCursor = catalogPage.previousPageCursor
			cursors[currentTab][0] = oldCursor
			cursors[currentTab][1] = newCursor
			loadedFlag = false
			itemList.innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
			bundleIds = []
			bundleItems = []
			for (i = 0; i < itemDetails.data.length; i++) {
				item = itemDetails.data[i]
				if (typeof item.lowestPrice != 'undefined') {
					if (item.lowestPrice == -1) {
						price = ""
					} else {
						price = item.lowestPrice
					}
				} else if (item.priceStatus == "No Resellers") {
					price = "No Sellers"
				} else {
					if (item.priceStatus != "Offsale") {
						price = item.price > 0 ? item.price : "Free"
					} else {
						price = "Offsale"
					}
				}
				if (item.itemType != "Bundle") {
					if (loadedFlag == false) {
						loadedFlag = true
						itemList.innerHTML = ""
					}
					itemElement = createItem(stripTags(item.name), item.id, price, false, false, parseInt(item.assetType).toString(), "")
					itemList.innerHTML += itemElement.outerHTML
					setAssetThumbnail(item.id)
				} else {
					bundleIds.push(item.id)
					bundleItems.push(item)
				}
			}
			if (itemDetails.data.length == 0) {
				if (loadedFlag == false) {
					loadedFlag = true
					itemList.innerHTML = ""
				}
			}
			if (bundleIds.length > 0) {
				bundles = await fetchBundleDetailsBulk(bundleIds)
				thumbs = await fetchBundleThumbnailsBulk(bundleIds)
				for (i = 0; i < thumbs.data.length; i++) {
					bundleThumbnails[parseInt(thumbs.data[i].targetId)] = thumbs.data[i].imageUrl
				}
				for (i = 0; i < bundles.length; i++) {
					item = bundleItems[i]
					userOutfitId = -1
					bundle = bundles[i]
					price = bundle.product.priceInRobux
					if (price == null) {
						if (bundle.product.noPriceText == "Free") {
							price = "Free"
						} else {
							price = "Offsale"
						}
					}
					for (j = 0; j < bundle.items.length; j++) {
						bundleItem = bundle.items[j]
						if (bundleItem.type == "UserOutfit") {
							userOutfitId = bundleItem.id
						}
					}
					if (loadedFlag == false) {
						loadedFlag = true
						itemList.innerHTML = ""
					}
					itemElement = createItem(stripTags(item.name), item.id, price, false, false, "Bundle", stripTags(bundleThumbnails[bundle.id]), bundle.bundleType)
					itemList.innerHTML += itemElement.outerHTML
				}
			}
			prevPage = itemList.getAttribute("page")
			if (cursor == "" & !back) {
				prevPage = 0
			}
			if (!back) {
				itemList.setAttribute("page", (parseInt(prevPage) + 1).toString())
			} else {
				itemList.setAttribute("page", (parseInt(prevPage) - 1).toString())
			}
			page = itemList.getAttribute("page")
			if (page == "1") {
				disabledString = "disabled"
			} else {
				disabledString = ""
			}
			if (newCursor == null) {
				disabledString2 = "disabled"
			} else {
				disabledString2 = ""
			}
			pagerHTML = `
			<div class="pager-holder" cursor-pagination="pager" ng-show="paginations.isEnabled">
				<ul class="pager">
				<li class="pager-prev ${disabledString}">
				<a class="prev-page"><span class="icon-back"></span></a></li>
				<li><span cursor="" class="page-num-text">Page ${parseInt(page)}</span> </li>
				<li class="pager-next ${disabledString2}">
				<a class="next-page">
				<span class="icon-next"></span></a> </li>
				</ul></div>
			</div>
			`
			itemList.innerHTML += pagerHTML
			$(itemList).find('.item-card-thumb').click(async function() {
				if ($(this).attr('class').includes('active')) {
					$(this).find('.checkmark-image').attr('src', chrome.runtime.getURL('/images/checkmark_end.png'))
					$(this).find('.checkmark-image').removeClass('active')
					if ($(this).attr('type') == "Bundle") {
						bundleDetails = await fetchBundleDetails($(this).attr('id'))
						bundleItems = bundleDetails[0].items
						bundleAssetIds = []
						for (i = 0; i < bundleItems.length; i++) {
							item = bundleItems[i]
							if (item.type == "Asset") {
								//if (!item.name.includes("Animation") && !item.name.includes("Rthro")) {
									bundleAssetIds.push(item.id)
								//}
							}
						}
						removeItemBulk(bundleAssetIds)
					} else {
						removeItem(parseInt($(this).attr('id')))
					}
				} else {
					if (paidItemsList.getPaidItems().includes(parseInt($(this).attr('id'))) && !await fetchSetting("sandboxOutfits")) {
						upgradeModal()
					} else {
						$(this).find('.checkmark-image').addClass('active')
						$(this).find('.checkmark-image').attr('src', chrome.runtime.getURL('/images/checkmark.png'))
						function changeImage(checkmark) {
							setTimeout(function(){
								$(checkmark).find('.checkmark-image').attr('src', chrome.runtime.getURL('/images/checkmark_done.gif'))
							}, 400)
						}
						changeImage(this)
						if ($(this).attr('type') == "Bundle") {
							bundleDetails = await fetchBundleDetails($(this).attr('id'))
							bundleItems = bundleDetails[0].items
							animationItems = []
							bundleAssetIds = []
							if (bundleDetails[0].bundleType == "Shoes") {
								for (var i = 0; i < bundleItems.length; i++) {
									item = bundleItems[i]
									if (i == 0) {
										assetTypeDict[item.id] = 70
									} else {
										assetTypeDict[item.id] = 71
									}
									bundleAssetIds.push(item.id)
								}
							} else {
								for (var i = 0; i < bundleItems.length; i++) {
									item = bundleItems[i]
									if (item.type == "UserOutfit") {
										outfitDetails = await fetchOutfitDetails(item.id)
										assets = outfitDetails.assets
										for (j = 0; j < assets.length; j++) {
											asset = assets[j]
											if ((!asset.assetType.name.includes("Animation")) || currentTab == "Animations") {
												if (asset.assetType.name.includes("Animation")) {
													animationItems.push(asset)
												} else {
													bundleAssetIds.push(asset.id)
												}
											}
										}
									}
								}
							}
							addItemBulk(bundleAssetIds)
						} else {
							addItem(parseInt($(this).attr('id')))
						}
					}
				}
				$(this).toggleClass('active')
			})
			$(itemList).find('.next-page').click(function() {
				currentTab = $(this).closest('.item-list').get(0).parentNode.parentNode.parentNode.id
				if (pageLoading == false) {
					if (!this.parentNode.classList.contains("disabled")) {
						updatePage(cursors[currentTab][1], keyword, false)
					}
				}
			})
			$(itemList).find('.prev-page').click(function() {
				if (pageLoading == false) {
					if (!this.parentNode.classList.contains("disabled")) {
						updatePage(cursors[currentTab][0], keyword, true)
					}
				}
			})
		}
	}
}

async function loadWearing() {
	document.getElementById('loaderView').setAttribute('style', 'position:absolute;display:block;')
	updateCurrentlyWearing()
	var params = getRenderParameters()
	assetsViewURL = await fetchAssetsView(JSON.stringify(params))
	if (assetsViewURL != "CANCELLED") {
		document.getElementById("sandboxView").src = "https://ropro.io/render/?" + assetsViewURL.split(".com/")[1] + "&background=" + background
		setTimeout(function(){
			document.getElementById('loaderView').setAttribute('style', 'position:absolute;display:none;')
		}, 500)
	}
}

function updateCurrentlyWearing() {
	wearingContainer = document.getElementById('wearingContainer')
	wearingContainer.innerHTML = ""
	for (i = 0; i < wearing.length; i++) {
		item = parseInt(wearing[i].id)
		div = document.createElement("div")
		div.innerHTML += `<div class="wearing-name input-group input-field"><a style="font-size:13px;font-weight:bold;" class="wearing-${item}" href="https://roblox.com/catalog/${item}/item">${stripTags(wearingInfoDict[item])}</a>
		<br><div id="outfitCostDiv" style="margin-top:-10px;display: inline-block;">
		<span style="margin-left:-5px;margin-right:-8px;margin-bottom:0px;transform: scale(0.4);" id="nav-robux" class="icon-robux-28x28 roblox-popover-close"></span>
		<span style="font-size:12px;" class="rbx-text-navbar-right text-header wearing-robux-${item}">${wearingCostDict[item] == null ? "Offsale" : addCommas(parseInt(wearingCostDict[item]))}</span></div>
		</div>
		<div style="display:inline-block;width:50px;height:50px;" class="thumbnail-2d-container wearing-card">
		<a><img itemid="${item}" class="item-card-thumb-container ropro-image-${item}" style="width:100%;height:100%;" src="${chrome.runtime.getURL('/images/empty.png')}">
		</a></div>`
		div.setAttribute("class", "wearing-div")
		wearingContainer.appendChild(div)
		itemImage = div.getElementsByTagName("img")[0]
		setAssetThumbnail(item)
		function listen(itemImage) {
			itemImage.addEventListener("click", function(){
				itemID = itemImage.getAttribute("itemid")
				removeItem(parseInt(itemID))
			})
		}
		listen(itemImage)
	}
}

var userID;

function getIds(wearing) {
	ids = []
	for (var i = 0; i < wearing.length; i++) {
		ids.push(parseInt(wearing[i].id))
	}
	return ids
}

async function loadCurrentlyWearing() {
	userID = await getStorage("rpUserID")
	document.getElementById('sandboxView').src = "https://ropro.io/render/?background=" + background
	currentlyWearing = await fetchCurrentlyWearing(userID)
	avatarRules = await fetchAvatarRules()
	for (const [_, value] of Object.entries(avatarRules.bodyColorsPalette)) {
		bodyColorPalette[value['brickColorId']] = value['hexColor']
	}
	playerAvatarType = {"playerAvatarType": currentlyWearing.playerAvatarType}
	bodyColors = {"headColor": bodyColorPalette[currentlyWearing.bodyColors.headColorId], "torsoColor": bodyColorPalette[currentlyWearing.bodyColors.torsoColorId], "leftArmColor": bodyColorPalette[currentlyWearing.bodyColors.leftArmColorId], "rightArmColor": bodyColorPalette[currentlyWearing.bodyColors.rightArmColorId], "leftLegColor": bodyColorPalette[currentlyWearing.bodyColors.leftLegColorId], "rightLegColor": bodyColorPalette[currentlyWearing.bodyColors.rightLegColorId]}
	scales = currentlyWearing.scales
	if (currentlyWearing.playerAvatarType == "R6") {
		document.getElementById('radio-R6').checked = true
	} else {
		document.getElementById('radio-R15').checked = true
	}
	document.getElementById('radio-R6').addEventListener('click', function() {
		document.getElementById('radio-R15').checked = false
		playerAvatarType = {"playerAvatarType": "R6"}
		loadWearing()
	})
	document.getElementById('radio-R15').addEventListener('click', function() {
		document.getElementById('radio-R6').checked = false
		playerAvatarType = {"playerAvatarType": "R15"}
		loadWearing()
	})
	document.getElementById('radio-2D').addEventListener('click', function() {
		document.getElementById('fullscreenToggle').style.display = "none"
		document.getElementById('radio-3D').checked = false
		thumbnailConfig = {"thumbnailId": 2, "thumbnailType": "2d", "size": "420x420"}
		loadWearing()
	})
	document.getElementById('radio-3D').addEventListener('click', function() {
		document.getElementById('fullscreenToggle').style.display = "block"
		document.getElementById('radio-2D').checked = false
		thumbnailConfig = {"thumbnailId": 3, "thumbnailType": "3d", "size": "420x420"}
		loadWearing()
	})
    assets = currentlyWearing.assets
    for (i = 0; i < assets.length; i++) {
		if (!assets[i].assetType.name.includes('Animation') || assets[i].name.includes('Idle')) {
			asset = assets[i]
			wearing.push(asset)
			calculateCost(asset.id)
		}
    }
	loadWearing()
	//Do outfit loading
	//if (await fetchSetting("sandboxOutfits")) {
		outfits = await fetchOutfits(userID);
		var outfitsJSON;
		try {
			outfitsJSON = JSON.parse(outfits);
		} catch (e) {
			outfitsJSON = outfits;
		}
		for (i = 0; i < outfitsJSON.length; i++) {
			outfit = outfitsJSON[i];
			items = stripTags(outfit.items)
			if (items.length > 0) {
				itemsArray = items.split(",");
			} else {
				itemsArray = [];
			}
			addOutfit(userID, itemsArray, stripTags(outfit.name), outfit.thumbnail);
		}
	//}
}

async function addItem(assetId) {
	if (!(paidItemsList.getPaidItems().includes(assetId) && !await fetchSetting("sandboxOutfits"))) {
		if (activeTab == "Animations") {
			if (currentAnimation != null) {
				removeItem(currentAnimation)
				$('.'+currentAnimation).toggleClass('active')
			}
			currentAnimation = assetId
			if (playerType == "R6") {
				document.getElementById('radio-R6').checked = false
				document.getElementById('radio-R15').checked = true
				switchPlayerType("R15")
				playerType = "R15"
			}
		}
		assetType = -1
		if (parseInt(assetId) in assetTypeDict) {
			assetType = assetTypeDict[parseInt(assetId)]
		}
		if (assetType in layeredClothingOrder) {
			wearing.push({"id": parseInt(assetId), "meta": {"order": layeredClothingOrder[assetType], "version": 1}})
		} else {
			wearing.push({"id": parseInt(assetId)})
		}
		calculateCost(assetId)
		loadWearing()
	}
}

function addItemBulk(assetIds) {
	for (i = 0; i < assetIds.length; i++) {
		assetId = assetIds[i]
		assetType = -1
		if (parseInt(assetId) in assetTypeDict) {
			assetType = assetTypeDict[parseInt(assetId)]
		}
		if (assetType in layeredClothingOrder) {
			wearing.push({"id": parseInt(assetId), "meta": {"order": layeredClothingOrder[assetType], "version": 1}})
		} else {
			wearing.push({"id": parseInt(assetId)})
		}
		calculateCost(assetId)
	}
	loadWearing()
}

function removeItem(assetId) {
	index = getIds(wearing).indexOf(parseInt(assetId))
	if (index != -1) {
		$('.'+assetId).find('.checkmark-image').attr('src', chrome.runtime.getURL('/images/checkmark_end.png'))
		$('.'+assetId).find('.checkmark-image').removeClass('active')
		wearing.splice(index, 1)
		delete wearingCostDict[assetId]
		calculateCost(-1)
		loadWearing()
	}
}

function removeItemBulk(assetIds) {
	for (i = 0; i < assetIds.length; i++) {
		assetId = assetIds[i]
		index = getIds(wearing).indexOf(parseInt(assetId))
		if (index != -1) {
			wearing.splice(index, 1)
			delete wearingCostDict[assetId]
			calculateCost(-1)
		}
	}
	loadWearing()
}

function clearItems() {
	wearing = []
	loadWearing()
}

async function advancedEquip(id) {
	if (parseInt(id).toString() != id) {
		alert("Invalid input. Input must be a numerical item ID.")
		return
	}
	itemDetails = await fetchDetails({"items": [{"id":parseInt(id),"itemType":"Asset"}]})
	if (itemDetails.data.length == 0) {
		alert("Item not found.")
		return
	}
	if (itemDetails.data[0].productId == -1) {
		alert("Invalid item ID.")
		return
	}
	if (getIds(wearing).includes(parseInt(id))) {
		alert("You already have this item equipped.")
		return
	}
	addItem(parseInt(id))
}

async function sandboxMain() {
	sandbox = document.createElement("div")
	sandbox.innerHTML += sandboxHTML
	sandbox.setAttribute("id", "sandbox")
	sandbox.setAttribute("class", "tab-pane resellers-container")
	sandbox.setAttribute("style", "width:1000px;margin:auto;")
	document.getElementsByClassName('content')[0].appendChild(sandbox)
	$(sandbox).find('.background-selector').click(function() {
		$('.background-checkmark-image').attr('src', chrome.runtime.getURL('/images/empty.png'))
		$(this).find('.background-checkmark-image').attr('src', chrome.runtime.getURL('/images/checkmark.png'))
		function changeImage(checkmark) {
			setTimeout(function(){
				$(checkmark).find('.background-checkmark-image').attr('src', chrome.runtime.getURL('/images/checkmark_done.gif'))
			}, 400)
		}
		changeImage(this)
		background = this.id
		loadWearing()
	})
	tab1 = createTab("Accessories")
	document.getElementById("Accessories").appendChild(tab1)
	tabs["Accessories"] = tab1
	currentPage = tab1
	tab1.getElementsByClassName('input-dropdown-btn')[0].addEventListener('click', function(){
		dropdown = tab1.getElementsByClassName('dropdown-custom')[0]
		dropdown.classList.toggle("active")
	})
	$('#advancedEquipInput').on('keypress',function(e) {
		if(e.which == 13) {
			advancedEquip(this.value)
			this.value = ""
		}
	})
	$('.sandbox-search').on('keypress',function(e) {
		if(e.which == 13) {
			updatePage("", this.value, false)
		}
	})
	$('.sandbox-search-button').click(function() {
		updatePage("", this.parentNode.parentNode.getElementsByClassName('sandbox-search')[0].value, false)
	})
	$('.dropdown-custom-item').click(function(){
		sortSelected = this.getElementsByTagName('a')[0].innerHTML
		this.parentNode.parentNode.getElementsByClassName('rbx-selection-label')[0].innerHTML = stripTags(sortSelected)
		this.parentNode.classList.toggle("active")
		currentSort = sortSelected
		updatePage("", "", false)
		
	})
	sandboxOutfitsEnabled = await fetchSetting("sandboxOutfits")
	$('#createOutfitButton').click(function(){
		if (sandboxOutfitsEnabled) {
			if (this.innerHTML == "Save") {
				document.getElementById('outfitNameGroup').style.display = "block"
				this.innerHTML = "Close"
				document.getElementById('outfitSubtitle').style.display = "none"
			} else {
				document.getElementById('outfitNameGroup').style.display = "none"
				this.innerHTML = "Save"
				document.getElementById('outfitSubtitle').style.display = "block"
			}
		} else {
			upgradeModal()
		}
	})
	$('#outfitNameInput').on('keypress', function(e) {
		if (e.which == 13) {
			createOutfit(this.value)
		}
	})
	$('.catalog-tab').click(function() {
		$('.catalog-tab').removeClass('active')
		$(this).toggleClass('active')
		tabName = stripTags(this.innerHTML.split("<span")[0])
		if (tabName in tabs) {
			tabs[tabName].style.display = "block"
			for (i = 0; i < Object.keys(tabs).length; i++) {
				tabCheck = Object.keys(tabs)[i]
				if (tabCheck != tabName) {
					tabs[tabCheck].style.display = "none"
				}
			}
			currentPage = document.getElementById(tabName)
			activeTab = tabName
			currentTab = tabName
			currentSort = Object.keys(sorts[tabName])[0]
		} else {
			tab = createTab(tabName)
			tabDiv = document.getElementById(tabName)
			tabDiv.appendChild(tab)
			tab.style.display = "block"
			tabs[tabName] = tab
			currentPage = tab
			for (i = 0; i < Object.keys(tabs).length; i++) {
				tabCheck = Object.keys(tabs)[i]
				if (tabCheck != tabName) {
					tabs[tabCheck].style.display = "none"
				}
			}
			tab.getElementsByClassName('input-dropdown-btn')[0].addEventListener('click', function(){
				dropdown = this.parentNode.getElementsByClassName('dropdown-custom')[0]
				dropdown.classList.toggle("active")
			})
			$(tabDiv).find('.sandbox-search').on('keypress',function(e) {
				if(e.which == 13) {
					updatePage("", this.value, false)
				}
			})
			$(tabDiv).find('.sandbox-search-button').click(function() {
				updatePage("", this.parentNode.parentNode.getElementsByClassName('sandbox-search')[0].value, false)
			})
			$(tabDiv).find('.dropdown-custom-item').click(function(){
				sortSelected = this.getElementsByTagName('a')[0].innerHTML
				this.parentNode.parentNode.getElementsByClassName('rbx-selection-label')[0].innerHTML = stripTags(sortSelected)
				this.parentNode.classList.toggle("active")
				currentSort = sortSelected
				updatePage("", "", false)
			})
			activeTab = tabName
			currentTab = tabName
			currentSort = Object.keys(sorts[tabName])[0]
			updatePage("", "", false)
		}
	})
	updatePage("", "", false)
	document.getElementById("fullscreenToggle").addEventListener("click", function() {
		sandboxFrame = document.getElementById('sandboxFrame')
		state = sandboxFrame.getAttribute('class')
		if (state == "sandbox-frame") {
			sandboxFrame.setAttribute('class', 'sandbox-frame-full')
			document.getElementById('fullscreenImage').src = chrome.runtime.getURL('/images/fullscreen_1.png')
		} else {
			sandboxFrame.setAttribute('class', 'sandbox-frame')
			document.getElementById('fullscreenImage').src = chrome.runtime.getURL('/images/fullscreen_0.png')
		}
	})
	if (await fetchSetting("sandboxOutfits")) {
		document.getElementById("upgradeCTA").childNodes[1].innerHTML = chrome.i18n.getMessage("PleaseConsiderLeavingUsAReview")
		document.getElementById("upgradeCTA").childNodes[3].innerHTML = chrome.i18n.getMessage("Review")
		document.getElementById("upgradeCTA").childNodes[3].href = "https://ropro.io/install"
	} else {
		$('.upgradeText').text(chrome.i18n.getMessage("UpgradeToSaveYourOutfits"));
		$('.upgradeButtonText').text(chrome.i18n.getMessage("Upgrade"));
	}
	$('.currentlyWearingText').text(chrome.i18n.getMessage("CurrentlyWearing"));
	$('.clickAnItemText').text(chrome.i18n.getMessage("ClickAnItemToUnequipIt"));
	$('.backgroundText').text(chrome.i18n.getMessage("Background"));
	$('.chooseBackgroundText').text(chrome.i18n.getMessage("ChooseABackgroundBelow"));
	$('.myOutfitsText').text(chrome.i18n.getMessage("MyOutfits"));
	$('.pressEnterKeyText').text(chrome.i18n.getMessage("PressTheEnterKeyToSubmitOutfitName"));
	$('.nameAndSaveText').text(chrome.i18n.getMessage("NameAndSaveYourOutfit"));
	$('.outfitCostText').text(chrome.i18n.getMessage("OutfitCost"));
	merch = await fetchMerch()
	merchJSON = {
		"items": [
		]
	}
	for (k = 0; k < merch.length; k++) {
		merchJSON.items.push(		  {
			"itemType": "Asset",
			"id": merch[k]
		  })
	}
	//itemDetails = await fetchDetails(merchJSON)
	//for (k = 0; k < itemDetails.data.length; k++) {
		//addMerch(itemDetails.data[k].id, itemDetails.data[k].name, itemDetails.data[k].price)
	//}
	document.getElementById('scrollLeft').addEventListener('click', function() {
		if (merchPage > 0) {
			merchPage--
			$('.ropro-merch').css("display", "none")
			for (k = merchPage * merchStep; k < Math.min(merchPage * merchStep + merchStep, merchCount); k++) {
				document.getElementsByClassName('ropro-merch')[k].style.display = "inline-block"
			}
		}
		if (merchPage == 0) {
			this.classList.add('disabled')
		} else {
			this.classList.remove('disabled')
		}
		if (merchPage >= Math.floor(merchCount / merchStep)) {
			document.getElementById('scrollRight').classList.add('disabled')
		} else {
			document.getElementById('scrollRight').classList.remove('disabled')
		}
	})
	document.getElementById('scrollRight').addEventListener('click', function() {
		if (merchPage < Math.floor(merchCount / merchStep)) {
			merchPage++
			$('.ropro-merch').css("display", "none")
			for (k = merchPage * merchStep; k < Math.min(merchPage * merchStep + merchStep, merchCount); k++) {
				document.getElementsByClassName('ropro-merch')[k].style.display = "inline-block"
			}
		}
		if (merchPage >= Math.floor(merchCount / merchStep)) {
			this.classList.add('disabled')
		} else {
			this.classList.remove('disabled')
		}
		if (merchPage == 0) {
			document.getElementById('scrollLeft').classList.add('disabled')
		} else {
			document.getElementById('scrollLeft').classList.remove('disabled')
		}
	})
}

function doMain() {
	setTimeout(async function() {
		try{
			document.getElementsByClassName('content')[0].style.height = "2000px"
			await sandboxMain()
			loadCurrentlyWearing()
			document.title = 'RoPro Avatar Sandbox'
		}catch{
			doMain()
		}
	}, 500)
}

doMain()
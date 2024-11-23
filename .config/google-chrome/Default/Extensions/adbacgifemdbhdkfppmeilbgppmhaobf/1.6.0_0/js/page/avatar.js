var url_matches = [
	"/my/avatar*"
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
//The content script matches defined in manifest.json should mostly handle this, but accounts for edge cases.
//In RoPro v2.0 this will be an ES6 imported module function.
if (!verifyPath(url_matches)) throw new Error('RoPro Error: Invalid path!');

var fetchAvatar = document.createElement('script');
fetchAvatar.src = chrome.runtime.getURL('/js/page/fetchAvatar.js');
(document.head||document.documentElement).appendChild(fetchAvatar);
fetchAvatar.onload = function() {
    fetchAvatar.remove();
}

var wearingHTML = `<div style="float:left;position:relative;width:277px;margin-bottom:20px;" class="ropro-avatar-menu" id="wearing">
<h5 style="padding-bottom:0px;" class="ng-binding"><span class="outfitCostText">Outfit Cost:</span> <span>
	<span id="outfitCostLoading" style="margin:-7px;transform: scale(0.6); width: 100px; height: 25px; visibility: initial !important;" class="spinner spinner-default"></span>
	<div id="outfitCostDiv" style="display:none;">
	<span style="margin-left:-5px;margin-right:-8px;margin-bottom:2px;transform: scale(0.6);" id="nav-robux" class="icon-robux-28x28 roblox-popover-close"></span>
	<span style="font-size:15px;" class="rbx-text-navbar-right text-header" id="outfitCostRobux">
</span></div></span>
</h5>
<h3 style="padding-bottom:0px;" class="ng-binding currentlyWearingText">Currently Wearing</h3>
<p style="margin-top:-2px;font-size:13px;display:inline-block;" class="ng-binding clickAnItemText">Click an item to unequip it.</p>
<div style="display:inline-block;width:25px;height:14px;margin-bottom:2px;font-size:10px;align:right;margin-right:25px;right:-5px;top:50px;transform:scale(0.9);margin-left:0px;white-space:nowrap;"><b style="cursor:pointer;" id="refreshAvatar">Refresh</b> | <b style="cursor:pointer;" id="redrawAvatar">Redraw</b></div>
<div style="line-height:0px;pointer-events:initial;margin-top:5px;" id="wearingContainer"><span>
	<span id="outfitCostLoading" style="margin:0px;transform: scale(0.8); width: 100px; height: 25px; visibility: initial !important;" class="spinner spinner-default"></span>
	<div id="outfitCostDiv" style="display:none;">
	<span style="margin-left:-5px;margin-right:-8px;margin-bottom:2px;transform: scale(0.6);" id="nav-robux" class="icon-robux-28x28 roblox-popover-close"></span>
	<span style="font-size:15px;" class="rbx-text-navbar-right text-header" id="outfitCostRobux">
</span></div></span></div>
<h3 style="padding-bottom:0px;margin-top:10px;position:relative;" class="ng-binding bodySelectorText">Body Selector <div style="position: absolute; top: 7px; right: 53px; z-index: 100;border-radius:0px;background:none;transform:scale(0.8);" class="avatar-type-toggle pill-toggle ng-scope" data-toggle="tooltip" title="Switch between classic R6 avatar and more expressive next generation R15 avatar"> <input type="radio" value="R6" onclick="document.getElementsByClassName('ropro-R6-label')[0].classList.add('ropro-active-radio');document.getElementsByClassName('ropro-R15-label')[0].classList.remove('ropro-active-radio');" class="ng-pristine ng-untouched ng-valid ng-not-empty" name="15"> <label onclick="document.getElementsByClassName('ropro-R6-label')[0].classList.add('ropro-active-radio');document.getElementsByClassName('ropro-R15-label')[0].classList.remove('ropro-active-radio');" class="ropro-R6-label" for="radio-R6">R6</label> <input type="radio" onclick="document.getElementsByClassName('ropro-R6-label')[0].classList.remove('ropro-active-radio');document.getElementsByClassName('ropro-R15-label')[0].classList.add('ropro-active-radio');" value="R15" class="ng-pristine ng-untouched ng-valid ng-not-empty" name="16"> <label onclick="document.getElementsByClassName('ropro-R6-label')[0].classList.remove('ropro-active-radio');document.getElementsByClassName('ropro-R15-label')[0].classList.add('ropro-active-radio');" class="ropro-R15-label" for="radio-R15">R15</label> </div><p id="defaultScales" style="position:absolute;right:17px;font-size:9px;display:inline-block;cursor:pointer;top:13px;font-weight:bold;" class="ng-binding clickAnItemText">Default</p><div></div>
</h3>
<div style="line-height:0px;pointer-events:initial;height:150px;width:275px;background-color:#1A1B1C;margin-top:5px;padding:5px;border-radius:15px;overflow:hidden;position:relative;" id="bodySelectorContainer"><div id="bodyColorContainer" style="float:left;transform:scaleX(0.8) scaleY(0.8);background-color:initial;padding:17px;margin:-17px;margin-top:-12px;border-radius:20px;margin-left:-7px;position:absolute;top:7px;left:0px;"><div style="width: 25px; height: 25px; margin-left: 37.5px; cursor: pointer; background-color: initial;" id="roproHeadColor"></div><div style="width: 25px; height: 50px; margin-left: 0px; margin-top: 2px; float: left; cursor: pointer; background-color: initial;" id="roproLeftArmColor"></div><div style="width: 46px; height: 50px; margin-left: 2px; margin-top: 2px; float: left; cursor: pointer; background-color: initial;" id="roproTorsoColor"></div><div style="width: 25px; height: 50px; margin-left: 2px; margin-top: 2px; float: left; cursor: pointer; background-color: initial;" id="roproRightArmColor"></div><br><div style="width: 22px; height: 50px; margin-left: 27px; margin-top: 2px; float: left; cursor: pointer; background-color: initial;" id="roproLeftLegColor"></div><div style="width: 22px; height: 50px; margin-left: 2px; margin-top: 2px; float: left; cursor: pointer; background-color: initial;" id="roproRightLegColor"></div></div><div id="bodyStyleBox" style="width:150px;float:right;position:absolute;top:16px;left:105px;"><img id="bodyStyleSelector" style="position:absolute;height:20px;top:88px;left:64.5px;cursor:pointer;-webkit-user-drag: none; user-select: none; display: none;" src="${chrome.runtime.getURL('/images/selector_icon.png')}"><img src="${chrome.runtime.getURL('/images/body_selector.svg')}"></div><div id="bodySizeBox" style="width:130px;float:right;margin-top:0px;position:absolute;top:5px;left:265px;"><img id="bodySizeSelector" style="position: absolute; height: 20px; top: 38.875px; left: 104.5px; cursor: pointer; -webkit-user-drag: none; user-select: none; display: none;" src="${chrome.runtime.getURL('/images/selector_icon.png')}"><img style="pointer-events:none;" src="${chrome.runtime.getURL('/images/body_size.svg')}"></div><div class="head-slider" id="headSizeBox" style="width:110px;float:right;margin-top:0px;position:absolute;top:25px;left:405px;"><img style="pointer-events: none; height: 80px; margin-left: 20px; transform: scale(1);" src="${chrome.runtime.getURL('/images/head_light.png')}" id="headSizeImage"><input type="range" oninput="document.getElementById('headSizeImage').style.transform='scale('+(0.9+this.value/50)+')';this.classList.remove('pr100');this.classList.remove('pr80');this.classList.remove('pr60');this.classList.remove('pr40');this.classList.remove('pr20');this.classList.remove('pr0');this.classList.add('pr' + (this.value * 20));" class="pr100" id="headSlider" step="1" min="0" max="5" value="5"></div></div>
<h3 style="padding-bottom:0px;margin-top:5px;" class="ng-binding backgroundText">Background
<button id="saveBackgroundButton" type="button" class="btn-fixed-width-lg btn-growth-lg" style="margin-top:7px;background-color:#0084dd;border:0px;width:130px;font-size:12px;padding:2px;float:right;display:none;">Save Background</button>
</h3>
</div>`

var backgroundContainerHTML = `<div style="line-height:0px;pointer-events:initial;margin-top:5px;position:relative;" id="backgroundContainer">
<div style="top:-17px;right:-15px;margin-top: 0px; height: 100px; width: 20px; display: block; position:absolute;transform:scale(0.7);" class="scroller next backgrounds-scroll-right" role="button" aria-hidden="true"><div style="transform:scale(0.8);margin-right:-9px;" class="arrow"><span class="icon-games-carousel-right"></span></div></div>
<div style="top:-17px;left:-20px;margin-top: 0px; height: 100px; width: 20px; display: block; position:absolute;transform:scale(0.7);" class="scroller prev disabled backgrounds-scroll-left" role="button" aria-hidden="true"><div class="arrow"><span style="transform:scale(0.8);margin-left:-4px;" class="icon-games-carousel-left"></span></div>
</div>`
var wearing = []
var wearingCostDict = {}
var wearingInfoDict = {}
var backgrounds = [{"name": "default", "image": "https://images.rbxcdn.com/a9755c3db57524e4bae224d4e5e99ba7-avatar-upsell-background.svg"}]
var backgroundsDict = {"default": "https://images.rbxcdn.com/a9755c3db57524e4bae224d4e5e99ba7-avatar-upsell-background.svg"}
var backgroundsPage = 0
var avatarBackground = "default"
var savedAvatarBackground = "default"
var scales = null
var scalesDetails = {height: -1, width: -1, proportion: -1, bodyType: -1, head: -1}
var rules = null
var bodyColorPalette = null
var mouseHeldBodySize = false
var mouseHeldBodyStyle = false
var bodySizeX = 0
var bodySizeY = 0
var bodySizeOffsetX = 55
var bodySizeOffsetY = 62.5
var bodyStyleX = 0
var bodyStyleY = 0

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

function setStorage(key, value) {
	return new Promise(resolve => {
		chrome.storage.sync.set({[key]: value}, function(){
			resolve()
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

function fetchInventory(userId, cursor, type) {
	assetTypes = "Head,Face,RightArm,LeftArm,LeftLeg,RightLeg"
	if (type == "accessories") {
		assetTypes = "HairAccessory,FaceAccessory,NeckAccessory,ShoulderAccessory,FrontAccessory,BackAccessory,WaistAccessory"
	} else if (type == "hats gear") {
		assetTypes = "Hat,Gear"
	} else if (type == "clothes") {
		assetTypes = "TShirt,Shirt,Pants,TShirtAccessory,ShirtAccessory,PantsAccessory"
	} else if (type == "new clothes") {
		assetTypes = "JacketAccessory,SweaterAccessory,ShortsAccessory,LeftShoeAccessory,RightShoeAccessory"
	}
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:'https://inventory.roblox.com/v2/users/' + userId + '/inventory?assetTypes=' + assetTypes + '&limit=100&sortOrder=Asc&cursor=' + cursor}, 
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

function fetchAvatarRules() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://avatar.roblox.com/v1/avatar-rules"}, 
			function(data) {
					resolve(data)
			})
	})
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
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
	for (i2 in wearing) {
		if (wearingCostDict[wearing[i2]] != null) {
			total += wearingCostDict[wearing[i2]]
		} else {
			offsale += 1
		}
	}
	return [total, offsale]
}

function fetchCurrentlyWearing(userId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://avatar.roblox.com/v1/users/"+userId+"/avatar"}, 
			function(data) {
					resolve(data)
			})
	})
}

function fetchBackgrounds() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getAvatarEditorBackgrounds.php"}, 
			function(data) {
				resolve(data)
			})
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

function reloadAvatar() {
	document.dispatchEvent(new CustomEvent('reloadAvatar'));
	loadCurrentlyWearing()
}

function unequipItem(assetId, assetTypeName) {
	document.dispatchEvent(new CustomEvent('unequipItem', {detail: {id: assetId}}))
	setTimeout(function() {
		loadCurrentlyWearing()
	}, 250)
}

function equipItem(assetId, assetTypeName) {
	document.dispatchEvent(new CustomEvent('equipItem', {detail: {id: assetId, assetTypeName: assetTypeName}}))
	setTimeout(function() {
		loadCurrentlyWearing()
	}, 250)
}

var thumbnailCache = {}

function setAssetThumbnail(id, dataSrc = false) {
	if (id in thumbnailCache) {
		if (dataSrc) {
			$('.ropro-image-' + parseInt(id)).attr("data-src", stripTags(thumbnailCache[id]))
		} else {
			$('.ropro-image-' + parseInt(id)).attr("src", stripTags(thumbnailCache[id]))
		}
		return thumbnailCache[id]
	}
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURLCached", url:"https://api.ropro.io/getAssetThumbnailUrl.php?id=" + parseInt(id)}, 
			function(data) {
					thumbnailCache[id] = data
					resolve(data)
					if (dataSrc) {
						$('.ropro-image-' + parseInt(id)).attr("data-src", stripTags(data))
					} else {
						$('.ropro-image-' + parseInt(id)).attr("src", stripTags(data))
					}
			})
	})
}

function setScales(height, width, proportion, bodyType, head) {
	scalesDetails = {height: height, width: width, proportion: proportion, bodyType: bodyType, head: head}
	document.dispatchEvent(new CustomEvent('setScales', {detail: scalesDetails}))
}

var inventory = []
var inventory_dict = {}
async function loadInventory(userId, cursor, type, retry, retryNum) {
	data = await fetchInventory(userId, cursor, type)
	if (retry == false) {
		for (i = 0; i < data.data.length; i++) {
			if (!(data.data[i].assetId in inventory_dict)) {
				inventory.push(data.data[i])
				inventory_dict[data.data[i].assetId] = data.data[i]
			}
		}
	}
	if (data.nextPageCursor != null) {
		await loadInventory(userId, data.nextPageCursor, type, false, 0)
	} else if (data.data.length == 100 && retryNum < 5) {
		await loadInventory(userId, cursor, type, true, retryNum + 1)
	}
}

function loadScrollImage(list) {
	for (i = 0; i < list.childNodes.length; i++) {
		elem = list.childNodes[i]
		if (elem.offsetTop < (list.clientHeight + list.scrollTop + 100)) {
			if (elem.style.display != "none" && elem.getElementsByTagName('img')[0].getAttribute('data-src') != "loaded" && elem.offsetTop >= list.scrollTop) {
				elem.getElementsByTagName('img')[0].src = elem.getElementsByTagName('img')[0].getAttribute('data-src')
				elem.getElementsByTagName('img')[0].setAttribute('data-src', 'loaded')
			}
		} else {
			break
		}
	}
}

function addQuickEquipItem(item) {
	li = document.createElement('li')
	li.setAttribute('style', 'height:80px;position:relative;')
	li.setAttribute('itemid', parseInt(item.assetId))
	li.setAttribute('class', 'qeitem')
	li.innerHTML = `<div class="section-content" style="padding:0px;width:529px;height:70px;position:absolute;left:5px;margin-bottom:10px;">
	<a target="_blank" href="https://www.roblox.com/catalog/${parseInt(item.assetId)}/Item">
		<img style="margin-left:10px;width:60px;float:left;" class="border-bottom ropro-image-${parseInt(item.assetId)}" data-src="${chrome.runtime.getURL('/images/empty.png')}" src=""></a><div class="border-bottom" style="position:absolute;right:5px;"><div style="float:right;"><a href="https://www.roblox.com/catalog/${parseInt(item.assetId)}/Item">
	</a>
<button type="button" class="btn-growth-lg add-quick-equip-item-button" itemassettypename="${stripTags(item.assetType)}" itemid="${parseInt(item.assetId)}" itemname="${stripTags(item.name)}" style="margin:5px;margin-left:10px;margin-top:15px;height:40px;width:40px;background-color:#0084DD;border:0px;font-size:30px;padding:5px;float:right;">+</button></div></div>
	<span style="" class="rbx-divider"></span>
<div style="white-space:nowrap;overflow:hidden;width:400px;position:absolute;padding:15px;top:8px;left:70px;" class="border-bottom">
<span>${stripTags(item.name)}</span>
	</div>
	</div>`
	li.getElementsByClassName('add-quick-equip-item-button')[0].addEventListener('click', function() {
		equipItem(parseInt(this.getAttribute('itemid')), this.getAttribute('itemassettypename'))
		document.getElementById('quickEquipModal').parentNode.remove()
	})
	document.getElementById('quickEquipInventoryList').appendChild(li)
	setAssetThumbnail(item.assetId, true)
}

function remove_duplicates(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    return ret_arr;
}

function fuzzyMatch(pattern, str) {
	pattern = '.*' + pattern.split('').join('.*') + '.*';
	const re = new RegExp(pattern);
	return re.test(str);
}

async function addQuickEquipModal() {
	quickEquipHTML = `<div id="quickEquipModal" class="upgrade-modal" style="z-index: 100000; display: block;">
	<div style="z-index:10000;display:block;overflow:hidden;" class="upgrade-modal">
		<div style="background-color:#232527;position:absolute;width:600px;height:575px;left:calc(50% - 300px);top:calc(50% - 300px);" class="dark-theme modal-content upgrade-modal-content">
			<span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
			<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;">
				<img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}">
				<p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Quick Equip Items</p>
			</h2>
			<span id="quickEquipLoading" style="margin:-7px;transform: scale(1.2); width: 100px; height: 25px; position:absolute;top:270px;left:250px;" class="spinner spinner-default"></span><div style="position:absolute;top:110px;width:550px;height:450px;left:25px;display:none;" id="inventoryDiv">
				<li class="panel-button" style="display: block;margin:10px;position:relative">
					<div style="margin-left:0px;height:30px;">
		<div id="filterSearchBar" style="overflow:visible;margin-top:-5px;margin-left:0px;float:left;width:530px;margin-left:0px;position:relative;" class="input-group-btn">
		<div class="input-group"><div><input id="filterSearch" class="form-control input-field new-input-field" placeholder="Inventory Search" maxlength="120" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value=""></div><div class="input-group-btn"><button style="margin-left:9px;" class="input-addon-btn"><span class="icon-common-search-sm"></span></button></div></div>
		<ul id="itemSearchList" style="position:absolute;top:38px;z-index:1000;"></ul>
		<ul id="itemSearchSelection" style="position:absolute;top:48px;width:100%;"></ul>
		</div>
		</div>
					
				</li>
				<ul class="inventoryList" style="width:560px;height:400px;overflow-y:auto;position:relative;margin-left:5px;" id="quickEquipInventoryList"></ul>
			</div>
		</div>
	</div>
	</div>`
	quickEquipDiv = document.createElement('div')
	quickEquipDiv.innerHTML = quickEquipHTML
	document.body.appendChild(quickEquipDiv)
	setTimeout(function() {
		document.getElementById('quickEquipModal').addEventListener('click', function(e) {
			if (document.getElementsByClassName('upgrade-modal-content').length > 0  && document.getElementById('secondaryModal') == null) {
				if (!document.getElementsByClassName('upgrade-modal-content')[0].contains(e.target)) {
					document.getElementById('quickEquipModal').parentNode.remove()
				}
			}
			if (document.getElementsByClassName('upgrade-modal-content-tertiary').length > 0 && document.getElementById('secondaryModal') == null) {
				if (!document.getElementsByClassName('upgrade-modal-content-tertiary')[0].contains(e.target)) {
					document.getElementById('quickEquipModal').parentNode.remove()
				}
			}
		})
	}, 500)
	document.getElementsByClassName('upgrade-modal-close')[0].addEventListener('click', function() {
		document.getElementById('quickEquipModal').parentNode.remove()
	})
	if (inventory.length == 0) {
		userID = parseInt(document.getElementsByName("user-data")[0].getAttribute("data-userid"))
		try {
			await loadInventory(userID, "", "hats gear", false, 0)
			await loadInventory(userID, "", "accessories", false, 0)
			await loadInventory(userID, "", "other", false, 0)
			await loadInventory(userID, "", "clothes", false, 0)
			await loadInventory(userID, "", "new clothes", false, 0)
		} catch {
			console.log("Inventory load error...")
		}
	}
	for (i = 0; i < inventory.length; i++) {
		addQuickEquipItem(inventory[i])
	}
	document.getElementById('quickEquipLoading').style.display = "none"
	document.getElementById('inventoryDiv').style.display = "block"
	loadScrollImage(document.getElementById('quickEquipInventoryList'))
	$("#quickEquipInventoryList").scroll(function() {
		loadScrollImage(this)
	})
	document.getElementById('filterSearch').focus()
	document.getElementById('filterSearch').addEventListener('input', function() {
		items = document.getElementsByClassName('qeitem')
		for(i = 0; i < items.length; i++) {
			id = parseInt(items[i].getAttribute('itemid'))
			if (inventory_dict[id].name.toLowerCase().includes(this.value.toLowerCase())) {
				items[i].style.display = "block"
			} else {
				items[i].style.display = "none"
			}
		}
		document.getElementById('quickEquipInventoryList').scrollTop = 0
		loadScrollImage(document.getElementById('quickEquipInventoryList'))
	})
}

function createUpgradeModal() {
    modalDiv = document.createElement('div')
    modalDiv.setAttribute('id', 'standardUpgradeModal')
    modalDiv.setAttribute('class', 'upgrade-modal')
    modalDiv.style.zIndex = 100000
    modalHTML = `<div id="standardUpgradeModal" style="z-index:10000;display:block;" class="upgrade-modal"><div style="background-color:#232527;position:absolute;width:500px;height:500px;left:-webkit-calc(50% - 250px);top:-webkit-calc(50% - 250px);" class="modal-content upgrade-modal-content">
    <span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
    <h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:20px;left:40px;"><img style="width:70px;left:0px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}"> RoPro Plus Feature</h2><div style="font-family:HCo Gotham SSm;color:white;font-size:16px;position:absolute;top:115px;left:200px;width:270px;">RoPro Outfit Swapper is only available for<br><b><img style="width:20px;margin-top:-3px;margin-right:3px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}">RoPro Plus</b><br>subscribers. This feature switches your avatar to a randomly chosen outfit you've made at a chosen time interval.</div><div style="font-family:HCo Gotham SSm;color:white;font-size:18px;position:absolute;top:270px;left:200px;width:270px;"><u>More Subscription Benefits:</u>
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

function checkCharacterType() {
	inputs = document.getElementsByClassName('avatar-type-toggle')[0].getElementsByTagName('input')
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].checked == true) {
			if (i == 0) {
				document.getElementsByClassName('left-wrapper')[0].getElementsByClassName('scale-container')[0].style.display = "none"
			} else {
				document.getElementsByClassName('left-wrapper')[0].getElementsByClassName('scale-container')[0].style.display = "block"
			}
		}
	}
}

function upgradeModal() {
    createUpgradeModal()
    document.getElementById('standardUpgradeModal').getElementsByTagName('video')[0].src = `https://ropro.io/dances/dance${(Math.floor(Math.random() * 18) + 1)}.webm`
    document.getElementById('standardUpgradeModal').style.display = "block"
}

async function addOutfitSwapper() {
	div = document.createElement('div')
	outfitRandomizerButtonHTML = `<button id="outfitRandomizerButton" style="margin-right:150px;" ng-if="selectedMenu.name !== 'PresetCostumes'" ng-type="button" class="btn-secondary-xs btn-float-right ng-binding ng-scope" ng-click="createOutfitClicked()"> <img class="outfit-randomizer-icon" style="width:15px;margin-top:-12px;margin-bottom:-10px;margin-right:4px;" src="${chrome.runtime.getURL('/images/random_game.svg')}">Outfit Swapper </button>`
	div.innerHTML = outfitRandomizerButtonHTML
	button = div.childNodes[0]
	document.getElementsByClassName('btn-secondary-xs btn-float-right ng-binding ng-scope')[0].parentNode.appendChild(button)
	button.addEventListener('click', function() {
		upgradeModal()
	})
}

async function addBackgrounds() {
	avatarBackgrounds = await fetchBackgrounds()
	for (i = 0; i < avatarBackgrounds.length; i++) {
		if (avatarBackgrounds[i].name != "none") {
			backgrounds.push(avatarBackgrounds[i])
		}
		backgroundsDict[avatarBackgrounds[i].name] = avatarBackgrounds[i].image
	}
	if (avatarBackground != "default" && typeof avatarBackground != "undefined") {
		setAvatarBackground(avatarBackground)
	}
	loadBackgroundPage()
	document.getElementById('saveBackgroundButton').addEventListener('click', function() {
		setStorage("avatarBackground", stripTags(avatarBackground))
		savedAvatarBackground = stripTags(avatarBackground)
		this.style.display = "none"
	})
}

async function loadBackgroundPage() {
	if (typeof avatarBackground == 'undefined') {
		avatarBackground = "default"
	}
	$('.avatar-background-selector').remove()
	for (i = 0; i < 5; i++) {
		index = (backgroundsPage * 5) + i
		backgroundName = backgrounds[index].name
		div = document.createElement('div')
		div.classList.add('avatar-background-selector')
		if (avatarBackground == backgroundName) {
			div.classList.add('selected')
		}
		div.setAttribute('style', `display:inline-block;height:63px;width:50px;overflow:hidden;margin-left:${i == 0 ? '2.5' : '5'}px;`)
		div.setAttribute('background-name', backgroundName.length >= 5 ? 'default' : backgroundName)
		imageSrc = backgroundsDict[backgroundName]
		div.innerHTML = `<img style="height:63px;" src="${imageSrc}">`
		document.getElementById('backgroundContainer').appendChild(div)
		div.addEventListener('click', function() {
			if (avatarBackground == this.getAttribute('background-name')) {
				setAvatarBackground("none")
				this.classList.remove("selected")
			} else {
				setAvatarBackground(stripTags(this.getAttribute('background-name')))
				$(".avatar-background-selector.selected").removeClass("selected")
				this.classList.add("selected")
			}
		})
	}
}

function setAvatarBackground(backgroundName) {
	if (backgroundName != savedAvatarBackground) {
		document.getElementById('saveBackgroundButton').style.display = 'inline-block'
	} else {
		document.getElementById('saveBackgroundButton').style.display = 'none'
	}
	avatarBackground = backgroundName.length >= 5 ? 'default' : backgroundName
	imageSrc = backgroundsDict[backgroundName]
	if (avatarBackground == 'default') {
		document.getElementsByClassName('avatar-back')[0].style.backgroundImage = ''
		document.getElementsByClassName('avatar-back')[0].style.backgroundSize = ''
	} else {
		document.getElementsByClassName('avatar-back')[0].style.backgroundImage = `url(${imageSrc})`
		document.getElementsByClassName('avatar-back')[0].style.backgroundSize = 'contain'
	}
}

function updateCurrentlyWearing() {
	wearingContainer = document.getElementById('wearingContainer')
	wearingContainer.innerHTML = ""
	for (i = 0; i < wearing.length; i++) {
		item = parseInt(stripTags(wearing[i].toString()))
		div = document.createElement("div")
		div.innerHTML += `<div class="wearing-name input-group input-field"><a style="font-size:13px;font-weight:bold;" class="wearing-${item}" href="https://roblox.com/catalog/${item}/item">${stripTags(wearingInfoDict[item])}</a>
		<br><div id="outfitCostDiv" style="margin-top:-10px;display: inline-block;">
		<span style="margin-left:-5px;margin-right:-8px;margin-bottom:0px;transform: scale(0.4);" id="nav-robux" class="icon-robux-28x28 roblox-popover-close"></span>
		<span style="font-size:12px;" class="rbx-text-navbar-right text-header wearing-robux-${item}">${wearingCostDict[item] == null ? "Offsale" : addCommas(parseInt(wearingCostDict[item]))}</span></div>
		</div>
		<div style="display:inline-block;width:50px;height:50px;" class="thumbnail-2d-container wearing-card">
		<a><img itemid="${item}" class="item-card-thumb-container ${item} ropro-image-${parseInt(item)}" style="width:100%;height:100%;" src="${chrome.runtime.getURL('/images/empty.png')}">
		</a></div>`
		div.setAttribute("class", "wearing-div")
		wearingContainer.appendChild(div)
		setAssetThumbnail(item)
		itemImage = div.getElementsByTagName("img")[0]
		function listen(itemImage) {
			itemImage.addEventListener("click", async function(){
				itemID = itemImage.getAttribute("itemid")
				unequipItem(parseInt(itemID))
				this.parentNode.parentNode.parentNode.remove()
			})
		}
		listen(itemImage)
	}
	div = document.createElement('div')
	div.innerHTML += `<div class="wearing-div"><div style="height:25px!important;margin-top:15px;z-index:1000;" class="wearing-name input-group input-field"><a style="font-size:13px;font-weight:bold;"><img src="${chrome.runtime.getURL('/images/ropro_logo_small.png')}" style="height:18px;margin-top:-2px;filter: drop-shadow(rgb(57,59,61) 2px 2px 1px);"> Quick Equip</a>
	<br>
	</div>
	<div style="display:inline-block;width:50px;height:50px;" class="thumbnail-2d-container wearing-card">
	<a><img class="item-card-thumb-container" style="width:100%;height:100%;filter:invert(0.7);" src="${chrome.runtime.getURL('/images/quick_add.png')}">
	</a></div></div>`
	div.setAttribute("class", "wearing-div")
	div.addEventListener('click', function() {
		addQuickEquipModal()
	})
	wearingContainer.appendChild(div)
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
	updateCurrentlyWearing()
}

function selectBodyPart(type) {
	document.getElementById('bodyColors').getElementsByClassName('advanced-link')[0].click()
	if (type == "roproHeadColor") {
		document.getElementById('radio-headColorId').click()
	} else if (type == "roproLeftArmColor") {
		document.getElementById('radio-leftArmColorId').click()
	} else if (type == "roproTorsoColor") {
		document.getElementById('radio-torsoColorId').click()
	} else if (type == "roproRightArmColor") {
		document.getElementById('radio-rightArmColorId').click()
	} else if (type == "roproLeftLegColor") {
		document.getElementById('radio-leftLegColorId').click()
	} else if (type == "roproRightLegColor") {
		document.getElementById('radio-rightLegColorId').click()
	}
}

async function loadCurrentlyWearing() {
	userID = parseInt(document.getElementsByName("user-data")[0].getAttribute("data-userid"))
	currentlyWearing = await fetchCurrentlyWearing(userID)
	wearing = []
	assets = currentlyWearing.assets
	for (i1 = 0; i1 < assets.length; i1++) {
		asset = assets[i1]
		if (!asset.assetType.name.includes("Animation") && !(asset.id in wearing)) {
			wearing.push(asset.id)
			calculateCost(asset.id)
		}
	}
	bodyColors = currentlyWearing.bodyColors
	document.getElementById('roproHeadColor').style.backgroundColor = stripTags(bodyColorPalette[bodyColors['headColorId']])
	document.getElementById('roproLeftArmColor').style.backgroundColor = stripTags(bodyColorPalette[bodyColors['leftArmColorId']])
	document.getElementById('roproTorsoColor').style.backgroundColor = stripTags(bodyColorPalette[bodyColors['torsoColorId']])
	document.getElementById('roproRightArmColor').style.backgroundColor = stripTags(bodyColorPalette[bodyColors['rightArmColorId']])
	document.getElementById('roproLeftLegColor').style.backgroundColor = stripTags(bodyColorPalette[bodyColors['leftLegColorId']])
	document.getElementById('roproRightLegColor').style.backgroundColor = stripTags(bodyColorPalette[bodyColors['rightLegColorId']])
	scales = currentlyWearing.scales
	if ((scalesDetails.width / 100).toFixed(2) != scales.width) {
		bodySizeX = ((scales.width - rules.scales.width.min) / (rules.scales.width.max - rules.scales.width.min)) * 100
		bodySizeLeft = (bodySizeOffsetX - 50 + ((scales.width - rules.scales.width.min) / (rules.scales.width.max - rules.scales.width.min) * 100)).toFixed(1)
		document.getElementById('bodySizeSelector').style.left = parseFloat(bodySizeLeft) + "px"	
	}
	if ((scalesDetails.height / 100).toFixed(2) != scales.height) {
		bodySizeY = ((scales.height - rules.scales.height.min) / (rules.scales.height.max - rules.scales.height.min)) * 100
		bodySizeTop = (bodySizeOffsetY - 50 + 100 - ((scales.height - rules.scales.height.min) / (rules.scales.height.max - rules.scales.height.min) * 100)).toFixed(1)
		document.getElementById('bodySizeSelector').style.top = parseFloat(bodySizeTop) + "px"
	}
	if ((scalesDetails.bodyType / 100).toFixed(2) != scales.bodyType) {
		bodyStyleY = ((scales.bodyType - rules.scales.bodyType.min) / (rules.scales.bodyType.max - rules.scales.bodyType.min)) * 100
		bodyStyleTop = 95 - ((scales.bodyType - rules.scales.bodyType.min) / (rules.scales.bodyType.max - rules.scales.bodyType.min) * 100).toFixed(1)
		document.getElementById('bodyStyleSelector').style.top = parseFloat(bodyStyleTop) + "px"
	}
	if ((scalesDetails.proportion / 100).toFixed(2) != scales.proportion) {
		bodyStyleX = 55 - ((scales.proportion - rules.scales.proportion.min) / (rules.scales.proportion.max - rules.scales.proportion.min)) * 110
		bounds = [bodyStyleY / - (5 / 3), bodyStyleY / (5 / 3)]
		if (bodyStyleX > bounds[0]) {
			if (bodyStyleX < bounds[1]) {
				bodyStyleLeft = bodyStyleX
			} else {
				bodyStyleLeft = bounds[1]
			}
		} else {
			bodyStyleLeft = bounds[0]
		}
		bodyStyleLeft += 64.5
		document.getElementById('bodyStyleSelector').style.left = parseFloat(bodyStyleLeft) + "px"
	}
	if ((scalesDetails.head / 100).toFixed(2) != scales.head) {
		document.getElementById('headSlider').setAttribute('class', '')
		document.getElementById('headSlider').value = ((scales.head - rules.scales.head.min) * 100).toFixed()
		document.getElementById('headSlider').classList.add('pr' + (parseInt(document.getElementById('headSlider').value) * 20));
		document.getElementById('headSizeImage').style.transform='scale('+(0.9+parseInt(document.getElementById('headSlider').value)/50)+')';
	}
	document.getElementById('bodySizeSelector').style.display = "block"
	document.getElementById('bodyStyleSelector').style.display = "block"
	height = scales.height
	width = scales.width
	proportion = scales.proportion
	bodyType = scales.bodyType
	document.getElementById('bodyColorContainer').style.transform = "scaleX(" + (0.8 * width - (0.1 * (0.5 - (1 - proportion)))) + ") scaleY(" + (0.9 * height - (0.2 * (0.25 - bodyType))) + ")"
	if (currentlyWearing.playerAvatarType == "R6") {
		document.getElementsByClassName('ropro-R6-label')[0].classList.add('ropro-active-radio')
		document.getElementsByClassName('ropro-R15-label')[0].classList.remove('ropro-active-radio')
	} else {
		document.getElementsByClassName('ropro-R15-label')[0].classList.add('ropro-active-radio')
		document.getElementsByClassName('ropro-R6-label')[0].classList.remove('ropro-active-radio')
	}
}

function calculateDistance(elem, mouseX, mouseY) {
	return [mouseX - (elem.offset().left+(elem.width()/2)), mouseY - (elem.offset().top+(elem.height()/2))]
}

function getDistance(x1, y1, x2, y2){
    let y = x2 - x1;
    let x = y2 - y1;
    
    return Math.sqrt(x * x + y * y);
}

async function mainAvatar() {
	if (await fetchSetting("avatarEditorChanges")) {
		avatarBox = $("[avatar-back]")
		if (avatarBox.length > 0) {
			div = document.createElement('div')
			div.innerHTML = wearingHTML
			insertAfter(div.childNodes[0], avatarBox.get(0))
			try{
				hideUI = document.createElement('a')
				hideUI.classList.add('text-link')
				hideUI.setAttribute('style', 'margin-right:10px')
				hideUI.innerText = 'Hide UI'
				document.getElementsByClassName('redraw-avatar')[0].appendChild(hideUI)
				hideUI.addEventListener('click', function() {
					if (document.getElementsByClassName('avatar-type-toggle')[0].style.display == "none") {
						document.getElementsByClassName('avatar-type-toggle')[0].style.display = "block"
						document.getElementsByClassName('toggle-three-dee btn-control')[0].style.display = "block"
						//document.getElementsByClassName('left-wrapper')[0].getElementsByClassName('scale-container')[0].style.display = "block"
						this.innerText = "Hide UI"
						//checkCharacterType()
					} else {
						document.getElementsByClassName('avatar-type-toggle')[0].style.display = "none"
						document.getElementsByClassName('toggle-three-dee btn-control')[0].style.display = "none"
						//document.getElementsByClassName('left-wrapper')[0].getElementsByClassName('scale-container')[0].style.display = "none"
						this.innerText = "Show UI"
					}
				})
				document.getElementsByClassName('avatar-type-toggle')[0].addEventListener('click', function() {
					//checkCharacterType()
				})
				document.getElementsByClassName('left-wrapper')[0].classList.remove('left-wrapper')
				document.getElementsByClassName('avatar-back')[0].classList.add('left-wrapper')
				document.getElementsByClassName('avatar-back')[0].style.height = "initial"
				document.getElementsByClassName('avatar-back')[0].style.zIndex = 2
				document.getElementsByClassName('ropro-avatar-menu')[0].style.zIndex = 1
			} catch(e) {
				console.log(e)
			}
			document.getElementById('redrawAvatar').addEventListener('click', function() {
				reloadAvatar()
			})
			document.getElementById('refreshAvatar').addEventListener('click', function() {
				setScales(scales.height * 100, scales.width * 100, scales.proportion * 100, scales.bodyType * 100, scales.head * 100)
			})
			rules = await fetchAvatarRules()
			bodyColorPalette = {}
			for (const [key, value] of Object.entries(rules.bodyColorsPalette)) {
				bodyColorPalette[value['brickColorId']] = value['hexColor']
			}
			loadCurrentlyWearing()
			backgroundDiv = document.createElement('div')
			backgroundDiv.innerHTML = backgroundContainerHTML
			document.getElementById('wearing').insertBefore(backgroundDiv, document.getElementsByClassName('backgroundText')[0].nextElementSibling)
			document.getElementsByClassName('content')[0].style.marginBottom = "400px"
			document.getElementsByClassName('backgrounds-scroll-right')[0].addEventListener('click', function() {
				if (backgroundsPage * 5 < backgrounds.length - 5) {
					backgroundsPage++
					loadBackgroundPage()
					if (backgroundsPage * 5 >= backgrounds.length - 5) {
						this.classList.add('disabled')
					}
					document.getElementsByClassName('backgrounds-scroll-left')[0].classList.remove('disabled')
				}
			})
			document.getElementsByClassName('backgrounds-scroll-left')[0].addEventListener('click', function() {
				if (backgroundsPage > 0) {
					backgroundsPage--
					loadBackgroundPage()
					if (backgroundsPage == 0) {
						this.classList.add('disabled')
					}
					document.getElementsByClassName('backgrounds-scroll-right')[0].classList.remove('disabled')
				}
			})
			savedAvatarBackground = await getStorage("avatarBackground")
			avatarBackground = savedAvatarBackground
			addBackgrounds()
			//addOutfitSwapper()
			$("#roproHeadColor").click(function(){
				selectBodyPart(this.id)
			})
			$("#roproLeftArmColor").click(function(){
				selectBodyPart(this.id)
			})
			$("#roproTorsoColor").click(function(){
				selectBodyPart(this.id)
			})
			$("#roproRightArmColor").click(function(){
				selectBodyPart(this.id)
			})
			$("#roproLeftLegColor").click(function(){
				selectBodyPart(this.id)
			})
			$("#roproRightLegColor").click(function(){
				selectBodyPart(this.id)
			})
			document.getElementById('bodySizeSelector').addEventListener('mousedown', e => {
				mouseHeldBodySize = true
			});
			document.getElementById('bodyStyleSelector').addEventListener('mousedown', e => {
				mouseHeldBodyStyle = true
			});
			$(document).mouseup(function(e){
				if (mouseHeldBodySize == true) {
					mouseHeldBodySize = false
					width = 0
					height = 0
					if (bodySizeX > 50) {
						width = (rules.scales.width.min + (rules.scales.width.max - rules.scales.width.min) * (Math.ceil(bodySizeX) / 100)).toFixed(2)
					} else {
						width = (rules.scales.width.min + (rules.scales.width.max - rules.scales.width.min) * (Math.floor(bodySizeX) / 100)).toFixed(2)
					}
					if (bodySizeY > 50) {
						height = (rules.scales.height.min + (rules.scales.height.max - rules.scales.height.min) * (Math.ceil(bodySizeY) / 100)).toFixed(2)
					} else {
						height = (rules.scales.height.min + (rules.scales.height.max - rules.scales.height.min) * (Math.floor(bodySizeY) / 100)).toFixed(2)
					}
					setScales(height * 100, width * 100, scales.proportion * 100, scales.bodyType * 100, scales.head * 100)
				}
				if (mouseHeldBodyStyle == true) {
					mouseHeldBodyStyle = false
					distance = calculateDistance($("#bodyStyleBox"), e.pageX, e.pageY)
					proportion = (rules.scales.proportion.min + (rules.scales.proportion.max - rules.scales.proportion.min) * (1 - Math.floor(Math.min(getDistance(-54.599, 91, bodyStyleX, bodyStyleY), 90)) / 90).toFixed(2)).toFixed(2)
					bodyType = (rules.scales.bodyType.min + (rules.scales.bodyType.max - rules.scales.bodyType.min) * (Math.round(bodyStyleY) / 91)).toFixed(2)
					setScales(scales.height * 100, scales.width * 100, proportion * 100, bodyType * 100, scales.head * 100)
				}
			});
			document.addEventListener('mousemove', function(e) {
				if (mouseHeldBodySize) {
					distance = calculateDistance($("#bodySizeBox"), e.pageX, e.pageY)
					if (Math.abs(distance[1]) <= 50) {
						bodySizeY = 100 - (distance[1] + 50)
						document.getElementById('bodySizeSelector').style.top = (distance[1] + bodySizeOffsetY) + "px"
						//document.getElementById('bodyColorContainer').style.transform = "scaleX(" + parseFloat(document.getElementById('bodyColorContainer').style.transform.split("scaleX(")[1].split(")")[0]) + ") scaleY(" + (0.8 * (rules.scales.height.min + (rules.scales.height.max - rules.scales.height.min) * (Math.ceil(bodySizeY) / 100)).toFixed(2)) + ")"
					}
					if (Math.abs(distance[0]) <= 50) {
						bodySizeX = distance[0] + 50
						document.getElementById('bodySizeSelector').style.left = (distance[0] + bodySizeOffsetX) + "px"
						//document.getElementById('bodyColorContainer').style.transform = "scaleX(" + (0.8 * (rules.scales.width.min + (rules.scales.width.max - rules.scales.width.min) * (Math.ceil(bodySizeX) / 100)).toFixed(2)) + ") scaleY(" + parseFloat(document.getElementById('bodyColorContainer').style.transform.split("scaleY(")[1].split(")")[0]) + ")"
					}
					height = (rules.scales.height.min + (rules.scales.height.max - rules.scales.height.min) * (Math.floor(bodySizeY) / 100)).toFixed(2)
					width = (rules.scales.width.min + (rules.scales.width.max - rules.scales.width.min) * (Math.ceil(bodySizeX) / 100)).toFixed(2)
					proportion = (rules.scales.proportion.min + (rules.scales.proportion.max - rules.scales.proportion.min) * (1 - Math.floor(Math.min(getDistance(-54.599, 91, bodyStyleX, bodyStyleY), 90)) / 90).toFixed(2)).toFixed(2)
					bodyType = (rules.scales.bodyType.min + (rules.scales.bodyType.max - rules.scales.bodyType.min) * (Math.round(bodyStyleY) / 91)).toFixed(2)
					document.getElementById('bodyColorContainer').style.transform = "scaleX(" + (0.8 * width - (0.1 * (0.5 - (1 - proportion)))) + ") scaleY(" + (0.9 * height - (0.2 * (0.25 - bodyType))) + ")"
				}
				if (mouseHeldBodyStyle) {
					distance = calculateDistance($("#bodyStyleBox"), e.pageX, e.pageY)
					if (distance[1] <= 38 && distance[1] >= -55) {
						bodyStyleY = Math.max(0, parseInt(92 - (distance[1] + 55)))
						document.getElementById('bodyStyleSelector').style.top = (distance[1] + 50) + "px"
					}
					if (distance[0] >= 0) {
						bodyStyleX = Math.max(0, parseInt(distance[0]))
						bodyStyleX = Math.min(bodyStyleX, bodyStyleY / (5 / 3))
						document.getElementById('bodyStyleSelector').style.left = (bodyStyleX + 64.5) + "px"
					} else {
						bodyStyleX = Math.min(0, parseInt(distance[0]))
						bodyStyleX = Math.max(bodyStyleX, -bodyStyleY / (5 / 3))
						document.getElementById('bodyStyleSelector').style.left = (bodyStyleX + 64.5) + "px"
					}
					height = (rules.scales.height.min + (rules.scales.height.max - rules.scales.height.min) * (Math.floor(bodySizeY) / 100)).toFixed(2)
					width = (rules.scales.width.min + (rules.scales.width.max - rules.scales.width.min) * (Math.ceil(bodySizeX) / 100)).toFixed(2)
					proportion = (rules.scales.proportion.min + (rules.scales.proportion.max - rules.scales.proportion.min) * (1 - Math.floor(Math.min(getDistance(-54.599, 91, bodyStyleX, bodyStyleY), 90)) / 90).toFixed(2)).toFixed(2)
					bodyType = (rules.scales.bodyType.min + (rules.scales.bodyType.max - rules.scales.bodyType.min) * (Math.round(bodyStyleY) / 91)).toFixed(2)
					document.getElementById('bodyColorContainer').style.transform = "scaleX(" + (0.8 * width - (0.1 * (0.5 - (1 - proportion)))) + ") scaleY(" + (0.9 * height - (0.2 * (0.25 - bodyType))) + ")"
				}
			});
			document.getElementById('headSlider').addEventListener('change', function() {
				setScales(scales.height * 100, scales.width * 100, scales.proportion * 100, scales.bodyType * 100, (((rules.scales.head.max - rules.scales.head.min) * (parseInt(this.value) / 5) + rules.scales.head.min) * 100).toFixed())
			})
			document.getElementById('defaultScales').addEventListener('click', function() {
				setScales(100, 100, 0, 0, 100)
				scalesDetails = {height: -1, width: -1, proportion: -1, bodyType: -1, head: -1}
			})
		} else {
			setTimeout(function() {
				mainAvatar()
			}, 100)
		}
	}
}

mainAvatar()

var thumbnailExists = 0
var loadingWearing = false
async function mainInterval() {
	if (await fetchSetting("avatarEditorChanges")) {
		setInterval(function() {
			if (loadingWearing == false) {
				if (Math.max($('#UserAvatar thumbnail-2d').length, $('#UserAvatar thumbnail-3d').length) != thumbnailExists) {
					thumbnailExists = Math.max($('#UserAvatar thumbnail-2d').length, $('#UserAvatar thumbnail-3d').length)
					if (thumbnailExists == 1 || thumbnailExists == 0) {
						setTimeout(function() {
							loadingWearing = true
							setTimeout(function() {
								loadingWearing = false
							}, 2000)
							loadCurrentlyWearing()
						}, 100)
					}
				}
			}
		}, 10)
		$(document).ready(function() {
			document.getElementsByTagName('body')[0].classList.add('ropro-changes')
		})
		window.addEventListener('load', (event) => {
			//checkCharacterType()
		});
	} else {
		$(document).ready(function() {
			document.getElementsByTagName('body')[0].classList.add('changes-disabled')
		})
	}
}
mainInterval()
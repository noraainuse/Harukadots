var url_matches = [
	"/trades*",
	"/users/*"
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

var fetchAngular = document.createElement('script');
fetchAngular.src = chrome.runtime.getURL('/js/page/fetchAngular.js');
(document.head||document.documentElement).appendChild(fetchAngular);
fetchAngular.onload = function() {
    fetchAngular.remove();
}

function fetchAssetsView(itemID) {
	return new Promise(resolve => {
		function getURL(itemID) {
			var renderParameters = JSON.stringify({"avatarDefinition":{"assets":[{"id":itemID}],"bodyColors":{"headColor":"#F8F8F8","torsoColor":"#F8F8F8","leftArmColor":"#F8F8F8","rightArmColor":"#F8F8F8","leftLegColor":"#F8F8F8","rightLegColor":"#F8F8F8"},"playerAvatarType":{"playerAvatarType":"R15"},"scales":{"height":1,"width":1,"head":1,"depth":1,"proportion":0,"bodyType":0}},"thumbnailConfig":{"thumbnailId":3,"thumbnailType":"3d","size":"420x420"}})
			chrome.runtime.sendMessage({greeting: "PostValidatedURL", url:"https://avatar.roblox.com/v1/avatar/render", jsonData: renderParameters}, 
				function(data) {
					if (itemID == tryOnItemID) {
						if (data == null) {
							setTimeout(function(){
								getURL(itemID)
							}, 2000)
						} else {
							if (data.state == "Completed") {
								resolve(data.imageUrl.split("rbxcdn.com/")[1])
							} else {
								setTimeout(function(){
									getURL(itemID)
								}, 2000)
							}
						}
					} else {
						resolve("")
					}
				})
		}
		getURL(itemID)
	})
}

function fetchItems(idList) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/tradeBackend.php?ids=" + idList.join(",")}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchItemMiniSearch(search) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/itemSearch.php?q="+search},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchFlag(userId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/fetchFlag.php?id=" + userId},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchFlagsBatch(userIds) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/fetchFlags.php?ids=" + userIds.join(",")},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchTradeBotters(userIds, reqType) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostURL", wrap_json: true, url:"https://api.ropro.io/batchFlags.php?form", jsonData:{reqType: reqType, ids: userIds.join(",")}},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchItemDetails(itemId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostValidatedURL", url:"https://catalog.roblox.com/v1/catalog/items/details", jsonData: JSON.stringify({"items":[{"id":itemId,"itemType":"Asset"}]})}, 
			function(data) {
					resolve(data.data[0])
			})
	})
}

function fetchSalesData(itemId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://economy.roblox.com/v1/assets/" + itemId + "/resale-data"},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchValues(trades) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostURL", wrap_json: true, url:"https://api.ropro.io/tradePreviewBackend.php?form=true", jsonData: trades}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchRecentSales(itemId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/recentSales.php?id=" + itemId},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchCachedTrades() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetCachedTrades"},
			function(data) {
				resolve(data)
			}
		)
	})
}

function cacheTrade(tradeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "DoCacheTrade", tradeId: tradeId},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchAdditionalInfo(itemId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/additionalItemInfo.php?id=" + itemId},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchProjecteds(type) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/fetchProjecteds.php?type=" + type},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetch3DThumbnail(itemId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://avatar.roblox.com/v1/try-on/3d?assetIds=" + itemId + "&addAccoutrements=false"},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchTradesType(type) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetTrades", type: type},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchTradesData(type) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetTradesData", type: type},
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

function doDeclineBots() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "DeclineBots"}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function declineTrade(tradeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "DeclineTrade", tradeId: tradeId}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchInventory(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetUserLimitedInventory", userID: userID}, 
			function(data) {
				resolve(data)
			}
		)
	})
}


function fetchUserID() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetUserID"}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function flagTrader(userId, reqType) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/flagTrader.php?id=" + userId + "&reqType=" + reqType}, 
			function(data) {
				resolve(data)
			}
		)
	})
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

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

function getLocalStorage(key) {
	return new Promise(resolve => {
		chrome.storage.local.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

function getIdFromCard(item) {
	url = item.getElementsByClassName("item-card-caption")[0].getElementsByTagName("a")[0].href
	id = url.split("/catalog/")[1].split("/")[0]
	return id
}

function getIdFromTradeCard(item) {
	return item.getElementsByClassName('thumbnail-2d-container')[0].getAttribute("thumbnail-target-id")
}
async function getJSON() {
	itemList = []
	itemCards = document.getElementsByClassName("item-card-container")
	for (i = 0; i < itemCards.length; i++) {
		item = itemCards[i]
		itemList.push(getIdFromCard(item))
	}
	tradeItem = document.getElementsByClassName("trade-request-item ng-scope")
	for (i = 0; i < tradeItem.length; i++) {
		item = tradeItem[i]
		if (item.getElementsByClassName('thumbnail-2d-container')[0] != undefined) {
			itemList.push(getIdFromTradeCard(item))
		}
	}
	itemJSON = await fetchItems(itemList)
	return itemJSON
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

function addRecentSaleCard(sale) {
	oldRAP = parseInt(sale.oldrap)
	newRAP = parseInt(sale.newrap)
	price = Math.max(((newRAP - oldRAP) * -10 - oldRAP) / -1, 1)
	percentChange = (((newRAP - oldRAP) / oldRAP) * 100).toFixed(1)
	recentSaleCardHTML = `<li class="recent-sale-card" style="position:relative;padding:15px;padding-right:0px;padding-left:0px;padding-top:0px;padding-bottom:0px;margin-bottom:0px;margin-top:5px;"><div style="width:90%;padding:5px;background-color:#393B3D;margin-left:0px;border-radius:4px;margin-left:5%;" class="icon-text-wrapper clearfix icon-robux-price-container">
	<span class="icon icon-robux-white-16x16 item-card-price-trend-icon" style="background-image: url(${chrome.runtime.getURL(`/images/${newRAP >= oldRAP ? 'up_arrow' : 'down_arrow'}.png`)}); background-position: 0px 3px; background-size: 100%; width: 12px; margin-left: 0px; margin-bottom: 0px;"></span><span class="icon-robux-white-16x16 wait-for-i18n-format-render"></span>
	<b class="text-robux-md wait-for-i18n-format-render item-card-rap">${addCommas(price)}</b>
	</div><div style="position:absolute;right:12px;top:8px;font-size:12px;color:gray;">${formatTime(parseInt(sale.date)*1000)}</div>
	<div class="recent-sale-more-info" style="position:absolute;left:-162px;top:-20px;font-size:12px;color:white;background-color:#393B3D;min-width:165px;height:85px;border-radius:7px;filter: drop-shadow(${percentChange >= 0 ? "#39ff14" : "#ff073a"} 0px 0px 2px);padding:5px;text-align:center;"><div style="width:60%;font-size:12px;float:left;"><b><u>New RAP</u><div><span class="icon-robux-white-16x16 wait-for-i18n-format-render" style="transform:scale(0.8);"></span><b class="text-robux-md wait-for-i18n-format-render item-card-rap" style="font-size:12px;">${addCommas(parseInt(newRAP))}</b></div></b><b><u>Old RAP</u><div><span class="icon-robux-white-16x16 wait-for-i18n-format-render" style="transform:scale(0.8);"></span><b class="text-robux-md wait-for-i18n-format-render item-card-rap" style="font-size:12px;">${addCommas(parseInt(oldRAP))}</b></div></b></div><div style="display:inline-block;width:40%;float:right;"><div style="margin-top:25px;font-size:18px;font-weight:bold;color:${percentChange >= 0 ? "#39ff14" : "#ff073a"};">${percentChange >= 0 ? "+" + Math.abs(percentChange): percentChange}%</div></div></div>
	</li>`
	div = document.createElement('div')
	div.innerHTML = recentSaleCardHTML
	document.getElementById('recentSalesList').appendChild(div)
}

var tryOnItemID = null;

var foregroundOpacity = undefined;

var tradeInventory = [null, null];

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

const asc = arr => arr.sort((a, b) => a - b);

const sum = arr => arr.reduce((a, b) => a + b, 0);

const mean = arr => sum(arr) / arr.length;

const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};
const q25 = arr => quantile(arr, .25);
const q50 = arr => quantile(arr, .50);
const q75 = arr => quantile(arr, .75);
const median = arr => q50(arr);
async function formatCard(itemid, infoCard) {
	tryOnItemID = itemid
	tryOnURL = fetchAssetsView(itemid)
	details = await fetchItemDetails(itemid)
	salesData = await fetchSalesData(itemid)
	recentSales = await fetchRecentSales(itemid)
	additionalInfo = await fetchAdditionalInfo(itemid)
	itemCardLoading = infoCard.getElementsByClassName('item-card-loading')[0]
	itemCardName = infoCard.getElementsByClassName('item-card-name')[0]
	itemCardNameContainer = infoCard.getElementsByClassName('item-name-container')[0]
	itemCardCreator = infoCard.getElementsByClassName('item-card-creator')[0] 
	itemCardBestPrice = infoCard.getElementsByClassName('item-card-bestprice')[0]
	itemCardRAP = infoCard.getElementsByClassName('item-card-rap')[0]
	itemCardPriceTrend = infoCard.getElementsByClassName('item-card-price-trend')[0]
	itemCardPriceTrendIcon = infoCard.getElementsByClassName('item-card-price-trend-icon')[0]
	itemCardCirculation = infoCard.getElementsByClassName('item-card-circulation')[0]
	itemCardAcronym = infoCard.getElementsByClassName('item-card-acronym')[0]
	itemCardIFrame = infoCard.getElementsByClassName('item-card-iframe')[0]
	itemCardCreator.innerHTML = stripTags(details.creatorName)
	itemCardCreator.href = stripTags("https://www.roblox.com/users/" + details.creatorTargetId + "/profile/")
	itemCardName.innerHTML = stripTags(details.name)
	itemCardBestPrice.innerHTML = addCommas(parseInt(details.lowestPrice))
	itemCardIFrame.style.height = 296 - itemCardNameContainer.getBoundingClientRect().height + "px"
	infoCard.getElementsByClassName('item-sales-data')[0].value = JSON.stringify(salesData)
	infoCard.getElementsByClassName('item-graph-form')[0].submit()
	infoCard.getElementsByClassName('item-card-graph')[0].setAttribute('loaded', 'true')

	data = salesData
	var priceDataPoints = data.priceDataPoints
	dataArray = []
	for (i = 0; i < priceDataPoints.length; i++) {
		dataPoint = priceDataPoints[i]
		dataArray.push([parseInt(new Date(dataPoint.date).getTime()), parseInt(dataPoint.value)])
	}
	dataArray.sort(function(a) {
		return a[0];
	});

	rap = data.recentAveragePrice
	arr = []
	arr2 = []

	time = new Date().getTime()
	for (i = 0; i < dataArray.length; i++) {
		if (dataArray[i][0] + 2592000000 >= time) { //Sales within last 30 days
			arr.push(dataArray[i][1])
		}
		if (!(dataArray[i][0] + 2592000000 >= time) && (dataArray[i][0] + 2592000000 * 2) >= time) { //Sales within last 60 days
			arr2.push(dataArray[i][1])
		}
	}

	if (arr2.length == 0) {
		mean60 = rap
	} else {
		mean60 = mean(arr2)
	}

	if (arr.length == 0) {
		mean30 = rap
	} else {
		mean30 = mean(arr)
	}

	priceIncrease = ((mean30 - mean60) / mean60 * 100).toFixed(1)

	if (arr.length == 0) {
		salesMedian = rap
		medianDifference = 0
	} else {
		salesMedian = median(arr)
		medianDifference = ((rap - salesMedian) / salesMedian * 100).toFixed(1)
	}

	if (priceIncrease < 0) {
		infoCard.getElementsByClassName('item-card-price-trend')[0].parentNode.getElementsByTagName('span')[0].style.backgroundImage = `url(${chrome.runtime.getURL('/images/down_arrow.png')})`
	}

	infoCard.getElementsByClassName('item-card-price-trend')[0].innerHTML = priceIncrease + "%" + `<p style="font-size:9px;display:inline-block;margin-left:5px;"> Past Month</p>`

	if (rap / salesMedian > 1.5) {
		possiblyProjectedHTML = `<img src="${chrome.runtime.getURL('/images/warning_symbol.png')}" style="width:40px;float:left;margin-left:40px;"><b style="font-size:14px;float:right;margin-right:40px;"> Probably Projected</b><br><p style="font-size:10px;text-align:right;display:inline-block;float:right;margin-top:-3px;margin-right:40px;">RAP ${Math.round((rap - salesMedian) / salesMedian * 100)}% Above Median</p>`
		div = document.createElement('div')
		div.setAttribute('style', 'left:8px;top:250px;position:absolute;background-color:#393b3d;padding:10px;border-radius:5px;filter: drop-shadow(#F9CE3A 0px 0px 5px);width:290px;')
		div.innerHTML = possiblyProjectedHTML
		infoCard.childNodes[0].appendChild(div)	
	}

	itemCardRAP.innerHTML = addCommas(parseInt(salesData.recentAveragePrice)) // + `<p style="font-size:8px;display:inline-block;margin-left:5px;">${Math.abs(medianDifference)}% ${medianDifference >= 0 ? "Above" : "Below"} Median RAP</p>`

	if ('circulation' in additionalInfo) {
		infoCard.getElementsByClassName('item-card-circulation')[0].innerHTML = `${addCommas(parseInt(additionalInfo['circulation']))}<p style="font-size:9px;display:inline-block;margin-left:5px;">Prem. Copies</p>`
	}

	if ('acronym' in additionalInfo) {
		infoCard.getElementsByClassName('item-card-acronym')[0].innerHTML = `${stripTags(additionalInfo['acronym'] == null ? "None" : additionalInfo['acronym'])}`
	}

	for (i = 0; i < recentSales.length; i++) {
		addRecentSaleCard(recentSales[i])
	}

	itemCardLoading.remove()
	tryOnURL = await tryOnURL
	itemCardIFrame.src = "https://ropro.io/render?" + stripTags(tryOnURL) + "&background=preview"
}

var currentInfoCard = null
var currentInfoButton = null
var windowItems = {}

async function addInfoCard(item, id) {
	thumbnailContainer = item.getElementsByClassName("item-card-thumb-container")[0]
	infoButton = document.createElement("div")
	infoButton.setAttribute('style', 'cursor:pointer;')
	infoButton.innerHTML = `<span style="transform:scale(0.8);top:4px;bottom:initial;left:4px;z-index:10000;" class="limited-icon-container tooltip-pastnames infocardbutton" data-toggle="tooltip" title="" data-original-title="RoPro Item Info Card"><img class="infocardicon" src="${chrome.runtime.getURL('/images/chart_icon.svg')}" style="width:28px;filter:invert(0.7);"></span></span>`
	thumbnailContainer.insertBefore(infoButton, thumbnailContainer.childNodes[1])
	infoButton.addEventListener('click', function(e){
		e.stopPropagation()
		if (this != currentInfoButton) {
			currentInfoButton = this
			if (currentInfoCard != null) {
				currentInfoCard.remove()
				currentInfoCard = null
			}
			infoCardHTML = `<div uib-popover-template-popup="" uib-title="" class="dark-theme tradeinfocard popover ng-scope ng-isolate-scope bottom people-info-card-container card-with-game fade in" tooltip-animation-class="fade" uib-tooltip-classes="" ng-class="{ in: isOpen }" style="filter: drop-shadow(rgb(0, 0, 0) 0px 0px 2px); top: 168px; left: 439px; min-width: 950px; min-height: 420px;">
			<div style="left:0px;top:0px;width:100%;height:100%;background-color:#393b3d;" class="arrow item-card-loading"><span id="itemCardLoading" style="visibility: initial !important;margin-left:auto;margin-right:auto;margin-top:190px;" class="spinner spinner-default"></span></div>
			<div style="left:467px;transform:scale(2);top:-10px;" class="arrow"></div>
			<div class="popover-inner" style="width:950px;height:320px;">
				<div style="float:left;"><h3 style="width:300px;padding-top:5px;padding-left:10px;padding-bottom:5px;transform:scale(1);"><div class="border-bottom item-name-container">
					<a href="https://www.roblox.com/catalog/${parseInt(id)}/" target="_blank"><h3 class="item-card-name">---</h3></a>
					<div><span class="text-label">By <a href="" class="text-name item-card-creator">---</a></span></div>
				</div></h3><iframe class="item-card-iframe" style="float:left;border:none;width:290px;margin-left:8.5px;height:245px;border-radius:7px;background-color:#232527;" src="https://ropro.io/render/index.php?background=preview" scrolling="no"></iframe></div>
				<form class="item-graph-form" style="display:none;" action="https://api.ropro.io/itemGraph.php" method="post" target="item_card_graph">
					<input class="item-sales-data" name="salesData" value=''>
					<input class="input-submit" type="submit">
				</form>
				<span id="itemGraphLoading" style="visibility: initial !important;margin-top:0px;position:absolute;left:460px;top:150px;width:120px;" class="spinner spinner-default"></span>
				<iframe loaded='false' name="item_card_graph" onload="if (this.getAttribute('loaded') == 'true') { document.getElementById('itemGraphLoading').remove(); }" class="item-card-graph" style="float:center;border:none;width:452px;height:300px;border-radius:10px;margin-left:7px;margin-right:7px;margin-top:7px;background-color:#232527;" src="" scrolling="no"></iframe>
				<div style="margin-left:-1.5px;width:100%;height:340px;background-color:#232527;border-radius:6px;float:right;width:173px;height:406px;margin-right:10px;margin-top:7px;"><div style="padding:5px;padding-left:10px;padding-right:10px;"><h5 style="font-weight:bold;font-size:20px;text-align:center;padding-bottom:0px;border-bottom:1px solid white;">Recent Sales</h5><p style="font-weight:bold;font-size:10px;text-align:center;padding:0px;padding-bottom:0px;padding-top:4px;">Detected by ropro.io</p></div>
				<ul style="width:100%;height:340px;background-color:#232527;" id="recentSalesList">
				</ul></div><div class="popover-inner" style="width:768px;height:100px;">
				<div style="float:left;width:100%;height:100%;padding:10px;padding-top:0px;margin-top:0px;padding-bottom:0px;"><div style="width:100%;height:100%;background-color:#232527;border-radius:6px;display:flex;"><div style="flex:1;padding:15px;padding-right:0px;"><h3 class="text-label field-label price-label">Best Price</h3><div class="icon-text-wrapper clearfix icon-robux-price-container">
															<span class="icon-robux-white-16x16 wait-for-i18n-format-render"></span>
			
															<b class="text-robux-md wait-for-i18n-format-render item-card-bestprice">---</b>
													</div></div><div style="flex:1;padding:15px;padding-right:0px;"><h3 class="text-label field-label price-label">Average Price</h3><div class="icon-text-wrapper clearfix icon-robux-price-container">
															<span class="icon-robux-white-16x16 wait-for-i18n-format-render"></span>
			
															<b class="text-robux-md wait-for-i18n-format-render item-card-rap">---</b>
													</div></div><div style="flex:1;padding:15px;padding-right:0px;"><h3 class="text-label field-label price-label">Monthly Trend</h3><div class="icon-text-wrapper clearfix icon-robux-price-container">
															<span class="icon icon-robux-white-16x16 item-card-price-trend-icon" style="background-image:url(${chrome.runtime.getURL('/images/up_arrow.png')});background-position:2px 2px;background-size:100%;width:12px;margin-left:-3px;margin-bottom:-1px;"></span>
			
															<b class="text-robux-md wait-for-i18n-format-render item-card-price-trend"><p style="font-size:11px;display:inline-block;margin-left:5px;"> This Month</p></b>
													</div></div><div style="flex:1;padding:15px;padding-right:0px;"><h3 class="text-label field-label price-label">Circulation</h3><div class="icon-text-wrapper clearfix icon-robux-price-container">
															
			
															<b class="text-robux-md wait-for-i18n-format-render item-card-circulation">381<p style="font-size:9px;display:inline-block;margin-left:5px;">Prem. Copies</p></b>
													</div></div><div style="flex:1;padding:15px;padding-right:0px;"><h3 class="text-label field-label price-label">Acronym</h3><div class="icon-text-wrapper clearfix icon-robux-price-container">
															
			
															<b class="text-robux-md wait-for-i18n-format-render item-card-acronym">AKoTN</b>
													</div></div></div></div>
			</div></div><div class="popover-inner" style="width:100px;height:100px;">		
			</div>
			
			</div>`
			infoCard = document.createElement('div')
			infoCard.innerHTML = infoCardHTML
			currentInfoCard = infoCard
			document.body.appendChild(infoCard)
			span = this.getElementsByTagName('span')[0]
			if (getOffset(span).top >= window.innerHeight / 2) {
				infoCard.getElementsByClassName('arrow')[1].style.transform = "rotate(180deg) scale(2)"
				infoCard.getElementsByClassName('arrow')[1].style.top = "initial"
				infoCard.getElementsByClassName('arrow')[1].style.bottom = "-10px"
				infoCard.childNodes[0].style.left = getOffset(span).left - 451.5 + "px"
				infoCard.childNodes[0].style.top = getOffset(span).top - 430 + "px"
			} else {
				infoCard.childNodes[0].style.left = getOffset(span).left - 451.5 + "px"
				infoCard.childNodes[0].style.top = getOffset(span).top + 30 + "px"
			}
			if (getOffset(infoCard.childNodes[0]).left < 0) {
				offset = Math.abs(getOffset(infoCard.childNodes[0]).left) + 10
				infoCard.childNodes[0].style.left = parseInt(infoCard.childNodes[0].style.left) + offset + "px"
				infoCard.getElementsByClassName('arrow')[1].style.left = parseInt(infoCard.getElementsByClassName('arrow')[1].style.left) - offset + "px"
			}
			right = window.innerWidth - getOffset(infoCard.childNodes[0]).left - infoCard.childNodes[0].offsetWidth
			if (right < 0) {
				offset = Math.abs(right) + 10
				infoCard.childNodes[0].style.left = parseInt(infoCard.childNodes[0].style.left) - offset + "px"
				infoCard.getElementsByClassName('arrow')[1].style.left = parseInt(infoCard.getElementsByClassName('arrow')[1].style.left) + offset + "px"
			}
			formatCard(id, infoCard)
		} else {
			if (currentInfoCard != null) {
				currentInfoCard.remove()
				currentInfoCard = null
			}
			currentInfoButton = null
		}
	})
}


window.addEventListener('click', function(e){
	if (currentInfoCard != null && currentInfoButton != null && !currentInfoCard.contains(e.target) && !currentInfoButton.contains(e.target)) {
		currentInfoCard.remove()
		currentInfoCard = null
		currentInfoButton = null
	}
})

function itemOwnershipHistory(item) {
	uaid = stripTags(item.getAttribute("data-userassetid"))
	thumbnailContainer = item.getElementsByClassName("item-card-thumb-container")[0]
	historyTooltip = document.createElement("div")
	historyTooltip.innerHTML = '<a target="_blank" href="https://www.rolimons.com/uaid/'+parseInt(uaid)+'"><span style="transform:scale(0.8);right:4px;top:4px;bottom:initial;left:initial;" class="limited-icon-container tooltip-pastnames" data-toggle="tooltip" title="" data-original-title="Ownership History"> <span class="icon-pastname"></span> </span></a>'
	historySpan = historyTooltip.childNodes[0]
	historyTooltip.remove()
	thumbnailContainer.insertBefore(historySpan, thumbnailContainer.childNodes[1])
}

function formatTime(time) {
	timeSince = Math.round(new Date().getTime() - parseInt(time)) / 1000
	if (timeSince < 60) { //seconds
		period = Math.round(timeSince)
		timeString = `${period}s`
	} else if (timeSince / 60 < 60) { //minutes
		period = Math.round(timeSince / 60)
		timeString = `${period}m`
	} else if (timeSince / 60 / 60 < 24) { //hours
		period = Math.round(timeSince / 60 / 60)
		timeString = `${period}h`
	} else { //days
		period = Math.round(timeSince / 60 / 60 / 24)
		timeString = `${period}d`
	}
	return timeString
}

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.abs(num) > 999999 ? Math.sign(num)*((Math.abs(num)/1000000).toFixed(1)) + 'm' : Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
}

function formatItem(item, id, json, inWindow) {
	if (item.getAttribute("class").indexOf("loaded") == -1) {
		item.setAttribute("class", stripTags(item.getAttribute("class")) + " loaded")
		thumbnailContainer = item.getElementsByClassName("item-card-thumb-container")[0]
		robuxNode = item.getElementsByClassName("item-card-price")[0]
		if (inWindow) {
			robuxNode.setAttribute("style", "margin-top:-5px;margin-bottom:4px;")
		}
		valueNode = robuxNode.cloneNode(true)
		logoSpan = valueNode.getElementsByTagName("span")[0]
		valueSpan = valueNode.getElementsByTagName("span")[1]
		logoSpan.setAttribute("style", `background-image:url(${chrome.runtime.getURL('/images/rolimons_logo_icon_blue.png')});background-position:5px 2px;background-size:60%;`)
		linkSpan = logoSpan.cloneNode(true)
		linkSpan.setAttribute("style", "background-image:none;background-position:5px 2px;background-size:60%;")
		linkSpan.innerHTML += '<a target = "_blank" href = "https://www.rolimons.com/item/' + parseInt(id) + '"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="1em" height="1em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path class="linkpath" d="M10.586 13.414a1 1 0 0 1-1.414 1.414 5 5 0 0 1 0-7.07l3.535-3.536a5 5 0 0 1 7.071 7.071l-1.485 1.486a7.017 7.017 0 0 0-.405-2.424l.476-.476a3 3 0 1 0-4.243-4.243l-3.535 3.536a3 3 0 0 0 0 4.242zm2.828-4.242a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.07l-3.535 3.536a5 5 0 0 1-7.071-7.07l1.485-1.486c-.008.82.127 1.641.405 2.423l-.476.476a3 3 0 1 0 4.243 4.243l3.535-3.536a3 3 0 0 0 0-4.242 1 1 0 0 1 0-1.414z" fill="#fff"></path></svg></a>'
		if (tradeItemValue) {
			robuxNode.parentNode.appendChild(valueNode)
		}
		if (embeddedRolimonsItemLink) {
			valueNode.appendChild(linkSpan)
		}
		$(".linkpath").css("fill", $('body').css("color"))
		value = addCommas(parseInt(json[16]))
		demand = parseInt(json[17])
		if (json[16] == null) {
			value = stripTags(robuxNode.getElementsByTagName("span")[1].innerHTML)
		}
		if (json[17] == null) {
			demand = 1.001
		} else {
			demand++
		}
		if (json[20] != null && underOverRAP) {
			div = document.createElement('div')
			div.style.display = "inline-block"
			if (json[20] >= 0) {
				positiveHTML = `<span class="icon icon-robux-16x16" style="background-image:url(${chrome.runtime.getURL('/images/up_arrow.png')});background-position:0px 1px;background-size:80%;width:12px;margin-left:-3px;margin-bottom:-1px;"><div style="color:#6ED102;vertical-align:middle;margin-bottom:7px;margin-left:11px;font-size:11px;display:inline-block;"><b>${kFormatter(parseInt(json[20]))}</b></div></span>`
				div.setAttribute("title", "Over RAP: +" + parseInt(json[20]))
				div.innerHTML += positiveHTML
			} else {
				negativeHTML = `<span class="icon icon-robux-16x16" style="background-image:url(${chrome.runtime.getURL('/images/down_arrow.png')});background-position:0px 3px;background-size:80%;width:12px;margin-left:-3px;margin-bottom:-1px;"><div style="color:#CC0700;vertical-align:middle;margin-bottom:7px;margin-left:11px;font-size:11px;display:inline-block;"><b>${kFormatter(parseInt(json[20])).toString().replace("-","")}</b></div></span>`
				div.setAttribute("title", "Under RAP: " + parseInt(json[20]))
				div.innerHTML += negativeHTML
			}
			robuxNode.appendChild(div)
		}
		demandEquivalence = {"1.001":"Not Assigned", "0":"Projected", "1":"Terrible", "2":"Low", "3":"Normal", "4":"High", "5":"Amazing"}
		demandTooltip = document.createElement("span")
		demandTooltip.setAttribute("style", "left:initial; right:4px;")
		demandTooltip.setAttribute("class", "demand-tooltip limited-icon-container ng-isolate-scope")
		demandTooltip.setAttribute("uib-tooltip", "Demand: " + demandEquivalence[demand.toString()])
		demandTooltip.setAttribute("title", "Demand: " + demandEquivalence[demand.toString()])
		demandTooltip.setAttribute("tooltip-placement", "right")
		demandTooltip.setAttribute("tooltip-append-to-body", "true")
		demandTooltip.setAttribute("limited-icon", "")
		demandTooltip.setAttribute("layout-options", "userAsset.layoutOptions")
		demandTooltip.innerHTML = '<div class="demand-tooltip-text" style="padding:3px;font-size:12px;font-weight:500;color:hsla(0,0%,100%,.7);"> ' + demand.toFixed(1) + ' </div><span class="limited-number-container ng-hide" ng-show="layoutOptions.isUnique"> <span class="font-caption-header">#</span> <span class="font-caption-header text-subheader limited-number ng-binding ng-hide" ng-show="layoutOptions.isLimitedNumberShown" ng-bind="layoutOptions.limitedNumber"></span> </span>'
		if (tradeItemDemand) {
			thumbnailContainer.insertBefore(demandTooltip, thumbnailContainer.childNodes[1])
		}
		item.setAttribute("value", stripTags(value.replace(",","").replace(",","").replace(",","").replace(",","")))
		if (itemInfoCard) {
			addInfoCard(item, id)
		}
		if (ownerHistory) {
			itemOwnershipHistory(item)
		}
		if (demand == 1.001) {
			demand = 1
		}
		item.setAttribute("demand", demand)
		valueSpan.innerHTML = stripTags(value);
		if (json[19] == 1) {
			setTimeout(function() {
				if (tradePageProjectedWarning) {
					projectedDisplay(item.getElementsByClassName('item-card-thumb-container')[0])
				}
			}, 500)
		}
	}
}

function formatTradeItem(item, id, json, inWindow) {
	if (item.getAttribute("class").indexOf("loaded") == -1) {
		item.setAttribute("class", stripTags(item.getAttribute("class")) + " loaded")
		robuxNode = item.getElementsByClassName('item-value')[0]
		logoSpan = robuxNode.childNodes[0].cloneNode(true)
		valueSpan = robuxNode.childNodes[1].cloneNode(true)
		logoSpan.setAttribute("style", `margin-left:5px; background-image:url(${chrome.runtime.getURL('/images/rolimons_logo_icon_blue.png')});background-position:5px 2px;background-size:60%;`)
		linkSpan = logoSpan.cloneNode(true)
		linkSpan.setAttribute("style", "background-image:none;background-position:5px 2px;background-size:60%;")
		linkSpan.innerHTML += '<a style="margin-left:5px;" target = "_blank" href = "https://www.rolimons.com/item/' + parseInt(id) + '"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="1em" height="1em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path class="linkpath" d="M10.586 13.414a1 1 0 0 1-1.414 1.414 5 5 0 0 1 0-7.07l3.535-3.536a5 5 0 0 1 7.071 7.071l-1.485 1.486a7.017 7.017 0 0 0-.405-2.424l.476-.476a3 3 0 1 0-4.243-4.243l-3.535 3.536a3 3 0 0 0 0 4.242zm2.828-4.242a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.07l-3.535 3.536a5 5 0 0 1-7.071-7.07l1.485-1.486c-.008.82.127 1.641.405 2.423l-.476.476a3 3 0 1 0 4.243 4.243l3.535-3.536a3 3 0 0 0 0-4.242 1 1 0 0 1 0-1.414z" fill="#fff"></path></svg></a>'
		value = addCommas(parseInt(json[16]))
		demand = parseInt(json[17])
		if (json[16] == null) {
			value = stripTags(robuxNode.getElementsByTagName("span")[1].innerHTML)
		}
		if (json[17] == null) {
			demand = 1.001
		} else {
			demand++
		}
		item.setAttribute("value", stripTags(value.replace(",","").replace(",","").replace(",","").replace(",","")))
		item.setAttribute("demand", demand)
		valueSpan.innerHTML = stripTags(value);
		robuxNode.appendChild(logoSpan)
		robuxNode.appendChild(valueSpan)
		if (embeddedRolimonsItemLink) {
			robuxNode.appendChild(linkSpan)
		}
		$(".linkpath").css("fill", $('body').css("color"))
		if (json[19] == 1) {
			setTimeout(function() {
				if (tradePageProjectedWarning) {
					projectedDisplay(item.getElementsByClassName('item-card-thumb-container')[0])
				}
			}, 500)
		}
	}
}

async function formatTrades(items) {
	if (items.getAttribute("class").indexOf("tradesloaded") == -1) {
		items.setAttribute("class", stripTags(items.getAttribute("class")) + " tradesloaded")
		itemCards = items.getElementsByClassName("item-card-container")
		totalTradeValue = 0
		totalTradeDemand = 0
		itemCount = 0
		robuxLine = items.getElementsByClassName('robux-line')[1]
		for (i = 0; i < itemCards.length; i++) {
			item = itemCards[i]
			value = parseInt(item.getAttribute("value"))
			demand = parseInt(item.getAttribute("demand"))
			totalTradeValue += value
			totalTradeDemand += demand*value
			itemCount++
		}
		try {
			robuxAmount = parseInt(items.getElementsByClassName('text-label robux-line-value')[0].innerText.replace(",", "").replace(",", "").replace(",", "").replace(",", ""))
			if (isNaN(robuxAmount)) {
				robuxAmount = 0
			}
			totalTradeValue += Math.round(robuxAmount / 0.7)
		} catch (e) {
			console.log(e)
		}
		totalTradeDemand = (totalTradeDemand / (totalTradeValue)).toFixed(1)
		if (tradeValueCalculator) {
			totalValue = `<div style="margin-top:-10px;" class="robux-line"> <span class="text-lead ng-binding" ng-bind="'Label.TotalValue' | translate">Rolimons Value:</span> <span class="robux-line-amount"> <span style="background-image:url(${chrome.runtime.getURL('/images/rolimons_logo_icon_blue.png')});background-position:5px 2px;background-size:60%;" class="icon-robux-16x16"></span><span class="text-robux-lg robux-line-value ng-binding">` + addCommas(parseInt(totalTradeValue)) + '</span> </span> </div>'
		} else {
			totalValue = ''
		}
		if (tradeDemandRatingCalculator) {
			totalDemand = `<div style = "margin-top:-10px;" class="robux-line"> <span class="text-lead ng-binding" ng-bind="'Label.TotalValue' | translate">Demand Rating:</span> <span class="robux-line-amount"> <span style="background-image:url(${chrome.runtime.getURL('/images/rolimons_logo_icon_blue.png')});background-position:5px 2px;background-size:60%;" class="icon-robux-16x16"></span><span class="text-robux-lg robux-line-value ng-binding">` + addCommas(totalTradeDemand) + '/5.0</span> </span> </div>'
		} else {
			totalDemand = ''
		}
		robuxLine.parentNode.innerHTML += totalValue + totalDemand
		return totalTradeValue
	}
}

function formatTradesWindow(items) {
		itemCards = items.getElementsByClassName("trade-request-item")
		totalTradeValue = 0
		totalTradeDemand = 0
		itemCount = 0
		robuxLine = items.getElementsByClassName('robux-line')[1]
		if (items.getElementsByClassName('thumbnail-2d-container')[0] != undefined) {
			for (i = 0; i < itemCards.length; i++) {
				item = itemCards[i]
				if (item.getElementsByClassName('thumbnail-2d-container')[0] != undefined) {
					value = parseInt(item.getAttribute("value"))
					demand = parseInt(item.getAttribute("demand"))
					totalTradeValue += value
					totalTradeDemand += demand*value
					itemCount++
				}
			}
			totalTradeDemand = (totalTradeDemand / (totalTradeValue)).toFixed(1)
		}
		robux = parseInt(items.getElementsByClassName('robux-line-value')[0].innerHTML.replace(",","").replace(",","").replace(",",""))
		totalTradeValue += Math.round(robux / 0.7)
		robuxLine.getElementsByClassName('robux-line-amount')[0].setAttribute("style", "height:0px;")
		if (items.getElementsByClassName('rolimons-value')[0] == undefined && items.getElementsByClassName('rolimons-demand')[0] == undefined) {
			if (tradeValueCalculator) {
				rolimonsLine = robuxLine.cloneNode(true)
				rolimonsLine.setAttribute("style", "margin-top:-5px")
				rolimonsLine.innerHTML = `<span style="margin-top:-5px;" class="rolimons-value text-lead ng-binding">Rolimons Value:</span> <span class="robux-line-amount"> <span style="background-image:url(${chrome.runtime.getURL('/images/rolimons_logo_icon_blue.png')});background-position:5px 2px;background-size:60%;" class="icon-robux-16x16"></span><span class="text-robux-lg rolimons-line-value robux-line-value ng-binding">` + addCommas(parseInt(totalTradeValue)) + '</span> </span>'
				robuxLine.parentNode.appendChild(rolimonsLine)
			}
			if (tradeDemandRatingCalculator) {
				rolimonsLine = robuxLine.cloneNode(true)
				rolimonsLine.setAttribute("style", "margin-top:-5px")
				rolimonsLine.innerHTML = `<span style="margin-top:-5px;" class="rolimons-demand text-lead ng-binding">Demand Rating:</span> <span class="robux-line-amount"> <span style="background-image:url(${chrome.runtime.getURL('/images/rolimons_logo_icon_blue.png')});background-position:5px 2px;background-size:60%;" class="icon-robux-16x16"></span><span class="text-robux-lg rolimons-line-demand robux-line-value ng-binding">` + addCommas(totalTradeDemand) + '/5.0</span> </span>'
				robuxLine.parentNode.appendChild(rolimonsLine)
			}
		} else {
			if (tradeValueCalculator) {
				items.getElementsByClassName('rolimons-line-value')[0].innerHTML = addCommas(parseInt(totalTradeValue));
			}
			if (tradeDemandRatingCalculator) {
				items.getElementsByClassName('rolimons-line-demand')[0].innerHTML = totalTradeDemand + "/5.0";
			}
		}
		return totalTradeValue
}

function projectedDisplay(assetThumbnail) {
	if (typeof assetThumbnail != "undefined") {
		div = document.createElement('div')
		projectedHTML = `<span style="background: intial;background-color:initial;top:-2px;left:-2px;bottom:initial;" class="limited-icon-container ng-isolate-scope" uib-tooltip="Demand: Normal" title="Projected Item" tooltip-placement="top" tooltip-append-to-body="true" limited-icon="" layout-options="userAsset.layoutOptions"><img width="110" src="${chrome.runtime.getURL('/images/projected_icon.png')}"></span>`
		div.innerHTML += projectedHTML
		assetThumbnail.appendChild(div)
	}
}

async function checkTrade() {
	itemJSON = await getJSON()
	itemCards = document.getElementsByClassName("item-card-container")
	for (i = 0; i < itemCards.length; i++) {
		item = itemCards[i]
		id = getIdFromCard(item)
		json = itemJSON[parseInt(id)]
		if (json == undefined) {
			json = "[\"NOT FOUND\",0,0,0,0,0,0,0,0,0,0,0,0,0,0,\"NOT FOUND\",0,0,0,null,null,null,0]"
			json[16] = 0
		}
		formatItem(item, id, JSON.parse(json), false)
	}
	val1 = await formatTrades(document.getElementsByClassName('trade-list-detail-offer')[0])
	val2 = await formatTrades(document.getElementsByClassName('trade-list-detail-offer')[1])
	if (await fetchSetting("winLossDisplay")) {
		difference = val2 - val1
		differencePercent = ((Math.abs(val1 - val2) / ((val1 + val2) / 2)) * 100).toFixed(1)
		differencePercent = Math.abs(((val1 - val2) / val1) * 100).toFixed(1)
		winHTML = `<div style="position:absolute;display:block;top:-19.5px;left:159px;width:100%;text-align:center;width:250px;"><span class="robux-line-amount" style="padding-top:5px;${foregroundOpacity < 1 ? 'background-color:none!important;' : ''}"> <span class="icon icon-robux-16x16" style="background-image:url(${chrome.runtime.getURL(`/images/${difference >= 0 ? 'up_arrow' : 'down_arrow'}.png`)});background-position:0px ${difference >= 0 ? -1 : 1}px;background-size:100%;width:12px;margin-left:1px;margin-bottom:-1px;margin-right:3px;"></span><span class="text-robux-lg robux-line-value ng-binding">${difference >= 0 ? "+" : ''}${addCommas(parseInt(difference))}</span><span style="vertical-align:top;" class="text-robux robux-line-value ng-binding"> (${parseFloat(differencePercent)}%)</span></span></div>`
		div = document.createElement('div')
		div.innerHTML = winHTML
		document.getElementsByClassName('trade-list-detail-offer-header')[1].style.position = "relative"
		document.getElementsByClassName('trade-list-detail-offer-header')[1].appendChild(div)
	}
}

async function checkTradeFree() {
	itemCards = document.getElementsByClassName("item-card-container")
	for (i = 0; i < itemCards.length; i++) {
		item = itemCards[i]
		id = getIdFromCard(item)
		if (item.getElementsByClassName('infocardicon').length == 0) {
			addInfoCard(item, id)
		}
	}
}

async function checkTradeWindow() {
	itemJSON = await getJSON()
	Object.keys(itemJSON).forEach(function(id, json) {
		windowItems[id] = itemJSON[id]
	})
	itemCards = document.getElementsByClassName("item-card-container")
	for (i = 0; i < itemCards.length; i++) {
		item = itemCards[i]
		id = getIdFromCard(item)
		json = itemJSON[parseInt(id)]
		if (json == undefined) {
			json = "[\"NOT FOUND\",0,0,0,0,0,0,0,0,0,0,0,0,0,0,\"NOT FOUND\",0,0,0,null,null,null,0]"
			json[16] = 0
			return
		}
		formatItem(item, id, JSON.parse(json), true)
	}
}

async function checkTradeWindowOffers() {
	if (Object.keys(windowItems).length > 0) {
		if (Object.keys(windowItems).length > 0) {
			itemCards = document.getElementsByClassName("trade-request-item")
			itemFound = false
			undefinedItems = []
			for (i = 0; i < itemCards.length; i++) {
				item = itemCards[i]
				if (item.getElementsByClassName('thumbnail-2d-container')[0] != undefined) {
					id = getIdFromTradeCard(item)
					json = windowItems[parseInt(id)]
					if (json == undefined) {
						undefinedItems.push(id)
						json = "[\"NOT FOUND\",0,0,0,0,0,0,0,0,0,0,0,0,0,0,\"NOT FOUND\",0,0,0,null,null,null,0]"
						json[16] = 0
					} else {
						formatTradeItem(item, id, JSON.parse(json), true)
					}
				}
			}
			if (undefinedItems.length > 0) {
				itemJSON = await fetchItems(undefinedItems)
				Object.keys(itemJSON).forEach(function(id, json) {
					windowItems[id] = itemJSON[id]
				})
				for (i = 0; i < itemCards.length; i++) {
					item = itemCards[i]
					if (item.getElementsByClassName('thumbnail-2d-container')[0] != undefined) {
						id = getIdFromTradeCard(item)
						json = windowItems[parseInt(id)]
						if (json == undefined) {
							json = "[\"NOT FOUND\",0,0,0,0,0,0,0,0,0,0,0,0,0,0,\"NOT FOUND\",0,0,0,null,null,null,0]"
							json[16] = 0
						}
						formatTradeItem(item, id, JSON.parse(json), true)
					}
				}
			}
			formatTradesWindow(document.getElementsByClassName('trade-request-window-offer')[0])
			formatTradesWindow(document.getElementsByClassName('trade-request-window-offer')[1])
		}
		val1 = await formatTradesWindow(document.getElementsByClassName('trade-request-window-offer')[0])
		val2 = await formatTradesWindow(document.getElementsByClassName('trade-request-window-offer')[1])
		if (await fetchSetting("winLossDisplay")) {
			if (document.getElementById('winDiv') != null) {
				document.getElementById('winDiv').remove()
			}
			difference = val2 - val1
			differencePercent = Math.abs(((val1 - val2) / val1) * 100).toFixed(1)
			winHTML = `<div style="position:absolute;display:block;top:-19px;left:0px;text-align:center;width:100%;"><div class="rbx-divider" style="margin-top: 0px; margin-bottom: -10px;"></div><span class="robux-line-amount" style="padding-top:5px;${foregroundOpacity < 1 ? 'background-color:none!important;' : ''}"> <span class="icon icon-robux-16x16" style="background-image:url(${chrome.runtime.getURL(`/images/${difference >= 0 ? 'up_arrow' : 'down_arrow'}.png`)});background-position:0px ${difference >= 0 ? -1 : 1}px;background-size:100%;width:12px;margin-left:1px;margin-bottom:-1px;margin-right:3px;"></span><span class="text-robux-lg robux-line-value ng-binding">${difference >= 0 ? "+" : ''}${addCommas(parseInt(difference))}</span><span style="vertical-align:top;" class="text-robux robux-line-value ng-binding"> (${(val1 == 0 || val2 == 0) ? "---" : parseFloat(differencePercent)}%)</span></span></div>`
			div = document.createElement('div')
			div.id = "winDiv"
			div.innerHTML = winHTML
			document.getElementsByClassName('trade-request-window-offer')[1].style.position = "relative"
			document.getElementsByClassName('trade-request-window-offer')[1].appendChild(div)
		}
	} else {
		setTimeout(checkTradeWindowOffers, 500)
	}
}

async function addTradeDetails(tradeRowDetails) {
	if (embeddedRolimonsUserLink) {
		tradeUserLink = tradeRowDetails.getElementsByClassName('avatar-card-link')[0].href
		tradeUserID = stripTags(tradeUserLink.split("/users/")[1].split("/profile")[0])
		div = document.createElement("div")
		div.style.display = "inline-block";
		div.style.marginLeft = "3px";
		div.style.paddingTop = "1px";
		rolimonsUserLinkHTML = `<span class="icon icon-robux-16x16 rolimons-user-link" style="background-image:none;background-position:2px 2px;background-size:80%;"><a target="_blank" href="https://www.rolimons.com/player/${parseInt(tradeUserID)}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="1em" height="1em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path class="linkpath" d="M10.586 13.414a1 1 0 0 1-1.414 1.414 5 5 0 0 1 0-7.07l3.535-3.536a5 5 0 0 1 7.071 7.071l-1.485 1.486a7.017 7.017 0 0 0-.405-2.424l.476-.476a3 3 0 1 0-4.243-4.243l-3.535 3.536a3 3 0 0 0 0 4.242zm2.828-4.242a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.07l-3.535 3.536a5 5 0 0 1-7.071-7.07l1.485-1.486c-.008.82.127 1.641.405 2.423l-.476.476a3 3 0 1 0 4.243 4.243l3.535-3.536a3 3 0 0 0 0-4.242 1 1 0 0 1 0-1.414z" fill="#fff" style="fill: rgb(255, 255, 255);"></path></svg></a></span>`
		div.innerHTML += rolimonsUserLinkHTML
		tradeUserElement = tradeRowDetails.getElementsByClassName('text-lead ng-binding')[0]
		tradeUserElement.appendChild(div)
	}
	tradeRowDetails.classList.add("rolimons-user-link-added")
	if (quickDecline && $('.rbx-selection-label:contains("Inbound")').length > 0) {
		hint = tradeRowDetails.getElementsByClassName('text-date-hint ng-binding')[0]
		if (hint.innerHTML == "Open") {
			div = document.createElement("a")
			div.display = "inline-block"
			div.innerHTML = " | <a>Decline</a>"
			hint.appendChild(div)
			div.getElementsByTagName('a')[0].addEventListener("click", function(){
				setTimeout(function(){
					decline = $(".btn-control-md:contains('Decline'):not('.ng-hide')")
					decline.click()
					document.getElementById('modal-action-button').click()
				}, 200)
			})
		}
	}
	if (quickCancel && $('.rbx-selection-label:contains("Outbound")').length > 0) {
		hint = tradeRowDetails.getElementsByClassName('text-date-hint ng-binding')[0]
		if (hint.innerHTML == "Open") {
			div = document.createElement("a")
			div.display = "inline-block"
			div.innerHTML = " | <a>Cancel</a>"
			hint.appendChild(div)
			div.getElementsByTagName('a')[0].addEventListener("click", function(){
				setTimeout(function(){
					decline = $(".btn-control-md:contains('Decline'):not('.ng-hide')")
					decline.click()
					document.getElementById('modal-action-button').click()
				}, 200)
			})
		}
	}
}

async function addBatchTradeDetails(tradeRows) {
	iconBroken = document.getElementsByClassName('icon-broken')
	for (i = 0; i < iconBroken.length; i++) {
		broken = iconBroken[i]
		broken.classList.remove('icon-broken')
	}
	if (tradePanel) {
		userIds = []
		tradeRowArray = []
		for (i = 0; i < tradeRows.length; i++) {
			tradeRow = tradeRows[i]
			tradeUserLink = tradeRow.getElementsByClassName('avatar-card-link')[0].href
			tradeUserID = tradeUserLink.split("/users/")[1].split("/profile")[0]
			tradeRowArray.push([tradeUserID, tradeRow])
			userIds.push(tradeUserID)
		}
		tradeFlags = await fetchFlagsBatch(userIds)
		tradeFlags = JSON.parse(tradeFlags)
		for (i = 0; i < tradeFlags.length; i++) {
			function addFlag(i) {
				setTimeout(function() {
					for (j = 0; j < tradeRowArray.length; j++) {
						if (tradeRowArray[j][0] == tradeFlags[i]) {
							thumbnail = tradeRowArray[j][1].getElementsByClassName('thumbnail-2d-container')[0].getElementsByTagName('img')[0]
							if (typeof thumbnail == 'undefined') {
								tradeRowArray[j][1].getElementsByClassName('thumbnail-2d-container')[0].classList.remove('icon-blocked')
								tradeRowArray[j][1].getElementsByClassName('thumbnail-2d-container')[0].classList.remove('shimmer')
								tradeRowArray[j][1].getElementsByClassName('thumbnail-2d-container')[0].classList.remove('icon-broken')
								thumbnail = document.createElement('img')
								thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJib3JrZW4iPjxwYXRoIGlkPSJiZyIgZmlsbD0iIzY1NjY2OCIgZD0iTTAgMGg5MHY5MEgweiIvPjxnIGlkPSJicm9rZW4iIG9wYWNpdHk9Ii4zIj48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNTEuMiAyMy41djEwLjNoMTAuM00yOC41IDQ4Ljl2MTcuNmgzM1Y1My44bC0xMS01LTExIDUtMTEtNXoiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjEuNSAzMy44TDUxLjIgMjMuNUgyOC41VjQxbDExIDUgMTEtNSAxMSA1eiIvPjwvZz48L2c+PC9zdmc+'
								tradeRowArray[j][1].getElementsByClassName('thumbnail-2d-container')[0].appendChild(thumbnail)
							}
							thumbnail.setAttribute("old-src", stripTags(thumbnail.src))
							thumbnail.src = chrome.runtime.getURL('/images/robot.png')
						}
					}
				}, 200)
			}
			addFlag(i)
		}
	}
}

function toggleSerials() {
	serialContainers = document.getElementsByClassName('limited-number-container')
	for (i = 0; i < serialContainers.length; i++) {
		serialContainer = serialContainers[i]
		serials = serialContainer.getElementsByTagName('span');
		for (j = 0; j < serials.length; j++) {
			serials[j].classList.toggle("text-blur")
		}
	}
}

function addHideButton(tradeTitle) {
	if ($('.light-theme').length > 0) {
		theme2 = "_lightmode"
	} else {
		theme2 = ""
	}
	div = document.createElement("div")
	div.classList.add("inactive")
	div.classList.add("buttontooltip")
	div.style.display = "inline-block";
	hideHTML = `<img class="hide-button limited-icon-container tooltip-pastnames" style="width:25px;margin-top:-3px;cursor:pointer;" src="${chrome.runtime.getURL('/images/serials_on'+theme2+'.png')}"><span style="margin-top:-5.5px;margin-left:3px;pointer-events:none;width:130px;" class="tooltiptext">Blur Serials</span>`
	div.innerHTML += hideHTML
	if (tradeTitle.parentNode.parentNode.getElementsByClassName('text-label ng-binding')[0].classList.contains("ng-hide")) {
		tradeTitle.parentNode.parentNode.getElementsByClassName('text-label ng-binding')[0].innerHTML = ""
		tradeTitle.parentNode.parentNode.getElementsByClassName('text-label ng-binding')[0].classList.remove("ng-hide")
	}
	tradeTitle.parentNode.parentNode.getElementsByClassName('text-label ng-binding')[0].appendChild(div)
	tradeTitle.classList.add("hide-button-inserted")
	div.addEventListener("click", function() {
		if (this.classList.contains("inactive")) {
			this.classList.remove("inactive")
			this.getElementsByTagName('img')[0].src = chrome.runtime.getURL('/images/serials_on'+theme2+'.png')
			toggleSerials()
		} else {
			this.classList.add("inactive")
			this.getElementsByTagName('img')[0].src = chrome.runtime.getURL('/images/serials_on'+theme2+'.png')
			toggleSerials()	
		}
	})
}

function toggleHighlight() {
	selectedTrade = document.getElementsByClassName('trade-row selected')[0]
	if (selectedTrade.classList.contains("highlighted-trade")) {
		selectedTrade.classList.remove("highlighted-trade")
	} else {
		selectedTrade.classList.add("highlighted-trade")
	}
}

async function addTradeFlag(tradeTitle) {
	tradeTitle.classList.add("trade-flag-inserted")
	if (tradeTitle.parentNode.parentNode.getElementsByClassName('trade-flag').length == 0) {
		if ($('.light-theme').length > 0) {
			theme = "lightmode"
		} else {
			theme = "darkmode"
		}
		//username = stripTags(tradeTitle.innerHTML.split(" ")[tradeTitle.innerHTML.split(" ").length - 1])
		row = $(".trade-row.selected .trade-row-container")
		if (row.length > 0) {
			userID = parseInt(row.get(0).getElementsByClassName('thumbnail-2d-container')[0].getAttribute("thumbnail-target-id"))
			rowImage = row.get(0).getElementsByClassName('thumbnail-2d-container')[0].getElementsByTagName('img')[0]
			flag = typeof rowImage != 'undefined' && rowImage.src.includes("robot.png") ? "1" : "0"
			div = document.createElement("div")
			div.style.display = "inline-block";
			div.style.position = "relative";
			div.style.marginLeft = "5px";
			div.classList.add("buttontooltip")
			div.classList.add("trade-flag-div")
			if (flag == "0") {
				flagHTML = `<img class="hide-button limited-icon-container tooltip-pastnames trade-flag" style="width:25px;margin-top:-3px;cursor:pointer;" src="${chrome.runtime.getURL('/images/trade_flag_inactive_'+theme+'3.png')}"><span style="margin-top:-5.5px;margin-left:3px;pointer-events:none;" class="tooltiptext">Flag User as Trade Bot</span>`
			} else {
				flagHTML = `<img class="hide-button limited-icon-container tooltip-pastnames trade-flag active" style="width:25px;margin-top:-3px;cursor:pointer;" src="${chrome.runtime.getURL('/images/trade_flag_active_'+theme+'3.png')}"><span style="margin-top:-5.5px;margin-left:3px;pointer-events:none;" class="tooltiptext">User Flagged as Trade Bot</span>`
			}
			div.innerHTML += flagHTML
			if (tradeTitle.parentNode.parentNode.getElementsByClassName('trade-flag').length == 0) {
				tradeTitle.parentNode.parentNode.getElementsByClassName('text-label ng-binding')[0].appendChild(div)
				firstLoad = false
				div.getElementsByTagName('img')[0].addEventListener("click", function() {
					if (this.classList.contains("active")) {
						row = $(".trade-row.selected .trade-row-container")
						for (i = 0; i < row.length; i++) {
							thumbnail = row.get(i).getElementsByClassName('thumbnail-2d-container')[0].getElementsByTagName('img')[0]
							if (typeof thumbnail == 'undefined') {
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].classList.remove('icon-blocked')
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].classList.remove('shimmer')
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].classList.remove('icon-broken')
								thumbnail = document.createElement('img')
								thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJib3JrZW4iPjxwYXRoIGlkPSJiZyIgZmlsbD0iIzY1NjY2OCIgZD0iTTAgMGg5MHY5MEgweiIvPjxnIGlkPSJicm9rZW4iIG9wYWNpdHk9Ii4zIj48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNTEuMiAyMy41djEwLjNoMTAuM00yOC41IDQ4Ljl2MTcuNmgzM1Y1My44bC0xMS01LTExIDUtMTEtNXoiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjEuNSAzMy44TDUxLjIgMjMuNUgyOC41VjQxbDExIDUgMTEtNSAxMSA1eiIvPjwvZz48L2c+PC9zdmc+'
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].appendChild(thumbnail)
							}
							thumbnail.src = thumbnail.getAttribute("old-src")
						}
						this.classList.remove("active")
						this.src = chrome.runtime.getURL('/images/trade_flag_inactive_'+theme+'3.png')
						this.parentNode.getElementsByClassName('tooltiptext')[0].innerHTML = "Flag User as Trade Bot"
						flagTrader(userID, "remove")
					} else {
						row = $(".trade-row.selected .trade-row-container")
						for (i = 0; i < row.length; i++) {
							thumbnail = row.get(i).getElementsByClassName('thumbnail-2d-container')[0].getElementsByTagName('img')[0]
							if (typeof thumbnail == 'undefined') {
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].classList.remove('icon-blocked')
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].classList.remove('shimmer')
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].classList.remove('icon-broken')
								thumbnail = document.createElement('img')
								thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJib3JrZW4iPjxwYXRoIGlkPSJiZyIgZmlsbD0iIzY1NjY2OCIgZD0iTTAgMGg5MHY5MEgweiIvPjxnIGlkPSJicm9rZW4iIG9wYWNpdHk9Ii4zIj48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNTEuMiAyMy41djEwLjNoMTAuM00yOC41IDQ4Ljl2MTcuNmgzM1Y1My44bC0xMS01LTExIDUtMTEtNXoiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjEuNSAzMy44TDUxLjIgMjMuNUgyOC41VjQxbDExIDUgMTEtNSAxMSA1eiIvPjwvZz48L2c+PC9zdmc+'
								row.get(i).getElementsByClassName('thumbnail-2d-container')[0].appendChild(thumbnail)
							}
							thumbnail.setAttribute("old-src", stripTags(thumbnail.src))
							thumbnail.src = chrome.runtime.getURL('/images/robot.png')
						}
						this.classList.add("active")
						this.src = chrome.runtime.getURL('/images/trade_flag_active_'+theme+'3.png')
						this.parentNode.getElementsByClassName('tooltiptext')[0].innerHTML = "User Flagged as Trade Bot"
						flagTrader(userID, "add")
					}
				})
			}
		}
	}
}

function getUsername() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetUsername"}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function declineTrades(trades, info) {
	return new Promise(resolve => {
		async function doDecline(trades, info) {
			count = 0
			for (k = 0; k < trades.length; k++) {
				tradeId = trades[k][0]
				for (j = 0; j < 12; j++) {
					decline = await declineTrade(tradeId)
					if (decline == 429) {
						await timeout(10000) //Upon ratelimit, wait 10 seconds and try again
					} else {
						break
					}
				}
				count++
				info.innerHTML = `Declining Trades... (${parseInt(count)}/${parseInt(trades.length)})`
			}
			resolve(count)
		}
		doDecline(trades, info)
	})
}

async function declineAllInbounds(info) {
	loadedCount = 0
	info.innerHTML = "Loading Inbound Trades..."
	trades = await fetchTradesType("Inbound")
	info.innerHTML = `Declining Trades... (0/${parseInt(trades.length)})`
	declined = await declineTrades(trades, info)
	info.innerHTML = `Done. Declined ${parseInt(declined)} Trade${parseInt(declined) == 1 ? '' : 's'}`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}

async function declineOldTrades(info, age, tradesType) {
	document.getElementById('secondaryModal').style.height = "325px"
	loadedCount = 0
	info.innerHTML = "Loading Trades..."
	if (tradesType == "Outbound") {
		tradesName = "Cancelled"
		trades = await fetchTradesData("Outbound")
	} else {
		tradesName = "Declined"
		trades = await fetchTradesData("Inbound")
	}
	oldTrades = []
	for (j = 0; j < trades.length; j++) {
		tradeAge = (new Date().getTime() - new Date(trades[j].created).getTime()) / 1000 / 60 / 60
		if (tradeAge >= age) {
			oldTrades.push([trades[i].id, trades[i].user.id])
		}
	}
	info.innerHTML = `Declining Trades... (0/${parseInt(oldTrades.length)})`
	declined = await declineTrades(oldTrades, info)
	info.innerHTML = `Done. ${tradesName} ${parseInt(declined)} Trade${parseInt(declined) == 1 ? '' : 's'} which were ${(age <= 24 ? age : Math.round(age / 24)) + (age <= 24 ? ' hour' + (age == 1 ? '' : 's') + ' old': ' day' + (Math.round(age / 24) == 1 ? '' : 's') + ' old')} or older.`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}


function chunkArray(array, chunkSize) {
	return Array.from(
	  { length: Math.ceil(array.length / chunkSize) },
	  (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)   
	);
}

async function declineAllInboundLosses(info, percentLoss) {
	if (!await fetchSetting('moreTradePanel')) {
		return
	}
	myUsername = await getUsername()
	loadedCount = 0
	info.innerHTML = "Loading Inbound Trades..."
	trades = await fetchTradesType("Inbound")
	info.innerHTML = `Loading Trades... (0/${trades.length})`
	cache = await fetchCachedTrades()
	loadedTrades = []
	uncached = []
	count = 0
	tradeValues = {}
	winsLosses = {"wins": 0, "equal": 0, "losses": 0, "validLosses": 0}
	for (j = 0; j < trades.length; j++) {
		tradeId = parseInt(trades[j][0])
		if (tradeId in cache && cache[tradeId] != null) {
			loadedTrades.push(cache[tradeId])
			count++
			info.innerHTML = `Loading Trades... (${count}/${trades.length})`
		} else {
			uncached.push(tradeId)
		}
	}
	chunkedArray = chunkArray(loadedTrades, 20)
	for (chunk in chunkedArray) {
		chunkValues = await fetchValues({data: chunkedArray[chunk]})
		for (tradeId in chunkValues) {
			tradeValues[tradeId] = chunkValues[tradeId]
			trade = chunkValues[tradeId][0]
			if (myUsername in trade) {
				myValue = 1
				theirValue = 1
				for (username in trade) {
					if (username == myUsername) {
						myValue = trade[username]
					} else {
						theirValue = trade[username]
					}
				}
				if (myValue > theirValue) {
					winsLosses["losses"]++
					ratio = ((theirValue - myValue) / theirValue) * 100
					if (ratio <= percentLoss * -1) {
						winsLosses["validLosses"]++
					}
				} else if (myValue == theirValue) {
					winsLosses["equal"]++
				} else {
					winsLosses["wins"]++
				}
			}
		}
		info.innerHTML = `Loading Trades... (${count}/${trades.length})<br><u style="font-size:13px;">Wins: ${winsLosses["wins"]} | Equal: ${winsLosses["equal"]} | Losses: ${winsLosses["losses"]} | Losses To Decline: ${winsLosses["validLosses"]}</u>`
	}
	var myflag = 0
	for (j = 0; j < uncached.length; j++) {
		if (myflag == 0) {
			await timeout(2000)
		}
		count++
		async function doCache(tradeId) {
			cachedTrade = await cacheTrade(tradeId)
			if (Number.isInteger(cachedTrade)) {
				if (cachedTrade == 429) {
					await timeout(2000)
					await doCache(tradeId)
				}
			} else {
				if (cachedTrade.length == 2) {
					loadedTrades.push(cachedTrade[0])
					myflag = cachedTrade[1]
					chunkValues = await fetchValues({data: [cachedTrade[0]]})
					for (tradeId in chunkValues) {
						tradeValues[tradeId] = chunkValues[tradeId]
						trade = chunkValues[tradeId][0]
						if (myUsername in trade) {
							myValue = 1
							theirValue = 1
							for (username in trade) {
								if (username == myUsername) {
									myValue = trade[username]
								} else {
									theirValue = trade[username]
								}
							}
							if (myValue > theirValue) {
								winsLosses["losses"]++
								ratio = ((theirValue - myValue) / theirValue) * 100
								if (ratio <= percentLoss * -1) {
									winsLosses["validLosses"]++
								}
							} else if (myValue == theirValue) {
								winsLosses["equal"]++
							} else {
								winsLosses["wins"]++
							}
						}
					}
					info.innerHTML = `Loading Trades... (${count}/${trades.length})<br><u style="font-size:13px;">Wins: ${winsLosses["wins"]} | Equal: ${winsLosses["equal"]} | Losses: ${winsLosses["losses"]} | Losses To Decline: ${winsLosses["validLosses"]}</u>`
				}
			}
		}
		try {
			await doCache(uncached[j])
		} catch(e) {
			console.log(e)
		}
	}
	decline = []
	for (tradeId in tradeValues) {
		try {
			trade = tradeValues[tradeId][0]
			if (myUsername in trade) {
				myValue = 1
				theirValue = 1
				for (username in trade) {
					if (username == myUsername) {
						myValue = trade[username]
					} else {
						theirValue = trade[username]
					}
				}
				if (theirValue > 0) {
					ratio = ((theirValue - myValue) / theirValue) * 100
					if (ratio <= percentLoss * -1) {
						decline.push([parseInt(tradeId), 0])
					}
				}
			}
		} catch (e) {
			console.log(e)
		}
	}
	info.innerHTML = `Declining Trades... (0/${parseInt(decline.length)})`
	declined = await declineTrades(decline, info)
	info.innerHTML = `Done. Declined ${parseInt(declined)} Loss${parseInt(declined) == 1 ? '' : 'es'} of ${percentLoss}% or more.`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}

async function declineInvalidInbounds(info) {
	if (!await fetchSetting('moreTradePanel')) {
		return
	}
	loadedCount = 0
	info.innerHTML = "Loading Inbound Trades..."
	trades = await fetchTradesType("Inbound")
	info.innerHTML = `Loading Trades... (0/${trades.length})`
	cache = await fetchCachedTrades()
	loadedTrades = []
	uncached = []
	count = 0
	userInventory = {}
	for (j = 0; j < trades.length; j++) {
		tradeId = parseInt(trades[j][0])
		if (tradeId in cache && cache[tradeId] != null) {
			loadedTrades.push(cache[tradeId])
			count++
			info.innerHTML = `Loading Trades... (${count}/${trades.length})`
		} else {
			uncached.push(tradeId)
		}
	}
	var myflag = 0
	for (j = 0; j < uncached.length; j++) {
		if (myflag == 0) {
			await timeout(2000)
		}
		count++
		async function doCache(tradeId) {
			cachedTrade = await cacheTrade(tradeId)
			if (Number.isInteger(cachedTrade)) {
				if (cachedTrade == 429) {
					await timeout(2000)
					await doCache(tradeId)
				}
			} else {
				if (cachedTrade.length == 2) {
					myflag = cachedTrade[1]
					loadedTrades.push(cachedTrade[0])
					info.innerHTML = `Loading Trades... (${count}/${trades.length})`
				}
			}
		}
		try {
			await doCache(uncached[j])
		} catch(e) {
			console.log(e)
		}
	}
	decline = []
	info.innerHTML = `Loading Your Inventory...`
	myId = await fetchUserID()
	userInventory[myId] = await fetchInventory(myId)
	myUAIDs = []
	for (k = 0; k < userInventory[myId].length; k++) {
		myUAIDs.push(userInventory[myId][k].userAssetId)
	}
	userCount = 0
	for (j = 0; j < loadedTrades.length; j++) {
		user = loadedTrades[j].user
		userCount++
		offers = loadedTrades[j].offers
		if (offers[0].user.id == user.id) {
			theirSide = offers[0]
			mySide = offers[1]
		} else {
			theirSide = offers[1]
			mySide = offers[0]
		}
		info.innerHTML = `Loading ${stripTags(user.name)}'s Inventory... (${userCount}/${loadedTrades.length})<br><u style="font-size:13px;">Invalid Trades Found: ${decline.length}</u>`
		if (user.id in userInventory) {
			inventory = userInventory[user.id]
		} else {
			inventory = await fetchInventory(user.id)
			userInventory[user.id] = inventory
		}
		theirUAIDs = []
		for (k = 0; k < userInventory[user.id].length; k++) {
			theirUAIDs.push(userInventory[user.id][k].userAssetId)
		}
		invalid = false
		for (k = 0; k < mySide.userAssets.length; k++) {
			item = mySide.userAssets[k]
			if (!myUAIDs.includes(item.id)) {
				invalid = true
				decline.push([loadedTrades[j].id, loadedTrades[j].user.id])
				break
			}
		}
		if (invalid == false) {
			for (k = 0; k < theirSide.userAssets.length; k++) {
				item = theirSide.userAssets[k]
				if (!theirUAIDs.includes(item.id)) {
					decline.push([loadedTrades[j].id, loadedTrades[j].user.id])
					break
				}
			}
		}
	}
	info.innerHTML = `Declining Trades... (0/${parseInt(decline.length)})`
	declined = await declineTrades(decline, info)
	info.innerHTML = `Done. Declined ${parseInt(declined)} Trade${parseInt(declined) == 1 ? '' : 's'}. All remaining trades are valid.`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}

async function declineProjectedInbounds(info, type) {
	if (!await fetchSetting('moreTradePanel')) {
		return
	}
	loadedCount = 0
	info.innerHTML = "Loading Inbound Trades..."
	trades = await fetchTradesType("Inbound")
	info.innerHTML = `Loading Trades... (0/${trades.length})`
	cache = await fetchCachedTrades()
	loadedTrades = []
	uncached = []
	count = 0
	userInventory = {}
	for (j = 0; j < trades.length; j++) {
		tradeId = parseInt(trades[j][0])
		if (tradeId in cache && cache[tradeId] != null) {
			loadedTrades.push(cache[tradeId])
			count++
			info.innerHTML = `Loading Trades... (${count}/${trades.length})`
		} else {
			uncached.push(tradeId)
		}
	}
	var myflag = 0
	for (j = 0; j < uncached.length; j++) {
		if (myflag == 0) {
			await timeout(2000)
		}
		count++
		async function doCache(tradeId) {
			cachedTrade = await cacheTrade(tradeId)
			if (Number.isInteger(cachedTrade)) {
				if (cachedTrade == 429) {
					await timeout(2000)
					await doCache(tradeId)
				}
			} else {
				if (cachedTrade.length == 2) {
					myflag = cachedTrade[1]
					loadedTrades.push(cachedTrade[0])
					info.innerHTML = `Loading Trades... (${count}/${trades.length})`
				}
			}
		}
		try {
			await doCache(uncached[j])
		} catch(e) {
			console.log(e)
		}
	}
	decline = []
	info.innerHTML = `Loading List of Projected Items...`
	projecteds = JSON.parse(await fetchProjecteds(type))
	for (j = 0; j < loadedTrades.length; j++) {
		user = loadedTrades[j].user
		offers = loadedTrades[j].offers
		if (offers[0].user.id == user.id) {
			theirSide = offers[0]
		} else {
			theirSide = offers[1]
		}
		for (k = 0; k < theirSide.userAssets.length; k++) {
			if (projecteds.includes(theirSide.userAssets[k].assetId)) {
				decline.push([loadedTrades[j].id, user.id])
			}
		}
	}
	info.innerHTML = `Declining Trades... (0/${parseInt(decline.length)})`
	declined = await declineTrades(decline, info)
	info.innerHTML = `Done. Declined ${parseInt(declined)} Trade${parseInt(declined) == 1 ? '' : 's'} With Projecteds.`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.style.marginTop = "-20px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}


async function filterTradesByItem(info, item) {
	if (!await fetchSetting('moreTradePanel')) {
		return
	}
	filterHTML = `<div style="margin-top:7px;padding-left:5px;background-color:#393B3D;border-radius:5px;height:30px;position:relative;white-space:nowrap;overflow:hidden;"><span style="float:left;margin-top:4px;font-weight:bold;">Trade Filter: </span><div style="margin-left:5px;display:inline-block;width:65%;text-align:left;overflow:hidden;white-space: nowrap;"><img style="width:30px;margin-right:5px;margin-bottom:3px;" src="https://api.ropro.io/getAssetThumbnail.php?id=${parseInt(item.id)}" id="tradeFilterImage"><span id="tradeFilterText">${stripTags(item.name)}</span></div><p style="position:absolute;right:5px;top:0px;font-size:18px;cursor:pointer;">x</p></div>`
	loadedCount = 0
	info.innerHTML = "Loading Inbound Trades..."
	trades = await fetchTradesType("Inbound")
	info.innerHTML = `Loading Trades... (0/${trades.length})`
	cache = await fetchCachedTrades()
	loadedTrades = []
	uncached = []
	count = 0
	userInventory = {}
	for (j = 0; j < trades.length; j++) {
		tradeId = parseInt(trades[j][0])
		if (tradeId in cache && cache[tradeId] != null) {
			loadedTrades.push(cache[tradeId])
			count++
			info.innerHTML = `Loading Trades... (${count}/${trades.length})`
		} else {
			uncached.push(tradeId)
		}
	}
	var myflag = 0
	for (j = 0; j < uncached.length; j++) {
		if (myflag == 0 && j != 0) {
			await timeout(2000)
		}
		count++
		async function doCache(tradeId) {
			cachedTrade = await cacheTrade(tradeId)
			if (Number.isInteger(cachedTrade)) {
				if (cachedTrade == 429) {
					await timeout(2000)
					await doCache(tradeId)
				}
			} else {
				if (cachedTrade.length == 2) {
					myflag = cachedTrade[1]
					loadedTrades.push(cachedTrade[0])
					info.innerHTML = `Loading Trades... (${count}/${trades.length})`
				}
			}
		}
		try {
			await doCache(uncached[j])
		} catch(e) {
			console.log(e)
		}
	}
	filteredTrades = []
	for (j = 0; j < loadedTrades.length; j++) {
		user = loadedTrades[j].user
		offers = loadedTrades[j].offers
		if (offers[0].user.id == user.id) {
			theirSide = offers[0]
			mySide = offers[1]
		} else {
			theirSide = offers[1]
			mySide = offers[0]
		}
		filtered = false
		for (k = 0; k < theirSide.userAssets.length; k++) {
			if (theirSide.userAssets[k].assetId == item.id) {
				loadedTrades[j].user.nameForDisplay = loadedTrades[j].user.displayName
				loadedTrades[j].isActive = true
				loadedTrades[j].tradeStatusType = "Inbound"
				loadedTrades[j].status = "Open"
				filteredTrades.push(loadedTrades[j])
				filtered = true
				break
			}
		}
		if (filtered == false) {
			for (k = 0; k < mySide.userAssets.length; k++) {
				if (mySide.userAssets[k].assetId == item.id) {
					loadedTrades[j].user.nameForDisplay = loadedTrades[j].user.displayName
					loadedTrades[j].isActive = true
					loadedTrades[j].tradeStatusType = "Inbound"
					loadedTrades[j].status = "Open"
					filteredTrades.push(loadedTrades[j])
					break
				}
			}
		}
	}
	if (filteredTrades.length == 0) {
		info.innerHTML = `There are no inbound trades with this item.`
		info.parentNode.childNodes[0].style.width = "60px"
		info.parentNode.childNodes[0].style.margin = "-15px"
		info.parentNode.childNodes[0].style.marginRight = "-5px"
		info.parentNode.childNodes[0].style.marginBottom = "-10px"
		info.parentNode.style.marginTop = "-70px"
		info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
		div = document.createElement('div')
		div.innerHTML = `<p id="secondaryReload" style="margin-top:3px;cursor:pointer;">Reload</p><a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
		info.appendChild(div)
		document.getElementById('secondaryModal').style.height = "325px"
		$("#secondaryReload").click(function(){
			closeSecondary()
			setTimeout(function() {
				document.getElementById('filterTradesByItem').click()
			}, 500)
		})
		$("#secondaryClose").click(function(){
			closeSecondary()
		})
	} else {
		if (document.getElementById('filteredTrades') == null) {
			filteredTradesDiv = document.createElement('div')
			filteredTradesDiv.setAttribute('id', 'filteredTrades')
			filteredTradesDiv.style.display = 'none'
			filteredTradesDiv.innerText = encodeURI(JSON.stringify(filteredTrades))
			document.body.appendChild(filteredTradesDiv)
		} else {
			filteredTradesDiv = document.getElementById('filteredTrades')
			filteredTradesDiv.innerText = encodeURI(JSON.stringify(filteredTrades))
		}
		if (document.getElementById('filterText') == null) {
			div = document.createElement('div')
			div.id = 'filterText'
			div.innerHTML = filterHTML
		} else {
			div = document.getElementById('filterText')
			div.innerHTML = filterHTML
		}
		div.getElementsByTagName('p')[0].addEventListener('click', function() {
			document.getElementById('tab-Inbound').children[0].click()
			document.getElementById('filterText').remove()
		})
		document.getElementsByClassName('trades-header')[0].appendChild(div)
		document.getElementById('tab-Inbound').children[0].addEventListener('click', function() {
			if (document.getElementById('filterText') != null) {
				document.getElementById('filterText').remove()
			}
			firstLoad = true
		})
		document.getElementById('tab-Outbound').children[0].addEventListener('click', function() {
			if (document.getElementById('filterText') != null) {
				document.getElementById('filterText').remove()
			}
			firstLoad = true
		})
		document.getElementById('tab-Completed').children[0].addEventListener('click', function() {
			if (document.getElementById('filterText') != null) {
				document.getElementById('filterText').remove()
			}
			firstLoad = true
		})
		document.getElementById('tab-Inactive').children[0].addEventListener('click', function() {
			if (document.getElementById('filterText') != null) {
				document.getElementById('filterText').remove()
			}
			firstLoad = true
		})
		document.dispatchEvent(new CustomEvent('replaceRows'));
		document.getElementById('tradePanelModal').parentNode.remove()
	}
}

async function cancelAllOutbounds(info) {
	loadedCount = 0
	info.innerHTML = "Loading Outbound Trades..."
	trades = await fetchTradesType("Outbound")
	info.innerHTML = `Cancelling Trades... (0/${parseInt(trades.length)})`
	declined = await declineTrades(trades, info)
	info.innerHTML = `Done. Cancelled ${parseInt(declined)} Trade${parseInt(declined) == 1 ? '' : 's'}`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}

async function cancelAllOutboundLosses(info, percentLoss) {
	if (!await fetchSetting('moreTradePanel')) {
		return
	}
	myUsername = await getUsername()
	loadedCount = 0
	info.innerHTML = "Loading Outbound Trades..."
	trades = await fetchTradesType("Outbound")
	info.innerHTML = `Loading Trades... (0/${trades.length})`
	cache = await fetchCachedTrades()
	loadedTrades = []
	uncached = []
	count = 0
	tradeValues = {}
	winsLosses = {"wins": 0, "equal": 0, "losses": 0, "validLosses": 0}
	for (j = 0; j < trades.length; j++) {
		tradeId = parseInt(trades[j][0])
		if (tradeId in cache && cache[tradeId] != null) {
			loadedTrades.push(cache[tradeId])
			count++
			info.innerHTML = `Loading Outbound Trades... (${count}/${trades.length})`
		} else {
			uncached.push(tradeId)
		}
	}
	chunkedArray = chunkArray(loadedTrades, 20)
	for (chunk in chunkedArray) {
		chunkValues = await fetchValues({data: chunkedArray[chunk]})
		for (tradeId in chunkValues) {
			tradeValues[tradeId] = chunkValues[tradeId]
			trade = chunkValues[tradeId][0]
			if (myUsername in trade) {
				myValue = 1
				theirValue = 1
				for (username in trade) {
					if (username == myUsername) {
						myValue = trade[username]
					} else {
						theirValue = trade[username]
					}
				}
				if (myValue > theirValue) {
					winsLosses["losses"]++
					ratio = ((theirValue - myValue) / theirValue) * 100
					if (ratio <= percentLoss * -1) {
						winsLosses["validLosses"]++
					}
				} else if (myValue == theirValue) {
					winsLosses["equal"]++
				} else {
					winsLosses["wins"]++
				}
			}
		}
		info.innerHTML = `Loading Outbound Trades... (${count}/${trades.length})<br><u style="font-size:13px;">Wins: ${winsLosses["wins"]} | Equal: ${winsLosses["equal"]} | Losses: ${winsLosses["losses"]} | Losses To Decline: ${winsLosses["validLosses"]}</u>`
	}
	var myflag = 0
	for (j = 0; j < uncached.length; j++) {
		if (myflag == 0) {
			await timeout(1000)
		}
		count++
		async function doCache(tradeId) {
			cachedTrade = await cacheTrade(tradeId)
			if (Number.isInteger(cachedTrade)) {
				if (cachedTrade == 429) {
					await timeout(1000)
					await doCache(tradeId)
				}
			} else {
				if (cachedTrade.length == 2) {
					loadedTrades.push(cachedTrade[0])
					myflag = cachedTrade[1]
					chunkValues = await fetchValues({data: [cachedTrade[0]]})
					for (tradeId in chunkValues) {
						tradeValues[tradeId] = chunkValues[tradeId]
						trade = chunkValues[tradeId][0]
						if (myUsername in trade) {
							myValue = 1
							theirValue = 1
							for (username in trade) {
								if (username == myUsername) {
									myValue = trade[username]
								} else {
									theirValue = trade[username]
								}
							}
							if (myValue > theirValue) {
								winsLosses["losses"]++
								ratio = ((theirValue - myValue) / theirValue) * 100
								if (ratio <= percentLoss * -1) {
									winsLosses["validLosses"]++
								}
							} else if (myValue == theirValue) {
								winsLosses["equal"]++
							} else {
								winsLosses["wins"]++
							}
						}
					}
					info.innerHTML = `Loading Outbound Trades... (${count}/${trades.length})<br><u style="font-size:13px;">Wins: ${winsLosses["wins"]} | Equal: ${winsLosses["equal"]} | Losses: ${winsLosses["losses"]} | Losses To Cancel: ${winsLosses["validLosses"]}</u>`
				}
			}
		}
		try {
			await doCache(uncached[j])
		} catch(e) {
			console.log(e)
		}
	}
	decline = []
	for (tradeId in tradeValues) {
		try {
			trade = tradeValues[tradeId][0]
			if (myUsername in trade) {
				myValue = 1
				theirValue = 1
				for (username in trade) {
					if (username == myUsername) {
						myValue = trade[username]
					} else {
						theirValue = trade[username]
					}
				}
				if (theirValue > 0) {
					ratio = ((theirValue - myValue) / theirValue) * 100
					if (ratio <= percentLoss * -1) {
						decline.push([parseInt(tradeId), 0])
					}
				}
			}
		} catch (e) {
			console.log(e)
		}
	}
	info.innerHTML = `Cancelling Trades... (0/${parseInt(decline.length)})`
	declined = await declineTrades(decline, info)
	info.innerHTML = `Done. Cancelled ${parseInt(declined)} Loss${parseInt(declined) == 1 ? '' : 'es'} of ${parseInt(percentLoss)}% or more.`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}

async function declineFlaggedTradeBotters(info) {
	loadedCount = 0
	info.innerHTML = "Loading Inbound Trades..."
	trades = await fetchTradesType("Inbound")
	users = new Set()
	for (j = 0; j < trades.length; j++) {
		users.add(trades[j][1])
	}
	users = Array.from(users)
	info.innerHTML = "Checking For Users You've Flagged..."
	botters = JSON.parse(await fetchTradeBotters(users, "flagged"))
	botTrades = []
	for (j = 0; j < trades.length; j++) {
		if (botters.includes(trades[j][1])) {
			botTrades.push(trades[j])
		}
	}
	info.innerHTML = `Declining Trades... (0/${parseInt(botTrades.length)})`
	declined = await declineTrades(botTrades, info)
	info.innerHTML = `Done. Declined ${parseInt(declined)} Bot Trade${parseInt(declined) == 1 ? '' : 's'}`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:40px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "325px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}

async function declineSuspectedTradeBotters(info) {
	selectionText = $(".sus-selection").get(0).innerHTML
	if (selectionText == "A Bit Sus") {
		selection = "bit_sus"
		selectionText2 = "A Bit Sus"
	} else if (selectionText == "Kinda Sus") {
		selection = "kinda_sus"
		selectionText2 = "Kinda Sus"
	} else if (selectionText == "Pretty Sus") {
		selection = "pretty_sus"
		selectionText2 = "Pretty Sus"
	} else {
		selection = "mad_sus"
		selectionText2 = "Mad Sus"
	}
	loadedCount = 0
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.innerHTML = "Loading Inbound Trades..."
	trades = await fetchTradesType("Inbound")
	users = new Set()
	for (j = 0; j < trades.length; j++) {
		users.add(trades[j][1])
	}
	users = Array.from(users)
	info.innerHTML = "Checking For Traders Who Are " + selectionText2 + "..."
	botters = JSON.parse(await fetchTradeBotters(users, selection))
	await timeout(5000)
	botTrades = []
	for (j = 0; j < trades.length; j++) {
		if (botters.includes(trades[j][1])) {
			botTrades.push(trades[j])
		}
	}
	info.innerHTML = `Declining Trades... (0/${parseInt(botTrades.length)})`
	declined = await declineTrades(botTrades, info)
	info.innerHTML = `Done. Declined ${parseInt(declined)} Suspected Bot Trade${parseInt(declined) == 1 ? '' : 's'}`
	info.parentNode.childNodes[0].style.width = "60px"
	info.parentNode.childNodes[0].style.margin = "-15px"
	info.parentNode.childNodes[0].style.marginRight = "-5px"
	info.parentNode.childNodes[0].style.marginBottom = "-10px"
	info.parentNode.childNodes[0].src = chrome.runtime.getURL('/images/checkmark.png')
	div = document.createElement('div')
	div.innerHTML = `<a style="width: 240px;color: white; background-color: rgb(0, 132, 221); float: right; margin: 10px;position:absolute;right:140px;bottom:20px;" class="btn-growth-md btn-secondary-md" id="secondaryClose"><p style="font-weight:bold;color:white;">Close</p></a>`
	info.appendChild(div)
	document.getElementById('secondaryModal').style.height = "350px"
	$("#secondaryClose").click(function(){
		closeSecondary()
	})
}



function openSecondary() {
	modal = document.getElementsByClassName('upgrade-modal-content').length > 0 ? document.getElementsByClassName('upgrade-modal-content')[0] : document.getElementsByClassName('upgrade-modal-content-tertiary')[0]
	if (typeof modal != 'undefined') {
		modal.classList.remove('upgrade-modal-content')
		modal.classList.remove('upgrade-modal-content-tertiary')
		modal.classList.add('upgrade-modal-content-secondary')
		modal.parentNode.appendChild(secondary)
		secondary.style.display = "block"
		setTimeout(function() {
			secondary.style.left = "calc(50% - 300px)"
		}, 10)
	}
}

function closeSecondary() {
	if (document.getElementsByClassName('upgrade-modal-content-secondary').length > 0) {
		modal = document.getElementsByClassName('upgrade-modal-content-secondary')[0]
		modal.classList.remove('upgrade-modal-content-secondary')
		modal.classList.add('upgrade-modal-content-tertiary')
	}
	$("#secondaryModal").get(0).style.left = "2000px"
	setTimeout(function(){
		$("#secondaryModal").get(0).remove()
	}, 400)
}

async function addTradePanel() {
	more = await fetchSetting("moreTradePanel")
	tradePanelHTML = `<div id="tradePanelModal" class="upgrade-modal" style="z-index: 100000; display: block;">
		<div style="z-index:10000;display:block;overflow:hidden;" class="upgrade-modal">
			<div style="background-color:#232527;position:absolute;width:600px;height:775px;left:calc(50% - 300px);top:calc(50% - 400px);" class="dark-theme modal-content upgrade-modal-content">
				<span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
				<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;">
					<img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}">
					<p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p>
				</h2>
				<video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance9.webm" autoplay="" loop="" muted=""></video>
				<a href="https://ropro.io#plus" target="_blank"></a>
				<div style="position:absolute;top:110px;width:550px;height:675px;left:25px;">
					<li class="panel-button" style="display: block;margin:10px;position:relative">
						<a style="width:100%;color:white;background-color:#0084DD;" class="btn-growth-md btn-secondary-md" id="declineAllInbounds">
							<img src="${chrome.runtime.getURL('/images/inbound_icon.png')}" style="width:20px;float:left;">
							<p style="font-weight:bold;color:white;">Decline All Inbounds</p>
						</a>
						<span style="position:absolute;top:-3px;left:535px;width:210px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline all trades you have inbound.</span>
					</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative;">
						<a style="width:100%;color:white;background-color:#0084DD;" class="btn-growth-md btn-secondary-md" id="cancelAllOutbounds">
							<img src="${chrome.runtime.getURL('/images/inbound_icon.png')}" style="width:20px;float:left;transform: scaleX(-1);">
							<p style="font-weight:bold;color:white;">Cancel All Outbounds</p>
						</a>
						<span style="position:absolute;top:-3px;left:535px;width:210px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Cancel all trades you have outbound.</span>
					</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative;">
						<a style="width:100%;color:white;background-color:#0084DD;" class="btn-growth-md btn-secondary-md" id="declineFlaggedTradeBotters">
							<img src="${chrome.runtime.getURL('/images/robot_white2.png')}" style="margin:-3px;width:30px;float:left;transform: scaleX(-1);">
							<p style="font-weight:bold;color:white;">Decline Flagged Trade Botters</p>
						</a>
						<span style="position:absolute;top:-15px;left:535px;width:210px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline all trades from users you have flagged as trade bots.</span>
					</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative;">
						<a style="width:100%;color:white;background-color:#0084DD;" class="btn-growth-md btn-secondary-md" id="declineSuspectedTradeBotters">
							<img src="${chrome.runtime.getURL('/images/robot_white2.png')}" style="margin:-3px;width:30px;float:left;transform: scaleX(-1);">
							<p style="font-weight:bold;color:white;">Decline Suspected Trade Botters</p>
						</a>
						<span style="position:absolute;top:-30px;left:535px;width:210px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline all trades from users who are suspected to be trade botters based on RoPro community flags.</span>
					</li>
					<li class="panel-button" style="display: block;margin:10px;padding-bottom:15px;border-bottom: 3px solid #FFFFFF;position:relative;">
						<a style="width:100%;color:white;background-color:#0084DD;" class="btn-growth-md btn-secondary-md" id="declineOldTrades">
							<img src="${chrome.runtime.getURL('/images/timer_light.svg')}" style="width:30px;float:left;filter:invert(1);margin-left:-3px;margin-top:-2px;margin-bottom:-5px;">
							<p style="font-weight:bold;color:white;">Decline Old Trades</p>
						</a>
						<span style="position:absolute;top:-15px;left:535px;width:210px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline trades which are older than a certain age in hours/days.</span>
					</li>
					<li style="display: block;margin:10px;height:55px;">
						<div style="float:left;">
							<p style="font-weight:bold;color:white;font-size:23px;text-align:left;">Subscriber Only Features</p>
							<p id="outfitSubtitle" style="margin-top:-2px;font-size:13px;width:350px;line-height:13px;" class="ng-binding nameAndSaveText">Features only available for RoPro Plus and up.</p>
						</div>
						<div style="float:right;${more ? 'display:none;' : ''}">
						<a href="https://ropro.io#plus" target="_blank" style="width:180px;height:50px;color:white;" class="btn-growth-md btn-secondary-md">
							<p style="margin-top:3px;font-weight:bold;color:white;">Upgrade Now</p>
						</a>
						</div>
					</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative;">
						<a style="width:100%;color:white;background-color:#${more ? '0084DD' : 'D8D8D8'};${more ? '' : 'pointer-events:none;'}" class="btn-growth-md btn-secondary-md" id="declineAllInboundLosses">
							<img src="${chrome.runtime.getURL('/images/down_arrow.png')}" style="width:20px;float:left;filter:contrast(0) sepia(400%) hue-rotate(190deg) brightness(1000%) ${more ? '' : 'invert(0.5)'};">
							<p style="font-weight:bold;color:${more ? 'white' : '#939393'};">Decline All Inbound Losses</p>
						</a>
						<span style="position:absolute;top:-45px;left:535px;width:250px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline inbound trades in which you lose beyond a certain threshold. Losses are calculated automatically using real-time Rolimons.com item values.</span>
						</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative;">
						<a style="width:100%;color:white;background-color:#${more ? '0084DD' : 'D8D8D8'};${more ? '' : 'pointer-events:none;'}" class="btn-growth-md btn-secondary-md" id="cancelAllOutboundLosses">
							<img src="${chrome.runtime.getURL('/images/down_arrow.png')}" style="width:20px;float:left;filter:contrast(0) sepia(100%) hue-rotate(190deg) brightness(1000%) ${more ? '' : 'invert(0.5)'};">
							<p style="font-weight:bold;color:${more ? 'white' : '#939393'};">Cancel All Outbound Losses</p>
						</a>
						<span style="position:absolute;top:-45px;left:535px;width:250px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline outbound trades in which you lose beyond a certain threshold. Losses are calculated automatically using real-time Rolimons.com item values.</span>					</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative">
						<a style="width:100%;color:white;background-color:#${more ? '0084DD' : 'D8D8D8'};${more ? '' : 'pointer-events:none;'}" class="btn-growth-md btn-secondary-md" id="declineInvalidInbounds">
							<img src="${chrome.runtime.getURL('/images/inbound_icon.png')}" style="width:20px;float:left;filter:contrast(0) sepia(100%) hue-rotate(190deg) brightness(1000%) ${more ? '' : 'invert(0.5)'};">
							<p style="font-weight:bold;color:${more ? 'white' : '#939393'};">Decline Invalid Inbounds</p>
						</a>
						<span style="position:absolute;top:-35px;left:535px;width:250px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline inbound trades in which either you or the other player no longer have one of the items being offered (impossible trades).</span>
					</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative;">
						<a style="width:100%;color:white;background-color:#${more ? '0084DD' : 'D8D8D8'};${more ? '' : 'pointer-events:none;'}" class="btn-growth-md btn-secondary-md" id="declineProjectedInbounds">
							<img src="${chrome.runtime.getURL('/images/inbound_icon.png')}" style="width:20px;float:left;filter:contrast(0) sepia(100%) hue-rotate(190deg) brightness(1000%) ${more ? '' : 'invert(0.5)'};">
							<p style="font-weight:bold;color:${more ? 'white' : '#939393'};">Decline Projected Inbounds</p>
						</a>
						<span style="position:absolute;top:-17px;left:535px;width:250px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Decline inbound trades from which you would receive a projected item.</span>
					</li>
					<li class="panel-button" style="display: block;margin:10px;position:relative;">
						<a style="width:100%;color:white;background-color:#${more ? '0084DD' : 'D8D8D8'};${more ? '' : 'pointer-events:none;'}" class="btn-growth-md btn-secondary-md" id="filterTradesByItem">
							<img src="${chrome.runtime.getURL('/images/dominusicon.png')}" style="width:27px;float:left;margin-left:-3px;filter: ${more ? '' : 'invert(0.5)'};">
							<p style="font-weight:bold;color:${more ? 'white' : '#939393'};">Filter Trades By Item</p>
						</a>
						<span style="position:absolute;top:-15px;left:535px;width:250px;background-color:black;padding:10px;border-radius:10px;display:none;" class="panel-button-info">Filter your inbound trades list by trades which contain a certain item.</span>
					</li>
					<li class="panel-button" style="display: block;margin:10px;display:none;position:relative;">
						<a style="width:100%;color:white;background-color:#${more ? '0084DD' : 'D8D8D8'};${more ? '' : 'pointer-events:none;'}" class="btn-growth-md btn-secondary-md" id="upgrade-now-button">
							<img src="${chrome.runtime.getURL('/images/chart_icon.svg')}" style="width:27px;float:left;filter:contrast(0) sepia(100%) hue-rotate(190deg) brightness(1000%) ${more ? '' : 'invert(0.5)'};margin:-3px;">
							<p style="font-weight:bold;color:${more ? 'white' : '#939393'};">Calculate Daily Profit</p>
						</a>
					</li>
				</div>
			</div>
		</div>
	</div>`
	tradePanelDiv = document.createElement('div')
	tradePanelDiv.innerHTML = tradePanelHTML
	document.body.appendChild(tradePanelDiv)
	setTimeout(function() {
		document.getElementById('tradePanelModal').addEventListener('click', function(e) {
			if (document.getElementsByClassName('upgrade-modal-content').length > 0  && document.getElementById('secondaryModal') == null) {
				if (!document.getElementsByClassName('upgrade-modal-content')[0].contains(e.target)) {
					document.getElementById('tradePanelModal').parentNode.remove()
				}
			}
			if (document.getElementsByClassName('upgrade-modal-content-tertiary').length > 0 && document.getElementById('secondaryModal') == null) {
				if (!document.getElementsByClassName('upgrade-modal-content-tertiary')[0].contains(e.target)) {
					document.getElementById('tradePanelModal').parentNode.remove()
				}
			}
		})
	}, 500)
	document.getElementsByClassName('upgrade-modal-close')[0].addEventListener('click', function() {
		document.getElementById('tradePanelModal').parentNode.remove()
	})
	$("#declineAllInbounds").click(function() {
		secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:275px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
		<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
		<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Decline All Inbounds?</h3></li>
		<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
		<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
		</div>`
		div = document.createElement('div')
		div.innerHTML = secondaryHTML
		secondary = div.firstChild
		openSecondary(secondary)
		$("#secondaryCancel").click(function(){
			closeSecondary()
		})
		$("#secondaryContinue").click(function(){
			$("#secondaryContinue").get(0).style.display = "none"
			$("#secondaryCancel").get(0).style.display = "none"
			$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Declining All Inbounds...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p>`
			$("#secondaryBody").get(0).style.display = "block"
			declineAllInbounds($("#secondaryInfo").get(0))
		})
	})
	$("#cancelAllOutbounds").click(function() {
		secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:275px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
		<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
		<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Cancel All Outbounds?</h3></li>
		<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
		<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
		</div>`
		div = document.createElement('div')
		div.innerHTML = secondaryHTML
		secondary = div.firstChild
		openSecondary(secondary)
		$("#secondaryCancel").click(function(){
			closeSecondary()
		})
		$("#secondaryContinue").click(function(){
			$("#secondaryContinue").get(0).style.display = "none"
			$("#secondaryCancel").get(0).style.display = "none"
			$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Cancelling all outbounds...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p>`
			$("#secondaryBody").get(0).style.display = "block"
			cancelAllOutbounds($("#secondaryInfo").get(0))
		})
	})
	$("#declineFlaggedTradeBotters").click(function() {
		secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:275px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
		<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
		<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Decline Users You've Flagged as Trade Botters?</h3></li>
		<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
		<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
		</div>`
		div = document.createElement('div')
		div.innerHTML = secondaryHTML
		secondary = div.firstChild
		openSecondary(secondary)
		$("#secondaryCancel").click(function(){
			closeSecondary()
		})
		$("#secondaryContinue").click(function(){
			$("#secondaryContinue").get(0).style.display = "none"
			$("#secondaryCancel").get(0).style.display = "none"
			$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Declining Users You've Flagged...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p>`
			$("#secondaryBody").get(0).style.display = "block"
			declineFlaggedTradeBotters($("#secondaryInfo").get(0))
		})
	})
	$("#declineSuspectedTradeBotters").click(function() {
		secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:325px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
		<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
		<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Decline Suspected Trade Botters?</h3></li>
		<div style="margin-left:160px;height:50px;"><p>Decline Traders Who Are:</p>
		<div id="susDropdown" style="overflow:visible;margin-top:-5px;margin-left:0px;float:left;width:150px;margin-left:25px;" class="input-group-btn">
		<button type="button" style="border-radius:0px;border:none;" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
		<span id="genreLabel" class="rbx-selection-label sus-selection ng-binding" style="width:110px;overflow:hidden;" ng-bind="layout.selectedTab.label">Kinda Sus</span> 
		<span class="icon-down-16x16"></span></button>
		<ul style="max-height:1000px;width:140px;" id="genreOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu"> 
		<li>
		<a genre="A Bit Sus" class="susChoice">
			<span ng-bind="tab.label" class="ng-binding">A Bit Sus</span>
		</a></li><li>
		<a genre="Kinda Sus" class="susChoice">
			<span ng-bind="tab.label" class="ng-binding">Kinda Sus</span>
		</a></li><li>
		<a genre="Pretty Sus" class="susChoice">
			<span ng-bind="tab.label" class="ng-binding">Pretty Sus</span>
		</a></li><li>
		<a genre="Mad Sus" class="susChoice">
			<span ng-bind="tab.label" class="ng-binding">Mad Sus</span>
		</a></li></ul></div></div>
		<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
		<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
		</div>`
		div = document.createElement('div')
		div.innerHTML = secondaryHTML
		secondary = div.firstChild
		openSecondary(secondary)
		$(".susChoice").click(function(){
			$(".sus-selection").get(0).innerHTML = stripTags(this.getAttribute("genre"))
		})
		$("#secondaryCancel").click(function(){
			closeSecondary()
		})
		$("#secondaryContinue").click(function(){
			$("#susDropdown").get(0).parentNode.style.display = "none"
			$("#secondaryContinue").get(0).style.display = "none"
			$("#secondaryCancel").get(0).style.display = "none"
			$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Declining Suspected Trade Bots...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p><br>`
			$("#secondaryBody").get(0).style.display = "block"
			declineSuspectedTradeBotters($("#secondaryInfo").get(0))
		})
	})
	$("#declineOldTrades").click(function() {
		secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:365px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
		<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
		<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Decline Old Trades?</h3></li>
		<div style="margin-left:145px;height:50px;"><div id="minimumAgeDiv"><p style="margin-left:40px;">Minimum Trade Age:</p>
		<div style="float:left;width:350px;margin-left:0px;margin-top:-2px;">
		<input id="lossPercentage" oninput="this.nextElementSibling.childNodes[0].value = (this.value <= 24 ? this.value : Math.round(this.value / 24)) + (this.value <= 24 ? ' hour' + (this.value == 1 ? '' : 's') + ' old': ' day' + (Math.round(this.value / 24) == 1 ? '' : 's') + ' old')" value="24" max="108" min="0" type="range" style="float: left; width: 150px; height: 30px; margin-top: 2px;" step="1">
		<div style="margin-top:5px;"><output style="margin-left:10px;font-size:14px;height:30px;">24 hours old</output></div>
		</div></div>
		<div id="susDropdown" style="overflow:visible;margin-top:5px;margin-left:0px;float:left;width:167px;margin-left:25px;" class="input-group-btn">
		<button type="button" style="border-radius:0px;border:none;" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
		<p style="margin-left:30px;">Trade Type:</p>
		<span id="genreLabel" class="rbx-selection-label trade-selection ng-binding" style="width:110px;overflow:hidden;text-align:center;margin-left:17px;" ng-bind="layout.selectedTab.label">Inbound</span> 
		<span class="icon-down-16x16"></span></button>
		<ul style="max-height:1000px;width:200px;" id="genreOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu">
		<li><a genre="Inbound" class="tradeChoice">
			<span ng-bind="tab.label" class="ng-binding">Inbound Trades</span>
		</a></li>
		<li><a genre="Outbound" class="tradeChoice">
			<span ng-bind="tab.label" class="ng-binding">Outbound Trades</span>
		</a></li>
		</ul>
		</div>
		</div>
		<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
		<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
		</div>`
		div = document.createElement('div')
		div.innerHTML = secondaryHTML
		secondary = div.firstChild
		openSecondary(secondary)
		$(".tradeChoice").click(function(){
			$(".trade-selection").get(0).innerHTML = stripTags(this.getAttribute("genre"))
		})
		$("#secondaryCancel").click(function(){
			closeSecondary()
		})
		$("#secondaryContinue").click(function(){
			$("#minimumAgeDiv").get(0).parentNode.style.display = "none"
			$("#secondaryContinue").get(0).style.display = "none"
			$("#secondaryCancel").get(0).style.display = "none"
			$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Declining Old Trades...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p>`
			$("#secondaryBody").get(0).style.display = "block"
			declineOldTrades($("#secondaryInfo").get(0), parseInt($("#lossPercentage").get(0).value), $("#genreLabel").get(0).innerHTML)
		})
	})
	$("#declineAllInboundLosses").click(async function() {
		if (await fetchSetting('moreTradePanel')) {
			secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:325px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
			<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
			<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Decline Inbound Losses?</h3></li>
			<div style="margin-left:145px;height:50px;"><div id="minimumLossDiv"><p>Minimum Value Loss Percentage:</p>
			<div style="float:left;width:350px;margin-left:0px;margin-top:-2px;">

			<input id="lossPercentage" oninput="this.nextElementSibling.childNodes[0].value = this.value + '% Value Loss' + (this.value == 0 ? ' (Equal)' : '')" value="10" max="100" min="0" type="range" style="float: left; width: 150px; height: 30px; margin-top: 2px;" step="5">

			<div style="margin-top:5px;"><output style="margin-left:10px;font-size:14px;height:30px;">10% Value Loss</output></div>
			</div></div></div>
			<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
			<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
			</div>`
			div = document.createElement('div')
			div.innerHTML = secondaryHTML
			secondary = div.firstChild
			openSecondary(secondary)
			$("#secondaryCancel").click(function(){
				closeSecondary()
			})
			$("#secondaryContinue").click(function(){
				$("#minimumLossDiv").get(0).parentNode.style.display = "none"
				$("#secondaryContinue").get(0).style.display = "none"
				$("#secondaryCancel").get(0).style.display = "none"
				$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Declining Inbound Losses...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p>`
				$("#secondaryBody").get(0).style.display = "block"
				declineAllInboundLosses($("#secondaryInfo").get(0), parseInt($("#lossPercentage").get(0).value))
			})
		}
	})
	$("#cancelAllOutboundLosses").click(async function() {
		if (await fetchSetting('moreTradePanel')) {
			secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:325px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
			<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
			<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Cancel Outbound Losses?</h3></li>
			<div style="margin-left:145px;height:50px;"><div id="minimumLossDiv"><p>Minimum Value Loss Percentage:</p>
			<div style="float:left;width:350px;margin-left:0px;margin-top:-2px;">

			<input id="lossPercentage" oninput="this.nextElementSibling.childNodes[0].value = this.value + '% Value Loss' + (this.value == 0 ? ' (Equal)' : '')" value="10" max="100" min="0" type="range" style="float: left; width: 150px; height: 30px; margin-top: 2px;" step="5">
			<div style="margin-top:5px;"><output style="margin-left:10px;font-size:14px;height:30px;">10% Value Loss</output></div>
			</div></div></div>
			<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
			<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
			</div>`
			div = document.createElement('div')
			div.innerHTML = secondaryHTML
			secondary = div.firstChild
			openSecondary(secondary)
			$("#secondaryCancel").click(function(){
				closeSecondary()
			})
			$("#secondaryContinue").click(function(){
				$("#minimumLossDiv").get(0).parentNode.style.display = "none"
				$("#secondaryContinue").get(0).style.display = "none"
				$("#secondaryCancel").get(0).style.display = "none"
				$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Cancelling Outbound Losses...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p>`
				$("#secondaryBody").get(0).style.display = "block"
				cancelAllOutboundLosses($("#secondaryInfo").get(0), parseInt($("#lossPercentage").get(0).value))
			})
		}
	})
	$("#declineInvalidInbounds").click(async function() {
		if (await fetchSetting('moreTradePanel')) {
			secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:275px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
			<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
			<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Decline Invalid Inbounds?</h3></li>
			<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
			<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
			</div>`
			div = document.createElement('div')
			div.innerHTML = secondaryHTML
			secondary = div.firstChild
			openSecondary(secondary)
			$("#secondaryCancel").click(function(){
				closeSecondary()
			})
			$("#secondaryContinue").click(function(){
				$("#secondaryContinue").get(0).style.display = "none"
				$("#secondaryCancel").get(0).style.display = "none"
				$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Declining Invalid Inbounds...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p>`
				$("#secondaryBody").get(0).style.display = "block"
				declineInvalidInbounds($("#secondaryInfo").get(0))
			})
		}
	})
	$("#declineProjectedInbounds").click(async function() {
		if (await fetchSetting('moreTradePanel')) {
			secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:325px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
			<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
			<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Decline Projected Item Inbounds?</h3></li>
			<div style="margin-left:160px;height:50px;"><p>Projected Item Detection:</p>
			<div id="susDropdown" style="overflow:visible;margin-top:-5px;margin-left:0px;float:left;width:150px;margin-left:25px;" class="input-group-btn">
			<button type="button" style="border-radius:0px;border:none;" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
			<span id="genreLabel" class="rbx-selection-label projected-selection ng-binding" style="width:110px;overflow:hidden;text-align:center;" ng-bind="layout.selectedTab.label">RoPro</span> 
			<span class="icon-down-16x16"></span></button>
			<ul style="max-height:1000px;width:350px;" id="genreOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu">
			<li><a genre="RoPro"  class="projectedChoice">
				<span ng-bind="tab.label" class="ng-binding">RoPro Automated Projected Detection</span>
			</a></li>
			<li><a genre="Rolimons" class="projectedChoice">
				<span ng-bind="tab.label" class="ng-binding">Rolimons Manual Projected Label</span>
			</a></li>
			</ul></div></div>
			<li id="secondaryBody" style="display:none;margin:10px;margin-top:20px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
			<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#0084DD;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryContinue"><p style="font-weight:bold;color:white;">Continue</p></a></li></div>
			</div>`
			div = document.createElement('div')
			div.innerHTML = secondaryHTML
			secondary = div.firstChild
			openSecondary(secondary)
			$(".projectedChoice").click(function(){
				$(".projected-selection").get(0).innerHTML = stripTags(this.getAttribute("genre"))
			})
			$("#secondaryCancel").click(function(){
				closeSecondary()
			})
			$("#secondaryContinue").click(function(){
				$("#susDropdown").get(0).parentNode.style.display = "none"
				$("#secondaryContinue").get(0).style.display = "none"
				$("#secondaryCancel").get(0).style.display = "none"
				$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Declining Projected Item Inbounds...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p><br>`
				$("#secondaryBody").get(0).style.display = "block"
				declineProjectedInbounds($("#secondaryInfo").get(0), stripTags($(".projected-selection").get(0).innerHTML).toLowerCase())
			})
		}
	})
	$("#filterTradesByItem").click(async function() {
		if (await fetchSetting('moreTradePanel')) {
			secondaryHTML = `<div style="background-color:#232527;position:absolute;width:600px;height:325px;left:2000px;top:calc(50% - 150px);" id="secondaryModal" class="dark-theme modal-content secondary-modal-content">
			<h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:25px;left:25px;width:550px;margin-top:10px;"><img style="width:119px;left:0px;margin-right:10px;margin-top:-20px;margin-left:35px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}"><p style="color:white;display:inline-block;font-size:31px;font-weight:650;">Trade Panel <b style="font-size:20px;">v1.5</b></p></h2><video style="pointer-events: none;position:absolute;top:-85px;right:-20px;width:250px;" src="https://ropro.io/dances/dance${(16 + Math.floor(Math.random() * 4))}.webm" autoplay="" loop="" muted=""></video>
			<div style="position:absolute;top:110px;width:550px;height:250px;left:25px;"><li style="display: block;margin:10px;text-align:center;"><h3 id="secondaryTitle">Filter Inbound Trades By Item?</h3></li>
			<div style="margin-left:100px;height:50px;">
			<div id="filterSearchBar" style="overflow:visible;margin-top:-5px;margin-left:0px;float:left;width:340px;margin-left:0px;position:relative;" class="input-group-btn">
			<div class="input-group"><div><input id="filterSearch" class="form-control input-field new-input-field" placeholder="Item Search" maxlength="120" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value=""></div><div class="input-group-btn"><button style="margin-left:9px;" class="input-addon-btn"><span class="icon-common-search-sm"></span></button></div></div>
			<ul id="itemSearchList" style="position:absolute;top:38px;z-index:1000;"></ul>
			<ul id="itemSearchSelection" style="position:absolute;top:48px;width:100%;"></ul>
			</div>
			</div>
			<li id="secondaryBody" style="display:none;margin:10px;margin-top:-60px;margin-left:auto;text-align:center;"><p style="font-weight:bold;color:white;"><img style="width:30px;margin-right:10px;margin-bottom:3px;" src="${chrome.runtime.getURL('/images/ropro_icon_animated.webp')}"><span id="secondaryInfo"></span></p></li>
			<li style="display: block;margin:10px;margin-top:20px;"><a style="width:240px;color:white;background-color:#393B3D;float:left;margin:10px;" class="btn-growth-md btn-secondary-md" id="secondaryCancel"><p style="font-weight:bold;color:white;">Cancel</p></a><a style="width:240px;color:white;background-color:#CCCCCC;float:right;margin:10px;" class="btn-growth-md btn-secondary-md" active=false id="secondaryContinue"><p style="font-weight:bold;color:gray;">Continue</p></a></li></div>
			</div>`
			div = document.createElement('div')
			div.innerHTML = secondaryHTML
			secondary = div.firstChild
			openSecondary(secondary)
			setTimeout(function() {
				document.getElementById('filterSearch').focus()
			}, 200)
			$(".projectedChoice").click(function(){
				$(".projected-selection").get(0).innerHTML = stripTags(this.getAttribute("genre"))
			})
			$("#secondaryCancel").click(function(){
				closeSecondary()
			})
			$("#filterSearch").on("keyup", function(event) {
				if (event.keyCode === 13) {
					if (document.getElementById('itemSearchList').children.length > 0) {
						document.getElementById('itemSearchList').children[0].click()
					} else if (document.getElementById('secondaryContinue').getAttribute('active') == 'true') {
						document.getElementById('secondaryContinue').click()
					} else if (document.getElementById('secondaryReload') != null) {
						document.getElementById('secondaryReload').click()
					}
				}
			});			  
			$("#filterSearch").on('input', async function(){
				currentValue = this.value
				if (currentValue != '') {
					items = JSON.parse(await fetchItemMiniSearch(this.value))
					if (this.value == currentValue) {
						list = document.getElementById('itemSearchList')
						list.innerHTML = ''
						for (j = 0; j < items.length; j++) {
							li = document.createElement('li')
							li.classList.add('item-search-element')
							li.style.backgroundColor = '#393B3D'
							li.style.borderBottom = '1px solid hsla(0,0%,100%,.1)'
							li.setAttribute('itemid', parseInt(items[j].id))
							li.setAttribute('itemname', stripTags(items[j].name))
							li.innerHTML = `<div style="z-index:1000;margin-top:0px;padding-left:5px;height:30px;position:relative;"><div style="margin-left:0px;display:inline-block;width:335px;text-align:left;overflow:hidden;white-space: nowrap;"><img style="width:30px;margin-left:-4px;margin-right:5px;margin-bottom:3px;" src="https://api.ropro.io/getAssetThumbnail.php?id=${parseInt(items[j].id)}" id="tradeFilterImage"><span id="tradeFilterText">${stripTags(items[j].name)}</span></div></div>`
							list.appendChild(li)
							li.addEventListener('click', function(){
								itemName = this.getAttribute('itemname')
								itemId = this.getAttribute('itemid')
								selection_li = document.createElement('li')
								selection_li.setAttribute('itemid', parseInt(itemId))
								selection_li.setAttribute('itemname', stripTags(itemName))
								selection_li.innerHTML = `<div style="border-radius:5px;padding-top:2px;background-color:#393B3D;margin-top:-3px;padding-left:5px;height:30px;position:relative;"><div style="margin-left:auto;margin-right:auto;display:inline-block;text-align:left;overflow:hidden;white-space: nowrap;"><img style="float:left;width:30px;margin-left:-4px;margin-right:5px;margin-bottom:3px;" src="https://api.ropro.io/getAssetThumbnail.php?id=${parseInt(itemId)}" id="tradeFilterImage"><div style="float:left;display:inline-block;height:30px;margin-top:3px;width:280px;">${stripTags(itemName)}</div></div><p class="close-selection" style="position:absolute;right:5px;top:0px;font-size:18px;cursor:pointer;">x</p></div>`
								document.getElementById('itemSearchSelection').innerHTML = ''
								document.getElementById('itemSearchSelection').appendChild(selection_li)
								document.getElementById('itemSearchList').innerHTML = ''
								document.getElementById('filterSearch').value = ''
								document.getElementById('secondaryContinue').setAttribute('active', 'true')
								document.getElementById('secondaryContinue').style.backgroundColor = "#0084DD"
								document.getElementById('secondaryContinue').childNodes[0].style.color = "white"
								selection_li.getElementsByClassName('close-selection')[0].addEventListener('click', function(){
									document.getElementById('itemSearchSelection').innerHTML = ''
									document.getElementById('secondaryContinue').setAttribute('active', 'false')
									document.getElementById('secondaryContinue').style.backgroundColor = "#CCCCCC"
									document.getElementById('secondaryContinue').childNodes[0].style.color = "grey"
								})
							})
						}
					}
				} else {
					document.getElementById('itemSearchList').innerHTML = ''
				}
			})
			$("#secondaryContinue").click(function(){
				if (this.getAttribute('active') == "true" && document.getElementById('itemSearchSelection').childNodes[0].getAttribute('itemid') != null) {
					document.getElementById('filterSearchBar').style.display = 'none'
					itemid = parseInt(document.getElementById('itemSearchSelection').childNodes[0].getAttribute('itemid'))
					itemname = stripTags(document.getElementById('itemSearchSelection').childNodes[0].getAttribute('itemname'))
					$("#secondaryContinue").get(0).style.display = "none"
					$("#secondaryCancel").get(0).style.display = "none"
					$("#secondaryTitle").get(0).parentNode.innerHTML = `<h3 id="secondaryTitle">Scanning Trades...</h3><p style="font-size:13px;" id="secondarySubtitle">Due to Roblox ratelimits, this may take several minutes. <br>Please do not refresh this page.</p><br>`
					$("#secondaryBody").get(0).style.display = "block"
					filterTradesByItem($("#secondaryInfo").get(0), {"id": itemid, "name": itemname})
				}
			})
		}
	})
}

async function declineBots() {
	document.getElementById('decliningBots').style.display = "block"
	tradesDeclined = await doDeclineBots()
	oldHTML = document.getElementById('decliningBots').innerHTML
	document.getElementById('decliningBots').innerHTML = "Declined " + tradesDeclined + " bot trades."
	document.getElementById('decliningBots').style.marginTop = "-18px";
	document.getElementById('tab-Inbound').getElementsByTagName('a')[0].click()
	setTimeout(function(){
		document.getElementById('decliningBots').style.display = "none"
		document.getElementById('decliningBots').style.marginTop = "-23px";
		document.getElementById('decliningBots').innerHTML = oldHTML
	}, 2000)
}

var tradeValueCalculator = false;
var tradeDemandRatingCalculator = false;
var tradeItemValue = false;
var tradeItemDemand = false;
var itemInfoCard = false;
var tradePageProjectedWarning = false;
var embeddedRolimonsItemLink = false;
var ownerHistory = false;
var quickDecline = false;
var quickCancel = false;
var tradeBotDefender = false;
var embeddedValueChart = true;
var underOverRAP = false;
var tradePanel = true;

function pageCheck() {
	headers = document.getElementsByClassName('trades-header')
	if (headers.length > 0 && headers[0].getAttribute('headerchecked') != "true") {
		headers[0].setAttribute('headerchecked', 'true')
		if (embeddedValueChart) {
			function check() {
				if (headers.length > 0) {
					links = headers[0].getElementsByClassName('text-link text-secondary ng-binding')
					if (links.length > 0) {
						link = links[0]
						link.removeAttribute('href')
						link.innerHTML = "<a target='_blank' href='https://www.rolimons.com/catalog'>Rolimon's Catalog</a>"
					}
				} else {
					setTimeout(check, 500)
				}
			}
			check()
		}
		if (tradePanel) {
			function check() {
				if (headers.length > 0) {
					links = headers[0].getElementsByClassName('text-link text-secondary ng-binding')
					if (links.length > 0 && document.getElementsByClassName('trade-panel-button').length == 0) {
						li = document.createElement("li")
						li.setAttribute("style", "background-color:#0084DD;color:white;")
						li.innerHTML = '<a> <h3 style="font-size:15px;text-left;margin-right:10%;padding:0px;" class="ng-binding trade-panel-button"> Trade Panel</h3> </a>'
						headers[0].getElementsByClassName('dropdown-menu')[0].appendChild(li)
						li.addEventListener("click", function(){
							addTradePanel()
						})
					}
				} else {
					setTimeout(check, 1000)
				}
			}
			check()
		}
	}
}

var thumbnailCache = {}

function setAssetThumbnail(id) {
	if (id <= 0) {
		return
	}
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

async function addItemToTrade(userAssetId, assetId, name, recentAveragePrice, serialNumber, assetStock, userId) {
	document.dispatchEvent(new CustomEvent('addItemToTrade', {detail: {userAssetId: userAssetId, assetId: assetId, name: name, recentAveragePrice: recentAveragePrice, serialNumber: serialNumber, assetStock: assetStock, userId: userId}}))
}

async function removeItemFromTrade(userAssetId) {
	document.dispatchEvent(new CustomEvent('removeItemFromTrade', {detail: {userAssetId: userAssetId}}))
}

async function checkInventoryCache() {
	setInterval(function() {
		if (document.getElementsByClassName('trade-list-dropdown').length > 0 && (tradeInventory[0] != null || tradeInventory[1] != null)) {
			tradeInventory[0] = null
			tradeInventory[1] = null
		}
	}, 100)
}

async function addItemCard(panel, item, self) {
	var div = document.createElement('div')
	div.innerHTML = `<li class="list-item item-card trade-item-card"> <div trade-item-card=""><div class="item-card-container" data-userassetid="${parseInt(item.userAssetId)}"> <div class="item-card-link"> <div class="item-card-thumb-container"> <span class="limited-icon-container ng-isolate-scope" uib-tooltip="Serial N/A" tooltip-placement="right" tooltip-append-to-body="true" limited-icon=""> <span class="icon-shop-limited"> </span> <span class="limited-number-container ng-hide"> <span class="font-caption-header">#</span> <span class="font-caption-header text-subheader limited-number ng-hide"></span> </span></span> <thumbnail-2d><span class="thumbnail-2d-container" thumbnail-type="Asset" thumbnail-target-id="${parseInt(item.assetId)}"><img class="ropro-image-${parseInt(item.assetId)}" src="${chrome.runtime.getURL('/images/empty.png')}"></span> </thumbnail-2d> </div> </div> <div class="item-card-caption"><a target="_self" href="https://www.roblox.com/catalog/${parseInt(item.assetId)}/Item"> <div class="item-card-name-link"> <div class="item-card-name ropro-item-name" title=""></div> </div> </a> <div class="text-overflow item-card-price"> <span class="icon icon-robux-16x16"></span> <span class="text-robux ropro-item-rap"></span> </div> </div> </div></div> </li>`
	var card = div.childNodes[0]
	card.getElementsByClassName('ropro-item-name')[0].innerText = item.name
	card.getElementsByClassName('ropro-item-rap')[0].innerText = item.recentAveragePrice == null ? 'N/A' : addCommas(item.recentAveragePrice)
	if (item.serialNumber != null) {
		card.getElementsByClassName('limited-number')[0].innerText = item.serialNumber
		card.getElementsByClassName('limited-number')[0].classList.remove('ng-hide')
		card.getElementsByClassName('limited-number-container')[0].classList.remove('ng-hide')
		card.getElementsByClassName('limited-icon-container')[0].setAttribute('uib-tooltip', '')
	}
	panel.appendChild(card)
	div.remove()
	card.getElementsByClassName('item-card-thumb-container')[0].addEventListener('click', function() {
		if (card.getElementsByClassName('item-card-equipped').length == 0) {
			if (document.getElementsByClassName('trade-request-window-offer')[self ? 0 : 1].getElementsByClassName('thumbnail-2d-container').length < 4) {
				var div = document.createElement('div')
				div.innerHTML = `<div class="item-card-equipped"><span class="icon-check-selection"></span></div>`
				card.getElementsByClassName('item-card-caption')[0].appendChild(div.childNodes[0])
				div.remove()
				addItemToTrade(item.userAssetId, item.assetId, item.name, item.recentAveragePrice, item.serialNumber, item.assetStock, parseInt(document.getElementsByClassName('trade-inventory-panel')[self ? 0 : 1].getAttribute('trade-user')))
			}
		} else {
			$(card).find('.item-card-equipped').remove()
			removeItemFromTrade(item.userAssetId)
		}
	})
	if ($(document.getElementsByClassName('trade-request-window-offer')[self ? 0 : 1]).find(`.trade-request-item[data-userassetid="${parseInt(item.userAssetId)}"]`).length > 0) {
		var div = document.createElement('div')
		div.innerHTML = `<div class="item-card-equipped"><span class="icon-check-selection"></span></div>`
		card.getElementsByClassName('item-card-caption')[0].appendChild(div.childNodes[0])
		div.remove()
	}
}

async function displayTradeSearchResults(results, query, self) {
	var itemCards = document.getElementsByClassName('item-cards')[self ? 0 : 1].parentNode
	itemCards.style.display = "none"
	$(`.trade-search-result${self ? '.self' : '.not-self'}`).remove()
	var searchResult = document.createElement('div')
	searchResult.innerHTML = `<ul class="hlist item-cards-stackable">  </ul> <span class="spinner spinner-default"></span> <div class="col-xs-12 container-empty ng-hide">No items found for this search query.</div> <div class="pager-holder"><ul class="pager ng-hide"> <li class="pager-prev"> <button class="btn-generic-left-sm" disabled="disabled"> <span class="icon-left"></span> </button> </li> <li> <span class="page-number">Page 1</span> </li> <li class="pager-next"> <button class="btn-generic-right-sm"> <span class="icon-right"></span> </button> </li> </ul> </div>`
	searchResult.classList.add('trade-search-result')
	searchResult.classList.add(self ? 'self' : 'not-self')
	insertAfter(searchResult, itemCards)
	if (results == null) {
		results = []
		var inventory = await tradeInventory[self ? 0 : 1]
		for (var i = 0; i < inventory.length; i++) {
			if (inventory[i].name.toLowerCase().indexOf(query) > -1) {
				results.push(inventory[i])
			}
		}
	}
	searchResult.getElementsByClassName('spinner')[0].remove()
	if (results.length > 0) {
		var resultsIdSet = new Set()
		for (var i = 0; i < Math.min(results.length, 10); i++) {
			addItemCard(searchResult.getElementsByClassName('item-cards-stackable')[0], results[i], self)
			resultsIdSet.add(results[i].assetId)
		}
		if (results.length > 10) {
			searchResult.getElementsByClassName('pager')[0].classList.remove('ng-hide')
			var page = 0
			searchResult.getElementsByClassName('pager-next')[0].addEventListener('click', function() {
				if ((page + 1) * 10 >= results.length) return
				page += 1
				$(searchResult).find('.item-card').remove()
				searchResult.getElementsByClassName('page-number')[0].innerText = `Page ${parseInt(page + 1)}`
				if (results.length <= page * 10 + 10) {
					searchResult.getElementsByClassName('pager-next')[0].getElementsByTagName('button')[0].setAttribute('disabled', 'disabled')
				} else {
					searchResult.getElementsByClassName('pager-prev')[0].getElementsByTagName('button')[0].removeAttribute('disabled')
				}
				var resultsIdSet = new Set()
				for (var i = page * 10; i < Math.min(results.length, page * 10 + 10); i++) {
					addItemCard(searchResult.getElementsByClassName('item-cards-stackable')[0], results[i], self)
					resultsIdSet.add(results[i].assetId)
				}
				var itemIds = Array.from(resultsIdSet)
				for (var i = 0; i < itemIds.length; i++) {
					setAssetThumbnail(itemIds[i])
				}
				if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
					checkTradeWindow()
				} else if (itemInfoCard) {
					checkTradeFree()
				}
			})
			searchResult.getElementsByClassName('pager-prev')[0].addEventListener('click', function() {
				if ((page - 1) * 10 < 0) return
				page -= 1
				$(searchResult).find('.item-card').remove()
				searchResult.getElementsByClassName('page-number')[0].innerText = `Page ${parseInt(page + 1)}`
				if (page * 10 - 10 < 0) {
					searchResult.getElementsByClassName('pager-prev')[0].getElementsByTagName('button')[0].setAttribute('disabled', 'disabled')
				} else {
					searchResult.getElementsByClassName('pager-next')[0].getElementsByTagName('button')[0].removeAttribute('disabled')
				}
				var resultsIdSet = new Set()
				for (var i = page * 10; i < Math.min(results.length, page * 10 + 10); i++) {
					addItemCard(searchResult.getElementsByClassName('item-cards-stackable')[0], results[i], self)
					resultsIdSet.add(results[i].assetId)
				}
				var itemIds = Array.from(resultsIdSet)
				for (var i = 0; i < itemIds.length; i++) {
					setAssetThumbnail(itemIds[i])
				}
				if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
					checkTradeWindow()
				} else if (itemInfoCard) {
					checkTradeFree()
				}
			})
		}
		var itemIds = Array.from(resultsIdSet)
		for (var i = 0; i < itemIds.length; i++) {
			setAssetThumbnail(itemIds[i])
		}
	} else {
		searchResult.getElementsByClassName('container-empty')[0].classList.remove('ng-hide')
	}
	if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
		checkTradeWindow()
	} else if (itemInfoCard) {
		checkTradeFree()
	}
}

var valueCache = {}

async function addAdvancedTradeDropdown(searchBar, search, self) {
	$('.ropro-advanced-trade-search-dropdown').remove()
	var div = document.createElement('div')
	div.innerHTML = `<div class="ropro-advanced-trade-search-dropdown" style="color:white;z-index:100;position:absolute;width:100%;max-height:300px;overflow-y:auto;background-color:#232527;border-bottom-right-radius:10px;border-bottom-left-radius:10px;"><span class="spinner spinner-default"></span></div>`
	var dropdown = div.childNodes[0]
	searchBar.appendChild(dropdown)
	div.remove()
	var inventory = await tradeInventory[self ? 0 : 1]
	if (search != searchBar.getElementsByTagName('input')[0].value.toLowerCase()) return
	var items = {}
	for (var i = 0; i < inventory.length; i++) {
		if (inventory[i].name.toLowerCase().indexOf(search) == -1) continue
		if (inventory[i].assetId in items) {
			items[inventory[i].assetId].count += 1
		} else {
			items[inventory[i].assetId] = {id: inventory[i].assetId, name: inventory[i].name, rap: inventory[i].recentAveragePrice, value: null, count: 1}
		}
	}
	var assetIds = Object.keys(items)
	for (var i = 0; i < assetIds.length; i++) {
		if (assetIds[i] in valueCache) {
			items[assetIds[i]].value = valueCache[assetIds[i]]
			assetIds.splice(i, 1)
			i--
		}
	}
	if (assetIds.length > 0) {
		var itemsJSON = await fetchItems(assetIds)
		assetIds = Object.keys(itemsJSON)
		for (var i = 0; i < assetIds.length; i++) {
			var itemJSON = JSON.parse(itemsJSON[assetIds[i]])
			items[assetIds[i]].value = isNaN(parseInt(itemJSON[16])) ? items[assetIds[i]].rap : parseInt(itemJSON[16])
			valueCache[assetIds[i]] = isNaN(parseInt(itemJSON[16])) ? items[assetIds[i]].rap : parseInt(itemJSON[16])
		}
	}
	searchBar.getElementsByClassName('spinner')[0].remove()
	assetIds = Object.keys(items)
	assetIds.sort(function(a, b) {
		return items[b].value - items[a].value
	})
	for (var i = 0; i < assetIds.length; i++) {
		var div = document.createElement('div')
		div.innerHTML = `<div style="margin-bottom:1px;width:100%;height:50px;${i == 0 ? '' : 'border-top:1px solid #393b3d;'}" class="ropro-advanced-dropdown-item"><img src="${chrome.runtime.getURL('/images/empty.png')}" style="float:left;width:18%;" class="ropro-image-${parseInt(assetIds[i])}"><div style="font-size:14px;float:left;width:52%;height:50px;padding-top:17px;padding-left:5px;" class="item-card-name text-overflow"></div><div style="text-align:center;float:right;height:50px;width:15%;padding-top:15px;"><div style="background-color:#32353D;padding:5px;font-weight:bold;float:right;width:auto;border-radius:20px;margin-right:2px;font-size:10px;float:right;margin-right:10px;">x${parseInt(items[assetIds[i]].count)}</div></div><div style="text-align:center;float:right;font-weight:bold;height:50px;width:15%;padding-top:20px;margin-left:0px;font-size:10px;">${kFormatter(parseInt(items[assetIds[i]].value))}</div></div>`
		div.getElementsByClassName('item-card-name')[0].innerText = items[assetIds[i]].name
		var item = div.childNodes[0]
		dropdown.appendChild(item)
		div.remove()
		setAssetThumbnail(assetIds[i])
		item.setAttribute('data-asset-id', parseInt(assetIds[i]))
		item.addEventListener('click', function() {
			var assetId = parseInt(this.getAttribute('data-asset-id'))
			var results = []
			for (var i = 0; i < inventory.length; i++) {
				if (inventory[i].assetId == assetId) {
					results.push(inventory[i])
				}
			}
			displayTradeSearchResults(results, null, self)
		})
	}
}

async function handleTradeSearch(searchBar, self) {
	var searchInput = searchBar.getElementsByClassName('trade-search-input')[0]
	searchInput.focus()
	if (await fetchSetting('advancedTradeSearch')) {
		searchInput.addEventListener('focus', async function(e) {
			addAdvancedTradeDropdown(searchBar, this.value.toLowerCase(), self)
		})
		searchBar.addEventListener('focusout', async function(e) {
			setTimeout(function() {
				$(searchBar).find('.ropro-advanced-trade-search-dropdown').remove()
			}, 250)
		})
		searchInput.addEventListener('input', async function(e) {
			addAdvancedTradeDropdown(searchBar, this.value.toLowerCase(), self)
		})
		addAdvancedTradeDropdown(searchBar, "", self)
	}
	searchInput.addEventListener('keypress', async function(e) {
		if (e.key == 'Enter') {
			e.preventDefault()
			displayTradeSearchResults(null, this.value.toLowerCase(), self)
		}
	})
}

async function addTradeSearch(panel, self) {
	var dropdown = panel.getElementsByClassName('inventory-type-dropdown')[0]
	var div = document.createElement('div')
	div.innerHTML = `<div class="input-group-btn group-dropdown inventory-type-dropdown ropro-trade-search-button disabled" style="width:auto;margin-left:5px;"> <button type="button" class="input-dropdown-btn" style="padding:4px;">  <span class="icon-search" style="margin-top:0px;"></span> </button>  </div>`
	var button = div.childNodes[0]
	dropdown.classList.add('accessories-dropdown')
	dropdown.parentNode.insertBefore(button, dropdown)
	if (await fetchSetting('tradeSearch')) {
		button.classList.remove('disabled')
		button.addEventListener('click', function() {
			if (this.classList.contains('active')) {
				button.classList.remove('active')
				button.getElementsByClassName('icon-close')[0].classList.add('icon-search')
				button.getElementsByClassName('icon-close')[0].classList.remove('icon-close')
				if (panel.parentNode.getElementsByClassName('trade-search-result').length > 0) {
					panel.parentNode.getElementsByClassName('trade-search-result')[0].remove()
				}
				panel.getElementsByClassName('trade-search-bar')[0].remove()
				panel.getElementsByClassName('item-cards-stackable')[0].parentNode.style.display = "block"
				panel.getElementsByClassName('accessories-dropdown')[0].style.display = "block"
			} else {
				button.classList.add('active')
				button.getElementsByClassName('icon-search')[0].classList.add('icon-close')
				button.getElementsByClassName('icon-search')[0].classList.remove('icon-search')
				this.parentNode.getElementsByClassName('accessories-dropdown')[0].style.display = "none"
				var div = document.createElement('div')
				div.innerHTML = `<div class="trade-search-bar input-group-btn group-dropdown inventory-type-dropdown"> <input class="trade-search-input form-control input-field new-input-field" placeholder="Search" maxlength="120" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" style="background:none;">  </div>`
				var search = div.childNodes[0]
				insertAfter(search, this)
				if (tradeInventory[self ? 0 : 1] == null) {
					document.dispatchEvent(new CustomEvent('fetchTradeWindowUsers'));
					var userid = parseInt(document.getElementsByClassName('trade-inventory-panel')[self ? 0 : 1].getAttribute('trade-user'))
					tradeInventory[self ? 0 : 1] = fetchInventory(userid)
				}
				handleTradeSearch(search, self)
			}
		})
	} else {
		button.addEventListener('click', function() {
			if (button.parentNode.getElementsByClassName('ropro-trade-search-cta').length == 0) {
				var div = document.createElement('div')
				div.innerHTML = `<div class="ropro-trade-search-cta" style="color:white;z-index:100;position:absolute;width:620px;top:65px;right:0;height:771px;background-color:#191B1D;border-radius:10px;"><div style="background-color:#232527;width:calc(100%-10px);height:calc(100%-10px);margin:20px;"><h2 style="margin-left:20px;margin-top:10px;text-align:center;float:left;font-size:18px;">Trade Search</h2>
				<div style="margin-right:20px;margin-top:17px;text-align:center;float:right;">Plus Feature <li style="float:right;background-color:#0084DD;border:none;border-radius:10px;margin-top:-5px;margin-left:10px;"><a href="https://ropro.io/upgrade?ref=trade_search" target="_blank" class="btn-growth-md btn-secondary-md" style="border:none;color:white;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:25px;margin:-5px;margin-right:5px;margin-top:-7px;">Upgrade</a></li></div>
				<iframe src="https://ropro.io/frames/tradeSearch.php" style="border:none;padding:10px;padding-top:0px;width:100%;height:300px;" scrolling="no"></iframe></div><div style="background-color:#232527;width:calc(100%-10px);height:calc(100%-10px);margin:20px;"><h2 style="margin-left:20px;margin-top:10px;text-align:center;float:left;font-size:18px;">Advanced Trade Search</h2>
				<div style="margin-right:20px;margin-top:17px;text-align:center;float:right;">Rex Feature <li style="float:right;background-color:#A000C0;border:none;border-radius:10px;margin-top:-5px;margin-left:10px;"><a href="https://ropro.io/upgrade?ref=advanced_trade_search" target="_blank" class="btn-growth-md btn-secondary-md" style="border:none;color:white;"><img src="${chrome.runtime.getURL('/images/rex_icon.png')}" style="width:25px;margin:-5px;margin-right:5px;margin-top:-7px;">Upgrade</a></li></div>
				<iframe src="https://ropro.io/frames/advancedTradeSearch.php" style="border:none;padding:10px;padding-top:0px;width:100%;height:300px;" scrolling="no"></iframe></div></div>`
				var cta = div.childNodes[0]
				button.parentNode.appendChild(cta)
				div.remove()
				button.getElementsByClassName('icon-search')[0].classList.add('icon-close')
				button.getElementsByClassName('icon-search')[0].classList.remove('icon-search')
			} else {
				button.parentNode.getElementsByClassName('ropro-trade-search-cta')[0].remove()
				button.getElementsByClassName('icon-close')[0].classList.add('icon-search')
				button.getElementsByClassName('icon-close')[0].classList.remove('icon-close')
			}
		})
	}
}

async function main() {
	if (location.href.includes("/trade")) {
		if (parent.location.hash == "#outbound") {
			document.getElementById('tab-Outbound').getElementsByTagName('a')[0].click()
			parent.location.hash = ""
		} else if (parent.location.hash == "#completed") {
			document.getElementById('tab-Completed').getElementsByTagName('a')[0].click()
			parent.location.hash = ""
		} else if (parent.location.hash == "#inactive") {
			document.getElementById('tab-Inactive').getElementsByTagName('a')[0].click()
			parent.location.hash = ""
		}
		try {
			document.getElementsByClassName('content')[0].style.marginBottom = "300px"
		} catch (e) {
			console.log(e)
		}
		values = ["0", "0"]
		tradeValueCalculator = await fetchSetting("tradeValueCalculator");
		tradeDemandRatingCalculator = await fetchSetting("tradeDemandRatingCalculator");
		tradeItemValue = await fetchSetting("tradeItemValue");
		tradeItemDemand = await fetchSetting("tradeItemDemand");
		tradePageProjectedWarning = await fetchSetting("tradePageProjectedWarning");
		embeddedRolimonsItemLink = await fetchSetting("embeddedRolimonsItemLink");
		embeddedRolimonsUserLink = await fetchSetting("embeddedRolimonsUserLink");
		ownerHistory = await fetchSetting("ownerHistory");
		itemInfoCard = await fetchSetting("itemInfoCard");
		hideSerials = await fetchSetting("hideSerials");
		quickDecline = await fetchSetting("quickDecline");
		quickCancel = await fetchSetting("quickCancel");
		tradePanel = await fetchSetting("tradePanel");
		underOverRAP = await fetchSetting("underOverRAP");
		pageCheck()
		setInterval(function() {
			pageCheck()
		}, 1000)
		setInterval(function() {
			offerHeader = document.getElementsByClassName('trade-list-detail-offer-header')[0]
			if (offerHeader != undefined) {
				if (offerHeader.getAttribute("class").indexOf("checked") == -1) {
					offerHeader.setAttribute("class", stripTags(offerHeader.getAttribute("class")) + " checked")
					if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
						checkTrade()
					} else if (itemInfoCard) {
						checkTradeFree()
					}
				}
			}
			tradeWindow = document.getElementsByClassName('trade-request-window')[0]
			if (tradeWindow != undefined) {
				inventoryPanel = document.getElementsByClassName('trade-inventory-panel')[0]
				if (inventoryPanel != undefined) {
					cardContainer = inventoryPanel.getElementsByClassName('item-card-container')[0]
					if (cardContainer != undefined && cardContainer.getAttribute("class").indexOf("checked") == -1) {
						cardContainer.setAttribute("class", stripTags(cardContainer.getAttribute("class")) + " checked")
						if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
							checkTradeWindow()
						} else if (itemInfoCard) {
							checkTradeFree()
						}
					}
					if (inventoryPanel.getElementsByClassName('ropro-trade-search-button').length == 0) {
						addTradeSearch(inventoryPanel, true)
						checkInventoryCache()
					}
				}
				inventoryPanel = document.getElementsByClassName('trade-inventory-panel')[1]
				if (inventoryPanel != undefined) {
					cardContainer = inventoryPanel.getElementsByClassName('item-card-container')[0]
					if (cardContainer != undefined && cardContainer.getAttribute("class").indexOf("checked") == -1) {
						cardContainer.setAttribute("class", stripTags(cardContainer.getAttribute("class")) + " checked")
						if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
							checkTradeWindow()
						} else if (itemInfoCard) {
							checkTradeFree()
						}
					}
					if (inventoryPanel.getElementsByClassName('ropro-trade-search-button').length == 0) {
						addTradeSearch(inventoryPanel, false)
					}
				}
			}
			tradeWindowOffers = document.getElementsByClassName('trade-request-window-offers')[0]
			if (tradeWindowOffers != undefined) {
				cardContainer = document.getElementsByClassName('trade-request-item')[0]
				if (cardContainer != undefined && cardContainer.getAttribute("class").indexOf("checked") == -1) {
					cardContainer.setAttribute("class", stripTags(cardContainer.getAttribute("class")) + " checked")
					if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
						checkTradeWindowOffers()
					}
				} else {
					if (cardContainer != undefined) {
						myRobux = stripTags(document.getElementsByClassName('trade-request-window-offer')[0].getElementsByClassName('robux-line-value')[0].innerHTML)
						theirRobux = stripTags(document.getElementsByClassName('trade-request-window-offer')[1].getElementsByClassName('robux-line-value')[0].innerHTML)
						if (myRobux != values[0] || theirRobux != values[1]) {
							values[0] = myRobux
							values[1] = theirRobux
							if (tradeValueCalculator || tradeDemandRatingCalculator || tradeItemValue || tradeItemDemand) {
								checkTradeWindowOffers()
							}
						}
					}
				}
			}
			if (tradePanel) {
				tradeTitle = $(".trades-header-nowrap .paired-name:not('.ng-hide'):not('.trade-flag-inserted')")
				for (i = 0; i < tradeTitle.length; i++) {
					if (!tradeTitle.get(i).parentNode.parentNode.classList.contains('trade-request-window')) {
						function doFlag(tradeTitle) {
							setTimeout(function() {
								addTradeFlag(tradeTitle)
							}, firstLoad ? 1000 : 1)
						}
						doFlag(tradeTitle.get(i))
					}
				}
				$(".trade-row-container").click(function(){
					tradeFlagDiv = document.getElementsByClassName('trade-flag-div')
					if (tradeFlagDiv.length > 0) {
						tradeFlagDiv[0].remove()
					}
				})
			}
			if (hideSerials) {
				tradeTitle = $(".trades-header-nowrap .paired-name:not('.ng-hide'):not('.hide-button-inserted')")
				for (i = 0; i < tradeTitle.length; i++) {
					if (!tradeTitle.get(i).parentNode.parentNode.classList.contains('trade-request-window')) {
						addHideButton(tradeTitle.get(i))
					}
				}
				$(".trade-row-container").click(function(){
					if ($('.light-theme').length > 0) {
						theme2 = "_lightmode"
					} else {
						theme2 = ""
					}
					hideButtonImage = $('.hide-button')
					if (hideButtonImage.length > 0) {
						hideButtonImage.get(0).src = chrome.runtime.getURL('/images/serials_on' + theme2 + '.png')
						hideButtonImage.get(0).parentNode.classList.add("inactive")
					}
				})
			}
			tradeRowDetails = $(".trade-row-details:not(.rolimons-user-link-added)")
			if (tradeRowDetails.length > 0) {
				tradeRows = []
				for (i = 0; i < tradeRowDetails.length; i++) {
					addTradeDetails(tradeRowDetails.get(i))
					tradeRows.push(tradeRowDetails.get(i))
				}
				addBatchTradeDetails(tradeRows)
				$(".trade-row-container:not('.click-detection')").click(function(){
					tradeTitle = $(".trades-header-nowrap .paired-name.trade-flag-inserted:not('.ng-hide')")
					for (i = 0; i < tradeTitle.length; i++) {
						if (!tradeTitle.get(i).parentNode.parentNode.classList.contains('trade-request-window')) {
							tradeTitle.get(i).classList.remove("trade-flag-inserted")
						}
					}
				})
				$(".trade-row-container:not('.click-detection')").addClass("click-detection")
			}
		}, 100)
	}
	var myForegroundOpacity = await getStorage('foregroundOpacity')
	if (typeof myForegroundOpacity != 'undefined') {
		foregroundOpacity = parseFloat(myForegroundOpacity)
	}
}

var checkCount = 0
var firstLoad = true

function checkLoad() {
	if (document.getElementById('trades-container') != null || checkCount > 15) {
		main()
	} else {
		checkCount++
		setTimeout(function(){
			checkLoad()
		}, 500)
	}
}
checkLoad()

window.addEventListener('load', (event) => {
	document.getElementById('tab-Inbound').children[0].addEventListener('click', function() {
		firstLoad = true
	})
	document.getElementById('tab-Outbound').children[0].addEventListener('click', function() {
		firstLoad = true
	})
	document.getElementById('tab-Completed').children[0].addEventListener('click', function() {
		firstLoad = true
	})
	document.getElementById('tab-Inactive').children[0].addEventListener('click', function() {
		firstLoad = true
	})
})
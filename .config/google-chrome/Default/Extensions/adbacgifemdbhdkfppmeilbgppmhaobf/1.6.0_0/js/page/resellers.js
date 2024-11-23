function getIdFromUrl(url) {
	return parseInt(url.split("users/")[1].split("/profile")[0])
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

function fetchCanTrade(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://trades.roblox.com/v1/users/" + userID + "/can-trade-with"}, 
			function(data) {
				resolve(data['canTrade'])
			}
		)
	})
}

async function addTradeButtons(list) {
	for (i = 0; i < list.length; i++) {
		seller = list[i]
		if (seller.getElementsByClassName('open-trade-button').length == 0) {
			userID = getIdFromUrl(seller.getElementsByClassName('text-name username')[0].href)
			a = document.createElement('a')
			a.setAttribute('target', '_blank')
			a.setAttribute('href', `https://www.roblox.com/users/${parseInt(userID)}/trade`)
			a.setAttribute('style', '')
			a.innerHTML += '<div style="margin-top:22px;display:inline;position:absolute;left:80px;" class="open-trade-button comment-controls"><span class="icon-nav-trade"></span>Trade</div>'
			if (await fetchCanTrade(userID)) {
				seller.getElementsByClassName('resale-info')[0].insertBefore(a, seller.getElementsByClassName('resale-info')[0].getElementsByClassName('serial-number')[0])
			}
		}
	}
}

function resellersMain() {
	length = 0
	setInterval(function() {
		if (document.getElementsByClassName('resellers').length > 0 && document.getElementsByClassName('resellers')[0].getElementsByClassName('vlist').length > 0) {
			if (document.getElementsByClassName('resellers')[0].getElementsByClassName('vlist')[0].childNodes.length != length) {
				addTradeButtons(document.getElementsByClassName('resellers')[0].getElementsByClassName('vlist')[0].getElementsByClassName('reseller-item'))
				length = document.getElementsByClassName('resellers')[0].getElementsByClassName('vlist')[0].childNodes.length
			}
		}
	}, 100)
}

async function doResellers() {
	if (await fetchSetting("quickTradeResellers")) {
		resellersMain()
	}
}
function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
}
 
function shallowEqual(object1, object2) {
	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let key of keys1) {
		if (object1[key] !== object2[key]) {
		return false;
		}
	}

	return true;
}

$('.menu .item').tab();

$('.featurePreview').click(function(){
	prefix = this.getAttribute("modal")
	modal = "." + prefix + "_modal"
	document.getElementsByClassName(prefix + "_modal")[0].getElementsByTagName('img')[0].setAttribute("src", "https://ropro.io/feature_previews/" + stripTags(this.getAttribute("modal")) + ".gif")
	$(modal).modal('show')
})

$('#notificationThreshold').change(function() {
	if (this.value == -1) {
		document.getElementById('customThreshold').parentNode.style.display = "inline-block"
		document.getElementById('customThreshold').value = settings['notificationThreshold']
	} else {
		document.getElementById('customThreshold').parentNode.style.display = "none"
	}
})

var settings = {}

function updateGlobalTheme() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "UpdateGlobalTheme"}, 
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

function fetchSettingValidity(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSettingValidity", setting: setting}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchSettingValidityInfo(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSettingValidityInfo", setting: setting}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function loadPlayerThumbnails(userIds) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" + userIds.join() + "&size=420x420&format=Png&isCircular=false"}, 
			function(data) {
				for (var i = 0; i < data.data.length; i++) {
					 $('.ropro-player-thumbnail-' + data.data[i].targetId).attr("src", stripTags(data.data[i].imageUrl))
				}
			}
		)
	})
}

function fetchFreeTrialTime() {
	return new Promise(resolve => {
		async function doGet(resolve) {
			$.post("https://api.ropro.io/freeTrialTime.php", function(data){
				resolve(data);
			})
		}
		doGet(resolve)
	})
}

function syncSettings(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "SyncSettings"}, 
			function(data) {
				resolve(data);
			}
		)
	})
}

function setStorage(key, value) {
	return new Promise(resolve => {
		chrome.storage.sync.set({[key]: value}, function(){
			resolve()
		})
	})
}

function getLocalStorage(key) {
	return new Promise((resolve) => {
	  chrome.storage.local.get(key, function (obj) {
		resolve(obj[key]);
	  });
	});
  }
  
  function setLocalStorage(key, value) {
	return new Promise((resolve) => {
	  chrome.storage.local.set({ [key]: value }, function () {
		resolve();
	  });
	});
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

function getSubscription(userID) {
	return new Promise(resolve => {
		async function doGet(resolve) {
			verificationDict = await getStorage('userVerification')
			userID = await getStorage('rpUserID')
			roproVerificationToken = "none"
			if (typeof verificationDict != 'undefined') {
				if (verificationDict.hasOwnProperty(userID)) {
					roproVerificationToken = verificationDict[userID]
				}
			}
			$.post({url: "https://api.ropro.io/getSubscription.php?key=" + await getStorage("subscriptionKey") + "&options_page", headers: {'ropro-verification': roproVerificationToken, 'ropro-id': userID}}, function(data){
				setLocalStorage('rpSubscription', data)
				resolve(data);
			})
		}
		doGet(resolve)
	})
}

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

$('.ui.fitted.toggle.checked.checkbox').click(function(){
	this.classList.toggle('checked')
})

document.getElementById('saveDiscord').addEventListener('click', async function(){
	userID = await getStorage('rpUserID')
	if (await checkVerification()) {
		verificationDict = await getStorage('userVerification')
		roproVerificationToken = "none"
		if (typeof verificationDict != 'undefined') {
			if (verificationDict.hasOwnProperty(userID)) {
				roproVerificationToken = verificationDict[userID]
			}
		}
		$.post({'url':'https://api.ropro.io/saveDiscord.php', 'headers': {'ropro-verification': roproVerificationToken, 'ropro-id': userID}}, {userid: userID, discord: document.getElementById('discordValue').value}, function(data) {
			if (document.getElementById('discordValue').value == "") {
				alert("Cleared your Discord.")
			} else {
				alert("Updated your Discord. To remove your Discord, click save when the input box is empty.")
			}
		})
	} else {
		alert("You must verify your user with RoPro at roblox.com/home before updating your Discord.")
	}
})

document.getElementById('activateSubscription').addEventListener('click', async function(){
	var subscriptionKey = prompt("Please enter the subscription key we emailed you with your purchase:")
	if (subscriptionKey != null && subscriptionKey.length > 0) {
		verificationDict = await getStorage('userVerification')
		userID = await getStorage('rpUserID')
		roproVerificationToken = "none"
		if (typeof verificationDict != 'undefined') {
			if (verificationDict.hasOwnProperty(userID)) {
				roproVerificationToken = verificationDict[userID]
			}
		}
		$.post({url: "https://api.ropro.io/activateKey.php?key=" + subscriptionKey, headers: {'ropro-verification': roproVerificationToken , 'ropro-id': userID}}, function(data){
			if (data == "success") {
				alert("Successfully activated subscription.")
				setTimeout(function(){
					setStorage("subscriptionKey", subscriptionKey);
					location.reload()
				})
			} else if (data == "already_activated") {
				alert("Error: This key has already been linked to another user. If you would like to change the Roblox account associated with your subscription please click the Manage Subscription button.")
			} else if (data == "invalid_key") {
				alert("Error: This key is invalid. Please double check the key or contact support at https://ropro.io/support")
			} else if (data == "expired_key") {
				alert("Error: This subscription has expired.")
			} else if (data == "unknown_error") {
				alert("Error: Unknown error. Please relaunch the extension to resolve this error.")
			} else if (data == "not_logged_in") {
				alert("Error: You are not currently logged in to Roblox. Please log in to allow RoPro to link the subscription key to your Roblox account.")
			}
		})
	}
})

function check(setting) {
	if (document.getElementById(setting) != null) {
		return document.getElementById(setting).classList.contains('checked')
	} else {
		return false
	}
}

function getSettings() {
	newSettings = {
		"sandbox": check("sandbox"),
		"profileThemes": check("profileThemes"),
		"globalThemes": check("globalThemes"),
		"lastOnline": check("lastOnline"),
		"roproEggCollection": check("roproEggCollection"),
		"genreFilters": check("genreFilters"),
		"randomGame": check("randomGame"),
		"popularToday": check("popularToday"),
		"reputation": check("reputation"),
		"linkedDiscord": check("linkedDiscord"),
		"gameTwitter": check("gameTwitter"),
		"profileValue": check("profileValue"),
		"tradeOffersPage": check("tradeOffersPage"),
		"itemInfoCard": check("itemInfoCard"),
		"tradeOffersSection": check("tradeOffersSection"),
		"comments": check("comments"),
		"mostRecentServer": check("mostRecentServer"),
		"tradeAge": check("tradeAge"),
		"projectedWarningItemPage": check("projectedWarningItemPage"),
		"quickTradeResellers": check("quickTradeResellers"),
		"hideSerials": check("hideSerials"),
		"groupRank": check("groupRank"),
		"groupTwitter": check("groupTwitter"),
		"groupDiscord": check("groupDiscord"),
		"featuredToys": check("featuredToys"),
		"moreGameFilters": check("moreGameFilters"),
		"moreServerFilters": check("moreServerFilters"),
		"additionalServerInfo": check("additionalServerInfo"),
		"gameLikeRatioFilter": check("gameLikeRatioFilter"),
		"liveLikeDislikeFavoriteCounters": check("liveLikeDislikeFavoriteCounters"),
		"sandboxOutfits": check("sandboxOutfits"),
		"moreTradePanel": check("moreTradePanel"),
		"tradeValueCalculator": check("tradeValueCalculator"),
		"tradeDemandRatingCalculator": check("tradeDemandRatingCalculator"),
		"tradeItemValue": check("tradeItemValue"),
		"tradeItemDemand": check("tradeItemDemand"),
		"itemPageValueDemand": check("itemPageValueDemand"),
		"tradePageProjectedWarning": check("tradePageProjectedWarning"),
		"embeddedRolimonsItemLink": check("embeddedRolimonsItemLink"),
		"embeddedRolimonsUserLink": check("embeddedRolimonsUserLink"),
		"tradeOffersValueCalculator": check("tradeOffersValueCalculator"),
		"tradeProtection": check("tradeProtection"),
		"liveVisits": check("liveVisits"),
		"livePlayers": check("livePlayers"),
		"tradePreviews": check("tradePreviews"),
		"ownerHistory": check("ownerHistory"),
		"quickItemSearch": check("quickItemSearch"),
		"tradeNotifier": check("tradeNotifier"),
		"dealNotifier": check("dealNotifier"),
		"buyButton": check("buyButton"),
		"dealCalculations": document.getElementById('dealCalculations').value,
		"notificationThreshold": document.getElementById('notificationThreshold').value != -1 ? parseInt(document.getElementById('notificationThreshold').value) : parseInt(isNaN(document.getElementById('customThreshold').value) ? 0 : document.getElementById('customThreshold').value),
		"valueThreshold": document.getElementById('valueThreshold').value.length > 0 ? parseInt(document.getElementById('valueThreshold').value) : 0,
		"projectedFilter": check("projectedFilter"),
		"autoDecline": check("autoDecline"),
		"declineThreshold": parseInt(document.getElementById('declineThreshold').value),
		"cancelThreshold": parseInt(document.getElementById('cancelThreshold').value),
		"roproIcon": check("roproIcon"),
		"hideDeclinedNotifications": check("hideDeclinedNotifications"),
		"hideOutboundNotifications": check("hideOutboundNotifications"),
		"quickDecline": check("quickDecline"),
		"quickCancel": check("quickCancel"),
		"hideTradeBots": check("hideTradeBots"),
		"autoDeclineTradeBots": check("autoDeclineTradeBots"),
		"tradePanel": check("tradePanel"),
		"underOverRAP": check("underOverRAP"),
		"winLossDisplay": check("winLossDisplay"),
		"mostPlayedGames": check("mostPlayedGames"),
		"allExperiences": check("allExperiences"),
		"roproShuffle": check("roproShuffle"),
		"avatarEditorChanges": check("avatarEditorChanges"),
		"playtimeTracking": check("playtimeTracking"),
		"activeServerCount": check("activeServerCount"),
		"morePlaytimeSorts": check("morePlaytimeSorts"),
		"roproBadge": check("roproBadge"),
		"mutualFriends": check("mutualFriends"),
		"moreMutuals": check("moreMutuals"),
		"serverInviteLinks": check("serverInviteLinks"),
		"serverFilters": check("serverFilters"),
		"randomServer": check("randomServer"),
		"experienceQuickSearch": check("experienceQuickSearch"),
		"experienceQuickPlay": check("experienceQuickPlay"),
		"animatedProfileThemes": check("animatedProfileThemes"),
		"roproVoiceServers": check("roproVoiceServers"),
		"premiumVoiceServers": check("premiumVoiceServers"),
		"cloudPlay": check("cloudPlay"),
		"hidePrivateServers": check("hidePrivateServers"),
		"quickEquipItem": check("quickEquipItem"),
		"roproWishlist": check("roproWishlist"),
		"themeColorAdjustments": check("themeColorAdjustments"),
		"tradeSearch": check("tradeSearch"),
		"advancedTradeSearch": check("advancedTradeSearch")
	}
	changed = typeof settings == 'undefined' || !shallowEqual(settings, newSettings)
	if (changed) {
		console.log(newSettings)
		oldSettings = settings
		settings = newSettings
		setStorage("rpSettings", settings)
		if (newSettings['globalThemes'] == true && oldSettings['globalThemes'] != newSettings['globalThemes']) {
			console.log("Updating global theme.")
			updateGlobalTheme()
		}
	}
}

window.onblur = function(){
	if (doneLoading) {
		getSettings()
	}
}
var doneLoading = false
async function main() {
	restrict = await getStorage("restrictSettings")
	if (restrict == true) {
		document.getElementById('discordButton').style.display = "none";
		document.getElementById('supportButton').style.width = "204px";
		document.getElementById('discordInput').classList.add("disabled");
		restrictedElements = document.getElementsByClassName("restricted")
		for (i = 0; i < restrictedElements.length; i++) {
			restrictedElement = restrictedElements[i]
			restrictedElement.style.display = "none";
		}
	}
	await syncSettings()
	settings = await getStorage("rpSettings")
	for(let setting of Object.keys(settings)) {
		settingElement = document.getElementById(setting)
		if (settingElement != null) {
			if (settingElement.tagName == "DIV") {
				var validity = await fetchSettingValidityInfo(setting)
				if (validity[0]) {
					if (await fetchSetting(setting)) {
						if (!settingElement.classList.contains("checked")) {
							settingElement.classList.add("checked")
						}
						if (!settingElement.getElementsByTagName('input')[0].hasAttribute('checked')) {
							settingElement.getElementsByTagName('input')[0].setAttribute('checked', true)
						}
					} else {
						if (settingElement.classList.contains("checked")) {
							settingElement.classList.remove("checked")
						}
						if (settingElement.getElementsByTagName('input')[0].hasAttribute('checked')) {
							settingElement.getElementsByTagName('input')[0].removeAttribute('checked')
						}
					}
				} else {
					settingElement.classList.add("disabled")
					settingElement.style.pointerEvents = "none"
					settingElement.getElementsByTagName("input")[0].removeAttribute("checked")
					if (validity[1]) {
						div = document.createElement('div')
						div.innerHTML = `<div style="position:absolute;font-size:8.5px;width:500px;text-align:left;top:15px;font-style:italic;">Feature currently disabled for maintenance.</div>`
						settingElement.parentNode.getElementsByTagName('p')[0].appendChild(div.childNodes[0])
					}
				}
			} else if (settingElement.tagName == "SELECT") {
				if (settingElement.id == "notificationThreshold") {
					threshold = await fetchSetting(setting)
					if (threshold == 10 || threshold == 20 || threshold == 30 || threshold == 40 || threshold == 50) {
						settingElement.value = threshold
					} else if (await fetchSettingValidity(setting)) {
						settingElement.value = -1
						document.getElementById('customThreshold').parentNode.style.display = "inline-block"
						document.getElementById('customThreshold').value = isNaN(parseInt(threshold)) ? 0 : parseInt(threshold)
					}
				} else {
					settingElement.value = await fetchSetting(setting)
				}
				if (!await fetchSettingValidity(setting)) {
					settingElement.classList.add("disabled")
					settingElement.style.pointerEvents = "none"
				}
			} else {
				if (await fetchSetting(setting) > 0) {
					settingElement.value = await fetchSetting(setting)
				}
				if (!await fetchSettingValidity(setting)) {
					settingElement.parentNode.classList.add("disabled")
					settingElement.style.pointerEvents = "none"
				}
			}
		}
	}
	doneLoading = true
	setInterval(getSettings, 2000)
	userID = await getStorage("rpUserID")
	username = await getStorage("rpUsername")
	subscription = await getSubscription(userID)
	if (subscription == "free_tier" || subscription == "") {
		document.getElementById("subscriptionIcon").src = "./images/free_icon.png"
		document.getElementById("subscriptionTier").innerHTML = "RoPro Free"
		document.getElementById("standardTierUpgrade").style.display = "block";
		document.getElementById("proTierUpgrade").style.display = "block";
		document.getElementById("ultraTierUpgrade").style.display = "block";
	} else if (subscription == "standard_tier" || subscription == "plus") {
		document.getElementById("subscriptionIcon").src = "./images/plus_icon.png"
		document.getElementById("subscriptionTier").innerHTML = "RoPro Plus"
		document.getElementById("proTierUpgrade").style.display = "block";
		document.getElementById("ultraTierUpgrade").style.display = "block";
	} else if (subscription == "pro_tier" || subscription == "rex") {
		document.getElementById("subscriptionIcon").src = "./images/rex_icon.png"
		document.getElementById("subscriptionTier").innerHTML = "RoPro Rex"
		document.getElementById("ultraTierUpgrade").style.display = "block";
		freeTrialTime = await fetchFreeTrialTime();
		if (freeTrialTime >= 0) {
			hours = freeTrialTime
			document.getElementById("freeTrialBar").innerHTML = "RoPro Rex Free Trial Active - " + parseInt(hours) + " hrs " + parseInt((hours - parseInt(hours)) * 60) + " mins left"
			document.getElementById("freeTrialBar").style.display = "block";
			document.getElementById("freeTrialInfo").style.display = "block";
			document.getElementById("upgradeTrialBar").style.display = "inline-block";
		}
	} else if (subscription == "ultra_tier") {
		document.getElementById("subscriptionIcon").src = "./images/ultra_icon.png"
		document.getElementById("subscriptionTier").innerHTML = "Ultra Tier"
	} else {
		document.getElementById("subscriptionIcon").src = "./images/info.png"
		document.getElementById("subscriptionTier").innerHTML = "Subscription Error..."
	}
	if (typeof userID == 'undefined') {
		userID = -1
		username = "Not logged in"
	}
	document.getElementById('userIcon').classList.add('ropro-player-thumbnail-' + parseInt(userID))
	loadPlayerThumbnails([parseInt(userID)])
	document.getElementById('userIcon').style.backgroundColor = "#D4D4D4"
	document.getElementById('userIcon').style.borderRadius = "8px"
	document.getElementById('usernameText').innerHTML = stripTags(username)
	document.getElementById('reloadExtension').addEventListener('click', async function(){
		await setLocalStorage("rpSubscriptionFreshness", 0);
		chrome.runtime.reload()
	})
	$.get('https://apis.roblox.com/universal-app-configuration/v1/behaviors/account-settings-ui/content', function(data) {
		if (!data.hasOwnProperty('displayVoiceChatSettings') || !data.displayVoiceChatSettings) {
			document.getElementById('roproVoiceServers').style.display = "none"
			document.getElementById('premiumVoiceServers').style.display = "none"
		}
	})
	if (await fetchSetting('cloudPlayHidden')) {
		document.getElementById('cloudPlay').parentNode.style.display = "none"
	}
}
main()

function internationalize() {
	document.getElementById('settingsText').innerText = chrome.i18n.getMessage("settings");
	document.getElementById('manageSubscription').innerText = chrome.i18n.getMessage("manageSubscription");
	document.getElementById('activateSubscription').innerText = chrome.i18n.getMessage("activateSubscription");
	document.getElementById('supportButton').innerText = chrome.i18n.getMessage("support");
	document.getElementById('termsOfService').innerText = chrome.i18n.getMessage("termsOfService");
	document.getElementById('privacyPolicy').innerText = chrome.i18n.getMessage("privacyPolicy");
	document.getElementById('help').innerText = chrome.i18n.getMessage("help");
	document.getElementById('subscription').innerText = chrome.i18n.getMessage("subscription");
	document.getElementById('disclaimer1').innerText = chrome.i18n.getMessage("disclaimer1");
	document.getElementById('disclaimer2').innerText = chrome.i18n.getMessage("disclaimer2");
	$('.generalFeatures').text(chrome.i18n.getMessage("generalFeatures"));
	$('.tradingFeatures').text(chrome.i18n.getMessage("tradingFeatures"));
	$('.groupFeatures').text(chrome.i18n.getMessage("groupFeatures"));
	$('.accountSecurityFeatures').text(chrome.i18n.getMessage("accountSecurityFeatures"));
	$('.dealsNotifier').text(chrome.i18n.getMessage("dealsNotifier"));
}

window.addEventListener('load', internationalize);
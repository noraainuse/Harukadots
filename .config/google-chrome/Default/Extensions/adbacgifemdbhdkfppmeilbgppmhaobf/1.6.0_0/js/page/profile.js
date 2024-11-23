var url_matches = [
	"/users/*",
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

var followsYouHTML = `<span style="margin-left:7px;border-radius:10px;padding:5px;background-color:#232527;color:#E8E8E8;font-size:11px;padding-top:1px;padding-bottom:1px;">Follows You</span>`
var reputationDivPosition = document.getElementsByClassName('header-userstatus-text').length == 0 && document.getElementsByClassName('profile-display-name').length == 0 ? "margin-bottom" : "margin-top"
var profileUserID = null
var myUserId = null
function fetchProfileValue(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetProfileValue", userID: userID}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchStatus(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostURL", url:"https://presence.roblox.com/v1/presence/last-online", jsonData: {"userIds": [userID]}}, 
			function(data) {
				resolve(JSON.parse(data))
			}
		)
	})
}

function fetchBadgeInfo(badgeID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://badges.roblox.com/v1/badges/" + badgeID},
			function(data) {
				resolve(data)
			}
		)
	})
}


function fetchInfo(userID, myId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getUserInfoTest.php?userid=" + userID + "&myid=" + myId}, 
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

function fetchEggCollection(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getEggCollection.php?userid=" + parseInt(userID)},
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

function fetchMutualFriends(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualFriends", userID: userID},
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

async function postReputation(type) {
	userID = await getUserId()
	return new Promise(resolve => {
		json = {reqType: type, myUser: userID, theirUser: getIdFromURL(location.href)}
		chrome.runtime.sendMessage({greeting: "PostURL", form: true, url:"https://api.ropro.io/postReputation.php", jsonData: json}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

async function getInfo(userID, myId) {
	response = await fetchInfo(userID, myId)
	return response
}


async function getTheme(userID) {
	response = await fetchTheme(userID)
	return response
}

async function getProfileValue(userID) {
	var response = await fetchProfileValue(userID)
	return response
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

function getIdFromURL(url) {
	return parseInt(url.split("users/")[1].split("/profile")[0])
}

async function addMutuals() {
	friendsBar = document.getElementsByClassName('header-details')[0].getElementsByClassName('details-info')[0]
	mutualsArray = await fetchMutualFriends(parseInt(getIdFromURL(location.href)))
	numMutuals = mutualsArray.length
	li = document.createElement("li")
	li.innerHTML = `<div class="text-label font-caption-header ng-binding" ng-bind="'Label.Mutuals' | translate">Mutual${numMutuals == 1 ? "" : "s"}</div><a class="text-name" href="https://www.roblox.com/users/${parseInt(getIdFromURL(location.href))}/friends#!/friends#mutuals"> <span class="font-header-2 ng-binding" title="${parseInt(numMutuals)}" ng-bind="profileHeaderLayout.friendsCount | abbreviate">${parseInt(numMutuals)}</span> </a>`
	setTimeout(function(){
		friendsBar.insertBefore(li, friendsBar.childNodes[1])
	}, 1000)
}

async function addThemeMain(theme) {
	if (theme.hasOwnProperty('version') && theme['version'] == 2) {
		var div = document.createElement('div')
		if (theme['name'].includes('.mp4')) {
			themeFrame = `<iframe id="roproThemeFrame" src="https://api.ropro.io/themeFrameVideo.php?${myUserID == profileUserID ? 'hard-cache&' : ''}theme=${myUserID != profileUserID ? theme['name'].replace('_4K.mp4', '_HD.mp4') : theme['name']}${theme.hasOwnProperty('h') ? `&h=${parseInt(theme['h'])}&s=${parseFloat(theme['s'])}&l=${parseFloat(theme['l'])}` : ''}" ${theme.hasOwnProperty('h') ? `h = ${parseInt(theme['h'])} s = ${parseFloat(theme['s'])} l = ${parseFloat(theme['l'])}` : ''} frameborder="0" style="top:0;left:0;position:absolute;border:0;width:100%;height:100%;z-index:-1;"></iframe>`
		} else {
			themeFrame = `<iframe id="roproThemeFrame" src="https://api.ropro.io/themeFrame.php?theme=${theme['name']}${theme.hasOwnProperty('h') ? `&h=${parseInt(theme['h'])}&s=${parseFloat(theme['s'])}&l=${parseFloat(theme['l'])}` : ''}" ${theme.hasOwnProperty('h') ? `h = ${parseInt(theme['h'])} s = ${parseFloat(theme['s'])} l = ${parseFloat(theme['l'])}` : ''} frameborder="0" style="top:0;left:0;position:absolute;border:0;width:100%;height:100%;z-index:-1;"></iframe>`
		}
		div.innerHTML = themeFrame
		document.getElementById('container-main').appendChild(div.childNodes[0])
		mainContainer = document.getElementById('container-main')
		profileContainer = document.getElementsByClassName('profile-container')[0]
		profileContainer.style.padding = "20px"
		profileContainer.style.paddingTop = "10px"
		mainContainer.style.borderRadius = "20px"
		mainContainer.style.padding = "20px"
		if (document.getElementById('accoutrements-slider') != null) {
			document.getElementById('accoutrements-slider').setAttribute('style', 'width:470px;transform:scale(0.95);margin-left:-7px;')
		}
		contentContainer = document.getElementsByClassName('content')
		contentContainer = contentContainer[0]
		contentContainer.style.borderRadius = "10px"
		profileThemeName = theme['name']
		accoutrementsContainer = document.getElementsByClassName('accoutrement-items-container')
		if (accoutrementsContainer.length > 0) {
			accoutrementsContainer[0].setAttribute('style', 'width:105%;transform:scale(0.95);margin-left:-2.5%;')
		}
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
		profileContainer = document.getElementsByClassName('profile-container')[0]
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
		favoritesContainer = document.getElementsByClassName('favorite-games-container')
		if (favoritesContainer.length > 0) {
			favoritesContainer[0].style.overflowX = 'hidden'
		}
		accoutrementsContainer = document.getElementsByClassName('accoutrement-items-container')
		if (accoutrementsContainer.length > 0) {
			accoutrementsContainer[0].setAttribute('style', 'width:105%;transform:scale(0.95);margin-left:-2.5%;')
		}
		contentContainer = document.getElementsByClassName('content')
		contentContainer = contentContainer[0]
		contentContainer.style.borderRadius = "10px"
	}
	var foregroundOpacity = await getStorage('foregroundOpacity')
	if (typeof foregroundOpacity != 'undefined') {
		setForegroundOpacity(foregroundOpacity)
		if (foregroundOpacity < 1) {
			if (document.getElementById('game-details-carousel-container') != null) {
				document.getElementById('game-details-carousel-container').style.borderRadius = "10px"
			}
		}
	}
	var backdropBlur = await getStorage('backdropBlur')
	if (typeof backdropBlur != 'undefined' && parseInt(backdropBlur) > 0) {
		setBackdropBlur(backdropBlur)
	}
}

async function addRoProInfo(tier, user_since, subscribed_for) {
	tierName = "Free Tier"
	icon = chrome.runtime.getURL('/images/free_icon.png')
	link = "https://ropro.io/"
	subscriber = false
	if (tier == "free_tier") {
		tierName = "RoPro Free"
		icon = chrome.runtime.getURL('/images/free_icon.png')
		link = "https://ropro.io/"
	} else if (tier == "standard_tier" || tier == "plus") {
		tierName = "RoPro Plus"
		icon = chrome.runtime.getURL('/images/plus_icon.png')
		link = "https://ropro.io#plus"
		subscriber = true
	} else if (tier == "pro_tier" || tier == "rex") {
		tierName = "RoPro Rex"
		icon = chrome.runtime.getURL('/images/rex_icon.png')
		link = "https://ropro.io#rex"
		subscriber = true
	} else if (tier == "ultra_tier") {
		tierName = "RoPro Ultra"
		icon = chrome.runtime.getURL('/images/ultra_icon.png')
		link = "https://ropro.io#ultra"
		subscriber = true
	}
	header = document.getElementsByClassName('header-title')[0]
	if (header != undefined && await fetchSetting("roproBadge")) {
		div = document.createElement('div')
		div.setAttribute("class", "ropro-user-info")
		if (document.getElementsByClassName('icon-badge-medium').length == 0) {
			div.setAttribute("style", "margin-left:2px;margin-right:8px;margin-top:0px;")
		} else {
			div.setAttribute("style", "margin-right:6px;margin-left:6px;margin-left:8px;margin-top:1px;")
		}
		div.innerHTML = `<a target="_blank" href="${link}"><img class="ropro-profile-icon" src="${icon}" style="width:30px;"></a>`
		if (document.getElementsByClassName("profile-themes-button").length == 0) {
			header.appendChild(div)
		} else {
			header.insertBefore(div, header.childNodes[header.childNodes.length - 1])
		}
		div.innerHTML += `<div class="ropro-info-card" style="pointer-events:none;filter:drop-shadow(2px 2px 2px #363636);display:none;z-index:1000;top:${subscriber ? "-19" : "-4"}px;left:${document.getElementsByClassName('header-caption')[0].getElementsByClassName('ropro-profile-icon')[0].getBoundingClientRect().left - document.getElementsByClassName('header-caption')[0].getBoundingClientRect().left + 35}px;position:absolute;"><div style="position:relative;"><div style="height:${subscriber ? "78" : "55"}px;" class="input-group input-field">
		<div style="text-align:center;"><a style="font-size:13px;font-weight:bold;" target="_blank" href="${link}">${tierName} User</a></div>
		${subscriber ? `<div style="text-align:center;"><a style="font-size:13px;" href="${link}"><img class="ropro-profile-icon" src="${icon}" style="width:12px;margin-top:-1.5px;"> Subscriber for ${stripTags(subscribed_for)}</a></div>` : ``}
		<div style="text-align:center;"><a style="font-size:13px;" href="${link}">RoPro User for ${stripTags(user_since)}</a></div></div></div></div>`
		$(".linkpath").css("fill", $('body').css("color"))
	}
}

async function addProfileIcon(name, description, image, link) {
	header = document.getElementsByClassName('header-title')[0]
	if (header != undefined && await fetchSetting("roproBadge")) {
		div = document.createElement('div')
		div.setAttribute("class", "ropro-user-info")
		if (document.getElementsByClassName('icon-badge-medium').length == 0) {
			div.setAttribute("style", "margin-right:6px;margin-top:0px;")
		} else {
			div.setAttribute("style", "margin-right:6px;margin-left:6px;margin-top:1px;")
		}
		div.innerHTML = `<a target="_blank" href="${stripTags(link)}"><img class="ropro-profile-icon" src="https://ropro.io/profile_icons/${stripTags(image)}" style="height:30px;"></a>`
		if (document.getElementsByClassName("profile-themes-button").length == 0) {
			header.appendChild(div)
		} else {
			header.insertBefore(div, header.childNodes[header.childNodes.length - 1])
		}
		div.innerHTML += `<div class="ropro-info-card" style="display:none;pointer-events:none;filter:drop-shadow(2px 2px 2px #363636);z-index:1000;top:40px;left:50px;position:absolute;background-color:#232527;color:white;padding:7px;padding-top:5px;border-radius:5px;"><div style="position:relative;width:350px;"><div style="text-align:center;margin-top:5px;margin-bottom:5px;"><a style="font-size:16px;font-weight:bold;" target="_blank">${stripTags(name)}</a></div><div style="text-align:center;font-size:12px;text-align:left;margin:auto;background-color:#393B3D;padding:5px;border-radius:5px;">
		${stripTags(description)}
		</div></div></div>`
		//$(".linkpath").css("fill", $('body').css("color"))
	}
}

/**async function addLink(userID) {
	header = document.getElementsByClassName('header-title')[0]
	if (header != undefined && await fetchSetting("embeddedRolimonsUserLink")) {
		div = document.createElement('div')
		div.innerHTML = '<a style="margin-left:0px;margin-top:5px;" target = "_blank" href = "https://www.rolimons.com/player/' + userID + '"><svg id = "roliLink" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="2em" height="2em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path class="linkpath" d="M10.586 13.414a1 1 0 0 1-1.414 1.414 5 5 0 0 1 0-7.07l3.535-3.536a5 5 0 0 1 7.071 7.071l-1.485 1.486a7.017 7.017 0 0 0-.405-2.424l.476-.476a3 3 0 1 0-4.243-4.243l-3.535 3.536a3 3 0 0 0 0 4.242zm2.828-4.242a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.07l-3.535 3.536a5 5 0 0 1-7.071-7.07l1.485-1.486c-.008.82.127 1.641.405 2.423l-.476.476a3 3 0 1 0 4.243 4.243l3.535-3.536a3 3 0 0 0 0-4.242 1 1 0 0 1 0-1.414z" fill="#fff"></path></svg></a>'
		header.appendChild(div)
		$(".linkpath").css("fill", $('body').css("color"))
	}
}**/

function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }

function addValue(value, userID) {
	reputationDiv = document.getElementById('reputationDiv')
	var div = document.createElement('div')
	valueHTML = `<a id="valueLink" href="https://www.rolimons.com/player/${parseInt(userID)}" style="margin-right:5px;" target="_blank"><img src="${chrome.runtime.getURL('/images/rolimons_start.png')}" style="margin-right:-1px;float:left;" height="24px"><div id="valueAmount" style="color:white;text-align:bottom;font-weight:500;text-align:center;display:inline-block;background-color:#0084DD;height:24px;padding:1.5px;float:left;"><span id="valueLoadingBar" style="transform:scale(0.6);width:100px;margin-right:-20px;margin-left:-20px;margin-top:-2px;" class="spinner spinner-default"></span></div><img src="${chrome.runtime.getURL('/images/rolimons_end.png')}" height="24px" style="float:left;margin-right:5px;"></a>`
	div.innerHTML = valueHTML
	reputationDiv = document.getElementById("reputationDiv")
	if (reputationDiv.childNodes.length > 0) {
		reputationDiv.insertBefore(div.childNodes[0], reputationDiv.childNodes[0])
	} else {
		reputationDiv.appendChild(div.childNodes[0])
	}
	value.then(function(result) {
		value = result['value']
		prefix = "R$ "
		if (value == "private") {
			prefix = ""
			value = "Private Inventory"
			maxSize = 120
		}
		document.getElementById('valueAmount').innerText = isNaN(parseInt(value)) ? stripTags(value) : addCommas(parseInt(value))
	})
}

function addDiscord(discord) {
	caption = document.getElementsByClassName('header-caption')[0]
	margin = 145
	size = "15px"
	discordHTML = `<a id="discordLink" href="discord://" style="margin-right:5px;"><img src="${chrome.runtime.getURL('/images/discord_start.png')}" style="margin-right:-1px;float:left;" height="24px"><div id="discordName" style="color:white;text-align:bottom;font-weight:500;text-align:center;display:inline-block;background-color:#5865F2;height:24px;padding:1.5px;float:left;">${stripTags(discord)}</div><img src="${chrome.runtime.getURL('/images/discord_end.png')}" height="24px" style="float:left;margin-right:5px;"></a>`
	reputationDiv = document.getElementById("reputationDiv")
	reputationDiv.innerHTML = discordHTML + reputationDiv.innerHTML
	reputationDiv.setAttribute("style", stripTags(reputationDivPosition) + ":6px;visibility:hidden;text-align:center;")
	caption.insertBefore(reputationDiv, caption.childNodes[2])
}

sendingPost = false

function changeReputation() {
	if (!sendingPost) {
		sendingPost = true
		type = "add"
		likeButton = document.getElementById('reputationLikeButton')
		likeImage = document.getElementById('reputationLikeImage')
		repValue = parseInt(likeButton.getAttribute('reputation-value'))
		if (likeButton.getAttribute("liked") == "true") {
			likeImage.setAttribute("src", chrome.runtime.getURL('/images/like_inactive.png'))
			likeButton.setAttribute("liked", "false")
			type = "remove"
			document.getElementById('repValue').innerText = addCommas(repValue - 1)
			likeButton.setAttribute('reputation-value', repValue - 1)
		} else {
			likeImage.setAttribute("src", chrome.runtime.getURL('/images/like_active.png'))
			likeButton.setAttribute("liked", "true")
			type = "add"
			document.getElementById('repValue').innerText = addCommas(repValue + 1)
			likeButton.setAttribute('reputation-value', repValue + 1)
		}
		postReputation(type)
		setTimeout(function() {
			sendingPost = false
		}, 500)
	}
}

async function addReputation(reputation, liked, isMe) {
	if (liked) {
		likeImage = chrome.runtime.getURL('/images/like_active.png')
	} else {
		likeImage = chrome.runtime.getURL('/images/like_inactive.png')
	}
	reputationHTML = `<a id="reputationLikeButton" liked="${liked ? 'true' : 'false'}" reputation-value="${parseInt(reputation)}"><img src="${chrome.runtime.getURL('/images/like_start.png')}" style="margin-right:-1px;float:left;" height="24px"><div id="repValue" style="color:white;text-align:bottom;font-weight:500;text-align:center;display:inline-block;background-color:#262B30;height:24px;padding:1.5px;float:left;">${addCommas(parseInt(reputation))}</div><img id="reputationLikeImage" src="${likeImage}" height="24px" style="float:left;margin-right:5px;"></a>`
	reputationDiv = document.getElementById("reputationDiv")
	if (await fetchSetting("reputation")) {
		reputationDiv.innerHTML += reputationHTML
	}
	setTimeout(function() {
		reputationDiv.setAttribute("style", stripTags(reputationDivPosition) + ":6px;visibility:initial;")
		loading = document.getElementById('loadingBar')
		if (loading != null) {
			loading.remove()
		}
		document.getElementById('reputationLikeButton').addEventListener('click', function() {
			changeReputation()
		})
	}, 500)
	console.log(document.getElementById('reputationLikeButton'))
}

async function addEggCollection(userID) {
	if (!(await fetchSetting("roproEggCollection"))) {
		return
	}
	myId = await getStorage("rpUserID")
	eggsInfo = await fetchEggCollection(userID)
	eggs = eggsInfo['data']
	if (eggsInfo['metadata']['visible'] == false) {
		return
	}
	numEggs = parseInt(eggsInfo['metadata']['numEggs'])
	linkName = stripTags(eggsInfo['metadata']['linkName'])
	linkUrl = stripTags(eggsInfo['metadata']['linkUrl'])
	displaySubheader = eggsInfo['metadata']['displaySubheader']
	var div = document.createElement('div')
	div.classList.add('section')
	div.id = 'roblox-badges-container' //${eggs.length}/${parseInt(numEggs)}
	div.style.minHeight = '130px'
	eggCollectionHTML = `<div class="container-header"><h3>RoPro Egg Collection<img src="${chrome.runtime.getURL('/images/egg_icon.png')}" style="margin-top:-2px;margin-left:5px;width:22px!important;height:22px!important;${$('.dark-theme').length > 0 ? "" : "filter:invert(0.8);"}"></h3><a class="btn-secondary-xs btn-more see-all-link-icon" href="${linkUrl}">${linkName}</a><br><a class="btn-fixed-width btn-secondary-xs btn-more see-all-link" id="eggsCollectionSeeMoreButton" style="margin-right:7px;margin-top:3px;display:none;">See More</a></div><div class="section-content remove-panel"><ul class="hlist badge-list" style="max-height:initial;overflow:visible!important;"><p style="position:absolute;top:calc(50% + 10px);left:calc(50% - 125px);font-size:13px;display:block;text-align:center;${eggs.length == 0 ? "display:block;" : "display:none;"}">${userID == myId ? "You haven't" : "This user hasn't"} collected any eggs yet.<br>Visit <a href="https://ropro.io/eggs"><b>ropro.io/eggs</b></a> for more info.</p></ul></div>`
	div.innerHTML = eggCollectionHTML
	document.getElementById('roblox-badges-container').parentNode.insertBefore(div, document.getElementById('roblox-badges-container'))
	var eggRowSize = 6
	if (document.getElementsByClassName('btr-profile-container').length > 0) {
		eggRowSize = 10
	}
	for (var i = 0; i < eggs.length; i++) {
		var li = document.createElement('li')
		var eggName = eggs[i].name
		var eggDescription = eggs[i].description
		var eggId = eggs[i].id
		var eggDate = eggs[i].date
		var eggRarity = eggs[i].rarity
		li.classList.add('list-item')
		li.classList.add('asset-item')
		li.classList.add('ropro-egg-collection-li')
		li.style.position = "relative"
		li.innerHTML += `<a title="${stripTags(eggs[i].name)}"><span class="border asset-thumb-container icon-badge-combat-initiation ${eggRowSize == 6 ? Math.round(Math.random()) == 0 ? 'ropro-animated-icon1' : 'ropro-animated-icon2' : ''}" title="${stripTags(eggs[i].name)}" style="background:none;background-size:100%;background-image:url(${chrome.runtime.getURL(`/images/eggs/${stripTags(eggs[i].filename)}.webp`)})!important;"></span><span class="font-header-2 text-overflow item-name">${stripTags(eggs[i].name)}</span></a>`
		div.getElementsByClassName('badge-list')[0].appendChild(li)
		if (i >= eggRowSize) {
			li.style.display = "none"
		}
		function eggListener(eggName, eggDescription, eggId, eggDate, eggRarity) {
			li.addEventListener('click', async function() {
				var d = new Date(eggDate)
				var dateString = d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear()
				if (document.getElementById(eggId.toString()) == null) {
					$('.ropro-egg-info-card').remove()
					var clientWidth = 0
					if (typeof window.innerWidth == 'undefined') {
						clientWidth = document.documentElement.clientWidth
					} else {
						clientWidth = window.innerWidth
					}
					eggInfoCardHTML = `<div class="ropro-egg-info-card dark-theme" id="${parseInt(eggId)}" style="filter: drop-shadow(rgb(0, 0, 0) 0px 0px 2px);z-index:1000;position:absolute;top:-300px;left:${eggRowSize == 6 ? '-225px' : '0px'};width:600px;height:300px;background-color:#393B3D;border-radius:10px;"><span id="roproEggInfoCardClose" class="icon-close-white" style="position:absolute;top:5px;right:5px;background-color:#1C1C1C;border-radius:7px;cursor:pointer;"></span><iframe class="item-card-iframe" style="float: right; border: none; width: 270px; height: 270px; border-radius: 7px; background-color: #232527;margin-top:15px;margin-right:15px;" src="https://ropro.io/eggs/renderEgg.php?id=${parseInt(eggId)}" scrolling="no"></iframe><div style="width:290px;height:160px;float:left;margin-top:15px;margin-left:15px;background-color: #232527;border-radius:7px;padding:10px;"><h3 style="font-size:auto;text-align:center;">${stripTags(eggName)}</h3><p style="height:auto;max-height:100px;overflow:auto;font-size:16px;text-align:left;">${stripTags(eggDescription)}</p></div><div style="width:290px;height:101px;float:left;margin-top:9px;margin-left:15px;background-color: #232527;border-radius:7px;padding:10px;"><p style="font-size:auto;text-align:center;font-size:18px;margin:10px;"><b style="color:white;">Rarity:</b> ${stripTags(eggRarity)}
					</p><p style="font-size:auto;text-align:center;font-size:18px;margin:10px;"><b style="color:white;">Collected:</b> ${dateString}
					</p></div></div>`
					var div = document.createElement('div')
					div.innerHTML = eggInfoCardHTML
					if (eggRowSize == 6) {
						this.appendChild(div.childNodes[0])
					} else {
						this.parentNode.appendChild(div.childNodes[0])
					}
					document.getElementById('roproEggInfoCardClose').addEventListener('click', function(e) {
						this.parentNode.remove()
						e.stopPropagation()
					})
					/**var badgeInfo = await fetchBadgeInfo(eggId)
					var rarityPercentage = (badgeInfo.statistics.winRatePercentage * 100).toFixed(1)
					var rarityText = "Unknown"
					if (rarityPercentage < 1) {
						rarityText = "Impossible"
					} else if (rarityPercentage < 5) {
						rarityText = "Insane"
					} else if (rarityPercentage < 10) {
						rarityText = "Extreme"
					} else if (rarityPercentage < 20) {
						rarityText = "Hard"
					} else if (rarityPercentage < 5) {
						rarityText = "Challenging"
					}
					this.getElementsByClassName('ropro-egg-rarity')[0].innerText = rarityText + " (" + rarityPercentage + "%)" **/
				}
			})
		}
		eggListener(eggName, eggDescription, eggId, eggDate, eggRarity)
	}
	if (eggs.length > eggRowSize) {
		document.getElementById('eggsCollectionSeeMoreButton').style.display = "inline-block"
		document.getElementById('eggsCollectionSeeMoreButton').addEventListener('click', function() {
			if (this.innerText == "See More") {
				$('.ropro-egg-collection-li').css("display", "inline-block")
				this.innerText = "See Less"
			} else if (this.innerText == "See Less") {
				$('.ropro-egg-collection-li').css("display", "none")
				for (i = 0; i < eggRowSize; i++) {
					$('.ropro-egg-collection-li').get(i).style.display = "inline-block"
				}
				this.innerText = "See More"
			}
		})
	}
}

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

async function mainProfile() {
	if (location.href.includes("/profile")) {
		try {
			userID = getIdFromURL(location.href)
			addEggCollection(userID)
		} catch(e) {
			console.log(e)
		}
		try {
			setTimeout(async function() {
				profileUserID = getIdFromURL(location.href)
				myUserID = await getStorage("rpUserID")
				var info = await getTheme(profileUserID)
				if (info.theme != null && await fetchSetting("profileThemes")) {
					addThemeMain(JSON.parse(info.theme))
				}
			}, 1)
			setTimeout(async function() {
				userID = getIdFromURL(location.href)
				if (await fetchSetting("lastOnline") && (typeof document.getElementsByName('user-data')[0] == 'undefined' || userID != parseInt(document.getElementsByName('user-data')[0].getAttribute('data-userid')))) {
					onlineStatus = await fetchStatus(userID)
					console.log(onlineStatus)
					date = new Date(onlineStatus.lastOnlineTimestamps[0].lastOnline)
					timeSince = Math.round(new Date().getTime() - date.getTime()) / 1000
					if (timeSince < 60) { //seconds
						period = Math.floor(timeSince)
						suffix = period == 1 ? "" : "s"
						timeString = `${period} sec${suffix}`
					} else if (timeSince / 60 < 60) { //minutes
						period = Math.floor(timeSince / 60)
						suffix = period == 1 ? "" : "s"
						timeString = `${period} min${suffix}`
					} else if (timeSince / 60 / 60 < 24) { //hours
						period = Math.floor(timeSince / 60 / 60)
						suffix = period == 1 ? "" : "s"
						timeString = `${period} hour${suffix}`
					} else if (timeSince / 60 / 60 / 24 < 30) { //days
						period = Math.floor(timeSince / 60 / 60 / 24)
						suffix = period == 1 ? "" : "s"
						timeString = `${period} day${suffix}`
					} else if (timeSince / 60 / 60 / 24 / 30 < 20) { //months
						period = Math.floor(timeSince / 60 / 60 / 24 / 30)
						suffix = period == 1 ? "" : "s"
						timeString = `${period} month${suffix}`
					} else { //years
						period = Math.floor(timeSince / 60 / 60 / 24 / 30 / 12)
						suffix = period == 1 ? "" : "s"
						timeString = `${period} year${suffix}`
					}
					div = document.createElement('div')
					div.innerHTML = `<div ng-non-bindable="">
					<a style="z-index:1;" class="avatar-status ropro-offline">
						<span style="background:none;background-color:#${document.getElementsByClassName('light-theme').length > 0 ? "8B949F" : "68717D"};border-radius:50px;transform:scale(0.85);" class="icon-online icon-offline-outer profile-avatar-status" title="Last Online: ${date.toLocaleString()}"><span style="background:none;background-color:#${document.getElementsByClassName('light-theme').length > 0 ? "F2F4F5" : "2F3136"};border-radius:50px;position:absolute;top:7.5px;left:7.5px;width:12px;height:12px;" class="icon-online icon-offline-inner profile-avatar-status"></span>
						<div style="position:absolute;font-size:12px;z-index:1000;margin-top:5px;margin-left:8px;white-space:hide;color:${document.getElementsByClassName('light-theme').length > 0 ? "#8B949F" : "white"};font-weight:bold;width:0px;overflow:hidden;white-space:nowrap;" class="ropro-offline-text">Offline for ${stripTags(timeString)}</div></span>
					</a>
					</div>`
					if (document.getElementsByClassName('profile-avatar-status').length == 0) {
						document.getElementsByClassName('profile-avatar-image')[0].appendChild(div.childNodes[0])
					}
				}
			}, 1)
		} catch (e) {
			console.log(e)
		}
		userID = getIdFromURL(location.href)
		if (userID != undefined && userID != 0) {
			caption = document.getElementsByClassName('header-caption')[0]
			reputationDiv = document.createElement('div')
			reputationDiv.setAttribute("id", "reputationDiv")
			reputationDiv.setAttribute("style", "margin-bottom:6px;visibility:hidden!important;")
			reputationDiv.innerHTML += `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:26px;width:100px;height:25px;position:absolute;left:0px;${reputationDivPosition == "margin-top" ? "bottom:10px;" : ""}" class="spinner spinner-default"></span>`
			setTimeout(function() {
				loading = document.getElementById('loadingBar')
				if (loading != null) {
					loading.remove()
				}
				reputationDiv.setAttribute("style", stripTags(reputationDivPosition) + ":6px;visibility:initial;")
			}, 6000)
			caption.insertBefore(reputationDiv, caption.getElementsByClassName('header-details')[0])
			myId = await getStorage("rpUserID")
			if (userID != myId && await fetchSetting("mutualFriends")) {
				try {
					addMutuals()
				} catch(e) {
					console.log(e)
				}
			}
			var info = await getInfo(userID, myId)
			if (await fetchSetting("reputation")) {
				addReputation(info.reputation, info.liked, myId == userID)
			}
			if (info.discord.length > 0 && await fetchSetting("linkedDiscord")) {
				addDiscord(info.discord)
			}
			if (await fetchSetting("reputation")) {
				likeButton = document.getElementById('likeButton')
				if (likeButton != null) {
					likeButton.addEventListener("click", function(){
						changeReputation()
					})
				}
			}
			setTimeout(function(){
				loading = document.getElementById('loadingBar')
					if (loading != null) {
						loading.remove()
					}
				reputationDiv.setAttribute("style", stripTags(reputationDivPosition) + ":6px;visibility:initial;")
			}, 500)
			discordLink = document.getElementById('discordLink')
			if (discordLink != null) {
				discordLink.addEventListener("click", function(){
					var discordValue = stripTags(document.getElementById('discordName').innerText)
					input = document.createElement("input")
					input.value = discordValue
					document.body.appendChild(input)
					input.select();
					input.setSelectionRange(0, 99999); /*For mobile devices*/
					document.execCommand("copy");
					document.body.removeChild(input)
					document.getElementById('discordName').innerText = "Copied to clipboard."
					setTimeout(function() {
						document.getElementById('discordName').innerText = stripTags(discordValue)
					}, 2000)
				})
			}
			if ("tier" in info && info.tier != "none" && await fetchSetting("roproBadge")) {
				addRoProInfo(info.tier, info.user_since, info.subscribed_for)
			}
			if (await fetchSetting("roproBadge")) {
				console.log(info.icons)
				for (i = 0; i < info.icons.length; i++) {
					addProfileIcon(info.icons[i].name, info.icons[i].description, info.icons[i].image, info.icons[i].link)
				}
			}
			if (await fetchSetting("profileValue")) {
				addValue(getProfileValue(userID), userID)
			}
		}
	}
}

mainProfile()

window.addEventListener('load', (event) => {
	if (window.location.hash.includes("#ropro-status")) {
		document.getElementById('profile-header-update-status').click()
	}
});
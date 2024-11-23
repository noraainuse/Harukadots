var url_matches = [
	"/users/friends*",
    "/users/*/friends*",
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

function fetchSetting(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSetting", setting: setting}, 
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

function getIdFromURL(url) {
	return parseInt(url.split("users/")[1].split("/profile")[0])
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

function fetchMutualFollowers(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualFollowers", userID: userID},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchMutualFollowing(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualFollowing", userID: userID},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchMutualFavorites(userID, assetType) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualFavorites", userID: userID, assetType: assetType},
			function(data) {
                console.log(data)
				resolve(data)
			}
		)
	})
}

function fetchMutualBadges(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualBadges", userID: userID},
			function(data) {
                console.log(data)
				resolve(data)
			}
		)
	})
}

function fetchMutualGroups(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualGroups", userID: userID},
			function(data) {
                console.log(data)
				resolve(data)
			}
		)
	})
}

function fetchMutualItems(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualItems", userID: userID},
			function(data) {
                console.log(data)
				resolve(data)
			}
		)
	})
}

function fetchMutualLimiteds(userID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetMutualLimiteds", userID: userID},
			function(data) {
                console.log(data)
				resolve(data)
			}
		)
	})
}

function unfriendUser(userId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostValidatedURL", url:"https://friends.roblox.com/v1/users/" + userId + "/unfriend"}, 
			function(data) {
					resolve(data)
			})
	})
}

async function loadMutuals(type) {
    console.log(type)
    if (type == "Mutual Friends") {
        document.getElementById('mutualHeader').innerText = "Mutual Friends"
        document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
        document.getElementById('mutualNumber').innerText = ""
        mutuals = await fetchMutualFriends(userId)
        document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
        document.getElementById('mutualNumber').innerText = mutuals.length
        for (i = 0; i < mutuals.length; i++) {
            addMutualCard(mutuals[i])
        }
        if (mutuals.length == 0) {
            emptyHTML = `<div style="margin-top:20px;text-align:center;">
            You don't share any friends with this user.
            </div>`
            document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
        }
    } else {
        if (moreMutuals) {
            if (type == "Mutual Followers") {
                document.getElementById('mutualHeader').innerText = "Mutual Followers"
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
                document.getElementById('mutualNumber').innerText = ""
                mutuals = await fetchMutualFollowers(userId)
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
                document.getElementById('mutualNumber').innerText = mutuals.length
                for (i = 0; i < mutuals.length; i++) {
                    addMutualCard(mutuals[i])
                }
                if (mutuals.length == 0) {
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    You don't share any followers with this user.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
            } else if (type == "Mutual Following") {
                document.getElementById('mutualHeader').innerText = "Mutual Following"
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
                document.getElementById('mutualNumber').innerText = ""
                mutuals = await fetchMutualFollowing(userId)
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
                document.getElementById('mutualNumber').innerText = mutuals.length
                for (i = 0; i < mutuals.length; i++) {
                    addMutualCard(mutuals[i])
                }
                if (mutuals.length == 0) {
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    You don't share any following with this user.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
            } else if (type == "Mutual Favorite Games") {
                document.getElementById('mutualHeader').innerText = "Mutual Favorite Games"
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
                document.getElementById('mutualNumber').innerText = ""
                mutuals = await fetchMutualFavorites(userId, 9)
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
                console.log(mutuals)
                document.getElementById('mutualNumber').innerText = mutuals.length
                for (i = 0; i < mutuals.length; i++) {
                    addMutualCard(mutuals[i])
                }
                if (mutuals.length == 0) {
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    You don't share any favorite games with this user.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
            } else if (type == "Mutual Badges") {
                document.getElementById('mutualHeader').innerText = "Mutual Badges"
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
                document.getElementById('mutualNumber').innerText = ""
                mutuals = await fetchMutualBadges(userId)
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
                console.log(mutuals)
                document.getElementById('mutualNumber').innerText = mutuals.length
                for (i = 0; i < mutuals.length; i++) {
                    addMutualCard(mutuals[i])
                }
                if (mutuals.length == 0) {
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    You don't share any badges with this user.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
            } else if (type == "Mutual Groups") {
                document.getElementById('mutualHeader').innerText = "Mutual Groups"
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
                document.getElementById('mutualNumber').innerText = ""
                mutuals = await fetchMutualGroups(userId)
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
                console.log(mutuals)
                document.getElementById('mutualNumber').innerText = mutuals.length
                for (i = 0; i < mutuals.length; i++) {
                    addMutualCard(mutuals[i])
                }
                if (mutuals.length == 0) {
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    You don't share any groups with this user.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
            } else if (type == "Mutual Items") {
                document.getElementById('mutualHeader').innerText = "Mutual Items"
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
                document.getElementById('mutualNumber').innerText = ""
                mutuals = await fetchMutualItems(userId)
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
                console.log(mutuals)
                document.getElementById('mutualNumber').innerText = mutuals.length
                if (mutuals.length > 0 && !("error" in mutuals[0])) {
                    for (i = 0; i < mutuals.length; i++) {
                        addMutualCard(mutuals[i])
                    }
                } else if(mutuals.length > 0 && ("error" in mutuals[0])) {
                    document.getElementById('mutualNumber').innerText = "Error"
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    This user's Inventory is private.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
                if (mutuals.length == 0) {
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    You don't share any items with this user.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
            } else if (type == "Mutual Limiteds") {
                document.getElementById('mutualHeader').innerText = "Mutual Limiteds"
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = `<span style="float: center; display: block; width: 100px; height: 25px; visibility: initial !important;margin:auto;margin-top:35px;" class="spinner spinner-default"></span>`
                document.getElementById('mutualNumber').innerText = ""
                mutuals = await fetchMutualLimiteds(userId)
                document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
                console.log(mutuals)
                document.getElementById('mutualNumber').innerText = mutuals.length
                if (mutuals.length > 0 && !("error" in mutuals[0])) {
                    for (i = 0; i < mutuals.length; i++) {
                        addMutualCard(mutuals[i])
                    }
                } else if(mutuals.length > 0 && ("error" in mutuals[0])) {
                    document.getElementById('mutualNumber').innerText = "Error"
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    This user's Inventory is private.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
                if (mutuals.length == 0) {
                    emptyHTML = `<div style="margin-top:20px;text-align:center;">
                    You don't share any limiteds with this user.
                    </div>`
                    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].innerHTML = emptyHTML
                }
            }
        } else {
            upgradeModal()
        }
    }
}

function createUpgradeModal() {
    modalDiv = document.createElement('div')
    modalDiv.setAttribute('id', 'standardUpgradeModal')
    modalDiv.setAttribute('class', 'upgrade-modal')
    modalDiv.style.zIndex = 100000
    modalHTML = `<div id="standardUpgradeModal" style="z-index:10000;display:block;" class="upgrade-modal"><div style="background-color:#232527;position:absolute;width:500px;height:500px;left:-webkit-calc(50% - 250px);top:-webkit-calc(50% - 250px);" class="modal-content upgrade-modal-content">
    <span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
    <h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:20px;left:40px;"><img style="width:70px;left:0px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}"> RoPro Plus Feature</h2><div style="font-family:HCo Gotham SSm;color:white;font-size:20px;position:absolute;top:115px;left:200px;width:270px;">Viewing mutuals other than mutual friends is only available for<br><b><img style="width:20px;margin-top:-3px;margin-right:3px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}">RoPro Plus</b><br>subscribers.</div><div style="font-family:HCo Gotham SSm;color:white;font-size:18px;position:absolute;top:270px;left:200px;width:270px;"><u>More Subscription Benefits:</u>
    <ul style="margin-left:20px;font-size:12px;font-family:HCo Gotham SSm;">
    <li style="list-style-type:circle;">Fastest Server &amp; Server Size Sort</li>
    <li style="list-style-type:circle;">Animated Profile Themes</li><li style="list-style-type:circle;">Trade Value &amp; Demand Calculator</li><li style="list-style-type:circle;">More Game Playtime Sorts</li><li style="list-style-type:circle;">And many more! Find a full list <a style="text-decoration:underline;cursor:pointer;" href="https://ropro.io#plus" target="_blank">here</a>.</li></ul>
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

function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }

function addMutualCard(mutual) {
    mutualCardHTML = `<div class="avatar-card-container"><div class="avatar-card-content"><div class="avatar avatar-card-fullbody"><a href="${stripTags(mutual.link)}" class="avatar-card-link"><span class="thumbnail-2d-container avatar-card-image"><img class="" src="${stripTags(mutual.icon)}" alt="" title=""></span></a><div class="avatar-status"><span class="icon-offline"></span></div></div><div class="avatar-card-caption"><a href="${stripTags(mutual.link)}" class="text-overflow avatar-name">${stripTags(mutual.name)}</a><div class="avatar-card-label">${stripTags(mutual.additional)}</div></div></div></div>`
    li = document.createElement("li")
    li.setAttribute("class", "list-item avatar-card")
    li.innerHTML += mutualCardHTML
    document.getElementsByClassName('mutuals-tab-content')[0].getElementsByClassName('hlist avatar-cards')[0].appendChild(li)
}

function addMutualsDropdown(mutualsTab) {
    mutualDropdownHTML = `<div id="mutualDropdown" style="overflow:visible;margin-left:10px;float:right;width:220px;border-radius:0px;" class="input-group-btn group-dropdown">
    <button style="border-radius:0px;" type="button" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
    <span style="font-size:14px;" id="customLabel" class="mutual-selection-label rbx-selection-label ng-binding" ng-bind="layout.selectedTab.label">Mutual Friends</span> 
    <span class="icon-down-16x16"></span></button>
    <ul style="max-height:1000px;" id="mutualOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu"> 
    <li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Friends</span>
    </a></li><li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Following</span>
    </a></li><li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Followers</span>
    </a></li><li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Favorite Games</span>
    </a></li><!--<li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Badges</span>
    </a></li>--><li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Groups</span>
    </a></li><li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Items</span>
    </a></li><li class="mutual-button">
    <a class="customChoice">
        <span style="font-size:14px;" ng-bind="tab.label" class="mutual-text ng-binding">Mutual Limiteds</span>
    </a></li></ul></div>`
    div = document.createElement('div')
    div.innerHTML += mutualDropdownHTML
    mutualsTab.getElementsByClassName('container-header')[0].appendChild(div)
    $('.mutual-button').click(function(){
        document.getElementsByClassName("mutual-selection-label")[0].innerText = this.getElementsByClassName('mutual-text')[0].innerText
        loadMutuals(this.getElementsByClassName('mutual-text')[0].innerText)
    })
}

function addMutualsTab() {
    tabs = document.getElementsByClassName('nav nav-tabs')[0]
    li = document.createElement("li")
    li.setAttribute("id", "mutuals")
    li.setAttribute("role", "tab")
    li.setAttribute("class", "subtract-item rbx-tab")
    mutualsTabHTML = '<a class="rbx-tab-heading"><span class="text-lead">Mutuals</span><span class="rbx-tab-subtitle"></span></a>'
    li.innerHTML += mutualsTabHTML
    tabs.insertBefore(li, tabs.childNodes[3])
    mutualsTab = document.getElementsByClassName('tab-content rbx-tab-content')[0].cloneNode(true)
    mutualsTab.setAttribute("class", "tab-content mutuals-tab-content")
    if (mutualsTab.getElementsByClassName('hlist avatar-cards').length > 0) {
        mutualsTab.getElementsByClassName('hlist avatar-cards')[0].innerHTML = ""
    }
    mutualsTab.getElementsByClassName('friends-subtitle')[0].innerHTML = "<span id='mutualHeader'>Mutuals</span> (<span id='mutualNumber'></span>)"
    mutualsTab.getElementsByClassName('tooltip-container')[0].remove()
    if (mutualsTab.getElementsByClassName('pager-holder').length > 0) {
        mutualsTab.getElementsByClassName('pager-holder')[0].remove()
    }
    mutualsTab.style.display = "none"
    document.getElementsByClassName('tab-content rbx-tab-content')[0].parentNode.appendChild(mutualsTab)
    $('.subtract-item.rbx-tab').css("min-width", "25%")
    $('.subtract-item.rbx-tab').click(function(){
        if (!this.innerHTML.includes("Mutual Friends")) {
            document.getElementsByClassName('tab-content rbx-tab-content')[0].style.display = "block"
            mutualsTab.style.display = "none"
            if (li.getElementsByTagName('a')[0].classList.contains("active")) {
                console.log("mutuals active")
            }
            $('.subtract-item.rbx-tab a').removeClass("active")
            this.getElementsByTagName('a')[0].classList.add("active")
        }
    })
    li.addEventListener("click", function(){
        $('.subtract-item.rbx-tab a').removeClass("active")
        this.getElementsByTagName('a')[0].classList.add("active")
        document.getElementsByClassName('tab-content rbx-tab-content')[0].style.display = "none"
        mutualsTab.style.display = "block"
    })
    if (window.location.hash.includes("#mutuals")) {
        li.click()
    }
    addMutualsDropdown(mutualsTab)
    loadMutuals("Mutual Friends")
}

function setUnfriended(elem) {
    elem.parentNode.getElementsByClassName('avatar-card-container')[0].classList.add('disabled')
    elem.parentNode.getElementsByClassName('avatar-card-container')[0].getElementsByClassName('avatar')[0].style.filter = "grayscale(1)"
    div = document.createElement('div')
    div.innerHTML = `<div class="avatar-card-label">Unfriended</div>`
    elem.parentNode.getElementsByClassName('avatar-card-container')[0].getElementsByClassName('avatar-card-caption')[0].getElementsByTagName('span')[0].appendChild(div.childNodes[0])
    elem.remove()
}

var unfriendedUsers = {}

function addQuickUnfriend() {
    quickUnfriendHTML = `<div class="quick-unfriend" style="position:absolute;top:3px;right:10px;z-index:1000;"><div class="ropro-tooltip" style="display:none;position:absolute;width:auto;background-color:#191B1D;color:white;top:-23px;left:calc(50% - 60px);font-size:10px;padding:5px;border-radius:5px;width:120px;text-align:center;z-index:100000;">Quick Unfriend User</div><span style="cursor:pointer;transform:scale(1.25);" class="icon-close-gray-16x16"></span></div>`
    friends = $('.friends-content .avatar-cards .avatar-card:not(.added)')
    for (i = 0; i < friends.length; i++) {
        friend = friends.get(i)
        friend.classList.add('added')
        div = document.createElement('div')
        div.innerHTML = quickUnfriendHTML
        var friendButton = div.childNodes[0]
        friend.style.position = "relative"
        friend.appendChild(friendButton)
        if (parseInt(friend.id) in unfriendedUsers) {
            setUnfriended(friendButton)
        }
        friendButton.addEventListener('click', function(e) {
            id = this.parentNode.id
            setUnfriended(this)
            unfriendUser(parseInt(id))
            unfriendedUsers[parseInt(id)] = true
        })
    }
}

var mutualFriends = false;
var moreMutuals = false;
var userId = getIdFromURL(location.href)

async function friendsMain() {
    mutualFriends = await fetchSetting("mutualFriends")
    moreMutuals = await fetchSetting("moreMutuals")
    if (isNaN(userId) || await getStorage("rpUserID") == userId) { //My "friends" page
        /**console.log("My friends")
        const observer = new MutationObserver(function(a) {
            addQuickUnfriend()
        });
        if (document.getElementById('friends').getElementsByClassName('active').length > 0) {
            addQuickUnfriend()
        }
        var myInterval = setInterval(function() {
            if (document.getElementById('friends').getElementsByClassName('active').length > 0) {
                friendsContent = $('.friends-content .avatar-cards:not(.loaded)')
                if (friendsContent.length > 0) {
                    friendsContent.get(0).classList.add('loaded')
                    addQuickUnfriend()
                    observer.observe(friendsContent.get(0), {subtree: true, childList: true})
                }
            }
        }, 250)**/
    } else { //Other user's "friends" page
        setTimeout(function(){
            if (mutualFriends) {
                addMutualsTab()
                wrap = document.getElementById('wrap')
                if (wrap != null) {
                    wrap.style.minHeight = "1300px"
                }
            }
        }, 500)
    }
}

window.onload = (event) => {
    friendsMain()
};
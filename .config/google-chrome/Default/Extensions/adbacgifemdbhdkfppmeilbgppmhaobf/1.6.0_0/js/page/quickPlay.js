var currentQueryExperience = ""
var currentQueryItem = ""
var thumbnailsDict = {}
var queryDictExperience = {}
var queryDictItem = {}
var currentSearchInput = null
var quickItemSearch = false
var experienceQuickSearch = false
var searchSession = "ropro-" + randomString(4) + "-" + randomString(4) + "-" + randomString(4) + "-" + randomString(12)

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
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

function fetchGameSearch(keyword) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:`https://apis.roblox.com/search-api/omni-search?searchQuery=${keyword}&pageToken=&sessionId=${searchSession}&pageType=Game`},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchItemSearch(keyword) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getItemSearch.php?q=" + encodeURIComponent(keyword)},
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchThumbnail(universeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://thumbnails.roblox.com/v1/games/icons?universeIds=" + parseInt(universeId) + "&size=150x150&format=Png&isCircular=false"},
			function(data) {
				resolve(data)
			}
		)
	})
}

function randomString(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

async function getGame(keyword) {
	games = await fetchGameSearch(keyword)
	if (games.searchResults.length > 0) {
		for (var i = 0; i < games.searchResults.length; i++) {
			if (games.searchResults[i].contentGroupType == "Game") {
				return games.searchResults[i]
				break
			}
		}
	} else {
		return null
	}
}

async function getItemSearch(keyword) {
	item = await fetchItemSearch(keyword)
	item = JSON.parse(item)
	if (item.id > 0) {
		return item
	} else {
		return null
	}
}

function setLocalStorage(key, value) {
	return new Promise(resolve => {
		chrome.storage.local.set({[key]: value}, function(){
			resolve()
		})
	})
}

function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'K' : Math.sign(num)*Math.abs(num)
}

async function handleExperienceInput(e) {
	if ($("#navbar-search-input").val() != "") {
		if (e.type == "keydown" && e.originalEvent.code == "ArrowUp" && $('.ropro-quick-game-search').length > 0) {
			if ($('.ropro-quick-game-search').get(0).classList.contains('new-selected')) {
				$('.ropro-quick-game-search').get(0).classList.remove('new-selected')
			} else {
				nextsibling = $('.ropro-quick-game-search').get(0).nextElementSibling
				if (nextsibling.classList.contains('new-selected')) {
					e.stopPropagation()
					nextsibling.classList.remove('new-selected')
					$('.ropro-quick-game-search').get(0).classList.add('new-selected')
				}
			}
		}
		if (e.type == "keydown" &&  e.originalEvent.code == "ArrowDown" && $('.ropro-quick-game-search').length > 0) {
			if ($('.ropro-quick-game-search').get(0).classList.contains('new-selected')) {
				$('.ropro-quick-game-search').get(0).classList.remove('new-selected')
			} else {
				experiences = $('.ropro-quick-game-search').get(0).previousElementSibling
				if (experiences.classList.contains('new-selected')) {
					e.stopPropagation()
					experiences.classList.remove('new-selected')
					$('.ropro-quick-game-search').get(0).classList.add('new-selected')
				}
			}
		}
	}
	if (e.type != "keydown") {
		if (e.type == "keyup" && e.originalEvent.code == "Enter" && $('.ropro-quick-game-search').length > 0) {
			if ($('.ropro-quick-game-search').get(0).classList.contains('new-selected')) {
				$('.ropro-quick-game-search a').get(0).click()
				e.stopPropagation()
				return
			}
		}
		var query = $("#navbar-search-input").val()
		if (query.length > 0 && query != currentQueryExperience) {
			currentQueryExperience = query
			if (query in queryDictExperience) {
				var game = queryDictExperience[query]
			} else {
				var game = await getGame(query)
				if (game != null && typeof game != "undefined") {
					game = game.contents[0]
					queryDictExperience[query] = game
				}
			}
			if (query == $("#navbar-search-input").val() && game != null && typeof game != "undefined") {
				quicksearchHTML = `<li style="height:0px;" universeId="0" class="ropro-quick-game-search quick-game-search navbar-search-option rbx-clickable-li"><a id="ropro-quick-search-link" href="https://roblox.com/games/${parseInt(game.rootPlaceId)}#ropro-quick-search" style="height:57px;position:relative;display:flex;align-items:center;padding-top:0px;padding-bottom:0px;"><div style="position:relative;display:inline-block;width:36px;height:36px;margin:-6px 6px -6px 0;border-radius:2px;border:1px solid #a0a0a0"><span><img class="ropro-quick-search-game-icon" style="width:100%;height:100%;opacity:0;transition:opacity .5s ease;" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="></span></div><div><div style="width:230px;font-size: 16px; font-weight:300;white-space:nowrap;overflow:hidden;text-overflow: ellipsis;"><b>${stripTags(game.name)}</b></div><div style="display:inline-block;font-size:12px;font-weight:400;" class="text-label">${stripTags(game.creatorName)}</div><div style="display:inline-block!important;"><span class="info-label icon-playing-counts-gray" style="transform:scale(0.45);margin:-10px;margin-left:0px;margin-right:-6px;"></span><span style="font-size:11px;" class="info-label playing-counts-label" title="${game.playerCount == 0 ? 'Unknown' : parseInt(game.playerCount)} Current Players">${game.playerCount == 0 ? '---' : kFormatter(parseInt(game.playerCount))}</span><span class="info-label icon-rating-sm" style="transform:scale(0.65);margin:-10px;margin-left:5px;margin-right:2px;"></span><span style="font-size:11px;" class="info-label playing-counts-label" title="${game.totalUpVotes == 0 ? 0 : Math.round(game.totalUpVotes / (game.totalUpVotes + game.totalDownVotes) * 100)}% Like Rating">${game.totalUpVotes == 0 ? 0 : Math.round(game.totalUpVotes / (game.totalUpVotes + game.totalDownVotes) * 100)}%</span></div><button id="ropro-quick-play-button" type="button" style="position:absolute;right:31.5px;top:4px;width:50px;min-width:50px;height:50px;min-height:50px;padding:5px;transform:scale(0.6);" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width roproquickjoin" data-testid="play-button"><div class="quick-game-search-tooltip" style="display:none;position:absolute;width:auto;background-color:#191B1D;color:white;top:-30px;right:-40px;font-size:13px;padding:5px;border-radius:5px;">RoPro Quick Play</div><span style="margin-left:3px;transform:scale(0.75);" class="icon-common-play"></span></button>
				<button type="button" id="ropro-quick-random-server-button" style="position:absolute;right:0px;top:4px;width:50px;min-width:50px;height:50px;min-height:50px;padding:5px;transform:scale(0.6);" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width roproquickjoin" data-testid="play-button"><div class="quick-game-search-tooltip" style="display:none;position:absolute;width:auto;background-color:#191B1D;color:white;top:-30px;right:-20px;font-size:13px;padding:5px;border-radius:5px;">Random Server</div><span style="margin-left:0px;transform:scale(0.75);filter:invert(1);background-image:url(${chrome.runtime.getURL('/images/random_server.svg')});background-size: 36px 36px;" class="icon-common-play"></span></button></div></a></li>`
				search = document.getElementsByClassName('navbar-search')
				if (search.length > 0) {
					options = search[0].getElementsByClassName('navbar-search-option')
					var experiences = null
					for (var i = 0; i < options.length; i++) {
						if (options[i].getElementsByTagName('a').length > 0 && options[i].getElementsByTagName('a')[0].href.includes('/discover')) {
							experiences = options[i]
							break
						}
					}
					if (experiences != null) {
						flag = false
						if ($('.ropro-quick-game-search').length > 0) {
							if (parseInt($('.ropro-quick-game-search').get(0).getAttribute('universeId')) == game.universeId) {
								flag = true
							}
						}
						$('.ropro-quick-game-search').remove()
						div = document.createElement('div')
						div.innerHTML = quicksearchHTML
						quicksearchLi = div.childNodes[0]
						quicksearchLi.setAttribute('universeId', parseInt(game.universeId))
						insertAfter(quicksearchLi, experiences)
						if (flag == false) {
							setTimeout(function(){
								quicksearchLi.classList.add('loaded')
							}, 10)
						} else {
							quicksearchLi.classList.add('loaded')
						}
						if (game.universeId in thumbnailsDict) {
							thumbnails = thumbnailsDict[game.universeId]
						} else {
							thumbnails = await fetchThumbnail(game.universeId)
							thumbnailsDict[game.universeId] = thumbnails
						}
						if (query == $("#navbar-search-input").val() && thumbnails.data.length > 0) {
							thumbnail = thumbnails.data[0].imageUrl
							gameIcon = quicksearchLi.getElementsByClassName('ropro-quick-search-game-icon')
							if (gameIcon.length > 0) {
								gameIcon[0].src = stripTags(thumbnail)
								gameIcon[0].style.opacity = 1
							}
						}
						document.getElementById('ropro-quick-random-server-button').addEventListener('mouseenter', function() {
							document.getElementById('ropro-quick-search-link').href = `https://roblox.com/games/${parseInt(game.rootPlaceId)}#ropro-random-server`
						})
						document.getElementById('ropro-quick-play-button').addEventListener('mouseenter', function() {
							document.getElementById('ropro-quick-search-link').href = `https://roblox.com/games/${parseInt(game.rootPlaceId)}#ropro-quick-play`
						})
						document.getElementById('ropro-quick-random-server-button').addEventListener('mouseleave', function() {
							document.getElementById('ropro-quick-search-link').href = `https://roblox.com/games/${parseInt(game.rootPlaceId)}#ropro-quick-search`
						})
						document.getElementById('ropro-quick-play-button').addEventListener('mouseleave', function() {
							document.getElementById('ropro-quick-search-link').href = `https://roblox.com/games/${parseInt(game.rootPlaceId)}#ropro-quick-search`
						})
						document.getElementById('ropro-quick-search-link').addEventListener('click', function() {
							setLocalStorage('quickSearchLinkClicked', Date.now())
						})
					}
				}
			}
		} else if (query.length == 0) {
			currentQueryExperience = ""
		}
	}
}

async function handleItemInput(e) {
	if ($("#navbar-search-input").val() != "") {
		if (e.type == "keydown" && e.originalEvent.code == "ArrowUp" && $('.ropro-quick-item-search').length > 0) {
			if ($('.ropro-quick-item-search').get(0).classList.contains('new-selected')) {
				$('.ropro-quick-item-search').get(0).classList.remove('new-selected')
			} else {
				nextsibling = $('.ropro-quick-item-search').get(0).nextElementSibling
				if (nextsibling.classList.contains('new-selected')) {
					e.stopPropagation()
					nextsibling.classList.remove('new-selected')
					$('.ropro-quick-item-search').get(0).classList.add('new-selected')
				}
			}
		}
		if (e.type == "keydown" &&  e.originalEvent.code == "ArrowDown" && $('.ropro-quick-item-search').length > 0) {
			if ($('.ropro-quick-item-search').get(0).classList.contains('new-selected')) {
				$('.ropro-quick-item-search').get(0).classList.remove('new-selected')
			} else {
				experiences = $('.ropro-quick-item-search').get(0).previousElementSibling
				if (experiences.classList.contains('new-selected')) {
					e.stopPropagation()
					experiences.classList.remove('new-selected')
					$('.ropro-quick-item-search').get(0).classList.add('new-selected')
				}
			}
		}
	}
	if (e.type != "keydown") {
		if (e.type == "keyup" && e.originalEvent.code == "Enter" && $('.ropro-quick-item-search').length > 0) {
			if ($('.ropro-quick-item-search').get(0).classList.contains('new-selected')) {
				$('.ropro-quick-item-search a').get(0).click()
				e.stopPropagation()
				return
			}
		}
		var query = $("#navbar-search-input").val()
		if (query.length > 0 && query != currentQueryItem) {
			currentQueryItem = query
			if (query in queryDictItem) {
				var item = queryDictItem[query]
			} else {
				var item = await getItemSearch(query)
				queryDictItem[query] = item
			}
			if (query == $("#navbar-search-input").val() && item != null) {
				itemJSON = JSON.parse(item.json)
				quicksearchHTML = `<li style="height:0px;position:relative;" itemid="${parseInt(item.id)}" class="ropro-quick-item-search quick-item-search navbar-search-option rbx-clickable-li"><a id="ropro-quick-item-link" href="https://roblox.com/catalog/${parseInt(item.id)}/#ropro-quick-item-search" style="height:57px;position:relative;display:flex;align-items:center;padding-top:0px;padding-bottom:0px;"><div style="position:relative;display:inline-block;width:36px;height:36px;margin:-6px 6px -6px 0;border-radius:2px;background-color:${$('.dark-theme').length > 0 ? '#343638' : '#C3C5C6'};"><span><img class="ropro-quick-search-item-icon" style="width:100%;height:100%;opacity:0;transition:opacity .5s ease;" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="></span></div><div><div style="max-width:300px;font-size: 16px; font-weight:300;white-space:nowrap;overflow:hidden;text-overflow: ellipsis;"><b>${stripTags(itemJSON[0])}</b></div><div style="display:inline-block!important;"><span style="font-size:11px;" class="info-label" title=""><b>RAP:</b> ${kFormatter(itemJSON[8])}  <b>Value:</b> ${kFormatter(itemJSON[16] == null ? itemJSON[8] : itemJSON[16])}</span></div></div></a><div style="width:30px;height:30px;position:absolute;top:15px;right:10px;"><button id="ropro-rolimons-button" type="button" style="width:50px;min-width:50px;height:50px;min-height:50px;padding:5px;transform:scale(0.6);background-color:#0084DD;margin-top:-10px;margin-left:-10px;" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width"><a href="https://www.rolimons.com/item/${parseInt(item.id)}" style="padding:10px;padding-bottom:5px;transform:scale(1.2);"><img src="${chrome.runtime.getURL('/images/rolimons_icon_white.png')}" style="margin-left:2px;width:20px;margin-top:-7px;"></a></button></div></li>`
				search = document.getElementsByClassName('navbar-search')
				if (search.length > 0) {
					options = search[0].getElementsByClassName('navbar-search-option')
					var avatarShop = null
					console.log(options)
					for (var i = 0; i < options.length; i++) {
						if (options[i].getElementsByTagName('a').length > 0 && options[i].getElementsByTagName('a')[0].href.includes('/catalog')) {
							avatarShop = options[i]
							break
						}
					}
					if (avatarShop != null) {
						flag = false
						if ($('.ropro-quick-item-search').length > 0) {
							if (parseInt($('.ropro-quick-item-search').get(0).getAttribute('itemid')) == item.id) {
								flag = true
							}
						}
						$('.ropro-quick-item-search').remove()
						div = document.createElement('div')
						div.innerHTML = quicksearchHTML
						var quicksearchLi = div.childNodes[0]
						quicksearchLi.setAttribute('itemid', parseInt(item.id))
						insertAfter(quicksearchLi, avatarShop)
						if (flag == false) {
							setTimeout(function(){
								quicksearchLi.classList.add('loaded')
							}, 10)
						} else {
							quicksearchLi.classList.add('loaded')
						}
						if (query == $("#navbar-search-input").val()) {
							thumbnail = `https://api.ropro.io/getAssetThumbnail.php?id=${parseInt(item.id)}`
							itemIcon = quicksearchLi.getElementsByClassName('ropro-quick-search-item-icon')
							if (itemIcon.length > 0) {
								itemIcon[0].src = stripTags(thumbnail)
								itemIcon[0].style.opacity = 1
							}
						}
					}
				}
			}
		} else if (query.length == 0) {
			currentQueryItem = ""
		}
	}
}

async function addCardQuickPlay(card) {
	if ($(card).find('.ropro-card-quick-play-options').length > 0) {
		return
	}
	var placeLink = $(card).closest('.game-card-link').get(0).getAttribute('href')
	if (placeLink.size == 0) {
		return
	}
	cardQuickPlayHTML = `<div style="position:absolute;${card.classList.contains('large-game-tile-thumb-container') ? 'top:5px' : 'bottom:50px'};z-index:10;" class="ropro-card-quick-play-options"><a href="${stripTags(placeLink)}#ropro-quick-play"><button type="button" style="position:absolute;right:32px;top:0px;width:50px;min-width:50px;height:50px;min-height:50px;padding:5px;transform:scale(0.6);" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width roproquickjoin ropro-card-quick-play-button" data-testid="play-button"><span style="margin-left:3px;transform:scale(0.75);display:block;" class="icon-common-play"></span></button></a><a href="${stripTags(placeLink)}#ropro-random-server"><button type="button" style="position:absolute;right:0px;top:0px;width:50px;min-width:50px;height:50px;min-height:50px;padding:5px;transform:scale(0.6);" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width ropro-quick-random-server-button ropro-card-random-play-button" data-testid="play-button"><span style="margin-left:0px;transform:scale(0.75);filter:invert(1);background-image:url(${chrome.runtime.getURL('/images/random_server.svg')});background-size: 36px 36px;display:block;" class="icon-common-play"></span></button></a></div>`
	div = document.createElement('div')
	div.innerHTML = cardQuickPlayHTML
	var cardQuickPlayElement = div.childNodes[0]
	card.appendChild(cardQuickPlayElement)
	setTimeout(function(){
		card.getElementsByClassName('ropro-card-quick-play-options')[0].classList.add('animate')
	}, 10)
	cardQuickPlayElement.getElementsByClassName('ropro-card-quick-play-button')[0].addEventListener('click', function() {
		setLocalStorage('quickSearchLinkClicked', Date.now())
	})
	cardQuickPlayElement.getElementsByClassName('ropro-card-random-play-button')[0].addEventListener('click', function() {
		setLocalStorage('quickSearchLinkClicked', Date.now())
	})
	cardQuickPlayElement.getElementsByClassName('ropro-card-quick-play-button')[0].addEventListener('auxclick', function() {
		setLocalStorage('quickSearchLinkClicked', Date.now())
	})
	cardQuickPlayElement.getElementsByClassName('ropro-card-random-play-button')[0].addEventListener('auxclick', function() {
		setLocalStorage('quickSearchLinkClicked', Date.now())
	})
}

async function quicksearchMain() {
	var quickItemSearch = await fetchSetting('quickItemSearch');
	var experienceQuickSearch = await fetchSetting('experienceQuickSearch');
	var experienceQuickPlay = await fetchSetting('experienceQuickPlay');
	var navbarSearchInterval = setInterval(async function() {
		if (document.getElementById('navbar-search-input') != currentSearchInput) {
			currentSearchInput = document.getElementById('navbar-search-input')
			if (experienceQuickSearch) {
				$(document.getElementById('navbar-search-input')).bind('input change paste keyup keydown mouseup', function(e){
						handleExperienceInput(e)
				})
			}
			if (quickItemSearch) {
				$(document.getElementById('navbar-search-input')).bind('input change paste keyup keydown mouseup', function(e){
						handleItemInput(e)
				})
			}
		}
		if (experienceQuickPlay) {
			$('.game-card-thumb-container:not(.ropro-card-quick-play)').each(function(){
				this.classList.add('ropro-card-quick-play')
				if ($(this).find('.ropro-card-quick-play-options').length == 0) {
					$(this).mouseover(function(){
						addCardQuickPlay(this)
					})
				}
			})
			$('.featured-game-icon-container:not(.ropro-card-quick-play)').each(function(){
				this.classList.add('ropro-card-quick-play')
				if ($(this).find('.ropro-card-quick-play-options').length == 0) {
					$(this).mouseover(function(){
						addCardQuickPlay(this)
					})
				}
			})
			$('.large-game-tile-thumb-container:not(.ropro-card-quick-play)').each(function(){
				this.classList.add('ropro-card-quick-play')
				if ($(this).find('.ropro-card-quick-play-options').length == 0) {
					$(this).mouseover(function(){
						addCardQuickPlay(this)
					})
				}
			})
		}
	}, 250)
}

quicksearchMain()
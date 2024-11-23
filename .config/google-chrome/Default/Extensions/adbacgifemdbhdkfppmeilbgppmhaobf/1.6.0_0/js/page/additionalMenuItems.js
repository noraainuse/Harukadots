function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
}

function validateLicense() {
	chrome.runtime.sendMessage({greeting: "ValidateLicense"})
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

function getStorage(key) {
	return new Promise(resolve => {
		chrome.storage.sync.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

function getStorage_UniquelyNamedFunction(key) {
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

function getLocalStorage(key) {
	return new Promise(resolve => {
		chrome.storage.local.get(key, function (obj) {
			resolve(obj[key])
		})
	})
}

function setLocalStorage(key, value) {
	return new Promise(resolve => {
		chrome.storage.local.set({[key]: value}, function(){
			resolve()
		})
	})
}

function fetchSubscription(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSubscription", setting: setting}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function openOptions() {
	chrome.runtime.sendMessage({greeting: "OpenOptions"})
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function parseRgb(c) {
	var result = c.split("(")[1].split(",")
	return result ? {
		r: parseInt(result[0]),
		g: parseInt(result[1]),
		b: parseInt(result[2])
	} : null;
}

function setForegroundOpacity(opacity) {
	if (document.getElementById('roproThemeFrame') != null) {
		var elements = []
		var content = document.getElementsByClassName('content')
		for (i = 0; i < content.length; i++) {
			elements.push(content[i])
		}
		var section_content = document.getElementsByClassName('section-content')
		for (i = 0; i < section_content.length; i++) {
			elements.push(section_content[i])
		}
		for (i = 0; i < elements.length; i++) {
			var element = elements[i]
			var color = window.getComputedStyle(element, null).getPropertyValue('background-color')
			var rgb = null
			console.log(color)
			if (color.includes('#')) {
				rgb = hexToRgb(color)
			} else {
				rgb = parseRgb(color)
			}
			if (rgb != null && !(rgb['r'] == 0 && rgb['g'] == 0 && rgb['b'] == 0)) {
				element.style.backgroundColor = `rgba(${rgb['r']}, ${rgb['g']}, ${rgb['b']}, ${parseFloat(opacity)})`
			}
			if (i == 0 && opacity < 1) {
				element.style.boxShadow = `rgba(0, 0, 0, 0.25) 0px 0px 3px 1px`
			}
		}
	}
}

function setBackdropBlur(pixels) {
	if (document.getElementById('roproThemeFrame') != null) {
		var elements = []
		var content = document.getElementsByClassName('content')
		for (i = 0; i < 1; i++) {
			elements.push(content[i])
		}
		for (i = 0; i < elements.length; i++) {
			var element = elements[i]
			element.style.backdropFilter = `blur(${parseInt(pixels)}px)`
			console.log(element)
		}
		$('.alert').addClass('ropro-hidden')
		setTimeout(function() {
			$('.alert').addClass('ropro-hidden')
		}, 100)
		setTimeout(function() {
			$('.alert').addClass('ropro-hidden')
		}, 1000)
	}
}

async function checkAlerts() {
	alreadyAlerted = await getLocalStorage("alreadyAlerted")
	rpAlert = await getLocalStorage("rpAlert")
	if (typeof rpAlert != "undefined" && rpAlert.length > 0 && alreadyAlerted != rpAlert) {
		alertDiv = document.createElement('div')
		alertDiv.classList.add("alert-info")
		alertDiv.classList.add("linkify")
		alertDiv.style.display = rpAlert.split(";")[0];
		alertDiv.innerHTML = `<span>${rpAlert.substring(rpAlert.indexOf(';') + 1, rpAlert.length)}</span>`
		document.getElementsByClassName('alert-container')[0].appendChild(alertDiv)
		if (alertDiv.getElementsByClassName('alert-close').length > 0) {
			setTimeout(function() {
				alertDiv.getElementsByClassName('alert-close')[0].addEventListener('click', async function() { //User closed alert, dismiss message and don't show it again
					console.log("Close Alert")
					await setLocalStorage("alreadyAlerted", rpAlert)
					alreadyAlerted = await getLocalStorage("alreadyAlerted")
					alertDiv.remove()
				})
			}, 2000)
		}
	}
}

function addThemeMain(theme) {
	if (theme.hasOwnProperty('version') && theme['version'] == 2) {
		myTheme = theme
		var div = document.createElement('div')
		if (theme['name'].endsWith('.mp4')) {
			themeFrame = `<iframe id="roproThemeFrame" src="https://api.ropro.io/themeFrameVideo.php?hard-cache&theme=${theme['name']}${theme.hasOwnProperty('h') ? `&h=${parseInt(theme['h'])}&s=${parseFloat(theme['s'])}&l=${parseFloat(theme['l'])}` : ''}" frameborder="0" style="top:0;left:0;position:absolute;border:0;width:100%;height:100%;z-index:-1;"></iframe>`
		} else {
			themeFrame = `<iframe id="roproThemeFrame" src="https://api.ropro.io/themeFrame.php?theme=${theme['name']}${theme.hasOwnProperty('h') ? `&h=${parseInt(theme['h'])}&s=${parseFloat(theme['s'])}&l=${parseFloat(theme['l'])}` : ''}" frameborder="0" style="top:0;left:0;position:absolute;border:0;width:100%;height:100%;z-index:-1;"></iframe>`
		}
		div.innerHTML = themeFrame
		var myInterval1 = setInterval(function(){
			mainContainer = document.getElementById('container-main')
			if (mainContainer == null) {
				return
			} else {
				clearInterval(myInterval1)
			}
			mainContainer.appendChild(div.childNodes[0])
			mainContainer.style.borderRadius = "20px"
			mainContainer.style.padding = "20px"
		}, 50)
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
		var myInterval1 = setInterval(function(){
			mainContainer = document.getElementById('container-main')
			if (mainContainer == null) {
				return
			} else {
				clearInterval(myInterval1)
			}
			mainContainer.classList.add("ropro-theme")
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
			mainContainer.style.padding = "20px"
		}, 50)
	}
	var myInterval2 = setInterval(function(){
		contentContainer = document.getElementsByClassName('content')
		if (contentContainer.length == 0) {
			return
		} else {
			clearInterval(myInterval2)
		}
		contentContainer = contentContainer[0]
		contentContainer.style.padding = "20px"
		contentContainer.style.borderRadius = "10px"
		// if (window.location.href.includes('/home') || (window.location.href.match('/games/[0-9]+/') != null && window.location.href.match('/games/[0-9]+/').length > 0)) {
		// 	contentContainer.style.maxWidth = "1000px"
		// 	contentContainer.style.marginLeft = "auto"
		// }
	}, 50)
	var myInterval3 = setInterval(function(){
		right = document.getElementById('Skyscraper-Abp-Right')
		left = document.getElementById('Skyscraper-Abp-Left')
		if (right == null && left == null) {
			return
		} else {
			clearInterval(myInterval3)
		}
		if (window.location.href.includes('/home') || (window.location.href.match('/games/[0-9]+/') != null && window.location.href.match('/games/[0-9]+/').length > 0)) {
			document.getElementById('Skyscraper-Abp-Right').style.marginRight = "-200px"
			document.getElementById('Skyscraper-Abp-Left').style.marginLeft = "-185px"
		}
	}, 50)
}

async function insertMenuItems() {
	var tradeOffersPage = await fetchSetting('tradeOffersPage')
	var sandbox = await fetchSetting('sandbox')
	var themes = await fetchSetting('profileThemes')
	offerLI = document.createElement('li')
	newButtonHTML = '<a class="offers-icon dynamic-overflow-container text-nav" href="/offers" id="nav-inventory"><div><span style="transform:scale(0.8);margin-top:-1px;" class="new-menu-icon icon-nav-trade"></span></div><span class="font-header-2 dynamic-ellipsis-item">Trade Offers</span></a>'
	offerLI.innerHTML += newButtonHTML
	sandboxLI = document.createElement('li')
	newButtonHTML = '<a class="sandbox-icon dynamic-overflow-container text-nav" href="/sandbox" id="nav-inventory"><div><span style="transform:scale(0.85);margin-left:1px;" class="new-menu-icon icon-nav-charactercustomizer"></span></div><span class="font-header-2 dynamic-ellipsis-item">Sandbox</span></a>'
	sandboxLI.innerHTML += newButtonHTML
	themesLI = document.createElement('li')
	newButtonHTML = '<a class="themes-icon dynamic-overflow-container text-nav" href="/themes" id="nav-inventory"><div><span style="transform:scale(1);margin-top:-3px;background-size:95%;" class="new-menu-icon icon-nav-charactercustomizer"></span></div><span class="font-header-2 dynamic-ellipsis-item">Themes</span></a>'
	themesLI.innerHTML += newButtonHTML
	while(!document.querySelector(".left-col-list")) {
		await new Promise(r => setTimeout(r, 10));
	}
	menu = document.getElementsByClassName('left-col-list')[0]
	if (tradeOffersPage) {
		menu.insertBefore(offerLI, menu.childNodes[7])
	}
	if (sandbox) {
		menu.insertBefore(sandboxLI, menu.childNodes[5])
	}
	if (themes) {
		menu.insertBefore(themesLI, menu.childNodes[10])
	}
	for (i = 0; i < document.getElementsByClassName('left-col-list')[0].getElementsByTagName('li').length; i++) {
		listItem = document.getElementsByClassName('left-col-list')[0].getElementsByTagName('li')[i]
		listItem.style.display = "block"
		if (listItem.getElementsByTagName('a').length > 0) {
			listItem.getElementsByTagName('a')[0].style.display = ""
		}
	}
	while(!document.querySelector(".navbar-right.rbx-navbar-icon-group")) {
		await new Promise(r => setTimeout(r, 10));
	}
	console.log('loaded')
	if (await fetchSetting('roproIcon') && document.getElementsByClassName('nav navbar-right rbx-navbar-icon-group').length > 0) {
		subscription = await fetchSubscription()
		if (subscription.includes("free")) {
			subscriptionPrefix = "free"
			subscriptionName = "RoPro Free"
		} else if (subscription.includes("plus") || subscription.includes("standard")) {
			subscriptionPrefix = "plus"
			subscriptionName = "RoPro Plus"
		} else if (subscription.includes("rex") || subscription.includes("pro")) {
			subscriptionPrefix = "rex"
			subscriptionName = "RoPro Rex"
		} else if (subscription.includes("ultra")) {
			subscriptionPrefix = "ultra"
			subscriptionName = "RoPro Ultra"
		} else {
			subscriptionPrefix = "free"
			subscriptionName = "RoPro Free"
		}
		li3 = document.createElement('li')
		li3.style.marginLeft = "6px"
		li3.classList.add('buttontooltip')
		li3.innerHTML = '<img class="ropro-icon" style="margin-top:6px;margin-left:0px;width:25px;" src="' + chrome.runtime.getURL('/images/' + stripTags(subscriptionPrefix) + '_icon.png') + '"><span style="margin-top:-5.5px;margin-left:3px;top:45px;left:-160px;width:190px;" class="tooltiptext"><p style="color:white;"><b>RoPro v1.5</b></p>' + stripTags(subscriptionName) + ' Active</span>'
		document.getElementsByClassName('nav navbar-right rbx-navbar-icon-group')[0].appendChild(li3)
		li3.addEventListener('click', function() {
			openOptions()
		})
	}
	while(!document.querySelector(".nav-settings-icon")) {
		await new Promise(r => setTimeout(r, 250));
	}
	document.getElementById('settings-icon').addEventListener('click', function(){
		if(document.getElementsByClassName('ropro-settings-toggle').length == 0) {
			setTimeout(function(){
				settingsButtonHTML = `<a style="padding-left:5px;padding-right:5px;" class="rbx-menu-item ropro-settings-toggle">RoPro Settings</a>`
				liSettings = document.createElement('li')
				liSettings.innerHTML += settingsButtonHTML
				document.getElementById('settings-popover').style.left = parseFloat(document.getElementById('settings-popover').style.left) - 17 + "px"
				document.getElementById('settings-popover').getElementsByClassName('arrow')[0].style.left = "55.8%"
				document.getElementById('settings-popover-menu').insertBefore(liSettings, document.getElementById('settings-popover-menu').childNodes[0])
				liSettings.addEventListener('click', function() {
					openOptions()
				})
			}, 10)
		}
	})
	var foregroundOpacity = await getStorage_UniquelyNamedFunction('foregroundOpacity')
	if (typeof foregroundOpacity != 'undefined') {
		setForegroundOpacity(foregroundOpacity)
		if (foregroundOpacity < 1) {
			if (document.getElementById('game-details-carousel-container') != null) {
				document.getElementById('game-details-carousel-container').style.borderRadius = "10px"
			}
		}
	}
	var backdropBlur = await getStorage_UniquelyNamedFunction('backdropBlur')
	if (typeof backdropBlur != 'undefined' && parseInt(backdropBlur) > 0) {
		setBackdropBlur(backdropBlur)
	}
}

insertMenuItems()

setTimeout(async function() {
    user = parseInt(document.getElementsByName('user-data')[0].attributes['data-userid'].value)
    if (!isNaN(user) && user != await getStorage('rpUserID')) {
		console.log("Updating UserID")
		setStorage('rpUserID', user)
        validateLicense()
    }
	function checkAlertContainer() {
		if (typeof document.getElementsByClassName('alert-container')[0] != "undefined") {
			checkAlerts()
		} else {
			setTimeout(function() {
				checkAlertContainer()
			}, 100)
		}
	}
	checkAlertContainer()
	if (!window.location.href.includes('/profile') && await fetchSetting('globalThemes')) {
		theme = await getStorage('globalTheme')
		if ((typeof theme != 'undefined' && theme != null) || window.location.href.endsWith('/themes')) {
			addThemeMain(JSON.parse(theme))
		}
	}
}, 1)
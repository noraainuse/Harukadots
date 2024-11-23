function fetchItem(itemID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/tradeBackend.php?ids=" + itemID}, 
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

async function getJSON(userID) {
	response = await fetchItem(userID)
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
	return parseInt(url.split("catalog/")[1].split("/")[0])
}

function addLink(itemID) {
	header = document.getElementsByClassName('border-bottom item-name-container')[0].getElementsByTagName('h2')[0]
	if (header != undefined && document.getElementById('resellers') != null) {
		a = document.createElement('a')
		a.innerHTML = '<svg id = "roliLink" aria-hidden="true" width="1em" height="1em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10.586 13.414a1 1 0 0 1-1.414 1.414 5 5 0 0 1 0-7.07l3.535-3.536a5 5 0 0 1 7.071 7.071l-1.485 1.486a7.017 7.017 0 0 0-.405-2.424l.476-.476a3 3 0 1 0-4.243-4.243l-3.535 3.536a3 3 0 0 0 0 4.242zm2.828-4.242a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.07l-3.535 3.536a5 5 0 0 1-7.071-7.07l1.485-1.486c-.008.82.127 1.641.405 2.423l-.476.476a3 3 0 1 0 4.243 4.243l3.535-3.536a3 3 0 0 0 0-4.242 1 1 0 0 1 0-1.414z" fill="#fff"></path></svg>'
		a.setAttribute('style', 'margin-left:5px;margin-top:5px;')
		a.setAttribute('target', '_blank')
		a.setAttribute('href', 'https://www.rolimons.com/item/' + parseInt(itemID))
		header.appendChild(a)
	}
}

function projectedDisplay() {
	assetThumbnail = document.getElementById('item-thumbnail-container-frontend').getElementsByClassName('thumbnail-holder')[0]
	div = document.createElement('div')
	div.setAttribute('style','top:0px;left:0px;bottom:none!important;')
	div.setAttribute('class', 'asset-restriction-icon')
	div.innerHTML = `<span class="rbx-tooltip" data-toggle="tooltip" title="" data-original-title="Projected item."><img width=250 src="${chrome.runtime.getURL('/images/projected_icon.png')}"></span>`
	assetThumbnail.appendChild(div)
}

function addValue(itemValue, itemDemand, itemID) {
	details = document.getElementsByClassName('item-details')[0]
	if (details != undefined) {
		details.getElementsByClassName('item-type-field-container')[0].setAttribute('class', 'clearfix item-field-container')
		valueDiv = document.createElement('div')
		valueDiv.setAttribute('class', 'clearfix item-field-container')
		valueDiv.innerHTML += `<div class="font-header-1 text-subheader text-label text-overflow field-label"><img src="${chrome.runtime.getURL('/images/ropro_icon_small.png')}" width="15px"> Value</div><div class="field-content"><a class="text-name item-genre wait-for-i18n-format-render" target="_blank" href="https://www.rolimons.com/item/` + parseInt(itemID) + '">' + addCommas(parseInt(itemValue)) + '</a><span class="wait-for-i18n-format-render"></span></div>'
		details.insertBefore(valueDiv, details.childNodes[2])
		demandDiv = document.createElement('div')
		demandDiv.setAttribute('class', 'clearfix item-field-container')
		demandDiv.innerHTML += `<div class="font-header-1 text-subheader text-label text-overflow field-label"><img src="${chrome.runtime.getURL('/images/ropro_icon_small.png')}" width="15px"> Demand</div><div class="field-content"><a class="text-name item-genre wait-for-i18n-format-render" target="_blank" href="https://www.rolimons.com/item/` + parseInt(itemID) + '">' + stripTags(itemDemand) + '</a><span class="wait-for-i18n-format-render"></span></div>'
		details.insertBefore(demandDiv, details.childNodes[3])
	}
}

async function mainItem() {
	if (location.href.includes("/catalog/") && location.href.split("/catalog/")[1].includes("/")) {
		itemID = getIdFromURL(location.href)
		if (itemID != undefined && itemID != 0 && await fetchSetting("itemPageValueDemand")) {
			json = await getJSON(itemID)
			if (Object.keys(json).length > 0) {
				json = JSON.parse(json[itemID])
				itemValue = json[16]
				console.log(itemValue)
				demand = parseInt(json[17])
				if (json[19] == 1 && await fetchSetting("projectedWarningItemPage")) {
					projectedDisplay()
				}
				if (json[16] == null) {
					itemValue = json[8]
				}
				if (json[17] == null) {
					demand = 1.001
				} else {
					demand++
				}
				demandEquivalence = {"1.001":"Not Assigned", "0":"Projected", "1":"Terrible", "2":"Low", "3":"Normal", "4":"High", "5":"Amazing"}
				addValue(itemValue, stripTags(demandEquivalence[demand.toString()]), itemID)
			}
		}
		if (await fetchSetting("embeddedRolimonsItemLink")) {
			addLink(itemID)
		}
	}
}

mainItem()
function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }

function formatTime(timeDifference) {
	timeSince = Math.round(timeDifference) / 1000
	if (timeSince < 60) { //seconds
		period = Math.round(timeSince)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} second${suffix}`
	} else if (timeSince / 60 < 60) { //minutes
		period = Math.round(timeSince / 60)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} minute${suffix}`
	} else if (timeSince / 60 / 60 < 24) { //hours
		period = Math.round(timeSince / 60 / 60)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} hour${suffix}`
	} else if (timeSince / 60 / 60 / 24 < 30) { //days
		period = Math.round(timeSince / 60 / 60 / 24)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} day${suffix}`
	} else if (timeSince / 60 / 60 / 24 / 30 < 12) { //months
		period = Math.round(timeSince / 60 / 60 / 24 / 30)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} month${suffix}`
	} else { //years
		period = Math.round(timeSince / 60 / 60 / 24 / 30 / 12)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} year${suffix}`
	}
	return timeString
}

document.addEventListener('fetchTradeRows', function(event) {
	elements = $(".trade-row:not(.trade-id)")
	for (i = 0; i < elements.size(); i++) {
		tradeRow = elements.get(i)
		tradeInfo = angular.element(tradeRow).scope().trade
		tradeId = tradeInfo.id
		tradeRow.setAttribute('tradeid', parseInt(tradeId))
		tradeRow.setAttribute('username', stripTags(tradeInfo.user.name))
		tradeRow.classList.add('trade-id')
		tradeRow.classList.add(tradeId)
		if (event.detail.tradeTimeDisplay) {
			timeDifference = new Date().getTime() - new Date(tradeInfo.created).getTime()
			tradeRow.getElementsByClassName('trade-sent-date')[0].setAttribute("title", stripTags(tradeRow.getElementsByClassName('trade-sent-date')[0].innerText))
			tradeRow.getElementsByClassName('trade-sent-date')[0].innerText = formatTime(timeDifference)
		}
	}
})

document.addEventListener('replaceRows', function(event) {
	scrollContent = $('#trade-row-scroll-container').get(0).getElementsByClassName('simplebar-content')[0]
	document.getElementById('tab-Inbound').click()
	tradesDiv = document.getElementById('filteredTrades')
	if (tradesDiv != null) {
		trades = JSON.parse(decodeURI(tradesDiv.innerText))
		angular.element(scrollContent).scope().data.trades = trades
		angular.element(scrollContent).scope().selectTrade(angular.element(scrollContent).scope().data.trades[0])
		setTimeout(function() {
			angular.element(scrollContent).scope().data.trades.push(trades[trades.length - 1])
		}, 1000)
	}
})

document.addEventListener('fetchTradeWindowUsers', function(event) {
	var inventoryPanel = angular.element(document.getElementsByClassName('inventory-panel-holder')[0]).scope()
	document.getElementsByClassName('trade-inventory-panel')[inventoryPanel.data.offers[0].isMyOffer ? 0 : 1].setAttribute('trade-user', parseInt(inventoryPanel.data.offers[0].user.id))
	document.getElementsByClassName('trade-inventory-panel')[inventoryPanel.data.offers[1].isMyOffer ? 0 : 1].setAttribute('trade-user', parseInt(inventoryPanel.data.offers[1].user.id))
})

document.addEventListener('addItemToTrade', function(event) {
	angular.element(document.getElementsByClassName('trade-request-window-offers')[0]).scope().addItemToOffer({
		"id": parseInt(event.detail.userAssetId),
		"assetId": parseInt(event.detail.assetId),
		"name": stripTags(event.detail.name),
		"recentAveragePrice": parseInt(event.detail.recentAveragePrice),
		"serialNumber": parseInt(event.detail.serialNumber),
		"assetStock": parseInt(event.detail.assetStock),
		"userId": parseInt(event.detail.userId)
	})
	angular.element(document.getElementsByClassName('trade-request-window-offers')[0]).scope().$apply()
})

document.addEventListener('removeItemFromTrade', function(event) {
	angular.element(document.getElementsByClassName('trade-request-window-offers')[0]).scope().removeItemFromOffer({
		"id": parseInt(event.detail.userAssetId)
	})
	angular.element(document.getElementsByClassName('trade-request-window-offers')[0]).scope().$apply()
})
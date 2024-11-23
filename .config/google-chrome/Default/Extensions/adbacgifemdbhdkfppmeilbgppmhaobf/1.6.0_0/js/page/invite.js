div = document.createElement('div')
div.classList.add('ropro-valid')
document.body.appendChild(div)

function openInvite(placeid, key) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "CreateInviteTab", placeid: placeid, key: key}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

$(document).ready(async function(){
	key = document.getElementById('invite_key').getAttribute('value').substring(0, 6)
	placeid = parseInt(document.getElementById('invite_placeid').getAttribute('value'))
	tab = await openInvite(placeid, key)
	document.getElementById('loadingText').innerHTML = "Server loaded. Have fun!"
	document.getElementById('connectingSpinner').style.display = "none"
	document.getElementById('leaveReview').style.display = "block"
});
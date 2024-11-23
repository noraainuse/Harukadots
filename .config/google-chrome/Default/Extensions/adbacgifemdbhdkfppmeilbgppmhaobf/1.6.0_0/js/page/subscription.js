div = document.createElement('div')
div.classList.add('ropro-valid')
document.body.appendChild(div)

function activateKey(key) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/activateKey.php?key=" + key},
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

function setStorage(key, value) {
	return new Promise(resolve => {
		chrome.storage.sync.set({[key]: value}, function(){
			resolve()
		})
	})
}

$(document).ready(async function(){
	var checkSuccess = setInterval(async function() {
		if (document.getElementsByClassName('login-success').length > 0) {
			clearInterval(checkSuccess)
			key = document.getElementById('roProKey').value
			data = await activateKey(key)
			if (data == "success") {
				setStorage("subscriptionKey", key)
				location.reload()
			} else {
				location.reload()
			}
		}
	}, 500)
});
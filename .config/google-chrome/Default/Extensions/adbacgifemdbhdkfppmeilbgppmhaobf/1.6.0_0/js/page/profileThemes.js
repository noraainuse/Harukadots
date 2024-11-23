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

function addThemesButton() {
	var detailsAction = document.getElementsByClassName('details-actions desktop-action')
	if (detailsAction.length == 0) {
		div = document.createElement('div')
		div.innerHTML += `<ul class="details-actions desktop-action"></ul>`
		detailsAction = div.childNodes[0]
		document.getElementsByClassName('header-details')[0].appendChild(detailsAction)
	} else {
		detailsAction = detailsAction[0]
	}
	detailsAction.innerHTML += `<li><a href="/themes"><button id="editThemes" class="btn-control-md">Edit Theme</button></a></li>`
}

function getIdFromURL(url) {
	return parseInt(url.split("users/")[1].split("/profile")[0])
}

async function themesMain(){
	myUserID = await getStorage("rpUserID")
	pageID = getIdFromURL(location.href)
	if (myUserID == pageID && await fetchSetting('profileThemes')) {
		addThemesButton()
	}
}

themesMain()
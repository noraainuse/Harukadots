var url_matches = [
	"/discover",
	"/discover/*",
	"/games/*"
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

var fetchAngular = document.createElement('script');
fetchAngular.src = chrome.runtime.getURL('/js/page/fetchServers.js');
(document.head||document.documentElement).appendChild(fetchAngular);
fetchAngular.onload = function() {
    fetchAngular.remove();
}

var theme = "dark"
if ($('.light-theme').length > 0) {
    var theme = "light"
}

var cloudPlayActive = false

serverFiltersHTML = `<div id="roproServerFiltersButton" style="position:absolute;float:right;width:90px;margin-top:0px;margin-right:0px;text-align:center;text-align:center;border-radius:5px;top:-1px;right:105px;" class="input-group-btn"><div id="serverFiltersDropdown" style="overflow:visible;margin-top:-3.5px;margin-left:0px;float:left;width:90px;margin-left:-10px;" class="server-filters-dropdown input-group-btn group-dropdown">
<button type="button" style="border-radius:0px;border:none;" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
<span id="serverFilters" class="rbx-selection-label ng-binding" style="width:90px;overflow:hidden;">Filters<img class="server-filters-icon" style="width:20px;filter:invert(2);margin-left:5px;" src="${chrome.runtime.getURL('/images/serverfilters.png')}"></span> 
</button>
</div>
			<span id="maxPlayersLoadingBar" style="margin-right: 310px; float: right; display: none; transform: scale(0.8); width: 100px; height: 25px; visibility: initial !important;" class="spinner spinner-default"></span>
			<div style="position: absolute; width: 200px; height: 295px; right: 0px; top: 30px; z-index: 1000; border-radius: 5px; background-color: rgb(30, 32, 34); display: none;" class="server-filters-dropdown-box" id="serverFiltersDropdownBox">
	<div id="reverseOrderButton" class="server-filter-option" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Reverses the order of the server list. The emptiest servers will be displayed first.</div>
		<p style="display:inline-block;">Smallest Servers</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Smallest_First.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div id="notFullButton" class="server-filter-option" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Filters out servers which are full.</div>
		<p style="display:inline-block;">Available Space</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Not_Full.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="maxPlayersButton" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Select a maximum player count to display.</div>
		<p style="display:inline-block;">Player Count</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Player_Count.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);">
		<div id="playerCountSelector" style="display:none;position:absolute;left: -218px;top:-75px;width:220px;height:auto;z-index:1000;background-color:#1E2022;border-radius:5px;padding:10px;">
			<div style="text-align:center;margin-bottom:0px;">
				<h3 style="padding-bottom:0px!important;font-size:15px;">Select Max Player Count</h3>
				<p style="display:none;width:200px;height:auto;font-size:12px;word-break: break-word;overflow-wrap: break-word;white-space: pre-wrap;">RoPro will filter out servers above this player count</p>
				<div style="background-color:#393B3D;height:276px;width:200px;margin-top:8px;border-radius:5px;padding-top:0.5px;overflow-y:scroll;overflow-x:hidden;" id="maxPlayersList" class="max-players-list">				
				</div>
			</div>
		</div>
		</div>
	<div class="server-filter-option" id="randomShuffleButton" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Display servers in a completely random order.</div>
		<p style="display:inline-block;">Random Shuffle</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Random_Shuffle.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="" style="width:190px;height:3px;background-color:#FFFFFF;margin:5px;margin-top:7px;border-radius:5px;"> </div>
	<div class="server-filter-option" id="serverRegionButton" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Filter servers by the region where they are located.</div>
		<div id="serverRegionSelector" style="display:none;position:absolute;left: -518px;top:-270px;width:520px;height:auto;z-index:1000;background-color:#1E2022;border-radius:5px;padding:10px;">
			<div style="text-align:center;margin-bottom:10px;">
				<p style="font-weight:bold;font-size:20px;padding-bottom:0px!important;">RoPro Server Region Selector</p>
				<p style="font-size:13px;">You should have a faster connection in datacenters close to you!</p>
			</div>
			<iframe id="globeFrame" style="border:0;width:500px;height:500px;" frameborder="0" scrolling="no"></iframe>
		</div>
		<p style="display:inline-block;">Server Region</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Server_Region2.svg')}" style="float:right;width:23px;margin-top:0px;margin-right:5px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="bestConnectionButton" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>RoPro will choose servers which are likely to have the fastest connection for you.</div>
		<p style="display:inline-block;">Best Connection</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Best_Connection3.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="newestServersButton" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Show the most recently launched servers first.</div>
		<p style="display:inline-block;">Newest Servers</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Newest_Server.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="oldestServersButton" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Show servers with the longest uptime first.</div>
		<p style="display:inline-block;">Oldest Servers</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Oldest_Server_2.svg')}" style="float:right;width:26px;margin-top:0px;margin-right:6px;filter:invert(0.8);"></div>
	<!--<div class="server-filter-option" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Filter servers by the update version of this experience when they were launched.</div>
		<p style="display:inline-block;">Server Version</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Server_Version2.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>-->
</div>
         </div>`
serverFiltersMiniHTML = `<div id="roproServerFiltersMiniButton" style="border-radius:5px;background-color:#2B2E30;padding:3px;position:absolute;top:5px;right:3px;z-index:100;cursor:pointer;width:auto;" class="input-group-btn"><div id="serverFiltersDropdownMini">
<img src="${chrome.runtime.getURL('/images/serverfilters.png')}" style="width:25px;filter:invert(1);">
</div>
			<span id="maxPlayersLoadingBar" style="margin-right: 310px; float: right; display: none; transform: scale(0.8); width: 100px; height: 25px; visibility: initial !important;" class="spinner spinner-default"></span>
			<div style="position: absolute; width: 200px; height: 295px; right: -1px; top: 25px; z-index: 1000; border-radius: 5px; background-color: rgb(30, 32, 34); display: none;" class="server-filters-dropdown-box" id="serverFiltersDropdownBoxMini">
	<div id="reverseOrderButtonMini" class="server-filter-option" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Reverses the order of the server list. The emptiest servers will be displayed first.</div>
		<p style="display:inline-block;">Smallest Servers</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Smallest_First.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div id="notFullButtonMini" class="server-filter-option" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Filters out servers which are full.</div>
		<p style="display:inline-block;">Available Space</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Not_Full.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="maxPlayersButtonMini" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Select a maximum player count to display.</div>
		<p style="display:inline-block;">Player Count</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Player_Count.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);">
		<div id="playerCountSelector" style="display:none;position:absolute;left: -218px;top:-75px;width:220px;height:auto;z-index:1000;background-color:#1E2022;border-radius:5px;padding:10px;">
			<div style="text-align:center;margin-bottom:0px;">
				<h3 style="padding-bottom:0px!important;font-size:15px;">Select Max Player Count</h3>
				<p style="display:none;width:200px;height:auto;font-size:12px;word-break: break-word;overflow-wrap: break-word;white-space: pre-wrap;">RoPro will filter out servers above this player count</p>
				<div style="background-color:#393B3D;height:276px;width:200px;margin-top:8px;border-radius:5px;padding-top:0.5px;overflow-y:scroll;overflow-x:hidden;" id="maxPlayersListMini" class="max-players-list">
				</div>		
			</div>
		</div>
		</div>
	<div class="server-filter-option" id="randomShuffleButtonMini" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip">Display servers in a completely random order.</div>
		<p style="display:inline-block;">Random Shuffle</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Random_Shuffle.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="" style="width:190px;height:3px;background-color:#FFFFFF;margin:5px;margin-top:7px;border-radius:5px;"> </div>
	<div class="server-filter-option" id="serverRegionButtonMini" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Filter servers by the region where they are located.</div>
		<div id="serverRegionSelector" style="display:none;position:absolute;left: -518px;top:-270px;width:520px;height:auto;z-index:1000;background-color:#1E2022;border-radius:5px;padding:10px;">
			<div style="text-align:center;margin-bottom:10px;">
				<p style="font-weight:bold;font-size:20px;padding-bottom:0px!important;">RoPro Server Region Selector</p>
				<p style="font-size:13px;">You should have a faster connection in datacenters close to you!</p>
			</div>
			<iframe id="globeFrameMini" style="border:0;width:500px;height:500px;" frameborder="0" scrolling="no" class="active" src="https://ropro.io/globe/?placeid=286090429"></iframe>
		</div>
		<p style="display:inline-block;">Server Region</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Server_Region2.svg')}" style="float:right;width:23px;margin-top:0px;margin-right:5px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="bestConnectionButtonMini" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>RoPro will choose servers which are likely to have the fastest connection for you.</div>
		<p style="display:inline-block;">Best Connection</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Best_Connection3.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="newestServersButtonMini" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Show the most recently launched servers first.</div>
		<p style="display:inline-block;">Newest Servers</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Newest_Server.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>
	<div class="server-filter-option" id="oldestServersButtonMini" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Show servers with the longest uptime first.</div>
		<p style="display:inline-block;">Oldest Servers</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Oldest_Server_2.svg')}" style="float:right;width:26px;margin-top:0px;margin-right:6px;filter:invert(0.8);"></div>
	<!--<div class="server-filter-option" id="serverVersionButtonMini" style="width:190px;height:30px;background-color:#393B3D;margin:5px;border-radius:5px;padding:3px;">
		<div style="display:none;position:absolute;top:-10px;left:200px;width:auto;inline-size:200px;;height:auto;background-color:#191B1D;color:white;padding:5px;border-radius:5px;white-space: pre-wrap;font-size:14px;" class="filter-tooltip"><div style="font-weight:800;text-decoration:underline;"><img src="${chrome.runtime.getURL('/images/plus_icon.png')}" style="width:15px;margin-right:5px;margin-top:-2.7px;">Subscribers Only</div>Filter servers by the update version of this experience when they were launched.</div>
		<p style="display:inline-block;">Server Version</p><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Server_Version2.svg')}" style="float:right;width:30px;margin-top:-2.5px;margin-right:2px;filter:invert(0.8);"></div>-->
</div>
         </div>`
searchBarHTML = `<div id="searchServerMain" style="margin-top:5px;margin-bottom:25px;height:45px;position:relative;">
					<div style="float:left;width:400px;margin-left:5px;margin-bottom:10px;" class="input-group">
					<form><input autofocus="" id="searchServer" class="form-control input-field" type="text" placeholder="Enter Exact Username..." maxlength="120" autocomplete="off" value="">
					<div style="font-size:12px;color:red;" id="serverSearchError"></div>
					<div style="font-size:12px;color:green;" id="serverSearchSuccess"></div>
					</form>
					<div class="input-group-btn"><button style="margin:0px;margin-left:2px;" class="input-addon-btn" type="submit">
					<span class="icon-nav-search"></span>
					</button></div></div>
					<span id="searchServerButton" style="padding:10px;margin-bottom:10px;float-left;" class="btn-secondary-md btn-more rbx-private-server-create-button">Search</span>
					</div>`
gameRankHTML = `<div id="gameRankDiv" style="z-index:1000;position:absolute;margin-bottom:6px;visibility:initial;bottom:-10px;left:5px;"><div style="margin-left:2px;width:155px;height:24px;background-color:#0084DD;border-radius:150px;"><img style="left:0px;top:0px;position:absolute;margin-right:5px;" src="${chrome.runtime.getURL('/images/value_icon_medium.png')}" height="24px"><h5 id="valueAmount" style="font-size:15px;position:absolute;right:5px;top:-2px;width:100%;text-align:right;">Rank Today: #4</h5></div></div>`
roproVoiceServersHTML = `<div id="roproVoiceServersContainer" class="ropro-voice-servers-container stack" style="margin-top:15px;"><div class="container-header" style="margin-bottom:0px;"><h3>RoPro Voice Servers</h3><span class="tooltip-container" style="margin-top:3px;"><span class="ropro-voice-servers-info icon-moreinfo" style="cursor:pointer;margin-left:5px;position:relative;margin-top:0px;"><div style="display:none;position:absolute;left:-135px;top:-240px;font-size:13px;width:300px;background-color:#191B1D;padding:10px;border-radius:10px;" class="dark-theme ropro-voice-servers-info-tooltip"><div style="font-weight:bold;text-align:center;font-size:14px;">What are RoPro Voice Servers?</div><div style="font-size:13px;margin-top:10px;background-color:#222527;padding:10px;border-radius:10px;"> <b>RoPro Voice Servers</b> are private Roblox servers owned by RoPro on popular voice enabled experiences. These servers are only accessible to RoPro users with Voice Chat enabled on their Roblox account.<br><br><img style="margin-top:-3px;margin-left:0px;width:15px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}"> RoPro Plus and <img style="margin-top:-3px;margin-left:0px;width:15px;" src="${chrome.runtime.getURL('/images/rex_icon.png')}"> RoPro Rex users can access thousands of premium RoPro Voice Servers! <a href="https://ropro.io?upgrade" target="_blank"><u><b>Upgrade Here</b></u></a></div></div></span></span><button type="button" class="btn-more rbx-refresh refresh-link-icon btn-control-xs btn-min-width" style="margin-top:7px;">Refresh</button></div><ul style="padding:0px;margin-top:0px;margin-bottom:0px;" id="ropro-voice-servers-list" class="section ropro-voice-servers-list card-list section-content-off"></ul><div style="margin-bottom:10px;"><button type="button" class="rbx-running-games-load-more btn-control-md btn-full-width">Load More</button></div></div>`
mostRecentServerHTML = `<div id="roproMostRecentServerContainer" class="stack" data-showshutdown="false"><div class="container-header"><h3>My Recent Server</h3></div><ul style="padding:0px;margin-top:20px;border-radius:8px;" id="rbx-recent-server-box" class="section rbx-friends-game-server-item-container stack-list section-content-off"><p class="no-servers-message">No Recent Server Found.</p></ul><div class="rbx-friends-running-games-footer"></div><div class="rbx-friends-game-server-template"><li class="stack-row rbx-friends-game-server-item"><div class="section-header"><div class="link-menu rbx-friends-game-server-menu"></div></div><div class="section-left rbx-friends-game-server-details"><div class="text-info rbx-game-status rbx-friends-game-server-status"></div><div class="rbx-friends-game-server-alert"><span class="icon-remove"></span>Slow Game</div><a class="btn-full-width btn-control-xs rbx-friends-game-server-join" href="#" data-placeid="">Join</a></div><div class="section-right rbx-friends-game-server-players"></div></li></div></div>`
commentsPaneHTML = `<div class="tab-pane comments" id="comments" style="margin-top:20px;overflow:visible;"><div id="rbx-game-passes" style="overflow:visible;" class="container-list game-dev-store game-passes"><div>
<div id="AjaxCommentsContainer" class="comments-container">
<div class="container-header">
<h3>RoPro Comments</h3>
<div id="sortDropdown" style="overflow:visible;margin-top:-5px;float:right;width:80px;" class="input-group-btn group-dropdown">
<button type="button" style="border-radius:0px;border:none;" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
<span id="sortLabel" class="rbx-selection-label ng-binding" style="width:40px;overflow:hidden;font-size:14px;" ng-bind="layout.selectedTab.label">New</span> 
<span class="icon-down-16x16"></span></button>
<ul style="max-height:1000px;" id="sortOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu"> 
<li>
	<a class="genreChoice" sort="Newest">
		<span ng-bind="tab.label" class="ng-binding">New</span>
	</a></li><li>
	<a class="genreChoice" sort="Top">
		<span ng-bind="tab.label" class="ng-binding">Top</span>
	</a></li></ul></div>
	<div id="tagDropdown" style="overflow:visible;margin-top:-5px;margin-left:0px;float:right;width:170px;margin-left:10px;" class="input-group-btn group-dropdown">
	<button type="button" style="border-radius:0px;border:none;" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
	<span id="tagLabel" class="rbx-selection-label ng-binding" style="width:130px;overflow:hidden;font-size:14px;" ng-bind="layout.selectedTab.label">Filter Comments</span> 
	<span class="icon-down-16x16"></span></button>
	<ul style="max-height:1000px;" id="sortOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu"> 
	<li>
					<a class="genreChoice" tag="All">
						<div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:Gray;float:left;"></div><span ng-bind="tab.label" class="ng-binding">All</span>
					</a></li><li>
					<a class="genreChoice" tag="Tips &amp; Tricks">
						<div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:Red;float:left;"></div><span ng-bind="tab.label" class="ng-binding">Tips &amp; Tricks</span>
					</a></li><li>
					<a class="genreChoice" tag="Gamecodes">
						<div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:Orange;float:left;"></div><span ng-bind="tab.label" class="ng-binding">Gamecodes</span>
					</a></li><li>
					<a class="genreChoice" tag="Feedback">
						<span ng-bind="tab.label" class="ng-binding"><div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:Yellow;float:left;"></div>Feedback</span>
					</a></li><li>
					<a class="genreChoice" tag="Bug Reports">
						<div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:Green;float:left;"></div><span ng-bind="tab.label" class="ng-binding">Bug Reports</span>
					</a></li><li>
					<a class="genreChoice" tag="Invites">
						<span ng-bind="tab.label" class="ng-binding"><div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:Blue;float:left;"></div>Invites</span>
					</a></li><li>
					<a class="genreChoice" tag="Find Friends">
						<div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:Indigo;float:left;"></div><span ng-bind="tab.label" class="ng-binding">Find Friends</span>
					</a></li><li>
					<a class="genreChoice" tag="Other">
						<div style="margin:3px;margin-right:10px;border-radius:5px;width:15px;height:15px;background-color:DarkViolet;float:left;"></div><span ng-bind="tab.label" class="ng-binding">Other</span>
					</a></li></ul></div>
</div>
        <div class="section-content AddAComment">
            <div class="comment-form">
                <form class="form-horizontal ng-pristine ng-valid" role="form">
                    <div class="form-group">
                        <textarea id="messageBox" class="form-control input-field rbx-comment-input blur" placeholder="Post a tip, gamecode, feedback, invite link, etc." rows="1"></textarea>
                        <div class="rbx-comment-msgs">
                            <span id="commentError" class="rbx-comment-error text-error text-overflow" style="display: block;"></span>
                            <span id="commentCharacterCount" class="rbx-comment-count small text"></span>
                        </div>
                    </div>
                    <button id="postComment" type="button" class="btn-secondary-md rbx-post-comment">${stripTags(chrome.i18n.getMessage("PostComment"))}</button>
                </form>
            </div>
            <div id="commentsmain" class="comments vlist">
            </div>

            <div class="loader-template">
<div class="loading-animated">
    <div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
            </div>

            <div id="seemore" style="display:block;" class="ajax-comments-more-button-container">
                <button type="button" class="btn-control-sm rbx-comments-see-more">${stripTags(chrome.i18n.getMessage("SeeMore"))}</button>
            </div>

        </div>
    </div>
</div></div></div>`
randomServerHTML = `<button type="button" style="width:66px;min-width:66px;margin-left:3px;position:relative;" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width random-server-button"><div class="random-server-tooltip" style="position:absolute;width:115px;background-color:#191B1D;color:white;top:-30px;right:-25px;font-size:13px;padding:5px;border-radius:5px;z-index:10000;display:none;">Server Hop</div><span style="filter:invert(1);background-image:url(${chrome.runtime.getURL('/images/random_server.svg')});background-size: 36px 36px;" class="icon-common-play"></span></button>`
randomServerOverlayHTML = `<div id="simplemodal-overlay" class="simplemodal-overlay" style="background-color: rgb(0, 0, 0); opacity: 0.8; height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 1041;"></div>`
randomServerModalHTML = `<div id="simplemodal-container" class="simplemodal-container" style="position: fixed; z-index: 1042; height: 231px; width: 400px;  left: calc(50% - 200px); top: calc(50% - 115.5px);"><a class="modalCloseImg simplemodal-close" title="Close"></a><div tabindex="-1" class="simplemodal-wrap" style="height: 100%; outline: 0px; width: 100%; overflow: visible;"><div id="modal-confirmation" class="modal-confirmation noImage protocolhandler-are-you-installed-modal simplemodal-data" data-modal-type="confirmation" style="display: block;"><div id="modal-dialog" class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"> <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span> </button><h5 class="modal-title"></h5></div><div class="modal-body"><div class="modal-top-body"><div class="modal-message"><img style="filter: drop-shadow(rgb(57,59,61) 2px 2px 2px);" src="${chrome.runtime.getURL('/images/ropro_logo.png')}" width="150" alt="R"><p>Searching for a random server...</p></div><div class="modal-image-container roblox-item-image" data-image-size="medium" data-no-overlays="" data-no-click=""><img class="modal-thumb" alt="generic image"></div><div class="modal-checkbox checkbox" style="display: none;"><input id="modal-checkbox-input" type="checkbox"> <label for="modal-checkbox-input"></label></div></div><div style="display:none;" class="modal-btns"><a href="" id="confirm-btn" class="btn-primary-md">Download Studio</a> <a href="" id="decline-btn" class="btn-control-md" style="display: none;">No</a></div><div style="display:block;" class="loading modal-processing"><img class="loading-default" src="https://images.rbxcdn.com/4bed93c91f909002b1f17f05c0ce13d1.gif" alt="Processing..."></div></div><div class="modal-footer text-footer" style="display: block;"></div></div></div></div></div></div>`
voiceServerModalHTML = `<div id="simplemodal-container" class="simplemodal-container" style="position: fixed; z-index: 1042; height: 231px; width: 400px;  left: calc(50% - 200px); top: calc(50% - 115.5px);"><a class="modalCloseImg simplemodal-close" title="Close"></a><div tabindex="-1" class="simplemodal-wrap" style="height: 100%; outline: 0px; width: 100%; overflow: visible;"><div id="modal-confirmation" class="modal-confirmation noImage protocolhandler-are-you-installed-modal simplemodal-data" data-modal-type="confirmation" style="display: block;"><div id="modal-dialog" class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"> <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span> </button><h5 class="modal-title"></h5></div><div class="modal-body"><div class="modal-top-body"><div class="modal-message"><img style="filter: drop-shadow(rgb(57,59,61) 2px 2px 2px);" src="${chrome.runtime.getURL('/images/ropro_logo.png')}" width="150" alt="R"><p class="voice-server-loading-text"></p></div><div class="modal-image-container roblox-item-image" data-image-size="medium" data-no-overlays="" data-no-click=""><img class="modal-thumb" alt="generic image"></div><div class="modal-checkbox checkbox" style="display: none;"><input id="modal-checkbox-input" type="checkbox"> <label for="modal-checkbox-input"></label></div></div><div style="display:none;" class="modal-btns"><a href="" id="confirm-btn" class="btn-primary-md">Download Studio</a> <a href="" id="decline-btn" class="btn-control-md" style="display: none;">No</a></div><div style="display:block;" class="loading modal-processing"><img class="loading-default" src="https://images.rbxcdn.com/4bed93c91f909002b1f17f05c0ce13d1.gif" alt="Processing..."></div></div><div class="modal-footer text-footer" style="display: block;"></div></div></div></div></div></div>`
cloudPlayHTML = `<button type="button" style="width:66px;min-width:66px;margin-left:3px;position:relative;" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width random-server-button"><div class="random-server-tooltip" style="position:absolute;width:115px;background-color:#191B1D;color:white;top:-30px;right:-25px;font-size:13px;padding:5px;border-radius:5px;z-index:10000;display:none;">Server Hop</div><span style="filter:invert(1);background-image:url(${chrome.runtime.getURL('/images/random_server.svg')});background-size: 36px 36px;" class="icon-common-play"></span></button>`

var pageIndex = 0;
var customServerList = null;
var globalGameId = 0;
var hasFastServers = false;
var myUniverseId = 0;
var serverInfoQueue = [];

function fetchVoiceServers(placeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getVoiceServers.php?placeid=" + parseInt(placeId)},
			function(data) {
					resolve(data)
			})
	})
}

function fetchVoiceServer(placeId, serverId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getVoiceServer.php?placeid=" + parseInt(placeId) + "&serverid=" + parseInt(serverId)},
			function(data) {
					resolve(data)
			})
	})
}

function fetchPlayTime(gameID, time, offset = 0) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getPlayTime.php?universeid=" + gameID + "&time=" + time + "&offset=" + offset},
			function(data) {
					resolve(data)
			})
	})
}

function fetchServerFilterMaxPlayers(gameID, maxPlayers) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterMaxPlayers", gameID: gameID, count: maxPlayers}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchLowPingServers(gameID, startIndex, maxServers) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetLowPingServers", gameID: gameID, startIndex: startIndex, maxServers: maxServers}, 
			function(data) {
				resolve(data)
		})
	})
}

async function fetchServerInfo(placeID, servers) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostURL", wrap_json: true, url:"https://api.ropro.io/getServerInfo.php?form", jsonData: {'placeID':placeID, 'servers': servers}}, 
			function(data) {
				resolve(data)
			}
		)
	})
}

function fetchServerFilterReverseOrder(gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterReverseOrder", gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerFilterRandomShuffle(gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterRandomShuffle", gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerFilterNotFull(gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterNotFull", gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerFilterRegion(gameID, serverLocation) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterRegion", gameID: gameID, serverLocation: serverLocation}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerFilterBestConnection(gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterBestConnection", gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerFilterNewestServers(gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterNewestServers", gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerFilterOldestServers(gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "ServerFilterOldestServers", gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerSearch(username, gameID) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetUserServer", username: username, gameID: gameID}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerPage(gameID, index) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://www.roblox.com/games/getgameinstancesjson?placeId=" + gameID + "&startIndex=" + index},
			function(data) {
				resolve(data)
		})
	})
}

function fetchSocialLinks(myUniverseId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games/"+myUniverseId+"/social-links/list"}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchDiscordID(discordUrl) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getDiscordID.php?link=" + discordUrl}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchInvite(key) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getInvite.php?key=" + key}, 
			function(data) {
				resolve(data)
		})
	})
}

function createInvite(universeid, serverid) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/createInvite.php?universeid=" + universeid + "&serverid=" + serverid}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchGameInfo(myUniverseId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games?universeIds=" + myUniverseId}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchPlaceInfo(placeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games/multiget-place-details?placeIds=" + placeId}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchVotes(myUniverseId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games/votes?universeIds=" + myUniverseId}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchFavorites(myUniverseId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://games.roblox.com/v1/games/" + myUniverseId + "/favorites/count"}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchServerStatus(placeId, gameId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://assetgame.roblox.com/Game/PlaceLauncher.ashx?request=RequestGameJob&placeId="+placeId+"&gameId="+gameId}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchRandomServer(placeId) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetRandomServer", gameID: placeId}, 
			function(data) {
				resolve(data)
		})
	})
}

function launchCloudPlay(serverID = null, accessCode = null) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "LaunchCloudPlay", placeID: globalGameId, serverID: serverID, accessCode: accessCode}, 
			function(data) {
				resolve(data)
		})
	})
}

function fetchThumbnailBatch(batch) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "PostValidatedURL", url:"https://thumbnails.roblox.com/v1/batch", jsonData: JSON.stringify(batch)}, 
			function(data) {
				resolve(data)
			})
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

function fetchSetting(setting) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetSetting", setting: setting}, 
			function(data) {
				resolve(data)
			}
		)
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

function checkVerification() {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "CheckVerification"}, 
			function(data) {
				resolve(data)
			}
		)
	})
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

async function getPlayerThumbnails(playerTokens, thumbnailType = "AvatarHeadshot") {
	for (var i = 0; i < playerTokens.length; i += 100) {
		var batch = []
		var chunk = playerTokens.slice(i, i + 100)
		for (var j = 0; j < chunk.length; j++) {
			batch.push({format: "png",
			requestId: "0:" + chunk[j] + ":AvatarHeadshot:150x150:png:regular",
			size: "150x150",
			targetId: 0,
			token: chunk[j],
			type: thumbnailType})
		}
		thumbnails = await fetchThumbnailBatch(batch)
		for (var k = 0; k < thumbnails.data.length; k++) {
			playerToken = thumbnails.data[k].requestId.split(":")[1]
			$('.ropro-player-thumbnail-' + playerToken).attr("src", thumbnails.data[k].imageUrl)
		}
	}
}

var loadMoreInitialized = false

async function loadServerPage(gameID, index, reverse){
	serversHTML = ""
	serverPage = customServerList
	if (document.getElementsByClassName('btr-server-pager').length > 0) {
		document.getElementsByClassName('btr-server-pager')[0].style.display = "none"
	}
	isCardList = $('.card-list.rbx-game-server-item-container').length > 0
	var playerTokens = []
	for (i = index; i < Math.min(serverPage.length, index + 8); i++) {
		server = serverPage[i]
		gameId = stripTags(server.id)
		placeId = parseInt(globalGameId)
		playerCount = server.playing + " of " + server.maxPlayers + " people max"
		playersHTML = ""
		for (j = 0; j < Math.min(server.playerTokens.length, 5); j++) {
			playerToken = stripTags(server.playerTokens[j])
			if (isCardList) {
				playerHTML = `<span class="avatar avatar-headshot-md player-avatar"><span class="thumbnail-2d-container avatar-card-image"><img class="ropro-player-thumbnail-${stripTags(playerToken)}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="" title=""></span></span>`
			} else {
				playerHTML = `<span class="special-span avatar avatar-headshot-sm player-avatar"><a class="avatar-card-link"><img class="ropro-player-thumbnail-${stripTags(playerToken)} avatar-card-image"></a></span>`
			}
			playersHTML += playerHTML
			playerTokens.push(playerToken)
		}
		if (isCardList) {
			serversHTML += `<li class="rbx-game-server-item col-md-3 col-sm-4 col-xs-6" data-gameid="${gameId}" data-placeid="${placeId}"><div class="card-item">
			<div class="player-thumbnails-container">${playersHTML}${server.playing > 5 ? `<span class="avatar avatar-headshot-md player-avatar hidden-players-placeholder">+${server.playing - 5}</span>` : ``}</div>
			<div class="rbx-game-server-details game-server-details">
			<div class="text-info rbx-game-status rbx-game-server-status'">${playerCount}</div>
			<div class="server-player-count-gauge border"><div class="gauge-inner-bar border" style="width: ${Math.round(server.playing / server.maxPlayers * 100)}%;"></div></div>
			<span data-placeid="${placeId}"><button type="button" class="btn-full-width btn-control-xs  rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width" onclick='if(!document.body.classList.contains("ropro-cloud-play-activated")) {Roblox.GameLauncher.joinGameInstance(${placeId}, "${gameId}")}'>Join</button></span></div></div></li>`
		} else {
			serversHTML += `<li class="stack-row rbx-game-server-item ropro-checked" data-gameid="${gameId}" data-placeid="${placeId}"><div class="section-header">
							<div class="link-menu rbx-game-server-menu"></div></div>
							<div class="section-left rbx-game-server-details">
								<div class="text-info rbx-game-status rbx-game-server-status">${playerCount}</div>
								<div class="rbx-game-server-alert hidden"><span class="icon-remove"></span></div>
								<a class="btn-full-width btn-control-xs rbx-game-server-join" href="#" data-gameid="${gameId}" data-placeid="${placeId}" onclick='if(!document.body.classList.contains("ropro-cloud-play-activated")) {Roblox.GameLauncher.joinGameInstance(${placeId}, "${gameId}")}'>Join</a></div>
							<div class="section-right rbx-game-server-players">${playersHTML}</div></li>`
		}
	}
	getPlayerThumbnails(playerTokens)
	pageIndex = index
	document.getElementById('maxPlayersLoadingBar').style.display = "none"
	$('#rbx-game-server-item-container').html(serversHTML)
	if (customServerList == null || pageIndex + 10 < customServerList.length) {
		if (document.getElementsByClassName('ropro-running-games-footer').length == 0) {
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			div = document.createElement('div')
			div.innerHTML = `<div class="ropro-running-games-footer"><button type="button" id="loadMoreButton" class="btn-control-sm btn-full-width" style="display: block;">Load More</button></div>`
			document.getElementsByClassName('rbx-running-games-footer')[0].parentNode.appendChild(div.childNodes[0])
		} else {
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			document.getElementsByClassName('ropro-running-games-footer')[0].style.display = "block"
		}
	} else {
		if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
			document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
		}
		if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
			document.getElementsByClassName('ropro-running-games-footer')[0].style.display = "none"
		}
	}
	if (loadMoreInitialized == false) {
		$('#loadMoreButton').click(function(){
			loadServerPage(gameID, pageIndex + 10, false)
		})
		loadMoreInitialized = true
	}
	$('.rbx-refresh').click(function() {
		if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
			document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "block"
		}
		if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
			document.getElementsByClassName('ropro-running-games-footer')[0].style.display = "none"
		}
	})
}

function addRandomServerButton() {
	var randomServerButtonInterval = setInterval(function() {
		if (document.getElementsByClassName('btn-common-play-game-lg btn-primary-md').length > 0) {
			clearInterval(randomServerButtonInterval)
			container = document.getElementById('game-details-play-button-container')
			if (container.getElementsByClassName('error-message').length == 0 && container.getElementsByClassName('icon-robux-white').length == 0) {
				div = document.createElement('div')
				div.innerHTML = randomServerHTML
				randomServerButton = div.childNodes[0]
				container.appendChild(randomServerButton)
				randomServerButton.addEventListener('click', async function() {
					outer = document.getElementById('rbx-body')
					modalcontainer = document.createElement('div')
					modalcontainer.id = "randomGameModalContainer"
					outer.appendChild(modalcontainer)
					overlay = document.createElement('div')
					overlay.innerHTML = randomServerOverlayHTML
					modal = document.createElement('div')
					modal.innerHTML = randomServerModalHTML
					modalcontainer.appendChild(overlay)
					modalcontainer.appendChild(modal)
					modalcontainer.getElementsByClassName('close')[0].addEventListener('click', function() {
						document.getElementById('randomGameModalContainer').remove()
					})
					server = await fetchRandomServer(globalGameId)
					document.getElementById('randomGameModalContainer').remove()
					if (server != null && server.hasOwnProperty('id')) {
						if (cloudPlayActive) {
							launchCloudPlay(stripTags(server.id))
						} else {
							div = document.createElement('div')
							div.setAttribute(`onclick`, `if(!document.body.classList.contains("ropro-cloud-play-activated")) {Roblox.GameLauncher.joinGameInstance(${parseInt(globalGameId)}, "${stripTags(server.id)}")}`)
							div.click()	
						}
					}
				})
				if (window.location.hash == "#ropro-random-server") {
					async function doClick() {
						clicked = await getLocalStorage('quickSearchLinkClicked')
						if (typeof clicked != 'undefined' && clicked != null && clicked > Date.now() - 15000) {
							randomServerButton.click()
						}
					}
					doClick()
				} else if (window.location.hash == "#ropro-quick-play") {
					async function doClick() {
						clicked = await getLocalStorage('quickSearchLinkClicked')
						if (typeof clicked != 'undefined' && clicked != null && clicked > Date.now() - 15000) {
							randomServerButton.parentNode.getElementsByTagName('button')[0].click()
						}
					}
					doClick()
				}
			}
		}
	}, 50)
}

function addCloudPlayButton() {
	document.body.classList.add('ropro-cloud-play-enabled')
	var cloudPlayButtonInterval1 = setInterval(async function() {
		if (document.getElementById('game-age-recommendation-details') != null) {
			clearInterval(cloudPlayButtonInterval1)
			var div = document.createElement('div')
			div.innerHTML = `<div class="ropro-cloud-play-container" style="float:right;background-color:${theme == "dark" ? "#383B3D" : "#DEE1E3"};padding:15px;border-radius:8px;cursor:pointer;">
				<div class="tooltip-container" style="position:relative;">
					<div class="ropro-cloud-play-button">
						<a>
						<img class="ropro-cloud-play-icon-active" src="${chrome.runtime.getURL('/images/cloud_play_active.svg')}" style="height:23px;">
						<img class="ropro-cloud-play-icon-inactive" src="${chrome.runtime.getURL('/images/cloud_play_inactive.svg')}" style="height:23px;filter:invert(0);">
						</a>
					</div>
					<div style="z-index:1000;background-color:${theme == "dark" ? '#191B1D' : '#DEE1E3'};position:absolute;bottom:-325px;left:-70px;padding:10px;width:auto;border-radius:10px;" class="ropro-cloud-play-tooltip">
					<div style="font-size:14px;margin:auto;font-weight:600;margin-bottom:3px;width:180px;text-align:center;">RoPro Cloud Play</div>
					<p style="font-size:12px;width:auto;height:auto;white-space: normal;text-align:left;">• Launch this game in the cloud via now.gg.<br>• Cloud Play is rendered through servers in the cloud, allowing any device to play Roblox in full graphics mode.<br>• Note: RoPro Cloud Play uses a now.gg affiliate link, and RoPro earns a percentage of revenue from advertisements which run on now.gg (after cloud server costs).</p>
					</div>
				</div>
			</div>`
			insertAfter(div.childNodes[0], document.getElementById('game-age-recommendation-details'))
			var button = document.getElementsByClassName('ropro-cloud-play-container')[0]
			button.addEventListener('click', async function() {
				if (this.getElementsByClassName('ropro-cloud-play-button')[0].classList.contains('active')) {
					this.getElementsByClassName('ropro-cloud-play-button')[0].classList.remove('active')
					document.body.classList.remove("ropro-cloud-play-activated")
					cloudPlayActive = false
				} else {
					this.getElementsByClassName('ropro-cloud-play-button')[0].classList.add('active')
					document.body.classList.add("ropro-cloud-play-activated")
					cloudPlayActive = true
				}
			})
		}
	}, 50)
	var cloudPlayButtonInterval2 = setInterval(function() {
		if (document.getElementsByClassName('btn-common-play-game-lg').length > 0) {
			clearInterval(cloudPlayButtonInterval2)
			document.getElementsByClassName('btn-common-play-game-lg')[0].addEventListener('click', function(event) {
				if (cloudPlayActive && this.getElementsByClassName('btn-text').length == 0) {
					event.stopPropagation()
					launchCloudPlay()
				}
			})
		}
	}, 50)
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function addServerFiltersMini(placeId, maxPlayerCount) {
	if (document.getElementById('serverFiltersDropdownMini') != null) { 
		return
	}
}

function addServerFilters(placeId, maxPlayerCount) {
	if (document.getElementById('serverFiltersDropdown') != null) { 
		return
	}

	serverContainer = document.getElementById('rbx-running-games')
	serverFiltersDiv = document.createElement('div')
	serverFiltersDiv.innerHTML = serverFiltersHTML
	serverContainer.getElementsByClassName('container-header')[0].style.position = "relative"
	serverContainer.getElementsByClassName('container-header')[0].appendChild(serverFiltersDiv.childNodes[0])

	async function checkSettings() {
		if (await fetchSetting("serverFilters") == false) {
			document.getElementById('roproServerFiltersButton').style.display = "none"
			document.getElementById('roproServerFiltersMiniButton').style.display = "none"
		}
	}

	checkSettings()
	serverFiltersDropdown = document.getElementById('serverFiltersDropdown')
	serverFiltersDropdown.addEventListener('click', function() {
		if (document.getElementById('serverFiltersDropdownBox').style.display == "block") {
			document.getElementById('serverFiltersDropdownBox').style.display = "none";
			$('.server-filter-option.active').removeClass('active')
		} else {
			document.getElementById('serverFiltersDropdownBox').style.display = "block";
		}
	})

	document.getElementById('serverRegionButton').addEventListener('mouseenter', function() {
		if (!document.getElementById('globeFrame').classList.contains('active')) {
			document.getElementById('globeFrame').classList.add('active')
			document.getElementById('globeFrame').src = ("https://ropro.io/globe/?placeid=" + parseInt(placeId) + "" + (theme == "light" ? "&light" : ""))
		}
	})

	document.getElementById('serverRegionButton').addEventListener('click', function() {
		this.classList.toggle('active')
	})

	document.getElementById('serverRegionButtonMini').addEventListener('mouseenter', function() {
		if (!document.getElementById('globeFrameMini').classList.contains('active')) {
			document.getElementById('globeFrameMini').classList.add('active')
			document.getElementById('globeFrameMini').src = ("https://ropro.io/globe/?placeid=" + parseInt(placeId) + "" + (theme == "light" ? "&light" : ""))
		}
	})

	document.getElementById('serverRegionButtonMini').addEventListener('click', function() {
		this.classList.toggle('active')
	})

	document.getElementById('maxPlayersButton').addEventListener('click', function() {
		this.classList.toggle('active')
	})

	document.getElementById('maxPlayersButtonMini').addEventListener('click', function() {
		this.classList.toggle('active')
	})

	document.getElementById('reverseOrderButton').addEventListener('click', async function() {
		if (document.getElementById('loadingBar') == null) {
			div = document.createElement('div')
			div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
			document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
		}
		document.getElementById('rbx-game-server-item-container').innerHTML = ``
		if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
			document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
		}
		if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
			loadMoreInitialized = false
			document.getElementsByClassName('ropro-running-games-footer')[0].remove()
		}
		document.getElementById('serverFiltersDropdownBox').style.display = "none";
		document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
		$('.server-filter-option.active').removeClass('active')
		customServerList = await fetchServerFilterReverseOrder(globalGameId)
		loadServerPage(globalGameId, 0, true)
		if (document.getElementById('loadingBar') != null) {
			document.getElementById('loadingBar').remove()
		}
	})

	document.getElementById('reverseOrderButtonMini').addEventListener('click', async function() {
		document.getElementById('reverseOrderButton').click()
		document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
	})

	document.getElementById('randomShuffleButton').addEventListener('click', async function() {
		if (document.getElementById('loadingBar') == null) {
			div = document.createElement('div')
			div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
			document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
		}
		document.getElementById('rbx-game-server-item-container').innerHTML = ``
		if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
			document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
		}
		if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
			loadMoreInitialized = false
			document.getElementsByClassName('ropro-running-games-footer')[0].remove()
		}
		document.getElementById('serverFiltersDropdownBox').style.display = "none";
		document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
		$('.server-filter-option.active').removeClass('active')
		customServerList = await fetchServerFilterRandomShuffle(placeId)
		shuffleArray(customServerList)
		loadServerPage(placeId, 0, false)
		if (document.getElementById('loadingBar') != null) {
			document.getElementById('loadingBar').remove()
		}
	})

	document.getElementById('randomShuffleButtonMini').addEventListener('click', async function() {
		document.getElementById('randomShuffleButton').click()
		document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
	})

	document.getElementById('notFullButton').addEventListener('click', async function() {
		if (document.getElementById('loadingBar') == null) {
			div = document.createElement('div')
			div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
			document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
		}
		document.getElementById('rbx-game-server-item-container').innerHTML = ``
		if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
			document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
		}
		if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
			loadMoreInitialized = false
			document.getElementsByClassName('ropro-running-games-footer')[0].remove()
		}
		document.getElementById('serverFiltersDropdownBox').style.display = "none";
		document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
		$('.server-filter-option.active').removeClass('active')
		customServerList = await fetchServerFilterMaxPlayers(parseInt(placeId), maxPlayerCount - 1)
		loadServerPage(placeId, 0, false)
		if (document.getElementById('loadingBar') != null) {
			document.getElementById('loadingBar').remove()
		}
	})

	document.getElementById('notFullButtonMini').addEventListener('click', async function() {
		document.getElementById('notFullButton').click()
		document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
	})

	document.getElementById('bestConnectionButton').addEventListener('click', async function() {
		if (await fetchSetting("moreServerFilters")) {
			if (document.getElementById('loadingBar') == null) {
				div = document.createElement('div')
				div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
				document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
			}
			document.getElementById('rbx-game-server-item-container').innerHTML = ``
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
				loadMoreInitialized = false
				document.getElementsByClassName('ropro-running-games-footer')[0].remove()
			}
			document.getElementById('serverFiltersDropdownBox').style.display = "none";
			document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
			$('.server-filter-option.active').removeClass('active')
			customServerList = await fetchServerFilterBestConnection(globalGameId)
			loadServerPage(globalGameId, 0, false)
			if (document.getElementById('loadingBar') != null) {
				document.getElementById('loadingBar').remove()
			}
		} else {
			upgradeModalServerFilters()
		}
	})

	document.getElementById('bestConnectionButtonMini').addEventListener('click', async function() {
		document.getElementById('bestConnectionButton').click()
		document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
	})

	document.getElementById('newestServersButton').addEventListener('click', async function() {
		if (await fetchSetting("moreServerFilters")) {
			if (document.getElementById('loadingBar') == null) {
				div = document.createElement('div')
				div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
				document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
			}
			document.getElementById('rbx-game-server-item-container').innerHTML = ``
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
				loadMoreInitialized = false
				document.getElementsByClassName('ropro-running-games-footer')[0].remove()
			}
			document.getElementById('serverFiltersDropdownBox').style.display = "none";
			document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
			$('.server-filter-option.active').removeClass('active')
			customServerList = await fetchServerFilterNewestServers(globalGameId)
			loadServerPage(globalGameId, 0, false)
			if (document.getElementById('loadingBar') != null) {
				document.getElementById('loadingBar').remove()
			}
		} else {
			upgradeModalServerFilters()
		}
	})

	document.getElementById('newestServersButtonMini').addEventListener('click', async function() {
		document.getElementById('newestServersButton').click()
		document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
	})

	document.getElementById('oldestServersButton').addEventListener('click', async function() {
		if (await fetchSetting("moreServerFilters")) {
			if (document.getElementById('loadingBar') == null) {
				div = document.createElement('div')
				div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
				document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
			}
			document.getElementById('rbx-game-server-item-container').innerHTML = ``
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
				loadMoreInitialized = false
				document.getElementsByClassName('ropro-running-games-footer')[0].remove()
			}
			document.getElementById('serverFiltersDropdownBox').style.display = "none";
			document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
			$('.server-filter-option.active').removeClass('active')
			customServerList = await fetchServerFilterOldestServers(globalGameId)
			loadServerPage(globalGameId, 0, false)
			if (document.getElementById('loadingBar') != null) {
				document.getElementById('loadingBar').remove()
			}
		} else {
			upgradeModalServerFilters()
		}
	})

	document.getElementById('oldestServersButtonMini').addEventListener('click', async function() {
		document.getElementById('oldestServersButton').click()
		document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
	})

	for (i = parseInt(maxPlayerCount) - 1; i >= 1; i--) {
		div = document.createElement('div')
		div.innerHTML = `<div class="max-players-selection" style="background-color:#232527;height:40px;width:177.5px;margin:5px;border-radius:5px;padding:10px;font-size:15px;font-weight:800;">${parseInt(i)} player${i == 1 ? '' : 's'} or less</div>`
		var button = div.childNodes[0]
		button.id = parseInt(i)
		document.getElementById('maxPlayersList').appendChild(button)
		div = document.createElement('div')
		div.innerHTML = `<div class="max-players-selection" style="background-color:#232527;height:40px;width:177.5px;margin:5px;border-radius:5px;padding:10px;font-size:15px;font-weight:800;">${parseInt(i)} player${i == 1 ? '' : 's'} or less</div>`
		var button2 = div.childNodes[0]
		button2.id = parseInt(i)
		document.getElementById('maxPlayersListMini').appendChild(button2)
		button.addEventListener('click', async function() {
			if (document.getElementById('loadingBar') == null) {
				div = document.createElement('div')
				div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
				document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
			}
			document.getElementById('rbx-game-server-item-container').innerHTML = ``
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
				loadMoreInitialized = false
				document.getElementsByClassName('ropro-running-games-footer')[0].remove()
			}
			document.getElementById('serverFiltersDropdownBox').style.display = "none";
			document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
			setTimeout(function() {
				$('.server-filter-option.active').removeClass('active')
			}, 100)
			document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
			customServerList = await fetchServerFilterMaxPlayers(globalGameId, parseInt(this.id))
			loadServerPage(placeId, 0, false)
			if (document.getElementById('loadingBar') != null) {
				document.getElementById('loadingBar').remove()
			}
		})
		button2.addEventListener('click', async function() {
			if (document.getElementById('loadingBar') == null) {
				div = document.createElement('div')
				div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
				document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
			}
			document.getElementById('rbx-game-server-item-container').innerHTML = ``
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
				loadMoreInitialized = false
				document.getElementsByClassName('ropro-running-games-footer')[0].remove()
			}
			document.getElementById('serverFiltersDropdownBox').style.display = "none";
			document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
			setTimeout(function() {
				$('.server-filter-option.active').removeClass('active')
			}, 100)
			document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
			customServerList = await fetchServerFilterMaxPlayers(globalGameId, parseInt(this.id))
			loadServerPage(placeId, 0, false)
			if (document.getElementById('loadingBar') != null) {
				document.getElementById('loadingBar').remove()
			}
		})
	}
}

async function liveCounters() {
	async function loadCounters() {
		votes = await fetchVotes(myUniverseId)
		favoritesData = await fetchFavorites(myUniverseId)
		votes = votes.data[0]
		upvotes = document.getElementById('vote-up-text')
		downvotes = document.getElementById('vote-down-text')
		favorites = document.getElementsByClassName('game-favorite-count')[0]
		if (upvotes != null) {
			upvotes.style.fontSize = "11px"
			upvotes.innerHTML = addCommas(parseInt(votes.upVotes))
		}
		if (downvotes != null) {
			downvotes.style.fontSize = "11px"
			downvotes.innerHTML = addCommas(parseInt(votes.downVotes))
		}
		if (favorites != null) {
			favorites.innerHTML = addCommas(parseInt(favoritesData.favoritesCount))
		}
	}
	if (await fetchSetting("liveLikeDislikeFavoriteCounters")) {
		setTimeout(function() {
			loadCounters()
		}, 1000)
		setInterval(function() {
			loadCounters()
		}, 10000)
	}
}

var timerArray = [];

function animateValue(obj, start, end, duration) {
    if (start === end) return;
    var range = end - start;
    var current = start;
    var increment = end > start? Math.ceil(Math.abs(end-start)/500) : -1 * Math.ceil(Math.abs(end-start)/500);
    var stepTime = Math.abs(Math.floor(duration / (range/Math.abs(increment))));
    timer = setInterval(function() {
		if (typeof currentVisits != 'undefined' && (start == currentVisits || start == currentPlayers)) {
			current += increment;
			obj.innerHTML = addCommas(current);
			if ((increment >= 0 && current >= end) || (increment < 0 && current <= end)) {
				clearInterval(timer);
				obj.innerHTML = addCommas(end);
				obj.setAttribute("title", stripTags(obj.innerHTML))
			}
		}
	}, stepTime);
	timerArray.push([obj, timer])
}

async function livePlaying() {
	liveVisitsSetting = await fetchSetting("liveVisits");
	livePlayingSetting = await fetchSetting("livePlayers");
	if (liveVisitsSetting || livePlayingSetting) {
		async function loadPlaying() {
			if (liveVisitsSetting || livePlayingSetting) {
				gameInfo = await fetchGameInfo(myUniverseId)
				playing = parseInt(gameInfo.data[0].playing)
				visits = parseInt(gameInfo.data[0].visits)
				playingObj = document.getElementsByClassName('game-stat')[0].getElementsByTagName('p')[1]
				visitsObj = document.getElementById('game-visits-count')
				if (playingObj.classList.contains('ropro-live-stats')) {
					oldPlaying = parseInt(playingObj.getAttribute('ropro-live-stats'))
					oldVisits = parseInt(visitsObj.getAttribute('ropro-live-stats'))
					playingObj.setAttribute('ropro-live-stats', oldPlaying)
					visitsObj.setAttribute('ropro-live-stats', oldVisits)
				} else {
					oldPlaying = playing
					oldVisits = visits
					playingObj.setAttribute('ropro-live-stats', oldPlaying)
					visitsObj.setAttribute('ropro-live-stats', oldVisits)
					playingObj.classList.add('ropro-live-stats')
					visitsObj.classList.add('ropro-live-stats')
				}
				if (livePlayingSetting) {
					playingObj.innerHTML = addCommas(oldPlaying)
				}
				if (liveVisitsSetting) {
					visitsObj.innerHTML = addCommas(oldVisits)
				}
				for (i = 0; i < timerArray.length; i++) {
					clearInterval(timerArray[i][1])
				}
				timerArray = []
				if (livePlaying) {
					animateValue(playingObj, oldPlaying, playing, 5000);
					currentPlayers = oldPlaying;
				}
				if (oldVisits <= visits && liveVisitsSetting) {
					animateValue(visitsObj, oldVisits, visits, 10000);
					currentVisits = oldVisits;
				}
			}
		}
		setTimeout(loadPlaying, 1000)
		setInterval(loadPlaying, 20000)
	}
}


function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }

async function addEmbeds(sectionContent, myUniverseId) {
	socialLinks = await fetchSocialLinks(myUniverseId)
	socialLinks = socialLinks.data
	for (i = 0; i < socialLinks.length; i++) {
		if (socialLinks[i].type == "Twitter" && await fetchSetting("gameTwitter") && typeof socialLinks[i] != 'undefined') {
			twitterUrl = socialLinks[i].url
			twitterProfile = stripTags(twitterUrl.split('://x.com/')[1])
			div = document.createElement('div')
			twitterFrameHTML = `<iframe src="https://ropro.io/twitterFrame.php?account=${stripTags(twitterProfile)}" width="342" height="100%" allowtransparency="true" frameborder="0" style="position:absolute;right:-250x;top:10px;" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>`
			div.innerHTML = twitterFrameHTML
			sectionContent.appendChild(div)
		}
	}
}

function formatTime(time) {
    suffix = " hr"
    if (time < 60) {
        suffix = " minute"
		if (time != 1) {
			suffix += "s"
		}
    } else {
		oldTime = time
        time = Math.floor(time / 60)
		if (time != 1) {
			suffix += "s"
		}
		if (time <= 99) {
			suffix += " " + (oldTime - (time * 60)) + " min"
			if ((oldTime - (time * 60)) != 1) {
				suffix += "s"
			}
		}
    }
    return time + suffix
}

function getDaysSince(date) {
    now = new Date().getTime()
    return Math.floor(Math.abs((date - now) / (24 * 60 * 60 * 1000)))
}

async function getTimePlayed(gameId, timePeriod, offset = 0) {
	playTime = await fetchPlayTime(gameId, timePeriod, offset)
	if (playTime.length > 0) {
		time = playTime[0].time_played
	} else {
		time = 0
	}
	timePlayedCache = await getLocalStorage("timePlayed")
	if (typeof timePlayedCache == "undefined") {
        timePlayedCache = {}
    }
	if (gameId in timePlayedCache && getDaysSince(timePlayedCache[gameId][1]) <= timePeriod) {
		time += timePlayedCache[gameId][0]
	}
	return time
}

function createUpgradeModal() {
    modalDiv = document.createElement('div')
    modalDiv.setAttribute('id', 'standardUpgradeModal')
    modalDiv.setAttribute('class', 'upgrade-modal')
	modalDiv.style.zIndex = 100000
    modalHTML = `<div id="standardUpgradeModal" style="z-index:10000;display:block;" class="upgrade-modal"><div style="background-color:#232527;position:absolute;width:500px;height:500px;left:-webkit-calc(50% - 250px);top:-webkit-calc(50% - 250px);" class="modal-content upgrade-modal-content">
    <span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
    <h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:20px;left:40px;"><img style="width:70px;left:0px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}"> RoPro Plus Feature</h2><div style="font-family:HCo Gotham SSm;color:white;font-size:20px;position:absolute;top:115px;left:200px;width:270px;">Sorting your playtime by Month, Year, and All Time is only available for<br><b><img style="width:20px;margin-top:-3px;margin-right:3px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}">RoPro Plus</b><br>subscribers.</div><div style="font-family:HCo Gotham SSm;color:white;font-size:18px;position:absolute;top:270px;left:200px;width:270px;"><u>More Subscription Benefits:</u>
    <ul style="margin-left:20px;font-size:12px;font-family:HCo Gotham SSm;">
    <li style="list-style-type:circle;">View Server Region</li>
    <li style="list-style-type:circle;">Animated Profile Themes</li><li style="list-style-type:circle;">Trade Value &amp; Demand Calculator</li><li style="list-style-type:circle;">Save Sandbox Outfits &amp; Use Bundles</li><li style="list-style-type:circle;">And many more! Find a full list <a style="text-decoration:underline;cursor:pointer;" href="https://ropro.io#plus" target="_blank">here</a>.</li></ul>
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

function createUpgradeModalServerFilters() {
    modalDiv = document.createElement('div')
    modalDiv.setAttribute('id', 'standardUpgradeModal')
    modalDiv.setAttribute('class', 'upgrade-modal')
	modalDiv.style.zIndex = 100000
    modalHTML = `<div id="standardUpgradeModal" style="z-index:10000;display:block;" class="upgrade-modal"><div style="background-color:#232527;position:absolute;width:500px;height:500px;left:-webkit-calc(50% - 250px);top:-webkit-calc(50% - 250px);" class="modal-content upgrade-modal-content">
    <span style="margin-top:5px;margin-right:5px;font-size:40px;" class="upgrade-modal-close">×</span>
    <h2 style="padding-bottom:5px;border-bottom: 3px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;position:absolute;top:20px;left:40px;"><img style="width:70px;left:0px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}"> RoPro Plus Feature</h2><div style="font-family:HCo Gotham SSm;color:white;font-size:20px;position:absolute;top:115px;left:200px;width:270px;">This server filter is only available for<br><b><img style="width:20px;margin-top:-3px;margin-right:3px;" src="${chrome.runtime.getURL('/images/plus_icon.png')}">RoPro Plus</b><br>subscribers.</div><div style="font-family:HCo Gotham SSm;color:white;font-size:18px;position:absolute;top:240px;left:200px;width:270px;"><u>More Subscription Benefits:</u>
    <ul style="margin-left:20px;font-size:12px;font-family:HCo Gotham SSm;">
    <li style="list-style-type:circle;">View Server Region, Server Version, and Server Uptime</li>
    <li style="list-style-type:circle;">Animated Profile Themes</li><li style="list-style-type:circle;">Trade Value &amp; Demand Calculator</li><li style="list-style-type:circle;">Save Sandbox Outfits &amp; Use Bundles</li><li style="list-style-type:circle;">And many more! Find a full list <a style="text-decoration:underline;cursor:pointer;" href="https://ropro.io#plus" target="_blank">here</a>.</li></ul>
    </div><video width="70%" height="100%" style="pointer-events: none;position:absolute;top:10px;left:-70px;transform:scale(2);" src="" autoplay="" loop="" muted=""></video>
    <a href="https://ropro.io#plus" target="_blank"><button type="button" style="font-family:HCo Gotham SSm;position:absolute;left:25px;top:440px;width:450px;" class="btn-growth-sm PurchaseButton">Subscribe</button></a>
    </div></div>`
    modalDiv.innerHTML += modalHTML
    body = document.getElementsByTagName('body')[0]
    body.insertBefore(modalDiv, body.childNodes[0])
    $('.upgrade-modal-close').click(function(){
        document.getElementById('standardUpgradeModal').remove()
    })
}

function upgradeModalServerFilters() {
    createUpgradeModalServerFilters()
    document.getElementById('standardUpgradeModal').getElementsByTagName('video')[0].src = `https://ropro.io/dances/dance${(Math.floor(Math.random() * 18) + 1)}.webm`
    document.getElementById('standardUpgradeModal').style.display = "block"
}


async function updatePlayTime(gameId, timePeriod, offset = 0) {
	document.getElementById("playTimeText").innerHTML = '<span id="mostPlayedLoadingBar" style="position:absolute; top:-5px;left:40px; display: inline-block; transform: scale(0.5); width: 100px; height: 25px; visibility: initial !important;margin-right:50px;margin-top:0px;" class="spinner spinner-default"></span>'
	time = await getTimePlayed(gameId, timePeriod, offset)
	document.getElementById("playTimeText").title = `${parseInt(time)} minutes`
	document.getElementById("playTimeText").innerText = formatTime(parseInt(time))
}

async function addPlayTime(gameId) {
	playTimeHTML = `<div style="margin-top:5px;font-size:12px;position:relative;" class="text-label">Played <img style="background-image:none;margin:0px;margin-top:-2px;margin-bottom:0px;transform:scale(1);border:none;margin-left:0px;margin-right:1px;width:12px;height:12px;" src="${chrome.runtime.getURL(`/images/timer${theme == "dark" ? "_dark" : "_light"}.svg`)}" class="info-label icon-pastname">
	<a href="#!/game-instances" style="font-size:13px;display:inline-block;" id="playTimeText" class="text-name" title=""><span id="mostPlayedLoadingBar" style="position:absolute; top:-5px;left:40px; display: inline-block; transform: scale(0.5); width: 100px; height: 25px; visibility: initial !important;margin-right:50px;margin-top:0px;" class="spinner spinner-default"></span></a><div id="timeDropdown" style="overflow:visible;margin-top:-10px;margin-left:0px;float:right;width:auto;transform:scale(0.8);margin-right:-37px;z-index:10;margin-bottom:0px;z-index:0;" class="input-group-btn group-dropdown">
	<button style="border:none;" type="button" class="input-dropdown-btn" data-toggle="dropdown" aria-expanded="false"> 
	<span style="float:right;" class="icon-down-16x16"></span><span id="timeLabel" class="rbx-selection-label ng-binding" ng-bind="layout.selectedTab.label" style="font-size:14px;float:right;margin-right:5px;">Past Day</span> 
	</button>
	<ul style="max-height:1000px;width:130px;margin-left:-15px;top:-100px;" id="timeOptions" data-toggle="dropdown-menu" class="dropdown-menu" role="menu"> 
	<li>
	<a time="today" class="timeChoice">
		<span style="font-size:14px;" ng-bind="tab.label" class="ng-binding">Past Day</span>
	</a></li>
	<li>
	<a time="pastWeek" class="timeChoice">
		<span ng-bind="tab.label" class="ng-binding" style="font-size:14px;">Past 7 Days</span>
	</a></li><li>
	<a time="pastMonth" class="timeChoice">
		<span style="font-size:14px;" ng-bind="tab.label" class="ng-binding">Past 30 Days</span>
	</a></li><li>
	<a time="pastYear" class="timeChoice">
		<span style="font-size:14px;" ng-bind="tab.label" class="ng-binding">Past 365 Days</span>
	</a></li><li>
	<a time="allTime" class="timeChoice">
		<span style="font-size:14px;" ng-bind="tab.label" class="ng-binding">All Time</span>
	</a></li></ul></div></div>`
	div = document.createElement('div')
	div.innerHTML = playTimeHTML
	titleContainer = document.getElementsByClassName('game-title-container')
	if (titleContainer.length > 0) {
		titleContainer[0].appendChild(div)
	}
	if (await checkVerification()) {
		updatePlayTime(gameId, 1)
	} else {
		document.getElementById('mostPlayedLoadingBar').style.display = "none"
		document.getElementById('timeDropdown').style.pointerEvents = "none"
		document.getElementById('playTimeText').innerHTML = "Verify User"
		document.getElementById('playTimeText').href = "https://roblox.com/home"
		document.getElementById('playTimeText').target = "_blank"
	}
	var morePlaytimeSorts = true
	$('.timeChoice').click(function(){
		time = this.getAttribute("time")
		if (time == "today") {
			document.getElementById('timeLabel').innerText = "Past Day"
			updatePlayTime(gameId, 1)
		} else if (time == "pastWeek") {
			document.getElementById('timeLabel').innerText = "Past 7 Days"
			updatePlayTime(gameId, 7)
		} else if (time == "pastMonth") {
			if (morePlaytimeSorts) {
				document.getElementById('timeLabel').innerText = "Past 30 Days"
				updatePlayTime(gameId, 30)
			} else {
				upgradeModal()
			}
		} else if (time == "pastYear") {
			if (morePlaytimeSorts) {
				document.getElementById('timeLabel').innerText = "Past 365 Days"
				updatePlayTime(gameId, 365)
			} else {
				upgradeModal()
			}
		} else if (time == "allTime") {
			if (morePlaytimeSorts) {
				document.getElementById('timeLabel').innerText = "All Time"
				updatePlayTime(gameId, 999)
			} else {
				upgradeModal()
			}
		}
	})
}

function addRecentServer(myUniverseId) {
	friendServers = document.getElementById('rbx-friends-running-games')
	if (friendServers != null) {
		mostRecentServerDiv = document.createElement('div')
		mostRecentServerDiv.innerHTML = mostRecentServerHTML
		friendServers.parentNode.insertBefore(mostRecentServerDiv, friendServers)
	}
	$(".rbx-refresh").click(function(){
		loadMostRecentServer(myUniverseId)
	})
}

function divide(number, divisor) {
  // From GeeksforGeeks
  let ans = "";
  let idx = 0;
  let temp = number[idx] - "0";
  while (temp < divisor) {
    temp = temp * 10 + number[idx + 1].charCodeAt(0) - "0".charCodeAt(0);
    idx += 1;
  }
  idx += 1;
  while (number.length > idx) {
    ans += String.fromCharCode(Math.floor(temp / divisor) + "0".charCodeAt(0));
    temp =
      (temp % divisor) * 10 + number[idx].charCodeAt(0) - "0".charCodeAt(0);
    idx += 1;
  }
  ans += String.fromCharCode(Math.floor(temp / divisor) + "0".charCodeAt(0));
  if (ans.length == 0) return "0";
  return ans;
}

async function playVoiceServer(serverId, serverName) {
	outer = document.getElementById('rbx-body')
	modalcontainer = document.createElement('div')
	modalcontainer.id = "voiceServerModalContainer"
	outer.appendChild(modalcontainer)
	overlay = document.createElement('div')
	overlay.innerHTML = randomServerOverlayHTML
	modal = document.createElement('div')
	modal.innerHTML = voiceServerModalHTML
	modal.getElementsByClassName('voice-server-loading-text')[0].innerText = `Loading voice server ${stripTags(serverName)}...`
	modalcontainer.appendChild(overlay)
	modalcontainer.appendChild(modal)
	modalcontainer.getElementsByClassName('close')[0].addEventListener('click', function() {
		document.getElementById('voiceServerModalContainer').remove()
	})
	setTimeout(async function() {
		server = await fetchVoiceServer(globalGameId, serverId)
		document.getElementById('voiceServerModalContainer').remove()
		if (server.hasOwnProperty('accessCode')) {
			div = document.createElement('div')
			div.setAttribute(`onclick`, `if(!document.body.classList.contains("ropro-cloud-play-activated")) {Roblox.GameLauncher.joinPrivateGame(${parseInt(globalGameId)}, "${stripTags(server.accessCode)}", "${stripTags(divide(divide(atob(atob(server.key)), "" + serverId), "" + globalGameId))}")}`)
			div.click()
		}
	}, 1000)
}

var voiceServerIndex = 0;
var voiceServers = null;
async function addVoiceServers(placeId) {
	var initialLoad = document.getElementsByClassName('ropro-voice-servers-container').length == 0
	var roproVoiceServersDiv = document.createElement('div')
	roproVoiceServersDiv.id = "roproVoiceServers"
	document.body.appendChild(roproVoiceServersDiv)
	friendServers = document.getElementById('rbx-friends-running-games')
	voiceEnabledLabel = document.getElementById('voice-enabled-label')
	if (friendServers != null && voiceEnabledLabel != null) {
		voiceServers = await fetchVoiceServers(placeId)
		if (voiceServers.length > 0) {
			var voiceServersDiv = document.createElement('div')
			voiceServersDiv.innerHTML = roproVoiceServersHTML
			voiceServersDiv = voiceServersDiv.childNodes[0]
			var initialLoad = document.getElementsByClassName('ropro-voice-servers-container').length == 0
			if (initialLoad) {
				friendServers.parentNode.insertBefore(voiceServersDiv, friendServers)
				voiceServersDiv.getElementsByClassName('rbx-refresh')[0].addEventListener('click', function() {
					document.getElementById('ropro-voice-servers-list').innerHTML = ""
					document.getElementById('roproVoiceServersContainer').getElementsByClassName('rbx-running-games-load-more')[0].style.display = "block"
					addVoiceServers(globalGameId)
				})
			}
			voiceServerIndex = 0;
			var playerTokens = []
			for (var i = 0; i < Math.min(voiceServers.length, 3); i++) {
				thumbnails = ""
				for (var j = 0; j < voiceServers[i].playerTokens.length; j++) {
					playerTokens.push(voiceServers[i].playerTokens[j])
					thumbnails += `<span class="avatar avatar-headshot-md player-avatar" style="width:57px;height:57px;"><span class="thumbnail-2d-container avatar-card-image" style="border-radius:25%;background-color:${theme == "dark" ? "#2E2F31" : "#E3E3E3"};"><img class="ropro-player-thumbnail-${stripTags(voiceServers[i].playerTokens[j])}" src="${chrome.runtime.getURL('/images/empty.png')}" alt="" title=""></span></span>`
				}
				voiceServerHTML = `<li class="rbx-game-server-item col-md-4 col-sm-4 col-xs-4 ropro-checked ropro-server-invite-added"><div class="card-item ropro-voice-server-card" style="border-radius:10px;filter: drop-shadow(0px 0px 1px ${theme == "dark" ? "#242527" : "#5E5E5E"});"><div style="margin-top:-12px;margin-left:-12px;width:calc(100% + 24px);margin-bottom:-14px;font-size:12px;padding:8px;border-top-left-radius:10px;border-top-right-radius:10px;float:left;background-color:${theme == "dark" ? "#2E2F31" : "#E3E3E3"};padding-top:4px;"><span style="margin-top:5px;margin-left:10px;font-weight:bold;font-size:17px;float:left;color:${theme == "dark" ? "white" : "#393b3d"};">${stripTags(voiceServers[i].name)}</span><span style="margin-top:5px;margin-right:10px;font-size:15px;float:right;">${parseInt(voiceServers[i].numPlayers)} / ${parseInt(voiceServers[i].maxPlayers)}</span></div><div class="player-thumbnails-container ropro-player-icon-list" style="max-width:${voiceServers[i].playerTokens.length > 8 ? '265px' : '249px'};height:126px;overflow-y:auto;">${thumbnails}</div><div class="ropro-voice-server-play-button" data-server-id="${parseInt(voiceServers[i].vipServerId)}" data-server-name="${stripTags(voiceServers[i].name)}" style="cursor:pointer;width:100%;height:40px;background-color:#5E5E5E;margin-top:-12px;border-radius:8px;position:relative;overflow:hidden;"><img src="${chrome.runtime.getURL('/images/Signet.png')}" style="position:absolute;left:0;height:100%;"><img src="${chrome.runtime.getURL('/images/play.png')}" style="height:20px;margin-top:10px;"></div><div style="margin-top:-12px;margin-left:-12px;width:calc(100% + 24px);margin-bottom:-12px;font-size:12px;padding:0px;height:6px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;float:left;background-color:${theme == "dark" ? "#191B1D" : "#E3E3E3"};overflow:hidden;"><div style="width:${parseInt(voiceServers[i].numPlayers) / parseInt(voiceServers[i].maxPlayers) * 100}%;height:100%;background-color:#7C7C7C;"></div></div></div></li>`
				var div = document.createElement('div')
				div.innerHTML += voiceServerHTML
				div.getElementsByClassName('ropro-voice-server-play-button')[0].addEventListener('click', function(){
					var serverId = parseInt(this.getAttribute('data-server-id'))
					var serverName = this.getAttribute('data-server-name')
					playVoiceServer(serverId, serverName)
				})
				document.getElementById('ropro-voice-servers-list').appendChild(div.childNodes[0])
			}
			getPlayerThumbnails(playerTokens, "AvatarBust")
			voiceServerIndex += 3
			if (initialLoad) {
				document.getElementById('roproVoiceServersContainer').getElementsByClassName('rbx-running-games-load-more')[0].addEventListener('click', async function(){
					premiumVoiceServers = await fetchSetting('premiumVoiceServers')
					var playerTokens = []
					for (var i = voiceServerIndex; i < Math.min(voiceServers.length, voiceServerIndex + 3); i++) {
						thumbnails = ""
						for (var j = 0; j < voiceServers[i].playerTokens.length; j++) {
							playerTokens.push(voiceServers[i].playerTokens[j])
							thumbnails += `<span class="avatar avatar-headshot-md player-avatar" style="width:57px;height:57px;"><span class="thumbnail-2d-container avatar-card-image" style="border-radius:25%;background-color:${theme == "dark" ? "#2E2F31" : "#E3E3E3"};"><img class="ropro-player-thumbnail-${stripTags(voiceServers[i].playerTokens[j])}" src="${chrome.runtime.getURL('/images/empty.png')}" alt="" title=""></span></span>`
						}
						if (premiumVoiceServers) {
							voiceServerHTML = `<li class="rbx-game-server-item col-md-4 col-sm-4 col-xs-4 ropro-checked ropro-server-invite-added"><div class="card-item ropro-voice-server-card" style="border-radius:10px;filter: drop-shadow(0px 0px 1px ${theme == "dark" ? "#242527" : "#5E5E5E"});"><div style="margin-top:-12px;margin-left:-12px;width:calc(100% + 24px);margin-bottom:-14px;font-size:12px;padding:8px;border-top-left-radius:10px;border-top-right-radius:10px;float:left;background-color:${theme == "dark" ? "#2E2F31" : "#E3E3E3"};padding-top:4px;"><span style="margin-top:5px;margin-left:10px;font-weight:bold;font-size:17px;float:left;color:${theme == "dark" ? "white" : "#393b3d"};">${stripTags(voiceServers[i].name)}</span><span style="margin-top:5px;margin-right:10px;font-size:15px;float:right;">${parseInt(voiceServers[i].numPlayers)} / ${parseInt(voiceServers[i].maxPlayers)}</span></div><div class="player-thumbnails-container ropro-player-icon-list" style="max-width:249px;height:126px;overflow-y:auto;">${thumbnails}</div><div class="ropro-voice-server-play-button" data-server-id="${parseInt(voiceServers[i].vipServerId)}" data-server-name="${stripTags(voiceServers[i].name)}" style="cursor:pointer;width:100%;height:40px;margin-top:-12px;border-radius:8px;position:relative;overflow:hidden;background-color:#0084DC;"><img src="${chrome.runtime.getURL('/images/Signet.png')}" style="position:absolute;left:0;height:100%;"><img src="${chrome.runtime.getURL('/images/play.png')}" style="height:20px;margin-top:10px;"></div><div style="margin-top:-12px;margin-left:-12px;width:calc(100% + 24px);margin-bottom:-12px;font-size:12px;padding:0px;height:6px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;float:left;background-color:${theme == "dark" ? "#191B1D" : "#E3E3E3"};overflow:hidden;"><div style="width:${parseInt(voiceServers[i].numPlayers) / parseInt(voiceServers[i].maxPlayers) * 100}%;height:100%;background-image: linear-gradient(to left, #0084DC , #7FCCFF);"></div></div></div></li>`
						} else {
							voiceServerHTML = `<li class="rbx-game-server-item col-md-4 col-sm-4 col-xs-4 ropro-checked ropro-server-invite-added"><div class="card-item ropro-voice-server-card" style="border-radius:10px;filter: drop-shadow(0px 0px 1px ${theme == "dark" ? "#242527" : "#5E5E5E"});"><div style="margin-top:-12px;margin-left:-12px;width:calc(100% + 24px);margin-bottom:-14px;font-size:12px;padding:8px;border-top-left-radius:10px;border-top-right-radius:10px;float:left;background-color:${theme == "dark" ? "#2E2F31" : "#E3E3E3"};padding-top:4px;"><span style="margin-top:5px;margin-left:10px;font-weight:bold;font-size:17px;float:left;color:${theme == "dark" ? "white" : "#393b3d"};">${stripTags(voiceServers[i].name)}</span><span style="margin-top:5px;margin-right:10px;font-size:15px;float:right;">${parseInt(voiceServers[i].numPlayers)} / ${parseInt(voiceServers[i].maxPlayers)}</span></div><div class="player-thumbnails-container ropro-player-icon-list" style="max-width:249px;height:126px;overflow-y:auto;">${thumbnails}</div><a href="https://ropro.io?upgrade" target="_blank" style="position:absolute;bottom:0px;left:calc(50% - 33.5px);z-index:10;"><img class="ropro-voice-server-play-lock" onclick="window.open('https://ropro.io?upgrade')" src="${chrome.runtime.getURL('/images/lock.png')}" style="height:90px;"></a><div onclick="window.open('https://ropro.io?upgrade')" class="ropro-voice-server-play-button" data-server-id="${parseInt(voiceServers[i].vipServerId)}" data-server-name="${stripTags(voiceServers[i].name)}" style="cursor:pointer;width:100%;height:40px;margin-top:-12px;border-radius:8px;position:relative;overflow:hidden;background-color:#0084DC;opacity:0.6;"><img src="${chrome.runtime.getURL('/images/Signet.png')}" style="position:absolute;left:0;height:100%;"><img src="${chrome.runtime.getURL('/images/play.png')}" style="height:20px;margin-top:10px;"></div><div style="margin-top:-12px;margin-left:-12px;width:calc(100% + 24px);margin-bottom:-12px;font-size:12px;padding:0px;height:6px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;float:left;background-color:${theme == "dark" ? "#191B1D" : "#E3E3E3"};overflow:hidden;"><div style="width:${parseInt(voiceServers[i].numPlayers) / parseInt(voiceServers[i].maxPlayers) * 100}%;height:100%;background-image: linear-gradient(to left, #0084DC , #7FCCFF);"></div></div></div></li>`
						}
						var div = document.createElement('div')
						div.innerHTML += voiceServerHTML
						if (premiumVoiceServers) {
							div.getElementsByClassName('ropro-voice-server-play-button')[0].addEventListener('click', function(){
								var serverId = parseInt(this.getAttribute('data-server-id'))
								var serverName = this.getAttribute('data-server-name')
								playVoiceServer(serverId, serverName)
							})
						}
						document.getElementById('ropro-voice-servers-list').appendChild(div.childNodes[0])
						if (i == voiceServers.length - 1) {
							document.getElementById('roproVoiceServersContainer').getElementsByClassName('rbx-running-games-load-more')[0].style.display = "none"
						}
					}
					getPlayerThumbnails(playerTokens, "AvatarBust")
					voiceServerIndex += 3
				})
			}
		}
	}
}

function addComments(placeId) {
	commentsButtonHTML = `<li id="tab-comments" class="rbx-tab tab-comments"><a class="rbx-tab-heading" href="#comments"> <span class="text-lead">Comments</span></a></li>`
	commentsButton = document.createElement('div')
	commentsButton.innerHTML = commentsButtonHTML
	commentsButton = commentsButton.childNodes[0]
	commentsPane = document.createElement('div')
	commentsPane.innerHTML = commentsPaneHTML
	commentsPane = commentsPane.childNodes[0]
	insertAfter(commentsButton, document.getElementsByClassName('nav nav-tabs')[0].childNodes[1])
	document.getElementsByClassName('tab-content rbx-tab-content')[0].appendChild(commentsPane)
	$('.page-content .rbx-tabs-horizontal .rbx-tab').css('width', '25%')
	$('.page-content .rbx-tabs-horizontal .rbx-tab').click(function() {
		if (this == commentsButton) {
			$('.page-content .rbx-tabs-horizontal .rbx-tab').removeClass('active')
			commentsButton.classList.add('active')
			$('.tab-pane').css('display', 'none')
			$('.tab-pane.comments').css('display', 'block')
		} else {
			commentsButton.classList.remove('active')
			$('.tab-pane').css('display', 'none')
			$('#' + stripTags(this.id.split('tab-')[1])).css('display', 'block')
		}
	})
}

async function loadMostRecentServer(myUniverseId) { //Check if recent server is still active before displaying it to user, otherwise remove it from recent server cache.
	mostRecentServers = await getLocalStorage("mostRecentServers")
	if (myUniverseId in mostRecentServers) {
		addMostRecentServer(mostRecentServers[myUniverseId][0], mostRecentServers[myUniverseId][1], mostRecentServers[myUniverseId][2], mostRecentServers[myUniverseId][3], true)
		/**var serverStatus = new XMLHttpRequest();
		serverStatus.open("GET", `https://assetgame.roblox.com/Game/PlaceLauncher.ashx?request=RequestGameJob&placeId=${mostRecentServers[myUniverseId][0]}&gameId=${mostRecentServers[myUniverseId][1]}`, true);
		serverStatus.withCredentials = true;
		serverStatus.send();
		serverStatus.onreadystatechange = function() {
			if (serverStatus.readyState === 4) {
			  var status = JSON.parse(serverStatus.responseText);
				if (serverStatus.status === 200) {
					if (status.jobId != null) { //Server is still active - display it in recent server box.
						addMostRecentServer(mostRecentServers[myUniverseId][0], mostRecentServers[myUniverseId][1], mostRecentServers[myUniverseId][2], mostRecentServers[myUniverseId][3], true)
					} else { //Server is now inactive - remove it from recent.
						addMostRecentServer(mostRecentServers[myUniverseId][0], mostRecentServers[myUniverseId][1], mostRecentServers[myUniverseId][2], mostRecentServers[myUniverseId][3], false)
					}
				}
			}
		}**/
	}
}

async function createInviteLink(elem, serverid, placeid) {
	if (document.getElementsByClassName('server-invite-link-box').length > 0) {
		if (document.getElementsByClassName('server-invite-link-box')[0].parentNode == elem) {
			document.getElementsByClassName('server-invite-link-box')[0].remove()
			return
		}
		document.getElementsByClassName('server-invite-link-box')[0].remove()
	}
	if (elem.classList.contains('create-server-invite-button')) {
		pos = "top: -170px; left: -97px;"
	} else {
		pos = "top: -170px; left: -107px;"
	}
	inviteHTML = `<div uib-popover-template-popup="" uib-title="" class="dark-theme tradeinfocard popover ng-scope ng-isolate-scope bottom people-info-card-container card-with-game fade in server-invite-link-box" tooltip-animation-class="fade" uib-tooltip-classes="" ng-class="{ in: isOpen }" style="filter: drop-shadow(rgb(0, 0, 0) 0px 0px 1px); ${pos} width: 300px; height: 155px;border-radius:10px;">
	<h2 style="padding-bottom:5px;border-bottom: 2px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;top:25px;left:25px;width:250px;width:250px;margin:auto;">
			<img style="width:50px;left:0px;margin-bottom:-5px;margin-left:10px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}">
			<p style="color:white;display:inline-block;font-size:15px;font-weight:650;">Server Invite Link</p>
		</h2><div style="width:250px;margin:auto;margin-top:10px;border-radius:10px;" class="input-group server-invite-link-input"><span style="float: right; width: 100%; height: 62.5px; visibility: initial !important;" class="spinner spinner-default"></span></div><div style="left: 135px; transform: rotate(180deg) scale(2); top: initial; bottom: -10px;" class="ropro-arrow arrow"></div>
	<div class="popover-inner" style="width:100px;height:100px;">		
	</div></div>`
	div = document.createElement('div')
	div.innerHTML = inviteHTML
	inviteBox = div.childNodes[0]
	elem.appendChild(inviteBox)
	invite = await createInvite(myUniverseId, serverid)
	elem.getElementsByClassName('server-invite-link-input')[0].innerHTML = `<form><div class="form-has-feedback"><p class="copied-to-clipboard" style="position:absolute;top:-30px;left:55px;background-color:#111212;border-radius:10px;padding:5px;font-size:12px;display:none;">Copied to clipboard.</p><input style="padding-left:10px;font-size:12px;border-radius:10px;margin-bottom:5px;opacity:1;cursor:pointer;" id="navbar-search-input" class="form-control input-field new-input-field copy-clipboard-button" placeholder="Search" maxlength="120" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="${stripTags(invite)}" readonly></div></form><div class="input-group-btn" style="margin:-40px;"><button style="right:10px;left:initial;pointer-events:none;" id="copy-btn" class="input-addon-btn" type="submit"><img src="${chrome.runtime.getURL('/images/copy.png')}" style="width:18px;height:18px;filter:invert(0.8);"></button></div><p style="font-size:12px;text-align:center;">Share this link on desktop, tablet, or mobile to invite others to this server.</p>`
	inviteBox.getElementsByClassName('copy-clipboard-button')[0].addEventListener('click', function(event) {
		inviteBox.getElementsByTagName('input')[0].select();
		inviteBox.getElementsByTagName('input')[0].setSelectionRange(0, 99999);
		navigator.clipboard.writeText(inviteBox.getElementsByTagName('input')[0].value);
		this.parentNode.getElementsByClassName('copied-to-clipboard')[0].classList.add('active')
		var copied = this
		setTimeout(function() {
			copied.parentNode.getElementsByClassName('copied-to-clipboard')[0].classList.remove('active')
		}, 500)
		event.stopPropagation()
	})
	inviteBox.addEventListener('click', function(event) {
		event.stopPropagation()
	})
}

async function createSpeedTest(elem, serverid, placeid) {
	if (document.getElementsByClassName('server-speed-test-box').length > 0) {
		if (document.getElementsByClassName('server-speed-test-box')[0].parentNode == elem) {
			document.getElementsByClassName('server-speed-test-box')[0].remove()
			return
		}
		document.getElementsByClassName('server-speed-test-box')[0].remove()
	}
	if (elem.classList.contains('create-server-invite-button')) {
		pos = "top: -315px; left: -102px;"
	} else {
		pos = "top: -315px; left: -123px;"
	}
	speedTestHTML = `<div uib-popover-template-popup="" uib-title="" class="dark-theme tradeinfocard popover ng-scope ng-isolate-scope bottom people-info-card-container card-with-game fade in server-speed-test-box" tooltip-animation-class="fade" uib-tooltip-classes="" ng-class="{ in: isOpen }" style="filter: drop-shadow(rgb(0, 0, 0) 0px 0px 1px);${pos} width: 300px; height: 300px;border-radius:10px;">
	<h2 style="padding-bottom:5px;border-bottom: 2px solid #FFFFFF;font-family:HCo Gotham SSm;color:white;font-size:30px;top:25px;left:25px;width:250px;margin:auto;">
			<img style="width:50px;left:0px;margin-bottom:-5px;margin-left:10px;" src="${chrome.runtime.getURL('/images/ropro_logo.png')}">
			<p style="color:white;display:inline-block;font-size:15px;font-weight:650;border-bottom: 1px solid #FFFFFF;">Server Ping Test<img src="${chrome.runtime.getURL('/images/speed_icon.svg')}" style="filter:invert(1);width:20px;margin-left:7px;"></p><p style="margin-top:5px;margin-left:10px;color:white;display:inline-block;font-size:9px;font-weight:100;">To avoid sending unnecessary traffic to Roblox servers, RoPro sends test data to one of our own servers in the same region as this Roblox server.</p>
		</h2><div style="width:250px;margin:auto;margin-top:10px;border-radius:10px;" class="input-group server-invite-link-input"><span style="float: right; width: 100%; height: 62.5px; visibility: initial !important;margin-top:57px;" class="spinner spinner-default"></span></div><div style="left: 135px; transform: rotate(180deg) scale(2); top: initial; bottom: -10px;" class="ropro-arrow arrow"></div>
	<div class="popover-inner" style="width:100px;height:100px;">		
	</div></div>`
	div = document.createElement('div')
	div.innerHTML = speedTestHTML
	speedTestBox = div.childNodes[0]
	elem.appendChild(speedTestBox)
	speedTestBox.addEventListener('click', function(event) {
		event.stopPropagation()
	})
}

function addServerInviteButton(elem, serverid, placeid) {
	if (elem.classList.contains("ropro-server-invite-added")) {
		return
	}
	serverInfoQueue.push([elem, serverid])
	elem.classList.add('ropro-server-invite-added')
	if (elem.classList.contains('rbx-friends-game-server-item')) {
		serverInviteButtonHTML = `<a style="width:30%;margin-left:2%;position:relative!important;" class="btn-full-width btn-control-xs create-server-link" data-placeid="${parseInt(placeid)}" data-serverid="${stripTags(serverid)}">Invite</a>`
		div = document.createElement('div')
		div.innerHTML = serverInviteButtonHTML
		button = div.childNodes[0]
		elem.getElementsByClassName('rbx-friends-game-server-join')[0].style.width = "68%"
		if (elem.getElementsByClassName('rbx-friends-game-server-details').length > 0) {
			elem.getElementsByClassName('rbx-friends-game-server-details')[0].appendChild(button)
		} else if (elem.getElementsByClassName("rbx-friends-game-server-details'").length > 0) {
			elem.getElementsByClassName("rbx-friends-game-server-details'")[0].appendChild(button)
		}
		button.addEventListener('click', function(event) {
			createInviteLink(this, this.getAttribute('data-serverid'), this.getAttribute('data-placeid'))
			event.stopPropagation()
		})
	} else {
		serverInviteButtonHTML = `<a style="width:30%;margin-left:2%;position:relative!important;" class="btn-full-width btn-control-xs create-server-link" data-placeid="${parseInt(placeid)}" data-serverid="${stripTags(serverid)}">Invite</a>`
		div = document.createElement('div')
		div.innerHTML = serverInviteButtonHTML
		button = div.childNodes[0]
		elem.getElementsByClassName('rbx-game-server-join')[0].style.width = "68%"
		if (elem.getElementsByClassName('rbx-game-server-details').length > 0) {
			elem.getElementsByClassName('rbx-game-server-details')[0].appendChild(button)
		} else if (elem.getElementsByClassName("rbx-game-server-details'").length > 0) {
			elem.getElementsByClassName("rbx-game-server-details'")[0].appendChild(button)
		}
		button.addEventListener('click', function(event) {
			createInviteLink(this, this.getAttribute('data-serverid'), this.getAttribute('data-placeid'))
			event.stopPropagation()
		})
		/**if (serverSpeedButton) {
			button.setAttribute('style', 'width:15%;position:relative!important;float:right;margin-right:0%;')
			serverSpeedButtonHTML = `<a style="width:15%;position:relative!important;float:right;margin-right:3%;" class="btn-full-width btn-control-xs server-speed-button" data-placeid="${parseInt(placeid)}" data-serverid="${stripTags(serverid)}"><img src="${chrome.runtime.getURL('/images/speed_icon.svg')}" style="filter:invert(1);width:11.5px;transform:scale(1.2);"></a>`
			div = document.createElement('div')
			div.innerHTML = serverSpeedButtonHTML
			button = div.childNodes[0]
			elem.getElementsByClassName('rbx-game-server-join')[0].style.width = "64%"
			elem.getElementsByClassName('rbx-game-server-details')[0].appendChild(button)
			button.addEventListener('click', function(event) {
				createSpeedTest(this, this.getAttribute('data-serverid'), this.getAttribute('data-placeid'))
				event.stopPropagation()
			})
		}**/
	}
}

function addMostRecentServer(placeID, serverID, userID, time, serverActive) {
	timeSince = Math.round(new Date().getTime() - parseInt(time)) / 1000
	if (timeSince < 60) { //seconds
		period = Math.round(timeSince)
		suffix = period == 1 ? "" : "s"
		timeString = `Now`
	} else if (timeSince / 60 < 60) { //minutes
		period = Math.round(timeSince / 60)
		if (timeSince / 60 > 1.25) {
			suffix = period == 1 ? "" : "s"
			timeString = `${period} minute${suffix} ago`
		} else {
			timeString = `Now`
		}
	} else if (timeSince / 60 / 60 < 24) { //hours
		period = Math.round(timeSince / 60 / 60)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} hour${suffix} ago`
	} else if (timeSince / 60 / 60 / 24 < 30) { //days
		period = Math.round(timeSince / 60 / 60 / 24)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} day${suffix} ago`
	} else { //months
		period = Math.round(timeSince / 60 / 60 / 24 / 30)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} month${suffix} ago`
	}
	if (serverActive) {
		document.getElementById('rbx-recent-server-box').innerHTML = `<li style="border-radius:8px;margin-top:-5px;margin-left:-5px;margin-right:5px;" data-gameid="${stripTags(serverID)}" class="stack-row rbx-game-server-item ropro-checked"><div class="section-header"><div class="link-menu rbx-game-server-menu"></div></div><div style="width:90%;position:relative;" class="section-left rbx-game-server-details">
		<div style="float:left;" class="text-info rbx-game-status rbx-game-server-status"><b>Last Played:</b><img style="background-image:none;margin:0px;margin-top:-2px;margin-bottom:1px;transform:scale(1);border:none;margin-left:5px;margin-right:5px;width:15px;height:15px;" src="${chrome.runtime.getURL(`/images/timer${theme == "dark" ? "_dark" : "_light"}.svg`)}" class="info-label icon-pastname">${stripTags(timeString)}</div><div style="float:left;" class="text-info rbx-game-status rbx-game-server-status"></div>
		<div class="rbx-game-server-alert hidden"><span class="icon-remove"></span>Slow Game</div><a style="width:89%;float:left;" class="ropro-game-server-join btn-full-width btn-control-xs" data-serverid="${stripTags(serverID)}" data-placeid="${parseInt(placeID)}" onclick="if(!document.body.classList.contains('ropro-cloud-play-activated')) {Roblox.GameLauncher.joinGameInstance(${parseInt(placeID)}, &quot;${stripTags(serverID)}&quot;)}">Rejoin Server</a><a style="width:9.5%;float:right;margin-right:1%;position:relative!important;" class="btn-full-width btn-control-xs create-server-invite-button" data-serverid="${stripTags(serverID)}" data-placeid="${parseInt(placeID)}">Invite</a></div><div style="width:9%;margin-top:13px;margin-left:1%;" class="section-right rbx-game-server-players"><span style="transform:scale(1.3);" class="avatar avatar-headshot-sm player-avatar"><a class="avatar-card-link"><img class="avatar-card-image ropro-player-thumbnail-${parseInt(userID)}"></a></span></div></li>`	
		document.getElementById('rbx-recent-server-box').getElementsByClassName('create-server-invite-button')[0].addEventListener('click', function(event) {
			createInviteLink(this, this.getAttribute('data-serverid'), this.getAttribute('data-placeid'))
			event.stopPropagation()
		})
	} else {
		document.getElementById('rbx-recent-server-box').innerHTML = `<li style="border-radius:8px;margin-top:-5px;margin-left:-5px;margin-right:5px;" data-gameid="${stripTags(serverID)}" class="stack-row rbx-game-server-item ropro-checked"><div class="section-header"><div class="link-menu rbx-game-server-menu"></div></div><div style="width:90%;position:relative;" class="section-left rbx-game-server-details">
		<div style="float:left;" class="text-info rbx-game-status rbx-game-server-status"><b>Last Played:</b><img style="background-image:none;margin:0px;margin-top:-2px;margin-bottom:1px;transform:scale(1);border:none;margin-left:5px;margin-right:5px;width:15px;height:15px;" src="${chrome.runtime.getURL(`/images/timer${theme == "dark" ? "_dark" : "_light"}.svg`)}" class="info-label icon-pastname">${stripTags(timeString)}</div><div style="float:left;" class="text-info rbx-game-status rbx-game-server-status"></div>
		<div class="rbx-game-server-alert hidden"><span class="icon-remove"></span>Slow Game</div><a class="ropro-game-server-join btn-full-width btn-control-xs" data-placeid="${parseInt(placeID)}" onclick="if(!document.body.classList.contains('ropro-cloud-play-activated')) {Roblox.GameLauncher.joinGameInstance(${parseInt(placeID)}, &quot;${stripTags(serverID)}&quot;)}">Server No Longer Active</a></div><div style="width:9%;margin-top:13px;margin-left:1%;" class="section-right rbx-game-server-players"><span style="transform:scale(1.3);" class="avatar avatar-headshot-sm player-avatar"><a class="avatar-card-link"><img class="avatar-card-image ropro-player-thumbnail-${parseInt(userID)}"></a></span></div></li>`	
	}
	serverInfoQueue.push([document.getElementById('rbx-recent-server-box').getElementsByTagName('li')[0], stripTags(serverID)])
	loadPlayerThumbnails([parseInt(userID)])
}

var hidePrivateServers = false

async function addHidePrivateServers() {
	var ps = document.getElementsByClassName('rbx-private-server-create')[1]
	var div = document.createElement('div')
	hidePrivateServers = await fetchSetting('hidePrivateServers')
	div.innerHTML = `<button type="button" class="btn-more btn-secondary-md btn-min-width" style="margin-bottom:5px;margin-top:-10px;">${hidePrivateServers ? 'Show Private Servers' : 'Hide Private Servers'}</button>`
	var button = div.childNodes[0]
	ps.insertBefore(button, ps.childNodes[0])
	if (hidePrivateServers) {
		document.getElementById('rbx-private-running-games').style.display = "none"
	}
	button.addEventListener('click', async function() {
		if (hidePrivateServers) {
			hidePrivateServers = false
			this.innerText = 'Hide Private Servers'
			document.getElementById('rbx-private-running-games').style.display = "block"
			settings = await getStorage("rpSettings")
			settings["hidePrivateServers"] = false
			setStorage("rpSettings", settings)
		} else {
			hidePrivateServers = true
			this.innerText = 'Show Private Servers'
			document.getElementById('rbx-private-running-games').style.display = "none"
			settings = await getStorage("rpSettings")
			settings["hidePrivateServers"] = true
			setStorage("rpSettings", settings)
		}
	})
}


function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ampm;
	return strTime;
  }

function formatDate(date) {
	dateString = formatAMPM(date) + " " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + (date.getYear() - 100)
	return dateString
}

function getTimeSince(time) {
	timeSince = Math.round(new Date().getTime() - parseInt(time)) / 1000
	if (timeSince < 60) { //seconds
		period = Math.round(timeSince)
		suffix = period == 1 ? "" : "s"
		timeString = `New Server`
	} else if (timeSince / 60 < 60) { //minutes
		//period = Math.round(timeSince / 60)
		//if (timeSince / 60 > 1.25) {
		//	suffix = period == 1 ? "" : "s"
		//	timeString = `${period} minute${suffix}`
		//} else {
		timeString = `New Server`
		//}
	} else if (timeSince / 60 / 60 < 24) { //hours
		period = Math.round(timeSince / 60 / 60)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} hour${suffix}`
	} else if (timeSince / 60 / 60 / 24 < 30) { //days
		period = Math.round(timeSince / 60 / 60 / 24)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} day${suffix}`
	} else { //months
		period = Math.round(timeSince / 60 / 60 / 24 / 30)
		suffix = period == 1 ? "" : "s"
		timeString = `${period} month${suffix}`
	}
	return timeString
}

async function getServerInfo(queue) {
	var servers = []
	var elems = {}
	var info = {}
	for (var i = 0; i < queue.length; i++) {
		servers.push(queue[i][1])
		elems[queue[i][1]] = queue[i][0]
	}
	serverInfo = await fetchServerInfo(globalGameId, servers)
	for (var i = 0; i < serverInfo.length; i++) {
		info[serverInfo[i].server] = true
		elem = elems[serverInfo[i].server]
		version = new Date(serverInfo[i].version)
		if (version < 0) {
			version = "Unknown Version"
		} else {
			version = formatDate(version)
		}
		timeSince = getTimeSince(serverInfo[i].launched)
		div = document.createElement('div')
		div.innerHTML = `<div style="cursor:pointer;white-space: nowrap;overflow: hidden !important;text-overflow: ellipsis;" class="ropro-server-info text-info"><img class="server-filter-img" src="${chrome.runtime.getURL('/images/earth_icon.png')}" style="width:15px;margin-top:0px;margin-right:5px;margin-left:2px;filter:invert(0.8);"><span style="font-size:12px;font-weight:initial;">${serverInfo[i].location != null ? stripTags(serverInfo[i].location) : 'Unknown Region'}</span><div style="pointer-events:none;display:block;position:absolute;z-index:10000;text-align:center;background-color:#232527;padding:10px;border-radius:5px;padding-left:20px;padding-right:20px;margin-top:5px;top:40px;left:5px;" class="ropro-server-info-tooltip"><div style="font-size:12px;font-weight:800;margin-top:5px;margin-bottom:5px;" class="text-info"><img class="server-filter-img" src="${chrome.runtime.getURL('/images/earth_icon.png')}" style="width:17px;margin-top:-2px;margin-right:5px;filter:invert(0.8);">Server Region: <br><span style="font-weight:initial;">${serverInfo[i].location != null ? stripTags(serverInfo[i].location) : 'Unknown Region'}</span></div><div style="font-size:12px;font-weight:800;margin-bottom:5px;" class="text-info"><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Server_Version2.svg')}" style="width:22px;margin-top:-2.5px;margin-right:2px;margin-left:-3px;filter:invert(0.8);">Update Version: <br><span style="font-weight:initial;">${stripTags(version)}</span></div><div style="font-size:12px;font-weight:800;" class="text-info"><img style="background-image:none;margin:0px;margin-top:-2px;margin-bottom:0px;transform:scale(1);border:none;margin-left:0px;margin-right:4px;width:15px;height:15px;" src="${chrome.runtime.getURL('/images/timer_dark.svg')}" class="info-label icon-pastname">Server Uptime: <br><span style="font-weight:initial;">${stripTags(timeSince)}</span></div></div></div>`
		serverInfoDiv = div.childNodes[0]
		joinButton = elem.getElementsByClassName('rbx-game-server-join')[0]
		if (typeof joinButton == 'undefined') {
			joinButton = elem.getElementsByClassName('rbx-friends-game-server-join')[0]
		}
		if (typeof joinButton == 'undefined') {
			joinButton = elem.getElementsByClassName('ropro-game-server-join')[0]
			joinButton.parentNode.insertBefore(document.createElement('br'), joinButton)
			serverInfoDiv.style.float = "left"
		}
		joinButton.parentNode.insertBefore(serverInfoDiv, joinButton)
	}
	for (var i = 0; i < servers.length; i++) {
		if (!(servers[i] in info)) {
			elem = elems[servers[i]]
			div = document.createElement('div')
			div.innerHTML = `<div style="cursor:pointer;white-space: nowrap;overflow: hidden !important;text-overflow: ellipsis;" class="ropro-server-info text-info"><img class="server-filter-img" src="${chrome.runtime.getURL('/images/earth_icon.png')}" style="width:15px;margin-top:0px;margin-right:5px;margin-left:2px;filter:invert(0.8);"><span style="font-size:12px;font-weight:initial;">Unknown Region</span><div style="pointer-events:none;display:block;position:absolute;z-index:10000;text-align:center;background-color:#232527;padding:10px;border-radius:5px;margin-top:5px;top:40px;left:5px;padding-left:20px;padding-right:20px;" class="ropro-server-info-tooltip"><div style="font-size:12px;font-weight:800;margin-top:5px;margin-bottom:5px;" class="text-info"><img class="server-filter-img" src="${chrome.runtime.getURL('/images/earth_icon.png')}" style="width:17px;margin-top:-2px;margin-right:5px;filter:invert(0.8);">Server Region: <br><span style="font-weight:initial;">Unknown Region</span></div><div style="font-size:12px;font-weight:800;margin-bottom:5px;" class="text-info"><img class="server-filter-img" src="${chrome.runtime.getURL('/images/Server_Version2.svg')}" style="width:22px;margin-top:-2.5px;margin-right:2px;margin-left:-3px;filter:invert(0.8);">Update Version: <br><span style="font-weight:initial;">Unknown Version</span></div><div style="font-size:12px;font-weight:800;" class="text-info"><img style="background-image:none;margin:0px;margin-top:-2px;margin-bottom:0px;transform:scale(1);border:none;margin-left:0px;margin-right:4px;width:15px;height:15px;" src="${chrome.runtime.getURL('/images/timer_dark.svg')}" class="info-label icon-pastname">Server Uptime: <br><span style="font-weight:initial;">Unknown</span></div></div></div>`
			serverInfoDiv = div.childNodes[0]
			joinButton = elem.getElementsByClassName('rbx-game-server-join')[0]
			if (typeof joinButton == 'undefined') {
				joinButton = elem.getElementsByClassName('rbx-friends-game-server-join')[0]
			}
			if (typeof joinButton == 'undefined') {
				joinButton = elem.getElementsByClassName('ropro-game-server-join')[0]
				joinButton.parentNode.insertBefore(document.createElement('br'), joinButton)
				serverInfoDiv.style.float = "left"
			}
			joinButton.parentNode.insertBefore(serverInfoDiv, joinButton)
		}
	}
}

function isNormalInteger(str) {
    return /^\+?(0|[1-9]\d*)$/.test(str);
}

var comments = false
var serverSpeedButton = false

async function checkGamePage() {
	if (window.location.href.includes("games/")) {
		gameSplit = window.location.href.split("games/")[1]
	} else {
		gameSplit = window.location.href.split("discover/")[1]
	}
	if (typeof gameSplit != 'undefined') {
		globalGameId = gameSplit.split("/")[0]
		if (isNormalInteger(globalGameId)) { // Valid Game Page
			/**try {
				if (true) {
					addComments(globalGameId)
				}
			} catch(e) {
				console.log(e)
			}**/
			if (await fetchSetting("randomServer")) {
				addRandomServerButton()
			}
			if (await fetchSetting("cloudPlay")) {
				addCloudPlayButton()
				setInterval(function() {
					$('.ropro-cloud-play-enabled .rbx-game-server-join:not(.ropro-cloud-play-listener)').click(function(e) {
						if (document.body.classList.contains('ropro-cloud-play-activated')) {
							e.stopPropagation()
							var serverId = stripTags($(this).parents('.rbx-game-server-item').get(0).getAttribute('data-gameid'))
							launchCloudPlay(serverId)
						}
					})
					$('.ropro-cloud-play-enabled .rbx-private-game-server-join:not(.ropro-cloud-play-listener)').click(function(e) {
						if (document.body.classList.contains('ropro-cloud-play-activated')) {
							e.stopPropagation()
							var accessCode = stripTags($(this).parents('.rbx-private-game-server-item').get(0).getAttribute('data-accesscode'))
							launchCloudPlay(null, accessCode)
						}
					})
					$('.ropro-cloud-play-enabled .ropro-game-server-join:not(.ropro-cloud-play-listener)').click(function(e) {
						if (document.body.classList.contains('ropro-cloud-play-activated')) {
							e.stopPropagation()
							var serverId = stripTags($(this).parents('.rbx-game-server-item').get(0).getAttribute('data-gameid'))
							launchCloudPlay(serverId)
						}
					})
					$('.ropro-cloud-play-enabled .rbx-friends-game-server-join:not(.ropro-cloud-play-listener)').click(function(e) {
						if (document.body.classList.contains('ropro-cloud-play-activated')) {
							e.stopPropagation()
							var serverId = stripTags($(this).parents('.rbx-friends-game-server-item').get(0).getAttribute('data-gameid'))
							launchCloudPlay(serverId)
						}
					})
					$('.ropro-cloud-play-enabled .rbx-game-server-join:not(.ropro-cloud-play-listener)').addClass('ropro-cloud-play-listener')
					$('.ropro-cloud-play-enabled .rbx-private-game-server-join:not(.ropro-cloud-play-listener)').addClass('ropro-cloud-play-listener')
					$('.ropro-cloud-play-enabled .ropro-game-server-join:not(.ropro-cloud-play-listener)').addClass('ropro-cloud-play-listener')
					$('.ropro-cloud-play-enabled .rbx-friends-game-server-join:not(.ropro-cloud-play-listener)').addClass('ropro-cloud-play-listener')
				}, 500)
			}
			placeInfo = await fetchPlaceInfo(parseInt(globalGameId))
			myUniverseId = parseInt(placeInfo[0]['universeId'])
			try{
				addEmbeds(document.getElementById('game-detail-page'), myUniverseId)
			} catch (e) {
				//console.log(e)
			}
			gameInfo = await fetchGameInfo(myUniverseId)
			var mostRecentServerSetting = await fetchSetting("mostRecentServer")
			var serverFiltersSetting = await fetchSetting("serverFilters")
			var roproVoiceServersSetting = await fetchSetting("roproVoiceServers")
			try {
				var serverInterval = setInterval(async function(){
					if (document.getElementById('rbx-running-games') != null) {
						//clearInterval(serverInterval)
						if (serverFiltersSetting && document.getElementById('roproServerFiltersButton') == null) {
							addServerFilters(globalGameId, gameInfo.data[0].maxPlayers)
						}
						if (roproVoiceServersSetting && document.getElementById('roproVoiceServers') == null) {
							addVoiceServers(globalGameId)
						}
						if (mostRecentServerSetting && document.getElementById('roproMostRecentServerContainer') == null) {
							//clearInterval(serverInterval)
							addRecentServer(parseInt(myUniverseId))
							loadMostRecentServer(myUniverseId)
							setInterval(function(){
								if (mostRecentServerSetting) {
									loadMostRecentServer(myUniverseId)
								}
							}, 120000)
						}
					}
				}, 500)
				if (serverFiltersSetting && document.getElementById('roproServerFiltersMiniButton') == null) {
					serverTab = document.getElementById('tab-game-instances')
					serverFiltersMiniDiv = document.createElement('div')
					serverFiltersMiniDiv.innerHTML = serverFiltersMiniHTML
					serverTab.appendChild(serverFiltersMiniDiv)
					serverFiltersDropdownMini = document.getElementById('serverFiltersDropdownMini')
					serverFiltersDropdownMini.addEventListener('click', function() {
						if (document.getElementById('serverFiltersDropdownBoxMini').style.display == "block") {
							document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
							$('.server-filter-option.active').removeClass('active')
						} else {
							document.getElementById('serverFiltersDropdownBoxMini').style.display = "block";
						}
					})
				}
			} catch (e) {
				console.log(e)
			}
			if (await fetchSetting("liveLikeDislikeFavoriteCounters")) {
				liveCounters()
			}
			livePlaying()
			if (await fetchSetting("playtimeTracking")) {
				addPlayTime(parseInt(myUniverseId))
			}
			serverSpeedButton = await fetchSetting("serverInviteLinks")
			if (await fetchSetting("serverInviteLinks") || serverSpeedButton || await fetchSetting("serverInfo")) {
				setInterval(function() {
					servers = document.getElementsByClassName('rbx-game-server-item')
					for (i = 0; i < servers.length; i++) {
						joinbutton = servers[i].getElementsByClassName('rbx-game-server-join')[0]
						if (typeof joinbutton != 'undefined' && servers[i].getElementsByClassName('create-server-link').length == 0) {
							joinbutton.setAttribute('create-server-link-added', 'true')
							serverid = servers[i].getAttribute('data-gameid')
							placeid = globalGameId
							if (serverid != null) {
								addServerInviteButton(servers[i], serverid, placeid)
							}
						}
					}
					servers = document.getElementsByClassName('rbx-friends-game-server-item')
					for (i = 0; i < servers.length; i++) {
						joinbutton = servers[i].getElementsByClassName('rbx-friends-game-server-join')[0]
						if (typeof joinbutton != 'undefined' && servers[i].getElementsByClassName('create-server-link').length == 0) {
							joinbutton.setAttribute('create-server-link-added', 'true')
							serverid = servers[i].getAttribute('data-gameid')
							placeid = globalGameId
							if (serverid != null) {
								addServerInviteButton(servers[i], serverid, placeid)
							}
						}
					}
				}, 1000)
				const observer = new MutationObserver(function(a) {
					servers = document.getElementsByClassName('rbx-game-server-item')
					for (i = 0; i < servers.length; i++) {
						//console.log(servers[i])
						joinbutton = servers[i].getElementsByClassName('rbx-game-server-join')[0]
						if (typeof joinbutton != 'undefined' && servers[i].getElementsByClassName('create-server-link').length == 0) {
							joinbutton.setAttribute('create-server-link-added', 'true')
							serverid = servers[i].getAttribute('data-gameid')
							placeid = globalGameId
							if (serverid != null) {
								//console.log("ADDING INVITE")
								addServerInviteButton(servers[i], serverid, placeid)
							}
						}
					}
				});
				var serverContainerInterval = setInterval(function(){ 
					serverContainer = document.getElementById('rbx-game-server-item-container')
					//console.log(serverContainer)
					if (serverContainer != null) {
						clearInterval(serverContainerInterval)
						observer.observe(serverContainer, {subtree: true, childList: true})
					}
				}, 1000)
			}
			if (await fetchSetting("additionalServerInfo")) {
				setInterval(function(){
					if (serverInfoQueue.length > 0) {
						tempQueue = serverInfoQueue
						serverInfoQueue = []
						getServerInfo(tempQueue)
					}
				}, 100)
			}
			var psInterval1 = setInterval(function() {
				if (document.getElementsByClassName('rbx-private-server-create').length > 1) {
					clearInterval(psInterval1)
					addHidePrivateServers()
					$('.rbx-refresh.refresh-link-icon').click(function() {
						gameServers = document.getElementsByClassName('rbx-game-server-item')
						for (i = 0; i < gameServers.length; i++) {
							gameServers[i].classList.remove('ropro-checked')
							gameServers[i].classList.remove('ropro-server-invite-added')
							info = gameServers[i].getElementsByClassName('ropro-server-info')
							if (info.length > 0) {
								info[0].remove()
							}
							link = gameServers[i].getElementsByClassName('create-server-link')
							if (link.length > 0) {
								link[0].remove()
							}
						}
					})
				}
			}, 100)
		}
	}
}
checkGamePage()

$(document).ready(async function() {
	servers = document.getElementsByClassName('rbx-game-server-item')
	for (i = 0; i < servers.length; i++) {
		joinbutton = servers[i].getElementsByClassName('rbx-game-server-join')[0]
		if (typeof joinbutton != 'undefined' && servers[i].getElementsByClassName('create-server-link').length == 0) {
			joinbutton.setAttribute('create-server-link-added', 'true')
			serverid = servers[i].getAttribute('data-gameid')
			placeid = globalGameId
			if (serverid != null) {
				addServerInviteButton(servers[i], serverid, placeid)
			}
		}
	}
})

chrome.runtime.onMessage.addListener(async function(event) {
	if (event.type == "invite") {
		invite = await fetchInvite(event.key.substring(0, 6))
		if (document.body.classList.contains('ropro-cloud-play-activated')) {
			launchCloudPlay(invite.jobid.replace(/[^0-9a-z-]/gi, ''))
		} else {
			document.getElementsByClassName('game-name')[0].setAttribute('onclick', `Roblox.GameLauncher.joinGameInstance(${parseInt(invite.placeid)}, "${invite.jobid.replace(/[^0-9a-z-]/gi, '')}")`)
			document.getElementsByClassName('game-name')[0].click()
		}
		setTimeout(function() {
			//window.close()
		}, 2000)
	}
})

$(window).click(function(event) {
	if (document.getElementsByClassName('server-invite-link-box').length > 0) {
		document.getElementsByClassName('server-invite-link-box')[0].remove()
	}
	//if (document.getElementsByClassName('server-speed-test-box').length > 0) {
	//	document.getElementsByClassName('server-speed-test-box')[0].remove()
	//}
})

window.addEventListener('message', async function(e) {
    if (e.data.type == 'globe_click') {
		if (await fetchSetting("moreServerFilters")) {
			serverLocation = stripTags(e.data.location)
			if (document.getElementById('loadingBar') == null) {
				div = document.createElement('div')
				div.innerHTML = `<span id="loadingBar" style="transform: scale(0.8);visibility:initial!important;margin:0px;margin-bottom:-5px;width:100px;height:30px;" class="spinner spinner-default"></span>`
				document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].appendChild(div.childNodes[0])
			}
			document.getElementById('rbx-game-server-item-container').innerHTML = ``
			if (document.getElementsByClassName('rbx-running-games-footer').length > 0) {
				document.getElementsByClassName('rbx-running-games-footer')[0].style.display = "none"
			}
			if (document.getElementsByClassName('ropro-running-games-footer').length > 0) {
				loadMoreInitialized = false
				document.getElementsByClassName('ropro-running-games-footer')[0].remove()
			}
			document.getElementById('serverFiltersDropdownBox').style.display = "none";
			document.getElementById('serverFiltersDropdownBoxMini').style.display = "none";
			$('.server-filter-option.active').removeClass('active')
			document.getElementById('rbx-running-games').getElementsByClassName('container-header')[0].scrollIntoView()
			customServerList = await fetchServerFilterRegion(globalGameId, serverLocation)
			loadServerPage(globalGameId, 0, false)
			if (document.getElementById('loadingBar') != null) {
				document.getElementById('loadingBar').remove()
			}
		} else {
			upgradeModalServerFilters()
		}
	}
});
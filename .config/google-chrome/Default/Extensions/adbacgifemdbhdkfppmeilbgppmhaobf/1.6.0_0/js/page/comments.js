var embeddedRolimonsUserLink = false;

const commentsBoxHTML = `<div id="AjaxCommentsContainer" class="comments-container" data-asset-id="4935029747" data-total-collection-size="" data-is-user-authenticated="True" data-signin-url="https://www.roblox.com/newlogin?returnUrl=%2Fcatalog%2F4935029747%2FBlack-Royal-Braid" data-account-url="https://www.roblox.com/my/account?confirmemail=1" data-newline-limit="10" data-character-limit="200" data-filter-enabled="true" data-bedev2-captcha-enabled="true" data-is-error-code-returned-from-comments-post-endpoint="true">

        <div class="container-header">
            <h3>RoPro ${stripTags(chrome.i18n.getMessage("Comments"))}</h3>
        </div>
        <div class="section-content AddAComment">
            <div class="comment-form">
                <form class="form-horizontal ng-pristine ng-valid" role="form">
                    <div class="form-group">
                        <textarea id="messageBox" class="form-control input-field rbx-comment-input blur" placeholder="${stripTags(chrome.i18n.getMessage("WriteAComment"))}" rows="1"></textarea>
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
    </div>`


function formatDate(date) {
	date = new Date(date)
	date = new Date(date - date.getTimezoneOffset()*60*1000)
	months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	am_pm = "AM"
	hour = date.getHours()
	if (hour >= 12) {
		hour = hour - 12
		am_pm = "PM"
	}
	if (hour == 0) {
		hour = 12
	}
	minutes = date.getMinutes()
	if (minutes < 10) {
		minutes = "0" + minutes
	}
	dateString = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} | ${hour}:${minutes} ${am_pm}`
	return dateString
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

function commentError(error){
	
	errorElement = document.getElementById('commentError')
	errorElement.setAttribute("style", "display: block;")
	errorElement.innerHTML = stripTags(error)
	
}

function closeError(){
	
	errorElement = document.getElementById('commentError')
	errorElement.setAttribute("style", "display: none;")
	errorElement.innerHTML = ""
	
}


function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }


async function generateComment(commentArray) {
	commentsMain = document.getElementById('commentsmain')
	userid = stripTags(commentArray.userid)
	username = stripTags(commentArray.username)
	comment = stripTags(commentArray.comment)
	date = stripTags(commentArray.date)
	rand = Math.floor(Math.random() * 1000000)
	if (embeddedRolimonsUserLink) {
		linkIcon = '<a style="margin-left:5px;margin-top:5px;" target = "_blank" href = "https://www.rolimons.com/player/' + parseInt(userid) + '"><svg id = "roliLink" aria-hidden="true" width="1em" height="1em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10.586 13.414a1 1 0 0 1-1.414 1.414 5 5 0 0 1 0-7.07l3.535-3.536a5 5 0 0 1 7.071 7.071l-1.485 1.486a7.017 7.017 0 0 0-.405-2.424l.476-.476a3 3 0 1 0-4.243-4.243l-3.535 3.536a3 3 0 0 0 0 4.242zm2.828-4.242a1 1 0 0 1 1.414 0 5 5 0 0 1 0 7.07l-3.535 3.536a5 5 0 0 1-7.071-7.07l1.485-1.486c-.008.82.127 1.641.405 2.423l-.476.476a3 3 0 1 0 4.243 4.243l3.535-3.536a3 3 0 0 0 0-4.242 1 1 0 0 1 0-1.414z" fill="#fff"></path></svg></a>'
	} else {
		linkIcon = ''
	}
	commentHTML = `                <div class="comment-item list-item" data-comment-id="">
						<div class="comment-user list-header">
							<div class="Avatar avatar avatar-headshot-md roblox-avatar-image" data-user-id="${parseInt(userid)}" data-image-size="small"><div style="position: relative;"><a href="https://www.roblox.com/users/${parseInt(userid)}/profile"><img class="ropro-player-thumbnail-${parseInt(userid)}" title="${stripTags(username)}" alt="${stripTags(username)}" border="0" src="${chrome.runtime.getURL('/images/empty.png')}"></a></div></div>
						</div>
						<div class="comment-body list-body">
							<a class="text-name" href="https://www.roblox.com/users/${parseInt(userid)}/profile">${stripTags(username)}</a>${linkIcon}
							<p class="comment-content list-content">${stripTags(comment)}</p>
							<span class="xsmall text-date-hint">${formatDate(date)}</span>
						</div>
						<a userid="${parseInt(userid)}" id="${parseInt(rand)}" class="open-trades-comment" style="display:none;" target="_blank" href="https://www.roblox.com/users/${parseInt(userid)}/trade">
						<div class="comment-controls">
							<span class="icon-nav-trade"></span>
							Open Trades
						</div>
						</a>
					</div>`
	commentsMain.innerHTML += commentHTML
	checkCanTrade(rand)
}

async function checkCanTrade(myRand) {
	console.log(myRand)
	comment = document.getElementById(myRand.toString())
	userID = comment.getAttribute('userid')
	canTrade = await fetchCanTrade(userID)
	myComment = document.getElementById(myRand.toString())
	if (canTrade) {
		myComment.style.display = "block";
	}
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

function getComments(itemID, page) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({greeting: "GetURL", url:"https://api.ropro.io/getComments.php?id=" + itemID + "&page=" + page}, 
			function(data) {
				resolve(data)
			}
		)
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

async function refreshComments() {
	itemID = getIdFromURL(location.href)
	commentsJSON = await getComments(itemID, 0)
	commentsJSON = JSON.parse(commentsJSON)
	document.getElementById('commentsmain').innerHTML = ""
	seeMore = document.getElementById('seemore')
	seeMore.setAttribute("itemid", `${parseInt(itemID)}`)
	seeMore.setAttribute("page", "1")
	if (commentsJSON.comments.length > 0) {
		seeMore.setAttribute("style", "display:block;")
		commentsJSON.comments.forEach(generateComment)
	} else {
		document.getElementById('commentsmain').innerHTML += stripTags(chrome.i18n.getMessage("NoCommentsYetBeTheFirstToWriteOne"))
		seeMore.setAttribute("style", "display:none;")
	}
	var userIds = []
	for (var i = 0; i < commentsJSON.comments.length; i++) {
		userIds.push(parseInt(commentsJSON.comments[i].userid))
	}
	loadPlayerThumbnails(userIds)
}

async function postComment() {
	itemID = getIdFromURL(location.href)
	message = document.getElementById('messageBox')
	if (await checkVerification()) {
		if (message.value.length != 0) {
			if (message.value.length <= 200) {
				closeError()
				userID = await getUserId()
				json = {itemid: itemID, userid: userID, comment: message.value}
				return new Promise(resolve => {
					return new Promise(resolve => {
						chrome.runtime.sendMessage({greeting: "PostURL", url:"https://api.ropro.io/postComment.php", jsonData: json}, 
							function(data) {
								response = JSON.parse(data)
								if ('error' in response) { // Comment post errored
									commentError(response['error'])
								} else { // Successfully posted comment
									message.value = ""
									refreshComments()
								}
								resolve(data)
								
							}
						)
					})
				})
			} else {
				commentError(`Maximum comment length is 200 characters. (${message.value.length}/200)`)
			}
		} else {
			commentError("You must enter a comment.")
		}
	} else {
		alert("You must verify your user with RoPro at roblox.com/home before posting comments.")
	}
}

async function loadComments(itemID, page) {
	commentsJSON = await getComments(itemID, page)
	commentsJSON = JSON.parse(commentsJSON)
	console.log(commentsJSON)
	console.log(page)
	if (commentsJSON.valid) {
		seeMore = document.getElementById('seemore')
		if (commentsJSON.comments.length > 0) {
			commentsJSON.comments.forEach(generateComment)
		}
		if (commentsJSON.more) {
			seeMore.setAttribute("page", `${parseInt(page) + 1}`)
		} else {
			seeMore.setAttribute("style", "display:none;")
		}
		var userIds = []
		for (var i = 0; i < commentsJSON.comments.length; i++) {
			userIds.push(parseInt(commentsJSON.comments[i].userid))
		}
		loadPlayerThumbnails(userIds)
	}
}

function insertCommentBox(){
	
	commentsBox = document.createElement("div");
	commentsBox.innerHTML = commentsBoxHTML
	container = document.getElementById('item-container')
	container.insertBefore(commentsBox, container.childNodes[container.childNodes.length-1])
	
}

function getIdFromURL(url) {
	return parseInt(url.split("catalog/")[1].split("/")[0])
}

async function mainComments(){
	
	if (location.href.includes("/catalog/") && location.href.split("/catalog/")[1].includes("/")) {
		itemID = getIdFromURL(location.href)
		if (itemID != undefined && itemID != 0) {
			setTimeout(async function(){
				commentsJSON = await getComments(itemID, 0)
				commentsJSON = JSON.parse(commentsJSON)
				console.log(commentsJSON)
				if (commentsJSON.valid) {
					insertCommentBox()
					postCommentButton = document.getElementById('postComment')
					postCommentButton.addEventListener("click", postComment);
					seeMore = document.getElementById('seemore')
					seeMore.setAttribute("itemid", `${parseInt(itemID)}`)
					seeMore.setAttribute("page", "1")
					seeMore.addEventListener("click", function(){
						loadComments(parseInt(seeMore.getAttribute("itemid")), parseInt(seeMore.getAttribute("page")))
					});
					if (commentsJSON.comments.length > 0) {
						commentsJSON.comments.forEach(generateComment)
					} else {
						document.getElementById('commentsmain').innerHTML += stripTags(chrome.i18n.getMessage("NoCommentsYetBeTheFirstToWriteOne"))
						seeMore.setAttribute("style", "display:none;")
					}
					var userIds = []
					for (var i = 0; i < commentsJSON.comments.length; i++) {
						userIds.push(parseInt(commentsJSON.comments[i].userid))
					}
					loadPlayerThumbnails(userIds)
				}
			}, 2000)
		}
	}
	
}

async function doComments() {
	if (await fetchSetting("comments")) {
		embeddedRolimonsUserLink = await fetchSetting("embeddedRolimonsUserLink")
		mainComments()
	}
}
doComments()
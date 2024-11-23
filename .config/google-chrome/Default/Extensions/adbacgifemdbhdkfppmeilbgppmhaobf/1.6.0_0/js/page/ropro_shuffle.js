//--------------------RoPro Shuffle--------------------
//Developer Note:
//RoPro Shuffle is a preview feature, the full version will be available with the release of RoPro v2.0.
//We are still in development of RoPro v2.0. It is a rewrite of RoPro which will be far more stable and maintanable than RoPro v1.5.
//RoPro v2.0 is a Manifest v3 extension, and uses React & Typescript to vastly improve the RoPro codebase. We're also rebuilding the backend infrastructure to improve reliability.

//Utility functions, in RoPro v2.0 these will be imported from an ES6 module to avoid duplicate code.
function addCommas(nStr) {
  nStr += "";
  var x = nStr.split(".");
  var x1 = x[0];
  var x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
}

function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.abs(num) > 999999
      ? Math.sign(num) * (Math.abs(num) / 1000000).toFixed(1) + "m"
      : Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
    : Math.sign(num) * Math.abs(num);
}

function getOffset(el) {
  var _x = 0;
  var _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
}

var url_matches = ["/discover*", "/discover/*"];

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
          var locale_subpath = "/" + path_split.slice(2).join("/");
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

//Make sure we're on the right page here, factoring in the recently added locale subpaths (Ex: "roblox.com/en-us/games/...").
//The content script matches defined in manifest.json should mostly handle this, but verifyPath() accounts for rare edge cases.
//In RoPro v2.0 this will be an ES6 imported module function to avoid duplicate code.
if (!verifyPath(url_matches)) throw new Error("RoPro Error: Invalid path!");

//Properly match the RoPro Sorts style to the Roblox.com site theme.
var theme = $(".light-theme").length > 0 ? "light" : "dark";

//Get language code of current user.
var language_code = $("meta[name='locale-data']").attr("data-language-code");

//Global variables for the RoPro Sorts feature.
var allExperiencesLeftScroll = 0;

//API Fetching functions. These are outsourced to the background.js file due to CORS.
function fetchExperiences(options) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        greeting: "GetURL",
        url: `https://node.ropro.io/experiences/list?page=${options.page}&language_code=${options.language_code}&order=${options.order}`,
      },
      function (data) {
        resolve(data);
      }
    );
  });
}

function fetchSetting(setting) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { greeting: "GetSetting", setting: setting },
      function (data) {
        resolve(data);
      }
    );
  });
}

function addExperience(experience) {
  experience_html = `<div title="${stripTags(experience.name)}" class="large-game-tile game-tile-container large-tile-universe-${parseInt(experience.id)}">
	<a href="https://roblox.com/games/${parseInt(experience.place_id)}" class="game-card-link large-game-tile-container">
	  <div class="cursor-pointer">
		<div class="large-game-tile-thumb-container placeholder-game-thumbnail" style="overflow:hidden;border-radius:10px;">
		  <img class="placeholder-game-thumbnail large-game-tile-thumb" src="${stripTags(experience.thumbnail)}" />
		</div>
		<div class="large-game-tile-overlay" style="border-radius:10px;">
		  <div class="large-game-tile-info-container">
			<h1 class="text-overflow large-game-tile-name" style="padding-bottom:0px;">${stripTags(experience.name)}</h1>
			<div class="game-card-info large-game-tile-info" style="padding-top:0px;">
			  <span class="info-label icon-votes-gray-white-70"></span>
			  <span class="info-label vote-percentage-label">${parseInt(experience.likes)}%</span>
			  <span class="info-label icon-playing-counts-gray-white-70"></span>
			  <span class="info-label playing-counts-label" title="${parseInt(experience.active)} active players">${addCommas(experience.active)}</span>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  </div>`;
  $('.ropro-all-experiences-game-cards:first').append(experience_html);
}

var all_experiences_options = {
  language_code: language_code,
  order: "active",
  page: 0
}

async function loadAllExperiences() {
  $('.ropro-experiences-loading-spinner').css('display', 'block');
  var experiences = {};
  await fetchExperiences(all_experiences_options).then(async (data) => {
    if (data != null) {
      data.forEach((experience) => {
        addExperience(experience);
      });
      $('.ropro-all-experiences-scroll-next:first').removeClass('disabled');
      if (all_experiences_options.page == 0) {
        $('.ropro-all-experiences-scroll-prev:first').addClass('disabled');
      }
    }
    $('.ropro-experiences-loading-spinner').css('display', 'none');
  });
}

async function addAllExperiences() {
  if (await fetchSetting("allExperiences")) {
    var roproShuffle = await fetchSetting("roproShuffle");
    ropro_all_experiences_section_html = `
    <div class="ropro-all-experiences-list-container games-list-container is-windows" style="margin-bottom:30px;margin-left:0px;margin-right:0px;">
      <div id="allExperiences" data-page="0" class="container-header games-filter-changer ropro-all-experiences-title">
        <h3 style="margin-left:10px;position:relative;">All Experiences</h3>
        <div class="ropro-all-experiences-shuffle" style="${roproShuffle ? '' : 'display:none;'}user-select:none;cursor:pointer;margin-right:10px;margin-left:0px;margin-top:-7px;background-opacity:50%;float:right;border-radius:5px;font-weight:400;padding:5px;padding-left:10px;padding-right:10px;border:1px solid rgba(255, 255, 255, 0.4)!important">RoPro Shuffle<img src="${chrome.runtime.getURL('/images/reload.png')}" style="filter:invert(1);width:20px;margin-left:5px;margin-top:-2px;"></div>
      </div>
      <div id="allExperiences" data-page="0" class="container-header games-filter-changer ropro-shuffle-title" style="display:none;">
        <h3 style="margin-left:10px;position:relative;">RoPro Shuffle
        <div class="ropro-randomizer-info-button" style="display:inline-block;"><img src="${chrome.runtime.getURL('/images/info.png')}" style="margin-left:0px;margin-bottom:2px;width:20px;"><div class="ropro-randomizer-tooltip" style="z-index:20;padding:20px;border-radius:10px;color:white!important;background-color:#191B1D;width:300px;top:30px;left:70px;position:absolute;display:block;margin-top;5px;float:left;font-size:12px;float:left;padding-top:20px; display:none;"><div> RoPro retrieves really random Roblox realms.
        </div><p style="margin-top:5px;font-size:12px;">All Roblox experiences above an active player threshold are randomly sampled with each request to help you find something new! Feeling lucky?
        </p>
        </div></div></h3>
      </div>
      </a>
      <div class="horizontal-scroller games-list">
        <span id="allExperiencesLoading" style="position:absolute; top:0px; right:0px; display: block; width: 100px; height: 120px; visibility: initial !important;margin-right:calc(50% - 50px);margin-top:10px;transform:scale(1);" class="spinner spinner-default ropro-experiences-loading-spinner"></span>
        <div class="clearfix horizontal-scroll-window">
            <div class="horizontally-scrollable" style="left: 0px;">
              <ul id="allExperiencesList" class="hlist games game-cards game-tile-list ropro-all-experiences-game-cards"></ul>
            </div>
            <div style="height:270px;z-index:2;" class="ropro-all-experiences-scroll-prev scroller prev disabled" role="button" aria-hidden="true">
              <div class="arrow"><span class="icon-games-carousel-left"></span></div>
            </div>
            <div style="height:270px;z-index:2;" class="ropro-all-experiences-scroll-next scroller next" role="button" aria-hidden="true">
              <div class="arrow"><span class="icon-games-carousel-right"></span></div>
            </div>
        </div>
      </div>
    </div>
    `;
    $('.games-page-container:first .section:first').after(ropro_all_experiences_section_html);
    $('.ropro-all-experiences-scroll-next:first').click(allExperiencesNext);
    $('.ropro-all-experiences-scroll-prev:first').click(allExperiencesPrev);
    $('.ropro-all-experiences-shuffle').click(function () {
      $('.ropro-all-experiences-title').css('display', 'none');
      $('.ropro-shuffle-title').css('display', 'block');
      $('.ropro-all-experiences-shuffle').css('display', 'none');
      all_experiences_options.page = 0;
      all_experiences_options.order = "shuffle";
      $('.ropro-all-experiences-list-container:first .large-game-tile').remove();
      allExperiencesLeftScroll = 0;
      $('.ropro-all-experiences-list-container:first .horizontally-scrollable:first').css('left', allExperiencesLeftScroll + 'px');
      loadAllExperiences();
    });
    loadAllExperiences();
  }
}

function allExperiencesNext() {
  difference = $('.ropro-all-experiences-scroll-next:first').offset().left - $('.ropro-all-experiences-scroll-prev:first').offset().left;
  cardWidth = $('.ropro-all-experiences-list-container:first .large-game-tile:first').outerWidth(true);
  if (!$('.ropro-all-experiences-scroll-next:first').hasClass('disabled')) {
    allExperiencesLeftScroll -= Math.floor(difference / cardWidth) * cardWidth;
    $('.ropro-all-experiences-list-container:first .horizontally-scrollable:first').css('left', allExperiencesLeftScroll + 'px');
    if ($('.ropro-all-experiences-list-container:first .large-game-tile').length <
        Math.abs(Math.floor(allExperiencesLeftScroll / cardWidth)) +
          Math.ceil(difference / cardWidth)) {
      $('.ropro-all-experiences-scroll-next:first').addClass('disabled');
      if (all_experiences_options.order == "active") {
        all_experiences_options.page++;
      }
      loadAllExperiences();
    }
    if (Math.abs(Math.floor(allExperiencesLeftScroll / cardWidth)) > 0) {
      $('.ropro-all-experiences-scroll-prev:first').removeClass('disabled');
    }
  }
};

function allExperiencesPrev() {
  difference = $('.ropro-all-experiences-scroll-next:first').offset().left - $('.ropro-all-experiences-scroll-prev:first').offset().left;
  cardWidth = $('.ropro-all-experiences-list-container:first .large-game-tile:first').outerWidth(true);
  if (!$('.ropro-all-experiences-scroll-prev:first').hasClass('disabled')) {
    allExperiencesLeftScroll += Math.floor(difference / cardWidth) * cardWidth;
    allExperiencesLeftScroll = Math.min(0, allExperiencesLeftScroll);
    $('.ropro-all-experiences-list-container:first .horizontally-scrollable:first').css('left', allExperiencesLeftScroll + 'px');
    if (Math.abs(Math.floor(allExperiencesLeftScroll / cardWidth)) == 0) {
      $('.ropro-all-experiences-scroll-prev:first').addClass('disabled');
    }
    if (
      $('.ropro-all-experiences-list-container:first .large-game-tile').length >=
      Math.abs(Math.floor(allExperiencesLeftScroll / cardWidth)) +
        Math.ceil(difference / cardWidth)) {
      $('.ropro-all-experiences-scroll-next:first').removeClass('disabled');
    }
  }
}

var myInterval = setInterval(function () {
  if ($('.container-header.games-filter-changer').length > 0) {
    clearInterval(myInterval);
    if ($('.ropro-all-experiences-list-container').length == 0) {
      addAllExperiences();
    }
  }
}, 100);

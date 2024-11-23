//RoPro v1.6
//RoPro v2.0 revamp coming soon. RoPro v2.0 is a total rewrite of RoPro using React & Tailwind to make the extension faster, more reliable, and more maintainable.

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, function (obj) {
      resolve(obj[key]);
    });
  });
}

function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, function () {
      resolve();
    });
  });
}

function getLocalStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, function (obj) {
      resolve(obj[key]);
    });
  });
}

function setLocalStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, function () {
      resolve();
    });
  });
}

var defaultSettings = {
  buyButton: true,
  comments: true,
  dealCalculations: "rap",
  dealNotifier: true,
  embeddedRolimonsItemLink: true,
  embeddedRolimonsUserLink: true,
  fastestServersSort: true,
  gameLikeRatioFilter: true,
  gameTwitter: true,
  genreFilters: true,
  groupDiscord: true,
  groupRank: true,
  groupTwitter: true,
  featuredToys: true,
  itemPageValueDemand: true,
  linkedDiscord: true,
  liveLikeDislikeFavoriteCounters: true,
  livePlayers: true,
  liveVisits: true,
  roproVoiceServers: true,
  premiumVoiceServers: true,
  moreGameFilters: true,
  additionalServerInfo: true,
  moreServerFilters: true,
  serverInviteLinks: true,
  serverFilters: true,
  mostRecentServer: true,
  randomServer: true,
  tradeAge: true,
  notificationThreshold: 30,
  itemInfoCard: true,
  ownerHistory: true,
  profileThemes: true,
  globalThemes: true,
  lastOnline: true,
  roproEggCollection: true,
  profileValue: true,
  projectedWarningItemPage: true,
  quickItemSearch: true,
  quickTradeResellers: true,
  hideSerials: true,
  quickUserSearch: true,
  randomGame: true,
  popularToday: true,
  reputation: true,
  reputationVote: true,
  sandbox: true,
  sandboxOutfits: true,
  serverSizeSort: true,
  singleSessionMode: false,
  tradeDemandRatingCalculator: true,
  tradeItemDemand: true,
  tradeItemValue: true,
  tradeNotifier: true,
  tradeOffersPage: true,
  tradeOffersSection: true,
  tradeOffersValueCalculator: true,
  tradePageProjectedWarning: true,
  tradePreviews: true,
  tradeProtection: true,
  tradeValueCalculator: true,
  moreTradePanel: true,
  valueThreshold: 0,
  hideTradeBots: true,
  autoDeclineTradeBots: true,
  hideDeclinedNotifications: true,
  hideOutboundNotifications: false,
  tradePanel: true,
  quickDecline: true,
  quickCancel: true,
  roproIcon: true,
  underOverRAP: true,
  winLossDisplay: true,
  mostPlayedGames: true,
  allExperiences: true,
  roproShuffle: true,
  experienceQuickSearch: true,
  experienceQuickPlay: true,
  avatarEditorChanges: true,
  playtimeTracking: true,
  activeServerCount: true,
  morePlaytimeSorts: true,
  roproBadge: true,
  mutualFriends: true,
  moreMutuals: true,
  animatedProfileThemes: true,
  cloudPlay: true,
  cloudPlayActive: false,
  hidePrivateServers: false,
  quickEquipItem: true,
  roproWishlist: true,
  themeColorAdjustments: true,
  tradeSearch: true,
  advancedTradeSearch: true,
};

const getDisabledFeatures = async () => {
  fetch("https://api.ropro.io/disabledFeatures.php", { method: "POST" }).then(
    async (response) => {
      if (response.ok) {
        var disabledFeaturesString = await response.text();
        disabledFeatures = disabledFeaturesString.split(",");
        setLocalStorage("disabledFeatures", disabledFeatures);
      }
    }
  );
};

async function initializeSettings() {
  return new Promise((resolve) => {
    async function checkSettings() {
      var initialSettings = await getStorage("rpSettings");
      if (typeof initialSettings === "undefined") {
        await setStorage("rpSettings", defaultSettings);
        resolve();
      } else {
        var changed = false;
        for (var key in Object.keys(defaultSettings)) {
          var settingKey = Object.keys(defaultSettings)[key];
          if (!(settingKey in initialSettings)) {
            initialSettings[settingKey] = defaultSettings[settingKey];
            changed = true;
          }
        }
        if (changed) {
          console.log("SETTINGS UPDATED");
          await setStorage("rpSettings", initialSettings);
        }
      }
      var userVerification = await getStorage("userVerification");
      if (typeof userVerification === "undefined") {
        await setStorage("userVerification", {});
      }
      await setStorage("rpSettings", initialSettings);
    }
    checkSettings();
  });
}

async function initializeRoPro() {
  initializeSettings();
  var avatarBackground = await getStorage("avatarBackground");
  if (typeof avatarBackground === "undefined") {
    await setStorage("avatarBackground", "default");
  }
  var globalTheme = await getStorage("globalTheme");
  if (typeof globalTheme === "undefined") {
    await setStorage("globalTheme", "");
  }
  try {
    var myId = await getStorage("rpUserID");
    if (
      typeof myId != "undefined" &&
      (await loadSettings("globalThemes")) &&
      (!(await getLocalStorage("themeCheck")) ||
        new Date().getTime() - (await getLocalStorage("themeCheck")) >
          600 * 1000)
    ) {
      setLocalStorage("themeCheck", new Date().getTime());
      loadGlobalTheme();
    }
  } catch (e) {
    console.log(e);
  }
}

initializeRoPro();

async function binarySearchServers(gameID, playerCount, maxLoops = 20) {
  async function getServerIndexPage(gameID, index) {
    return new Promise((resolve2) => {
      fetch(
        "https://api.ropro.io/getServerCursor.php?startIndex=" +
          index +
          "&placeId=" +
          gameID
      )
        .then((response) => response.json())
        .then((data) => {
          var cursor = data.cursor == null ? "" : data.cursor;
          fetch(
            "https://games.roblox.com/v1/games/" +
              gameID +
              "/servers/Public?cursor=" +
              cursor +
              "&sortOrder=Asc&limit=100"
          )
            .then((response) => response.json())
            .then((data) => {
              resolve2(data);
            });
        });
    });
  }
  return new Promise((resolve) => {
    var numLoops = 0;
    fetch(
      "https://api.ropro.io/getServerCursor.php?startIndex=0&placeId=" + gameID
    )
      .then((response) => response.json())
      .then(async (data) => {
        var bounds = [
          parseInt(data.bounds[0] / 100),
          parseInt(data.bounds[1] / 100),
        ];
        var index = null;
        while (bounds[0] <= bounds[1] && numLoops < maxLoops) {
          var mid = parseInt((bounds[0] + bounds[1]) / 2);
          var servers = await getServerIndexPage(gameID, mid * 100);
          await roproSleep(500);
          var minPlaying = -1;
          if (servers.data.length > 0) {
            if (servers.data[0].playerTokens.length > playerCount) {
              bounds[1] = mid - 1;
            } else if (
              servers.data[servers.data.length - 1].playerTokens.length <
              playerCount
            ) {
              bounds[0] = mid + 1;
            } else {
              index = mid;
              break;
            }
          } else {
            bounds[0] = mid + 1;
          }
          numLoops++;
        }
        if (index == null) {
          index = bounds[1];
        }
        resolve(index * 100);
      });
  });
}

async function maxPlayerCount(gameID, count) {
  return new Promise((resolve) => {
    async function doMaxPlayerCount(gameID, count, resolve) {
      var index = await binarySearchServers(gameID, count, 20);
      fetch(
        "https://api.ropro.io/getServerCursor.php?startIndex=" +
          index +
          "&placeId=" +
          gameID
      )
        .then((response) => response.json())
        .then(async (data) => {
          var cursor = data.cursor == null ? "" : data.cursor;
          var serverDict = {};
          var serverArray = [];
          var numLoops = 0;
          var done = false;
          function getReversePage(cursor) {
            return new Promise((resolve2) => {
              fetch(
                "https://games.roblox.com/v1/games/" +
                  gameID +
                  "/servers/Public?cursor=" +
                  cursor +
                  "&sortOrder=Asc&limit=100"
              )
                .then((response) => response.json())
                .then((data) => {
                  if (data.hasOwnProperty("data")) {
                    for (var i = 0; i < data.data.length; i++) {
                      serverDict[data.data[i].id] = data.data[i];
                    }
                  }
                  resolve2(data);
                });
            });
          }
          while (
            !done &&
            Object.keys(serverDict).length <= 150 &&
            numLoops < 10
          ) {
            var servers = await getReversePage(cursor);
            await roproSleep(500);
            if (
              servers.hasOwnProperty("previousPageCursor") &&
              servers.previousPageCursor != null
            ) {
              cursor = servers.previousPageCursor;
            } else {
              done = true;
            }
            numLoops++;
          }
          var keys = Object.keys(serverDict);
          for (var i = 0; i < keys.length; i++) {
            if (
              serverDict[keys[i]].hasOwnProperty("playing") &&
              serverDict[keys[i]].playing <= count
            ) {
              serverArray.push(serverDict[keys[i]]);
            }
          }
          serverArray.sort(function (a, b) {
            return b.playing - a.playing;
          });
          console.log(serverArray);
          resolve(serverArray);
        });
    }
    doMaxPlayerCount(gameID, count, resolve);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function serverFilterReverseOrder(gameID) {
  return new Promise((resolve) => {
    async function doReverseOrder(gameID, resolve) {
      fetch(
        "https://api.ropro.io/getServerCursor.php?startIndex=0&placeId=" +
          gameID
      )
        .then((response) => response.json())
        .then(async (data) => {
          var cursor = data.cursor == null ? "" : data.cursor;
          var serverDict = {};
          var serverArray = [];
          var numLoops = 0;
          var done = false;
          function getReversePage(cursor) {
            return new Promise((resolve2) => {
              fetch(
                "https://games.roblox.com/v1/games/" +
                  gameID +
                  "/servers/Public?cursor=" +
                  cursor +
                  "&sortOrder=Asc&limit=100"
              )
                .then((response) => response.json())
                .then((data) => {
                  if (data.hasOwnProperty("data")) {
                    for (var i = 0; i < data.data.length; i++) {
                      serverDict[data.data[i].id] = data.data[i];
                    }
                  }
                  resolve2(data);
                });
            });
          }
          while (
            !done &&
            Object.keys(serverDict).length <= 150 &&
            numLoops < 20
          ) {
            var servers = await getReversePage(cursor);
            await roproSleep(500);
            if (
              servers.hasOwnProperty("nextPageCursor") &&
              servers.nextPageCursor != null
            ) {
              cursor = servers.nextPageCursor;
            } else {
              done = true;
            }
            numLoops++;
          }
          var keys = Object.keys(serverDict);
          for (var i = 0; i < keys.length; i++) {
            if (serverDict[keys[i]].hasOwnProperty("playing")) {
              serverArray.push(serverDict[keys[i]]);
            }
          }
          serverArray.sort(function (a, b) {
            return a.playing - b.playing;
          });
          resolve(serverArray);
        });
    }
    doReverseOrder(gameID, resolve);
  });
}

async function serverFilterRandomShuffle(gameID, minServers = 150) {
  return new Promise((resolve) => {
    async function doRandomShuffle(gameID, resolve) {
      fetch(
        "https://api.ropro.io/getServerCursor.php?startIndex=0&placeId=" +
          gameID
      )
        .then((response) => response.json())
        .then(async (data) => {
          var indexArray = [];
          var serverDict = {};
          var serverArray = [];
          var done = false;
          var numLoops = 0;
          for (var i = data.bounds[0]; i <= data.bounds[1]; i = i + 100) {
            indexArray.push(i);
          }
          function getIndex() {
            return new Promise((resolve2) => {
              if (indexArray.length > 0) {
                var i = Math.floor(Math.random() * indexArray.length);
                var index = indexArray[i];
                indexArray.splice(i, 1);
                fetch(
                  "https://api.ropro.io/getServerCursor.php?startIndex=" +
                    index +
                    "&placeId=" +
                    gameID
                )
                  .then((response) => response.json())
                  .then(async (data) => {
                    var cursor = data.cursor;
                    if (cursor == null) {
                      cursor = "";
                    }
                    fetch(
                      "https://games.roblox.com/v1/games/" +
                        gameID +
                        "/servers/Public?cursor=" +
                        cursor +
                        "&sortOrder=Asc&limit=100"
                    )
                      .then(async (response) => {
                        if (response.ok) {
                          return await response.json();
                        } else {
                          throw new Error("Failed to fetch servers");
                        }
                      })
                      .then(async (data) => {
                        if (data.hasOwnProperty("data")) {
                          for (var i = 0; i < data.data.length; i++) {
                            if (
                              data.data[i].hasOwnProperty("playing") &&
                              data.data[i].playing < data.data[i].maxPlayers
                            ) {
                              serverDict[data.data[i].id] = data.data[i];
                            }
                          }
                        }
                        resolve2();
                      })
                      .catch(function () {
                        done = true;
                        resolve2();
                      });
                  });
              } else {
                done = true;
                resolve2();
              }
            });
          }
          while (
            !done &&
            Object.keys(serverDict).length <= minServers &&
            numLoops < 20
          ) {
            await getIndex();
            await roproSleep(500);
            numLoops++;
          }
          var keys = Object.keys(serverDict);
          for (var i = 0; i < keys.length; i++) {
            serverArray.push(serverDict[keys[i]]);
          }
          resolve(serverArray);
        });
    }
    doRandomShuffle(gameID, resolve);
  });
}

async function fetchServerInfo(placeID, servers) {
  return new Promise((resolve) => {
    var formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({ placeID: placeID, servers: servers })
    );
    fetch("https://api.ropro.io/getServerInfo.php?form", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

async function fetchServerConnectionScore(placeID, servers) {
  return new Promise((resolve) => {
    var formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({ placeID: placeID, servers: servers })
    );
    fetch("https://api.ropro.io/getServerConnectionScore.php?form", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

async function fetchServerAge(placeID, servers) {
  return new Promise((resolve) => {
    var formData = new FormData();
    formData.append("placeID", placeID);
    formData.append("servers", JSON.stringify(servers));
    fetch("https://api.ropro.io/getServerAge.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

async function serverFilterRegion(gameID, location) {
  return new Promise((resolve) => {
    async function doServerFilterRegion(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkLocations(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        var serverInfo = await fetchServerInfo(
          gameID,
          Object.keys(serversDict)
        );
        for (var i = 0; i < serverInfo.length; i++) {
          if (
            serverInfo[i].location == location &&
            !(serverInfo[i].server in serverSet)
          ) {
            serverList.push(serversDict[serverInfo[i].server]);
            serverSet[serverInfo[i].server] = true;
          }
        }
        console.log(serverList);
        resolve(serverList);
      }
      checkLocations(serverArray);
    }
    doServerFilterRegion(gameID, resolve);
  });
}

async function serverFilterBestConnection(gameID) {
  return new Promise((resolve) => {
    async function doServerFilterBestConnection(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkLocations(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        var serverInfo = await fetchServerConnectionScore(
          gameID,
          Object.keys(serversDict)
        );
        for (var i = 0; i < serverInfo.length; i++) {
          serversDict[serverInfo[i].server]["score"] = serverInfo[i].score;
          serverList.push(serversDict[serverInfo[i].server]);
        }
        serverList = serverList.sort(function (a, b) {
          return a["score"] < b["score"] ? -1 : a["score"] > b["score"] ? 1 : 0;
        });
        resolve(serverList);
      }
      checkLocations(serverArray);
    }
    doServerFilterBestConnection(gameID, resolve);
  });
}

async function serverFilterNewestServers(gameID) {
  return new Promise((resolve) => {
    async function doServerFilterNewestServers(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkAge(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        var serverInfo = await fetchServerAge(gameID, Object.keys(serversDict));
        for (var i = 0; i < serverInfo.length; i++) {
          serversDict[serverInfo[i].server]["age"] = serverInfo[i].age;
          serverList.push(serversDict[serverInfo[i].server]);
        }
        serverList = serverList.sort(function (a, b) {
          return a["age"] < b["age"] ? -1 : a["age"] > b["age"] ? 1 : 0;
        });
        resolve(serverList);
      }
      checkAge(serverArray);
    }
    doServerFilterNewestServers(gameID, resolve);
  });
}

async function serverFilterOldestServers(gameID) {
  return new Promise((resolve) => {
    async function doServerFilterOldestServers(gameID, resolve) {
      var serverArray = await serverFilterRandomShuffle(gameID, 250);
      var serverList = [];
      var serverSet = {};
      shuffleArray(serverArray);
      async function checkAge(serverArray) {
        var serversDict = {};
        for (var i = 0; i < serverArray.length; i++) {
          serversDict[serverArray[i].id] = serverArray[i];
        }
        var serverInfo = await fetchServerAge(gameID, Object.keys(serversDict));
        for (var i = 0; i < serverInfo.length; i++) {
          serversDict[serverInfo[i].server]["age"] = serverInfo[i].age;
          serverList.push(serversDict[serverInfo[i].server]);
        }
        serverList = serverList.sort(function (a, b) {
          return a["age"] < b["age"] ? 1 : a["age"] > b["age"] ? -1 : 0;
        });
        resolve(serverList);
      }
      checkAge(serverArray);
    }
    doServerFilterOldestServers(gameID, resolve);
  });
}

async function roproSleep(ms) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

async function getServerPage(gameID, cursor) {
  return new Promise((resolve) => {
    fetch(
      "https://games.roblox.com/v1/games/" +
        gameID +
        "/servers/Public?limit=100&cursor=" +
        cursor
    )
      .then((response) => response.json())
      .then(async (data) => {
        resolve(data);
      })
      .catch(function () {
        resolve({});
      });
  });
}

async function randomServer(gameID) {
  return new Promise((resolve) => {
    fetch(
      "https://games.roblox.com/v1/games/" +
        gameID +
        "/servers/Friend?limit=100"
    )
      .then((response) => response.json())
      .then(async (data) => {
        var friendServers = [];
        for (var i = 0; i < data.data.length; i++) {
          friendServers.push(data.data[i]["id"]);
        }
        var serverList = new Set();
        var done = false;
        var numLoops = 0;
        var cursor = "";
        while (!done && serverList.size < 150 && numLoops < 5) {
          var serverPage = await getServerPage(gameID, cursor);
          await roproSleep(500);
          if (serverPage.hasOwnProperty("data")) {
            for (var i = 0; i < serverPage.data.length; i++) {
              var server = serverPage.data[i];
              if (
                !friendServers.includes(server.id) &&
                server.playing < server.maxPlayers
              ) {
                serverList.add(server);
              }
            }
          }
          if (serverPage.hasOwnProperty("nextPageCursor")) {
            cursor = serverPage.nextPageCursor;
            if (cursor == null) {
              done = true;
            }
          } else {
            done = true;
          }
          numLoops++;
        }
        if (!done && serverList.size == 0) {
          //No servers found via linear cursoring but end of server list not reached, try randomly selecting servers.
          console.log(
            "No servers found via linear cursoring but end of server list not reached, lets try randomly selecting servers."
          );
          var servers = await serverFilterRandomShuffle(gameID, 50);
          for (var i = 0; i < servers.length; i++) {
            var server = servers[i];
            if (
              !friendServers.includes(server.id) &&
              server.playing < server.maxPlayers
            ) {
              serverList.add(server);
            }
          }
        }
        serverList = Array.from(serverList);
        if (serverList.length > 0) {
          resolve(serverList[Math.floor(Math.random() * serverList.length)]);
        } else {
          resolve(null);
        }
      });
  });
}

async function getTimePlayed() {
  var playtimeTracking = await loadSettings("playtimeTracking");
  var mostRecentServer = await loadSettings("mostRecentServer");
  if (playtimeTracking || mostRecentServer) {
    var userID = await getStorage("rpUserID");
    if (playtimeTracking) {
      var timePlayed = await getLocalStorage("timePlayed");
      if (typeof timePlayed == "undefined") {
        timePlayed = {};
        setLocalStorage("timePlayed", timePlayed);
      }
    }
    if (mostRecentServer) {
      var mostRecentServers = await getLocalStorage("mostRecentServers");
      if (typeof mostRecentServers == "undefined") {
        mostRecentServers = {};
        setLocalStorage("mostRecentServers", mostRecentServers);
      }
    }
    fetch("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      body: JSON.stringify({ userIds: [userID] }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        var placeId = data.userPresences[0].placeId;
        var universeId = data.userPresences[0].universeId;
        if (
          placeId != null &&
          universeId != null &&
          data.userPresences[0].userPresenceType != 3
        ) {
          if (playtimeTracking) {
            if (universeId in timePlayed) {
              timePlayed[universeId] = [
                timePlayed[universeId][0] + 1,
                new Date().getTime(),
                true,
              ];
            } else {
              timePlayed[universeId] = [1, new Date().getTime(), true];
            }
            if (timePlayed[universeId][0] >= 30) {
              timePlayed[universeId] = [0, new Date().getTime(), true];
              var verificationDict = await getStorage("userVerification");
              userID = await getStorage("rpUserID");
              var roproVerificationToken = "none";
              if (typeof verificationDict != "undefined") {
                if (verificationDict.hasOwnProperty(userID)) {
                  roproVerificationToken = verificationDict[userID];
                }
              }
              fetch(
                "https://api.ropro.io/postTimePlayed.php?gameid=" +
                  placeId +
                  "&universeid=" +
                  universeId,
                {
                  method: "POST",
                  headers: {
                    "ropro-verification": roproVerificationToken,
                    "ropro-id": userID,
                  },
                }
              );
            }
            setLocalStorage("timePlayed", timePlayed);
          }
          if (mostRecentServer) {
            var gameId = data.userPresences[0].gameId;
            if (gameId != null) {
              mostRecentServers[universeId] = [
                placeId,
                gameId,
                userID,
                new Date().getTime(),
              ];
              setLocalStorage("mostRecentServers", mostRecentServers);
            }
          }
        }
      });
  }
}

function range(start, end) {
  var foo = [];
  for (var i = start; i <= end; i++) {
    foo.push(i);
  }
  return foo;
}

function stripTags(s) {
  if (typeof s == "undefined") {
    return s;
  }
  return s
    .replace(/(<([^>]+)>)/gi, "")
    .replace(/</g, "")
    .replace(/>/g, "")
    .replace(/'/g, "")
    .replace(/"/g, "")
    .replace(/`/g, "");
}

async function mutualFriends(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      var myId = await getStorage("rpUserID");
      var friendCache = await getLocalStorage("friendCache");
      console.log(friendCache);
      if (
        typeof friendCache == "undefined" ||
        new Date().getTime() - friendCache["expiration"] > 300000
      ) {
        fetch("https://friends.roblox.com/v1/users/" + myId + "/friends")
          .then((response) => response.json())
          .then((myFriends) => {
            setLocalStorage("friendCache", {
              friends: myFriends,
              expiration: new Date().getTime(),
            });
            fetch("https://friends.roblox.com/v1/users/" + userId + "/friends")
              .then((response) => response.json())
              .then(async (theirFriends) => {
                var friends = {};
                for (var i = 0; i < myFriends.data.length; i++) {
                  var friend = myFriends.data[i];
                  friends[friend.id] = friend;
                }
                var mutuals = [];
                for (var i = 0; i < theirFriends.data.length; i++) {
                  var friend = theirFriends.data[i];
                  if (friend.id in friends) {
                    mutuals.push({
                      name: stripTags(friend.name),
                      link: "/users/" + parseInt(friend.id) + "/profile",
                      icon:
                        "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                        parseInt(friend.id) +
                        "&width=420&height=420&format=png",
                      additional: friend.isOnline ? "Online" : "Offline",
                    });
                  }
                }
                console.log("Mutual Friends:", mutuals);
                resolve(mutuals);
              });
          });
      } else {
        var myFriends = friendCache["friends"];
        console.log("cached");
        console.log(friendCache);
        fetch("https://friends.roblox.com/v1/users/" + userId + "/friends")
          .then((response) => response.json())
          .then((theirFriends) => {
            var friends = {};
            for (var i = 0; i < myFriends.data.length; i++) {
              var friend = myFriends.data[i];
              friends[friend.id] = friend;
            }
            var mutuals = [];
            for (var i = 0; i < theirFriends.data.length; i++) {
              var friend = theirFriends.data[i];
              if (friend.id in friends) {
                mutuals.push({
                  name: stripTags(friend.name),
                  link: "/users/" + parseInt(friend.id) + "/profile",
                  icon:
                    "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                    parseInt(friend.id) +
                    "&width=420&height=420&format=png",
                  additional: friend.isOnline ? "Online" : "Offline",
                });
              }
            }
            console.log("Mutual Friends:", mutuals);
            resolve(mutuals);
          });
      }
    }
    doGet();
  });
}

async function mutualFollowing(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      var myId = await getStorage("rpUserID");
      fetch(
        "https://friends.roblox.com/v1/users/" +
          myId +
          "/followings?sortOrder=Desc&limit=100"
      )
        .then((response) => response.json())
        .then((myFriends) => {
          fetch(
            "https://friends.roblox.com/v1/users/" +
              userId +
              "/followings?sortOrder=Desc&limit=100"
          )
            .then((response) => response.json())
            .then((theirFriends) => {
              var friends = {};
              for (var i = 0; i < myFriends.data.length; i++) {
                var friend = myFriends.data[i];
                friends[friend.id] = friend;
              }
              var mutuals = [];
              for (var i = 0; i < theirFriends.data.length; i++) {
                var friend = theirFriends.data[i];
                if (friend.id in friends) {
                  mutuals.push({
                    name: stripTags(friend.name),
                    link: "/users/" + parseInt(friend.id) + "/profile",
                    icon:
                      "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                      parseInt(friend.id) +
                      "&width=420&height=420&format=png",
                    additional: friend.isOnline ? "Online" : "Offline",
                  });
                }
              }
              console.log("Mutual Following:", mutuals);
              resolve(mutuals);
            });
        });
    }
    doGet();
  });
}

async function mutualFollowers(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      var myId = await getStorage("rpUserID");
      fetch(
        "https://friends.roblox.com/v1/users/" +
          myId +
          "/followers?sortOrder=Desc&limit=100"
      )
        .then((response) => response.json())
        .then((myFriends) => {
          fetch(
            "https://friends.roblox.com/v1/users/" +
              userId +
              "/followers?sortOrder=Desc&limit=100"
          )
            .then((response) => response.json())
            .then((theirFriends) => {
              var friends = {};
              for (var i = 0; i < myFriends.data.length; i++) {
                var friend = myFriends.data[i];
                friends[friend.id] = friend;
              }
              var mutuals = [];
              for (var i = 0; i < theirFriends.data.length; i++) {
                var friend = theirFriends.data[i];
                if (friend.id in friends) {
                  mutuals.push({
                    name: stripTags(friend.name),
                    link: "/users/" + parseInt(friend.id) + "/profile",
                    icon:
                      "https://www.roblox.com/headshot-thumbnail/image?userId=" +
                      parseInt(friend.id) +
                      "&width=420&height=420&format=png",
                    additional: friend.isOnline ? "Online" : "Offline",
                  });
                }
              }
              console.log("Mutual Followers:", mutuals);
              resolve(mutuals);
            });
        });
    }
    doGet();
  });
}

async function mutualFavorites(userId, assetType) {
  return new Promise((resolve) => {
    async function doGet() {
      var myId = await getStorage("rpUserID");
      fetch(
        "https://www.roblox.com/users/favorites/list-json?assetTypeId=" +
          assetType +
          "&itemsPerPage=10000&pageNumber=1&userId=" +
          myId
      )
        .then((response) => response.json())
        .then((myFavorites) => {
          fetch(
            "https://www.roblox.com/users/favorites/list-json?assetTypeId=" +
              assetType +
              "&itemsPerPage=10000&pageNumber=1&userId=" +
              userId
          )
            .then((response) => response.json())
            .then((theirFavorites) => {
              var favorites = {};
              for (var i = 0; i < myFavorites.Data.Items.length; i++) {
                var favorite = myFavorites.Data.Items[i];
                favorites[favorite.Item.AssetId] = favorite;
              }
              var mutuals = [];
              for (var i = 0; i < theirFavorites.Data.Items.length; i++) {
                var favorite = theirFavorites.Data.Items[i];
                if (favorite.Item.AssetId in favorites) {
                  mutuals.push({
                    name: stripTags(favorite.Item.Name),
                    link: stripTags(favorite.Item.AbsoluteUrl),
                    icon: favorite.Thumbnail.Url,
                    additional: "By " + stripTags(favorite.Creator.Name),
                  });
                }
              }
              console.log("Mutual Favorites:", mutuals);
              resolve(mutuals);
            });
        });
    }
    doGet();
  });
}

async function mutualGroups(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      var myId = await getStorage("rpUserID");
      var d = {};
      fetch("https://groups.roblox.com/v1/users/" + myId + "/groups/roles")
        .then((response) => response.json())
        .then((groups) => {
          for (var i = 0; i < groups.data.length; i++) {
            d[groups.data[i].group.id] = true;
          }
          var mutualsJSON = [];
          var mutuals = [];
          fetch(
            "https://groups.roblox.com/v1/users/" + userId + "/groups/roles"
          )
            .then((response) => response.json())
            .then((groups) => {
              for (var i = 0; i < groups.data.length; i++) {
                if (groups.data[i].group.id in d) {
                  mutualsJSON.push({ groupId: groups.data[i].group.id });
                  mutuals.push({
                    id: groups.data[i].group.id,
                    name: stripTags(groups.data[i].group.name),
                    link: stripTags(
                      "https://www.roblox.com/groups/" +
                        groups.data[i].group.id +
                        "/group"
                    ),
                    icon: "https://t0.rbxcdn.com/75c8a07ec89b142d63d9b8d91be23b26",
                    additional: groups.data[i].group.memberCount + " Members",
                  });
                }
              }
              fetch(
                "https://www.roblox.com/group-thumbnails?params=" +
                  JSON.stringify(mutualsJSON)
              )
                .then((response) => response.json())
                .then((data) => {
                  for (var i = 0; i < data.length; i++) {
                    d[data[i].id] = data[i].thumbnailUrl;
                  }
                  for (var i = 0; i < mutuals.length; i++) {
                    mutuals[i].icon = d[mutuals[i].id];
                  }
                  console.log("Mutual Groups:", mutuals);
                  resolve(mutuals);
                });
            });
        });
    }
    doGet();
  });
}

async function mutualItems(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      var myId = await getStorage("rpUserID");
      var myItems = await loadItems(
        myId,
        "Hat,Face,Gear,Package,HairAccessory,FaceAccessory,NeckAccessory,ShoulderAccessory,FrontAccessory,BackAccessory,WaistAccessory,Shirt,Pants"
      );
      try {
        var theirItems = await loadItems(
          userId,
          "Hat,Face,Gear,Package,HairAccessory,FaceAccessory,NeckAccessory,ShoulderAccessory,FrontAccessory,BackAccessory,WaistAccessory,Shirt,Pants"
        );
      } catch (err) {
        resolve([{ error: true }]);
      }
      var mutuals = [];
      for (let item in theirItems) {
        if (item in myItems) {
          mutuals.push({
            name: stripTags(myItems[item].name),
            link: stripTags(
              "https://www.roblox.com/catalog/" + myItems[item].assetId
            ),
            icon:
              "https://api.ropro.io/getAssetThumbnail.php?id=" +
              myItems[item].assetId,
            additional: "",
          });
        }
      }
      console.log("Mutual Items:", mutuals);
      resolve(mutuals);
    }
    doGet();
  });
}

async function mutualLimiteds(userId) {
  return new Promise((resolve) => {
    async function doGet() {
      var myId = await getStorage("rpUserID");
      var myLimiteds = await loadInventory(myId);
      try {
        var theirLimiteds = await loadInventory(userId);
      } catch (err) {
        resolve([{ error: true }]);
      }
      var mutuals = [];
      for (let item in theirLimiteds) {
        if (item in myLimiteds) {
          mutuals.push({
            name: stripTags(myLimiteds[item].name),
            link: stripTags(
              "https://www.roblox.com/catalog/" + myLimiteds[item].assetId
            ),
            icon:
              "https://api.ropro.io/getAssetThumbnail.php?id=" +
              myLimiteds[item].assetId,
            additional: "Quantity: " + parseInt(theirLimiteds[item].quantity),
          });
        }
      }
      console.log("Mutual Limiteds:", mutuals);
      resolve(mutuals);
    }
    doGet();
  });
}

async function getPage(userID, assetType, cursor) {
  return new Promise((resolve) => {
    function getPage(resolve, userID, cursor, assetType) {
      fetch(
        `https://inventory.roblox.com/v1/users/${userID}/assets/collectibles?cursor=${cursor}&limit=50&sortOrder=Desc${
          assetType == null ? "" : "&assetType=" + assetType
        }`
      )
        .then((response) => {
          if (response.status == 429) {
            setTimeout(function () {
              getPage(resolve, userID, cursor, assetType);
            }, 21000);
          } else {
            response.json().then((data) => {
              resolve(data);
            });
          }
        })
        .catch(function (r, e, s) {
          resolve({ previousPageCursor: null, nextPageCursor: null, data: [] });
        });
    }
    getPage(resolve, userID, cursor, assetType);
  });
}

async function getInventoryPage(userID, assetTypes, cursor) {
  return new Promise((resolve) => {
    fetch(
      "https://inventory.roblox.com/v2/users/" +
        userID +
        "/inventory?assetTypes=" +
        assetTypes +
        "&limit=100&sortOrder=Desc&cursor=" +
        cursor
    )
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch(function () {
        resolve({});
      });
  });
}

async function declineBots() {
  //Code to decline all suspected trade botters
  return new Promise((resolve) => {
    var tempCursor = "";
    var botTrades = [];
    var totalLoops = 0;
    var totalDeclined = 0;
    async function doDecline() {
      var trades = await fetchTradesCursor("inbound", 100, tempCursor);
      tempCursor = trades.nextPageCursor;
      var tradeIds = [];
      var userIds = [];
      for (var i = 0; i < trades.data.length; i++) {
        tradeIds.push([trades.data[i].user.id, trades.data[i].id]);
        userIds.push(trades.data[i].user.id);
      }
      if (userIds.length > 0) {
        var flags = await fetchFlagsBatch(userIds);
        flags = JSON.parse(flags);
        for (var i = 0; i < tradeIds.length; i++) {
          try {
            if (flags.includes(tradeIds[i][0].toString())) {
              botTrades.push(tradeIds[i][1]);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
      if (totalLoops < 20 && tempCursor != null) {
        setTimeout(function () {
          doDecline();
          totalLoops += 1;
        }, 100);
      } else {
        if (botTrades.length > 0) {
          await loadToken();
          var token = await getStorage("token");
          for (var i = 0; i < botTrades.length; i++) {
            console.log(i, botTrades.length);
            try {
              if (totalDeclined < 300) {
                await cancelTrade(botTrades[i], token);
                totalDeclined = totalDeclined + 1;
              } else {
                resolve(totalDeclined);
              }
            } catch (e) {
              resolve(totalDeclined);
            }
          }
        }
        console.log("Declined " + botTrades.length + " trades!");
        resolve(botTrades.length);
      }
    }
    doDecline();
  });
}

async function fetchFlagsBatch(userIds) {
  return new Promise((resolve) => {
    fetch("https://api.ropro.io/fetchFlags.php?ids=" + userIds.join(","))
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

async function loadItems(userID, assetTypes) {
  var myInventory = {};
  async function handleAsset(cursor) {
    var response = await getInventoryPage(userID, assetTypes, cursor);
    for (var j = 0; j < response.data.length; j++) {
      var item = response.data[j];
      if (item["assetId"] in myInventory) {
        myInventory[item["assetId"]]["quantity"]++;
      } else {
        myInventory[item["assetId"]] = item;
        myInventory[item["assetId"]]["quantity"] = 1;
      }
    }
    if (response.nextPageCursor != null) {
      await handleAsset(response.nextPageCursor);
    }
  }
  await handleAsset("");
  var total = 0;
  for (var item in myInventory) {
    total += myInventory[item]["quantity"];
  }
  console.log("Inventory loaded. Total items: " + total);
  return myInventory;
}

async function loadInventory(userID) {
  var myInventory = {};
  var assetType = null;
  async function handleAsset(cursor) {
    var response = await getPage(userID, assetType, cursor);
    for (var j = 0; j < response.data.length; j++) {
      var item = response.data[j];
      if (item["assetId"] in myInventory) {
        myInventory[item["assetId"]]["quantity"]++;
      } else {
        myInventory[item["assetId"]] = item;
        myInventory[item["assetId"]]["quantity"] = 1;
      }
    }
    if (response.nextPageCursor != null) {
      await handleAsset(response.nextPageCursor);
    }
  }
  await handleAsset("");
  var total = 0;
  for (var item in myInventory) {
    total += myInventory[item]["quantity"];
  }
  console.log("Inventory loaded. Total items: " + total);
  return myInventory;
}

async function isInventoryPrivate(userID) {
  return new Promise((resolve) => {
    fetch(
      "https://inventory.roblox.com/v1/users/" +
        userID +
        "/assets/collectibles?cursor=&sortOrder=Desc&limit=10&assetType=null"
    ).then((response) => {
      if (response.status == 403) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

async function loadLimitedInventory(userID) {
  var myInventory = [];
  var assetType = null;
  async function handleAsset(cursor) {
    var response = await getPage(userID, assetType, cursor);
    for (var j = 0; j < response.data.length; j++) {
      var item = response.data[j];
      myInventory.push(item);
    }
    if (response.nextPageCursor != null) {
      await handleAsset(response.nextPageCursor);
    }
  }
  await handleAsset("");
  return myInventory;
}

async function getProfileValue(userID) {
  if (await isInventoryPrivate(userID)) {
    return { value: "private" };
  }
  var inventory = await loadLimitedInventory(userID);
  var items = new Set();
  for (var i = 0; i < inventory.length; i++) {
    items.add(inventory[i]["assetId"]);
  }
  var values = await fetchItemValues(Array.from(items));
  var value = 0;
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i]["assetId"] in values) {
      value += values[inventory[i]["assetId"]];
    }
  }
  return { value: value };
}

function fetchTrades(tradesType, limit) {
  return new Promise((resolve) => {
    fetch(
      "https://trades.roblox.com/v1/trades/" +
        tradesType +
        "?cursor=&limit=" +
        limit +
        "&sortOrder=Desc"
    )
      .then((response) => response.json())
      .then(async (data) => {
        resolve(data);
      });
  });
}

function fetchTradesCursor(tradesType, limit, cursor) {
  return new Promise((resolve) => {
    fetch(
      "https://trades.roblox.com/v1/trades/" +
        tradesType +
        "?cursor=" +
        cursor +
        "&limit=" +
        limit +
        "&sortOrder=Desc"
    )
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

function fetchTrade(tradeId) {
  return new Promise((resolve) => {
    fetch("https://trades.roblox.com/v1/trades/" + tradeId)
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

function fetchValues(trades) {
  return new Promise((resolve) => {
    var formData = new FormData();
    formData.append("data", JSON.stringify(trades));
    fetch("https://api.ropro.io/tradeProtectionBackend.php?form", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

function fetchItemValues(items) {
  return new Promise((resolve) => {
    fetch("https://api.ropro.io/itemInfoBackend.php", {
      method: "POST",
      body: JSON.stringify(items),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

function fetchPlayerThumbnails(userIds) {
  return new Promise((resolve) => {
    fetch(
      "https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" +
        userIds.join() +
        "&size=420x420&format=Png&isCircular=false"
    )
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

function cancelTrade(id, token) {
  return new Promise((resolve) => {
    try {
      fetch("https://trades.roblox.com/v1/trades/" + id + "/decline", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": token },
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        });
    } catch (e) {
      resolve("");
    }
  });
}

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

var myToken = null;

function loadToken() {
  return new Promise((resolve) => {
    try {
      fetch("https://roblox.com/home")
        .then((response) => response.text())
        .then((data) => {
          var token = data
            .split("data-token=")[1]
            .split(">")[0]
            .replace('"', "")
            .replace('"', "")
            .split(" ")[0];
          var restrictSettings = !(
            data.includes("data-isunder13=false") ||
            data.includes('data-isunder13="false"') ||
            data.includes("data-isunder13='false'")
          );
          myToken = token;
          chrome.storage.sync.set({ token: myToken });
          chrome.storage.sync.set({ restrictSettings: restrictSettings });
          resolve(token);
        })
        .catch(function () {
          fetch("https://roblox.com")
            .then((response) => response.text())
            .then((data) => {
              var token = data
                .split("data-token=")[1]
                .split(">")[0]
                .replace('"', "")
                .replace('"', "")
                .split(" ")[0];
              var restrictSettings = !data.includes("data-isunder13=false");
              myToken = token;
              chrome.storage.sync.set({ token: token });
              chrome.storage.sync.set({ restrictSettings: restrictSettings });
              resolve(token);
            })
            .catch(function () {
              fetch("https://www.roblox.com/home")
                .then((response) => response.text())
                .then((data) => {
                  var token = data
                    .split("data-token=")[1]
                    .split(">")[0]
                    .replace('"', "")
                    .replace('"', "")
                    .split(" ")[0];
                  var restrictSettings = !data.includes("data-isunder13=false");
                  myToken = token;
                  chrome.storage.sync.set({ token: token });
                  chrome.storage.sync.set({
                    restrictSettings: restrictSettings,
                  });
                  resolve(token);
                })
                .catch(function () {
                  fetch("https://web.roblox.com/home")
                    .then((response) => response.text())
                    .then((data) => {
                      var token = data
                        .split("data-token=")[1]
                        .split(">")[0]
                        .replace('"', "")
                        .replace('"', "")
                        .split(" ")[0];
                      var restrictSettings = !data.includes(
                        "data-isunder13=false"
                      );
                      myToken = token;
                      chrome.storage.sync.set({ token: token });
                      chrome.storage.sync.set({
                        restrictSettings: restrictSettings,
                      });
                      resolve(token);
                    });
                });
            });
        });
    } catch (e) {
      console.log(e);
      console.warn("Token fetch failed. Using backup token fetch.");
      fetch("https://catalog.roblox.com/v1/catalog/items/details")
        .then((response) => response.headers.get("x-csrf-token"))
        .then((token) => {
          myToken = token;
          chrome.storage.sync.set({ token: token });
          console.log("New Token: " + token);
          resolve(token);
        });
    }
  });
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

async function handleAlert() {
  var timestamp = new Date().getTime();
  fetch(
    "https://api.ropro.io/handleRoProAlert.php?timestamp=" + timestamp
  ).then(async (response) => {
    var data = JSON.parse(atob(await response.text()));
    if (data.alert == true) {
      var validationHash =
        "d6ed8dd6938b1d02ef2b0178500cd808ed226437f6c23f1779bf1ae729ed6804";
      var validation = response.headers.get(
        "validation" + (await sha256(timestamp % 1024)).split("a")[0]
      );
      if ((await sha256(validation)) == validationHash) {
        var alreadyAlerted = await getLocalStorage("alreadyAlerted");
        var linkHTML = "";
        if (data.hasOwnProperty("link") && data.hasOwnProperty("linktext")) {
          linkHTML = `<a href=\'${stripTags(
            data.link
          )}\' target=\'_blank\' style=\'margin-left:10px;text-decoration:underline;\' class=\'text-link\'><b>${stripTags(
            data.linktext
          )}</b></a>`;
        }
        var closeAlertHTML = `<div style=\'opacity:0.6;margin-right:5px;display:inline-block;margin-left:45px;cursor:pointer;\'class=\'alert-close\'><b>Close Alert<b></div>`;
        var message = stripTags(data.message) + linkHTML + closeAlertHTML;
        if (alreadyAlerted != message) {
          setLocalStorage("rpAlert", message);
        }
      } else {
        console.log("Validation failed! Not alerting user.");
        setLocalStorage("rpAlert", "");
      }
    } else {
      setLocalStorage("rpAlert", "");
    }
  });
}

async function validateUser() {
  return new Promise(async (resolve) => {
    fetch("https://users.roblox.com/v1/users/authenticated").then(
      async (response) => {
        if (!response.ok) throw new Error("Failed to validate user");
        var data = await response.json();
        const userVerification = await getStorage("userVerification");
        var userID = data.id;
        var roproVerificationToken = "none";
        if (userVerification && userVerification.hasOwnProperty(userID)) {
          roproVerificationToken = userVerification[userID];
        }
        var formData = new FormData();
        formData.append("user_id", data.id);
        formData.append("username", data.name);
        fetch("https://api.ropro.io/validateUser.php", {
          method: "POST",
          headers: {
            "ropro-verification": roproVerificationToken,
            "ropro-id": userID,
          },
          body: formData,
        }).then(async (response) => {
          var data = await response.text();
          if (data == "err") {
            throw new Error("User validation failed.");
          } else if (data.includes(",")) {
            userID = parseInt(data.split(",")[0]);
            var username = data.split(",")[1].split(",")[0];
            setStorage("rpUserID", userID);
            setStorage("rpUsername", username);
          }
          resolve();
        });
      }
    );
  });
}

async function fetchSubscription() {
  return new Promise(async (resolve) => {
    const userVerification = await getStorage("userVerification");
    var userID = await getStorage("rpUserID");
    var roproVerificationToken = "none";
    if (userVerification && userVerification.hasOwnProperty(userID)) {
      roproVerificationToken = userVerification[userID];
    }
    fetch("https://api.ropro.io/getSubscription.php", {
      method: "POST",
      headers: {
        "ropro-verification": roproVerificationToken,
        "ropro-id": userID,
      },
    }).then(async (response) => {
      var data = await response.text();
      resolve(data);
    });
  });
}

var subscriptionPromise = [];

async function getSubscription() {
  if (subscriptionPromise.length == 0) {
    subscriptionPromise.push(
      new Promise(async (resolve) => {
        getLocalStorage("rpSubscriptionFreshness").then(async (freshness) => {
          if (!freshness || Date.now() >= freshness + 300 * 1000) {
            try {
              await validateUser();
              var subscription = await fetchSubscription();
              setLocalStorage("rpSubscription", subscription);
              setLocalStorage("rpSubscriptionFreshness", Date.now());
              resolve(subscription);
            } catch (e) {
              console.log("Error fetching subscription: ", e);
              setLocalStorage("rpSubscriptionFreshness", Date.now());
            }
          } else {
            resolve(await getLocalStorage("rpSubscription"));
          }
        });
      })
    );
    var myPromise = await subscriptionPromise[0];
    subscriptionPromise = [];
    return myPromise;
  } else {
    var myPromise = await subscriptionPromise[0];
    subscriptionPromise = [];
    return myPromise;
  }
}
getSubscription();

var disabledFeatures = null;

async function loadSettingValidity(setting) {
  var restrictSettings = await getStorage("restrictSettings");
  var restricted_settings = new Set([
    "linkedDiscord",
    "gameTwitter",
    "groupTwitter",
    "groupDiscord",
    "featuredToys",
  ]);
  var standard_settings = new Set([
    "themeColorAdjustments",
    "moreMutuals",
    "animatedProfileThemes",
    "morePlaytimeSorts",
    "serverSizeSort",
    "fastestServersSort",
    "moreGameFilters",
    "moreServerFilters",
    "additionalServerInfo",
    "gameLikeRatioFilter",
    "premiumVoiceServers",
    "quickUserSearch",
    "liveLikeDislikeFavoriteCounters",
    "sandboxOutfits",
    "tradeSearch",
    "moreTradePanel",
    "tradeValueCalculator",
    "tradeDemandRatingCalculator",
    "tradeItemValue",
    "tradeItemDemand",
    "itemPageValueDemand",
    "tradePageProjectedWarning",
    "embeddedRolimonsItemLink",
    "embeddedRolimonsUserLink",
    "tradeOffersValueCalculator",
    "winLossDisplay",
    "underOverRAP",
  ]);
  var pro_settings = new Set([
    "profileValue",
    "liveVisits",
    "livePlayers",
    "tradePreviews",
    "ownerHistory",
    "quickItemSearch",
    "tradeNotifier",
    "singleSessionMode",
    "advancedTradeSearch",
    "tradeProtection",
    "hideTradeBots",
    "autoDeclineTradeBots",
    "autoDecline",
    "declineThreshold",
    "cancelThreshold",
    "hideDeclinedNotifications",
    "hideOutboundNotifications",
  ]);
  var ultra_settings = new Set([
    "dealNotifier",
    "buyButton",
    "dealCalculations",
    "notificationThreshold",
    "valueThreshold",
    "projectedFilter",
  ]);
  var subscriptionLevel = await getSubscription();
  var valid = true;
  if (subscriptionLevel == "free_tier" || subscriptionLevel == "free") {
    if (
      standard_settings.has(setting) ||
      pro_settings.has(setting) ||
      ultra_settings.has(setting)
    ) {
      valid = false;
    }
  } else if (
    subscriptionLevel == "standard_tier" ||
    subscriptionLevel == "plus"
  ) {
    if (pro_settings.has(setting) || ultra_settings.has(setting)) {
      valid = false;
    }
  } else if (subscriptionLevel == "pro_tier" || subscriptionLevel == "rex") {
    if (ultra_settings.has(setting)) {
      valid = false;
    }
  } else if (
    subscriptionLevel == "ultra_tier" ||
    subscriptionLevel == "ultra"
  ) {
    valid = true;
  } else {
    valid = false;
  }
  if (restricted_settings.has(setting) && restrictSettings) {
    valid = false;
  }
  if (disabledFeatures == null || typeof disabledFeatures == "undefined") {
    disabledFeatures = await getLocalStorage("disabledFeatures");
  }
  if (disabledFeatures?.includes(setting)) {
    valid = false;
  }
  return new Promise((resolve) => {
    resolve(valid);
  });
}

async function loadSettings(setting) {
  var settings = await getStorage("rpSettings");
  if (typeof settings === "undefined") {
    await initializeSettings();
    settings = await getStorage("rpSettings");
  }
  var valid = await loadSettingValidity(setting);
  var settingValue;
  if (typeof settings[setting] === "boolean") {
    settingValue = settings[setting] && valid;
  } else {
    settingValue = settings[setting];
  }
  return new Promise((resolve) => {
    resolve(settingValue);
  });
}

async function loadSettingValidityInfo(setting) {
  var disabled = false;
  var valid = await loadSettingValidity(setting);
  if (disabledFeatures == null || typeof disabledFeatures == "undefined") {
    disabledFeatures = await getLocalStorage("disabledFeatures");
  }
  if (disabledFeatures?.includes(setting)) {
    disabled = true;
  }
  return new Promise((resolve) => {
    resolve([valid, disabled]);
  });
}

async function getTradeValues(tradesType) {
  var tradesJSON = await fetchTrades(tradesType);
  var trades = { data: [] };
  if (tradesJSON.data.length > 0) {
    for (var i = 0; i < 10; i++) {
      var offer = tradesJSON.data[i];
      var tradeChecked = await getStorage("tradeChecked");
      if (offer.id != tradeChecked) {
        var trade = await fetchTrade(offer.id);
        trades.data.push(trade);
      } else {
        return {};
      }
    }
    var tradeValues = await fetchValues(trades);
    return tradeValues;
  } else {
    return {};
  }
}

var inbounds = [];
var inboundsCache = {};
var allPagesDone = false;

function loadTrades(inboundCursor, tempArray) {
  fetch(
    "https://trades.roblox.com/v1/trades/Inbound?sortOrder=Asc&limit=100&cursor=" +
      inboundCursor
  )
    .then(async (response) => {
      if (response.ok) {
        var data = await response.json();
        return data;
      } else {
        throw new Error("Failed to fetch trades");
      }
    })
    .then((data) => {
      console.log(data);
      var done = false;
      for (var i = 0; i < data.data.length; i++) {
        if (!(data.data[i].id in inboundsCache)) {
          tempArray.push(data.data[i].id);
          inboundsCache[data.data[i].id] = null;
        } else {
          done = true;
          break;
        }
      }
      if (data.nextPageCursor != null && done == false) {
        loadTrades(data.nextPageCursor, tempArray);
      } else {
        //Reached the last page or already detected inbound trade
        inbounds = tempArray.concat(inbounds);
        allPagesDone = true;
        setTimeout(function () {
          loadTrades("", []);
        }, 61000);
      }
    })
    .catch((error) => {
      setTimeout(function () {
        loadTrades(inboundCursor, tempArray);
      }, 61000);
    });
}

var tradesNotified = {};

function getTrades() {
  return new Promise((resolve) => {
    async function doGet(resolve) {
      var lastTradeCheck = await getLocalStorage("lastTradeCheck");
      var initialCheck =
        !lastTradeCheck ||
        lastTradeCheck + 1000 * 60 * 5 < new Date().getTime();
      var limit = initialCheck ? 25 : 10;
      var sections = [
        await fetchTrades("inbound", limit),
        await fetchTrades("outbound", limit),
        await fetchTrades("completed", limit),
      ];
      if (!(await loadSettings("hideDeclinedNotifications"))) {
        sections.push(await fetchTrades("inactive", limit));
      }
      var tradesList = await getLocalStorage("tradesList");
      if (typeof tradesList == "undefined" || initialCheck) {
        tradesList = {
          inboundTrades: {},
          outboundTrades: {},
          completedTrades: {},
          inactiveTrades: {},
        };
      }
      var storageNames = [
        "inboundTrades",
        "outboundTrades",
        "completedTrades",
        "inactiveTrades",
      ];
      var newTrades = [];
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        if ("data" in section && section.data.length > 0) {
          var store = tradesList[storageNames[i]];
          var tradeIds = [];
          for (var j = 0; j < section.data.length; j++) {
            tradeIds.push(section.data[j]["id"]);
          }
          for (var j = 0; j < tradeIds.length; j++) {
            var tradeId = tradeIds[j];
            if (!(tradeId in store)) {
              tradesList[storageNames[i]][tradeId] = true;
              newTrades.push({ [tradeId]: storageNames[i] });
            }
          }
        }
      }
      if (newTrades.length > 0) {
        if (!initialCheck) {
          await setLocalStorage("tradesList", tradesList);
          if (newTrades.length < 9) {
            notifyTrades(newTrades);
          }
        } else {
          await setLocalStorage("tradesList", tradesList);
        }
      }
      await setLocalStorage("lastTradeCheck", new Date().getTime());
      resolve();
    }
    doGet(resolve);
  });
}

function loadTradesType(tradeType) {
  return new Promise((resolve) => {
    function doLoad(tradeCursor, tempArray) {
      fetch(
        "https://trades.roblox.com/v1/trades/" +
          tradeType +
          "?sortOrder=Asc&limit=100&cursor=" +
          tradeCursor
      )
        .then(async (response) => {
          if (response.ok) {
            var data = await response.json();
            return data;
          } else {
            throw new Error("Failed to fetch trades");
          }
        })
        .then((data) => {
          console.log(data);
          for (var i = 0; i < data.data.length; i++) {
            tempArray.push([data.data[i].id, data.data[i].user.id]);
          }
          if (data.nextPageCursor != null) {
            doLoad(data.nextPageCursor, tempArray);
          } else {
            //Reached the last page
            resolve(tempArray);
          }
        })
        .catch(function () {
          setTimeout(function () {
            doLoad(tradeCursor, tempArray);
          }, 31000);
        });
    }
    doLoad("", []);
  });
}

function loadTradesData(tradeType) {
  return new Promise((resolve) => {
    function doLoad(tradeCursor, tempArray) {
      fetch(
        "https://trades.roblox.com/v1/trades/" +
          tradeType +
          "?sortOrder=Asc&limit=100&cursor=" +
          tradeCursor
      )
        .then(async (response) => {
          if (response.ok) {
            var data = await response.json();
            return data;
          } else {
            throw new Error("Failed to fetch trades");
          }
        })
        .then((data) => {
          console.log(data);
          for (var i = 0; i < data.data.length; i++) {
            tempArray.push(data.data[i]);
          }
          if (data.nextPageCursor != null) {
            doLoad(data.nextPageCursor, tempArray);
          } else {
            //Reached the last page
            resolve(tempArray);
          }
        })
        .catch(function () {
          setTimeout(function () {
            doLoad(tradeCursor, tempArray);
          }, 31000);
        });
    }
    doLoad("", []);
  });
}

var notifications = {};

// setLocalStorage("cachedTrades", {});

function createNotification(notificationId, options) {
  return new Promise((resolve) => {
    chrome.notifications.create(notificationId, options, function () {
      resolve();
    });
  });
}

async function notifyTrades(trades) {
  for (var i = 0; i < trades.length; i++) {
    var trade = trades[i];
    var tradeId = Object.keys(trade)[0];
    var tradeType = trade[tradeId];
    if (!(tradeId + "_" + tradeType in tradesNotified)) {
      tradesNotified[tradeId + "_" + tradeType] = true;
      var context = "";
      var buttons = [];
      switch (tradeType) {
        case "inboundTrades":
          context = "Trade Inbound";
          buttons = [{ title: "Open" }, { title: "Decline" }];
          break;
        case "outboundTrades":
          context = "Trade Outbound";
          buttons = [{ title: "Open" }, { title: "Cancel" }];
          break;
        case "completedTrades":
          context = "Trade Completed";
          buttons = [{ title: "Open" }];
          break;
        case "inactiveTrades":
          context = "Trade Declined";
          buttons = [{ title: "Open" }];
          break;
      }
      trade = await fetchTrade(tradeId);
      var values = await fetchValues({ data: [trade] });
      var values = values[0];
      var compare = values[values["them"]] - values[values["us"]];
      var lossRatio = (1 - values[values["them"]] / values[values["us"]]) * 100;
      console.log("Trade Loss Ratio: " + lossRatio);
      if (
        context == "Trade Inbound" &&
        (await loadSettings("autoDecline")) &&
        lossRatio >= (await loadSettings("declineThreshold"))
      ) {
        console.log("Declining Trade, Trade Loss Ratio: " + lossRatio);
        cancelTrade(tradeId, await getStorage("token"));
      }
      if (
        context == "Trade Outbound" &&
        (await loadSettings("tradeProtection")) &&
        lossRatio >= (await loadSettings("cancelThreshold"))
      ) {
        console.log("Cancelling Trade, Trade Loss Ratio: " + lossRatio);
        cancelTrade(tradeId, await getStorage("token"));
      }
      if (await loadSettings("tradeNotifier")) {
        var compareText = "Win: +";
        if (compare > 0) {
          compareText = "Win: +";
        } else if (compare == 0) {
          compareText = "Equal: +";
        } else if (compare < 0) {
          compareText = "Loss: ";
        }
        var thumbnail = await fetchPlayerThumbnails([trade.user.id]);
        var options = {
          type: "basic",
          title: context,
          iconUrl: thumbnail.data[0].imageUrl,
          buttons: buttons,
          priority: 2,
          message: `Partner: ${values["them"]}\nYour Value: ${addCommas(
            values[values["us"]]
          )}\nTheir Value: ${addCommas(values[values["them"]])}`,
          contextMessage: compareText + addCommas(compare) + " Value",
          eventTime: Date.now(),
        };
        var notificationId = Math.floor(Math.random() * 10000000).toString();
        notifications[notificationId] = {
          type: "trade",
          tradeType: tradeType,
          tradeid: tradeId,
          buttons: buttons,
        };
        if (
          context != "Trade Declined" ||
          (await loadSettings("hideDeclinedNotifications")) == false
        ) {
          await createNotification(notificationId, options);
        }
      }
    }
  }
}

const tradeNotifierCheck = async () => {
  if (
    (await loadSettings("tradeNotifier")) ||
    (await loadSettings("autoDecline")) ||
    (await loadSettings("tradeProtection"))
  ) {
    getTrades();
  }
};

function generalNotification(notification) {
  console.log(notification);
  var notificationOptions = {
    type: "basic",
    title: notification.subject,
    message: notification.message,
    priority: 2,
    iconUrl: notification.icon,
  };
  chrome.notifications.create("", notificationOptions);
}

async function notificationButtonClicked(notificationId, buttonIndex) {
  //Notification button clicked
  var notification = notifications[notificationId];
  if (notification["type"] == "trade") {
    if (notification["tradeType"] == "inboundTrades") {
      if (buttonIndex == 0) {
        chrome.tabs.create({ url: "https://www.roblox.com/trades" });
      } else if (buttonIndex == 1) {
        cancelTrade(notification["tradeid"], await getStorage("token"));
      }
    } else if (notification["tradeType"] == "outboundTrades") {
      if (buttonIndex == 0) {
        chrome.tabs.create({ url: "https://www.roblox.com/trades#outbound" });
      } else if (buttonIndex == 1) {
        cancelTrade(notification["tradeid"], await getStorage("token"));
      }
    } else if (notification["tradeType"] == "completedTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#completed" });
    } else if (notification["tradeType"] == "inactiveTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#inactive" });
    }
  }
}

function notificationClicked(notificationId) {
  console.log(notificationId);
  var notification = notifications[notificationId];
  console.log(notification);
  if (notification["type"] == "trade") {
    if (notification["tradeType"] == "inboundTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades" });
    } else if (notification["tradeType"] == "outboundTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#outbound" });
    } else if (notification["tradeType"] == "completedTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#completed" });
    } else if (notification["tradeType"] == "inactiveTrades") {
      chrome.tabs.create({ url: "https://www.roblox.com/trades#inactive" });
    }
  } else if (notification["type"] == "wishlist") {
    chrome.tabs.create({
      url:
        "https://www.roblox.com/catalog/" +
        parseInt(notification["itemId"]) +
        "/",
    });
  }
}

chrome.notifications.onClicked.addListener(notificationClicked);

chrome.notifications.onButtonClicked.addListener(notificationButtonClicked);

async function loadGlobalTheme() {
  var myId = await getStorage("rpUserID");
  fetch("https://api.ropro.io/getProfileTheme.php?userid=" + parseInt(myId), {
    method: "POST",
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.theme != null) {
        await setStorage("globalTheme", data.theme);
      }
    });
}

//RoPro's user verification system is different in RoPro v2.0, and includes support for Roblox OAuth2 authentication.
//In RoPro v1.6, we only support ingame verification via our "RoPro User Verification" experience on Roblox: https://www.roblox.com/games/16699976687/RoPro-User-Verification
function verifyUser(emoji_verification_code) {
  return new Promise((resolve) => {
    async function doVerify(resolve) {
      try {
        var formData = new FormData();
        formData.append("emoji_verification_code", emoji_verification_code);
        fetch("https://api.ropro.io/ingameVerification.php", {
          method: "POST",
          body: formData,
        })
          .then(async (response) => {
            if (response.ok) {
              var data = await response.json();
              return data;
            } else {
              throw new Error("Failed to verify user");
            }
          })
          .then(async (data) => {
            var verificationToken = data.token;
            var myId = await getStorage("rpUserID");
            if (
              verificationToken != null &&
              verificationToken.length == 25 &&
              myId == data.userid
            ) {
              console.log("Successfully verified.");
              var verificationDict = await getStorage("userVerification");
              verificationDict[myId] = verificationToken;
              await setStorage("userVerification", verificationDict);
              resolve("success");
            } else {
              resolve(null);
            }
          })
          .catch(function (r, e, s) {
            resolve(null);
          });
      } catch (e) {
        resolve(null);
      }
    }
    doVerify(resolve);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.greeting) {
    case "GetURL":
      if (
        request.url.startsWith("https://ropro.io") ||
        request.url.startsWith("https://api.ropro.io")
      ) {
        async function doPost() {
          var verificationDict = await getStorage("userVerification");
          var userID = await getStorage("rpUserID");
          var roproVerificationToken = "none";
          if (typeof verificationDict != "undefined") {
            if (verificationDict.hasOwnProperty(userID)) {
              roproVerificationToken = verificationDict[userID];
            }
          }
          fetch(request.url, {
            method: "POST",
            headers: {
              "ropro-verification": roproVerificationToken,
              "ropro-id": userID,
            },
          })
            .then(async (response) => {
              if (response.ok) {
                var data = await response.text();
                return data;
              } else {
                throw new Error("Post failed");
              }
            })
            .then((data) => {
              try {
                var json_data = JSON.parse(data);
                sendResponse(json_data);
              } catch (e) {
                sendResponse(data);
              }
            })
            .catch(function () {
              sendResponse("ERROR");
            });
        }
        doPost();
      } else {
        fetch(request.url)
          .then(async (response) => {
            if (response.ok) {
              var data = await response.text();
              return data;
            } else {
              throw new Error("Get failed");
            }
          })
          .then((data) => {
            try {
              var json_data = JSON.parse(data);
              sendResponse(json_data);
            } catch (e) {
              sendResponse(data);
            }
          })
          .catch(function () {
            sendResponse("ERROR");
          });
      }
      break;
    case "GetURLCached":
      fetch(request.url, {
        headers: {
          "Cache-Control": "public, max-age=604800",
          Pragma: "public, max-age=604800",
        },
      })
        .then(async (response) => {
          if (response.ok) {
            var data = await response.text();
            return data;
          } else {
            throw new Error("Get with cache failed");
          }
        })
        .then((data) => {
          try {
            var json_data = JSON.parse(data);
            sendResponse(json_data);
          } catch (e) {
            sendResponse(data);
          }
        })
        .catch(function () {
          sendResponse("ERROR");
        });
      break;
    case "PostURL":
      if (
        request.url.startsWith("https://ropro.io") ||
        request.url.startsWith("https://api.ropro.io")
      ) {
        async function doPostURL() {
          var verificationDict = await getStorage("userVerification");
          var userID = await getStorage("rpUserID");
          var roproVerificationToken = "none";
          if (typeof verificationDict != "undefined") {
            if (verificationDict.hasOwnProperty(userID)) {
              roproVerificationToken = verificationDict[userID];
            }
          }
          var json_data;
          if (request.form) {
            var formData = new FormData();
            var json_data = request.jsonData;
            for (var key in json_data) {
              formData.append(key, json_data[key]);
            }
            json_data = formData;
          } else if (request.wrap_json) {
            var formData = new FormData();
            formData.append("data", JSON.stringify(request.jsonData));
            json_data = formData;
          } else {
            json_data =
              typeof request.jsonData == "string"
                ? request.jsonData
                : JSON.stringify(request.jsonData);
          }
          fetch(request.url, {
            method: "POST",
            headers: {
              "ropro-verification": roproVerificationToken,
              "ropro-id": userID,
            },
            body: json_data,
          })
            .then((response) => response.text())
            .then((data) => {
              try {
                var json_data = JSON.parse(data);
                sendResponse(json_data);
              } catch (e) {
                sendResponse(data);
              }
            });
        }
        doPostURL();
      } else {
        var json_data =
          typeof request.jsonData == "string"
            ? request.jsonData
            : JSON.stringify(request.jsonData);
        fetch(request.url, {
          method: "POST",
          body: json_data,
        })
          .then((response) => response.text())
          .then((data) => {
            sendResponse(data);
          });
      }
      break;
    case "PostValidatedURL":
      var json_data =
        typeof request.jsonData == "string"
          ? request.jsonData
          : JSON.stringify(request.jsonData);
      fetch(request.url, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": myToken },
        contentType: "application/json",
        body: json_data,
      })
        .then(async (response) => {
          if (response.ok) {
            var data = await response.json();
            if (!("errors" in data)) {
              sendResponse(data);
            } else {
              sendResponse(null);
            }
          } else {
            if (response.status != 403) {
              sendResponse(null);
            } else {
              var token = response.headers.get("x-csrf-token");
              myToken = token;
              fetch(request.url, {
                method: "POST",
                headers: { "X-CSRF-TOKEN": myToken },
                contentType: "application/json",
                body:
                  typeof request.jsonData == "string"
                    ? request.jsonData
                    : JSON.stringify(request.jsonData),
              })
                .then(async (response) => {
                  var data = await response.json();
                  if (response.ok) {
                    if (!("errors" in data)) {
                      sendResponse(data);
                    } else {
                      sendResponse(null);
                    }
                  } else {
                    sendResponse(null);
                  }
                })
                .catch(function () {
                  sendResponse(null);
                });
            }
          }
        })
        .catch(function () {
          sendResponse(null);
        });
      break;
    case "GetStatusCode":
      fetch(request.url)
        .then((response) => sendResponse(response.status))
        .catch(function () {
          sendResponse(null);
        });
      break;
    case "ValidateLicense":
      getSubscription();
      break;
    case "DeclineTrade":
      fetch(
        "https://trades.roblox.com/v1/trades/" +
          parseInt(request.tradeId) +
          "/decline",
        {
          method: "POST",
          headers: { "X-CSRF-TOKEN": myToken },
        }
      ).then((response) => {
        if (response.ok) {
          sendResponse(response.status);
        } else {
          if (response.status == 403) {
            fetch(
              "https://trades.roblox.com/v1/trades/" +
                parseInt(request.tradeId) +
                "/decline",
              {
                method: "POST",
                headers: {
                  "X-CSRF-TOKEN": response.headers.get("x-csrf-token"),
                },
              }
            ).then((response) => {
              sendResponse(response.status);
            });
          } else {
            sendResponse(response.status);
          }
        }
      });
      break;
    case "GetUserID":
      fetch("https://users.roblox.com/v1/users/authenticated")
        .then((response) => response.json())
        .then((data) => {
          sendResponse(data["id"]);
        });
      break;
    case "GetCachedTrades":
      sendResponse(inboundsCache);
      break;
    case "DoCacheTrade":
      function loadInbound(id) {
        if (id in inboundsCache && inboundsCache[id] != null) {
          sendResponse([inboundsCache[id], 1]);
        } else {
          fetch("https://trades.roblox.com/v1/trades/" + id).then(
            async (response) => {
              if (response.ok) {
                var data = await response.json();
                console.log(data);
                inboundsCache[data.id] = data;
                sendResponse([data, 0]);
              } else {
                sendResponse(response.status);
              }
            }
          );
        }
      }
      loadInbound(request.tradeId);
      break;
    case "GetUsername":
      async function getUsername() {
        var username = await getStorage("rpUsername");
        sendResponse(username);
      }
      getUsername();
      break;
    case "GetUserInventory":
      async function getInventory() {
        var inventory = await loadInventory(request.userID);
        sendResponse(inventory);
      }
      getInventory();
      break;
    case "GetUserLimitedInventory":
      async function getLimitedInventory() {
        var inventory = await loadLimitedInventory(request.userID);
        sendResponse(inventory);
      }
      getLimitedInventory();
      break;
    case "ServerFilterReverseOrder":
      async function getServerFilterReverseOrder() {
        var serverList = await serverFilterReverseOrder(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterReverseOrder();
      break;
    case "ServerFilterNotFull":
      async function getServerFilterNotFull() {
        var serverList = await serverFilterNotFull(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterNotFull();
      break;
    case "ServerFilterRandomShuffle":
      async function getServerFilterRandomShuffle() {
        var serverList = await serverFilterRandomShuffle(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterRandomShuffle();
      break;
    case "ServerFilterRegion":
      async function getServerFilterRegion() {
        var serverList = await serverFilterRegion(
          request.gameID,
          request.serverLocation
        );
        sendResponse(serverList);
      }
      getServerFilterRegion();
      break;
    case "ServerFilterBestConnection":
      async function getServerFilterBestConnection() {
        var serverList = await serverFilterBestConnection(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterBestConnection();
      break;
    case "ServerFilterNewestServers":
      async function getServerFilterNewestServers() {
        var serverList = await serverFilterNewestServers(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterNewestServers();
      break;
    case "ServerFilterOldestServers":
      async function getServerFilterOldestServers() {
        var serverList = await serverFilterOldestServers(request.gameID);
        sendResponse(serverList);
      }
      getServerFilterOldestServers();
      break;
    case "ServerFilterMaxPlayers":
      async function getServerFilterMaxPlayers() {
        var servers = await maxPlayerCount(request.gameID, request.count);
        sendResponse(servers);
      }
      getServerFilterMaxPlayers();
      break;
    case "GetRandomServer":
      async function getRandomServer() {
        var randomServerElement = await randomServer(request.gameID);
        sendResponse(randomServerElement);
      }
      getRandomServer();
      break;
    case "GetProfileValue":
      getProfileValue(request.userID).then(sendResponse);
      break;
    case "GetSetting":
      async function getSettings() {
        var setting = await loadSettings(request.setting);
        sendResponse(setting);
      }
      getSettings();
      break;
    case "GetTrades":
      async function getTradesType(type) {
        var tradesType = await loadTradesType(type);
        sendResponse(tradesType);
      }
      getTradesType(request.type);
      break;
    case "GetTradesData":
      async function getTradesData(type) {
        var tradesData = await loadTradesData(type);
        sendResponse(tradesData);
      }
      getTradesData(request.type);
      break;
    case "GetSettingValidity":
      async function getSettingValidity() {
        var valid = await loadSettingValidity(request.setting);
        sendResponse(valid);
      }
      getSettingValidity();
      break;
    case "GetSettingValidityInfo":
      async function getSettingValidityInfo() {
        var valid = await loadSettingValidityInfo(request.setting);
        sendResponse(valid);
      }
      getSettingValidityInfo();
      break;
    case "CheckVerification":
      async function getUserVerification() {
        var verificationDict = await getStorage("userVerification");
        if (typeof verificationDict == "undefined") {
          sendResponse(false);
        } else {
          if (verificationDict.hasOwnProperty(await getStorage("rpUserID"))) {
            sendResponse(true);
          } else {
            sendResponse(false);
          }
        }
      }
      getUserVerification();
      break;
    case "HandleUserVerification":
      async function doUserVerification() {
        var verification = await verifyUser(request.verification_code);
        var verificationDict = await getStorage("userVerification");
        if (typeof verificationDict == "undefined") {
          sendResponse(false);
        } else {
          if (verificationDict.hasOwnProperty(await getStorage("rpUserID"))) {
            sendResponse(true);
          } else {
            sendResponse(false);
          }
        }
      }
      doUserVerification();
      break;
    case "SyncSettings":
      setLocalStorage("rpSubscriptionFreshness", 0);
      getSubscription().then(function () {
        sendResponse("sync");
      });
      break;
    case "OpenOptions":
      chrome.tabs.create({ url: chrome.runtime.getURL("/options.html") });
      break;
    case "GetSubscription":
      getSubscription().then(sendResponse);
      break;
    case "DeclineBots":
      async function doDeclineBots() {
        var tradesDeclined = await declineBots();
        sendResponse(tradesDeclined);
      }
      doDeclineBots();
      break;
    case "GetMutualFriends":
      async function doGetMutualFriends() {
        var mutuals = await mutualFriends(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualFriends();
      break;
    case "GetMutualFollowers":
      async function doGetMutualFollowers() {
        var mutuals = await mutualFollowers(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualFollowers();
      break;
    case "GetMutualFollowing":
      async function doGetMutualFollowing() {
        var mutuals = await mutualFollowing(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualFollowing();
      break;
    case "GetMutualFavorites":
      async function doGetMutualFavorites() {
        var mutuals = await mutualFavorites(request.userID, request.assetType);
        sendResponse(mutuals);
      }
      doGetMutualFavorites();
      break;
    case "GetMutualBadges":
      async function doGetMutualBadges() {
        var mutuals = await mutualFavorites(request.userID, request.assetType);
        sendResponse(mutuals);
      }
      doGetMutualBadges();
      break;
    case "GetMutualGroups":
      async function doGetMutualGroups() {
        var mutuals = await mutualGroups(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualGroups();
      break;
    case "GetMutualLimiteds":
      async function doGetMutualLimiteds() {
        var mutuals = await mutualLimiteds(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualLimiteds();
      break;
    case "GetMutualItems":
      async function doGetMutualItems() {
        var mutuals = await mutualItems(request.userID);
        sendResponse(mutuals);
      }
      doGetMutualItems();
      break;
    case "GetItemValues":
      fetchItemValues(request.assetIds).then(sendResponse);
      break;
    case "CreateInviteTab":
      chrome.tabs.create(
        {
          url: "https://roblox.com/games/" + parseInt(request.placeid),
          active: false,
        },
        function (tab) {
          chrome.tabs.onUpdated.addListener(function tempListener(tabId, info) {
            if (tabId == tab.id && info.status === "complete") {
              chrome.tabs.sendMessage(tabId, {
                type: "invite",
                key: request.key,
              });
              chrome.tabs.onUpdated.removeListener(tempListener);
              setTimeout(function () {
                sendResponse(tab);
              }, 2000);
            }
          });
        }
      );
      break;
    case "UpdateGlobalTheme":
      async function doLoadGlobalTheme() {
        await loadGlobalTheme();
        sendResponse();
      }
      doLoadGlobalTheme();
      break;
  }

  return true;
});

// ========================================================================== //
// RoPro Service Worker Alarms
// ========================================================================== //

const ropro_alarms = {
  // Alarm functions and their period in minutes
  disabled_features_alarm: { func: getDisabledFeatures, period: 10 },
  experience_playtime_alarm: { func: getTimePlayed, period: 1 },
  ropro_alerts_alarm: { func: handleAlert, period: 10 },
  load_token_alarm: { func: loadToken, period: 5 },
  trade_notifier_alarm: { func: tradeNotifierCheck, period: 1 },
};

chrome.alarms.onAlarm.addListener((alarm) => {
  // Run alarm function
  ropro_alarms[alarm.name]?.func?.();
});

(function () {
  // Create alarms if they don't exist
  for (const alarm_name in ropro_alarms) {
    chrome.alarms.get(alarm_name, (alarm) => {
      console.log("Alarm: ", alarm_name, alarm);
      if (!alarm) {
        console.log("Creating alarm: ", alarm_name);
        chrome.alarms.create(alarm_name, {
          periodInMinutes: ropro_alarms[alarm_name].period,
          delayInMinutes: 0,
        });
      }
    });
  }
})();

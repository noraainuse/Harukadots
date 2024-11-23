const COLORS = {
  GREEN: '#00b06f',
  BLUE: '#0077ff',
  RED: '#ff3e3e',
};

const { getURL } = chrome.runtime;

const USER = {
  SUCCESS: getURL('images/user-success.png'),
  NEUTRAL: getURL('images/user.png'),
  ERROR: getURL('images/user-error.png'),
};

const sleep = time => new Promise(res => setTimeout(res, time * 1000));

const get = async (url) => {
  try {
    const request = await fetch(`https://${url}`);
    if (!request.ok) throw new Error('Request failed');

    return await request.json();
  } catch (error) {
    await sleep(0.2);
    return await get(url);
  }
};

const post = async (url, body) => {
  try {
    const request = await fetch(`https://${url}`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!request.ok) throw new Error('Request failed');

    return await request.json();
  } catch (error) {
    await sleep(0.2);
    return await post(url, body);
  }
};

const search = document.getElementById('sbx-search');
const input = document.getElementById('sbx-input');
const status = document.getElementById('sbx-status');
const icon = document.getElementById('sbx-user');
const bar = document.getElementById('sbx-bar');

search.src = getURL('images/search.png');
icon.src = getURL('images/user.png');

const color = hex => {
  bar.style.backgroundColor = hex;
  search.style.backgroundColor = hex;
};

input.oninput = () => {
  const test = /(^(?=^[^_]+_?[^_]+$)\w{3,20}$|^\d+$)/.test(input.value);
  if (!input.value) icon.src = USER.NEUTRAL;
  else icon.src = test ? USER.SUCCESS : USER.ERROR;
  search.disabled = !test;
};

let searching = false;
let canceled = false;
let foundAllServers = false;
let searchingTarget = true;
let allPlayers = [];
let playersCount = 0;
let targetsChecked = 0;
let maxPlayers = 0;

let targetServersId = [];
let highlighted = [];

const allThumbnails = new Map();

async function fetchServers(place = '', cursor = '', attempts = 0) {
  const { nextPageCursor, data } = await get(`games.roblox.com/v1/games/${place}/servers/Public?limit=100&cursor=${cursor}`);

  if (attempts >= 30) {
    foundAllServers = true;
    return;
  }

  if (!data || data.length === 0) {
    await sleep(1);
    return fetchServers(place, cursor, attempts + 1);
  }

  data.forEach((server) => {
    server.playerTokens.forEach((playerToken) => {
      playersCount += 1;
      allPlayers.push({
        token: playerToken,
        type: 'AvatarHeadshot',
        size: '150x150',
        requestId: server.id,
      });
    });

    maxPlayers = server.maxPlayers;
  });

  if (!nextPageCursor || canceled) {
    foundAllServers = true;
    return;
  }

  return fetchServers(place, nextPageCursor);
}

async function findTarget(imageUrl, place) {
  while (searchingTarget) {
    if (canceled) {
      searchingTarget = false;
    }

    const chosenPlayers = [];

    for (let i = 0; i < 100; i++) {
      const playerToken = allPlayers.shift();
      if (!playerToken) break;
      chosenPlayers.push(playerToken);
    }

    if (!chosenPlayers.length) {
      await sleep(0.1);
      if (targetsChecked === playersCount && foundAllServers) {
        break;
      }
      continue;
    }

    post('thumbnails.roblox.com/v1/batch', JSON.stringify(chosenPlayers)).then(({ data: thumbnailsData }) => {
      if (canceled) return;

      thumbnailsData.forEach((thumbnailData) => {
        const thumbnails = allThumbnails.get(thumbnailData.requestId) || [];

        if (thumbnails.length == 0) {
          allThumbnails.set(thumbnailData.requestId, thumbnails);
        }

        targetsChecked += 1;

        if (!thumbnails.includes(thumbnailData.imageUrl)) {
          thumbnails.push(thumbnailData.imageUrl);
        }

        bar.style.width = `${Math.round((targetsChecked / playersCount) * 100)}%`;

        const foundTarget = thumbnailData.imageUrl === imageUrl ? thumbnailData.requestId : null;

        if (foundTarget) {
          renderServers();

          targetServersId.push(foundTarget);
          searchingTarget = false;
        }
      });
    });
  }

  if (targetServersId.length) {
    targetServersId.forEach((targetServerId) => {
      icon.src = getURL('images/user-success.png');
      color(COLORS.GREEN);
      setTimeout(() => color(COLORS.BLUE), 1000);

      const first = document.querySelectorAll('.rbx-game-server-item')[0] || document.querySelectorAll('#rbx-running-games > div.section-content-off.empty-game-instances-container > p')[0];

      if (first.className == 'no-servers-message') {
        first.parentNode.style['display'] = 'flex';
        first.parentNode.style['flex-direction'] = 'column';
      }

      const item = document.createElement('li');

      const thumbnails = allThumbnails.get(targetServerId);
      const firstFive = thumbnails.slice(0, 5);
      const amountLeft = thumbnails.length - firstFive.length;
      item.className = 'rbx-game-server-item col-md-3 col-sm-4 col-xs-6';
      item.innerHTML = `<div class="card-item found-server">
      <div class="player-thumbnails-container">
         ${firstFive.map(url => `<span class="avatar avatar-headshot-md player-avatar">
            <span class="thumbnail-2d-container avatar-card-image">
              <img class="" src="${url}" alt="" title="">
            </span>
          </span>`).join('')}
         <span class="avatar avatar-headshot-md player-avatar hidden-players-placeholder">+${amountLeft}</span>
      </div>
      <div class="rbx-game-server-details game-server-details">
         <div class="text-info rbx-game-status rbx-game-server-status text-overflow">${thumbnails.length} of ${maxPlayers} people max</div>
           <div class="server-player-count-gauge border">
            <div class="gauge-inner-bar border" style="width: 100%;"></div>
              </div>
            <span>
              <button data-id="${targetServerId}" type="button" class="btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width">Join</button>
          </span>
        </div>
      </div>`;

      first.parentNode.insertBefore(item, first);
      highlighted.push(item);

      const [join] = document.querySelectorAll(`[data-id="${targetServerId}"]`);
      join.onclick = () => chrome.runtime.sendMessage({ message: { place, id: targetServerId } });
      status.innerText = 'Found player';
    });
  } else {
    color(canceled ? COLORS.BLUE : COLORS.RED);
    status.innerText = canceled ? 'Canceled search' : 'Player not found!';
  }

  searching = false;
  canceled = false;

  bar.style.width = '100%';
  input.disabled = false;
  search.src = getURL('images/search.png');
}

function renderServers() {
  highlighted.forEach((item) => {
    item.remove();
  });

  highlighted = [];

  targetServersId.forEach((targetServerId) => {
    icon.src = getURL('images/user-success.png');
    color(COLORS.GREEN);
    setTimeout(() => color(COLORS.BLUE), 1000);

    const first = document.querySelectorAll('.rbx-game-server-item')[0];
    const item = document.createElement('li');

    const thumbnails = allThumbnails.get(targetServerId);

    item.className = 'rbx-game-server-item col-md-3 col-sm-4 col-xs-6';
    item.innerHTML = `<div class="card-item found-server">
    <div class="player-thumbnails-container">
       ${thumbnails.map(url => `<span class="avatar avatar-headshot-md player-avatar">
          <span class="thumbnail-2d-container avatar-card-image">
            <img class="" src="${url}" alt="" title="">
          </span>
        </span>`).join('')}
       <span class="avatar avatar-headshot-md player-avatar hidden-players-placeholder">+3</span>
    </div>
    <div class="rbx-game-server-details game-server-details">
       <div class="text-info rbx-game-status rbx-game-server-status text-overflow">${thumbnails.length} of ${maxPlayers} people max</div>
         <div class="server-player-count-gauge border">
          <div class="gauge-inner-bar border" style="width: 100%;"></div>
            </div>
          <span>
            <button data-id="${targetServerId}" type="button" class="btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width">Join</button>
        </span>
      </div>
    </div>`;

    first.parentNode.insertBefore(item, first);
    highlighted.push(item);

    const [join] = document.querySelectorAll(`[data-id="${targetServerId}"]`);
    join.onclick = () => chrome.runtime.sendMessage({ message: { place, id: targetServerId } });
    status.innerText = 'Found player';
  });
};

async function find(imageUrl, place) {
  allPlayers = [];
  targetServersId = [];

  allThumbnails.clear();
  foundAllServers = false;
  searchingTarget = true;
  allPlayers = [];
  playersCount = 0;
  targetsChecked = 0;
  maxPlayers = 0;

  status.innerText = 'Searching...';
  color(COLORS.BLUE);
  search.src = getURL('images/cancel.png');
  icon.src = getURL('images/user-success.png');
  input.disabled = true;

  fetchServers(place);
  findTarget(imageUrl, place);
}

search.addEventListener('click', async event => {
  // Prevents page from refreshing
  event.preventDefault();

  if (searching) {
    canceled = true;
    return;
  }

  searching = true;

  const user = await get(`api.roblox.com/users/${/^\d+$/.test(input.value) ? input.value : `get-by-username?username=${input.value}`}`);

  if (user.errors || user.errorMessage) {
    icon.src = USER.ERROR;
    searching = false;
    status.innerText = 'User not found!';
    return;
  }

  const [, place] = window.location.href.match(/games\/(\d+)\//);
  const { data: [{ imageUrl }] } = await get(`thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.Id}&size=150x150&format=Png&isCircular=false`);

  highlighted.forEach((item) => {
    item.remove();
  });

  find(imageUrl, place);
});

import { WEAPONS, GEAR } from './weapons.js';

export function updateHUD(state) {
  // Scores
  document.getElementById('score-vanguard').textContent = state.scores.vanguard;
  document.getElementById('score-sentinel').textContent = state.scores.sentinel;

  // Timer
  const time = state.phase === 'buy' ? state.buyTime : state.roundTime;
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const timerEl = document.getElementById('round-timer');
  timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  timerEl.style.color = state.phase === 'buy' ? '#4ade80' : (time < 15 ? '#f43f5e' : '#f8fafc');

  // Alive counts
  const vAlive = (state.player.alive ? 1 : 0) + state.bots.filter(b => b.team === 'vanguard' && b.alive).length;
  const sAlive = state.bots.filter(b => b.team === 'sentinel' && b.alive).length;
  document.getElementById('alive-v').textContent = vAlive;
  document.getElementById('alive-s').textContent = sAlive;

  // Player stats
  const p = state.player;
  document.getElementById('stat-hp').textContent = Math.max(0, Math.floor(p.hp));
  document.getElementById('stat-armor').textContent = p.armor;
  document.getElementById('stat-money').textContent = `$${p.money}`;

  const weaponDef = WEAPONS[p.weapon];
  const inv = p.inventory[p.weapon];
  document.getElementById('stat-weapon-name').textContent = weaponDef.name;
  document.getElementById('stat-ammo').textContent = `${inv.mag} / ${inv.reserve}`;

  // Bomb status / Plant & Defuse progress
  const bombStatusEl = document.getElementById('bomb-status');
  const progContainer = document.getElementById('progress-bar-container');
  const progFill = document.getElementById('progress-bar-fill');

  if (state.bomb.planted) {
    bombStatusEl.style.display = 'block';
    bombStatusEl.textContent = `BOMB PLANTED: ${Math.ceil(state.bomb.timer)}s`;
  } else {
    bombStatusEl.style.display = 'none';
  }

  if (state.bomb.planting) {
    progContainer.style.display = 'block';
    progFill.style.width = `${(state.bomb.plantProgress / 3.0) * 100}%`;
  } else if (state.bomb.defusing) {
    progContainer.style.display = 'block';
    progFill.style.width = `${(state.bomb.defuseProgress / 5.0) * 100}%`;
  } else {
    progContainer.style.display = 'none';
  }

  // Buy menu money update
  const buyMoneyEl = document.getElementById('buy-menu-money');
  if (buyMoneyEl) buyMoneyEl.textContent = `$${p.money}`;
}

export function showHitmarker() {
  const hm = document.getElementById('hitmarker');
  hm.style.opacity = '1';
  setTimeout(() => {
    hm.style.opacity = '0';
  }, 100);
}

export function addKillFeed(killer, victim, weapon) {
  const feed = document.getElementById('kill-feed');
  const item = document.createElement('div');
  item.className = 'kill-item';
  item.textContent = `${killer} [${weapon}] ${victim}`;
  feed.appendChild(item);
  setTimeout(() => {
    item.remove();
  }, 5000);
}

export function showBanner(text) {
  const banner = document.getElementById('round-banner');
  banner.textContent = text;
  banner.style.opacity = '1';
  setTimeout(() => {
    banner.style.opacity = '0';
  }, 3500);
}

export function setupBuyMenu(state, onBuy) {
  const listEl = document.getElementById('buy-items-list');
  listEl.innerHTML = '';

  const allItems = { ...WEAPONS, ...GEAR };
  Object.values(allItems).forEach(item => {
    const el = document.createElement('div');
    el.className = 'buy-item';
    el.innerHTML = `
      <div class="buy-item-info">
        <div class="name">${item.name}</div>
        <div class="desc">${item.type ? 'Weapon' : 'Equipment'}</div>
      </div>
      <div class="buy-item-price">$${item.price}</div>
    `;
    el.onclick = () => onBuy(item.id);
    listEl.appendChild(el);
  });
}

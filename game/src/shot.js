import { MAP_DATA } from './map.js';

export function handleScreenshotMode(state, camera) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;

  const buyMenuEl = document.getElementById('buy-menu');
  const overlayEl = document.getElementById('overlay');
  const bannerEl = document.getElementById('round-banner');
  if (overlayEl) overlayEl.style.display = 'none';

  if (shot === 'start') {
    state.phase = 'buy';
    state.buyTime = 15;
    state.player.pos = { ...MAP_DATA.spawns.vanguard };
    state.player.rot = { yaw: Math.PI, pitch: 0 }; // face +z toward map and crates
    if (buyMenuEl) buyMenuEl.style.display = 'block';
  } else if (shot === 'play') {
    state.phase = 'active';
    state.player.alive = true;
    state.player.hp = 100;
    state.player.pos = { x: 0, y: 1.6, z: -15 };
    state.player.rot = { yaw: 0, pitch: 0 }; // facing -z
    if (buyMenuEl) buyMenuEl.style.display = 'none';
    
    // Find first sentinel bot and position it at z = -25 (ahead of player facing -z) with full HP
    const sentinelBot = state.bots.find(b => b.team === 'sentinel');
    if (sentinelBot) {
      sentinelBot.pos = { x: 0, y: 1.6, z: -25 };
      sentinelBot.alive = true;
      sentinelBot.hp = 100;
      sentinelBot.rot.yaw = Math.PI; // facing player
    }
  } else if (shot === 'end') {
    state.phase = 'ended';
    state.bomb.planted = true;
    state.bomb.site = 'A';
    state.bomb.timer = 20;
    state.player.pos = { x: 22, y: 1.6, z: 24 };
    state.player.rot = { yaw: 0.2, pitch: -0.1 };
    if (buyMenuEl) buyMenuEl.style.display = 'none';
    if (bannerEl) {
      bannerEl.textContent = 'VANGUARD WINS - ROUND 1';
      bannerEl.style.opacity = '1';
    }
  }

  return true;
}

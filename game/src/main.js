import { state } from './state.js';
import { RendererSystem } from './render.js';
import { PlayerController } from './player.js';
import { initBots, updateBots } from './bots.js';
import { MAP_DATA } from './map.js';
import { updateHUD, setupBuyMenu, showBanner } from './hud.js';
import { WEAPONS, GEAR } from './weapons.js';
import { handleScreenshotMode } from './shot.js';
import { playWinSting } from './audio.js';

const canvas = document.getElementById('canvas');
const renderer = new RendererSystem(canvas);
const playerController = new PlayerController(state, renderer.camera);

// Expose debug hook for testing
window.__breachline = { state };

// Buy menu actions
setupBuyMenu(state, (itemId) => {
  const item = WEAPONS[itemId] || GEAR[itemId];
  if (!item) return;
  const p = state.player;
  if (p.money >= item.price) {
    p.money -= item.price;
    if (item.type) {
      p.weapon = itemId;
    } else if (itemId === 'kevlar') {
      p.gear.kevlar = true;
      p.armor = 50;
    } else if (itemId === 'frag' || itemId === 'smoke') {
      p.gear[itemId]++;
    }
  }
});

document.getElementById('close-buy-btn').onclick = () => {
  document.getElementById('buy-menu').style.display = 'none';
};

document.getElementById('start-btn').onclick = () => {
  document.getElementById('overlay').style.display = 'none';
  canvas.requestPointerLock();
};

document.addEventListener('pointerlockchange', () => {
  playerController.mouseLocked = document.pointerLockElement === canvas;
});

// Key bindings for buy menu (B)
window.addEventListener('keydown', e => {
  if (e.code === 'KeyB' && state.phase === 'buy') {
    const bm = document.getElementById('buy-menu');
    bm.style.display = bm.style.display === 'block' ? 'none' : 'block';
  }
});

function startRound() {
  state.phase = 'buy';
  state.buyTime = 15;
  state.roundTime = 100;
  state.player.alive = true;
  state.player.pos = { ...MAP_DATA.spawns.vanguard };
  state.player.vel = { x: 0, y: 0, z: 0 };
  state.player.hp = 100;
  state.player.armor = state.player.gear.kevlar ? 50 : 0;
  
  initBots(state);
  document.getElementById('buy-menu').style.display = 'block';
}

startRound();
handleScreenshotMode(state, renderer.camera);

let lastTime = performance.now();
const fixedStep = 1 / 60;
let accumulator = 0;

function loop(currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;
  accumulator += dt;

  while (accumulator >= fixedStep) {
    // Fixed step simulation
    if (state.phase === 'buy') {
      state.buyTime -= fixedStep;
      playerController.update(fixedStep);
      if (state.buyTime <= 0 || playerController.keys['KeyW'] || playerController.keys['KeyS'] || playerController.keys['KeyA'] || playerController.keys['KeyD']) {
        state.phase = 'active';
        document.getElementById('buy-menu').style.display = 'none';
      }
    } else if (state.phase === 'active') {
      state.roundTime -= fixedStep;
      playerController.update(fixedStep);
      updateBots(state, fixedStep);

      // Check bomb plant/defuse timer
      if (state.bomb.planted) {
        state.bomb.timer -= fixedStep;
        if (state.bomb.timer <= 0) {
          // Detonation -> Sentinel loses / Vanguard wins
          state.scores.vanguard++;
          state.roundResult = { winner: 'vanguard', reason: 'detonation' };
          state.phase = 'ended';
          showBanner('VANGUARD WINS - BOMB DETONATED');
          playWinSting();
          setTimeout(startRound, 4000);
        }
      }

      // Check round end conditions (elimination)
      const vAlive = state.player.alive || state.bots.some(b => b.team === 'vanguard' && b.alive);
      const sAlive = state.bots.some(b => b.team === 'sentinel' && b.alive);

      if (!vAlive || !sAlive || state.roundTime <= 0) {
        state.phase = 'ended';
        let winner = 'sentinel';
        if (!sAlive) {
          winner = 'vanguard';
          state.scores.vanguard++;
        } else {
          state.scores.sentinel++;
        }
        showBanner(`${winner.toUpperCase()} WINS ROUND`);
        playWinSting();
        setTimeout(startRound, 4000);
      }
    }

    accumulator -= fixedStep;
  }

  renderer.render(state, dt);
  updateHUD(state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

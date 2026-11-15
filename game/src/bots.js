import { MAP_DATA } from './map.js';
import { fireWeapon } from './combat.js';

export function initBots(state) {
  state.bots = [];
  // 4 Vanguard bots, 5 Sentinel bots
  const botConfigs = [
    { id: 'V-Bot1', team: 'vanguard', role: 'roamer', pos: { x: -3, y: 1.6, z: -33 } },
    { id: 'V-Bot2', team: 'vanguard', role: 'site-holder', pos: { x: 3, y: 1.6, z: -33 } },
    { id: 'V-Bot3', team: 'vanguard', role: 'mid', pos: { x: -1, y: 1.6, z: -32 } },
    { id: 'V-Bot4', team: 'vanguard', role: 'roamer', pos: { x: 2, y: 1.6, z: -34 } },
    { id: 'S-Bot1', team: 'sentinel', role: 'site-holder', pos: { x: 22, y: 1.6, z: 33 } },
    { id: 'S-Bot2', team: 'sentinel', role: 'site-holder', pos: { x: -22, y: 1.6, z: 33 } },
    { id: 'S-Bot3', team: 'sentinel', role: 'roamer', pos: { x: -5, y: 1.6, z: 32 } },
    { id: 'S-Bot4', team: 'sentinel', role: 'roamer', pos: { x: 5, y: 1.6, z: 32 } },
    { id: 'S-Bot5', team: 'sentinel', role: 'mid', pos: { x: 0, y: 1.6, z: 34 } }
  ];

  botConfigs.forEach(cfg => {
    state.bots.push({
      id: cfg.id,
      team: cfg.team,
      role: cfg.role,
      pos: { ...cfg.pos },
      rot: { yaw: cfg.team === 'vanguard' ? 0 : Math.PI, pitch: 0 },
      hp: 100,
      armor: 0,
      alive: true,
      weapon: 'ar77',
      inventory: { ar77: { mag: 30, reserve: 90 } },
      state: 'patrol',
      targetWaypoint: Math.floor(Math.random() * MAP_DATA.waypoints.length),
      shootCooldown: 0
    });
  });
}

export function updateBots(state, dt) {
  if (state.phase !== 'active') return;

  state.bots.forEach(bot => {
    if (!bot.alive) return;

    // Find nearest enemy (player or opposing bots)
    const enemies = [];
    if (bot.team !== state.player.team && state.player.alive) {
      enemies.push({ pos: state.player.pos, obj: state.player, isPlayer: true });
    }
    state.bots.forEach(b => {
      if (b.team !== bot.team && b.alive) {
        enemies.push({ pos: b.pos, obj: b, isPlayer: false });
      }
    });

    let nearestEnemy = null;
    let minDist = 999;
    enemies.forEach(e => {
      const dist = Math.hypot(e.pos.x - bot.pos.x, e.pos.z - bot.pos.z);
      if (dist < minDist) {
        minDist = dist;
        nearestEnemy = e;
      }
    });

    if (nearestEnemy && minDist < 25) {
      bot.state = 'engage';
      // Look at enemy
      const dx = nearestEnemy.pos.x - bot.pos.x;
      const dz = nearestEnemy.pos.z - bot.pos.z;
      bot.rot.yaw = Math.atan2(-dx, -dz);

      // Shoot if cooldown ready
      bot.shootCooldown -= dt;
      if (bot.shootCooldown <= 0) {
        bot.shootCooldown = 0.2;
        fireWeapon(bot, nearestEnemy.isPlayer ? [state.player] : state.bots, state, null, false);
      }
    } else {
      bot.state = 'patrol';
      // Move towards target waypoint
      const wp = MAP_DATA.waypoints[bot.targetWaypoint];
      if (wp) {
        const dx = wp.pos.x - bot.pos.x;
        const dz = wp.pos.z - bot.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 2) {
          // Pick next random waypoint
          bot.targetWaypoint = wp.neighbors[Math.floor(Math.random() * wp.neighbors.length)];
          if (typeof bot.targetWaypoint !== 'number') {
            bot.targetWaypoint = 0;
          }
        } else {
          bot.rot.yaw = Math.atan2(-dx, -dz);
          bot.pos.x += Math.sin(bot.rot.yaw) * -3.5 * dt;
          bot.pos.z += Math.cos(bot.rot.yaw) * -3.5 * dt;
        }
      }
    }
  });
}

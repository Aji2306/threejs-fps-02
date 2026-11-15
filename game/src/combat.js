import { WEAPONS } from './weapons.js';
import { showHitmarker, addKillFeed } from './hud.js';
import { playHitTick, playGunshot } from './audio.js';

export function fireWeapon(shooter, targetList, state, renderer, isPlayer = false) {
  const weapon = WEAPONS[shooter.weapon];
  const inv = shooter.inventory[shooter.weapon];
  if (!inv || inv.mag <= 0) return false;
  inv.mag--;

  playGunshot(shooter.weapon);

  // Compute ray origin and direction from yaw & pitch
  const yaw = shooter.rot.yaw;
  const pitch = shooter.rot.pitch;
  const dir = {
    x: -Math.sin(yaw) * Math.cos(pitch),
    y: Math.sin(pitch),
    z: -Math.cos(yaw) * Math.cos(pitch)
  };

  // Add spread
  const spread = weapon.spread;
  dir.x += (Math.random() - 0.5) * spread;
  dir.y += (Math.random() - 0.5) * spread;
  dir.z += (Math.random() - 0.5) * spread;

  // Normalize dir
  const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
  if (len > 0) {
    dir.x /= len; dir.y /= len; dir.z /= len;
  }

  const start = {
    x: shooter.pos.x,
    y: shooter.pos.y + (shooter.isCrouching ? 0.8 : 1.4),
    z: shooter.pos.z
  };

  const end = {
    x: start.x + dir.x * weapon.range,
    y: start.y + dir.y * weapon.range,
    z: start.z + dir.z * weapon.range
  };

  if (renderer) {
    renderer.addTracer(start, end);
  }

  let closestDist = weapon.range;
  let hitTarget = null;
  let hitPart = 'chest';
  let hitYCoord = start.y;

  targetList.forEach(t => {
    if (!t.alive || t === shooter) return;

    // Vertical capsule segment: y from t.pos.y - 0.8 to t.pos.y + 1.0, radius 0.55
    const minY = t.pos.y - 0.8;
    const maxY = t.pos.y + 1.0;
    const radius = 0.55;

    // Ray XZ projection closest parameter t
    const denom = dir.x * dir.x + dir.z * dir.z;
    let along = 0;
    if (Math.abs(denom) > 1e-6) {
      along = ((t.pos.x - start.x) * dir.x + (t.pos.z - start.z) * dir.z) / denom;
    } else {
      along = Math.hypot(t.pos.x - start.x, t.pos.z - start.z);
    }

    if (along < 0 || along > weapon.range || along >= closestDist) return;

    const px = start.x + dir.x * along;
    const pz = start.z + dir.z * along;
    const h = Math.hypot(px - t.pos.x, pz - t.pos.z);
    if (h > radius) return;

    const py = start.y + dir.y * along;
    
    // Check if py is within vertical segment [minY, maxY] or within cap sphere radius
    let validHit = false;
    let clampedY = py;
    if (py >= minY && py <= maxY) {
      validHit = true;
    } else {
      const capY = py < minY ? minY : maxY;
      const dist3D = Math.hypot(px - t.pos.x, py - capY, pz - t.pos.z);
      if (dist3D < radius) {
        validHit = true;
        clampedY = capY;
      }
    }

    if (validHit) {
      closestDist = along;
      hitTarget = t;
      hitYCoord = clampedY;

      const relY = clampedY - minY;
      if (relY >= 1.2 && relY <= 1.8) {
        hitPart = 'head';
      } else if (relY >= 0.4 && relY < 1.2) {
        hitPart = 'chest';
      } else {
        hitPart = 'limb';
      }
    }
  });

  if (hitTarget) {
    let dmg = weapon.damage;
    if (hitPart === 'head') dmg *= 4.0;
    else if (hitPart === 'limb') dmg *= 0.75;

    // Armor absorption
    if (hitTarget.armor > 0) {
      const absorbed = Math.min(hitTarget.armor, dmg * 0.5);
      hitTarget.armor -= absorbed;
      dmg -= absorbed;
    }

    hitTarget.hp -= dmg;
    if (isPlayer) {
      showHitmarker();
      playHitTick();
    }

    if (hitTarget.hp <= 0 && hitTarget.alive) {
      hitTarget.alive = false;
      const killerName = isPlayer ? 'You' : (shooter.id || 'Bot');
      const victimName = hitTarget.id || 'Bot';
      addKillFeed(killerName, victimName, weapon.name);

      if (isPlayer) {
        state.player.money += 300;
      }
    }
  }

  return true;
}

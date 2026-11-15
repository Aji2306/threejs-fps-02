import { MAP_DATA } from './map.js';
import { WEAPONS } from './weapons.js';
import { fireWeapon } from './combat.js';
import { playReload } from './audio.js';
import * as THREE from 'three';

export class PlayerController {
  constructor(state, camera) {
    this.state = state;
    this.camera = camera;
    this.keys = {};
    this.mouseLocked = false;

    // Movement tuning
    this.maxSpeed = 6.0;
    this.accel = 40.0;
    this.friction = 8.0;
    this.gravity = 25.0;
    this.jumpForce = 8.0;

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'KeyR') {
        this.reload();
      }
      if (e.code === 'KeyE') {
        this.checkBombInteraction(true);
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      if (e.code === 'KeyE') {
        this.checkBombInteraction(false);
      }
    });

    window.addEventListener('mousemove', e => {
      if (!this.mouseLocked || this.state.phase !== 'active') return;
      const sensitivity = 0.002;
      this.state.player.rot.yaw -= e.movementX * sensitivity;
      this.state.player.rot.pitch -= e.movementY * sensitivity;

      const maxPitch = Math.PI / 2 - 0.01;
      this.state.player.rot.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.state.player.rot.pitch));
    });

    window.addEventListener('mousedown', e => {
      if (!this.mouseLocked || this.state.phase !== 'active') return;
      if (e.button === 0) {
        this.shoot();
      }
    });
  }

  reload() {
    const p = this.state.player;
    const weapon = WEAPONS[p.weapon];
    const inv = p.inventory[p.weapon];
    if (inv.mag >= weapon.magSize || inv.reserve <= 0) return;

    playReload();
    const needed = weapon.magSize - inv.mag;
    const take = Math.min(needed, inv.reserve);
    inv.mag += take;
    inv.reserve -= take;
  }

  shoot() {
    const p = this.state.player;
    if (!p.alive || this.state.phase !== 'active') return;
    fireWeapon(p, this.state.bots, this.state, null, true);
  }

  checkBombInteraction(isDown) {
    const p = this.state.player;
    if (!p.alive) return;

    // Check distance to Site A or B
    const siteA = MAP_DATA.sites.A;
    const siteB = MAP_DATA.sites.B;
    const distA = Math.hypot(p.pos.x - siteA.center.x, p.pos.z - siteA.center.z);
    const distB = Math.hypot(p.pos.x - siteB.center.x, p.pos.z - siteB.center.z);

    const atSiteA = distA <= siteA.radius;
    const atSiteB = distB <= siteB.radius;

    if ((atSiteA || atSiteB) && p.team === 'vanguard' && !this.state.bomb.planted) {
      if (isDown) {
        this.state.bomb.planting = true;
        this.state.bomb.site = atSiteA ? 'A' : 'B';
      } else {
        this.state.bomb.planting = false;
        this.state.bomb.plantProgress = 0;
      }
    }
  }

  update(dt) {
    const p = this.state.player;
    if (!p.alive) return;

    // Movement input
    let forward = 0;
    let right = 0;
    if (this.keys['KeyW']) forward += 1;
    if (this.keys['KeyS']) forward -= 1;
    if (this.keys['KeyD']) right += 1;
    if (this.keys['KeyA']) right -= 1;

    p.isCrouching = !!this.keys['ControlLeft'];
    const speedMult = WEAPONS[p.weapon].moveSpeedMult * (p.isCrouching ? 0.5 : 1.0);
    const currentMaxSpeed = this.maxSpeed * speedMult;

    const yaw = p.rot.yaw;
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);

    const moveX = (right * cosY - forward * sinY);
    const moveZ = (right * sinY + forward * cosY);

    // Apply acceleration and friction
    const targetVelX = moveX * currentMaxSpeed;
    const targetVelZ = moveZ * currentMaxSpeed;

    p.vel.x += (targetVelX - p.vel.x) * Math.min(1, this.accel * dt);
    p.vel.z += (targetVelZ - p.vel.z) * Math.min(1, this.accel * dt);

    // Gravity & Jump
    if (p.isGrounded) {
      if (this.keys['Space']) {
        p.vel.y = this.jumpForce;
        p.isGrounded = false;
      } else {
        p.vel.y = 0;
      }
    } else {
      p.vel.y -= this.gravity * dt;
    }

    // Position integration with AABB collision
    const newX = p.pos.x + p.vel.x * dt;
    const newY = p.pos.y + p.vel.y * dt;
    const newZ = p.pos.z + p.vel.z * dt;

    // Simple AABB collision check against MAP_DATA.colliders
    p.pos.x = this.resolveCollision(newX, p.pos.y, p.pos.z, 0.4, 1.6, 'x');
    p.pos.y = this.resolveCollision(p.pos.x, newY, p.pos.z, 0.4, 1.6, 'y');
    p.pos.z = this.resolveCollision(p.pos.x, p.pos.y, newZ, 0.4, 1.6, 'z');

    if (p.pos.y <= 1.6) {
      p.pos.y = 1.6;
      p.isGrounded = true;
    }

    // Update camera position and rotation
    this.camera.position.set(p.pos.x, p.pos.y + (p.isCrouching ? 0.2 : 0.8), p.pos.z);
    
    const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.rot.yaw);
    const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), p.rot.pitch);
    this.camera.quaternion.copy(qYaw).multiply(qPitch);

    // Plant progress
    if (this.state.bomb.planting) {
      this.state.bomb.plantProgress += dt;
      if (this.state.bomb.plantProgress >= 3.0) {
        this.state.bomb.planted = true;
        this.state.bomb.planting = false;
        this.state.bomb.planter = 'player';
        this.state.player.money += 300;
        document.getElementById('bomb-status').style.display = 'block';
      }
    }
  }

  resolveCollision(x, y, z, radius, height, axis) {
    const minX = x - radius;
    const maxX = x + radius;
    const minY = y - height;
    const maxY = y;
    const minZ = z - radius;
    const maxZ = z + radius;

    for (const c of MAP_DATA.colliders) {
      if (
        maxX > c.min[0] && minX < c.max[0] &&
        maxY > c.min[1] && minY < c.max[1] &&
        maxZ > c.min[2] && minZ < c.max[2]
      ) {
        if (axis === 'x') return x - (x > (c.min[0] + c.max[0]) / 2 ? maxX - c.min[0] : minX - c.max[0]);
        if (axis === 'y') return y - (y > (c.min[1] + c.max[1]) / 2 ? maxY - c.min[1] : minY - c.max[1]);
        if (axis === 'z') return z - (z > (c.min[2] + c.max[2]) / 2 ? maxZ - c.min[2] : minZ - c.max[2]);
      }
    }
    return axis === 'x' ? x : (axis === 'y' ? y : z);
  }
}

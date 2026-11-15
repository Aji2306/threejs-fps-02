import * as THREE from 'three';
import { MAP_DATA } from './map.js';

export class RendererSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1c2836);
    this.scene.fog = new THREE.FogExp2(0x1c2836, 0.01);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.botMeshes = new Map();
    this.tracerLines = [];
    this.particles = [];

    this.initLighting();
    this.initMapGeometry();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x334155, 1.4);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xf97316, 1.5);
    dirLight.position.set(30, 50, -30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);
  }

  initMapGeometry() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.2 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Build colliders & static map objects
    MAP_DATA.colliders.forEach(c => {
      const width = c.max[0] - c.min[0];
      const height = c.max[1] - c.min[1];
      const depth = c.max[2] - c.min[2];
      const cx = (c.min[0] + c.max[0]) / 2;
      const cy = (c.min[1] + c.max[1]) / 2;
      const cz = (c.min[2] + c.max[2]) / 2;

      const geo = new THREE.BoxGeometry(width, height, depth);
      const mat = new THREE.MeshStandardMaterial({
        color: height > 6 ? 0x475569 : (width > 10 ? 0x14b8a6 : 0xea580c),
        roughness: 0.6,
        metalness: 0.3
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cx, cy, cz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });

    // Bomb Site A & B glowing markers
    ['A', 'B'].forEach(siteKey => {
      const site = MAP_DATA.sites[siteKey];
      const ringGeo = new THREE.RingGeometry(site.radius - 0.5, site.radius, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: siteKey === 'A' ? 0xf97316 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(site.center.x, 0.05, site.center.z);
      this.scene.add(ring);
    });
  }

  updateBots(bots) {
    bots.forEach(bot => {
      let mesh = this.botMeshes.get(bot.id);
      if (!mesh && bot.alive) {
        // Create bot mesh (capsule-like using cylinder + sphere)
        const group = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: bot.team === 'vanguard' ? 0x38bdf8 : 0xf43f5e,
          roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.8;
        body.castShadow = true;
        group.add(body);

        this.scene.add(group);
        this.botMeshes.set(bot.id, group);
        mesh = group;
      }

      if (mesh) {
        if (!bot.alive) {
          mesh.visible = false;
        } else {
          mesh.visible = true;
          mesh.position.set(bot.pos.x, bot.pos.y - 0.8, bot.pos.z);
          mesh.rotation.y = bot.rot.yaw;
        }
      }
    });
  }

  addTracer(start, end) {
    const points = [new THREE.Vector3(start.x, start.y, start.z), new THREE.Vector3(end.x, end.y, end.z)];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0xfde047, transparent: true, opacity: 1.0 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracerLines.push({ line, life: 0.15 });
  }

  updateTracers(dt) {
    for (let i = this.tracerLines.length - 1; i >= 0; i--) {
      const t = this.tracerLines[i];
      t.life -= dt;
      t.line.material.opacity = t.life / 0.15;
      if (t.life <= 0) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        t.line.material.dispose();
        this.tracerLines.splice(i, 1);
      }
    }
  }

  render(state, dt) {
    this.updateBots(state.bots);
    this.updateTracers(dt);
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

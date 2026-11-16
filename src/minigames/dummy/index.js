// Dummy Minigame: modul pengujian integrasi Core (TDD 11).
// Hanya MENGGUNAKAN fasilitas Core (Player System, Joystick, Timer); tidak membuat ulang sistem global.
import { Timer } from '../../core/timer.js';
import { createScene } from './scene.js';
import { createCamera, fitCamera } from './camera.js';
import { createArena, ARENA_CONFIG } from './arena.js';

// Titik spawn per slot, sejajar dengan sudut joystick masing-masing (P1 kiri-bawah, P2 kanan-bawah, P3 kiri-atas, P4 kanan-atas).
const SPAWN_OFFSET = 4;
const SPAWNS = [
  { x: -SPAWN_OFFSET, z: SPAWN_OFFSET },
  { x: SPAWN_OFFSET, z: SPAWN_OFFSET },
  { x: -SPAWN_OFFSET, z: -SPAWN_OFFSET },
  { x: SPAWN_OFFSET, z: -SPAWN_OFFSET },
];
const WALL_MARGIN = 0.6;

export function createMinigame() {
  return new DummyMinigame();
}

class DummyMinigame {
  constructor() {
    this.ctx = null;
    this.scene = null;
    this.camera = null;
    this.arena = null;
    this.entries = [];   // { player, playerInfo }
    this.timer = new Timer();
    this.paused = false;
    this.destroyed = false;
  }

  init(ctx) {
    this.ctx = ctx;
    const { width, height } = ctx.getViewport();

    const { scene, lights } = createScene();
    this.scene = scene;
    this.lights = lights;
    this.camera = createCamera(ARENA_CONFIG.size, width / height);

    this.arena = createArena(ARENA_CONFIG);
    scene.add(this.arena.mesh);

    const half = ARENA_CONFIG.size / 2 - WALL_MARGIN;
    const bounds = { minX: -half, maxX: half, minZ: -half, maxZ: half };

    for (const info of ctx.config.players) {
      if (info.isBot) continue; // bot belum ada pada prototype
      const spawn = SPAWNS[info.slot % SPAWNS.length];
      const player = ctx.playerManager.createPlayer(info, { x: spawn.x, z: spawn.z, bounds });
      scene.add(player.root);
      ctx.controlManager.createJoystick(info);
      this.entries.push({ player, info });
    }
  }

  start() {
    this.paused = false;
    this.timer.start();
  }

  update(dt) {
    if (this.paused || this.destroyed) return;
    this.timer.update(dt);
    const input = this.ctx.inputManager;
    for (const { player, info } of this.entries) {
      const axes = input.getAxes(info.id); // kanal input milik pemain ini saja
      player.update(dt, axes.x, axes.y);
    }
  }

  render() {
    if (this.destroyed) return;
    this.ctx.renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    if (this.camera) fitCamera(this.camera, ARENA_CONFIG.size, width / height);
  }

  pause() {
    this.paused = true;
    this.timer.pause();
  }

  resume() {
    this.paused = false;
    this.timer.resume();
  }

  getResults() {
    return { elapsed: this.timer.elapsed, scores: this.ctx?.scoreManager.getResults() ?? [] };
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.timer.stop();
    for (const { player } of this.entries) this.ctx.playerManager.destroyPlayer(player);
    this.ctx.controlManager.destroyAll(); // lepas listener + hapus DOM joystick
    this.entries = [];
    this.arena?.dispose();
    this.scene?.clear();
    this.arena = null;
    this.scene = null;
    this.camera = null;
  }
}

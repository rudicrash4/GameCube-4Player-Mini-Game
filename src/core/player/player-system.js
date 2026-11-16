// Player System (TDD 5.1): model karakter global, identitas, posisi/rotasi, movement, animasi.
import * as THREE from 'three';
import { ASSET_PATHS, ANIMATION_IDS, CHARACTER } from '../../config.js';
import { buildBedrockModel } from './bedrock-model.js';
import { AnimationClip, AnimationController } from './animation-manager.js';
import { MovementController } from './movement-controller.js';

function pickAnimation(json, id, file) {
  const def = json?.animations?.[id];
  if (!def) throw new Error(`Animasi "${id}" tidak ada di ${file}. Aset belum tersedia.`);
  return def;
}

export class Player {
  constructor({ id, name, slot, color, colorCss }, model, animator, movement, materials, geometryKeys, assetManager) {
    this.id = id;
    this.name = name;
    this.slot = slot;
    this.color = color;
    this.colorCss = colorCss;
    this.model = model;
    this.animator = animator;
    this.movement = movement;
    this.root = new THREE.Group();
    this.root.name = `Player-${id}`;
    this.root.add(model.root);
    this._materials = materials;
    this._geometryKeys = geometryKeys;
    this._assets = assetManager;
    this.disposed = false;
    this._sync();
  }

  setPosition(x, z) { this.movement.setPosition(x, z); this._sync(); }

  /** @param {number} ix kanan+  @param {number} iy atas+  (panjang <= 1) */
  update(dt, ix, iy) {
    this.movement.update(dt, ix, iy);
    this.animator.setLocomotion(this.movement.amount);
    this.animator.update(dt);
    this._sync();
  }

  _sync() {
    this.root.position.set(this.movement.x, 0, this.movement.z);
    this.root.rotation.y = this.movement.yaw;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.root.removeFromParent();
    for (const m of this._materials) m.dispose();
    for (const key of this._geometryKeys) this._assets.release(key);
  }
}

export class PlayerSystem {
  constructor({ assetManager }) {
    this.assets = assetManager;
    this.players = new Set();
    this.loaded = false;
    this.geometryJson = null;
    this.clips = null;
    this.report = null;
  }

  /** Muat aset global karakter. Melempar error jika model/animasi yang dibutuhkan tidak ada. */
  async load() {
    const [geometryJson, idleJson, moveJson] = await Promise.all([
      this.assets.loadJSON(ASSET_PATHS.characterModel),
      this.assets.loadJSON(ASSET_PATHS.animations.idle),
      this.assets.loadJSON(ASSET_PATHS.animations.move),
    ]);
    this.geometryJson = geometryJson;

    // Bangun satu model contoh untuk memvalidasi dan mendapatkan daftar bone.
    const probe = this._build('probe', 0xffffff);
    const boneNames = probe.model.boneNames;
    this._disposeBuild(probe);

    const idle = new AnimationClip(ANIMATION_IDS.idle, pickAnimation(idleJson, ANIMATION_IDS.idle, ASSET_PATHS.animations.idle)).bind(boneNames);
    const move = new AnimationClip(ANIMATION_IDS.move, pickAnimation(moveJson, ANIMATION_IDS.move, ASSET_PATHS.animations.move)).bind(boneNames);
    this.clips = { idle, move };

    this.report = {
      geometry: probe.model.identifier,
      bones: boneNames,
      meshes: probe.model.meshes.length,
      skippedOverlayCubes: probe.model.skippedOverlay,
      animations: { idle: idle.name, move: move.name },
      // Dilaporkan, bukan dikarang:
      missingBones: { idle: idle.unmatchedBones, move: move.unmatchedBones },
      ignoredParticleEffects: move.ignoredEffects,
    };
    this.loaded = true;
    return this.report;
  }

  _build(id, colorHex) {
    const materials = new Set();
    const geometryKeys = [];
    const solid = (hex) => {
      const m = new THREE.MeshLambertMaterial({ color: hex });
      materials.add(m);
      return m;
    };
    const skin = solid(CHARACTER.skinColor);
    const face = solid(CHARACTER.faceColor);
    const cloth = solid(colorHex);
    const legs = solid(CHARACTER.legColor);

    const model = buildBedrockModel({
      THREE,
      geometryJson: this.geometryJson,
      acquireGeometry: (w, h, d) => {
        const key = `geo:box:${w}x${h}x${d}`;
        geometryKeys.push(key);
        return this.assets.acquire(key, () => new THREE.BoxGeometry(w, h, d), (g) => g.dispose());
      },
      createMaterials: (bone) => {
        if (bone === 'Head') return [skin, skin, skin, skin, skin, face]; // urutan BoxGeometry: +x,-x,+y,-y,+z,-z (depan = -z)
        if (bone === 'Body' || bone.endsWith('Arm')) return cloth;
        return legs;
      },
    });
    return { model, materials, geometryKeys };
  }

  _disposeBuild({ materials, geometryKeys }) {
    for (const m of materials) m.dispose();
    for (const key of geometryKeys) this.assets.release(key);
  }

  /**
   * @param {{id:string,name:string,slot:number,color:number,colorCss:string}} info
   * @param {{x?:number,z?:number,bounds?:object}} [opts]
   */
  createPlayer(info, { x = 0, z = 0, bounds = null } = {}) {
    if (!this.loaded) throw new Error('PlayerSystem.load() belum dipanggil');
    const built = this._build(info.id, info.color);
    const animator = new AnimationController(built.model, this.clips);
    const movement = new MovementController({ bounds });
    movement.setPosition(x, z);
    const player = new Player(info, built.model, animator, movement, built.materials, built.geometryKeys, this.assets);
    this.players.add(player);
    return player;
  }

  destroyPlayer(player) {
    player.dispose();
    this.players.delete(player);
  }

  destroyAll() {
    for (const p of this.players) p.dispose();
    this.players.clear();
  }
}

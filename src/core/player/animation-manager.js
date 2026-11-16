// Animation Manager (TDD 5.2): clip Bedrock (Molang + keyframe), blending Idle <-> Walk,
// kecepatan playback mengikuti besar input joystick.
import { compileMolang } from './molang.js';
import { applyBonePose } from './bedrock-model.js';
import { CHARACTER } from '../../config.js';

// ---------- Channel (position / rotation) ----------

function toTriple(v) {
  if (Array.isArray(v)) {
    if (v.length !== 3) throw new Error('Animasi: channel harus berisi 3 nilai');
    return v.map(compileMolang);
  }
  const f = compileMolang(v);
  return [f, f, f];
}

function compileChannel(value) {
  if (Array.isArray(value) || typeof value !== 'object') {
    return { times: null, triples: [toTriple(value)] };
  }
  const frames = Object.entries(value)
    .map(([t, v]) => [parseFloat(t), v && !Array.isArray(v) && typeof v === 'object' ? (v.post ?? v.pre) : v])
    .sort((a, b) => a[0] - b[0]);
  return { times: frames.map((f) => f[0]), triples: frames.map((f) => toTriple(f[1])) };
}

function sampleChannel(ch, time, ctx, out, o) {
  const tr = ch.triples;
  if (!ch.times || tr.length === 1) {
    const f = tr[0];
    out[o] = f[0](ctx); out[o + 1] = f[1](ctx); out[o + 2] = f[2](ctx);
    return;
  }
  const times = ch.times;
  const last = times.length - 1;
  if (time <= times[0]) { const f = tr[0]; out[o] = f[0](ctx); out[o + 1] = f[1](ctx); out[o + 2] = f[2](ctx); return; }
  if (time >= times[last]) { const f = tr[last]; out[o] = f[0](ctx); out[o + 1] = f[1](ctx); out[o + 2] = f[2](ctx); return; }
  let i = 0;
  while (time >= times[i + 1]) i++;
  const a = tr[i], b = tr[i + 1];
  const k = (time - times[i]) / (times[i + 1] - times[i]);
  for (let n = 0; n < 3; n++) {
    const va = a[n](ctx), vb = b[n](ctx);
    out[o + n] = va + (vb - va) * k;
  }
}

// ---------- Clip ----------

export class AnimationClip {
  /** @param {string} name  id clip asli di file (mis. "animation.actor.idle") */
  constructor(name, def) {
    this.name = name;
    this.length = def.animation_length ?? 0;
    this.loop = def.loop ?? false;
    this.ignoredEffects = Object.values(def.particle_effects ?? {}).map((e) => e.effect);
    this._tracks = new Map();
    for (const [bone, d] of Object.entries(def.bones ?? {})) {
      this._tracks.set(bone, {
        pos: d.position !== undefined ? compileChannel(d.position) : null,
        rot: d.rotation !== undefined ? compileChannel(d.rotation) : null,
      });
    }
    this.bound = [];
    this.unmatchedBones = [];
  }

  /** Cocokkan track dengan bone milik model. Bone yang tidak ada di model dilaporkan, bukan dikarang. */
  bind(boneNames) {
    const index = new Map(boneNames.map((n, i) => [n, i]));
    this.bound = [];
    this.unmatchedBones = [];
    for (const [bone, tr] of this._tracks) {
      if (index.has(bone)) this.bound.push({ index: index.get(bone), pos: tr.pos, rot: tr.rot });
      else this.unmatchedBones.push(bone);
    }
    return this;
  }

  /** Isi pose (Float32Array boneCount*6: px,py,pz,rx,ry,rz) pada waktu t. */
  sample(time, ctx, pose) {
    pose.fill(0);
    const t = this.length > 0 ? time % this.length : time;
    for (const tr of this.bound) {
      const o = tr.index * 6;
      if (tr.pos) sampleChannel(tr.pos, t, ctx, pose, o);
      if (tr.rot) sampleChannel(tr.rot, t, ctx, pose, o + 3);
    }
  }
}

// ---------- Controller (per karakter) ----------

export class AnimationController {
  /**
   * @param {{bones:{node:object,rest:object}[]}} model
   * @param {{idle:AnimationClip, move:AnimationClip}} clips
   */
  constructor(model, clips) {
    this.model = model;
    this.clips = clips;
    const n = model.bones.length * 6;
    this._poseA = new Float32Array(n);
    this._poseB = new Float32Array(n);
    this._ctx = { life_time: 0, anim_time: 0, delta_time: 0, is_sprinting: 0 };

    this.idleTime = 0;
    this.moveTime = 0;
    this.moveWeight = 0;   // 0 = Idle penuh, 1 = Walk penuh
    this.speed = 0;        // kecepatan playback Walk (mengikuti input), dihaluskan
    this.amount = 0;       // input joystick 0..1
    this.update(0);        // terapkan pose awal
  }

  /** @param {number} amount besar input joystick 0..1 */
  setLocomotion(amount) { this.amount = Math.min(1, Math.max(0, amount)); }

  get currentAnimation() { return this.moveWeight > 0.5 ? this.clips.move.name : this.clips.idle.name; }

  update(dt) {
    const target = this.amount > CHARACTER.moveEpsilon ? 1 : 0;
    const step = dt / CHARACTER.blendTime;
    this.moveWeight += Math.max(-step, Math.min(step, target - this.moveWeight));

    // Kecepatan animasi berjalan = besar input (0.5 -> setengah, 1.0 -> penuh).
    this.speed += (this.amount - this.speed) * Math.min(1, dt * 14);
    if (this.amount === 0 && this.speed < 0.001) this.speed = 0;

    this.idleTime += dt;
    this.moveTime += dt * this.speed;

    const wm = this.moveWeight;
    const ctx = this._ctx;
    ctx.delta_time = dt;
    let pose = this._poseA;
    if (wm < 1) {
      ctx.life_time = this.idleTime;
      this.clips.idle.sample(this.idleTime, ctx, this._poseA);
    }
    if (wm > 0) {
      ctx.anim_time = this.moveTime;
      this.clips.move.sample(this.moveTime, ctx, this._poseB);
      if (wm >= 1) pose = this._poseB;
      else {
        const a = this._poseA, b = this._poseB;
        for (let i = 0; i < a.length; i++) a[i] += (b[i] - a[i]) * wm;
      }
    }

    const bones = this.model.bones;
    for (let i = 0; i < bones.length; i++) {
      const o = i * 6;
      applyBonePose(bones[i].node, bones[i].rest,
        pose[o], pose[o + 1], pose[o + 2], pose[o + 3], pose[o + 4], pose[o + 5]);
    }
  }
}

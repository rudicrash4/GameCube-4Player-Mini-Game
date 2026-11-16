// Pengujian unit logika murni (Node). Jalankan: node tests/unit.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import Module from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Peta "three" -> stub, melalui loader hook sederhana.
const stubUrl = pathToFileURL(path.join(root, 'tests/three-stub.mjs')).href;
Module.register('data:text/javascript,' + encodeURIComponent(`
  export async function resolve(spec, ctx, next){ if(spec==='three') return { url: ${JSON.stringify(stubUrl)}, shortCircuit:true }; return next(spec, ctx); }
`));

const THREE = await import('three');
const { compileMolang } = await import(pathToFileURL(path.join(root, 'src/core/player/molang.js')).href);
const { buildBedrockModel } = await import(pathToFileURL(path.join(root, 'src/core/player/bedrock-model.js')).href);
const { AnimationClip, AnimationController } = await import(pathToFileURL(path.join(root, 'src/core/player/animation-manager.js')).href);
const { MovementController } = await import(pathToFileURL(path.join(root, 'src/core/player/movement-controller.js')).href);
const { Timer } = await import(pathToFileURL(path.join(root, 'src/core/timer.js')).href);
const { AssetManager } = await import(pathToFileURL(path.join(root, 'src/core/asset-manager.js')).href);
const { computeCameraDistance, CAMERA_FOV, CAMERA_TILT } = await import(pathToFileURL(path.join(root, 'src/minigames/dummy/camera.js')).href);

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log('  ok   ', name); } catch (e) { fail++; console.log('  FAIL ', name, '\n        ', e.message); } };
const eq = (a, b, msg = '') => { if (a !== b) throw new Error(`${msg} diharapkan ${b}, dapat ${a}`); };
const near = (a, b, eps = 1e-3, msg = '') => { if (Math.abs(a - b) > eps) throw new Error(`${msg} diharapkan ${b}, dapat ${a}`); };
const json = (f) => JSON.parse(readFileSync(path.join(root, 'assets/character', f), 'utf8'));

console.log('Molang');
t('math.sin memakai derajat', () => near(compileMolang('math.sin(90)')({}), 1));
t('unary minus + perkalian', () => near(compileMolang('-math.sin(query.anim_time*540)*24')({ anim_time: 1 / 6 }), -24));
t('operator lalu angka negatif (*-2.75)', () => near(compileMolang('math.sin(query.life_time*245+25)*-2.75')({ life_time: 0 }), Math.sin(25 * Math.PI / 180) * -2.75));
t('alias q. dan query.', () => eq(compileMolang('q.anim_time+query.anim_time')({ anim_time: 2 }), 4));
t('variabel tidak dikenal melempar error', () => { let ok = false; try { compileMolang('query.foo'); } catch { ok = true; } if (!ok) throw new Error('tidak melempar'); });
t('semua ekspresi di aset animasi dapat dikompilasi', () => {
  for (const f of ['animation_idle.json', 'animation_move.json']) {
    const anims = json(f).animations;
    for (const def of Object.values(anims)) new AnimationClip('x', def);
  }
});

console.log('Model Bedrock');
const geometryJson = json('model_player.json');
const geoCalls = [];
const makeModel = (includeOverlay = false) => buildBedrockModel({
  THREE, geometryJson, includeOverlay,
  acquireGeometry: (w, h, d) => { geoCalls.push([w, h, d]); return new THREE.BoxGeometry(w, h, d); },
  createMaterials: () => new THREE.MeshLambertMaterial({}),
});
const model = makeModel();
t('7 bone sesuai aset', () => eq(model.boneNames.join(','), 'Waist,Head,Body,Right Arm,Left Arm,Right Leg,Left Leg'));
t('6 cube dasar dibuat (Waist tanpa cube), 6 cube overlay dilewati', () => { eq(model.meshes.length, 6); eq(model.skippedOverlay, 6, 'overlay'); });
t('includeOverlay=true membuat 12 cube', () => eq(makeModel(true).meshes.length, 12));
t('hirarki parent: Head/Body di Waist, Arm di Body, Leg di root', () => {
  const p = (n) => model.bones.find((b) => b.name === n).node.parent.name;
  eq(p('Head'), 'Waist'); eq(p('Body'), 'Waist'); eq(p('Right Arm'), 'Body'); eq(p('Left Leg'), 'CharacterModel');
});
t('pivot relatif: Head = (0,13,0) terhadap Waist', () => {
  const h = model.bones.find((b) => b.name === 'Head').rest;
  eq(h.px, 0); eq(h.py, 13); eq(h.pz, 0);
});
t('skala 1/16 -> tinggi kepala atas ≈ 2.1 unit', () => near(34 / 16, 2.125));

console.log('Animasi');
const idleDef = json('animation_idle.json').animations['animation.actor.idle'];
const moveDef = json('animation_move.json').animations['animation.actor.move'];
const idle = new AnimationClip('animation.actor.idle', idleDef).bind(model.boneNames);
const move = new AnimationClip('animation.actor.move', moveDef).bind(model.boneNames);
t('bone yang tidak ada di model dilaporkan', () => {
  eq(idle.unmatchedBones.join(','), 'root'); eq(move.unmatchedBones.join(','), 'root,cape');
});
t('efek partikel dilaporkan sebagai diabaikan', () => eq(move.ignoredEffects.join(','), 'dust_left,dust_right'));
t('keyframe Right Leg rotasi X pada 0.1667s = 70.2', () => {
  const pose = new Float32Array(model.bones.length * 6);
  move.sample(0.1667, { anim_time: 0.1667 }, pose);
  const i = model.boneNames.indexOf('Right Leg');
  near(pose[i * 6 + 3], 70.2, 0.05);
});
t('interpolasi linear di antara keyframe', () => {
  const pose = new Float32Array(model.bones.length * 6);
  move.sample(0.08335, { anim_time: 0.08335 }, pose);
  const i = model.boneNames.indexOf('Right Leg');
  near(pose[i * 6 + 3], (-9.603 + 70.2) / 2, 0.05);
});

const mkController = () => new AnimationController(makeModel(), { idle, move });
t('joystick netral -> Idle (moveWeight 0)', () => {
  const c = mkController(); c.setLocomotion(0); for (let i = 0; i < 30; i++) c.update(1 / 60);
  eq(c.moveWeight, 0); eq(c.currentAnimation, 'animation.actor.idle');
});
t('joystick digerakkan -> Walk (moveWeight 1) dengan transisi halus', () => {
  const c = mkController(); c.setLocomotion(1); c.update(1 / 60);
  if (!(c.moveWeight > 0 && c.moveWeight < 1)) throw new Error('tidak ada blend: ' + c.moveWeight);
  for (let i = 0; i < 30; i++) c.update(1 / 60);
  eq(c.moveWeight, 1); eq(c.currentAnimation, 'animation.actor.move');
});
t('kecepatan animasi mengikuti input: 0.5 ≈ setengah dari 1.0', () => {
  const run = (amt) => { const c = mkController(); c.setLocomotion(amt); for (let i = 0; i < 300; i++) c.update(1 / 60); return c.moveTime; };
  const half = run(0.5), full = run(1);
  near(half / full, 0.5, 0.03);
});
t('berhenti: waktu Walk tidak maju ketika input 0', () => {
  const c = mkController(); c.setLocomotion(1); for (let i = 0; i < 60; i++) c.update(1 / 60);
  c.setLocomotion(0); for (let i = 0; i < 120; i++) c.update(1 / 60);
  const t0 = c.moveTime; for (let i = 0; i < 60; i++) c.update(1 / 60);
  eq(c.moveTime, t0);
});

console.log('Movement');
t('input 1.0 = kecepatan penuh, 0.5 = setengah', () => {
  const a = new MovementController(), b = new MovementController();
  a.update(1, 1, 0); b.update(1, 0.5, 0);
  near(b.x / a.x, 0.5, 1e-6);
});
t('diagonal tidak lebih cepat (panjang input 1)', () => {
  const m = new MovementController(); const s = Math.SQRT1_2;
  m.update(1, s, s); near(Math.hypot(m.x, m.z), m.maxSpeed, 1e-6);
});
t('independen dari FPS (deltaTime)', () => {
  const a = new MovementController(), b = new MovementController();
  a.update(1, 0, 1); for (let i = 0; i < 60; i++) b.update(1 / 60, 0, 1);
  near(a.z, b.z, 1e-6);
});
t('atas = maju = -Z; kanan = +X; bawah = +Z; kiri = -X', () => {
  const run = (ix, iy) => { const m = new MovementController(); m.update(0.5, ix, iy); return m; };
  if (!(run(0, 1).z < 0)) throw new Error('atas'); if (!(run(0, -1).z > 0)) throw new Error('bawah');
  if (!(run(1, 0).x > 0)) throw new Error('kanan'); if (!(run(-1, 0).x < 0)) throw new Error('kiri');
});
t('menghadap arah gerakan (yaw akhir): atas=0, kanan=-π/2, bawah=±π, kiri=π/2', () => {
  const face = (ix, iy) => { const m = new MovementController(); for (let i = 0; i < 60; i++) m.update(1 / 60, ix, iy); return m.yaw; };
  near(face(0, 1), 0, 1e-3); near(face(1, 0), -Math.PI / 2, 1e-3); near(Math.abs(face(0, -1)), Math.PI, 1e-3); near(face(-1, 0), Math.PI / 2, 1e-3);
});
t('arah hadap sesuai vektor depan (-sinθ, -cosθ) = arah gerak', () => {
  const m = new MovementController(); for (let i = 0; i < 90; i++) m.update(1 / 60, 0.6, 0.8);
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw);
  near(fx, 0.6, 1e-2); near(fz, -0.8, 1e-2);
});
t('dibatasi dinding arena', () => {
  const m = new MovementController({ bounds: { minX: -1, maxX: 1, minZ: -1, maxZ: 1 } });
  for (let i = 0; i < 300; i++) m.update(1 / 60, 1, 1);
  eq(m.x, 1); eq(m.z, -1);
});

console.log('Core');
t('Timer: start/pause/resume/stop/reset', () => {
  const tm = new Timer(); tm.start(); tm.update(1); tm.pause(); tm.update(5); near(tm.elapsed, 1);
  tm.resume(); tm.update(1); near(tm.elapsed, 2); tm.stop(); tm.update(1); near(tm.elapsed, 2); tm.reset(); eq(tm.elapsed, 0);
});
t('AssetManager: reference count & dispose saat 0', () => {
  const am = new AssetManager(); let disposed = 0;
  const f = () => ({}); const d = () => disposed++;
  const a = am.acquire('k', f, d), b = am.acquire('k', f, d);
  eq(a, b, 'objek dibagi'); am.release('k'); eq(disposed, 0); am.release('k'); eq(disposed, 1); eq(am.stats().shared, 0);
});
t('Kamera: seluruh arena terlihat pada aspect 16:9, 19.5:9, 4:3', () => {
  // Proyeksi manual sudut arena (kamera di (0,d cosT, d sinT) menatap origin).
  const size = 16, half = size / 2, f = 1 / Math.tan((CAMERA_FOV * Math.PI / 180) / 2);
  for (const aspect of [16 / 9, 19.5 / 9, 4 / 3, 1]) {
    const d = computeCameraDistance(size, aspect);
    const cam = [0, d * Math.cos(CAMERA_TILT), d * Math.sin(CAMERA_TILT)];
    const fwd = cam.map((v) => -v / d); // arah pandang
    const right = [1, 0, 0];
    // up = right x fwd
    const u = [right[1] * fwd[2] - right[2] * fwd[1], right[2] * fwd[0] - right[0] * fwd[2], right[0] * fwd[1] - right[1] * fwd[0]];
    for (const [x, z] of [[-half, -half], [half, -half], [-half, half], [half, half]]) {
      const p = [x - cam[0], 0 - cam[1], z - cam[2]];
      const depth = p[0] * fwd[0] + p[1] * fwd[1] + p[2] * fwd[2];
      const sx = (p[0] * right[0]) / depth * f / aspect;
      const sy = (p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) / depth * f;
      if (Math.abs(sx) > 1 || Math.abs(sy) > 1) throw new Error(`aspect ${aspect}: sudut (${x},${z}) di luar layar (${sx.toFixed(2)},${sy.toFixed(2)})`);
    }
  }
});

console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);

// Uji end-to-end di Chromium (Playwright). Three.js diganti stub (tests/three-stub.mjs)
// karena CDN tidak terjangkau dari sandbox -> WebGL/rendering TIDAK diuji di sini.
// Jalankan: node tests/e2e.cjs [folder-screenshot]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const shotDir = process.argv[2] || null;
if (shotDir) fs.mkdirSync(shotDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, url === '/' ? 'index.html' : url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ok   ', name); } else { fail++; console.log('  FAIL ', name, extra); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

  const stub = fs.readFileSync(path.join(__dirname, 'three-stub.mjs'), 'utf8');
  await page.route('**/three.module.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: stub }));

  const shot = async (name) => { if (shotDir) await page.screenshot({ path: path.join(shotDir, name + '.png') }); };
  const visible = (id) => page.evaluate((i) => !document.getElementById(i).hidden, id);
  const dbg = () => page.evaluate(() => window.__MG__.engine.debugInfo());
  const stats = () => page.evaluate(() => ({ ...globalThis.__3 }));

  await page.goto(base);
  await page.waitForFunction(() => window.__MG__?.engine?.assetReport, null, { timeout: 8000 });

  console.log('Aset');
  const report = await page.evaluate(() => window.__MG__.engine.assetReport);
  check('model dimuat: 7 bone, 6 mesh', report.bones.length === 7 && report.meshes === 6, JSON.stringify(report));
  check('clip idle & move ditemukan dengan nama asli', report.animations.idle === 'animation.actor.idle' && report.animations.move === 'animation.actor.move');

  console.log('Opening & Fullscreen');
  check('Opening tampil', await visible('screen-opening'));
  await shot('01-opening');
  await page.tap('#btn-fullscreen');
  await page.waitForFunction(() => !document.getElementById('screen-main-menu').hidden);
  check('tombol fullscreen -> Main Menu (lanjut walau fullscreen gagal/berhasil)', await visible('screen-main-menu'));
  await shot('02-main-menu');

  console.log('Main Menu');
  const menuBtns = await page.$$eval('#screen-main-menu .btn', (b) => b.map((x) => x.textContent));
  check('hanya dua tombol: Match Mode & Free Play', menuBtns.join('|') === 'Match Mode|Free Play', menuBtns.join('|'));
  await page.tap('#btn-match');
  check('Match Mode dapat dipilih', await visible('screen-match'));
  await page.tap('#btn-match-back');
  check('kembali dari Match Mode', await visible('screen-main-menu'));
  await page.tap('#btn-freeplay');

  console.log('Menu Minigames');
  check('layar Minigames tampil', await visible('screen-minigames'));
  const slots = await page.$$eval('.slot', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { n: e.dataset.slot, top: Math.round(r.top), left: Math.round(r.left), disabled: e.disabled }; }));
  const firstRowTop = slots[0].top;
  check('4 slot dalam satu baris', slots.filter((s) => s.top === firstRowTop).length === 4);
  check('slot tersusun ke bawah (>= 3 baris)', new Set(slots.map((s) => s.top)).size >= 3);
  check('hanya slot 1 yang aktif', slots.filter((s) => !s.disabled).map((s) => s.n).join() === '1');
  check('tidak ada top navigation bar (hanya 1 tombol Kembali)', await page.$$eval('#screen-minigames button:not(.slot)', (b) => b.length) === 1);
  const sc = await page.evaluate(() => { const s = document.getElementById('slot-scroll'); return { sh: s.scrollHeight, ch: s.clientHeight }; });
  check('area dapat di-scroll vertikal', sc.sh > sc.ch, JSON.stringify(sc));
  await page.evaluate(() => { document.getElementById('slot-scroll').scrollTop = 9999; });
  const st = await page.evaluate(() => document.getElementById('slot-scroll').scrollTop);
  check('scrollTop berubah', st > 0, String(st));
  await shot('03-minigames-scrolled');
  await page.evaluate(() => { document.getElementById('slot-scroll').scrollTop = 0; });
  await shot('03-minigames');
  await page.tap('#btn-minigames-back');
  check('tombol Kembali -> Main Menu', await visible('screen-main-menu'));
  await page.tap('#btn-freeplay');
  await page.tap('.slot[data-slot="1"]');

  console.log('Player Selection');
  check('layar Player Selection tampil', await visible('screen-players'));
  const pb = await page.$$eval('.player-btn', (b) => b.map((x) => ({ t: x.querySelector('span').textContent, d: x.disabled })));
  check('P1..P4 tampil', pb.map((x) => x.t).join() === 'P1,P2,P3,P4');
  check('hanya P4 aktif', pb.filter((x) => !x.d).map((x) => x.t).join() === 'P4');
  await shot('04-players');
  await page.tap('#btn-players-back');
  check('Kembali -> Minigames', await visible('screen-minigames'));
  await page.tap('.slot[data-slot="1"]');

  console.log('Dummy Minigame');
  await page.tap('.player-btn[data-count="4"]');
  await page.waitForFunction(() => window.__MG__.engine.state === 'running');
  let d = await dbg();
  check('game berjalan: 4 pemain, 4 joystick', d.state === 'running' && d.players === 4 && d.controls === 4, JSON.stringify(d));
  check('canvas tampil', await page.evaluate(() => !document.getElementById('game-canvas').hidden));
  check('Pause di tengah bawah layar', await page.evaluate(() => { const r = document.getElementById('btn-pause').getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - innerWidth / 2) < 2 && r.bottom > innerHeight - 90; }));
  check('4 joystick di 4 sudut', await page.evaluate(() => {
    const pos = [...document.querySelectorAll('.vjoy')].map((e) => { const r = e.getBoundingClientRect(); return `${r.left + r.width / 2 < innerWidth / 2 ? 'L' : 'R'}${r.top + r.height / 2 < innerHeight / 2 ? 'T' : 'B'}`; });
    return new Set(pos).size === 4;
  }));
  check('joystick memiliki warna berbeda', await page.evaluate(() => new Set([...document.querySelectorAll('.vjoy')].map((e) => e.style.getPropertyValue('--pc'))).size === 4));
  await shot('05-game');

  const cdp = await context.newCDPSession(page);
  const center = (pid) => page.evaluate((p) => { const r = document.querySelector(`.vjoy[data-player="${p}"] .vjoy__outer`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; }, pid);
  const axes = () => page.evaluate(() => Object.fromEntries(['P1', 'P2', 'P3', 'P4'].map((id) => { const a = window.__MG__.engine.inputManager.getAxes(id); return [id, { x: +a.x.toFixed(3), y: +a.y.toFixed(3), m: +a.magnitude.toFixed(3) }]; })));
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const playerState = () => page.evaluate(() => Object.fromEntries([...window.__MG__.engine.playerManager.players].map((p) => [p.id, { x: p.movement.x, z: p.movement.z, yaw: p.movement.yaw, anim: p.animator.currentAnimation, moveTime: p.animator.moveTime }])));

  const c1 = await center('P1'), c2 = await center('P2');
  const s0 = await playerState();

  // P1: penuh ke kanan (jauh melewati tepi); P2: setengah ke atas
  const p1 = { x: c1.x + c1.r * 3, y: c1.y, id: 1 };
  const maxDist = c1.r * 0.58; // outer r - inner r (inner = 0.42 * diameter -> 0.42 r*... lihat pengecekan geometri di bawah)
  const p2 = { x: c2.x, y: c2.y - c2.r * 0.58 * 0.5 - 0, id: 2 };
  await touch('touchStart', [{ x: c1.x + 2, y: c1.y, id: 1 }, { x: c2.x, y: c2.y, id: 2 }]);
  await touch('touchMove', [p1, p2]);
  await sleep(100);
  const a = await axes();
  check('multi-touch: P1 penuh ke kanan (x=1,y=0)', a.P1.m === 1 && a.P1.x > 0.99 && Math.abs(a.P1.y) < 0.02, JSON.stringify(a.P1));
  check('multi-touch: P2 terpisah dari P1 (arah atas, magnitude ~0.5)', a.P2.y > 0.3 && a.P2.y < 0.7 && Math.abs(a.P2.x) < 0.02, JSON.stringify(a.P2));
  check('P3 & P4 tetap netral', a.P3.m === 0 && a.P4.m === 0);
  const geom = await page.evaluate(() => { const j = document.querySelector('.vjoy[data-player="P1"]'); const o = j.querySelector('.vjoy__outer').getBoundingClientRect(); const i = j.querySelector('.vjoy__inner').getBoundingClientRect(); return { dist: Math.hypot((i.left + i.width / 2) - (o.left + o.width / 2), (i.top + i.height / 2) - (o.top + o.height / 2)), or: o.width / 2, ir: i.width / 2 }; });
  check('inner tidak keluar dari outer (jarak <= R_outer - R_inner)', geom.dist <= geom.or - geom.ir + 0.6 && geom.dist > geom.or - geom.ir - 2, JSON.stringify(geom));
  await shot('06-multitouch');

  await sleep(600);
  const s1 = await playerState();
  const dx1 = s1.P1.x - s0.P1.x, dz2 = s1.P2.z - s0.P2.z;
  check('P1 bergerak ke kanan (+X)', dx1 > 1, `dx=${dx1}`);
  check('P2 bergerak maju/atas (-Z)', dz2 < -0.3, `dz=${dz2}`);
  check('P3 & P4 diam', s1.P3.x === s0.P3.x && s1.P3.z === s0.P3.z && s1.P4.x === s0.P4.x);
  check('P1 menghadap kanan (yaw ≈ -π/2), P2 menghadap atas (yaw ≈ 0)', Math.abs(s1.P1.yaw + Math.PI / 2) < 0.05 && Math.abs(s1.P2.yaw) < 0.05, `${s1.P1.yaw} ${s1.P2.yaw}`);
  check('animasi Walk untuk yang bergerak, Idle untuk yang diam', s1.P1.anim === 'animation.actor.move' && s1.P2.anim === 'animation.actor.move' && s1.P3.anim === 'animation.actor.idle');
  // Rasio kecepatan: ukur dalam jendela waktu yang sama
  const t0 = await playerState(); await sleep(500); const t1 = await playerState();
  const v1 = Math.hypot(t1.P1.x - t0.P1.x, t1.P1.z - t0.P1.z), v2 = Math.hypot(t1.P2.x - t0.P2.x, t1.P2.z - t0.P2.z);
  check('kecepatan mengikuti magnitude (P2/P1 ≈ magnitude P2)', Math.abs(v2 / v1 - a.P2.m) < 0.08, `v1=${v1.toFixed(3)} v2=${v2.toFixed(3)} m=${a.P2.m}`);
  const mt = [t1.P1.moveTime - t0.P1.moveTime, t1.P2.moveTime - t0.P2.moveTime];
  check('kecepatan animasi mengikuti magnitude (rasio ≈ magnitude P2)', Math.abs(mt[1] / mt[0] - a.P2.m) < 0.1, JSON.stringify(mt));

  // Lepas hanya P1; P2 harus tetap aktif
  await touch('touchEnd', [{ x: p1.x, y: p1.y, id: 1 }]); // CDP: touchEnd melepas titik yang disebutkan
  await sleep(100);
  const a2 = await axes();
  check('melepas P1 tidak mengganggu P2', a2.P1.m === 0 && a2.P2.m > 0.3, JSON.stringify(a2));
  await touch('touchEnd', []);
  await sleep(100);
  const a3 = await axes();
  check('semua joystick kembali netral setelah dilepas', Object.values(a3).every((v) => v.m === 0 && v.x === 0 && v.y === 0));
  check('inner kembali ke tengah', await page.evaluate(() => [...document.querySelectorAll('.vjoy__inner')].every((e) => (e.style.transform === 'translate(-50%, -50%)' || e.style.transform === ''))));
  await sleep(300);
  const idleAgain = await playerState();
  check('kembali ke Idle setelah joystick netral', idleAgain.P1.anim === 'animation.actor.idle');

  // Dua pointer pada satu joystick: pointer kedua tidak boleh menggeser pointer pertama
  await touch('touchStart', [{ x: c1.x + c1.r * 0.5, y: c1.y, id: 1 }]);
  await touch('touchStart', [{ x: c1.x + c1.r * 0.5, y: c1.y, id: 1 }, { x: c1.x - c1.r * 0.5, y: c1.y + 30, id: 2 }]);
  await sleep(80);
  const a4 = await axes();
  check('satu joystick hanya dikendalikan satu pointer (sentuhan ke-2 diabaikan)', a4.P1.x > 0, JSON.stringify(a4.P1));
  await touch('touchEnd', []);

  console.log('Pause');
  // Gerakkan P1 lalu pause saat bergerak
  await touch('touchStart', [{ x: c1.x + 5, y: c1.y, id: 1 }]);
  await touch('touchMove', [{ x: c1.x + c1.r, y: c1.y, id: 1 }]);
  await sleep(150);
  await page.tap('#btn-pause');
  check('tombol Pause menampilkan menu 3 tombol', await page.evaluate(() => !document.getElementById('pause-overlay').hidden && document.querySelectorAll('#pause-overlay .btn').length === 3));
  check('label tombol: Lanjut, Ulang, Keluar', (await page.$$eval('#pause-overlay .btn', (b) => b.map((x) => x.textContent))).join() === 'Lanjut,Ulang,Keluar');
  await shot('07-pause');
  d = await dbg();
  check('engine state = paused', d.state === 'paused');
  const pa = await playerState();
  const timerA = await page.evaluate(() => window.__MG__.engine.game.timer.elapsed);
  const rendersA = (await stats()).renders;
  await sleep(700);
  const pb2 = await playerState();
  const timerB = await page.evaluate(() => window.__MG__.engine.game.timer.elapsed);
  check('pause: movement berhenti', pa.P1.x === pb2.P1.x && pa.P1.z === pb2.P1.z);
  check('pause: animasi berhenti (moveTime tetap)', pa.P1.moveTime === pb2.P1.moveTime);
  check('pause: timer berhenti', timerA === timerB, `${timerA} ${timerB}`);
  check('pause: input dinonaktifkan (joystick netral)', Object.values(await axes()).every((v) => v.m === 0));
  check('pause: tampilan tetap dirender', (await stats()).renders > rendersA);
  await touch('touchEnd', []);

  await page.tap('#btn-resume');
  check('Lanjut: menu tertutup & game running', await page.evaluate(() => document.getElementById('pause-overlay').hidden && window.__MG__.engine.state === 'running'));
  await touch('touchStart', [{ x: c1.x + 5, y: c1.y, id: 1 }]);
  await touch('touchMove', [{ x: c1.x + c1.r, y: c1.y, id: 1 }]);
  await sleep(300);
  const pc = await playerState();
  check('Lanjut: gameplay berlanjut (pemain bergerak lagi)', pc.P1.x > pb2.P1.x + 0.3, `${pb2.P1.x} -> ${pc.P1.x}`);
  await touch('touchEnd', []);
  await sleep(100);

  const timerBeforeRestart = await page.evaluate(() => window.__MG__.engine.game.timer.elapsed);
  await page.tap('#btn-pause');
  await page.tap('#btn-restart');
  await page.waitForFunction(() => window.__MG__.engine.state === 'running');
  const pr = await playerState();
  const timerAfter = await page.evaluate(() => window.__MG__.engine.game.timer.elapsed);
  d = await dbg();
  check('Ulang: pemain kembali ke titik awal', Math.abs(pr.P1.x - (-4)) < 0.01 && Math.abs(pr.P1.z - 4) < 0.01, JSON.stringify(pr.P1));
  check('Ulang: timer mulai dari awal', timerAfter < timerBeforeRestart, `${timerBeforeRestart} -> ${timerAfter}`);
  check('Ulang: tidak ada duplikasi (4 pemain, 4 kontrol, 4 joystick di DOM)', d.players === 4 && d.controls === 4 && (await page.$$('.vjoy')).length === 4, JSON.stringify(d));
  check('Ulang: menu pause tertutup', await page.evaluate(() => document.getElementById('pause-overlay').hidden));

  console.log('Exit & Cleanup');
  await page.tap('#btn-pause');
  await page.tap('#btn-exit');
  await page.waitForFunction(() => !document.getElementById('screen-players').hidden);
  d = await dbg();
  check('Keluar: kembali ke Player Selection', await visible('screen-players'));
  check('Keluar: engine idle, 0 pemain, 0 kontrol, loop berhenti', d.state === 'idle' && !d.hasGame && d.players === 0 && d.controls === 0 && !d.rafActive, JSON.stringify(d));
  check('Keluar: joystick DOM dihapus', (await page.$$('.vjoy')).length === 0);
  check('Keluar: canvas disembunyikan', await page.evaluate(() => document.getElementById('game-canvas').hidden));
  const s = await stats();
  check('geometri dibuang seluruhnya', s.geometriesCreated === s.geometriesDisposed, JSON.stringify(s));
  check('material dibuang seluruhnya', s.materialsCreated === s.materialsDisposed, JSON.stringify(s));
  check('asset manager tidak menyisakan resource bersama', d.assets.shared === 0, JSON.stringify(d.assets));
  check('renderer tetap satu (shared)', s.rendererCreated === 1, String(s.rendererCreated));

  // Masuk lagi: lifecycle ulang berfungsi
  await page.tap('.player-btn[data-count="4"]');
  await page.waitForFunction(() => window.__MG__.engine.state === 'running');
  d = await dbg();
  check('masuk ulang setelah keluar berfungsi', d.players === 4 && d.controls === 4);
  const s2 = await stats();
  check('renderer tidak dibuat ulang', s2.rendererCreated === 1);

  // Auto-pause saat portrait
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  check('rotate ke portrait: auto pause + petunjuk rotasi tampil', (await dbg()).state === 'paused' && await page.evaluate(() => getComputedStyle(document.getElementById('rotate-hint')).display !== 'none'));
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2, mobile: true });
  await sleep(200);
  await page.tap('#btn-resume');
  check('kembali ke landscape dan lanjut', (await dbg()).state === 'running');

  check('tidak ada error JavaScript / console.error', errors.length === 0, errors.join(' | '));

  await browser.close();
  server.close();
  console.log(`\n${pass} lulus, ${fail} gagal`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

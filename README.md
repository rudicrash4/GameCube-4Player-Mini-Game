# Mini-game Collection — Prototype UI

HTML5 · Three.js · JavaScript ES Modules · landscape mobile. Mengikuti `GDD.md` dan `TDD.md`.

## Menjalankan

ES Modules tidak dapat dibuka lewat `file://`; jalankan server statis:

```bash
cd minigame-collection
python3 -m http.server 8080        # atau: npx serve .
```

Buka `http://localhost:8080` (di HP: `http://<IP-komputer>:8080`, satu jaringan Wi-Fi).

Three.js dimuat dari CDN lewat import map di `index.html` (three@0.160.0).
Untuk offline, simpan `three.module.js` ke `vendor/` lalu ubah alamat di import map menjadi `./vendor/three.module.js`.

## Struktur

```
index.html            satu HTML utama: canvas, semua layar, kontrol, overlay
css/                  base (token, tombol), screens (menu), hud (joystick, pause)
assets/character/     aset global: model_player.json, animation_idle.json, animation_move.json
src/
  main.js             bootstrap
  app.js              alur navigasi (UI <-> Engine)
  config.js           warna pemain, path aset, konstanta karakter
  core/               CORE ENGINE + SHARED COMPONENTS (tanpa kode khusus mini-game)
    engine.js           shared renderer, game loop, lifecycle mini-game
    asset-manager.js    cache JSON + resource ber-reference-count
    game-manager.js  score-manager.js  health-system.js  timer.js  audio-manager.js
    input/              input-manager, virtual-joystick, virtual-button, control-manager
    player/             player-system, bedrock-model, animation-manager, molang, movement-controller
  ui/                 UI SYSTEM: screen-manager, fullscreen, satu file per layar
  minigames/
    registry.js         daftar slot (prototype: hanya slot 1)
    dummy/              index (lifecycle), scene, camera, arena
tests/                unit.mjs, e2e.cjs, three-stub.mjs
```

Lifecycle mini-game (`init → start → update → render → pause/resume → getResults → destroy`) dipanggil oleh `core/engine.js`.
Tambahan di luar kontrak TDD: metode opsional `resize(width, height)`.

## Aset karakter

- Format: geometry Minecraft Bedrock (`geometry.unknown`, 64×64) + 2 file animasi Bedrock (Molang + keyframe). Bukan glTF; tidak ada skeleton skinned.
- Struktur: 7 bone (Waist, Head, Body, Right Arm, Left Arm, Right Leg, Left Leg), 12 cube (6 dasar + 6 layer overlay berinflate).
- Clip: `animation.actor.idle`, `animation.actor.move`.
- Tidak ada texture/material di aset → material warna solid per bagian: kepala kulit (sisi depan lebih gelap), badan+lengan warna pemain, kaki abu gelap.

## Menguji

```bash
node tests/unit.mjs      # logika murni (Molang, model, animasi, movement, kamera, timer)
node tests/e2e.cjs [dir] # navigasi + multi-touch + pause + cleanup di Chromium (Playwright)
```

Kedua tes memakai stub Three.js (`tests/three-stub.mjs`), sehingga **rendering WebGL tidak ikut diuji**.

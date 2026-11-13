# 4 Player Party Arena

Fondasi game party lokal untuk maksimal 4 pemain pada satu perangkat.

## Menjalankan
Jalankan folder ini melalui HTTP server lokal (jangan membuka `index.html` dengan `file://`), lalu buka alamat server dari browser.

Contoh jika tersedia Node.js:
```bash
npx http-server . -p 8080
```
Buka `http://localhost:8080`.

## Struktur
- `index.html`, `style.css`, `main.js`: menu utama dan shell aplikasi.
- `core/control-manager.js`: empat joystick virtual milik Core.
- `core/game-manager.js`: memuat mini-game melalui iframe dan komunikasi.
- `core/player-manager.js`, `core/input-manager.js`: format input/pemain bersama.
- `minigames/template/`: template mini-game Three.js.
- `global-assets/`: aset bersama untuk pengembangan berikutnya.

## Kontrol
Core membuat empat joystick transparan di empat sudut. Setiap joystick memakai pointer tersendiri, sehingga empat pemain dapat menyentuh layar bersamaan. Knob dibatasi secara matematis agar tidak melewati lingkaran dasar. Ukuran joystick menggunakan `clamp()` agar mengikuti ukuran layar.

Mini-game menerima pesan `CORE_INPUT` dan `CORE_START` dari parent. Template saat ini menggunakan empat cube berwarna yang bergerak di arena.

## Orientasi
Pada perangkat portrait, seluruh stage diputar 90 derajat untuk tampilan landscape. Pada perangkat landscape, stage menggunakan orientasi normal. Perangkat/browser tetap harus mengizinkan interaksi layar sentuh.

## Arena template
Papan berukuran 10 kolom × 6 baris (10 × 6 unit), pola ubin abu-abu dan putih, dengan empat cube pemain.

## Three.js
Template mengimpor Three.js r170 dari jsDelivr melalui import map. Karena memakai CDN, koneksi internet dibutuhkan saat memuat library kecuali file Three.js disimpan lokal dan import map diarahkan ke file lokal.

## Catatan
Ini adalah template awal untuk pengembangan, belum merupakan game final. Uji rotasi, multitouch, performa, dan ukuran pada perangkat target sebelum dipakai sebagai fondasi produksi.

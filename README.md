# GameCube 4Player Mini Game (v0.0.3)

Template platform mini game web HTML5 terinspirasi konsol GameCube dengan orientasi utama portrait, pemilihan pemain minimalis, dan arena gameplay 3D bertenaga **Three.js** dengan sudut kamera top-down 90° tegak lurus, pencahayaan multi-arah, serta 4 kontrol joystick virtual SVG multi-touch di 4 sudut layar.

---

## 1. Pembaruan Kamera 90° & Pencahayaan Arena 3D

Pada revisi terbaru versi **0.0.3**:

1. **Sudut Kamera 90° Tegak Lurus ke Bawah (Top-Down Bird's-Eye View)**:
   - Posisi kamera berada tepat di titik tengah horizontal `(0, Y, 0)` dan mengarah 90 derajat tegak lurus ke bawah menuju pusat arena `(0, 0, 0)`.
   - Vektor *up* kamera disetel ke `(0, 0, -1)`, sehingga arah visual layar selaras sempurna:
     - **Atas**: -Z (Arah P3 & P4)
     - **Bawah**: +Z (Arah P1 & P2)
     - **Kiri**: -X (Arah P1 & P3)
     - **Kanan**: +X (Arah P2 & P4)
   - **Perhitungan Jarak Kamera Dinamis**: Ketinggian kamera `Y` dihitung secara matematis berdasarkan rasio aspek layar (`landscapeStage`) untuk menjamin **seluruh 16 × 16 block cube (256 kubus)** dan batas arena masuk 100% ke dalam frame kamera tanpa terpotong di layar smartphone maupun desktop.

2. **Peningkatan Sistem Pencahayaan (Multi-Directional Lighting)**:
   - Menambahkan **Key Directional Light** berkekuatan tinggi (intensity 2.0) dari sudut kanan-bawah `(18, 30, 18)` untuk menghasilkan bayangan dan kontras tepi 3D yang tajam.
   - Menambahkan **Fill Directional Light** (intensity 1.2) dari sudut berlawanan `(-18, 26, -18)` untuk menerangi sisi berlawanan kubus.
   - Menambahkan **Accent Directional Light** (intensity 0.9) untuk memperjelas sudut kubus.
   - Menambahkan **Hemisphere Light** (intensity 1.3) yang mensimulasikan pantulan cahaya langit dan air biru.
   - Menambahkan **Point Light** sentral di atas arena untuk gradasi pencahayaan yang dramatis.
   - Blok arena menggunakan material berpola dua nada solid (*two-tone solid slate*) sehingga setiap celah dan balok terlihat jelas dari sudut pandang 90°.

3. **Kesiapan Hosting GitHub Pages**:
   - Disediakan file workflow otomatis **`.github/workflows/deploy.yml`** untuk deployment otomatis ke GitHub Pages.
   - Dilengkapi file **`.nojekyll`** dan panduan lengkap **`DEPLOY_GITHUB.md`**.
   - Konfigurasi `vite.config.ts` menggunakan base path relatif (`base: './'`) serta tautan relatif di seluruh halaman HTML dan JavaScript, sehingga web dapat di-hosting di sub-path repository GitHub mana pun tanpa error 404.

---

## 2. Alur Navigasi & Orientasi Website

- **Halaman Awal (`/index.html` - Layar 1)**:
  - Mode portrait vertikal. Tombol tengah `"PERMAINAN"` dan tombol fullscreen.
- **Menu Game (`/index.html` - Layar 2)**:
  - Ditampilkan dalam orientasi landscape terpusat (rotasi 90° presisi `100vh × 100vw`) dengan **sistem scroll horizontal** yang lancar.
  - Setiap tampilan layar memuat **tepat 3 slot game** secara proporsional (`aspect-ratio: 16/10`).
  - Mengklik slot **`GAME 1`** membuka layar pemilihan pemain langsung di root `index.html`.
- **Pemilihan Pemain (`/index.html` - Layar 3)**:
  - Mode portrait minimalis kotak sederhana warna solid.
  - Pilihan **1P, 2P, 3P** berstatus *"Belum Tersedia"* (`disabled`).
  - Pilihan **4P** aktif (*"Mulai"*), mengklik 4P langsung meluncurkan `./games/game_1/index.html`.
  - Dilengkapi tombol kembali ke daftar game.
- **Game 1 (`/games/game_1/index.html`)**:
  - Langsung menjalankan arena 3D Three.js 4-Player fullscreen (`100vw × 100vh`) dalam orientasi portrait.
  - **Tombol Pause SVG di Sisi Kanan Layar**: Menggantikan header bar atas sebelumnya, diletakkan ergonomis di sisi kanan tengah layar.
  - **Modal Pause Landscape 90°**: Saat ditekan, pergerakan game dihentikan (*paused*) dan muncul modal dengan rotasi 90° selaras landscape berisi 3 tombol SVG murni:
    1. **Lanjutkan**: Melanjutkan permainan kembali tanpa gangguan.
    2. **Ulangi**: Mereset posisi seluruh pemain ke sudut awal dan memulai kembali game.
    3. **Keluar**: Kembali ke menu awal root `../../index.html`.

---

## 3. UI Player Selection (Game 1)

Menu pemilihan pemain dirancang dengan prinsip estetika minimalis fungsional:
- Bentuk tombol kotak simetris dengan warna solid latar belakang `#242136` dan border solid tipis `#2e2a42`.
- **1P, 2P, 3P**: Diberi label *"Belum Tersedia"* dan status `disabled`.
- **4P**: Tombol aktif dengan aksen warna ungu solid (`#5b3fa3`) untuk langsung meluncurkan arena 3D.

---

## 4. Virtual Joystick SVG (4 Sudut Area Gameplay - Ukuran Optimal Smartphone)

Setiap joystick digambar menggunakan SVG inline murni yang ditempatkan tepat di 4 sudut area gameplay:

| Pemain | Posisi Sudut | Warna Solid | Hex Code | Elemen SVG |
|---|---|---|---|---|
| **P1** | Kiri - Bawah | Merah | `#ef4444` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |
| **P2** | Kanan - Bawah | Biru | `#3b82f6` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |
| **P3** | Kiri - Atas | Hijau | `#22c55e` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |
| **P4** | Kanan - Atas | Kuning | `#eab308` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |

- **Transparansi Ringan**: Area luar menggunakan `fill-opacity="0.25"` dan knob menggunakan `fill-opacity="0.85"`.
- **Ukuran Diperbesar untuk Smartphone**: Dihitung menggunakan CSS `clamp(110px, 28vw, 155px)`, memberikan ruang sentuh ibu jari yang luas, nyaman, dan responsif tanpa menghalangi pandangan arena.

---

## 5. Implementasi Three.js 3D (Game 1)

Rendering 3D dibangun menggunakan pustaka resmi **Three.js**:

### A. Arena 3D 10 × 16 Block Cube (Balok Putih)
- Terdiri dari **160 kubus** (`10 × 16`, 10 kolom sumbu X × 16 baris sumbu Z) yang dibangun menggunakan `THREE.InstancedMesh` berwarna putih solid (`0xffffff`).
- Proporsi 10 × 16 dirancang khusus agar mengisi layar smartphone portrait secara alami tanpa distorsi.
- Jarak/celah antar balok diperkecil: ukuran balok `0.96 × 0.55 × 0.96` dengan jarak pusat `1.0` (celah hanya `0.04`), menghasilkan tampilan grid lantai putih yang rapat dan rapi.

### B. Sudut Pandang Kamera & POV 0.9 Radian
- Kamera Three.js `PerspectiveCamera` dengan nilai POV **0.9 radian** (`(0.9 * 180) / Math.PI ≈ 51.566°`) dan faktor skala `camera.zoom = 0.9`.
- Mengarah 90° tegak lurus ke bawah (`0, optimalY, 0` menghadap `0, 0, 0`) dengan vektor up `(0, 0, -1)`.
- Ketinggian kamera `optimalY` disetel turun sedikit (~16%) agar seluruh block cube putih terlihat lebih luas, dekat, dan nyaman di pandang mata pada smartphone.

### C. Panel Air Biru Sangat Diperluas
- Panel dasar berwarna biru laut cerah (`#0ea5e9`) di bawah arena diperluas secara signifikan menjadi **85 × 0.6 × 110** pada ketinggian `Y = -0.65`, sehingga seluruh horizon visual di sekeliling arena terisi oleh air biru.

### D. Model Karakter Pemain 3D & Sistem Animasi
- Menggunakan model kustom Bedrock JSON dari folder `/aset/player/model_player.json`.
- Setiap pemain menggunakan model berkarakter sama dengan penyesuaian warna solid khas masing-masing (P1 Merah, P2 Biru, P3 Hijau, P4 Kuning).
- **Ukuran Pas Proporsional**: Skala model 0.04 (tinggi 1.36 unit, lebar 0.64 unit) sehingga pas menapak di atas balok 0.96 tanpa terlihat terlalu kecil maupun terlalu besar.
- **Sistem Animasi Idle & Move**:
  - Animasi Idle (`animation_idle.json`): bernapas halus dengan gerakan kepala, tangan, dan pinggang saat karakter diam.
  - Animasi Move (`animation_move.json`): langkah kaki berayun dinamis, gerakan tangan, dan condong badan saat berjalan.
  - **Transisi Halus**: Blending bobot animasi (crossfade) saat berganti dari diam ke bergerak dan sebaliknya.
  - **Kecepatan Proporsional Joystick**: Jika joystick ditarik penuh, kecepatan animasi 1.0; jika ditarik pelan, animasi diperlambat secara proporsional.
  - **Fisika Velocity Ringan**: Karakter memiliki inersia dan akselerasi halus yang nyaman dikendalikan.
  - **Arah Hadap Otomatis**: Karakter berputar mulus (*smooth slerp*) menghadap ke arah jalannya secara akurat.

---

## 6. Sistem Kontrol & Integrasi Multi-Touch

- **Multi-Touch Tracking**: `activeTouchMap` melacak masing-masing `touch.identifier` secara independen sehingga 4 pemain dapat menyentuh 4 sudut layar secara serentak.
- **Normalisasi Vektor**: Pergeseran knob dihitung terhadap jari-jari maksimum (`maxRadius = width * 0.36`), menghasilkan vektor input `(inputX, inputY)` bernilai `-1` hingga `+1`.
- **Dukungan Desktop / Keyboard Fallback**:
  - **P1**: `W, A, S, D` atau mouse drag joystick P1.
  - **P2**: Tombol `Panah (Arrow Keys)` atau mouse drag joystick P2.
  - **P3**: `I, J, K, L` atau mouse drag joystick P3.
  - **P4**: `T, F, G, H` atau mouse drag joystick P4.

---

## 7. Struktur Folder & File Terbaru

```text
GameCube-4Player-Mini-Game/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Workflow otomatis GitHub Actions untuk GitHub Pages
├── .nojekyll                 # Mencegah Jekyll mengabaikan folder/file aset Vite
├── DEPLOY_GITHUB.md          # Panduan langkah-demi-langkah hosting ke GitHub Pages
├── aset/
│   └── player/               # Aset model & animasi pemain
│       ├── model_player.json # Geometri karakter 3D Bedrock
│       ├── animation_idle.json # Animasi diam (idle)
│       └── animation_move.json # Animasi berjalan (move)
├── index.html                # Halaman awal & daftar game dalam orientasi portrait
├── style.css                 # Penataan tampilan portrait & responsivitas layar smartphone
├── script.js                 # Navigasi layar root dan peluncuran slot Game 1
├── README.md                 # Dokumentasi arsitektur v0.0.3
├── vite.config.ts            # Konfigurasi bundler multi-page Vite (base: './')
├── package.json              # Dependensi termasuk Three.js dan script build
└── games/
    └── game_1/               # Mini Game 1: 3D Cube Arena
        ├── index.html        # Stage landscape 3D, tombol pause & 4 joystick SVG
        ├── style.css         # Styling 4 joystick besar, pause landscape 90°
        ├── script.js         # Engine 3D Three.js, game loop, pause controller
        └── playerCharacter.js # Parser model Bedrock, kontroler animasi & fisika
```


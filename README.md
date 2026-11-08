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

## 2. Orientasi Website & Layout Responsif

- **Menu Utama & Menu Game (Root)**:
  - Berorientasi vertikal (Portrait).
  - Grid daftar permainan secara responsif menyajikan 2–3 kolom di smartphone portrait dan hingga 5 kolom di monitor desktop.
- **Game 1 (Landscape Stage di Layar Portrait)**:
  - Berada di dalam kontainer `.landscape-stage` dengan rasio aspek lanskap yang mempertahankan proporsi visual optimal.
  - Jika perangkat dirotasi ke orientasi landscape horizontal, area gameplay secara otomatis mengisi layar secara penuh.

---

## 3. UI Player Selection (Game 1)

Menu pemilihan pemain dirancang dengan prinsip estetika minimalis fungsional:
- Bentuk tombol kotak simetris dengan warna solid latar belakang `#242136` dan border solid tipis `#2e2a42`.
- **1P, 2P, 3P**: Diberi label *"Belum Tersedia"* dan status `disabled`.
- **4P**: Tombol aktif dengan aksen warna ungu solid (`#5b3fa3`) untuk langsung meluncurkan arena 3D.

---

## 4. Virtual Joystick SVG (4 Sudut Area Gameplay)

Setiap joystick digambar menggunakan SVG inline murni yang ditempatkan tepat di 4 sudut area gameplay landscape:

| Pemain | Posisi Sudut | Warna Solid | Hex Code | Elemen SVG |
|---|---|---|---|---|
| **P1** | Kiri - Bawah | Merah | `#ef4444` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |
| **P2** | Kanan - Bawah | Biru | `#3b82f6` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |
| **P3** | Kiri - Atas | Hijau | `#22c55e` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |
| **P4** | Kanan - Atas | Kuning | `#eab308` | Lingkaran Luar (`r=46`) & Knob (`r=22`) |

- **Transparansi Ringan**: Area luar menggunakan `fill-opacity="0.2"` dan knob menggunakan `fill-opacity="0.85"`.
- **Ukuran Responsif**: Dihitung menggunakan CSS `clamp(54px, 14vw, 86px)`, mengutamakan kenyamanan sentuhan jari pada berbagai lebar layar smartphone.

---

## 5. Implementasi Three.js 3D (Game 1)

Rendering 3D dibangun menggunakan pustaka resmi **Three.js**:

### A. Arena 3D 16 × 16 Block Cube
- Terdiri dari **256 kubus** (`16 × 16`) yang dibangun menggunakan `THREE.InstancedMesh` untuk performa 60 FPS maksimal dalam 1 draw-call.
- Dimensi per kubus: `0.88 × 0.6 × 0.88` dengan jarak antar titik pusat `1.0`, menyisakan celah solid `0.12` sehingga setiap balok terlihat terpisah dengan jelas.

### B. Panel Air Representatif
- Panel kubus besar berukuran `38 × 0.5 × 38` berwarna biru laut (`#0284c7`) diletakkan di koordinat `Y = -0.65` tepat di bawah seluruh blok arena.

### C. 4 Karakter Pemain 3D
- Dibuat menggunakan `THREE.BoxGeometry(0.9, 0.9, 0.9)`.
- Posisi vertikal berada tepat di atas permukaan balok (`Y = 0.75`).
- Posisi sudut awal:
  - **P1 (Merah)**: `X = -7.0, Z = +7.0` (Kiri-Bawah)
  - **P2 (Biru)**: `X = +7.0, Z = +7.0` (Kanan-Bawah)
  - **P3 (Hijau)**: `X = -7.0, Z = -7.0` (Kiri-Atas)
  - **P4 (Kuning)**: `X = +7.0, Z = -7.0` (Kanan-Atas)
- Dilengkapi sistem pembatas (*boundary clamp*) sehingga keempat kubus tidak dapat keluar dari area arena 16 × 16.

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
│       └── deploy.yml    # Workflow otomatis GitHub Actions untuk GitHub Pages
├── .nojekyll             # Mencegah Jekyll mengabaikan folder/file aset Vite
├── DEPLOY_GITHUB.md      # Panduan langkah-demi-langkah hosting ke GitHub Pages
├── index.html            # Halaman awal & daftar game dalam orientasi portrait
├── style.css             # Penataan tampilan portrait & responsivitas layar smartphone
├── script.js             # Navigasi layar root dan peluncuran slot Game 1
├── README.md             # Dokumentasi arsitektur v0.0.3
├── vite.config.ts        # Konfigurasi bundler multi-page Vite (base: './')
├── package.json          # Dependensi termasuk Three.js dan script build
└── games/
    └── game_1/           # Mini Game 1: 3D Cube Arena
        ├── index.html    # Menu player select minimalis & stage landscape 3D
        ├── style.css     # Styling stage landscape, proporsi 16:10, dan joystick SVG
        └── script.js     # Engine 3D Three.js, kamera 90°, pencahayaan, & joystick SVG
```

# GameCube 4Player Mini Game (v0.0.2)

Template web HTML5 fullscreen untuk platform game mini bergaya konsol GameCube dengan orientasi landscape fleksibel, menu grid modular, serta implementasi arena 4-Player dengan 4 joystick di setiap sudut layar.

---

## 1. Konsep & Fitur Baru Versi 0.0.2

Pada versi **0.0.2**, project diperbarui dengan arsitektur modular multi-game:

- **Orientasi Landscape Fleksibel & Tombol Kontrol**:
  - Tidak ada lagi overlay pemaksa orientasi yang kaku.
  - Ditambahkan **Tombol Rotasi Layar** di menu awal untuk mengunci/memutar tampilan ke landscape.
  - Ditambahkan **Tombol Fullscreen** di menu awal untuk pengalaman layar penuh yang imersif.
- **Struktur Folder Modular `/games`**:
  - Wadah khusus untuk setiap game mini terpisah dari file utama root agar mudah dikembangkan secara independen.
  - Slot pertama pada Menu Game langsung terhubung ke `/games/game_1`.
- **Menu Pilihan Pemain (Player Select)**:
  - Tersedia 4 tombol pilihan mode pemain: `1P`, `2P`, `3P`, dan `4P`.
  - Tombol `1P`, `2P`, dan `3P` disiapkan untuk pengembangan bertahap berikutnya.
  - Tombol `4P` aktif untuk langsung meluncurkan arena 4 pemain.
- **Arena 4-Player dengan 4 Sudut Virtual Joystick**:
  - **4 Virtual Joystick** diletakkan di 4 sudut layar:
    - **Sudut Kiri-Bawah (P1)**: Warna Merah (`#ef4444`)
    - **Sudut Kanan-Bawah (P2)**: Warna Biru (`#3b82f6`)
    - **Sudut Kiri-Atas (P3)**: Warna Hijau (`#22c55e`)
    - **Sudut Kanan-Atas (P4)**: Warna Kuning (`#eab308`)
  - **Ukuran Responsif**: Dimensi joystick otomatis menyesuaikan ukuran layar perangkat (`clamp(75px, 16vw, 130px)`).
  - **Dukungan Multi-Touch Simultan**: Hingga 4 pemain dapat menyentuh dan menggerakkan joystick di sudut masing-masing secara bersamaan tanpa saling mengganggu.
  - **4 Karakter Pemain**: Karakter lingkaran solid dengan warna masing-masing bergerak bebas di arena layar dengan deteksi batas layar (*boundary collision*).
  - **Dukungan Pengujian Desktop (Keyboard & Mouse Drag)**:
    - P1: Tombol `W, A, S, D` atau sentuh/drag joystick P1
    - P2: Tombol `Panah (Arrow Keys)` atau sentuh/drag joystick P2
    - P3: Tombol `I, J, K, L` atau sentuh/drag joystick P3
    - P4: Tombol `T, F, G, H` atau sentuh/drag joystick P4

---

## 2. Struktur Folder & File

```text
GameCube-4Player-Mini-Game/
├── index.html            # Halaman awal (Tombol Rotasi, Fullscreen, PERMAINAN) & Menu Game 5-kolom
├── style.css             # Penataan tampilan root (Solid theme, grid, fullscreen)
├── script.js             # Logika transisi menu, kontrol fullscreen/rotasi, dan navigasi game
├── README.md             # Dokumentasi arsitektur dan panduan project
├── vite.config.ts        # Konfigurasi bundler multi-page
├── package.json          # Manajemen dependensi dan skrip build
└── games/                # Folder kumpulan mini game
    └── game_1/           # Mini Game 1: 4P Arena & 4 Corner Joysticks
        ├── index.html    # Menu pilihan player (1P-4P) dan arena gameplay
        ├── style.css     # Styling 4 joystick sudut bertema warna dan arena
        └── script.js     # Engine gerakan 4 player, multi-touch tracking, dan game loop
```

---

## 3. Alur Penggunaan (User Journey)

1. **Halaman Awal**:
   - Pemain melihat tombol `"PERMAINAN"` di tengah layar dengan opsi tombol **Rotasi** dan **Fullscreen** di sudut atas.
2. **Menu Game**:
   - Menampilkan grid 5 kolom. Kotak pertama berlabel **`GAME 1`**.
3. **Pilihan Pemain (Game 1)**:
   - Mengklik slot `GAME 1` membuka halaman `/games/game_1/index.html`.
   - Tampil menu dengan 4 tombol: `1P`, `2P`, `3P`, dan `4P`.
4. **Arena 4P**:
   - Memilih tombol **`4P`** meluncurkan arena dengan 4 pemain (Merah, Biru, Hijau, Kuning).
   - 4 pemain dapat langsung digerakkan menggunakan 4 joystick di setiap sudut layar atau tombol keyboard yang telah disediakan.

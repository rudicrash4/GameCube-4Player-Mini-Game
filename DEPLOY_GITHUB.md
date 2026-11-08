# Panduan Hosting ke GitHub Pages

Project **GameCube 4Player Mini Game** telah dikonfigurasi secara lengkap agar dapat langsung di-hosting ke **GitHub Pages** secara gratis dan otomatis.

---

## Opsi 1: Otomatis Menggunakan GitHub Actions (Sangat Disarankan)

File workflow `.github/workflows/deploy.yml` telah disertakan di dalam project. Anda hanya perlu melakukan push ke repository GitHub.

### Langkah-langkah:

1. **Buat Repository Baru di GitHub**:
   - Buka [github.com/new](https://github.com/new).
   - Beri nama repository, misalnya: `gamecube-4player-mini-game`.
   - Pilih **Public**.
   - Klik **Create repository**.

2. **Inisialisasi & Push Kode dari Komputer Anda**:
   Buka terminal di folder project, lalu jalankan perintah:
   ```bash
   git init
   git add .
   git commit -m "feat: release GameCube 4Player Mini Game v0.0.3"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/gamecube-4player-mini-game.git
   git push -u origin main
   ```

3. **Aktifkan GitHub Pages**:
   - Di halaman repository GitHub Anda, buka tab **Settings**.
   - Pada menu sebelah kiri, klik **Pages**.
   - Pada bagian **Build and deployment > Source**, pilih:
     👉 **GitHub Actions**
   - Selesai! GitHub Actions akan otomatis mem-build dan mempublikasikan website Anda.
   - URL website Anda akan muncul di halaman tersebut (contoh: `https://USERNAME-ANDA.github.io/gamecube-4player-mini-game/`).

---

## Opsi 2: Build Manual (Static dist)

Jika Anda ingin mengunggah file hasil build secara langsung:

1. Jalankan perintah build:
   ```bash
   npm run build
   ```
2. Seluruh file static siap hosting akan berada di dalam folder `dist/`.
3. Anda dapat mengunggah isi folder `dist/` ke branch `gh-pages` atau hosting static apa pun (Vercel, Netlify, Cloudflare Pages, Firebase Hosting, dll.).

---

## Fitur Kompatibilitas GitHub Pages yang Sudah Diterapkan:

- **Base Path Relatif**: `vite.config.ts` telah dikonfigurasi dengan `base: './'`, sehingga aset dan script dapat dimuat dengan benar baik di domain root maupun di sub-path repository GitHub (`/nama-repo/`).
- **Navigasi Relatif**: Semua tautan antar halaman menggunakan URL relatif (`./games/game_1/index.html` dan `../../index.html`), sehingga tidak akan terjadi error 404 pada GitHub Pages.
- **File `.nojekyll`**: Mencegah GitHub Pages mengabaikan file aset JavaScript/CSS yang dihasilkan oleh Vite.
- **Multi-Page Rollup Input**: `main` (`index.html`) dan `game_1` (`games/game_1/index.html`) ter-bundle secara rapi ke folder `dist/`.

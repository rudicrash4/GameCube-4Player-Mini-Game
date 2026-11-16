# GAME DESIGN DOCUMENT (GDD)

## 1. INFORMASI PROYEK

Nama Proyek:
Mini-game Collection

Genre:
Party Game / Mini-game Collection

Platform:
HTML5 Browser

Target Perangkat:
Mobile

Orientasi:
Landscape

Visual:
3D Low Poly

Mode Multiplayer:
Local Multiplayer

Jumlah Pemain:
Maksimal 4 pemain

Single Player:
Didukung

Bot:
Didukung

Teknologi Visual:
Three.js

Status:
Prototype UI dan perancangan sistem.


## 2. KONSEP GAME

Game ini merupakan sebuah kumpulan mini-game yang berada
dalam satu aplikasi.

Setiap mini-game memiliki gameplay, arena, kamera, dan
sistem khusus masing-masing.

Namun, seluruh mini-game dapat menggunakan komponen
global yang disediakan oleh Core Engine.

Contoh komponen global:
- Model karakter pemain.
- Animasi karakter.
- Virtual Joystick.
- Virtual Buttons.
- Health System.
- Timer.
- Score System.
- Audio Manager.
- Asset Manager.

Mini-game hanya perlu mengimpor komponen yang dibutuhkan.

Jika sebuah mini-game membutuhkan sistem khusus,
sistem tersebut dapat dibuat langsung di dalam folder
mini-game yang bersangkutan.


## 3. MODE PERMAINAN

Terdapat dua mode utama.


### 3.1 MATCH MODE

Pemain memainkan beberapa mini-game secara berurutan.

Setiap mini-game memberikan hasil atau poin kepada pemain.

Setelah seluruh mini-game selesai:
- Skor setiap pemain dihitung.
- Sistem menentukan peringkat.
- Pemain dengan skor tertinggi menjadi pemenang.

Skor bersifat akumulatif selama pertandingan.


### 3.2 FREE PLAY

Pemain bebas memilih mini-game yang ingin dimainkan.

Karakteristik:
- Pemain dapat memilih mini-game secara langsung.
- Tidak harus mengikuti urutan pertandingan.
- Tidak menggunakan skor akumulatif Match Mode.
- Pemain dapat mengulang mini-game.
- Pemain dapat kembali ke menu pemilihan mini-game.


## 4. SISTEM PEMAIN

Game mendukung maksimal empat pemain manusia.

Setiap pemain memiliki:
- Identitas pemain.
- Warna pembeda.
- Karakter 3D.
- Kontrol masing-masing.

Karakter menggunakan model global yang disediakan Core.

Model dasar karakter sama untuk semua pemain.

Perbedaan pemain menggunakan warna atau identitas
yang berbeda.


### 4.1 BOT

Game mendukung bot untuk mengisi slot pemain yang kosong.

Jumlah bot dan pemain manusia dapat dikombinasikan.

Contoh:
- 1 pemain + 3 bot.
- 2 pemain + 2 bot.
- 3 pemain + 1 bot.
- 4 pemain.

Logika bot dapat dibuat khusus untuk setiap mini-game.


## 5. SISTEM KONTROL

Kontrol utama untuk perangkat mobile menggunakan:

- Virtual Joystick.
- Virtual Buttons.

Setiap mini-game dapat menentukan jenis kontrol
yang dibutuhkan.

Contoh:
- Mini-game balapan menggunakan joystick.
- Mini-game pertarungan menggunakan joystick dan tombol.
- Mini-game tertentu hanya menggunakan tombol.

Kontrol pemain manusia ditampilkan di sudut layar.

Setiap pemain memiliki warna kontrol yang berbeda.

Bot tidak memiliki kontrol UI.

Sistem kontrol wajib mendukung Multi-touch agar
beberapa pemain dapat mengendalikan karakter secara
bersamaan.


## 6. ARSITEKTUR MINI-GAME

Game menggunakan konsep:

SHARED CORE + MODULAR MINIGAMES.

Core menyediakan fasilitas global.

Mini-game menggunakan fasilitas tersebut melalui
sistem import.

Sistem yang digunakan bersama ditempatkan di Core.

Sistem yang hanya digunakan oleh satu mini-game
ditempatkan di folder mini-game tersebut.

Contoh:

Core:
- Player System.
- Animation Manager.
- Joystick.
- Health System.
- Timer.
- Score System.

Mini-game:
- Racing System.
- Enemy System.
- Checkpoint System.
- Wave Manager.

Core tidak boleh bergantung pada kode khusus mini-game.


## 7. KONSEP VISUAL

Gaya visual utama:
- 3D Low Poly.
- Bentuk sederhana.
- Warna solid.
- Tampilan bersih.
- Mudah dibaca.
- Cocok untuk layar mobile.

Untuk UI:
- Gunakan warna solid.
- Boleh menggunakan garis luar.
- Gunakan bentuk sederhana.
- Hindari gradasi.
- Hindari terlalu banyak teks.
- Tombol harus mudah disentuh.
- Jangan membuat tampilan terlalu ramai.


# 8. RANCANGAN PROTOTYPE UI

Prototype pertama difokuskan pada tampilan dan navigasi.

Belum perlu membuat gameplay mini-game sungguhan.


## 8.1 PEMBUKAAN WEBSITE

Saat website dibuka:

- Tampilkan halaman pembukaan sederhana.
- Sediakan tombol untuk masuk ke fullscreen.
- Fullscreen diminta setelah pengguna menekan tombol.
- Setelah berhasil atau setelah pengguna melanjutkan,
  tampilkan menu utama.

Tujuan:
Membuat pengalaman bermain yang lebih menyerupai aplikasi.


## 8.2 MAIN MENU

Menu utama hanya memiliki dua tombol.

Posisi:
- Berada di tengah layar.
- Kedua tombol tersusun sederhana.
- Tidak menggunakan banyak elemen tambahan.

Tombol:
1. Match Mode.
2. Free Play.

Untuk prototype, kedua tombol dapat dibuat memiliki
tampilan dan navigasi dasar.


## 8.3 MENU MINIGAMES

Menu ini dibuka ketika pemain memilih Free Play.

Tampilan:
- Tidak menggunakan top navigation bar.
- Hanya memiliki tombol Kembali.
- Area utama berisi slot mini-game.
- Empat slot dalam satu baris.
- Beberapa baris slot ke bawah.
- Halaman dapat di-scroll secara vertikal.

Setiap slot menampilkan:
- Preview atau gambar dummy.
- Nomor slot.
- Tampilan sederhana.

Untuk prototype:
- Slot 1 dapat dipilih.
- Slot lainnya hanya berupa dummy visual.

Ketika Slot 1 dipilih, lanjutkan ke Player Selection.


## 8.4 PLAYER SELECTION

Halaman ini digunakan untuk memilih jumlah pemain.

Tampilan:
- Empat tombol dalam satu baris.
- Tombol P1.
- Tombol P2.
- Tombol P3.
- Tombol P4.
- Tombol Kembali di bagian bawah.

Untuk prototype awal:
- Hanya P4 yang aktif.
- P1, P2, dan P3 ditampilkan sebagai pilihan
  yang belum tersedia.

Ketika P4 dipilih, masuk ke Dummy Minigame.


## 8.5 DUMMY MINIGAME

Dummy digunakan untuk menguji tampilan gameplay,
kamera, karakter, dan kontrol.

Dummy menggunakan:

A. Kamera:
- Kamera 3D.
- Mengarah ke bawah menuju arena.
- Posisi dan ketinggian disesuaikan dengan ukuran map.
- Kamera diam.
- Kamera tidak mengikuti pemain.

B. Player:
- Menggunakan model karakter dari aset global.
- Menggunakan animasi global.
- Tidak membuat model baru khusus untuk dummy.

C. Arena:
- Lantai berbentuk persegi.
- Pola kotak-kotak seperti papan catur.
- Warna abu-abu dan putih.
- Permukaan datar.
- Tidak ada objek tambahan.

D. Kontrol:
- Menggunakan Virtual Joystick global.
- Joystick berada di sudut layar.
- Setiap pemain memiliki joystick dengan warna berbeda.
- Mendukung Multi-touch.

E. Gerakan:
- Joystick atas menggerakkan karakter maju.
- Joystick bawah menggerakkan karakter mundur.
- Joystick kiri menggerakkan karakter ke kiri.
- Joystick kanan menggerakkan karakter ke kanan.
- Gerakan diagonal didukung.
- Karakter menghadap arah gerakan.

F. Animasi:
- Idle ketika joystick netral.
- Walk ketika joystick digerakkan.
- Kecepatan gerakan mengikuti besar input joystick.
- Kecepatan animasi berjalan mengikuti besar input joystick.

Jika joystick digerakkan setengah:
- Karakter bergerak dengan kecepatan setengah.
- Animasi berjalan menyesuaikan kecepatannya.

Jika joystick digerakkan penuh:
- Karakter bergerak dengan kecepatan penuh.
- Animasi berjalan menggunakan kecepatan penuh.


## 8.6 DESAIN VIRTUAL JOYSTICK

Joystick terdiri dari dua buah lingkaran.

1. Lingkaran luar sebagai area dasar.
2. Lingkaran dalam sebagai kontrol analog.

Aturan:
- Lingkaran dalam dapat digerakkan.
- Lingkaran dalam tidak boleh keluar dari lingkaran luar.
- Pergerakan dibatasi oleh radius lingkaran luar.
- Posisi netral berada di tengah.
- Input mendukung arah diagonal.
- Nilai input dapat digunakan untuk menentukan kecepatan.

Setiap pemain memiliki warna joystick berbeda.


## 8.7 PAUSE MENU

Tombol Pause berada di tengah bawah layar,
pada area yang tidak mengganggu kontrol pemain.

Ketika tombol Pause ditekan:
- Permainan langsung berhenti.
- Pergerakan karakter berhenti.
- Animasi gameplay berhenti.
- Timer gameplay berhenti.

Tampilkan tiga tombol:

1. Lanjut.
2. Ulang.
3. Keluar.

Fungsi:

Lanjut:
Menutup menu Pause dan melanjutkan permainan.

Ulang:
Memulai ulang Dummy Minigame.

Keluar:
Kembali ke menu sebelumnya.


## 9. DESAIN UI GLOBAL

Seluruh UI harus mengikuti prinsip berikut:

- Minimalis.
- Tidak banyak teks.
- Warna solid.
- Tidak menggunakan gradasi.
- Menggunakan bentuk sederhana.
- Boleh menggunakan garis luar.
- Layout konsisten.
- Responsif terhadap ukuran layar.
- Mengutamakan orientasi landscape.


## 10. RUANG LINGKUP PROTOTYPE

Prototype pertama hanya berfokus pada:

1. Opening Screen.
2. Permintaan Fullscreen.
3. Main Menu.
4. Free Play.
5. Menu Mini-games.
6. Player Selection.
7. Dummy Minigame.
8. Virtual Joystick.
9. Pause Menu.
10. Navigasi kembali.

Tidak perlu membuat:
- Gameplay mini-game final.
- Sistem pertandingan lengkap.
- Sistem bot final.
- Banyak mini-game.
- Kustomisasi karakter.
- Sistem progres pemain.

Tujuan prototype adalah memastikan tampilan,
navigasi, dan integrasi dasar dapat bekerja.


## 11. TARGET AKHIR

Game diharapkan memiliki:
- Banyak mini-game modular.
- Core Engine yang dapat digunakan ulang.
- Sistem multiplayer lokal.
- Dukungan bot.
- Kontrol multi-touch.
- Aset karakter global.
- Sistem UI yang dapat digunakan ulang.
- Performa yang baik pada perangkat mobile.
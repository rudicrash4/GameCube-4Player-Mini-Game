# TECHNICAL DESIGN DOCUMENT (TDD)

## 1. INFORMASI TEKNIS

Project:
Mini-game Collection

Platform:
HTML5 Browser

Target:
Mobile Browser

Orientasi:
Landscape

Bahasa:
JavaScript ES Modules

Markup:
HTML5

Styling:
CSS3

3D Engine:
Three.js

Graphics:
WebGL

Input:
Pointer Events

Storage:
LocalStorage / IndexedDB

Audio:
Web Audio API / HTMLAudioElement


## 2. ARSITEKTUR SISTEM

Project menggunakan arsitektur modular.

Pembagian utama:

1. Core Engine.
2. Shared Components.
3. UI System.
4. Mini-game Modules.
5. Global Assets.

Core Engine mengelola sistem utama.

Shared Components menyediakan komponen yang dapat
digunakan ulang.

UI System mengelola tampilan aplikasi.

Mini-game Modules berisi gameplay dan sistem khusus.

Global Assets menyimpan aset yang digunakan bersama.


## 3. CORE ENGINE

Core Engine merupakan pusat pengelolaan aplikasi.

Tanggung jawab Core:

- Inisialisasi aplikasi.
- Mengelola Three.js Renderer.
- Mengelola lifecycle mini-game.
- Mengelola input.
- Mengelola aset global.
- Mengelola karakter.
- Mengelola animasi.
- Mengelola kontrol virtual.
- Mengelola audio.
- Mengelola skor.
- Mengelola waktu.
- Mengelola HP.
- Mengelola UI global.

Core harus bersifat modular.

Setiap sistem harus memiliki tanggung jawab yang jelas.

Core tidak boleh berisi gameplay khusus mini-game.


## 4. SHARED RENDERER

Gunakan satu shared THREE.WebGLRenderer yang dikelola
oleh Core Engine.

Setiap mini-game dapat memiliki:
- THREE.Scene sendiri.
- THREE.Camera sendiri.
- Lighting sendiri.
- Arena sendiri.
- Objek gameplay sendiri.

Ketika mini-game berganti:
- Hentikan mini-game sebelumnya.
- Bersihkan resource milik mini-game sebelumnya.
- Gunakan renderer global.
- Aktifkan scene mini-game berikutnya.

Renderer tidak perlu dibuat ulang setiap kali
mini-game berganti.


## 5. SHARED COMPONENTS

Komponen global yang disediakan Core:

### 5.1 Player System

Mengelola:
- Model karakter.
- Posisi.
- Rotasi.
- Movement dasar.
- Identitas pemain.

### 5.2 Animation Manager

Mengelola:
- Idle.
- Walk.
- Animasi lainnya.
- Transisi animasi.
- Playback speed.

### 5.3 Input Manager

Mengelola:
- Pointer Events.
- Touch input.
- Multi-touch.
- Input pemain.
- Input joystick.
- Input tombol virtual.

### 5.4 Virtual Joystick

Mengelola:
- Area joystick.
- Posisi kontrol analog.
- Nilai input X dan Y.
- Normalisasi input.
- Pembatasan radius.
- Identitas pemain.

Joystick harus mendukung beberapa pointer
secara bersamaan.

### 5.5 Virtual Buttons

Mengelola tombol virtual yang dapat digunakan
oleh mini-game.

### 5.6 Health System

Menyediakan pengelolaan HP.

Mini-game dapat menentukan nilai HP dan aturan
perubahannya.

### 5.7 Timer

Menyediakan sistem penghitung waktu.

Timer harus mendukung:
- Start.
- Stop.
- Pause.
- Resume.
- Reset.

### 5.8 Score Manager

Mengelola skor pemain.

Mendukung:
- Penambahan skor.
- Pengurangan skor.
- Pembacaan skor.
- Reset skor.
- Hasil mini-game.

### 5.9 Asset Manager

Mengelola pemuatan dan penyimpanan referensi aset.

### 5.10 Audio Manager

Mengelola audio global.


## 6. MINI-GAME MODULES

Setiap mini-game harus berada di folder terpisah.

Contoh:

minigames/
├── _template/
├── game-1/
├── game-2/
└── game-3/

Setiap mini-game dapat memiliki:
- Entry point.
- Scene.
- Camera.
- Lighting.
- Arena.
- Gameplay.
- Local Systems.
- Assets.
- UI khusus.
- Bot AI.

Mini-game boleh mengimpor komponen dari Core
dan Shared Components.

Mini-game tidak boleh mengubah implementasi Core
secara langsung.


## 7. MINI-GAME LIFECYCLE

Setiap mini-game harus mengikuti kontrak lifecycle.

Metode:

init(context)
start()
update(deltaTime)
render()
pause()
resume()
getResults()
destroy()

Penjelasan:

init(context):
Menerima fasilitas Core dan menyiapkan scene.

start():
Memulai permainan.

update(deltaTime):
Memperbarui logika gameplay.

render():
Menjalankan rendering sesuai kontrak engine.

pause():
Menghentikan aktivitas gameplay.

resume():
Melanjutkan gameplay.

getResults():
Mengembalikan hasil permainan.

destroy():
Menghentikan sistem dan membersihkan resource.

Core bertanggung jawab memanggil lifecycle
dengan urutan yang benar.


## 8. MINI-GAME API

Mini-game menerima context dari Core.

Contoh konsep:

{
    renderer,
    assetManager,
    inputManager,
    audioManager,
    playerManager,
    controlManager,
    scoreManager,
    gameManager
}

Context digunakan untuk mengakses fasilitas global.

Mini-game hanya boleh menggunakan fasilitas
yang diperlukan.


## 9. LOCAL SYSTEMS

Sistem khusus mini-game ditempatkan di foldernya sendiri.

Contoh:

game-1/
├── index.js
├── scene.js
├── camera.js
├── arena.js
└── systems/
    ├── racing-system.js
    ├── checkpoint-system.js
    └── racing-ai.js

Sistem tersebut tidak perlu dimasukkan ke Core
jika hanya digunakan oleh Game 1.

Jika suatu sistem mulai dibutuhkan oleh banyak
mini-game, evaluasi kemungkinan memindahkannya
menjadi komponen Shared Core.

Pemindahan harus melalui API yang jelas.


## 10. TEMPLATE MINI-GAME

Folder _template digunakan sebagai dasar pembuatan
mini-game baru.

Template menyediakan:
- Entry point.
- Scene.
- Camera.
- Lighting.
- Arena.
- Spawn Point.
- Player Integration.
- Control Integration.
- Bot Integration.
- Game Loop.
- Pause.
- Resume.
- Results.
- Resource Cleanup.

Template harus dapat berjalan menggunakan fasilitas
Core tanpa memerlukan implementasi ulang.


# 11. DUMMY MINIGAME TECHNICAL SPECIFICATION

Dummy merupakan modul pengujian integrasi Core.


## 11.1 SCENE

Dummy membuat THREE.Scene sendiri.

Scene berisi:
- Arena.
- Player.
- Lighting.
- Objek pendukung jika diperlukan.

Scene dikelola oleh lifecycle mini-game.


## 11.2 CAMERA

Gunakan THREE.PerspectiveCamera.

Karakteristik:
- Kamera menghadap ke bawah.
- Posisi kamera berada di atas arena.
- Kamera diam.
- Kamera tidak mengikuti karakter.
- Ketinggian kamera disesuaikan dengan ukuran arena.
- Seluruh area arena harus terlihat dengan baik.

Kamera menjadi tanggung jawab Dummy Minigame.


## 11.3 ARENA

Arena menggunakan lantai persegi.

Ketentuan:
- Pola kotak-kotak.
- Warna abu-abu dan putih.
- Permukaan datar.
- Ukuran arena ditentukan melalui konfigurasi.
- Tidak memerlukan objek dekorasi.

Arena dapat dibuat menggunakan PlaneGeometry
atau geometri lain yang sesuai.


## 11.4 PLAYER

Dummy wajib menggunakan model karakter global.

Tidak boleh membuat model karakter baru khusus Dummy.

Player diinisialisasi melalui Player System.

Setiap pemain mempunyai:
- ID pemain.
- Warna pemain.
- Model karakter.
- Animation Controller.
- Movement Controller.


## 11.5 PLAYER MOVEMENT

Pergerakan karakter dikendalikan oleh Virtual Joystick.

Input joystick menghasilkan nilai:

X = arah horizontal
Y = arah vertikal

Nilai input dinormalisasi dan dibatasi sesuai
radius maksimum joystick.

Kecepatan gerakan ditentukan oleh besar input joystick.

Contoh:
- Input 0.0 = diam.
- Input 0.5 = kecepatan sekitar 50%.
- Input 1.0 = kecepatan penuh.

Gunakan deltaTime agar pergerakan tidak bergantung
pada FPS.

Gerakan diagonal harus dinormalisasi agar karakter
tidak bergerak lebih cepat secara diagonal.

Karakter menghadap arah gerakan.


## 11.6 ANIMATION

Gunakan Animation Manager global.

Animasi minimum:
- Idle.
- Walk.

Ketentuan:
- Joystick netral: Idle.
- Joystick digerakkan: Walk.
- Besar input memengaruhi kecepatan animasi.
- Kecepatan animasi disesuaikan dengan kecepatan gerakan.
- Transisi animasi harus halus.

Jika aset global tidak memiliki animasi yang dibutuhkan,
jangan membuat animasi palsu.
Laporkan aset yang belum tersedia.


## 11.7 VIRTUAL JOYSTICK

Joystick terdiri dari dua lingkaran.

Outer Circle:
Area dasar joystick.

Inner Circle:
Kontrol analog yang dapat digerakkan.

Ketentuan:
- Inner Circle tidak boleh keluar dari Outer Circle.
- Posisi netral berada di tengah.
- Input memiliki nilai X dan Y.
- Input memiliki besar atau magnitude.
- Mendukung arah diagonal.
- Mendukung Multi-touch.

Setiap pemain memiliki joystick dengan warna berbeda.

Joystick dibuat menggunakan HTML dan CSS,
sedangkan pengolahan input menggunakan JavaScript.

Pointer Events digunakan untuk menangani sentuhan.


## 11.8 MULTI-TOUCH

Setiap joystick harus mempunyai pengelolaan pointer sendiri.

Satu sentuhan hanya boleh mengendalikan joystick
yang sedang disentuh.

Sentuhan pemain lain tidak boleh mengubah input
joystick pemain pertama.

Gunakan pointerId untuk mengidentifikasi setiap
sentuhan.

Input harus dibersihkan ketika:
- Pointer dilepas.
- Pointer dibatalkan.
- Mini-game dihentikan.
- Mini-game dihancurkan.


## 11.9 PLAYER COLORS

Setiap pemain memiliki warna berbeda.

Warna karakter dan joystick harus sesuai
dengan identitas pemain.

Contoh:
- Player 1: Merah.
- Player 2: Biru.
- Player 3: Hijau.
- Player 4: Kuning.

Warna dapat ditentukan melalui konfigurasi global.


# 12. PAUSE SYSTEM

Tombol Pause berada di bagian tengah bawah layar.

Ketika Pause aktif:

- Gameplay berhenti.
- Movement berhenti.
- Animasi gameplay berhenti.
- Timer gameplay berhenti.
- Input gameplay dinonaktifkan.

Tampilkan tiga tombol:

1. Lanjut.
2. Ulang.
3. Keluar.

Lanjut:
Memanggil resume().

Ulang:
Menghentikan dan menginisialisasi ulang Dummy.

Keluar:
Memanggil destroy() dan kembali ke menu sebelumnya.

UI Pause tetap aktif ketika gameplay dihentikan.


# 13. HTML DAN CSS ARCHITECTURE

Gunakan satu HTML utama.

HTML bertanggung jawab atas:
- Root aplikasi.
- Canvas 3D.
- Container UI.
- Menu.
- Overlay.
- Kontrol virtual.

CSS global bertanggung jawab atas:
- Layout.
- Warna.
- Tombol.
- Panel.
- Joystick.
- HUD.
- Responsivitas.

JavaScript bertanggung jawab atas:
- Navigasi.
- Gameplay.
- Input.
- Core.
- Lifecycle.
- Rendering.

Mini-game tidak perlu membuat HTML utama sendiri.

Mini-game boleh memiliki CSS tambahan apabila
memerlukan UI khusus.

Pastikan elemen UI yang tidak aktif tidak muncul.

Gunakan aturan CSS yang menjaga perilaku hidden
agar tidak tertimpa oleh aturan display komponen.


# 14. FULLSCREEN SYSTEM

Pada pembukaan website:

- Tampilkan tombol masuk fullscreen.
- Minta fullscreen melalui interaksi pengguna.
- Jangan mencoba memaksa fullscreen saat halaman
  pertama kali dimuat.
- Tangani kegagalan permintaan fullscreen.
- Sediakan cara untuk melanjutkan jika fullscreen
  tidak tersedia.

Gunakan Fullscreen API jika didukung browser.

Fullscreen tidak selalu dapat menyembunyikan
seluruh indikator browser pada semua perangkat.

Aplikasi harus tetap responsif ketika fullscreen
aktif maupun tidak aktif.


# 15. UI NAVIGATION

Alur navigasi prototype:

OPENING
   |
   v
MAIN MENU
   |
   |---- MATCH MODE
   |
   |---- FREE PLAY
             |
             v
       MINIGAME SELECTION
             |
             v
       PLAYER SELECTION
             |
             v
       DUMMY MINIGAME
             |
             v
         PAUSE MENU
             |
       |-----|------|
       v     v      v
     LANJUT ULANG KELUAR


# 16. ASSET MANAGEMENT

Aset global berada di folder Shared Assets.

Contoh:
- Model karakter.
- Animasi.
- Tekstur.
- Audio.

Asset Manager harus menghindari pemuatan aset
yang sama secara berulang jika memungkinkan.

Aset yang digunakan bersama harus memiliki
mekanisme pengelolaan referensi.

Ketika mini-game dihentikan:
- Bersihkan objek scene milik mini-game.
- Lepaskan event listener.
- Hentikan audio lokal.
- Bersihkan timer lokal.
- Lepaskan resource yang memang dimiliki mini-game.

Jangan menghancurkan aset global yang masih
digunakan sistem lain.


# 17. PERFORMANCE

Target pengembangan:
- Mengupayakan 60 FPS.
- Mengurangi draw call.
- Menggunakan geometri yang efisien.
- Mengoptimalkan tekstur.
- Menghindari pembuatan objek berulang dalam update loop.
- Mengelola asset loading.
- Menghindari memory leak.
- Mendukung perangkat mobile.

FPS harus diuji pada perangkat nyata.

Jangan mengklaim target performa tercapai
sebelum pengujian dilakukan.


# 18. TESTING

Pengujian minimum:

A. Opening:
- Tombol fullscreen berfungsi.
- Navigasi masuk ke Main Menu.

B. Main Menu:
- Match Mode dapat dipilih.
- Free Play dapat dipilih.

C. Mini-game Selection:
- Empat kolom tampil dengan benar.
- Slot tersusun ke bawah.
- Scroll berfungsi.
- Tombol Kembali berfungsi.
- Slot 1 dapat dipilih.

D. Player Selection:
- P1 sampai P4 tampil.
- Hanya P4 yang aktif.
- Tombol Kembali berfungsi.

E. Dummy:
- Scene tampil.
- Kamera menghadap ke bawah.
- Arena tampil.
- Model global berhasil dimuat.
- Animasi berfungsi.
- Joystick berfungsi.
- Gerakan sesuai input.
- Kecepatan mengikuti magnitude joystick.

F. Multi-touch:
- Beberapa joystick dapat digunakan bersamaan.
- Input tidak saling mengganggu.

G. Pause:
- Gameplay berhenti.
- Lanjut berfungsi.
- Ulang berfungsi.
- Keluar berfungsi.

H. Cleanup:
- Tidak ada input tertinggal.
- Tidak ada event listener yang bocor.
- Resource mini-game dibersihkan.


# 19. DEVELOPMENT RULES

1. Jangan menaruh gameplay khusus di Core.
2. Jangan menduplikasi komponen global.
3. Gunakan ES Modules.
4. Gunakan API yang jelas.
5. Setiap mini-game harus modular.
6. Setiap mini-game harus memiliki lifecycle.
7. Gunakan satu shared renderer.
8. Bersihkan resource ketika mini-game dihentikan.
9. Semua kontrol harus mendukung Multi-touch.
10. Jangan menghapus fitur yang sudah berfungsi
    saat melakukan pengembangan berikutnya.


# 20. DEVELOPMENT ORDER

Tahap 1:
Prototype UI.

Tahap 2:
Core Engine dasar.

Tahap 3:
Shared Components.

Tahap 4:
Dummy Minigame.

Tahap 5:
Integrasi dan pengujian Core.

Tahap 6:
Template Mini-game.

Tahap 7:
Mini-game pertama.

Tahap 8:
Pengembangan mini-game berikutnya.
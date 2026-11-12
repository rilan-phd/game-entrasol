# Project Structure

Dokumen ini mendefinisikan struktur folder/file aplikasi dan skema data LocalStorage. Ikuti struktur ini saat mengimplementasikan aplikasi.

## Pohon Direktori

```
kiro/
├── index.html              # Landing page: perkenalan, keterangan game, tombol Start
├── result.html             # Halaman skor akhir
├── assets/                 # Aset global (logo Entrasol & Kalbe, icon-game-N.svg, background-wave.svg)
├── css/
│   └── style.css           # Stylesheet kustom: @font-face Noto Sans, mobile frame 430px, aturan fit-to-viewport (dvh), kelas per halaman (prefix flip- untuk game-1)
├── js/
│   ├── storage.js          # Helper LocalStorage (baca/tulis skor & state, hitung total)
│   └── app.js              # Navigasi, interaksi umum, logika halaman Result
├── fonts/                  # File Noto Sans offline (.woff2 / .ttf)
├── vendor/
│   └── bootstrap/          # Bootstrap 5 lokal (bootstrap.min.css, bootstrap.bundle.min.js)
├── game-1/                  # Memory Flip
│   ├── index.html          # Halaman game: petunjuk + tombol Start + papan 4x4
│   ├── game.js             # Logika gameplay, timer 30 dtk, scoring (5/pasang)
│   └── assets/             # Aset Memory Flip: back-card.jpg, item-1..8.jpg, audio/ (flip, match, wrong, countdown .mp3)
├── game-2/                  # Memory Recall
│   ├── index.html          # Halaman game: petunjuk + tombol Start + fase hafal/jawab
│   ├── game.js             # Logika dua fase (5+5 dtk), scoring all-or-nothing (30)
│   └── assets/             # Gambar kartu Memory Recall (placeholder .jpeg)
└── game-3/                  # Memorize, Shuffle & Recall
    ├── index.html          # Halaman game: petunjuk + tombol Start + fase hafal/susun
    ├── game.js             # Logika dua fase (5+5 dtk), shuffle, scoring (10/posisi)
    └── assets/             # Gambar kartu Memorize (placeholder .jpeg)
```

## Peran Tiap File / Folder

### Halaman HTML (root)
- **`index.html`** — Landing page. Berisi branding Entrasol, keterangan singkat ketiga game, dan tombol **Start** yang (a) mereset skor di LocalStorage untuk sesi baru, lalu (b) mengarahkan ke `game-1/index.html`.
- **`result.html`** — Membaca skor dari LocalStorage dan menampilkan rincian per game + total, teks terima kasih, dan teks pemenang (jika total 100).

### JavaScript Global (`js/`)
- **`js/storage.js`** — Satu-satunya tempat yang menyentuh LocalStorage secara langsung. Menyediakan fungsi helper, misalnya:
  - `resetScore()` — inisialisasi/kosongkan skor untuk sesi baru.
  - `saveGameScore(gameKey, value)` — simpan skor satu game lalu perbarui `total`.
  - `getScore()` — ambil objek skor lengkap.
  - `getTotal()` — ambil skor total.
- **`js/app.js`** — Fungsi lintas halaman: helper navigasi (pindah ke halaman berikutnya), interaksi umum, dan logika rendering halaman **Result** (menampilkan rincian skor, teks terima kasih, teks pemenang).

### JavaScript Per Game (`game-N/game.js`)
Setiap game punya logikanya sendiri agar mudah dikelola dan tidak saling mengganggu:
- **`game-1/game.js`** — Membuat papan 4×4, mengacak posisi pasangan, menangani flip & pencocokan, timer 30 detik, menghitung skor (5 point/pasang), dan menampilkan layar hasil saat selesai/waktu habis (pindah ke game berikutnya hanya lewat tombol Lanjutkan).
- **`game-2/game.js`** — Mengelola fase hafal (tampilkan 1 kartu 5 dtk) dan fase jawab (3 pilihan, 5 dtk), menentukan benar/salah, skor 30/0, lalu menampilkan layar hasil (tombol Lanjutkan, tanpa navigasi otomatis).
- **`game-3/game.js`** — Mengelola fase hafal (3 kartu 5 dtk), shuffle, fase jawab (susun ulang 5 dtk), skor 10/posisi benar, lalu menampilkan layar hasil (tombol Lanjutkan, tanpa navigasi otomatis).

Semua `game.js` menulis skor lewat helper `storage.js` dan berpindah halaman lewat helper `app.js` hanya saat pemain menekan tombol Lanjutkan.

### Aset
- **`assets/`** (root) — aset global seperti logo Entrasol dan ikon umum yang dipakai lebih dari satu halaman.
- **`game-N/assets/`** — gambar kartu khusus game tersebut.
- Aset yang sudah disediakan (ikon SVG, logo, wave, gambar kartu, audio) dipakai apa adanya dengan nama file aslinya. Aset yang belum ada boleh memakai placeholder dengan **struktur path final** agar nanti cukup ditimpa file asli tanpa mengubah kode. Contoh dari `game-1/index.html`: `assets/item-1.jpg` (relatif terhadap folder game).

### Dependensi Offline
- **`vendor/bootstrap/`** — file Bootstrap 5 lokal.
- **`fonts/`** — file Noto Sans lokal untuk `@font-face`.

## Konvensi Penamaan

- Folder game: `game-1`, `game-2`, `game-3` (urutan = urutan main).
- File logika per game selalu bernama `game.js` di dalam folder game-nya.
- Nama file aset gambar deskriptif dan konsisten (mis. `item-1.jpg`, `item-2.jpg`, `back-card.jpg`).
- Gunakan path **relatif** untuk semua referensi aset (ingat halaman game berada satu level lebih dalam, jadi referensi ke root memakai `../`, mis. `../css/style.css`, `../js/storage.js`, `../vendor/bootstrap/...`).

## Aturan Layout Lintas Halaman

- Setiap halaman memakai container mobile 430px dan aturan fit-to-viewport (tanpa scroll vertikal saat tinggi layar >= 550px). Detail ada di `design.md`.
- Semua gaya berada di satu file `css/style.css`. Gaya khusus satu game memakai prefix kelas sendiri (mis. `flip-` untuk game-1) agar tidak mengubah halaman lain.

## Skema Data LocalStorage

- **Key:** `entrasol_game_score`
- **Value (JSON string):**
  ```json
  {
    "memoryFlip": 0,
    "memoryRecall": 0,
    "memorize": 0,
    "total": 0
  }
  ```
- `total` selalu = `memoryFlip + memoryRecall + memorize` (0–100).
- Direset saat sesi baru dimulai dari tombol Start di `index.html`.
- Dibaca oleh `result.html` untuk menampilkan hasil.

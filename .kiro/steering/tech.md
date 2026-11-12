# Technology Stack & Technical Rules

Aturan teknis di bawah ini **wajib dipatuhi** saat mengimplementasikan aplikasi. Aturan ini dibuat agar aplikasi tetap ringan, portable, dan dapat berjalan sepenuhnya secara **offline** tanpa ketergantungan jaringan.

## Stack yang Diizinkan

- **HTML** — markup halaman (multi-page).
- **CSS** — styling, menggunakan **Bootstrap 5** (lokal/offline) + stylesheet kustom.
- **JavaScript vanilla** — seluruh logika aplikasi.

## Larangan (Hard Rules)

- ❌ **TANPA framework / library JavaScript apapun.** Tidak boleh React, Vue, Angular, jQuery, atau sejenisnya. Hanya JavaScript murni (vanilla).
- ❌ **TANPA CDN.** Semua dependensi (Bootstrap, font) harus diinstal lokal dan direferensikan dari path lokal.
- ❌ **TANPA build tools / bundler** (tidak ada npm build step, webpack, vite, dll). File dapat dibuka langsung di browser.
- ❌ **TANPA URL eksternal** untuk aset apapun (CSS, JS, font, gambar). Semua aset berada di dalam project.

## Bootstrap 5 (Offline / Local)

- Bootstrap 5 **wajib diinstal secara lokal**, disimpan di folder `vendor/bootstrap/`.
- Referensikan CSS dan JS Bootstrap dari path lokal, contoh:
  ```html
  <link rel="stylesheet" href="vendor/bootstrap/bootstrap.min.css">
  <script src="vendor/bootstrap/bootstrap.bundle.min.js"></script>
  ```
- **DILARANG** menggunakan link CDN seperti `https://cdn.jsdelivr.net/...`.
- Gunakan sistem grid dan utility class Bootstrap untuk responsivitas (mobile-first).

## Font Noto Sans (Offline)

- Font **Noto Sans** (dari Google Fonts) wajib diinstal **offline**.
- File font (`.woff2` / `.ttf`) disimpan di folder `fonts/`.
- Dideklarasikan via **`@font-face`** di CSS lokal (mis. `css/style.css`).
- **DILARANG** mengambil font dari URL Google Fonts (`https://fonts.googleapis.com/...` atau `https://fonts.gstatic.com/...`).
- Contoh deklarasi:
  ```css
  @font-face {
    font-family: 'Noto Sans';
    src: url('../fonts/NotoSans-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  ```

## Penyimpanan Data — LocalStorage

- Skor dan state game disimpan di **LocalStorage browser**.
- Helper baca/tulis LocalStorage terpusat di `js/storage.js`.
- **Skema objek skor** yang disarankan (disimpan sebagai JSON string):
  ```js
  {
    memoryFlip: 0,    // skor game-1 (0 - 40)
    memoryRecall: 0,  // skor game-2 (0 atau 30)
    memorize: 0,      // skor game-3 (0 - 30, kelipatan 10)
    total: 0          // akumulasi (0 - 100)
  }
  ```
- **Key LocalStorage** yang disarankan: `entrasol_game_score`.
- Alur data:
  - Setiap game menulis skornya ke LocalStorage saat selesai (lewat helper di `storage.js`).
  - `total` dihitung ulang sebagai `memoryFlip + memoryRecall + memorize`.
  - Halaman Result membaca skor dari LocalStorage untuk ditampilkan.
- Pertimbangkan **reset skor** saat sesi baru dimulai dari `index.html` (menekan Start di landing page) agar hasil tidak bercampur antar sesi.

## Navigasi Antar Halaman

- Aplikasi bersifat **multi-page HTML** — setiap halaman adalah file `.html` terpisah.
- Perpindahan halaman menggunakan navigasi browser biasa (mis. `window.location.href = '../game-2/index.html'`).
- Perpindahan dari satu game ke halaman berikutnya hanya dipicu tombol "Lanjutkan" di layar hasil. Timer habis atau game selesai TIDAK boleh memicu redirect otomatis.
- State antar halaman dipertahankan lewat LocalStorage, bukan lewat variabel in-memory (karena berpindah halaman me-reset JS runtime).

## Catatan Kompatibilitas

- Semua kode harus berjalan di browser modern (Chrome, Firefox, Safari, Edge) tanpa transpile.
- Gunakan fitur JS standar (ES6+) yang didukung luas: `const/let`, arrow function, template literal, `JSON.parse/stringify`, `setTimeout/setInterval`, `localStorage`.

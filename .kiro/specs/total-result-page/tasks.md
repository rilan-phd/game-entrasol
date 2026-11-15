# Implementation Plan: Halaman Total Result (result.html)

## Overview

Buat `result.html` dengan struktur mirip Home, tampilkan skor tiga game dari LocalStorage, tahan Back dan refresh, dan pastikan scan QR berikutnya memulai sesi baru yang bersih.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "3"] },
    { "wave": 2, "tasks": ["2", "4"] },
    { "wave": 3, "tasks": ["5"] },
    { "wave": 4, "tasks": ["6", "7"] },
    { "wave": 5, "tasks": ["8"] }
  ]
}
```

## Tasks

- [x] 1. Tambah helper sesi di `js/storage.js`
  - `saveResultSnapshot`, `getResultSnapshot`, `clearResultSnapshot` (sessionStorage, key `entrasol_result_snapshot`, validasi dengan `isValidScore`).
  - `markSessionDone`, `isSessionDone`, `clearSessionDone` (localStorage, key `entrasol_session_done`).
  - `isSessionFinished()`: true bila `loadGame3State()` ada dan `phase === 'finished'`.
  - Ekspos di `ScoreStore` dan global; semua fungsi tidak melempar error.
  - _Requirements: 1.1, 1.2, 1.4, 1.6, 8.1, 10.2_

- [x] 2. Tambah helper di `js/app.js`
  - `replaceTo(url)` memakai `window.location.replace`.
  - `loadResult()` sesuai alur di design (snapshot → sesi selesai → redirect ke `index.html`); total dihitung dari tiga skor.
  - Ekspor di blok `module.exports`.
  - _Requirements: 1.1-1.6, 7.4_

- [x] 3. Tambah style `result-*` di `css/style.css`
  - Variabel `--result-green-dark`, `--result-red`, `--result-text-gray`.
  - `.result-page` (background, wave `::after`, container 430px), `.result-content`, ikon, judul, sub teks (+ modifier win/lose), `.result-item*` (proporsi 30/40/20), total, footer, logo.
  - `@keyframes result-pulse` (1 → 1.08 → 1) dan `prefers-reduced-motion`.
  - Confetti: `.result-confetti`, `.result-confetti__piece`, `@keyframes result-fall`.
  - Aturan fit-to-viewport (`clamp` + `--dvh`) di `@media (min-height: 550px)`.
  - Tambah `@font-face` Medium (500) dan Light (300) bila file font tersedia di `fonts/`.
  - _Requirements: 2.5-2.7, 3.3, 3.4, 4.1-4.6, 5.1-5.3, 6.1, 9.1-9.7, 10.3_

- [x] 4. Buat `result.html`
  - Struktur sesuai design; memakai `vendor/bootstrap/bootstrap.min.css`, `css/style.css`, `storage.js`, `app.js`; semua path lokal.
  - Tanpa tombol atau tautan navigasi.
  - _Requirements: 4.1-4.7, 5.1, 5.2, 6.1-6.3, 10.1_

- [x] 5. Render hasil dan confetti di `js/app.js`
  - `renderResult(score)`: pilih ikon, teks utama, sub teks, kelas warna, isi tiga skor dan total.
  - `launchConfetti(container)` hanya bila menang dan motion tidak dikurangi.
  - Init otomatis saat `DOMContentLoaded` hanya pada halaman result (cek elemen `#resultTitle`).
  - _Requirements: 1.3, 2.1-2.8, 3.1-3.6_

- [x] 6. Pasang trap Back dan penanganan `pageshow` di `js/app.js`
  - `lockBack()`: `replaceState` + `pushState`, listener `popstate` yang `pushState` ulang.
  - Listener `pageshow` (`persisted`) → render ulang + `lockBack()`.
  - _Requirements: 7.1-7.3, 7.5_

- [x] 7. Hubungkan alur game dan home
  - `game-3/game.js`: pindah ke `../result.html` lewat `replaceTo`.
  - `index.html`: tombol Start memanggil `resetScore()` + `clearSessionDone()` bila `isSessionDone()`; logika lain tidak berubah.
  - _Requirements: 7.4, 8.1, 8.3_

- [ ] 8. Verifikasi manual
  - Skor 100 dan skor < 100 (0, 35, 70): ikon, teks, warna, confetti, pulse.
  - Back dan refresh tetap di `result.html`; hasil sama.
  - Scan ulang di tab baru: sesi bersih; tab lama tetap menampilkan hasil lama setelah refresh.
  - Buka `result.html` langsung tanpa sesi → ke `index.html`.
  - Viewport 375x553: tanpa scroll vertikal; cek juga 430x932 dan desktop.
  - Cek `prefers-reduced-motion`, konsol tanpa error, tidak ada request jaringan eksternal.
  - _Requirements: 1-10_

## Notes

- `fonts/` saat ini hanya punya Regular dan Bold; weight 500 dan 300 baru terlihat berbeda setelah file Medium dan Light ditambahkan.
- Menahan Back hanya best-effort di sisi web.
- Tidak menambah dependensi; semua aset lokal.

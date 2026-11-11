# Implementation Plan: Memory Flip Game

## Overview

Implementasi game pertama Memory Flip di `game-1/` memakai HTML, CSS (Bootstrap 5 lokal + `css/style.css`), dan JavaScript vanilla. Urutan kerja: helper global (`js/storage.js`, `js/app.js`), fungsi murni gameplay, markup dan gaya, lapisan DOM/timer, lalu penyesuaian link Start di Home. Bahasa implementasi: JavaScript (sesuai desain). Pengujian properti memakai fast-check dan dijalankan di Node hanya sebagai alat pengembang, terpisah di folder `tests/`.

## Tasks

- [ ] 1. Siapkan helper global LocalStorage dan navigasi
  - [x] 1.1 Buat `js/storage.js`
    - Definisikan `SCORE_KEY = 'entrasol_game_score'` dan `DEFAULT_SCORE`
    - Implementasikan `isValidScore`, `computeTotal`, `getScore`, `saveGameScore(gameKey, value)`, `resetScore`, `getTotal`
    - Bungkus `getItem`/`setItem` dengan `try/catch`; `saveGameScore` mengembalikan `{ ok, score }` dan tidak melempar error
    - Pertahankan field game lain dan hitung ulang `total`
    - Ekspos fungsi lewat objek global dan `module.exports` bila tersedia
    - Pastikan ini satu-satunya berkas yang menyentuh `localStorage`
    - _Requirements: 7.1, 7.3, 7.4, 7.6, 7.7, 8.8_

  - [x] 1.2 Buat `js/app.js`
    - Implementasikan `navigateTo(url)` yang mengatur `window.location.href`
    - _Requirements: 6.7, 7.5, 8.4_

  - [ ]* 1.3 Tulis property test untuk `storage.js` di `tests/storage.property.test.js`
    - Gunakan mock `localStorage` in-memory dan varian yang melempar error; `numRuns: 100`
    - **Property 6: Round trip penyimpanan skor Memory Flip**
    - **Property 7: Penyimpanan menjaga total dan field game lain**
    - **Property 8: Data tersimpan tidak valid jatuh ke skor awal**
    - Beri komentar tag `Feature: memory-flip-game, Property {nomor}: ...`
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.9**

- [x] 2. Implementasikan fungsi murni gameplay
  - [x] 2.1 Buat `game-1/game.js` bagian konstanta, fungsi murni, dan state
    - Konstanta: `TOTAL_PAIRS`, `GAME_SECONDS`, `POINTS_PER_PAIR`, `MISMATCH_DELAY_MS`, `SUMMARY_DELAY_MS`, `WARNING_THRESHOLD`, `NEXT_PAGE = '../game-2/index.html'`
    - Fungsi: `buildDeck`, `shuffle(arr, rand)` (Fisher-Yates, salinan baru), `evaluateFlip`, `calcScore` (dijepit 0..40), `timerLevel`, `canFlip`
    - Objek `state` dengan phase `intro | playing | locked | finished` dan flag `finished`
    - Ekspos lewat objek `MemoryFlipLogic` dan `module.exports` bila tersedia
    - _Requirements: 3.3, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.3, 7.2, 8.7, 8.8_

  - [ ]* 2.2 Tulis property test pengacakan dan pencocokan di `tests/deck.property.test.js`
    - **Property 1: Pengacakan mempertahankan komposisi dek**
    - **Property 2: Evaluasi pasangan sesuai kesamaan gambar**
    - **Validates: Requirements 3.3, 4.5, 5.2, 5.3**

  - [ ]* 2.3 Tulis property test aturan permainan di `tests/rules.property.test.js`
    - **Property 3: Kartu hanya dapat dibuka pada kondisi yang valid**
    - **Property 4: Skor sama dengan 5 kali jumlah pasangan**
    - **Property 5: Level peringatan timer**
    - **Validates: Requirements 3.1, 5.1, 5.4, 5.5, 5.6, 5.7, 6.3, 6.6, 6.8, 7.2**

- [x] 3. Buat markup dan gaya halaman
  - [x] 3.1 Buat `game-1/index.html`
    - Muat `../vendor/bootstrap/bootstrap.min.css`, `../css/style.css`, lalu skrip `../vendor/bootstrap/bootstrap.bundle.min.js`, `../js/storage.js`, `../js/app.js`, `game.js` (path relatif lokal, tanpa URL eksternal)
    - `#introScreen`: urutan "GAME 01", judul "Memory Flip" (satu `h1`), sub judul, box petunjuk dua paragraf, badge "30 detik", tombol Start
    - `#gameScreen` (`hidden`): `h2` tersembunyi visual, HUD timer dan skor, progress bar, `#board`, `#summary` (`role="status"`, `h3` judul ringkasan)
    - Teks sesuai persis dengan requirements
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 4.8, 8.4, 8.5, 8.10_

  - [x] 3.2 Tambah gaya Memory Flip di `css/style.css`
    - Tambah blok kelas berprefix `flip-` tanpa mengubah kelas Home: `.flip-page` (gradasi dan wave seperti `.home-hero`), `.flip-eyebrow`, `.flip-title`, `.flip-subtitle`, `.flip-instruction`, `.flip-time-badge`, hud, timer, progress, summary
    - Papan: `.flip-board` grid 4 kolom, gap 8px, lebar maks `4 * 100px + 3 * 8px`; `.flip-card` persegi (`aspect-ratio: 1 / 1`), min 44px, radius 12px, bayangan halus
    - Flip 3D: `.flip-card__inner` transisi 0.3s, `.is-open` memutar 180deg, `.flip-card__face` dengan `backface-visibility: hidden`
    - `.flip-card--matched` memakai `--entrasol-green`; `.flip-timer--warning` warna peringatan
    - Mobile-first; teks isi minimal 16px; tanpa scroll horizontal pada 320px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 4.1, 4.2, 4.3, 4.6, 4.7, 5.2, 6.3, 8.1, 8.2, 8.3, 8.9_

- [x] 4. Hubungkan lapisan DOM, timer, dan penyimpanan
  - [x] 4.1 Lengkapi `game-1/game.js` dengan lapisan DOM dan timer
    - `init()`: bind Start, render papan tertutup tanpa interaksi
    - `startGame()`: dijaga `phase === 'intro'`, nonaktifkan Start, acak papan, reset skor dan waktu, tampilkan Game_Screen, mulai `setInterval` 1000 ms
    - `onCardClick(idx)`: cek `canFlip`; buka kartu; evaluasi pasangan; match menandai `flip-card--matched` dan menambah skor; mismatch mengunci 800 ms lalu menutup kartu
    - `tick()`: perbarui angka, progress bar, kelas peringatan; panggil `finishGame('timeout')` di 0
    - `finishGame(reason)`: dijaga flag `finished`; hentikan timer, batalkan timeout mismatch, tutup kartu terbuka tak cocok, `saveGameScore('memoryFlip', calcScore(pairsFound))`, tampilkan ringkasan, `setTimeout(() => navigateTo(NEXT_PAGE), 2000)`
    - Penyimpanan gagal tidak menghalangi ringkasan dan navigasi
    - Render kartu: tombol dengan `aria-label` dan `alt` deskriptif, gambar `assets/back-card.jpg` dan `assets/item-N.jpg`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 4.4, 4.5, 4.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.5, 7.7, 7.8_

  - [ ]* 4.2 Tulis property test untuk `finishGame` di `tests/finish.property.test.js`
    - Mock `saveGameScore` dan `navigateTo` sebagai spy, fake timers
    - **Property 9: Skor disimpan dan navigasi terjadi tepat sekali**
    - **Validates: Requirements 7.8**

  - [ ]* 4.3 Tulis unit test perilaku DOM di `tests/game.unit.test.js`
    - Gunakan jsdom dan fake timers
    - Urutan elemen Intro_Screen dan satu `h1`; Start menampilkan 16 kartu tertutup dan skor 0
    - Timer 30 hingga 0 dan kelas peringatan pada 10 sampai 1
    - Mismatch tertutup setelah 800 ms dan klik ketiga diabaikan
    - Timer habis saat mismatch: kartu ditutup, skor tidak berubah
    - Navigasi ke `../game-2/index.html` setelah 2000 ms, tepat sekali; `setItem` melempar error tetap lanjut
    - _Requirements: 1.2, 1.8, 3.2, 3.5, 3.6, 5.3, 5.4, 5.8, 6.2, 6.3, 6.7, 7.5, 7.7, 8.10_

- [x] 5. Sesuaikan link Home
  - [x] 5.1 Ubah link Start di `index.html` (Home) dari `game1/index.html` ke `game-1/index.html`
    - Cari semua referensi `game1/` di `index.html` dan perbarui; tampilan Home lainnya tidak berubah
    - _Requirements: 8.11_

- [ ] 6. Checkpoint - Pastikan semuanya berjalan
  - Pastikan semua tes yang ada lulus, tanyakan kepada pengguna bila ada pertanyaan.

- [ ] 7. Verifikasi statis akhir
  - [ ]* 7.1 Tulis smoke test statis di `tests/static.smoke.test.js`
    - Pindai `game-1/index.html`, `game-1/game.js`, `css/style.css`: tidak ada `http://`, `https://`, atau `//` untuk aset
    - `localStorage` hanya muncul di `js/storage.js`
    - Urutan skrip dan path relatif benar; `index.html` Home mengarah ke `game-1/index.html`
    - _Requirements: 8.4, 8.5, 8.7, 8.8, 8.11_

- [ ] 8. Final checkpoint - Pastikan semua tes lulus
  - Pastikan semua tes yang ada lulus, tanyakan kepada pengguna bila ada pertanyaan.

## Notes

- Sub-task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task merujuk requirements spesifik untuk keterlacakan
- Property test memvalidasi 9 properti kebenaran dari design; unit test memvalidasi contoh dan edge case
- Berkas uji dan fast-check/jsdom (versi dipin) hanya untuk pengembang; halaman produksi tetap tanpa build step dan dapat dibuka langsung di browser

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1", "3.1", "3.2", "5.1"] },
    { "id": 1, "tasks": ["1.3", "2.2", "2.3", "4.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "7.1"] }
  ]
}
```

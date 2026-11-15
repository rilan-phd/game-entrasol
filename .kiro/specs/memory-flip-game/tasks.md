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
    - Catatan revisi: `SUMMARY_DELAY_MS` dihapus dan konstanta/fungsi baru ditambahkan oleh task 7.1
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
    - `body` berkelas `flip-body`
    - `#introScreen`: urutan "GAME 01", ikon `../assets/icon-game-1.svg` (alt "Ikon game Memory Flip"), judul "Memory Flip" (satu `h1`), sub judul, box petunjuk (berisi `h2` "Cara Bermain" rata tengah, dua paragraf, lalu alert waktu "Waktu bermain: 30 detik" di dalam box), tombol Start
    - Badge waktu di luar box dihapus
    - `#gameScreen` (`hidden`): `h2` tersembunyi visual, HUD timer dan skor, progress bar, `#board`, `#summary` (`role="status"`, `h3` judul ringkasan)
    - Teks sesuai persis dengan requirements
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 4.8, 8.4, 8.5, 8.10_

  - [x] 3.2 Tambah gaya Memory Flip di `css/style.css`
    - Tambah blok kelas berprefix `flip-` tanpa mengubah kelas Home: `.flip-page` (gradasi putih -> biru muda `#A7D8F0` 85% dan wave), `body.flip-body` (latar `rgba(20,26,140,0.15)`), teks utama biru tua, `.flip-eyebrow`, `.flip-icon`, `.flip-title`, `.flip-subtitle`, `.flip-instruction`, `.flip-instruction__title`, `.flip-time-alert` (lebar 100%, latar `rgba(20,26,140,0.12)`, border tipis, radius 0.5rem; menggantikan `.flip-time-badge`), hud, timer, progress, summary
    - Papan: `.flip-board` grid 4 kolom, gap 8px, lebar maks `4 * 100px + 3 * 8px`; `.flip-card` persegi (`aspect-ratio: 1 / 1`), min 44px, radius 12px, bayangan halus
    - Flip 3D: `.flip-card__inner` transisi 0.3s, `.is-open` memutar 180deg, `.flip-card__face` dengan `backface-visibility: hidden`
    - `.flip-card--matched` memakai `--entrasol-green`; `.flip-timer--warning` warna peringatan
    - Mobile-first; teks isi minimal 16px; tanpa scroll horizontal pada 320px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 4.1, 4.2, 4.3, 4.6, 4.7, 5.2, 6.3, 8.1, 8.2, 8.3, 8.9_

- [x] 4. Hubungkan lapisan DOM, timer, dan penyimpanan
  - [x] 4.1 Lengkapi `game-1/game.js` dengan lapisan DOM dan timer
    - `init()`: bind Start, render papan tertutup tanpa interaksi
    - Catatan revisi: interval 1000 ms, ringkasan 2 detik, dan auto-navigasi pada task ini digantikan oleh task 9.1 dan 9.2
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
    - Catatan revisi: digantikan oleh task 9.3 (Property 9 baru, tanpa auto-navigasi); kerjakan task 9.3, bukan versi ini
    - **Validates: Requirements 7.8**

  - [ ]* 4.3 Tulis unit test perilaku DOM di `tests/game.unit.test.js`
    - Gunakan jsdom dan fake timers
    - Urutan elemen Intro_Screen: "GAME 01", ikon, `h1`, sub judul, box petunjuk (`h2` "Cara Bermain", dua paragraf, alert waktu di dalam box), tombol Start; tanpa `.flip-time-badge`; `body` berkelas `flip-body`; satu `h1`; Start menampilkan 16 kartu tertutup dan skor 0
    - Timer 30 hingga 0 dan kelas peringatan pada 10 sampai 1
    - Mismatch tertutup setelah 800 ms dan klik ketiga diabaikan
    - Timer habis saat mismatch: kartu ditutup, skor tidak berubah
    - Navigasi ke `../game-2/index.html` setelah 2000 ms, tepat sekali; `setItem` melempar error tetap lanjut
    - Catatan revisi: butir ringkasan 2 detik dan auto-navigasi digantikan oleh task 9.4; kerjakan task 9.4 untuk perilaku terbaru
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.6, 3.2, 3.5, 3.6, 5.3, 5.4, 5.8, 6.2, 6.3, 6.7, 7.5, 7.7, 8.10_

- [x] 5. Sesuaikan link Home
  - [x] 5.1 Ubah link Start di `index.html` (Home) dari `game1/index.html` ke `game-1/index.html`
    - Cari semua referensi `game1/` di `index.html` dan perbarui; tampilan Home lainnya tidak berubah
    - _Requirements: 8.11_

- [x] 6. Perluas `js/storage.js` untuk Game_Session_State game-1
  - [x] 6.1 Tambah fungsi state game-1 di `js/storage.js`
    - Tambah `GAME1_STATE_KEY = 'entrasol_game1_state'`
    - Implementasikan `isValidGame1State(obj)` dengan aturan validasi ketat (phase, deck 16 angka 1..8 tepat dua kali, cardStatus `closed`/`matched` berpasangan, `pairsFound` konsisten, `deadline` finite, `score` kelipatan 5 pada 0..40 saat `finished`)
    - Implementasikan `saveGame1State(stateObj)` (return `{ ok }`, tidak melempar), `loadGame1State()` (objek valid atau `null`), `clearGame1State()` (tidak melempar)
    - Ubah `resetScore()` agar juga memanggil `clearGame1State()`
    - Ekspos fungsi baru lewat objek global dan `module.exports`; `localStorage` tetap hanya di berkas ini
    - _Requirements: 10.1, 10.15, 10.17, 8.8_

  - [ ]* 6.2 Tulis property test round trip state di `tests/session.property.test.js`
    - Gunakan mock `localStorage` in-memory; `numRuns: 100`
    - **Property 10: Round trip Game_Session_State**
    - **Validates: Requirements 10.17**

  - [ ]* 6.3 Tulis property test penolakan data tidak valid di `tests/session.property.test.js`
    - Mutasi state valid menjadi tidak valid, string non-JSON, dan storage yang melempar error
    - **Property 13: Load menolak data tidak valid**
    - **Validates: Requirements 10.15**

- [x] 7. Tambah fungsi murni revisi di `game-1/game.js`
  - [x] 7.1 Tambah fungsi murni dan konstanta baru
    - Hapus `SUMMARY_DELAY_MS`; tambah `TICK_INTERVAL_MS = 250` dan `COUNTDOWN_AT = 3`
    - Implementasikan `remainingSeconds(deadline, now)` (`clamp(ceil((deadline - now) / 1000), 0, 30)`), `shouldPlayCountdown(prev, next)` (`prev > 3 && next <= 3 && next >= 1`), `serializeState(state, phase)`, dan `restoreState(saved, now)` dengan mode `intro`/`result`/`playing` sesuai desain
    - Ekspos lewat `MemoryFlipLogic` dan `module.exports`; tanpa DOM dan tanpa akses localStorage
    - _Requirements: 9.4, 9.6, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ]* 7.2 Tulis property test sisa waktu dan restore di `tests/restore.property.test.js`
    - **Property 11: Sisa waktu berbasis Deadline**
    - **Property 12: Restore state konsisten**
    - **Validates: Requirements 10.4, 10.6, 10.8, 10.9, 10.15**

  - [ ]* 7.3 Tulis property test countdown di `tests/countdown.property.test.js`
    - **Property 14: Countdown dipicu tepat sekali saat melintasi 3 detik**
    - Catatan revisi: digantikan oleh task 13.2 (Property 14 baru: urutan angka countdown awal dengan `countdownNumber`); butir countdown 3 detik terakhir dan `shouldPlayCountdown` dihapus, jadi kerjakan task 13.2, bukan versi ini
    - **Validates: Requirements 9.4, 9.6**

- [x] 8. Perbarui markup dan gaya untuk Game_Screen dan Result_Screen
  - [x] 8.1 Ubah `game-1/index.html`
    - Ganti `h2` tersembunyi dengan `h2.flip-game-title` "Memory Flip" yang terlihat di paling atas `#gameScreen`
    - Hapus `#summary`
    - Tambah `section#resultScreen.flip-result[hidden]` berisi `h2.flip-result__title` "Memory Flip", `#resultScore` dengan keterangan "point" dan "dari 40", dan tombol `#continueBtn` "Lanjutkan" berkelas `btn btn-entrasol`
    - Pertahankan satu `h1` dan urutan heading logis
    - _Requirements: 4.1, 4.2, 4.3, 11.2, 11.3, 11.4, 11.5, 8.10_

  - [x] 8.2 Ubah `css/style.css`
    - Tambah `.flip-game-title`; sesuaikan padding dan jarak `.flip-game` agar muat pada 320px tanpa scroll horizontal
    - Tambah `.flip-result`, `.flip-result__title`, `.flip-result__score`, `.flip-result__number`, `.flip-result__unit`, `.flip-result__max`
    - Tambah `.flip-result[hidden] { display: none; }` (dan `.flip-game[hidden]` bila perlu); hapus gaya ringkasan yang tidak dipakai
    - _Requirements: 4.1, 4.2, 4.3, 11.2, 11.3, 11.4, 11.5, 11.10, 8.10_

- [x] 9. Refaktor lapisan DOM, timer, audio, dan persistensi di `game-1/game.js`
  - [x] 9.1 Tambah audio dan timer berbasis Deadline
    - Objek `sounds` (`flip`, `match`, `wrong`, `countdown` dari `assets/audio/*.mp3`), `playSound`/`stopSound` yang tidak pernah melempar, dan fallback bila konstruktor `Audio` tidak ada
    - Pemicu: `flip` saat kartu dibuka, `match`, `wrong`, `countdown` saat sisa waktu melintasi 3 (flag `countdownPlayed`), tanpa suara untuk klik yang ditolak `canFlip`
    - Ganti `setInterval` 1000 ms dengan `startTimer()`/`tick()` interval `TICK_INTERVAL_MS` yang menghitung `remainingSeconds(state.deadline, Date.now())` dan merender hanya saat nilai berubah
    - `startGame()` mengatur `deadline = Date.now() + 30000` dan memanggil `saveGame1State(serializeState(state, 'playing'))`; simpan state setelah setiap pasangan cocok
    - _Requirements: 3.4, 3.5, 5.2, 5.3, 6.1, 6.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 10.2, 10.3_

  - [x] 9.2 Implementasikan `init()` dengan restore, `finishGame`, dan Result_Screen
    - `init()` memakai `restoreState(loadGame1State(), Date.now())` untuk mode `intro`, `playing` (pulihkan papan, deadline, `countdownPlayed = secondsLeft <= 3`, jalankan timer), dan `result` (finalize satu kali bila `needsFinalize`, tanpa simpan ulang skor bila sudah `finished`)
    - `finishGame(reason)` dijaga flag `finished`: hentikan timer dan timeout mismatch, `stopSound('countdown')`, `saveGameScore('memoryFlip', calcScore(pairsFound))` tepat sekali, `saveGame1State(serializeState(state, 'finished'))`, lalu `showResult(score)`; tanpa `setTimeout` navigasi dan tanpa `history.pushState`
    - `showResult(score)` mengisi `#resultScore`, menyembunyikan `#introScreen` dan `#gameScreen`, menampilkan `#resultScreen`
    - Bind `#continueBtn` pada semua mode ke `navigateTo(NEXT_PAGE)`
    - Kegagalan penyimpanan tidak menghalangi Result_Screen
    - _Requirements: 3.1, 3.2, 3.6, 5.4, 5.7, 6.6, 6.7, 7.7, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.15, 10.16, 11.1, 11.2, 11.3, 11.6, 11.7, 11.8, 11.9_

  - [ ]* 9.3 Tulis property test `finishGame` di `tests/finish.property.test.js`
    - Mock `saveGameScore` dan `navigateTo` sebagai spy, fake timers
    - **Property 9: Skor disimpan tepat sekali dan tanpa auto-navigasi**
    - **Validates: Requirements 7.7, 10.16, 11.7**

  - [ ]* 9.4 Tulis unit test DOM, audio, restore, dan Result_Screen di `tests/game.unit.test.js`
    - Gunakan jsdom, fake timers, dan mock `Audio`
    - Audio: `flip`, `match`, `wrong` terpicu sesuai kejadian; `countdown` sekali saat melintasi 3 detik; klik ditolak tanpa suara; `play()` yang ditolak tidak mengganggu permainan
    - Catatan revisi: butir audio `countdown` sekali saat melintasi 3 detik digantikan oleh task 13.5 (countdown dipindah ke Countdown_Screen; tidak ada `countdown.mp3` di Game_Screen)
    - Restore: refresh saat `playing` melanjutkan sisa waktu nyata tanpa countdown bila sisa ≤ 3; `deadline` terlewat langsung ke Result_Screen dengan skor tersimpan sekali; `finished` menampilkan Result_Screen tanpa simpan ulang; state rusak kembali ke Intro_Screen
    - Result_Screen: hanya judul, skor dengan "point" dan "dari 40", tombol "Lanjutkan"; tidak ada navigasi otomatis; klik Lanjutkan memanggil `navigateTo('../game-2/index.html')`
    - _Requirements: 3.1, 5.8, 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 9.8, 10.4, 10.8, 10.9, 10.15, 11.2, 11.3, 11.6, 11.7, 11.8_

- [x] 10. Perbarui Home agar memakai helper storage
  - [x] 10.1 Ubah `index.html` (Home)
    - Muat `js/storage.js` sebelum skrip inline tombol Mulai
    - Tombol Mulai: bila `loadGame1State() === null` panggil `resetScore()`, lalu navigasi ke `game-1/index.html`; bila state ada, langsung navigasi tanpa reset
    - Hapus akses `localStorage` langsung dari `index.html`; tampilan Home tidak berubah
    - _Requirements: 10.11, 10.12, 10.13, 10.14, 8.8_

- [~] 11. Checkpoint - Pastikan semuanya berjalan
  - Pastikan semua tes yang ada lulus, tanyakan kepada pengguna bila ada pertanyaan.

- [ ] 12. Verifikasi statis akhir
  - [ ]* 12.1 Tulis smoke test statis di `tests/static.smoke.test.js`
    - Catatan revisi: pemeriksaan khusus Countdown_Screen ditambahkan oleh task 13.6
    - Pindai `index.html`, `game-1/index.html`, `game-1/game.js`, `css/style.css`: tidak ada `http://`, `https://`, atau `//` untuk aset (termasuk URL audio)
    - Path audio hanya relatif lokal (`assets/audio/*.mp3`)
    - `localStorage` hanya muncul di `js/storage.js` (`index.html` Home dan `game-1/game.js` tidak mengaksesnya langsung)
    - `index.html` Home memuat `js/storage.js`
    - Urutan skrip dan path relatif benar; `index.html` Home mengarah ke `game-1/index.html`
    - _Requirements: 8.4, 8.5, 8.7, 8.8, 8.11, 9.8, 10.14_

- [x] 13. Tambah Countdown_Screen sebelum permainan (revisi)
  - [x] 13.1 Tambah fungsi murni `countdownNumber` dan hapus logika countdown 3 detik terakhir di `game-1/game.js`
    - Tambah konstanta `PRE_COUNTDOWN_SECONDS = 3`
    - Implementasikan `countdownNumber(elapsedMs)`: `< 1000` → 3, `< 2000` → 2, `< 3000` → 1, `>= 3000` → 0 (selesai); nilai negatif atau non-finite → 3
    - Ekspos `countdownNumber` dan `PRE_COUNTDOWN_SECONDS` lewat `MemoryFlipLogic` dan `module.exports`
    - Hapus `COUNTDOWN_AT`, `shouldPlayCountdown`, dan properti `countdownPlayed` dari `game.js` (konstanta, fungsi, state, ekspos, serta penggunaannya di `init()` dan `tick()`)
    - _Requirements: 9.4, 9.6, 12.2, 12.14_

  - [ ]* 13.2 Tulis property test countdown awal di `tests/countdown.property.test.js`
    - **Property 14: Urutan angka countdown awal**
    - Untuk tiap tick `k = 0..3` dengan offset acak 0..999, hasilnya 3, 2, 1, lalu 0; monoton menurun untuk nilai finite nonnegatif; 0 jika dan hanya jika `elapsedMs` finite `>= 3000`; negatif/non-finite → 3; `numRuns: 100`
    - Menggantikan task 7.3 lama
    - **Validates: Requirements 12.2, 12.4, 12.14**

  - [x] 13.3 Tambah markup dan CSS Countdown_Screen di `game-1/index.html` dan `css/style.css`
    - Tambah `section#countdownScreen.flip-countdown[hidden]` di dalam `main.flip-page` setelah `#introScreen`, berisi `p.flip-countdown__label` "Bersiap..." dan `div#countdownNumber.flip-countdown__number[role="status"][aria-live="assertive"]` bernilai awal 3; tanpa heading
    - CSS `.flip-countdown`: `position: absolute; inset: 0; z-index` di atas Game_Screen dan wave, flex terpusat kolom, latar `rgba(255, 255, 255, 0.85)`; tambah `.flip-countdown[hidden] { display: none; }`
    - CSS `.flip-countdown__label` (Biru_Tua, bold, 1.125rem) dan `.flip-countdown__number` (8rem, bold, Biru_Tua, `line-height: 1`); animasi pulse ringan opsional lewat CSS saja dan nonaktif pada `prefers-reduced-motion`
    - Di `@media (min-height: 550px)` kecilkan angka dengan `clamp(5rem, calc(20 * var(--dvh)), 8rem)` agar muat tanpa scroll
    - _Requirements: 2.11, 2.12, 2.13, 8.10, 12.1_

  - [x] 13.4 Refaktor alur Start di `game-1/game.js` menjadi dua tahap
    - Tambah phase `countdown` dan `state.countdownId`; ambil elemen `#countdownScreen` dan `#countdownNumber` di `init()`; bind Start ke `beginCountdown`
    - `beginCountdown()`: dijaga `phase === 'intro'`, nonaktifkan Start, `phase = 'countdown'`, sembunyikan Intro_Screen dan tampilkan Game_Screen (papan tertutup, Timer belum jalan), tampilkan overlay di depannya, `playSound('countdown')` sekali, interval berbasis `countdownNumber(Date.now() - t0)` yang memperbarui angka hanya saat berubah; saat hasil 0 bersihkan interval, sembunyikan overlay, panggil `startGame()`; tanpa `saveGame1State` dan tanpa menjalankan Timer
    - `startGame()`: dijaga `phase === 'countdown'`, hanya memulai permainan (acak papan, `deadline = Date.now() + 30000`, simpan state `playing`, tampilkan Game_Screen, `startTimer()`)
    - `tick()` dan `finishGame()` tidak memutar atau menghentikan `countdown.mp3`
    - `cancelCountdown()` pada `pagehide`: `clearInterval`, `countdownId = null`, `stopSound('countdown')`; kegagalan audio tidak menghentikan hitung mundur
    - Restore sesi (`playing`/`finished`) tidak menampilkan Countdown_Screen
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 9.4, 9.5, 9.6, 9.7, 9.8, 10.2, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13_

  - [ ]* 13.5 Tulis unit test Countdown_Screen di `tests/game.unit.test.js`
    - Gunakan jsdom, fake timers, `Date.now` palsu, dan mock `Audio`
    - Countdown 3 detik (angka 3, 2, 1) lalu game mulai; Start ganda diabaikan; `countdown.mp3` diputar sekali dan tidak pernah di Game_Screen; Deadline = saat permainan dimulai + 30000 (bukan saat Start); Timer dan state belum tersimpan selama countdown; Card tidak dapat dibuka saat countdown; refresh saat countdown kembali ke Intro_Screen; `pagehide` membersihkan interval dan menghentikan audio; audio ditolak tetap lanjut; restore tidak menampilkan countdown
    - Menggantikan butir audio countdown 3 detik terakhir di task 9.4
    - _Requirements: 3.1, 3.2, 3.4, 3.6, 9.4, 9.5, 9.6, 9.8, 10.2, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.11, 12.12, 12.13_

  - [ ]* 13.6 Perbarui smoke test statis di `tests/static.smoke.test.js`
    - Pastikan `#countdownScreen` berada di dalam `main.flip-page`, ber-`hidden`, tanpa heading, `#countdownNumber` ber-`role="status"` dan `aria-live="assertive"`; `PRE_COUNTDOWN_SECONDS = 3`; `COUNTDOWN_AT`, `shouldPlayCountdown`, `countdownPlayed` tidak ada di `game.js`; `.flip-countdown[hidden]` ada di CSS; tetap tanpa URL eksternal
    - _Requirements: 8.5, 8.10, 9.6, 12.1_

- [~] 14. Final checkpoint - Pastikan semua tes lulus
  - Pastikan semua tes yang ada lulus, tanyakan kepada pengguna bila ada pertanyaan.

## Notes

- Sub-task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task merujuk requirements spesifik untuk keterlacakan
- Property test memvalidasi 14 properti kebenaran dari design (Property 14 kini tentang urutan angka countdown awal); unit test memvalidasi contoh dan edge case
- Task 13 adalah revisi Countdown_Screen; task 7.3 digantikan oleh 13.2, dan butir countdown 3 detik terakhir pada 9.4 digantikan oleh 13.5
- Berkas uji dan fast-check/jsdom (versi dipin) hanya untuk pengembang; halaman produksi tetap tanpa build step dan dapat dibuka langsung di browser

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.3", "2.2", "2.3", "6.2", "7.2", "7.3", "13.1", "13.3"] },
    { "id": 1, "tasks": ["6.3", "9.3", "13.2", "13.4"] },
    { "id": 2, "tasks": ["4.2", "9.4", "12.1"] },
    { "id": 3, "tasks": ["4.3", "13.6"] },
    { "id": 4, "tasks": ["13.5"] }
  ]
}
```
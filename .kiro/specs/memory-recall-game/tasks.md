# Implementation Plan: Memory Recall Game

## Overview

Implementasi game kedua Memory Recall di `game-2/` memakai HTML, CSS (Bootstrap 5 lokal + `css/style.css`), dan JavaScript vanilla, mengikuti pola game-1. Urutan kerja: helper state game-2 di `js/storage.js`, fungsi murni di `game-2/game.js`, markup dan gaya (tema hijau, fit-to-viewport), lalu lapisan DOM/timer/audio/restore. Bahasa implementasi: JavaScript (sesuai desain). Pengujian properti memakai fast-check dan dijalankan di Node hanya sebagai alat pengembang, terpisah di folder `tests/` (folder ini belum ada di repo dan dibuat saat tugas pengujian dikerjakan). Aset yang dipakai apa adanya: `game-2/assets/{1-a,1-b,2-a,2-b}.jpg`, `checked.png`, `wrong.png`, `times-up.png`, `audio/countdown.mp3`, dan `assets/icon-game-2.svg`.

## Tasks

- [x] 1. Perluas helper global LocalStorage untuk state game-2
  - [x] 1.1 Tambah fungsi state game-2 di `js/storage.js`
    - Tambah `GAME2_STATE_KEY = 'entrasol_game2_state'`
    - Implementasikan `isValidGame2State(obj)` sesuai aturan di desain (phase `playing`/`finished`, `targetId` string tak kosong, `optionIds` 3 string unik memuat `targetId`, `memorizeEnd`/`answerEnd` finite dengan `answerEnd > memorizeEnd`, `result` dan `score` konsisten saat `finished`)
    - Implementasikan `saveGame2State` (return `{ ok }`, tidak melempar), `loadGame2State` (objek valid atau `null`), `clearGame2State` (tidak melempar)
    - Ubah `resetScore()` agar juga memanggil `clearGame2State()`
    - Ekspos fungsi baru lewat objek global dan `module.exports`; `localStorage` tetap hanya di berkas ini
    - _Requirements: 8.5, 9.1, 9.8, 9.12, 11.2_

  - [ ]* 1.2 Tulis property test state di `tests/session2.property.test.js`
    - Mock `localStorage` in-memory dan varian yang melempar error; `numRuns: 100`
    - **Property 8: Round trip Game_Session_State**
    - **Property 10: Load menolak data tidak valid**
    - Beri komentar tag `Feature: memory-recall-game, Property {nomor}: ...`
    - **Validates: Requirements 9.8, 9.12**

  - [ ]* 1.3 Tulis property test penyimpanan skor di `tests/score2.property.test.js`
    - **Property 6: Round trip dan konsistensi penyimpanan skor Memory Recall**
    - Tambahkan unit test: `resetScore` menghapus state game-1 dan game-2
    - **Validates: Requirements 8.2, 8.4, 11.2, 11.3**

- [x] 2. Implementasikan fungsi murni gameplay
  - [x] 2.1 Buat `game-2/game.js` bagian konstanta, `CARD_IMAGES`, fungsi murni, dan state
    - Konstanta: `MEMORIZE_SECONDS = 5`, `ANSWER_SECONDS = 5`, `PRE_COUNTDOWN_SECONDS = 3`, `TICK_INTERVAL_MS = 250`, `WARNING_THRESHOLD = 2`, `MAX_SCORE = 30`, `NEXT_PAGE = '../game-3/index.html'`
    - `CARD_IMAGES` sebagai satu-satunya daftar gambar: `1-a`, `1-b`, `2-a`, `2-b` dengan `group` (`1` untuk `1-a`/`1-b`, `2` untuk `2-a`/`2-b`), `src` `assets/<id>.jpg`, dan `alt` deskriptif (Active Choco Delight, Active Vanilla Latte, Gold Chocolate, Gold Vanilla)
    - Fungsi: `shuffle(arr, rand)`, `buildRound(images, rand)` (target dipilih dari gambar yang punya saudara satu `group`; pilihan = target + saudara sejenis + satu gambar dari grup lain, posisi diacak; null bila tidak ada kandidat; tidak mengubah `images`), `gradeAnswer`, `calcScore`, `resultIconFor`, `countdownNumber`, `remainingSeconds`, `phaseTimerLevel`, `canChoose`, `serializeState`, `restoreState`
    - Objek `state` dengan phase `intro | countdown | memorize | answer | finished` dan flag `finished`
    - Ekspos lewat `MemoryRecallLogic` dan `module.exports` bila tersedia; tanpa DOM dan tanpa akses localStorage pada bagian ini
    - _Requirements: 3.11, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.6, 6.10, 7.1, 7.2, 7.5, 7.6, 7.7, 9.13, 10.9_

  - [ ]* 2.2 Tulis property test countdown di `tests/countdown2.property.test.js`
    - **Property 1: Urutan angka countdown awal**
    - **Validates: Requirements 3.2, 3.11**

  - [ ]* 2.3 Tulis property test `buildRound` di `tests/round.property.test.js`
    - **Property 2: Round yang dibentuk selalu valid**
    - Tambahkan unit test: target `1-a` selalu disertai `1-b` dan satu dari `2-a`/`2-b`; target `2-b` selalu disertai `2-a`; tanpa gambar bersaudara atau tanpa grup lain menghasilkan `null`
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.4**

  - [ ]* 2.4 Tulis property test penilaian dan guard di `tests/rules2.property.test.js`
    - **Property 3: Penilaian all-or-nothing**
    - **Property 5: Pemilihan hanya diterima pada Fase_Memilih**
    - **Validates: Requirements 5.4, 6.8, 6.9, 7.1, 7.2**

  - [ ]* 2.5 Tulis property test waktu di `tests/time2.property.test.js`
    - **Property 4: Sisa waktu fase berbasis waktu absolut**
    - **Validates: Requirements 5.3, 5.6, 6.5, 6.10**

  - [ ]* 2.6 Tulis property test restore di `tests/restore2.property.test.js`
    - **Property 9: Restore state konsisten terhadap waktu**
    - **Validates: Requirements 9.4, 9.5, 9.6, 9.7, 9.13**

- [x] 3. Buat markup dan gaya halaman
  - [x] 3.1 Buat `game-2/index.html`
    - Muat `../vendor/bootstrap/bootstrap.min.css`, `../css/style.css`, lalu skrip `../vendor/bootstrap/bootstrap.bundle.min.js`, `../js/storage.js`, `../js/app.js`, `game.js` (path relatif lokal, tanpa URL eksternal)
    - `body` berkelas `recall-body`; `main.recall-page`
    - `#introScreen`: "GAME 02", ikon `../assets/icon-game-2.svg` (alt deskriptif), `h1` "Memory Recall", sub judul "Amati baik-baik gambar yang muncul di layar.", Instruction_Box (dua paragraf persis sesuai requirements + Time_Alert berisi dua keterangan waktu), tombol `#startBtn` "Mulai" berkelas `btn btn-recall`
    - `#countdownScreen[hidden]` di dalam `main.recall-page`: "Bersiap..." dan `#countdownNumber` (`role="status"`, `aria-live="assertive"`), tanpa heading
    - `#gameScreen[hidden]`: `h2` "Memory Recall", `#phaseBadge`, `#timerText`, progress bar `#timerBar`, `#prompt`, `#stage`
    - `#resultScreen[hidden]`: `h2` "Memory Recall", `img#resultIcon` (alt awal "Jawaban benar"), `#resultScore` dengan "point" dan "dari 30", tombol `#continueBtn` "Lanjutkan"
    - Satu `h1` saja; semua gambar ber-`alt` deskriptif
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 3.3, 3.4, 7.4, 10.7, 10.8, 10.10_

  - [x] 3.2 Tambah gaya tema hijau di `css/style.css`
    - Tambah blok kelas berprefix `recall-` tanpa mengubah kelas Home dan `flip-`: `body.recall-body` (`rgba(139,195,74,0.2)`), `.recall-page` (gradasi putih → `rgba(139,195,74,0.45)`, container 430px, wave lewat `::after`), `.recall-intro`, `.recall-eyebrow`, `.recall-icon`, `.recall-title`, `.recall-subtitle`, `.recall-instruction` (border hijau 2px), `.recall-time-alert` (dua baris, radius 0.5rem, bukan pill)
    - `.btn-recall`: pill hijau `--entrasol-green` dengan teks Biru_Tua, `min-height: 48px`, hover/fokus sedikit lebih gelap dengan kontras tetap memadai
    - `.recall-countdown` (overlay `absolute; inset: 0`, latar `rgba(255,255,255,0.85)`, angka 8rem bold, pulse nonaktif pada `prefers-reduced-motion`), `.recall-countdown[hidden]`
    - `.recall-game`, `.recall-game-title`, `.recall-badge--memorize` (Biru_Muda + teks Biru_Tua), `.recall-badge--answer` (Biru_Tua + teks putih), `.recall-timer`, `.recall-timer--warning`, `.recall-progress`, `.recall-prompt`
    - Gambar: `--recall-img: min(calc(50% - 8px), 280px)`; `.recall-frame`, `.recall-frame--empty`, `.recall-option` (persegi, margin 4px, border hijau 3px, radius 12px, bayangan halus, `:focus-visible`), `.recall-img`, `.recall-pyramid` (kolom terpusat), `.recall-row` (flex terpusat)
    - `.recall-result`, `__title`, `__icon`, `__score`, `__number`, `__unit`, `__max`
    - `[hidden]` untuk `.recall-intro`, `.recall-game`, `.recall-result`, `.recall-countdown`
    - Mobile-first; teks isi minimal 16px; tanpa scroll horizontal pada 320px; tanpa utility spasi Bootstrap `!important` pada elemen yang harus mengecil
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 3.3, 5.1, 5.2, 6.1, 6.2, 6.3, 10.5, 10.6, 10.11, 10.12_

  - [x] 3.3 Tambah aturan fit-to-viewport game-2 di `css/style.css`
    - Di dalam `@media (min-height: 550px)` yang sudah ada: tambah `.recall-page` ke aturan tinggi container (`height: calc(100 * var(--dvh)); min-height: 0; overflow-x: hidden; overflow-y: auto`) dan padding `calc(2 * var(--dvh)) 1rem`
    - `.recall-intro`, `.recall-game`, `.recall-result`: `flex: 1 1 auto; min-height: 0; justify-content: center; justify-content: safe center`
    - `.recall-game { --recall-img: min(calc(50% - 8px), 280px, calc((100 * var(--dvh) - 215px) / 2)); }`
    - Ukuran font, ikon, badge, timer, jarak, dan ikon hasil memakai `clamp(min, calc(N * var(--dvh)), max)` dengan `max` ukuran desain penuh; angka countdown `clamp(5rem, calc(20 * var(--dvh)), 8rem)`
    - Di luar media query itu (tinggi < 550px), container memakai `min-height: 100svh` dan boleh scroll
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 4. Hubungkan lapisan DOM, timer, audio, dan penyimpanan
  - [x] 4.1 Lengkapi `game-2/game.js` dengan audio, render, restore, dan hasil
    - Objek `sounds` hanya untuk `countdown` (`assets/audio/countdown.mp3`) dengan `playSound`/`stopSound` yang tidak pernah melempar dan fallback bila `Audio` tidak ada
    - Render: `renderEmptyStage()` (bingkai kosong tanpa gambar), `renderMemorize()` (Phase_Badge "Hafalkan!", prompt "Perhatikan gambar berikut", satu `.recall-frame` berisi Target_Image), `renderAnswer()` (Phase_Badge "Jawab sekarang!", prompt "Pilih gambar yang tepat", Pyramid_Layout 1 + 2 dari `round.optionIds` berupa `button.recall-option` dengan `aria-label` deskriptif), `renderTimer()` (angka, progress bar, kelas peringatan lewat `phaseTimerLevel`)
    - `showResult(status, score)`: isi `#resultIcon` lewat `resultIconFor`, isi `#resultScore`, sembunyikan Intro/Game, tampilkan Result; tanpa `history.pushState`
    - `init()` memakai `restoreState(loadGame2State(), Date.now())`: mode `intro` (nonaktifkan Mulai bila `buildRound` null, bind Mulai dan `pagehide`), `playing` (set round dan batas waktu, tampilkan tahap `memorize` atau `answer`, jalankan timer; id yang tidak ada di `CARD_IMAGES` → `clearGame2State()` dan Intro), `result` (finalisasi sekali bila `needsFinalize`; tanpa simpan ulang bila sudah `finished`)
    - Bind `#continueBtn` pada semua mode ke `navigateTo(NEXT_PAGE)`
    - _Requirements: 3.5, 3.9, 3.10, 4.7, 4.8, 5.1, 5.2, 5.4, 6.1, 6.2, 6.3, 6.4, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 9.4, 9.5, 9.6, 9.7, 9.8, 9.11, 10.10_

  - [x] 4.2 Implementasikan alur Mulai → Countdown → Fase_Mengingat → Fase_Memilih di `game-2/game.js`
    - `beginCountdown()`: dijaga `phase === 'intro'`, nonaktifkan Mulai, sembunyikan Intro, tampilkan Game_Screen dengan `renderEmptyStage()` dan overlay, `playSound('countdown')` sekali, interval berbasis `countdownNumber(Date.now() - t0)` yang memperbarui angka hanya saat berubah; di 0 sembunyikan overlay lalu `startGame()`; tanpa `saveGame2State`
    - `cancelCountdown()` pada `pagehide`: bersihkan interval dan `stopSound('countdown')`
    - `startGame()`: dijaga `phase === 'countdown'`; `round = buildRound(CARD_IMAGES, Math.random)`; `memorizeEnd = Date.now() + 5000`; `answerEnd = memorizeEnd + 5000`; `saveGame2State(serializeState(state, 'playing'))`; `enterMemorize()`; `startTimer()`
    - `startTimer()`/`tick()` interval 250 ms: hitung `remainingSeconds` dari waktu absolut fase aktif, render hanya saat nilai berubah; `now >= memorizeEnd` → `enterAnswer()` otomatis tanpa tombol; `now >= answerEnd` → `finishGame('timeout')`
    - Tidak ada pemutaran `countdown.mp3` di Game_Screen
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 5.3, 5.5, 6.5, 6.7, 9.2, 9.9_

  - [x] 4.3 Implementasikan pemilihan dan `finishGame` di `game-2/game.js`
    - `onOptionClick(id)`: abaikan bila `!canChoose(state)`; selain itu `finishGame(gradeAnswer(round.targetId, id))`
    - `finishGame(status)` dijaga flag `finished`: hentikan timer, `saveGameScore('memoryRecall', calcScore(status))` tepat sekali (dalam `try/catch`), `saveGame2State(serializeState(state, 'finished'))`, lalu `showResult(status, score)`; tanpa `setTimeout` navigasi
    - Kegagalan penyimpanan tidak menghalangi Result_Screen
    - Panggil `init()` pada `DOMContentLoaded` hanya bila `document` tersedia
    - _Requirements: 6.6, 6.7, 6.8, 6.9, 7.1, 7.2, 7.3, 7.9, 8.1, 8.3, 9.3_

  - [ ]* 4.4 Tulis property test `finishGame` di `tests/finish2.property.test.js`
    - Mock `saveGameScore` dan `navigateTo` sebagai spy, fake timers
    - **Property 7: Skor disimpan tepat sekali dan tanpa auto-navigasi**
    - **Validates: Requirements 6.9, 7.9, 8.1**

  - [ ]* 4.5 Tulis unit test DOM, audio, dan restore di `tests/game2.unit.test.js`
    - Gunakan jsdom, fake timers, `Date.now` palsu, dan mock `Audio`
    - Intro_Screen: urutan elemen dan teks sesuai requirements, `body.recall-body`, satu `h1`
    - Countdown: angka 3-2-1, Mulai nonaktif dan ganda diabaikan, stage kosong, tidak ada state tersimpan, audio sekali, `pagehide` membersihkan interval, audio ditolak tetap lanjut
    - Fase_Mengingat: satu Target_Image, badge dan prompt benar, tanpa Option_Image, beralih otomatis setelah 5 detik
    - Fase_Memilih: tiga `button.recall-option` dalam baris 1 + 2, memuat target tepat sekali, klik langsung ke Result_Screen, tanpa klik 5 detik → `timeout`
    - Result_Screen: ikon/alt per status, skor 30/0, tidak ada navigasi otomatis, Lanjutkan memanggil `navigateTo('../game-3/index.html')`
    - Restore: tahap `memorize`/`answer`, `answerEnd` terlewat menyimpan skor 0 sekali, `finished` tanpa simpan ulang, state rusak atau id tak dikenal → Intro; `setItem` melempar error tetap menampilkan Result_Screen
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 3.1, 3.2, 3.5, 3.6, 3.8, 3.9, 3.10, 5.1, 5.4, 5.5, 6.1, 6.2, 6.6, 6.7, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

- [x] 5. Checkpoint - Pastikan semuanya berjalan
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Verifikasi statis akhir
  - [ ]* 6.1 Tulis smoke test statis di `tests/static2.smoke.test.js`
    - Pindai `game-2/index.html`, `game-2/game.js`, `css/style.css`: tidak ada `http://`, `https://`, atau `//` untuk aset
    - `localStorage` hanya muncul di `js/storage.js`
    - Urutan skrip dan path relatif benar; `#countdownScreen` ada di dalam `main.recall-page`, ber-`hidden`, tanpa heading, `#countdownNumber` ber-`role="status"` dan `aria-live="assertive"`
    - `CARD_IMAGES` terdefinisi sekali dan seluruh berkas aset yang dirujuk (gambar kartu, ikon hasil, audio, `assets/icon-game-2.svg`) ada di disk
    - `.recall-*[hidden]` dan blok `@media (min-height: 550px)` untuk `.recall-page` ada di CSS
    - _Requirements: 3.4, 4.1, 8.5, 10.1, 10.7, 10.8, 10.9_

- [x] 7. Final checkpoint - Pastikan semua tes lulus
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Sub-task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task merujuk requirements spesifik untuk keterlacakan
- Property test memvalidasi 10 properti kebenaran dari design; unit test memvalidasi contoh dan edge case
- Berkas uji dan fast-check/jsdom (versi dipin) hanya untuk pengembang; halaman produksi tetap tanpa build step dan dapat dibuka langsung di browser
- Setelah selesai, uji manual tiap tampilan pada tinggi sekitar 550-560px (mis. 375×553) untuk memastikan tanpa scroll vertikal

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "3.2"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "2.3", "2.4", "2.5", "2.6", "3.3", "4.1"] },
    { "id": 2, "tasks": ["4.2"] },
    { "id": 3, "tasks": ["4.3"] },
    { "id": 4, "tasks": ["4.4", "4.5", "6.1"] }
  ]
}
```

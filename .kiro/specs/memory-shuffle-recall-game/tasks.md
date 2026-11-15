# Implementation Plan: Memory Shuffle & Recall Game

## Overview

Implementasi game ketiga Memory Shuffle & Recall di `game-3/` memakai HTML, CSS (Bootstrap 5 lokal + `css/style.css`), dan JavaScript vanilla, mengikuti pola game-1 dan game-2. Urutan kerja: helper state game-3 di `js/storage.js`, fungsi murni di `game-3/game.js`, markup dan gaya (tema cyan, fit-to-viewport), lalu lapisan DOM/timer/audio/animasi/restore. Bahasa implementasi: JavaScript (sesuai desain). Pengujian properti memakai fast-check dan dijalankan di Node hanya sebagai alat pengembang, terpisah di folder `tests/`. Aset yang dipakai apa adanya: `game-3/assets/zaitun/zaitun-1..3.jpg`, `product/product-1..10.jpg`, `organ/organ-1..3.jpg`, `checked.png`, `wrong.png`, `audio/flip.mp3`, `audio/countdown.mp3`, dan `assets/icon-game-3.svg`.

## Tasks

- [x] 1. Perluas helper global LocalStorage untuk state game-3
  - [x] 1.1 Tambah fungsi state game-3 di `js/storage.js`
    - Tambah `GAME3_STATE_KEY = 'entrasol_game3_state'`
    - Implementasikan `isValidGame3State(obj)` sesuai tabel aturan di desain (phase `playing`/`finished`, `originalOrder` 3 string unik, `optionOrder` permutasi yang tidak identik, `memorizeEnd`/`answerEnd` finite dengan `answerEnd > memorizeEnd`, `picks` 0..3 string unik dari `originalOrder`, `score` konsisten dengan `picks` saat `finished`)
    - Implementasikan `saveGame3State` (return `{ ok }`, tidak melempar), `loadGame3State` (objek valid atau `null`), `clearGame3State` (tidak melempar)
    - Ubah `resetScore()` agar juga memanggil `clearGame3State()`
    - Ekspos fungsi baru lewat objek global dan `module.exports`; `localStorage` tetap hanya di berkas ini
    - _Requirements: 9.5, 10.1, 10.9, 10.13, 12.2_

  - [ ]* 1.2 Tulis property test state di `tests/session3.property.test.js`
    - Mock `localStorage` in-memory dan varian yang melempar error; `numRuns: 100`
    - **Property 10: Round trip Game_Session_State**
    - **Property 12: Load menolak data tidak valid**
    - Beri komentar tag `Feature: memory-shuffle-recall-game, Property {nomor}: ...`
    - **Validates: Requirements 10.9, 10.13**

  - [ ]* 1.3 Tulis property test penyimpanan skor di `tests/storage3.property.test.js`
    - **Property 8: Round trip dan konsistensi penyimpanan skor Memorize**
    - Tambahkan unit test: `resetScore` menghapus state game-1, game-2, dan game-3
    - **Validates: Requirements 9.2, 9.4, 12.3**

- [x] 2. Implementasikan fungsi murni gameplay
  - [x] 2.1 Buat `game-3/game.js` bagian konstanta, `CARD_IMAGES`, fungsi murni, dan state
    - Konstanta: `MEMORIZE_SECONDS = 5`, `ANSWER_SECONDS = 5`, `PRE_COUNTDOWN_SECONDS = 3`, `TICK_INTERVAL_MS = 250`, `WARNING_THRESHOLD = 2`, `POINTS_PER_SLOT = 10`, `SLOT_COUNT = 3`, `FLY_MS = 400`, `FINISH_DELAY_MS = 450`, `FINISH_DELAY_REDUCED_MS = 250`, `CATEGORIES = ['zaitun', 'product', 'organ']`, `NEXT_PAGE = '../result.html'`
    - `CARD_IMAGES` sebagai satu-satunya daftar gambar: `zaitun-1..3`, `product-1..10`, `organ-1..3` dengan `category`, `src` `assets/<kategori>/<id>.jpg`, dan `alt` deskriptif
    - Fungsi: `shuffle(arr, rand)`, `buildRound(images, rand)` (satu gambar acak per kategori, `originalOrder` acak, `optionOrder` dari lima permutasi non-identitas; `null` bila ada kategori kosong; tidak mengubah `images`), `gradeSlots`, `calcScore`, `addPick`, `canPick`, `buildResultSlots`, `countdownNumber`, `remainingSeconds`, `phaseTimerLevel`, `serializeState`, `restoreState`
    - Objek `state` dengan phase `intro | countdown | memorize | answer | finished`, `picks`, `locked`, `finished`, `pendingTimeouts`
    - Ekspos lewat `MemoryShuffleLogic` dan `module.exports` bila tersedia; tanpa DOM dan tanpa akses localStorage pada bagian ini
    - _Requirements: 3.11, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.8, 6.9, 6.12, 7.1, 7.2, 7.3, 7.4, 7.5, 8.3, 8.4, 8.5, 8.6, 10.14_

  - [ ]* 2.2 Tulis property test countdown di `tests/countdown3.property.test.js`
    - **Property 1: Urutan angka countdown awal**
    - **Validates: Requirements 3.2, 3.11**

  - [ ]* 2.3 Tulis property test `buildRound` di `tests/round3.property.test.js`
    - **Property 2: Round yang dibentuk selalu valid**
    - Tambahkan unit test pada `CARD_IMAGES` asli: satu gambar per kategori, kategori kosong menghasilkan `null`
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

  - [ ]* 2.4 Tulis property test penilaian di `tests/score3.property.test.js`
    - **Property 3: Penilaian per Slot**
    - **Property 4: Susunan lengkap tidak pernah bernilai 20**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

  - [ ]* 2.5 Tulis property test waktu di `tests/time3.property.test.js`
    - **Property 5: Sisa waktu fase berbasis waktu absolut**
    - **Validates: Requirements 5.4, 5.7, 6.5, 6.13**

  - [ ]* 2.6 Tulis property test pemilihan kartu di `tests/picks3.property.test.js`
    - **Property 6: Pemilihan kartu mengikuti urutan klik**
    - **Validates: Requirements 6.6, 6.8, 6.9, 6.12**

  - [ ]* 2.7 Tulis property test Result_Slot di `tests/resultslots3.property.test.js`
    - **Property 7: Result_Slot konsisten dengan penilaian**
    - **Validates: Requirements 8.3, 8.4, 8.5, 8.6**

  - [ ]* 2.8 Tulis property test restore di `tests/restore3.property.test.js`
    - **Property 11: Restore state konsisten terhadap waktu dan picks**
    - **Validates: Requirements 10.5, 10.6, 10.7, 10.8, 10.14**

- [x] 3. Buat markup dan gaya halaman
  - [x] 3.1 Buat `game-3/index.html`
    - Muat `../vendor/bootstrap/bootstrap.min.css`, `../css/style.css`, lalu skrip `../vendor/bootstrap/bootstrap.bundle.min.js`, `../js/storage.js`, `../js/app.js`, `game.js` (path relatif lokal, tanpa URL eksternal)
    - `body` berkelas `shuffle-body`; `main.shuffle-page`
    - `#introScreen`: "GAME 03", ikon `../assets/icon-game-3.svg` (alt deskriptif), `h1` "Memory Shuffle & Recall", sub judul "Ingat posisi kartu dan susun kembali urutannya!", Instruction_Box (dua paragraf persis sesuai requirements + Time_Alert dua keterangan waktu), tombol `#startBtn` "Mulai" berkelas `btn btn-entrasol`
    - `#countdownScreen[hidden]` di dalam `main.shuffle-page`: "Bersiap..." dan `#countdownNumber` (`role="status"`, `aria-live="assertive"`), tanpa heading
    - `#gameScreen[hidden]`: `h2` "Memory Shuffle & Recall", `#phaseBadge`, `#timerText`, progress bar `#timerBar`, `#slots[hidden]`, `#prompt`, `#cards`
    - `#resultScreen[hidden]`: `h2`, `#resultSlots`, `#resultScore` dengan "point" dan "dari 30", tombol `#continueBtn` "Lihat Hasil" berkelas `btn btn-entrasol`
    - Satu `h1` saja; semua gambar ber-`alt` deskriptif
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 3.3, 3.4, 8.2, 8.7, 8.8, 11.7, 11.8, 11.9_

  - [x] 3.2 Tambah gaya tema cyan di `css/style.css`
    - Tambah blok kelas berprefix `shuffle-` tanpa mengubah kelas Home, `flip-`, dan `recall-`: `body.shuffle-body` (`rgba(0,188,212,0.15)`), `.shuffle-page` (gradasi putih → `rgba(0,188,212,0.35)`, container 430px, wave lewat `::after`), `.shuffle-intro`, `.shuffle-eyebrow`, `.shuffle-icon`, `.shuffle-title`, `.shuffle-subtitle`, `.shuffle-instruction` (border 2px, radius ≥ 8px), `.shuffle-time-alert` (dua baris, radius 0.5rem, bukan pill)
    - Tombol memakai `btn-entrasol` yang sudah ada dengan `min-height: 48px` dan `min-width: 44px`
    - `.shuffle-countdown` (overlay `absolute; inset: 0`, latar `rgba(255,255,255,0.85)`, angka 8rem bold, pulse nonaktif pada `prefers-reduced-motion`)
    - `.shuffle-game`, `.shuffle-game-title`, `.shuffle-badge--memorize` (Biru_Muda + teks Biru_Tua), `.shuffle-badge--answer` (Biru_Tua + teks putih), `.shuffle-timer`, `.shuffle-timer--warning`, `.shuffle-progress`, `.shuffle-prompt`
    - Kartu: `--shuffle-card: min(calc((100% - 8px) / 3), 220px)`; `.shuffle-slots`, `.shuffle-cards`, `.shuffle-result__slots` (flex, gap 4px); `.shuffle-frame`, `.shuffle-option`, `.shuffle-slot` (persegi, border Biru_Muda atau Hijau_Muda, radius 12px, `:focus-visible`), `.shuffle-slot__num`, `.shuffle-slot--filled`, `.shuffle-option--used` (`visibility: hidden`), `.shuffle-option--flying` (transisi transform 0.4s), `.shuffle-img`, `.shuffle-frame--empty`
    - Jarak Fase_Menyusun: 16px Slot ke teks arahan, 8px teks arahan ke kartu
    - `.shuffle-result`, `__title`, `.shuffle-result-slot`, `__icon`, `__score`, `__number`, `__unit`, `__max`; tombol berjarak 16px di bawah skor
    - `[hidden]` untuk `.shuffle-intro`, `.shuffle-game`, `.shuffle-result`, `.shuffle-countdown`, `.shuffle-slots`
    - `@media (prefers-reduced-motion: reduce)`: hapus pulse dan transisi terbang
    - Mobile-first; teks isi minimal 16px; tanpa scroll horizontal pada 320px; tanpa utility spasi Bootstrap `!important` pada elemen yang harus mengecil
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.3, 5.2, 5.3, 6.2, 6.3, 6.4, 6.7, 8.8, 8.11, 11.5, 11.6, 11.10, 11.11_

  - [x] 3.3 Tambah aturan fit-to-viewport game-3 di `css/style.css`
    - Di dalam `@media (min-height: 550px)` yang sudah ada: tambah `.shuffle-page` ke aturan tinggi container (`height: calc(100 * var(--dvh)); min-height: 0; overflow-x: hidden; overflow-y: auto`) dan padding `calc(2 * var(--dvh)) 1rem`
    - `.shuffle-intro`, `.shuffle-game`, `.shuffle-result`: `flex: 1 1 auto; min-height: 0; justify-content: center; justify-content: safe center`
    - `.shuffle-game, .shuffle-result { --shuffle-card: min(calc((100% - 8px) / 3), 220px, calc((100 * var(--dvh) - 215px) / 2)); }`
    - Ukuran font, ikon, badge, timer, jarak, dan ikon hasil memakai `clamp(min, calc(N * var(--dvh)), max)` dengan `max` ukuran desain penuh; angka countdown `clamp(5rem, calc(20 * var(--dvh)), 8rem)`
    - Di luar media query itu (tinggi < 550px), container memakai `min-height: 100svh` dan boleh scroll
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 4. Hubungkan lapisan DOM, timer, audio, animasi, dan penyimpanan
  - [x] 4.1 Lengkapi `game-3/game.js` dengan audio, render, restore, dan hasil
    - Objek `sounds` untuk `countdown` dan `flip` dengan `playSound`/`stopSound` yang tidak pernah melempar dan fallback bila `Audio` tidak ada
    - Render: `renderEmptyStage()` (bingkai kosong tanpa gambar), `renderMemorize()` (badge "Hafalkan!", prompt "Perhatikan gambar berikut dan urutannya", tiga `.shuffle-frame` sesuai `originalOrder`, `#slots` tersembunyi), `renderAnswer()` (badge "Jawab sekarang!", tiga Slot bernomor, prompt "Pilih gambar dengan urutan yang tepat", tiga `button.shuffle-option` dari `optionOrder` dengan `aria-label` deskriptif), `renderTimer()` (angka, progress bar, kelas peringatan lewat `phaseTimerLevel`)
    - `showResult(originalOrder, picks, score)`: isi `#resultSlots` dari `buildResultSlots` (gambar atau kotak kosong bernomor, ikon, `alt`) dan `#resultScore`, sembunyikan Intro/Game/Countdown, tampilkan Result; tanpa `history.pushState`
    - `init()` memakai `restoreState(loadGame3State(), Date.now())`: mode `intro` (nonaktifkan Mulai bila `buildRound` null, bind Mulai dan `pagehide`), `playing` (set round, picks, dan batas waktu, tampilkan tahap `memorize` atau `answer` dengan Slot terisi tanpa animasi, jalankan timer; id tidak dikenal atau bukan tiga kategori berbeda → `clearGame3State()` dan Intro), `result` (finalisasi sekali bila `needsFinalize`; tanpa simpan ulang bila sudah `finished`)
    - Bind `#continueBtn` pada semua mode ke `navigateTo(NEXT_PAGE)`
    - _Requirements: 3.9, 3.10, 4.7, 4.8, 5.1, 5.2, 5.4, 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.9, 8.10, 9.3, 10.5, 10.6, 10.7, 10.8, 10.9, 12.1_

  - [x] 4.2 Implementasikan alur Mulai → Countdown → Fase_Mengingat → Fase_Menyusun di `game-3/game.js`
    - `beginCountdown()`: dijaga `phase === 'intro'`, nonaktifkan Mulai, sembunyikan Intro, tampilkan Game_Screen dengan `renderEmptyStage()` dan overlay, `playSound('countdown')` sekali, interval berbasis `countdownNumber(Date.now() - t0)` yang memperbarui angka hanya saat berubah; di 0 sembunyikan overlay lalu `startGame()`; tanpa `saveGame3State`
    - `cancelCountdown()` pada `pagehide`: bersihkan interval dan `stopSound('countdown')`
    - `startGame()`: dijaga `phase === 'countdown'`; `round = buildRound(CARD_IMAGES, Math.random)`; `memorizeEnd = Date.now() + 5000`; `answerEnd = memorizeEnd + 5000`; `saveGame3State(serializeState(state, 'playing'))`; `enterMemorize()`; `startTimer()`
    - `startTimer()`/`tick()` interval 250 ms: hitung `remainingSeconds` dari waktu absolut fase aktif, render hanya saat nilai berubah; `now >= memorizeEnd` → `enterAnswer([])` otomatis tanpa tombol; `now >= answerEnd` → `finishGame()`
    - Tidak ada pemutaran `countdown.mp3` di Game_Screen
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 5.4, 5.5, 5.6, 6.5, 6.11, 10.2, 10.10_

  - [x] 4.3 Implementasikan pemilihan kartu, Fly_Animation, dan `finishGame` di `game-3/game.js`
    - `onOptionClick(id)`: abaikan bila `!canPick(state)`; selain itu secara sinkron `state.picks = addPick(...)` (abaikan bila tidak berubah), tentukan `slotIndex`, nonaktifkan tombol, `playSound('flip')`, `saveGame3State(serializeState(state, 'playing'))`, lalu `flyToSlot(button, slotIndex)`; bila `picks.length === 3` set `locked = true` dan jadwalkan `finishGame()` setelah `FINISH_DELAY_MS` (atau `FINISH_DELAY_REDUCED_MS` bila reduced-motion)
    - `flyToSlot(button, slotIndex)`: transform dari selisih `getBoundingClientRect` selama `FLY_MS`, lalu isi Slot (`shuffle-slot--filled`) dan tandai kartu `shuffle-option--used`; reduced-motion atau rect tidak valid → isi Slot langsung; simpan id timeout di `pendingTimeouts`
    - `finishGame()` dijaga flag `finished`: hentikan timer, bersihkan `pendingTimeouts`, `saveGameScore('memorize', calcScore(...))` tepat sekali (dalam `try/catch`), `saveGame3State(serializeState(state, 'finished'))`, lalu `showResult`; tanpa `setTimeout` navigasi
    - Kegagalan penyimpanan tidak menghalangi Result_Screen
    - Panggil `init()` pada `DOMContentLoaded` hanya bila `document` tersedia
    - _Requirements: 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 8.1, 8.9, 8.10, 9.1, 9.3, 10.3, 10.4, 10.11, 10.12, 11.11, 12.3, 12.4_

  - [ ]* 4.4 Tulis property test `finishGame` di `tests/finish3.property.test.js`
    - Mock `saveGameScore` dan `navigateTo` sebagai spy, fake timers
    - **Property 9: Skor disimpan tepat sekali dan tanpa auto-navigasi**
    - **Validates: Requirements 8.10, 9.1**

  - [ ]* 4.5 Tulis unit test DOM, audio, animasi, dan restore di `tests/game3.unit.test.js`
    - Gunakan jsdom, fake timers, `Date.now` palsu, mock `Audio`, dan mock `getBoundingClientRect`
    - Intro_Screen: urutan elemen dan teks sesuai requirements, `body.shuffle-body`, satu `h1`
    - Countdown: angka 3-2-1, Mulai nonaktif dan ganda diabaikan, stage kosong, tidak ada state tersimpan, audio sekali, `pagehide` membersihkan interval, audio ditolak tetap lanjut
    - Fase_Mengingat: tiga kartu sesuai `originalOrder`, badge dan prompt benar, `#slots` tersembunyi, tanpa Option_Card, beralih otomatis setelah 5 detik
    - Fase_Menyusun: tiga Slot bernomor, tiga `button.shuffle-option`, klik mengisi Slot menurut urutan klik, `flip.mp3` diputar, tombol `disabled`, tiga klik beruntun cepat tanpa Slot ganda, Result_Screen tampil ≤ 600 ms setelah klik ketiga, waktu habis dengan Slot kosong
    - Result_Screen: ikon dan `alt` per status, kotak kosong bernomor, skor dan "dari 30", tidak ada navigasi otomatis, Lihat Hasil memanggil `navigateTo('../result.html')`
    - Restore: tahap `memorize`/`answer` dengan Slot terisi tanpa animasi, `answerEnd` terlewat atau `picks` 3 menyimpan skor sekali, `finished` tanpa simpan ulang, state rusak atau id tak dikenal → Intro; `setItem` melempar error tetap menampilkan Result_Screen; reduced-motion mengisi Slot langsung
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 3.1, 3.2, 3.5, 3.6, 3.8, 3.9, 3.10, 5.1, 5.5, 5.6, 6.1, 6.6, 6.8, 6.9, 6.10, 6.11, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.9, 8.10, 9.3, 10.5, 10.6, 10.7, 10.8, 10.9, 11.11_

- [x] 5. Checkpoint - Pastikan semuanya berjalan
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Verifikasi statis akhir
  - [ ]* 6.1 Tulis smoke test statis di `tests/static3.smoke.test.js`
    - Pindai `game-3/index.html`, `game-3/game.js`, `css/style.css`: tidak ada `http://`, `https://`, atau `//` untuk aset; tidak ada `pushState`
    - `localStorage` hanya muncul di `js/storage.js`
    - Urutan skrip dan path relatif benar; `#countdownScreen` ada di dalam `main.shuffle-page`, ber-`hidden`, tanpa heading, `#countdownNumber` ber-`role="status"` dan `aria-live="assertive"`
    - `CARD_IMAGES` terdefinisi sekali (3 + 10 + 3 entri) dan seluruh berkas aset yang dirujuk (gambar kartu, ikon hasil, audio, `assets/icon-game-3.svg`) ada di disk
    - `.shuffle-*[hidden]`, blok `@media (min-height: 550px)` untuk `.shuffle-page`, dan `@media (prefers-reduced-motion: reduce)` ada di CSS
    - Tidak ada utility spasi Bootstrap (`mb-*`, `py-*`) pada elemen game-3
    - _Requirements: 3.4, 4.1, 9.5, 11.1, 11.6, 11.7, 11.8, 11.9, 11.11_

- [x] 7. Final checkpoint - Pastikan semua tes lulus
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Revisi tampilan Game_Screen dan Result_Screen game-3
  - [x] 8.1 Tampilkan angka urutan 1, 2, 3 di bawah tiap kotak pada Fase_Mengingat
    - `renderMemorize()` di `game-3/game.js`: bungkus tiap `.shuffle-frame` dalam `div.shuffle-memo` bersama `span.shuffle-memo__num` berisi 1, 2, 3 sesuai posisi kotak
    - `css/style.css`: `.shuffle-memo` (kolom, lebar `var(--shuffle-card)`) dan `.shuffle-memo__num` (tebal, rata tengah, Biru_Tua, mengecil lewat `clamp(1rem, calc(3 * var(--dvh)), 1.25rem)`)
    - Angka tidak tampil di Fase_Menyusun dan Result_Screen
    - _Requirements: 5.8_

  - [x] 8.2 Progress bar langsung penuh saat fase berganti
    - `renderTimer(instant)`: bila `instant` true, matikan transisi `#timerBar` sementara, set lebar, paksa reflow, lalu kembalikan transisi
    - `enterMemorize()` dan `enterAnswer()` memanggil `renderTimer(true)`; tick per detik tetap memakai transisi normal
    - _Requirements: 6.14_

  - [x] 8.3 Hapus wave dan tambahkan Screen_Icon
    - Hapus `.shuffle-page::after` (`assets/background-wave.svg`) dari `css/style.css`
    - `game-3/index.html`: `img.shuffle-screen-icon` (`../assets/icon-game-3.svg`, `alt` deskriptif) di atas `h2` pada `#gameScreen` dan `#resultScreen`
    - `.shuffle-screen-icon` tinggi 56px, mengecil `clamp(32px, calc(6.5 * var(--dvh)), 56px)`; anggaran tinggi `--shuffle-card` menjadi `calc((100 * var(--dvh) - 290px) / 2)` agar tetap muat tanpa scroll vertikal
    - _Requirements: 2.3, 2.10, 5.9, 6.15, 8.2, 11.1_

  - [x] 8.4 Tambahkan ikon jam di kiri angka timer
    - `game-3/index.html`: `span#timerBox.shuffle-timer` berisi `img.shuffle-timer__icon` (`../assets/clock.svg`, `alt=""`, `aria-hidden="true"`) dan `span#timerText`
    - `game-3/game.js`: cache `timerBox`; kelas `shuffle-timer`/`shuffle-timer--warning` dipasang pada `#timerBox` (fallback `#timerText`)
    - `css/style.css`: `.shuffle-timer__icon` (1em x 1em, `margin-right: 0.4em`, `object-fit: contain`), sama seperti `recall-timer__icon`
    - _Requirements: 5.4, 6.5_

## Notes

- Sub-task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task merujuk requirements spesifik untuk keterlacakan
- Property test memvalidasi 12 properti kebenaran dari design; unit test memvalidasi contoh dan edge case
- Berkas uji dan fast-check/jsdom (versi dipin) hanya untuk pengembang; halaman produksi tetap tanpa build step dan dapat dibuka langsung di browser
- Setelah selesai, uji manual tiap tampilan (termasuk saat Fly_Animation) pada tinggi sekitar 550-560px (mis. 375×553) untuk memastikan tanpa scroll vertikal

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "3.2"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "3.3", "4.1"] },
    { "id": 2, "tasks": ["4.2"] },
    { "id": 3, "tasks": ["4.3"] },
    { "id": 4, "tasks": ["4.4", "4.5", "6.1"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4"] }
  ]
}
```

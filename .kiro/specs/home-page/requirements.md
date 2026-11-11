# Requirements Document

## Introduction

Halaman Home (`index.html`) adalah landing page aplikasi Game Entrasol. Halaman ini menyediakan branding Entrasol, perkenalan singkat ketiga mini-game (hanya namanya), dan tombol untuk memulai rangkaian permainan. Dokumen ini mendefinisikan kebutuhan fungsional dan visual halaman tersebut, termasuk revisi latar gradasi 3 warna, ornamen oval blur, dan pill nama game.

## Glossary

- **Pill**: badge berbentuk lonjong (rounded) yang membungkus teks nama game.
- **Ornamen oval**: elemen dekoratif berbentuk elips dengan efek blur di latar belakang.
- **LocalStorage key**: `entrasol_game_score`, menyimpan objek skor { memoryFlip, memoryRecall, memorize, total }.

## Requirements

### Requirement 1: Branding & Identitas

**User Story:** Sebagai pengunjung, saya ingin melihat branding Entrasol yang jelas di halaman awal, sehingga saya tahu aplikasi ini milik Entrasol.

#### Acceptance Criteria

1. WHEN halaman dibuka THEN sistem SHALL menampilkan logo Entrasol.
2. WHEN halaman dibuka THEN sistem SHALL menampilkan judul teks "Memory Challenge".
3. WHEN halaman dibuka THEN sistem SHALL menampilkan logo Kalbe Nutritionals (assets/logo-kalbe.png) di bagian bawah halaman sebagai pendukung branding.

### Requirement 2: Daftar Permainan

**User Story:** Sebagai pengunjung, saya ingin melihat daftar nama permainan yang akan dimainkan, sehingga saya tahu apa yang akan saya hadapi.

#### Acceptance Criteria

1. WHEN halaman dibuka THEN sistem SHALL menampilkan daftar (list) berisi tiga item permainan, masing-masing sebagai kartu terpisah.
2. THE item SHALL menampilkan tiga nama permainan: "Memory Flip", "Memory Recall", dan "Memorize, Shuffle & Recall".
3. THE daftar SHALL NOT menampilkan judul "3 Permainan Memori" atau deskripsi mekanisme tiap game (cukup nama saja).
4. THE setiap item SHALL menampilkan ikon game di sisi kiri (`icon-game-1.svg`, `icon-game-2.svg`, `icon-game-3.svg` dari folder `assets/`).
5. THE setiap item SHALL memiliki separator (garis vertikal) sebagai pemisah antara ikon dan nama game.
6. THE warna separator SHALL sesuai warna game: game 1 biru tua, game 2 hijau muda, game 3 biru muda.
7. THE setiap item SHALL menampilkan penanda nomor urutan (01, 02, 03) berwarna sesuai warna game.
8. THE nama game SHALL ditampilkan rata kiri (`lefta`).
9. THE ikon SHALL berbentuk persegi panjang (bukan kotak) dengan lebar 30% dari lebar item, dan tinggi item sekitar 90px agar gambar terlihat jelas.

### Requirement 3: Tombol Mulai Permainan

**User Story:** Sebagai pengunjung, saya ingin tombol untuk memulai permainan, sehingga saya bisa langsung masuk ke game pertama.

#### Acceptance Criteria

1. WHEN halaman dibuka THEN sistem SHALL menampilkan tombol "Mulai Permainan" yang menonjol (warna primer biru tua).
2. WHEN tombol Mulai ditekan THEN sistem SHALL mereset skor di LocalStorage (key `entrasol_game_score`) ke nilai awal { memoryFlip: 0, memoryRecall: 0, memorize: 0, total: 0 }.
3. WHEN tombol Mulai ditekan AND skor telah direset THEN sistem SHALL mengarahkan ke `game1/index.html`.

### Requirement 4: Tampilan Mobile Frame & Latar Belakang

**User Story:** Sebagai pengunjung, saya ingin tampilan yang konsisten seperti aplikasi mobile di semua perangkat.

#### Acceptance Criteria

1. THE halaman SHALL menampilkan container utama dengan lebar maksimum 430px, terpusat, sehingga di desktop tetap terlihat seperti tampilan mobile.
2. THE background body SHALL berwarna #EAF5F2.
3. THE background container SHALL memakai gradasi: radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #FFFFF8 38%, transparent 75%), radial-gradient(ellipse at 0% 75%, #E9F9D9 0%, transparent 55%), linear-gradient(180deg, #F0F8F5 0%, #F5F8EC 45%, #DDF3F4 100%).
4. THE container SHALL menampilkan background wave dari file assets/background-wave.svg di bagian bawah.
5. THE lapisan wave SHALL NOT menghalangi keterbacaan teks atau interaksi tombol.
6. THE pola garis diagonal dan ornamen oval blur sebelumnya SHALL NOT digunakan lagi.

### Requirement 6: Responsive & Offline

**User Story:** Sebagai pengunjung yang mayoritas memakai smartphone, saya ingin halaman nyaman di semua ukuran layar dan tetap jalan offline.

#### Acceptance Criteria

1. THE halaman SHALL tampil rapi dan terpusat di Mobile, Tablet, dan Desktop (mobile-first).
2. THE halaman SHALL mereferensikan Bootstrap 5 dari path lokal (`vendor/bootstrap/`), bukan CDN.
3. THE halaman SHALL menggunakan font Noto Sans dari `@font-face` lokal.
4. THE seluruh aset (gambar, CSS, JS, font) SHALL direferensikan dari path lokal/relatif (tanpa URL eksternal).

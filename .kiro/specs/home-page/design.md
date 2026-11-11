# Design Document: Halaman Home (index.html)

## Overview

Halaman Home adalah satu halaman statis (single view) berbasis HTML + Bootstrap 5 (lokal) + CSS kustom. Seluruh konten dipusatkan vertikal & horizontal di dalam hero section setinggi viewport. Desain mobile-first. Revisi utama: latar gradasi 3 warna, ornamen oval blur, dan pill nama game.

## Architecture

Halaman ini murni presentasional (no build tool, no framework). Struktur lapisan:

```
[home-hero - position: relative, overflow: hidden, min-height: 100vh]
  |-- ornamen oval (z-index 0, dekoratif, pointer-events: none)
  |    |-- sudut kanan atas (biru tua + kuning emas)
  |    |-- sudut kiri bawah (hijau tua + biru tua)
  |-- container konten (z-index 1, text-center)
       |-- logo Entrasol
       |-- h1 "Game Entrasol"
       |-- subtitle
       |-- panel kartu > 3 pill nama game (vertikal)
       |-- tombol "Mulai Permainan"
       |-- logo Kalbe Nutritionals (footer-logo)
```

Aliran interaksi: klik tombol Mulai -> reset skor LocalStorage -> redirect ke `game1/index.html`. Logika ini sementara inline di `index.html`, nanti dipindah ke `js/storage.js` + `js/app.js` tanpa ubah perilaku.

## Components and Interfaces

### 1. Mobile Frame & Background

- Body: background-color #EAF5F2 (variabel --body-bg).
- Container .home-hero: max-width 430px (variabel --app-max-width), margin 0 auto, min-height satu layar, overflow hidden, box-shadow halus agar terpisah dari body di desktop.
- Background container: dua radial-gradient + satu linear-gradient (sesuai Requirement 4.3).
- Wave: pseudo-element .home-hero::after di dasar container, aspect-ratio 390/120, background url(../assets/background-wave.svg) dengan ukuran 100% 100%. z-index 0 dan pointer-events none; konten .hero-content z-index 1.
- Ukuran teks memakai rem tetap karena lebar container sudah dibatasi 430px.

### 2. Catatan

- Pola garis diagonal dan ornamen oval blur dihapus. Tidak ada media query khusus desktop untuk background.

### 3. Daftar Game (ikon + separator + nomor + nama)

Struktur ``<ul class="game-list">`` berisi tiga ``<li class="game-item">``, masing-masing kartu putih (rounded + shadow halus) dengan **outline (`border: 2px solid`) berwarna sesuai warna game** (`.game-item--flip` biru tua, `--recall` hijau muda, `--memorize` biru muda) - outline berwarna ini menjaga nuansa warna dan membuat list tidak terlihat seperti tombol. Urutan horizontal tiap item:

1. **Ikon** (`.game-item__icon`) - gambar `assets/icon-game-N.svg` (viewBox 160x120). Lebar 30% dari item, tinggi mengikuti tinggi item (90px) dengan object-fit contain, jadi berbentuk persegi panjang dan tidak terpotong.
2. **Separator** (`.game-item__sep`) - garis vertikal tipis pemisah ikon dan nama. Warna sesuai game: `--flip` biru tua, `--recall` hijau muda, `--memorize` biru muda.
3. **Nomor** (`.game-item__num`) - badge pill kecil berisi 01/02/03, warna latar sesuai warna game.
4. **Nama** (`.game-item__name`) - rata kiri (`text-align: left`), biru tua, bold, ukuran responsif `clamp(0.95rem, 3.5vw, 1.15rem)`.

Judul "3 Permainan Memori" dan deskripsi mekanisme TIDAK ditampilkan (cukup nama). Tidak memakai `.info-panel` lagi; tiap item adalah kartunya sendiri.

### 4. Tombol Mulai

Tetap memakai `.btn-entrasol` yang sudah ada (biru tua, pill, hover naik); tidak berubah.

### 5. Z-index Layering

- Ornamen: `z-index: 0`. Konten container: `position: relative; z-index: 1`. `.home-hero`: `overflow: hidden`.

## Data Models

Skor disimpan di LocalStorage dengan key `entrasol_game_score` (JSON string):

```json
{
  "memoryFlip": 0,
  "memoryRecall": 0,
  "memorize": 0,
  "total": 0
}
```

Halaman Home hanya *menulis* objek ini (reset ke 0) saat tombol Mulai ditekan; tidak membaca nilai skor.

## CSS yang Ditambah/Diubah (`css/style.css`)

- Tambah `--ornament-green-dark: #2E7D32` dan `--ornament-gold: #E8B339` di `:root`.
- Ubah `.home-hero` background menjadi gradasi 3 warna + `position: relative; overflow: hidden`.
- Tambah `.ornament` + modifier posisi/warna.
- Tambah `.game-pill` + modifier warna (`--flip`, `--recall`, `--memorize`).

## HTML yang Diubah (`index.html`)

- Tambahkan elemen ornamen oval di dalam `.home-hero` sebelum container.
- Beri container konten z-index agar di atas ornamen.
- Ganti isi panel: hapus h2 dan `<ul>`, ganti dengan 3 pill.

## Correctness Properties

- Ornamen selalu berada di belakang konten (`z-index: 0` < `1`) dan tidak pernah menangkap klik (`pointer-events: none`).
- Opacity ornamen selalu di rentang 0.15-0.25.
- Tombol Mulai selalu mereset skor ke 0 sebelum navigasi.

## Error Handling

- Akses LocalStorage dibungkus `try/catch`; jika gagal (mis. mode privat), navigasi tetap dilanjutkan.
- Jika gambar aset gagal dimuat, `alt` deskriptif tetap memberi konteks.

## Testing Strategy

- Verifikasi manual di browser: buka `index.html` langsung (file://).
- Cek visual: gradasi 3 warna, ornamen blur di dua sudut, 3 pill vertikal berwarna.
- Cek interaksi: klik Mulai mereset skor & pindah ke game1.
- Cek responsive: devtools mobile/tablet/desktop.
- Cek offline: tidak ada request ke URL eksternal.

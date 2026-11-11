# Implementation Plan: Halaman Home (index.html)

## Overview

Revisi halaman Home yang sudah ada: latar gradasi 3 warna, ornamen oval blur di dua sudut, dan panel diganti menjadi 3 pill nama game. Semua perubahan di `css/style.css` dan `index.html`.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2", "4"] },
    { "wave": 3, "tasks": ["3", "6"] },
    { "wave": 4, "tasks": ["5"] },
    { "wave": 5, "tasks": ["7"] }
  ]
}
```

## Tasks

- [x] 1. Tambah variabel warna ornamen di `css/style.css`
  - Tambah `--ornament-green-dark: #2E7D32` dan `--ornament-gold: #E8B339` di `:root`.
  - _Requirements: 5.5_

- [x] 2. Ubah background `.home-hero` menjadi gradasi 3 warna
  - Gradasi vertikal: putih (0%) -> hijau muda (50%) -> biru muda (100%).
  - Tambah `position: relative` dan `overflow: hidden` pada `.home-hero`.
  - _Requirements: 4.1, 4.2, 5.6_

- [x] 3. Buat style ornamen oval di `css/style.css`
  - Class `.ornament`: posisi absolut, oval (border-radius 50%), `filter: blur(...)`, `opacity` 0.15-0.25, `z-index: 0`, `pointer-events: none`.
  - Modifier posisi + ukuran + warna untuk sudut kanan atas dan kiri bawah (biru tua, hijau tua, kuning emas).
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Buat style pill nama game di `css/style.css`
  - Class `.game-pill` (pill, padding, teks tengah, bobot tebal).
  - Modifier warna: `--flip` (biru tua), `--recall` (hijau muda), `--memorize` (biru muda).
  - _Requirements: 2.5, 2.7, 2.6_

- [x] 5. Update `index.html`: tambah ornamen & layering
  - Tambah elemen ornamen oval (`aria-hidden="true"`) di dalam `.home-hero` sebelum container.
  - Pastikan container konten `position: relative; z-index: 1` agar di atas ornamen.
  - _Requirements: 5.1, 5.4, 5.6_

- [x] 6. Update `index.html`: ganti isi panel menjadi pills
  - Hapus heading "3 Permainan Memori".
  - Hapus `<ul>` berisi deskripsi tiap game.
  - Tambah 3 pill vertikal: "Memory Flip", "Memory Recall", "Memorize, Shuffle & Recall".
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 7. Verifikasi visual & kompatibilitas
  - Pastikan gradasi, ornamen blur, dan pills tampil benar.
  - Pastikan tombol Mulai masih bisa diklik (ornamen tidak menghalangi) dan tetap reset skor + navigasi.
  - Pastikan rapi di mobile/tablet/desktop, semua aset lokal.
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4_

## Notes

- Semua perubahan hanya menyentuh `css/style.css` dan `index.html`.
- Tidak menambah dependensi baru; semua aset tetap lokal/offline.
- Logika tombol Mulai (reset skor + navigasi) tidak berubah.

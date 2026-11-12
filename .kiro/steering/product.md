# Product Overview

## Tujuan Aplikasi

Aplikasi ini adalah **game interaktif sebagai media promosi produk Entrasol**. Game digunakan untuk menarik perhatian dan melibatkan calon konsumen melalui pengalaman bermain yang ringan, cepat, dan menyenangkan, sekaligus memperkuat asosiasi merek Entrasol (produk yang mendukung daya ingat dan kesehatan tulang).

Tema permainan berpusat pada **daya ingat (memory)** — selaras dengan pesan produk Entrasol.

## Target Pengguna

- **Remaja dan dewasa.**
- Diasumsikan pengguna familiar dengan perangkat mobile.
- Mayoritas pengguna mengakses lewat **smartphone** (desain mobile-first), namun tetap nyaman di tablet dan desktop.

## Ringkasan Permainan

Aplikasi terdiri dari **3 mini-game memori** yang dimainkan secara berurutan. Setiap game adalah halaman tersendiri. Total skor maksimal dari ketiga game adalah **100 point**.

| # | Nama Game | Folder | Durasi | Max Score |
|---|-----------|--------|--------|-----------|
| 1 | Memory Flip | `game-1/` | 30 detik | 40 point |
| 2 | Memory Recall | `game-2/` | 5 + 5 detik (dua fase) | 30 point |
| 3 | Memorize, Shuffle & Recall | `game-3/` | 5 + 5 detik (dua fase) | 30 point |

### 1. Memory Flip (game-1)

- **Mekanisme:** Papan kartu berukuran **4 × 4** (16 kartu, 8 pasang). Semua kartu tertutup. Pemain membuka dua kartu sekaligus untuk mencari pasangan kartu yang sama. Jika cocok, pasangan tetap terbuka; jika tidak, kartu tertutup kembali.
- **Durasi:** 30 detik.
- **Scoring:** **5 point per pasangan yang berhasil ditemukan**. Ada 8 pasang → maksimal **40 point**.
- **Selesai:** Game berakhir jika seluruh 8 pasang ditemukan **atau** waktu habis (30 detik). Setelah berakhir, tampilkan layar hasil game dengan tombol "Lanjutkan" (tidak ada perpindahan halaman otomatis).

### 2. Memory Recall (game-2)

- **Mekanisme (dua fase):**
  - **Fase hafal (5 detik):** Satu kartu ditampilkan selama 5 detik lalu disembunyikan.
  - **Fase jawab (5 detik):** Muncul 3 kartu pilihan. Pemain memilih kartu yang sebelumnya dilihat dalam waktu 5 detik.
- **Durasi:** 5 detik (hafal) + 5 detik (jawab).
- **Scoring:** **All-or-nothing** — **30 point** jika pilihan benar, **0 point** jika salah atau waktu habis.
- **Selesai:** Game berakhir setelah pemain memilih **atau** waktu fase jawab habis. Setelah berakhir, tampilkan layar hasil game dengan tombol "Lanjutkan" (tidak ada perpindahan halaman otomatis).

### 3. Memorize, Shuffle & Recall (game-3)

- **Mekanisme (dua fase):**
  - **Fase hafal (5 detik):** Tiga kartu ditampilkan dalam urutan tertentu selama 5 detik.
  - **Fase jawab (5 detik):** Kartu diacak (shuffle), lalu pemain menyusun kembali urutan aslinya dalam waktu 5 detik.
- **Durasi:** 5 detik (hafal) + 5 detik (jawab).
- **Scoring:** **10 point per kartu yang berada pada posisi benar**. Ada 3 kartu → maksimal **30 point**.
- **Selesai:** Game berakhir setelah pemain selesai menyusun / mengonfirmasi **atau** waktu fase jawab habis. Setelah berakhir, tampilkan layar hasil game dengan tombol "Lanjutkan" (tidak ada perpindahan halaman otomatis).

## Aturan Skor Total

- Skor total = `memoryFlip + memoryRecall + memorize`.
- Maksimal absolut = **100 point** (40 + 30 + 30).
- Skor tiap game disimpan ke LocalStorage saat game selesai, lalu diakumulasi di halaman Result.

## Alur Antar Halaman

Alur bersifat **linear dan berurutan**:

```
index.html → game-1 (Memory Flip) → game-2 (Memory Recall) → game-3 (Memorize) → result.html
```

- **index.html** — Landing page: perkenalan singkat, keterangan game, dan tombol **Start** untuk memulai rangkaian permainan.
- **Tanpa navigasi otomatis:** Baik ketika **waktu habis** maupun ketika **game selesai dikerjakan**, halaman TIDAK berpindah sendiri. Game menampilkan **layar hasil** (skor game tersebut) lebih dulu, dan pemain berpindah ke halaman berikutnya hanya dengan menekan tombol **"Lanjutkan"**. Tombol "Lanjutkan" di game-1 menuju game-2, di game-2 menuju game-3, dan di game-3 menuju `result.html`.
- **result.html** — Halaman akhir yang menampilkan skor.

## Aturan Tiap Halaman Game

Setiap halaman game (game-1, game-2, game-3) wajib:

1. Menampilkan **petunjuk/instruksi permainan** (teks) sebelum game dimulai, sehingga pemain mengerti cara bermain.
2. Menyediakan tombol **"Start"** untuk memulai game.
3. **Timer baru mulai berjalan setelah tombol Start ditekan** — bukan otomatis saat halaman dibuka. Ini memberi pemain waktu membaca petunjuk terlebih dahulu.
4. Untuk game dengan dua fase (Memory Recall & Memorize), tampilkan **indikator fase yang berbeda** antara fase hafal (menghafal kartu) dan fase jawab.
5. Setiap game punya tiga tampilan dalam satu halaman: **petunjuk (intro)**, **permainan**, dan **hasil**. Tampilan hasil menampilkan skor game tersebut beserta tombol **"Lanjutkan"**; tidak ada navigasi otomatis saat waktu habis atau game selesai.

## Halaman Result (result.html)

- Menampilkan **rincian skor per game**: Memory Flip, Memory Recall, Memorize.
- Menampilkan **skor total** (dari 100).
- Menampilkan teks **"Terima kasih sudah bermain"**.
- Jika skor total = **100 (maksimum)**, tampilkan juga teks **"Selamat, Anda menjadi pemenang"**.
- **TIDAK ada tombol "Main Lagi".**

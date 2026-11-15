# Requirements Document

## Introduction

Halaman Total Result (`result.html`, di root bersama `index.html`) menampilkan hasil akhir pemain setelah menyelesaikan game-1, game-2, dan game-3. Strukturnya mengikuti halaman Home. Halaman ini adalah akhir alur: tidak ada tombol "Main Lagi". Pemain yang ingin bermain lagi memindai ulang QR code, yang membuka `index.html` di tab baru.

## Glossary

- **Menang**: skor total = 100 (maksimum).
- **Kalah**: skor total < 100.
- **Snapshot hasil**: salinan skor yang disimpan per tab (`sessionStorage`) saat `result.html` pertama kali dibuka, supaya refresh tetap menampilkan hasil yang sama.
- **Session_Done flag**: penanda di `localStorage` bahwa satu sesi permainan sudah sampai ke halaman Result. Dipakai `index.html` untuk memulai sesi baru dengan bersih.
- **Skor game**: `memoryFlip` (0-40), `memoryRecall` (0 atau 30), `memorize` (0-30), dari key `entrasol_game_score`.

## Requirements

### Requirement 1: Sumber data skor

**User Story:** Sebagai pemain, saya ingin melihat skor ketiga game dan totalnya, sehingga saya tahu hasil akhir saya.

#### Acceptance Criteria

1. WHEN `result.html` dibuka pertama kali pada sebuah tab THEN sistem SHALL membaca skor dari `entrasol_game_score` lewat helper `storage.js` dan menyimpannya sebagai Snapshot hasil.
2. WHEN `result.html` dimuat ulang (refresh) pada tab yang sama THEN sistem SHALL menampilkan hasil dari Snapshot hasil, bukan dari `localStorage`.
3. THE total yang ditampilkan SHALL = `memoryFlip + memoryRecall + memorize` (dihitung ulang dari ketiga skor game, bukan hanya membaca field `total`).
4. IF `result.html` dibuka tanpa Snapshot hasil dan sesi belum selesai (state game-3 tidak ada atau belum `finished`) THEN sistem SHALL mengarahkan ke `index.html` dengan `location.replace`.
5. THE `result.html` SHALL NOT mereset atau mengubah skor di `localStorage`, selain menulis Session_Done flag.
6. WHEN `result.html` pertama kali menampilkan hasil THEN sistem SHALL menulis Session_Done flag ke `localStorage`.

### Requirement 2: Ikon status dan teks utama

**User Story:** Sebagai pemain, saya ingin langsung tahu menang atau kalah dari bagian atas halaman.

#### Acceptance Criteria

1. WHEN total = 100 THEN sistem SHALL menampilkan ikon `assets/confetti-cone.png` di bagian atas.
2. WHEN total < 100 THEN sistem SHALL menampilkan ikon `assets/cancel.png` di bagian atas.
3. WHEN menang THEN teks utama SHALL "Selamat" dan sub teks SHALL "Kamu mendapatkan hadiah".
4. WHEN kalah THEN teks utama SHALL "Maaf" dan sub teks SHALL "Kamu belum beruntung".
5. THE teks utama SHALL berukuran cukup besar dan berwarna biru tua (`--entrasol-blue-dark`).
6. THE sub teks SHALL berwarna hijau tua saat menang dan merah saat kalah.
7. THE teks utama dan sub teks SHALL memakai efek pulse: `scale(1)` pada 0%, `scale(1.08)` pada 50%, `scale(1)` pada 100%, berulang tanpa henti.
8. THE ikon SHALL punya `alt` deskriptif.

### Requirement 3: Efek confetti

**User Story:** Sebagai pemenang, saya ingin perayaan visual.

#### Acceptance Criteria

1. WHEN menang THEN sistem SHALL menampilkan confetti yang bertebaran dari atas dan jatuh ke bawah di dalam container halaman.
2. WHEN kalah THEN sistem SHALL NOT menampilkan confetti.
3. THE confetti SHALL memakai warna palet Entrasol, `pointer-events: none`, dan tidak menutupi atau menghalangi konten.
4. WHERE `prefers-reduced-motion: reduce` aktif THEN sistem SHALL menonaktifkan confetti dan pulse.
5. THE confetti SHALL dibuat dengan JavaScript vanilla dan CSS, tanpa library dan tanpa aset eksternal.
6. THE confetti SHALL tidak menyebabkan scroll di halaman.

### Requirement 4: Daftar skor 3 game

**User Story:** Sebagai pemain, saya ingin melihat skor tiap game.

#### Acceptance Criteria

1. THE halaman SHALL menampilkan tiga item (Memory Flip, Memory Recall, "Memorize, Shuffle & Recall") dengan gaya kartu yang sama seperti `.game-item` di Home (kartu putih, border berwarna per game, sudut membulat, bayangan halus).
2. THE item SHALL TIDAK menampilkan penanda nomor 01/02/03.
3. THE susunan item dari kiri ke kanan SHALL: ikon game, separator vertikal, nama game, skor game.
4. THE proporsi lebar SHALL: ikon 30%, nama game 40%, skor 20%. Sisa 10% untuk separator dan jarak.
5. THE skor game SHALL berada di sisi paling kanan, font-weight medium, berwarna biru tua, dan hanya berupa angka.
6. THE nama game SHALL rata kiri.
7. THE ikon SHALL memakai `assets/icon-game-1.svg`, `icon-game-2.svg`, `icon-game-3.svg`.
8. THE daftar SHALL diberi jarak vertikal yang jelas dari teks utama/sub teks di atasnya.

### Requirement 5: Total point

**User Story:** Sebagai pemain, saya ingin melihat total point.

#### Acceptance Criteria

1. THE halaman SHALL menampilkan label "Total point" di bawah daftar, rata tengah, ukuran sedang (tidak besar).
2. THE halaman SHALL menampilkan nilai total di bawah label, rata tengah, ukuran besar.
3. THE label dan nilai total SHALL berwarna biru tua.

### Requirement 6: Penutup dan branding

**User Story:** Sebagai pemain, saya ingin ditutup dengan ucapan terima kasih.

#### Acceptance Criteria

1. THE halaman SHALL menampilkan teks "Terimakasih telah berpartisipasi" di bagian paling bawah, rata tengah, ukuran kecil, font-weight tipis (light), berwarna abu-abu gelap.
2. THE halaman SHALL menampilkan logo Entrasol berulisan biru (`assets/entrasol-text-blue.png`, latar transparan) rata tengah di bawah teks tersebut.
3. THE halaman SHALL NOT memiliki tombol "Main Lagi", "Lanjutkan", atau tautan navigasi lain.

### Requirement 7: Tanpa kembali dan tahan refresh

**User Story:** Sebagai penyelenggara, saya ingin hasil akhir tidak bisa ditinggalkan lewat tombol Back.

#### Acceptance Criteria

1. WHEN pemain menekan tombol Back browser di `result.html` THEN sistem SHALL tetap di `result.html`.
2. WHEN pemain me-refresh `result.html` THEN sistem SHALL tetap di `result.html` dan menampilkan hasil yang sama.
3. WHEN `result.html` dipulihkan dari back/forward cache (event `pageshow` dengan `persisted`) THEN sistem SHALL menampilkan hasil dengan benar dan tetap menjaga trap Back.
4. THE perpindahan dari game-3 ke `result.html` SHALL memakai `location.replace` agar halaman game-3 tidak tersisa di riwayat tab.
5. THE pemblokiran Back SHALL bersifat best-effort: browser dapat membatasi trap riwayat, dan tombol keluar/tab-close tetap berfungsi.

### Requirement 8: Bermain ulang lewat QR (tab baru)

**User Story:** Sebagai pemain, saya ingin bisa mengulang dengan memindai QR lagi.

#### Acceptance Criteria

1. WHEN `index.html` dibuka di tab baru setelah Session_Done flag ada THEN tombol "Mulai Permainan" SHALL mereset skor dan semua state game (`resetScore()`), menghapus Session_Done flag, lalu menuju `game-1/index.html`.
2. WHEN sesi baru dimulai di tab baru THEN tab lama yang menampilkan `result.html` SHALL tetap menampilkan hasil lamanya (dari Snapshot hasil per tab).
3. WHEN Session_Done flag tidak ada THEN perilaku tombol "Mulai Permainan" SHALL tetap seperti sekarang (reset hanya bila state game-1 kosong).

### Requirement 9: Tampilan dan layout

**User Story:** Sebagai pemain, saya ingin tampilan sama dengan Home.

#### Acceptance Criteria

1. THE halaman SHALL memakai container mobile `max-width: 430px` dengan background gradasi radial/linear yang sama seperti `.home-hero`.
2. THE wave `assets/background-wave.svg` SHALL berada di dasar container seperti Home.
3. THE konten SHALL berada di atas wave (`z-index` lebih tinggi).
4. WHEN tinggi layar >= 550px THEN halaman SHALL tidak memiliki scroll vertikal (aturan fit-to-viewport; target minimal viewport 375x553).
5. THE ukuran ikon, font, item list, jarak, dan padding SHALL memakai `clamp(min, calc(N * var(--dvh)), max)`, tanpa utility spasi Bootstrap.
6. THE font SHALL Noto Sans offline, tanpa CDN atau URL eksternal.
7. THE target teks body minimal ~13px pada tinggi layar rendah.

### Requirement 10: Aturan teknis

#### Acceptance Criteria

1. THE implementasi SHALL memakai HTML, CSS (Bootstrap lokal + `css/style.css`), dan JavaScript vanilla tanpa framework, CDN, atau build tool.
2. THE akses `localStorage`/`sessionStorage` SHALL hanya lewat `js/storage.js`.
3. THE kelas khusus halaman ini SHALL berprefix `result-` agar tidak mengubah halaman lain.
4. THE logika halaman SHALL berada di `js/app.js` (sesuai struktur proyek), atau di skrip inline kecil di `result.html` yang hanya memanggil fungsi dari `app.js`.

# Requirements Document

## Introduction

Fitur ini adalah halaman game pertama, Memory Flip, yang berada di folder `game-1/`. Halaman ini terdiri dari dua tahap dalam satu file `game-1/index.html`: tahap pengenalan (judul, petunjuk, badge waktu, tombol Start) dan tahap gameplay (papan kartu 4×4 dengan timer 30 detik). Pemain mencari 8 pasang gambar identik. Setiap pasangan bernilai 5 point (maksimal 40 point). Skor disimpan ke LocalStorage lalu halaman otomatis berlanjut ke game berikutnya.

Tampilan mengikuti gaya halaman Home (spec `home-page`): container mobile maksimal 430px, latar gradasi dan wave yang sama, font Noto Sans offline, serta warna biru tua `#141A8C` (sama dengan border item Memory Flip pada daftar game di `index.html`).

Catatan konsistensi: folder aktual game bernama `game-1` (bukan `game1` seperti di aturan struktur). Tombol Start pada halaman Home saat ini mengarah ke `game1/index.html`, sehingga tautan tersebut perlu disesuaikan ke `game-1/index.html`.

## Glossary

- **Memory_Flip_Page**: halaman `game-1/index.html` beserta logika `game-1/game.js`.
- **Intro_Screen**: tampilan pengenalan dan petunjuk yang ditampilkan sebelum permainan dimulai.
- **Game_Screen**: tampilan gameplay yang berisi timer, skor, dan papan kartu.
- **Board**: papan kartu berukuran 4 baris × 4 kolom (16 kartu).
- **Card**: satu kotak kartu pada Board. Sisi tertutup memakai `game-1/assets/back-card.jpg`; sisi terbuka memakai salah satu `game-1/assets/item-1.jpg` sampai `item-8.jpg`.
- **Pair**: dua Card dengan gambar item yang identik. Board berisi 8 Pair.
- **Matched_Card**: Card yang sudah ditemukan pasangannya dan tetap terbuka.
- **Timer**: hitung mundur 30 detik yang mulai berjalan setelah tombol Start ditekan.
- **Score_Store**: helper LocalStorage di `js/storage.js` dengan key `entrasol_game_score`.
- **Memory_Flip_Score**: nilai field `memoryFlip` pada Score_Store, yaitu 5 × jumlah Pair yang ditemukan (0 sampai 40).
- **Next_Game_Page**: halaman game berikutnya, yaitu `game-2/index.html`.
- **Biru_Tua**: warna `#141A8C` (variabel CSS `--entrasol-blue-dark`).

## Requirements

### Requirement 1: Konten Halaman Pengenalan

**User Story:** Sebagai pemain, saya ingin melihat pengenalan dan petunjuk game terlebih dahulu, sehingga saya paham cara bermain sebelum memulai.

#### Acceptance Criteria

1. WHEN Memory_Flip_Page dibuka, THE Memory_Flip_Page SHALL menampilkan Intro_Screen, menyembunyikan Game_Screen, dan tidak menjalankan Timer sampai tombol Start ditekan.
2. THE Intro_Screen SHALL menampilkan teks "GAME 01" sebagai elemen paling atas pada Intro_Screen.
3. THE Intro_Screen SHALL menampilkan judul "Memory Flip" langsung di bawah teks "GAME 01" tanpa elemen lain di antaranya, dengan ukuran huruf judul lebih besar daripada ukuran huruf teks "GAME 01".
4. THE Intro_Screen SHALL menampilkan sub judul "Tantangan ini akan menguji daya ingatmu." langsung di bawah judul tanpa elemen lain di antaranya.
5. THE Intro_Screen SHALL menampilkan box petunjuk langsung di bawah sub judul, berisi dua paragraf berurutan: paragraf pertama "Pada layar akan terdapat 16 kartu tertutup. Temukan 8 pasangan gambar yang identik sebelum waktu habis." dan paragraf kedua "Setiap detik berharga. Buka kartu, ingat posisinya, dan temukan pasangannya!".
6. THE Intro_Screen SHALL menampilkan badge waktu permainan langsung di bawah box petunjuk, dengan teks yang memuat angka "30" dan kata "detik".
7. THE Intro_Screen SHALL menampilkan tombol Start dengan label "Start" langsung di bawah badge waktu sebagai elemen paling bawah pada Intro_Screen.
8. THE Intro_Screen SHALL menampilkan seluruh elemen dalam urutan vertikal dari atas ke bawah: "GAME 01", judul, sub judul, box petunjuk, badge waktu, tombol Start.
9. WHILE Intro_Screen ditampilkan pada lebar viewport 320 px hingga 1920 px, THE Intro_Screen SHALL menampilkan seluruh elemen tanpa teks terpotong dan tanpa scroll horizontal.

### Requirement 2: Gaya Visual dan Konsistensi

**User Story:** Sebagai pemain, saya ingin tampilan game konsisten dengan halaman Home, sehingga pengalaman terasa menyatu.

#### Acceptance Criteria

1. THE Memory_Flip_Page SHALL menggunakan Biru_Tua sebagai warna utama untuk judul, tombol Start, badge waktu, dan aksen box petunjuk.
2. THE Memory_Flip_Page SHALL menampilkan box petunjuk dengan border berwarna Biru_Tua selebar 1px sampai 3px, latar putih, dan sudut membulat dengan radius minimal 8px.
3. THE tombol Start SHALL berlatar Biru_Tua, bertulisan putih, berbentuk pill (radius sudut minimal setengah dari tinggi tombol), memiliki tinggi minimal 48px, dan lebar minimal 44px.
4. THE Memory_Flip_Page SHALL menggunakan container terpusat secara horizontal dengan lebar maksimum 430px, latar body `#EAF5F2`, latar container berupa gradasi yang identik dengan gradasi container Home, dan `assets/background-wave.svg` ditampilkan di bagian bawah container.
5. THE Memory_Flip_Page SHALL menggunakan font Noto Sans dengan ukuran teks isi minimal 16px.
6. THE Memory_Flip_Page SHALL mendefinisikan gaya khusus Memory_Flip_Page di `css/style.css`, yaitu berkas yang sama dengan yang digunakan Home, tanpa mengubah tampilan Home yang sudah ada.
7. IF `assets/background-wave.svg` gagal dimuat, THEN THE Memory_Flip_Page SHALL tetap menampilkan latar gradasi container dan seluruh konten tanpa elemen gelombang, tanpa teks atau konten yang terpotong.
8. WHILE lebar viewport kurang dari 430px, THE Memory_Flip_Page SHALL menampilkan container selebar 100% viewport tanpa munculnya scroll horizontal.

### Requirement 3: Memulai Permainan

**User Story:** Sebagai pemain, saya ingin game dan timer baru mulai setelah saya menekan Start, sehingga saya punya waktu membaca petunjuk.

#### Acceptance Criteria

1. WHILE Intro_Screen ditampilkan, THE Timer SHALL tetap berhenti pada nilai 30 detik dan THE Memory_Flip_Page SHALL menolak interaksi pemain terhadap Card (tidak ada Card yang terbuka saat Card diklik atau disentuh).
2. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL menyembunyikan Intro_Screen dan menampilkan Game_Screen dalam waktu maksimal 500 milidetik.
3. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL mengacak posisi 16 Card sehingga setiap gambar item-1 sampai item-8 muncul tepat dua kali pada Board.
4. WHEN pemain menekan tombol Start, THE Timer SHALL mulai menghitung mundur dari 30 detik dengan interval 1 detik, menampilkan nilai integer dari 30 hingga 0, dan berhenti pada 0.
5. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL menampilkan seluruh 16 Card dalam keadaan tertutup (sisi belakang terlihat) dan skor bernilai 0.
6. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL menonaktifkan tombol Start sehingga penekanan berulang tidak mengacak ulang Board maupun mengatur ulang Timer.

### Requirement 4: Papan Kartu 4×4

**User Story:** Sebagai pemain, saya ingin papan kartu yang proporsional di semua ukuran layar, sehingga mudah disentuh dan dilihat.

#### Acceptance Criteria

1. THE Board SHALL menampilkan 16 Card dalam grid 4 kolom × 4 baris dengan jarak antar Card konstan (gap) antara 4px dan 12px pada semua ukuran layar.
2. THE Card SHALL berbentuk persegi (rasio lebar:tinggi 1:1) dengan sudut membulat berjari-jari antara 8px dan 16px dan bayangan halus.
3. THE Card SHALL memiliki panjang sisi antara 44px dan 100px, dan WHILE lebar container lebih kecil dari yang dibutuhkan untuk 4 Card berukuran 100px beserta gap, THE Card SHALL mengecil secara proporsional agar seluruh 4 kolom muat tanpa scroll horizontal.
4. WHILE Card dalam keadaan tertutup, THE Card SHALL menampilkan gambar `game-1/assets/back-card.jpg` beserta atribut `alt` yang deskriptif menyatakan bahwa kartu tertutup.
5. WHILE Card dalam keadaan terbuka, THE Card SHALL menampilkan tepat satu gambar dari `game-1/assets/item-1.jpg` sampai `item-8.jpg` beserta atribut `alt` yang deskriptif menyebutkan isi gambar, dan setiap gambar item SHALL muncul pada tepat 2 Card di Board.
6. WHEN Card dibuka atau ditutup, THE Card SHALL menampilkan animasi flip dengan transisi CSS selama antara 200 dan 400 milidetik.
7. IF gambar Card gagal dimuat, THEN THE Card SHALL tetap tampil dengan ukuran dan bentuk yang sama serta menampilkan teks `alt` sebagai pengganti gambar.
8. THE Game_Screen SHALL menampilkan Timer dalam angka detik dan progress bar di atas Board, serta skor berjalan (0 sampai 40 point) di dekat Timer.
9. WHEN Timer berkurang atau skor berubah, THE Game_Screen SHALL memperbarui angka detik, progress bar, dan skor berjalan dalam waktu maksimal 1 detik.

### Requirement 5: Mekanik Membuka dan Mencocokkan Kartu

**User Story:** Sebagai pemain, saya ingin membuka dua kartu untuk mencari pasangan, sehingga saya bisa mengumpulkan point.

#### Acceptance Criteria

1. WHILE Timer sedang berjalan AND kurang dari dua Card sedang terbuka tanpa pasangan, WHEN pemain menyentuh Card yang tertutup, THE Memory_Flip_Page SHALL membuka Card tersebut dan menampilkan gambar item-nya.
2. WHEN dua Card terbuka memiliki gambar item yang sama, THE Memory_Flip_Page SHALL menandai kedua Card sebagai Matched_Card, menjaganya tetap terbuka sampai game berakhir, dan menampilkan penanda hijau muda `#8BC34A` pada kedua Card.
3. WHEN dua Card terbuka memiliki gambar item yang berbeda, THE Memory_Flip_Page SHALL menampilkan kedua Card terbuka selama 800 milidetik, lalu menutup kembali keduanya.
4. WHILE dua Card yang tidak cocok sedang ditampilkan sebelum ditutup kembali, THE Memory_Flip_Page SHALL mengabaikan sentuhan pada Card lain.
5. WHEN pemain menyentuh Matched_Card atau Card yang sedang terbuka, THE Memory_Flip_Page SHALL mengabaikan sentuhan tersebut tanpa mengubah status Card, skor, maupun jumlah Card yang sedang terbuka.
6. WHEN sebuah Pair ditemukan, THE Memory_Flip_Page SHALL menambah skor berjalan sebesar 5 point (maksimum 40 point untuk 8 Pair) dan memperbarui tampilan skor dalam waktu 100 milidetik.
7. WHILE Timer belum mulai atau sudah selesai, THE Memory_Flip_Page SHALL mengabaikan sentuhan pada seluruh Card.
8. IF Timer selesai saat dua Card yang tidak cocok sedang ditampilkan, THEN THE Memory_Flip_Page SHALL menutup kembali kedua Card tersebut, tidak mengubah skor berjalan, dan mengabaikan sentuhan berikutnya pada seluruh Card.

### Requirement 6: Timer dan Kondisi Selesai

**User Story:** Sebagai pemain, saya ingin game berakhir ketika semua pasangan ditemukan atau waktu habis, sehingga permainan berjalan sesuai aturan.

#### Acceptance Criteria

1. WHEN pemain menekan tombol Start, THE Timer SHALL mulai menghitung mundur dari 30 detik dan menampilkan sisa waktu dalam bilangan bulat detik.
2. WHILE Game_Screen aktif dan Timer berjalan, THE Timer SHALL mengurangi nilai sisa waktu sebanyak 1 setiap 1 detik (toleransi ±100 milidetik per tick) dan memperbarui angka yang ditampilkan.
3. WHILE sisa waktu Timer kurang dari atau sama dengan 10 detik dan lebih dari 0 detik, THE Timer SHALL menampilkan angka sisa waktu dengan warna peringatan yang berbeda dari warna normal.
4. WHEN Timer mencapai 0 detik, THE Memory_Flip_Page SHALL mengakhiri permainan dan menampilkan angka 0 pada Timer; skor disimpan sesuai Requirement 7.
5. WHEN kedelapan Pair telah ditemukan sebelum Timer mencapai 0, THE Memory_Flip_Page SHALL menghentikan Timer pada nilai sisa waktu saat itu dan mengakhiri permainan; skor 40 disimpan sesuai Requirement 7.
6. WHEN permainan berakhir, THE Memory_Flip_Page SHALL menonaktifkan interaksi pada seluruh Card sehingga klik atau sentuhan pada Card tidak mengubah status Card manapun.
7. WHEN ringkasan hasil telah ditampilkan selama 2 detik, THE Memory_Flip_Page SHALL berpindah otomatis ke Next_Game_Page.
8. IF permainan berakhir saat dua Card yang tidak cocok sedang terbuka, THEN THE Memory_Flip_Page SHALL tidak menghitung Card tersebut sebagai Pair dan tidak menambahkan skor untuknya.

### Requirement 7: Penyimpanan Skor dan Lanjut Otomatis

**User Story:** Sebagai pemain, saya ingin skor tersimpan dan game langsung berlanjut, sehingga rangkaian permainan tidak terputus.

#### Acceptance Criteria

1. WHEN permainan berakhir (seluruh 8 Pair ditemukan atau waktu 30 detik habis), THE Memory_Flip_Page SHALL menyimpan Memory_Flip_Score ke Score_Store pada field `memoryFlip` melalui `js/storage.js`.
2. THE Memory_Flip_Score SHALL sama dengan 5 dikalikan jumlah Pair yang ditemukan, berupa bilangan bulat kelipatan 5 dengan rentang 0 sampai 40.
3. WHEN Memory_Flip_Score disimpan, THE Score_Store SHALL menghitung ulang `total` sebagai `memoryFlip + memoryRecall + memorize`, dengan rentang 0 sampai 100.
4. WHEN Memory_Flip_Score disimpan, THE Score_Store SHALL mempertahankan nilai field `memoryRecall` dan `memorize` yang sudah ada tanpa perubahan.
5. WHEN Memory_Flip_Score selesai disimpan, THE Memory_Flip_Page SHALL menampilkan ringkasan hasil game yang memuat jumlah Pair yang ditemukan dan Memory_Flip_Score selama 2 detik, lalu mengarahkan ke Next_Game_Page.
6. IF LocalStorage tidak tersedia atau data skor yang tersimpan bukan JSON valid atau tidak memuat keempat field numerik, THEN THE Score_Store SHALL menggunakan skor awal `{ memoryFlip: 0, memoryRecall: 0, memorize: 0, total: 0 }` sebagai dasar penyimpanan, dan THE Memory_Flip_Page SHALL tetap menampilkan ringkasan selama 2 detik lalu mengarahkan ke Next_Game_Page.
7. IF penulisan ke LocalStorage gagal, THEN THE Memory_Flip_Page SHALL tetap menampilkan ringkasan selama 2 detik dengan Memory_Flip_Score yang dihitung di sesi tersebut, lalu mengarahkan ke Next_Game_Page.
8. THE Memory_Flip_Page SHALL menyimpan skor dan berpindah halaman tepat satu kali per sesi permainan, termasuk ketika seluruh Pair ditemukan dan waktu habis terjadi hampir bersamaan.
9. FOR ALL jumlah Pair yang ditemukan dari 0 sampai 8, menyimpan Memory_Flip_Score lalu membaca kembali field `memoryFlip` SHALL menghasilkan nilai yang sama dengan 5 dikalikan jumlah Pair (properti round-trip).

### Requirement 8: Responsif, Offline, dan Struktur Berkas

**User Story:** Sebagai pemain dengan smartphone, saya ingin halaman nyaman dan berjalan offline, sehingga bisa dimainkan di mana saja.

#### Acceptance Criteria

1. THE Memory_Flip_Page SHALL menggunakan pendekatan mobile-first, dengan layout default satu kolom untuk lebar viewport 320px ke atas, dan tampil tanpa scroll horizontal serta tanpa elemen yang terpotong pada lebar viewport 320px, 768px, dan 1280px.
2. THE Memory_Flip_Page SHALL menampilkan papan kartu 4×4 dengan kartu berbentuk persegi (rasio lebar:tinggi 1:1) pada semua lebar viewport 320px sampai 1920px.
3. THE Memory_Flip_Page SHALL membatasi lebar container utama maksimum 430px dan memusatkannya secara horizontal pada viewport yang lebih lebar dari 430px.
4. THE Memory_Flip_Page SHALL memuat Bootstrap 5 dari `../vendor/bootstrap/`, CSS dari `../css/style.css`, serta skrip `../js/storage.js`, `../js/app.js`, dan `game.js` melalui path relatif lokal.
5. THE Memory_Flip_Page SHALL tidak mereferensikan CDN atau URL eksternal (diawali `http://`, `https://`, atau `//`) untuk aset apa pun, termasuk CSS, JavaScript, font, dan gambar.
6. WHILE perangkat tidak memiliki koneksi jaringan, THE Memory_Flip_Page SHALL memuat semua aset dan dapat dimainkan dari awal sampai akhir tanpa kesalahan pemuatan sumber daya.
7. THE Memory_Flip_Page SHALL menggunakan JavaScript vanilla tanpa framework atau library JavaScript pihak ketiga selain Bootstrap 5.
8. THE logika gameplay SHALL berada di `game-1/game.js` dan akses LocalStorage SHALL hanya dilakukan melalui fungsi di `js/storage.js`.
9. THE kartu dan tombol di Memory_Flip_Page SHALL memiliki ukuran target sentuh minimal 44×44px pada lebar viewport 320px sampai 1920px.
10. THE Memory_Flip_Page SHALL menggunakan tepat satu elemen `h1` berisi teks "Memory Flip", dan tingkat heading lainnya SHALL berurutan tanpa melompati level (`h1` → `h2` → `h3`).
11. WHERE Home mengarahkan ke game pertama, THE Home SHALL mengarah ke `game-1/index.html`.

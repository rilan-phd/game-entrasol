# Requirements Document

## Introduction

Fitur ini adalah halaman game pertama, Memory Flip, yang berada di folder `game-1/`. Halaman ini terdiri dari tiga tampilan dalam satu file `game-1/index.html`: Intro_Screen (teks "GAME 01", ikon game, judul, sub judul, box petunjuk berisi alert waktu, tombol Start), Game_Screen (judul "Memory Flip", timer 30 detik, skor, progress bar, dan papan kartu 4×4), dan Result_Screen (judul, skor yang diperoleh, dan tombol "Lanjutkan"). Pemain mencari 8 pasang gambar identik. Setiap pasangan bernilai 5 point (maksimal 40 point). Setelah permainan berakhir, skor disimpan ke LocalStorage dan Result_Screen ditampilkan sebagai checkpoint bahwa game-1 selesai. Perpindahan ke game berikutnya hanya terjadi saat pemain menekan tombol "Lanjutkan".

Permainan memutar efek suara (Audio_Cue) untuk membuka kartu, kartu cocok, kartu tidak cocok, dan hitung mundur 3 detik terakhir. State sesi game-1 disimpan di LocalStorage sehingga refresh halaman dan tombol back browser tidak mengulang permainan: permainan yang sedang berjalan dilanjutkan dengan sisa waktu nyata, dan permainan yang sudah selesai langsung menampilkan Result_Screen.

Tampilan memakai container mobile maksimal 430px dengan latar gradasi vertikal putih ke biru muda dan wave di bagian bawah, latar body biru tua transparan khusus halaman game-1, font Noto Sans offline, serta warna biru tua `#141A8C` sebagai warna teks utama, warna tombol utama, dan border box petunjuk. Tampilan Home tidak berubah; Home hanya menyesuaikan perilaku tombol "Mulai Permainan" dan mengarah ke `game-1/index.html`.

Catatan konsistensi: folder aktual game bernama `game-1` (bukan `game1` seperti di aturan struktur).

## Glossary

- **Memory_Flip_Page**: halaman `game-1/index.html` beserta logika `game-1/game.js`.
- **Home**: halaman `index.html` di root, yang memiliki tombol "Mulai Permainan" dan memuat `js/storage.js`.
- **Intro_Screen**: tampilan pengenalan dan petunjuk yang ditampilkan sebelum permainan dimulai.
- **Game_Icon**: gambar ikon game pada Intro_Screen, yaitu `assets/icon-game-1.svg` (format SVG).
- **Instruction_Box**: box petunjuk pada Intro_Screen yang berisi judul "Cara Bermain", dua paragraf petunjuk, dan Time_Alert.
- **Time_Alert**: alert di dalam Instruction_Box yang menampilkan teks "Waktu bermain: 30 detik".
- **Game_Screen**: tampilan gameplay yang berisi judul "Memory Flip", Timer, skor, progress bar, dan Board.
- **Result_Screen**: tampilan hasil di `game-1/index.html` yang ditampilkan setelah permainan berakhir; berisi judul "Memory Flip", Memory_Flip_Score, dan tombol "Lanjutkan".
- **Board**: papan kartu berukuran 4 baris × 4 kolom (16 kartu).
- **Card**: satu kotak kartu pada Board. Sisi tertutup memakai `game-1/assets/back-card.jpg`; sisi terbuka memakai salah satu `game-1/assets/item-1.jpg` sampai `item-8.jpg`.
- **Pair**: dua Card dengan gambar item identik. Board berisi 8 Pair.
- **Matched_Card**: Card yang sudah ditemukan pasangannya dan tetap terbuka.
- **Timer**: hitung mundur 30 detik yang mulai berjalan setelah tombol Start ditekan.
- **Score_Store**: helper LocalStorage di `js/storage.js` dengan key `entrasol_game_score`.
- **Memory_Flip_Score**: nilai field `memoryFlip` pada Score_Store, yaitu 5 × jumlah Pair yang ditemukan (0 sampai 40).
- **Game_Session_State**: state sesi game-1 yang disimpan melalui `js/storage.js` pada key LocalStorage `entrasol_game1_state` (terpisah dari key skor). Berisi: fase (`playing` atau `finished`), urutan dek hasil acak, status tiap Card (`closed` atau `matched`), jumlah Pair yang ditemukan, waktu berakhir absolut (deadline, timestamp dalam milidetik), dan skor akhir bila fase `finished`.
- **Deadline**: field waktu berakhir absolut pada Game_Session_State, bernilai waktu saat tombol Start ditekan ditambah 30 detik.
- **Audio_Cue**: efek suara yang diputar dengan API Audio bawaan browser dari berkas di `game-1/assets/audio/`: `flip.mp3` (sekitar 0,3 detik), `match.mp3` (sekitar 1 detik), `wrong.mp3` (sekitar 1 detik), dan `countdown.mp3` (sekitar 3 detik).
- **Next_Game_Page**: halaman game berikutnya, yaitu `game-2/index.html`.
- **Biru_Tua**: warna `#141A8C` (variabel CSS `--entrasol-blue-dark`).

## Requirements

### Requirement 1: Konten Halaman Pengenalan

**User Story:** Sebagai pemain, saya ingin melihat pengenalan dan petunjuk game terlebih dahulu, sehingga saya paham cara bermain sebelum memulai.

#### Acceptance Criteria

1. WHEN Memory_Flip_Page dibuka dan tidak ada Game_Session_State yang valid, THE Memory_Flip_Page SHALL menampilkan Intro_Screen, menyembunyikan Game_Screen dan Result_Screen, dan tidak menjalankan Timer sampai tombol Start ditekan.
2. THE Intro_Screen SHALL menampilkan teks "GAME 01" sebagai elemen paling atas pada Intro_Screen.
3. THE Intro_Screen SHALL menampilkan Game_Icon langsung di bawah teks "GAME 01", bersumber dari `assets/icon-game-1.svg` dengan atribut `alt` yang deskriptif.
4. THE Intro_Screen SHALL menampilkan judul "Memory Flip" sebagai elemen `h1` langsung di bawah Game_Icon, dengan ukuran huruf judul lebih besar daripada ukuran huruf teks "GAME 01".
5. THE Intro_Screen SHALL menampilkan sub judul "Tantangan ini akan menguji daya ingatmu." langsung di bawah judul tanpa elemen lain di antaranya.
6. THE Intro_Screen SHALL menampilkan Instruction_Box langsung di bawah sub judul, berisi secara berurutan dari atas ke bawah: judul "Cara Bermain" sebagai elemen `h2` rata tengah, paragraf pertama "Pada layar akan terdapat 16 kartu tertutup. Temukan 8 pasangan gambar yang identik sebelum waktu habis.", paragraf kedua "Setiap detik berharga. Buka kartu, ingat posisinya, dan temukan pasangannya!", lalu Time_Alert sebagai elemen paling bawah di dalam Instruction_Box.
7. THE Time_Alert SHALL menampilkan teks "Waktu bermain: 30 detik" dan berada di dalam Instruction_Box, bukan di luar Instruction_Box.
8. THE Intro_Screen SHALL menampilkan tombol Start dengan label "Start" langsung di bawah Instruction_Box sebagai elemen paling bawah pada Intro_Screen.
9. THE Intro_Screen SHALL menampilkan seluruh elemen dalam urutan vertikal dari atas ke bawah: "GAME 01", Game_Icon, judul, sub judul, Instruction_Box, tombol Start.
10. WHILE Intro_Screen ditampilkan pada lebar viewport 320 px hingga 1920 px, THE Intro_Screen SHALL menampilkan seluruh elemen tanpa teks terpotong dan tanpa scroll horizontal.

### Requirement 2: Gaya Visual dan Konsistensi

**User Story:** Sebagai pemain, saya ingin tampilan game rapi, terbaca jelas, dan selaras dengan merek Entrasol, sehingga pengalaman terasa menyatu.

#### Acceptance Criteria

1. THE Memory_Flip_Page SHALL menggunakan Biru_Tua sebagai warna teks utama (teks "GAME 01", judul, sub judul, judul "Cara Bermain", teks petunjuk, skor, dan seluruh teks Result_Screen) serta sebagai warna utama tombol Start, tombol "Lanjutkan", dan border Instruction_Box.
2. THE Memory_Flip_Page SHALL menampilkan Instruction_Box dengan border berwarna Biru_Tua selebar 1px sampai 3px, latar putih, dan sudut membulat dengan radius minimal 8px.
3. THE Time_Alert SHALL berlebar 100% dari lebar Instruction_Box, berteks Biru_Tua, berlatar Biru_Tua transparan (sekitar `rgba(20,26,140,0.12)`), memiliki border tipis, dan memiliki sudut sedikit membulat dengan radius sekitar 0.5rem (bukan bentuk pill).
4. THE tombol Start SHALL berlatar Biru_Tua, bertulisan putih, berbentuk pill (radius sudut minimal setengah dari tinggi tombol), memiliki tinggi minimal 48px, dan lebar minimal 44px.
5. THE Memory_Flip_Page SHALL menggunakan container terpusat secara horizontal dengan lebar maksimum 430px, latar container berupa gradasi vertikal dari putih `#FFFFFF` di bagian atas ke biru muda `#A7D8F0` dengan opasitas 85% di bagian bawah, dan `assets/background-wave.svg` ditampilkan di bagian bawah container.
6. THE Memory_Flip_Page SHALL menerapkan latar body biru tua transparan `rgba(20,26,140,0.15)` melalui kelas khusus pada elemen `body` halaman game-1, sehingga latar body halaman Home tidak berubah.
7. THE Memory_Flip_Page SHALL menggunakan font Noto Sans dengan ukuran teks isi minimal 16px.
8. THE Memory_Flip_Page SHALL mendefinisikan gaya khusus Memory_Flip_Page di `css/style.css`, yaitu berkas yang sama dengan yang digunakan Home, tanpa mengubah tampilan Home yang sudah ada.
9. IF `assets/background-wave.svg` gagal dimuat, THEN THE Memory_Flip_Page SHALL tetap menampilkan latar gradasi container dan seluruh konten tanpa elemen gelombang, tanpa teks atau konten yang terpotong.
10. WHILE lebar viewport kurang dari 430px, THE Memory_Flip_Page SHALL menampilkan container selebar 100% viewport tanpa munculnya scroll horizontal.

### Requirement 3: Memulai Permainan

**User Story:** Sebagai pemain, saya ingin game dan timer baru mulai setelah saya menekan Start, sehingga saya punya waktu membaca petunjuk.

#### Acceptance Criteria

1. WHILE Intro_Screen ditampilkan, THE Timer SHALL tetap berhenti pada nilai 30 detik dan THE Memory_Flip_Page SHALL menolak interaksi pemain terhadap Card (tidak ada Card yang terbuka saat Card diklik atau disentuh).
2. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL menyembunyikan Intro_Screen dan menampilkan Game_Screen dalam waktu maksimal 500 milidetik.
3. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL mengacak posisi 16 Card sehingga setiap gambar item-1 sampai item-8 muncul tepat dua kali pada Board.
4. WHEN pemain menekan tombol Start, THE Timer SHALL mulai menghitung mundur dari 30 detik dengan interval 1 detik, menampilkan nilai integer dari 30 hingga 0, dan berhenti pada 0.
5. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL menampilkan seluruh 16 Card dalam keadaan tertutup (sisi belakang terlihat) dan skor bernilai 0.
6. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL menonaktifkan tombol Start sehingga penekanan berulang tidak mengacak ulang Board maupun mengatur ulang Timer.

### Requirement 4: Game_Screen dan Papan Kartu 4×4

**User Story:** Sebagai pemain, saya ingin layar permainan yang jelas judulnya dan papan kartu yang proporsional di semua ukuran layar, sehingga mudah disentuh dan dilihat.

#### Acceptance Criteria

1. THE Game_Screen SHALL menampilkan nama game "Memory Flip" sebagai judul yang terlihat berupa elemen `h2` di bagian paling atas Game_Screen, di atas Timer, skor, progress bar, dan Board, menggantikan `h2` tersembunyi "Papan Permainan".
2. THE Game_Screen SHALL menampilkan elemen secara berurutan dari atas ke bawah: judul "Memory Flip", Timer dan skor berjalan, progress bar, lalu Board.
3. THE Game_Screen SHALL menerapkan padding dan jarak antar elemen sehingga judul, Timer, skor, progress bar, dan Board tampil rapi tanpa tumpang tindih, tanpa teks terpotong, dan tanpa scroll horizontal pada lebar viewport 320px sampai 1920px.
4. THE Board SHALL menampilkan 16 Card dalam grid 4 kolom × 4 baris dengan jarak antar Card konstan (gap) antara 4px dan 12px pada semua ukuran layar.
5. THE Card SHALL berbentuk persegi (rasio lebar:tinggi 1:1) dengan sudut membulat berjari-jari antara 8px dan 16px dan bayangan halus.
6. THE Card SHALL memiliki panjang sisi antara 44px dan 100px, dan WHILE lebar container lebih kecil dari yang dibutuhkan untuk 4 Card berukuran 100px beserta gap, THE Card SHALL mengecil secara proporsional agar seluruh 4 kolom muat tanpa scroll horizontal.
7. WHILE Card dalam keadaan tertutup, THE Card SHALL menampilkan gambar `game-1/assets/back-card.jpg` beserta atribut `alt` yang deskriptif menyatakan bahwa kartu tertutup.
8. WHILE Card dalam keadaan terbuka, THE Card SHALL menampilkan tepat satu gambar dari `game-1/assets/item-1.jpg` sampai `item-8.jpg` beserta atribut `alt` yang deskriptif menyebutkan isi gambar, dan setiap gambar item SHALL muncul pada tepat 2 Card di Board.
9. WHEN Card dibuka atau ditutup, THE Card SHALL menampilkan animasi flip dengan transisi CSS selama antara 200 dan 400 milidetik.
10. IF gambar Card gagal dimuat, THEN THE Card SHALL tetap tampil dengan ukuran dan bentuk yang sama serta menampilkan teks `alt` sebagai pengganti gambar.
11. THE Game_Screen SHALL menampilkan Timer dalam angka detik dan progress bar di atas Board, serta skor berjalan (0 sampai 40 point) di dekat Timer.
12. WHEN Timer berkurang atau skor berubah, THE Game_Screen SHALL memperbarui angka detik, progress bar, dan skor berjalan dalam waktu maksimal 1 detik.

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
4. WHEN Timer mencapai 0 detik, THE Memory_Flip_Page SHALL mengakhiri permainan dan menampilkan angka 0 pada Timer; skor disimpan dan Result_Screen ditampilkan sesuai Requirement 7 dan Requirement 11.
5. WHEN kedelapan Pair telah ditemukan sebelum Timer mencapai 0, THE Memory_Flip_Page SHALL menghentikan Timer pada nilai sisa waktu saat itu dan mengakhiri permainan; skor 40 disimpan dan Result_Screen ditampilkan sesuai Requirement 7 dan Requirement 11.
6. WHEN permainan berakhir, THE Memory_Flip_Page SHALL menonaktifkan interaksi pada seluruh Card sehingga klik atau sentuhan pada Card tidak mengubah status Card manapun.
7. IF permainan berakhir saat dua Card yang tidak cocok sedang terbuka, THEN THE Memory_Flip_Page SHALL tidak menghitung Card tersebut sebagai Pair dan tidak menambahkan skor untuknya.

### Requirement 7: Penyimpanan Skor

**User Story:** Sebagai pemain, saya ingin skor game tersimpan dengan benar, sehingga dapat diakumulasi dalam skor total.

#### Acceptance Criteria

1. WHEN permainan berakhir (seluruh 8 Pair ditemukan atau waktu 30 detik habis), THE Memory_Flip_Page SHALL menyimpan Memory_Flip_Score ke Score_Store pada field `memoryFlip` melalui `js/storage.js`.
2. THE Memory_Flip_Score SHALL sama dengan 5 dikalikan jumlah Pair yang ditemukan, berupa bilangan bulat kelipatan 5 dengan rentang 0 sampai 40.
3. WHEN Memory_Flip_Score disimpan, THE Score_Store SHALL menghitung ulang `total` sebagai `memoryFlip + memoryRecall + memorize`, dengan rentang 0 sampai 100.
4. WHEN Memory_Flip_Score disimpan, THE Score_Store SHALL mempertahankan nilai field `memoryRecall` dan `memorize` yang sudah ada tanpa perubahan.
5. IF LocalStorage tidak tersedia atau data skor yang tersimpan bukan JSON valid atau tidak memuat keempat field numerik, THEN THE Score_Store SHALL menggunakan skor awal `{ memoryFlip: 0, memoryRecall: 0, memorize: 0, total: 0 }` sebagai dasar penyimpanan, dan THE Memory_Flip_Page SHALL tetap menampilkan Result_Screen.
6. IF penulisan ke LocalStorage gagal, THEN THE Memory_Flip_Page SHALL tetap menampilkan Result_Screen dengan Memory_Flip_Score yang dihitung pada sesi berjalan.
7. THE Memory_Flip_Page SHALL menyimpan Memory_Flip_Score ke Score_Store tepat satu kali per sesi permainan, termasuk ketika seluruh Pair ditemukan dan waktu habis terjadi hampir bersamaan.
8. FOR ALL jumlah Pair yang ditemukan dari 0 sampai 8, menyimpan Memory_Flip_Score lalu membaca kembali field `memoryFlip` SHALL menghasilkan nilai yang sama dengan 5 dikalikan jumlah Pair (properti round-trip).

### Requirement 8: Responsif, Offline, dan Struktur Berkas

**User Story:** Sebagai pemain dengan smartphone, saya ingin halaman nyaman dan berjalan offline, sehingga bisa dimainkan di mana saja.

#### Acceptance Criteria

1. THE Memory_Flip_Page SHALL menggunakan pendekatan mobile-first, dengan layout default satu kolom untuk lebar viewport 320px ke atas, dan tampil tanpa scroll horizontal serta tanpa elemen yang terpotong pada lebar viewport 320px, 768px, dan 1280px.
2. THE Memory_Flip_Page SHALL menampilkan papan kartu 4×4 dengan kartu berbentuk persegi (rasio lebar:tinggi 1:1) pada semua lebar viewport 320px sampai 1920px.
3. THE Memory_Flip_Page SHALL membatasi lebar container utama maksimum 430px dan memusatkannya secara horizontal pada viewport yang lebih lebar dari 430px.
4. THE Memory_Flip_Page SHALL memuat Bootstrap 5 dari `../vendor/bootstrap/`, CSS dari `../css/style.css`, serta skrip `../js/storage.js`, `../js/app.js`, dan `game.js` melalui path relatif lokal.
5. THE Memory_Flip_Page SHALL tidak mereferensikan CDN atau URL eksternal (diawali `http://`, `https://`, atau `//`) untuk aset apa pun, termasuk CSS, JavaScript, font, gambar, dan audio.
6. WHILE perangkat tidak memiliki koneksi jaringan, THE Memory_Flip_Page SHALL memuat semua aset dan dapat dimainkan dari awal sampai akhir tanpa kesalahan pemuatan sumber daya.
7. THE Memory_Flip_Page SHALL menggunakan JavaScript vanilla tanpa framework atau library JavaScript pihak ketiga selain Bootstrap 5.
8. THE logika gameplay SHALL berada di `game-1/game.js` dan akses LocalStorage SHALL hanya dilakukan melalui fungsi di `js/storage.js`, termasuk akses dari Home.
9. THE kartu dan tombol di Memory_Flip_Page SHALL memiliki ukuran target sentuh minimal 44×44px pada lebar viewport 320px sampai 1920px.
10. THE Memory_Flip_Page SHALL menggunakan elemen `h1` hanya pada Intro_Screen, berisi teks "Memory Flip"; elemen `h2` untuk "Cara Bermain" pada Instruction_Box, "Memory Flip" pada Game_Screen, dan judul "Memory Flip" pada Result_Screen; serta urutan tingkat heading tanpa melompati level.
11. WHERE Home mengarahkan ke game pertama, THE Home SHALL mengarah ke `game-1/index.html`.

### Requirement 9: Efek Suara (Audio_Cue)

**User Story:** Sebagai pemain, saya ingin mendengar efek suara saat bermain, sehingga permainan terasa lebih hidup dan responsif.

#### Acceptance Criteria

1. WHEN pemain membuka Card dan sentuhan tersebut diterima sesuai Requirement 5.1, THE Memory_Flip_Page SHALL memutar Audio_Cue `flip.mp3`.
2. WHEN dua Card terbuka memiliki gambar item yang sama, THE Memory_Flip_Page SHALL memutar Audio_Cue `match.mp3`.
3. WHEN dua Card terbuka memiliki gambar item yang berbeda, THE Memory_Flip_Page SHALL memutar Audio_Cue `wrong.mp3`.
4. WHEN sisa waktu Timer mencapai 3 detik pada sesi permainan yang sedang berjalan, THE Memory_Flip_Page SHALL memutar Audio_Cue `countdown.mp3` tepat satu kali.
5. IF permainan berakhir sebelum `countdown.mp3` selesai diputar, THEN THE Memory_Flip_Page SHALL menghentikan pemutaran `countdown.mp3`.
6. IF sisa waktu Timer sudah kurang dari atau sama dengan 3 detik saat sesi dipulihkan setelah halaman dimuat ulang, THEN THE Memory_Flip_Page SHALL tidak memutar `countdown.mp3` pada sesi yang dipulihkan tersebut.
7. WHEN pemain menyentuh Matched_Card, Card yang sedang terbuka, atau Card lain saat Board terkunci, atau permainan belum dimulai atau sudah berakhir, THE Memory_Flip_Page SHALL tidak memutar Audio_Cue apa pun.
8. IF pemutaran Audio_Cue diblokir oleh browser atau berkas audio gagal dimuat, THEN THE Memory_Flip_Page SHALL mengabaikan kegagalan tersebut dan melanjutkan permainan tanpa menampilkan error.
9. THE Memory_Flip_Page SHALL memuat seluruh Audio_Cue dari path relatif lokal `assets/audio/` menggunakan API Audio bawaan browser, tanpa CDN dan tanpa library pihak ketiga.

### Requirement 10: Persistensi Sesi pada Refresh dan Tombol Back

**User Story:** Sebagai pemain, saya ingin permainan tidak ulang dari awal ketika halaman di-refresh atau saya menekan tombol back, sehingga progres dan waktu tetap adil.

#### Acceptance Criteria

1. THE Score_Store helper di `js/storage.js` SHALL menyediakan fungsi untuk menyimpan, membaca, dan menghapus Game_Session_State pada key `entrasol_game1_state`, dan fungsi `resetScore` SHALL juga menghapus Game_Session_State.
2. WHEN pemain menekan tombol Start, THE Memory_Flip_Page SHALL menyimpan Game_Session_State dengan fase `playing`, urutan dek hasil acak, seluruh Card berstatus `closed`, jumlah Pair 0, dan Deadline sama dengan waktu saat ini ditambah 30 detik.
3. WHEN status Card atau jumlah Pair berubah selama fase `playing`, THE Memory_Flip_Page SHALL memperbarui Game_Session_State yang tersimpan.
4. WHEN Memory_Flip_Page dimuat ulang dan Game_Session_State valid berfase `playing` dengan waktu saat ini belum melewati Deadline, THE Memory_Flip_Page SHALL langsung menampilkan Game_Screen tanpa menampilkan Intro_Screen.
5. WHEN Game_Session_State berfase `playing` dipulihkan, THE Memory_Flip_Page SHALL memulihkan urutan Card yang sama, mempertahankan Matched_Card dalam keadaan terbuka dan bertanda, serta menampilkan skor berjalan sebesar 5 dikalikan jumlah Pair yang tersimpan.
6. WHEN Game_Session_State berfase `playing` dipulihkan, THE Timer SHALL melanjutkan hitung mundur dari sisa waktu nyata sebesar Deadline dikurangi waktu saat ini, termasuk waktu selama halaman dimuat ulang, dan THE Timer SHALL tidak diatur ulang ke 30 detik.
7. WHEN Game_Session_State berfase `playing` dipulihkan dan terdapat Card terbuka yang belum cocok, THE Memory_Flip_Page SHALL mengembalikan Card tersebut ke keadaan tertutup.
8. IF waktu saat ini telah melewati Deadline saat Memory_Flip_Page dimuat ulang pada fase `playing`, THEN THE Memory_Flip_Page SHALL mengakhiri permainan, menyimpan Memory_Flip_Score sesuai jumlah Pair yang tersimpan ke Score_Store, mengubah fase menjadi `finished` pada Game_Session_State, dan menampilkan Result_Screen.
9. WHEN Memory_Flip_Page dimuat ulang dan Game_Session_State valid berfase `finished`, THE Memory_Flip_Page SHALL langsung menampilkan Result_Screen dengan skor akhir yang tersimpan pada Game_Session_State, tanpa menyimpan skor ke Score_Store lagi.
10. WHEN pemain menekan tombol back browser dari Memory_Flip_Page, THE browser SHALL kembali ke Home, dan Game_Session_State SHALL tetap tersimpan tanpa dihapus.
11. WHEN pemain menekan tombol "Mulai Permainan" di Home dan Game_Session_State valid berfase `playing` ada, THE Home SHALL mengarahkan ke `game-1/index.html` tanpa mereset skor dan tanpa menghapus Game_Session_State, sehingga permainan dilanjutkan dengan perilaku pemulihan sesuai kriteria 4 sampai 8 termasuk sisa waktu nyata.
12. WHEN pemain menekan tombol "Mulai Permainan" di Home dan Game_Session_State valid berfase `finished` ada, THE Home SHALL mengarahkan ke `game-1/index.html` tanpa mereset skor dan tanpa menghapus Game_Session_State, sehingga Memory_Flip_Page langsung menampilkan Result_Screen.
13. IF Game_Session_State tidak ada saat pemain menekan tombol "Mulai Permainan" di Home, THEN THE Home SHALL mereset skor dan menghapus Game_Session_State melalui `resetScore`, lalu mengarahkan ke `game-1/index.html` yang menampilkan Intro_Screen.
14. THE Home SHALL memuat `js/storage.js` dan menggunakan fungsi di dalamnya untuk membaca Game_Session_State dan mereset skor, tanpa mengakses LocalStorage secara langsung.
15. IF data Game_Session_State tidak valid atau rusak, atau LocalStorage tidak tersedia, THEN THE Memory_Flip_Page SHALL memperlakukan kondisi tersebut sebagai sesi baru dengan menampilkan Intro_Screen tanpa menampilkan error.
16. THE Memory_Flip_Page SHALL menyimpan Memory_Flip_Score ke Score_Store dan menampilkan Result_Screen sebagai hasil akhir tepat satu kali per sesi permainan, termasuk ketika halaman dimuat ulang berkali-kali.
17. FOR ALL Game_Session_State yang valid, menyimpan lalu membaca kembali Game_Session_State SHALL menghasilkan data yang setara (properti round-trip).

### Requirement 11: Result_Screen dan Lanjut ke Game Berikutnya

**User Story:** Sebagai pemain, saya ingin melihat skor game-1 setelah selesai dan memilih sendiri kapan lanjut, sehingga saya tahu hasil saya sebelum melanjutkan.

#### Acceptance Criteria

1. WHEN permainan berakhir (seluruh 8 Pair ditemukan atau waktu 30 detik habis), THE Memory_Flip_Page SHALL menyembunyikan Game_Screen dan menampilkan Result_Screen pada halaman `game-1/index.html` yang sama tanpa menambah entri riwayat browser.
2. THE Result_Screen SHALL hanya berisi tiga elemen: judul "Memory Flip", Memory_Flip_Score, dan tombol "Lanjutkan".
3. THE Result_Screen SHALL menampilkan Memory_Flip_Score dalam angka berukuran huruf besar, dilengkapi keterangan "point" dan "dari 40".
4. THE tombol "Lanjutkan" SHALL berlatar Biru_Tua, bertulisan putih, berbentuk pill, dan memiliki tinggi minimal 48px serta lebar minimal 44px.
5. THE Result_Screen SHALL menampilkan seluruh teks dengan warna Biru_Tua dan latar mengikuti gaya halaman game-1.
6. WHEN pemain menekan tombol "Lanjutkan", THE Memory_Flip_Page SHALL mengarahkan ke Next_Game_Page.
7. WHILE Result_Screen ditampilkan, THE Memory_Flip_Page SHALL tidak berpindah ke Next_Game_Page secara otomatis.
8. WHEN Memory_Flip_Page dimuat ulang saat Result_Screen ditampilkan, THE Memory_Flip_Page SHALL tetap menampilkan Result_Screen dengan Memory_Flip_Score yang sama sesuai Requirement 10.9.
9. WHEN pemain menekan tombol back browser dari Result_Screen, THE browser SHALL kembali ke Home, dan WHEN pemain kemudian menekan "Mulai Permainan", THE Home SHALL mengarahkan ke `game-1/index.html` yang langsung menampilkan Result_Screen sesuai Requirement 10.12.
10. WHILE Result_Screen ditampilkan pada lebar viewport 320px sampai 1920px, THE Result_Screen SHALL menampilkan seluruh elemen tanpa teks terpotong dan tanpa scroll horizontal.

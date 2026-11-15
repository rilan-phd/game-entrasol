# Requirements Document

## Introduction

Fitur ini adalah halaman game ketiga, Memory Shuffle & Recall, yang berada di folder `game-3/`. Seluruh tampilan berada dalam satu file `game-3/index.html` dan mengikuti struktur konten game-1 dan game-2: Intro_Screen (teks "GAME 03", ikon game, judul, sub judul, box petunjuk berisi alert dua keterangan waktu, tombol "Mulai"), Countdown_Screen (overlay hitung mundur 3, 2, 1 selama 3 detik yang menutupi Game_Screen), Game_Screen (dua fase: fase mengingat 5 detik dan fase menyusun 5 detik), dan Result_Screen (judul, tiga gambar susunan pemain beserta ikon benar/salah, skor, tombol "Lihat Hasil"). Alur tampilan: Intro_Screen → Countdown_Screen → Game_Screen (Fase_Mengingat → Fase_Menyusun) → Result_Screen → `result.html`.

Pada Fase_Mengingat, tiga Card_Image ditampilkan horizontal selama 5 detik dalam urutan acak. Ketiganya berasal dari tiga folder berbeda: satu dari `game-3/assets/zaitun/`, satu dari `game-3/assets/product/`, dan satu dari `game-3/assets/organ/`, masing-masing dipilih acak. Pada Fase_Menyusun, ketiga Card_Image yang sama ditampilkan dengan susunan acak yang berbeda dari urutan asli. Pemain mengklik kartu satu per satu: klik pertama menjadi urutan 1, klik kedua urutan 2, klik ketiga urutan 3. Kartu yang sudah diklik terbang ke Slot bernomor berikutnya di bagian atas layar dan tidak dapat dibatalkan. Permainan berakhir saat ketiga Slot terisi atau saat waktu 5 detik habis. Penilaian: 10 point untuk setiap Slot yang berisi kartu pada urutan yang benar, maksimal 30 point. Slot yang belum terisi saat waktu habis dihitung salah. Skor disimpan ke LocalStorage pada field `memorize` tepat satu kali, lalu Result_Screen ditampilkan di halaman yang sama. Perpindahan ke `result.html` hanya terjadi saat pemain menekan tombol "Lihat Hasil"; tidak ada navigasi otomatis.

Selaras dengan game-1 dan game-2, state sesi game-3 disimpan di LocalStorage (key `entrasol_game3_state`) sehingga refresh dan tombol back browser tidak mengulang permainan: ronde yang sedang berjalan dilanjutkan berdasarkan waktu nyata, dan permainan yang sudah selesai langsung menampilkan Result_Screen. Refresh saat Countdown_Screen kembali ke Intro_Screen.

Tampilan memakai container mobile maksimal 430px, aturan fit-to-viewport (tanpa scroll vertikal pada tinggi layar 550px ke atas), font Noto Sans offline, latar gradasi putih ke cyan transparan, dan tombol berkelas `btn-entrasol`. Semua gaya khusus game-3 berprefix `shuffle-` di `css/style.css`.

### Asumsi Eksplisit

- **A1 (aset kartu):** Folder `game-3/assets/` berisi `zaitun/zaitun-1..3.jpg`, `product/product-1..10.jpg`, `organ/organ-1..3.jpg`, `checked.png`, `wrong.png`, `audio/flip.mp3`, dan `audio/countdown.mp3`. Aset ini dipakai apa adanya. Daftar gambar per folder didefinisikan sebagai konstanta tunggal sehingga penambahan gambar hanya perlu menambah satu entri.
- **A2 (kategori):** Tiga folder (`zaitun`, `product`, `organ`) diperlakukan sebagai tiga kategori. Setiap Round memuat tepat satu gambar dari tiap kategori, sehingga tiga kartu selalu unik.
- **A3 (urutan acak):** Urutan asli (Original_Order) adalah permutasi acak dari tiga kartu. Susunan pilihan (Option_Order) adalah permutasi acak yang berbeda dari Original_Order. Karena tiga kartu unik, permutasi berbeda selalu tersedia (5 dari 6 permutasi).
- **A4 (skor):** Skor dihitung per Slot, bukan per kartu terpilih. Karena kartu hanya berupa permutasi, satu Slot salah berarti paling sedikit dua Slot salah, sehingga skor yang mungkin hanya 0, 10, atau 30 bila ketiga Slot terisi. Bila waktu habis dengan Slot kosong, skor dapat bernilai 0, 10, 20, atau 30.
- **A5 (audio):** Audio yang dipakai: `countdown.mp3` saat Countdown_Screen dan `flip.mp3` saat setiap kartu diklik pada Fase_Menyusun. Kegagalan audio tidak mengganggu permainan.
- **A6 (ukuran kartu):** Ukuran kartu mengikuti instruksi desain: lebar 33% dari lebar konten container, dibatasi maksimum 220px, dan dikurangi sehingga tiga kartu beserta jarak 4px antar kartu muat dalam satu baris pada container 430px. Ukuran juga dibatasi tinggi layar.
- **A7 (persistensi):** Ronde (tiga id kartu, Original_Order, Option_Order), `memorizeEnd`, `answerEnd`, dan daftar pilihan pemain disimpan agar refresh melanjutkan ronde.

## Glossary

- **Shuffle_Recall_Page**: halaman `game-3/index.html` beserta logika `game-3/game.js`.
- **Home**: halaman `index.html` di root.
- **Result_Page**: halaman `result.html` di root yang menampilkan skor total.
- **Intro_Screen**: tampilan pengenalan dan petunjuk sebelum permainan dimulai (`#introScreen`).
- **Game_Icon**: ikon game `../assets/icon-game-3.svg` yang ditampilkan pada Intro_Screen dan, sebagai Screen_Icon, di bagian atas Game_Screen dan Result_Screen.
- **Screen_Icon**: Game_Icon berkelas `shuffle-screen-icon` di bagian paling atas Game_Screen (Fase_Mengingat dan Fase_Menyusun) dan Result_Screen.
- **Instruction_Box**: box petunjuk pada Intro_Screen yang berisi dua paragraf petunjuk dan Time_Alert.
- **Time_Alert**: alert di dalam Instruction_Box yang berisi dua keterangan waktu: "Waktu mengingat gambar: 5 detik" dan "Waktu memilih gambar: 5 detik".
- **Countdown_Screen**: overlay penuh di dalam container halaman game-3 (`section#countdownScreen`) yang menutupi Game_Screen selama PRE_COUNTDOWN setelah tombol Mulai ditekan; menampilkan teks "Bersiap..." dan angka besar 3, 2, 1.
- **PRE_COUNTDOWN**: durasi hitung mundur awal, yaitu 3 detik (konstanta `PRE_COUNTDOWN_SECONDS = 3`).
- **countdownNumber**: fungsi murni `countdownNumber(elapsedMs)` dengan perilaku sama seperti game-2.
- **Game_Screen**: tampilan gameplay yang berisi judul "Memory Shuffle & Recall", Phase_Badge, Timer_Fase, teks arahan, dan area kartu.
- **Fase_Mengingat**: fase pertama selama 5 detik yang menampilkan tiga Card_Image dalam Original_Order.
- **Fase_Menyusun**: fase kedua selama 5 detik yang menampilkan tiga Slot di bagian atas dan tiga Option_Card dalam Option_Order di bagian bawah.
- **Phase_Badge**: label fase: "Hafalkan!" berlatar Biru_Muda pada Fase_Mengingat, dan "Jawab sekarang!" berlatar Biru_Tua pada Fase_Menyusun.
- **Timer_Fase**: hitung mundur 5 detik per fase, berupa angka detik dan progress bar, yang baru berjalan setelah Countdown_Screen selesai.
- **Card_Image**: satu gambar kartu persegi pada daftar `CARD_IMAGES`.
- **CARD_IMAGES**: konstanta tunggal di `game-3/game.js` berisi daftar Card_Image dikelompokkan per kategori (`zaitun`, `product`, `organ`) dengan `id`, `category`, `src` relatif terhadap `game-3/`, dan `alt`.
- **Round**: hasil pemilihan satu permainan: `originalOrder` (tiga id unik, satu per kategori) dan `optionOrder` (permutasi dari `originalOrder` yang berbeda dari `originalOrder`).
- **Original_Order**: urutan tiga Card_Image pada Fase_Mengingat dari kiri ke kanan; urutan ini adalah jawaban benar.
- **Option_Order**: urutan tiga Option_Card pada Fase_Menyusun dari kiri ke kanan.
- **Slot**: kotak di bagian atas Fase_Menyusun yang diberi nomor 1, 2, atau 3 dan diisi oleh kartu terpilih.
- **Option_Card**: salah satu dari tiga kartu pilihan pada Fase_Menyusun, berupa tombol yang dapat diklik tepat satu kali.
- **Picks**: daftar id kartu yang dipilih pemain, berurutan menurut waktu klik; Picks[i] mengisi Slot i+1. Panjang Picks 0 sampai 3.
- **Fly_Animation**: animasi Option_Card bergerak dari posisinya ke Slot berikutnya selama sekitar 0,4 detik.
- **Result_Screen**: tampilan hasil di `game-3/index.html` yang berisi judul, tiga Result_Slot, Memorize_Score, dan tombol "Lihat Hasil".
- **Result_Slot**: satu kolom di Result_Screen yang berisi gambar kartu pada Slot tersebut (atau kotak kosong bila Slot tidak terisi) dan Result_Icon di bawahnya.
- **Result_Icon**: `assets/checked.png` bila Slot berisi kartu yang benar, `assets/wrong.png` bila Slot berisi kartu yang salah atau kosong.
- **Score_Store**: helper LocalStorage di `js/storage.js` dengan key `entrasol_game_score`.
- **Memorize_Score**: nilai field `memorize` pada Score_Store: 10 dikalikan jumlah Slot yang benar (0 sampai 30).
- **Game_Session_State**: state sesi game-3 pada key LocalStorage `entrasol_game3_state` (terpisah dari key skor). Berisi: fase (`playing` atau `finished`), Round, `memorizeEnd` dan `answerEnd` (timestamp absolut dalam milidetik), `picks`, serta `score` bila fase `finished`.
- **Biru_Tua**: warna `#141A8C` (`--entrasol-blue-dark`). **Biru_Muda**: `#A7D8F0` (`--entrasol-blue-light`). **Hijau_Muda**: `#8BC34A` (`--entrasol-green`).

## Requirements

### Requirement 1: Konten Intro_Screen

**User Story:** Sebagai pemain, saya ingin melihat pengenalan dan petunjuk game terlebih dahulu, sehingga saya paham cara bermain sebelum memulai.

#### Acceptance Criteria

1. WHEN Shuffle_Recall_Page dibuka dan tidak ada Game_Session_State yang valid, THE Shuffle_Recall_Page SHALL menampilkan Intro_Screen, menyembunyikan Countdown_Screen, Game_Screen, dan Result_Screen, dan tidak menjalankan Timer_Fase sampai tombol Mulai ditekan dan Countdown_Screen selesai.
2. THE Intro_Screen SHALL menampilkan teks "GAME 03" sebagai elemen paling atas.
3. THE Intro_Screen SHALL menampilkan Game_Icon bersumber dari `../assets/icon-game-3.svg` dengan atribut `alt` yang deskriptif langsung di bawah teks "GAME 03".
4. THE Intro_Screen SHALL menampilkan judul "Memory Shuffle & Recall" sebagai elemen `h1` langsung di bawah Game_Icon, dengan ukuran huruf lebih besar daripada teks "GAME 03".
5. THE Intro_Screen SHALL menampilkan sub judul "Ingat posisi kartu dan susun kembali urutannya!" langsung di bawah judul.
6. THE Intro_Screen SHALL menampilkan Instruction_Box langsung di bawah sub judul, berisi secara berurutan: paragraf pertama "Amati dan ingat urutan 3 kartu yang ditampilkan selama 5 detik.", paragraf kedua "Setelah itu, kartu akan diacak secara otomatis. Susun kembali ketiga kartu sesuai urutan semula dalam waktu 5 detik!", lalu Time_Alert sebagai elemen paling bawah di dalam Instruction_Box.
7. THE Time_Alert SHALL menampilkan dua keterangan sebagai dua baris terpisah: "Waktu mengingat gambar: 5 detik" dan "Waktu memilih gambar: 5 detik".
8. THE Intro_Screen SHALL menampilkan tombol berkelas `btn-entrasol` dengan label "Mulai" langsung di bawah Instruction_Box sebagai elemen paling bawah.
9. THE Intro_Screen SHALL menampilkan elemen dalam urutan vertikal: "GAME 03", Game_Icon, judul, sub judul, Instruction_Box, tombol "Mulai".

### Requirement 2: Gaya Visual

**User Story:** Sebagai pemain, saya ingin tampilan game-3 selaras dengan game lain dan tema Entrasol, sehingga pengalaman terasa menyatu.

#### Acceptance Criteria

1. THE Shuffle_Recall_Page SHALL menggunakan container terpusat dengan lebar maksimum 430px dan `margin: 0 auto` pada semua lebar viewport.
2. THE Shuffle_Recall_Page SHALL menampilkan latar container berupa gradasi vertikal dari putih `#FFFFFF` di bagian atas ke cyan transparan (sekitar `rgba(0, 188, 212, 0.35)`) di bagian bawah.
3. THE Shuffle_Recall_Page SHALL tidak menampilkan `assets/background-wave.svg` pada container maupun pseudo-element `::after`, sehingga latar hanya berupa gradasi.
4. THE Shuffle_Recall_Page SHALL menerapkan latar body melalui kelas `shuffle-body` pada elemen `body`, tanpa mengubah latar halaman lain.
5. THE tombol "Mulai" dan tombol "Lihat Hasil" SHALL memakai kelas `btn btn-entrasol` dengan tinggi minimal 48px dan lebar minimal 44px.
6. THE Instruction_Box SHALL berlatar putih, berborder selebar 2px, dengan sudut membulat berjari-jari minimal 8px.
7. THE Time_Alert SHALL berlebar 100% Instruction_Box, berteks Biru_Tua, berlatar transparan terang, berborder tipis, dengan radius sekitar 0.5rem (bukan pill).
8. THE Shuffle_Recall_Page SHALL menggunakan font Noto Sans dan Biru_Tua sebagai warna teks utama.
9. THE Shuffle_Recall_Page SHALL mendefinisikan seluruh gaya khusus game-3 dengan kelas berprefix `shuffle-` di `css/style.css` tanpa mengubah tampilan Home, Memory Flip, dan Memory Recall.
10. IF `../assets/icon-game-3.svg` gagal dimuat pada Game_Screen atau Result_Screen, THEN THE Shuffle_Recall_Page SHALL tetap menampilkan latar gradasi dan seluruh konten lain tanpa konten terpotong.

### Requirement 3: Memulai Permainan dan Countdown_Screen

**User Story:** Sebagai pemain, saya ingin hitung mundur 3, 2, 1 setelah menekan Mulai, sehingga saya siap sebelum kartu muncul.

#### Acceptance Criteria

1. WHEN pemain menekan tombol "Mulai", THE Shuffle_Recall_Page SHALL menyembunyikan Intro_Screen, menampilkan Game_Screen tanpa Card_Image (hanya bingkai kosong), dan menampilkan Countdown_Screen sebagai overlay penuh di dalam container yang menutupi Game_Screen.
2. WHILE Countdown_Screen ditampilkan, THE Shuffle_Recall_Page SHALL menampilkan angka 3, 2, lalu 1, masing-masing selama 1 detik, sehingga Countdown_Screen berlangsung selama PRE_COUNTDOWN (3 detik).
3. THE Countdown_Screen SHALL berlatar putih semi-opaque (sekitar `rgba(255, 255, 255, 0.85)`), menampilkan teks "Bersiap..." berwarna Biru_Tua tepat di atas angka, dan menampilkan angka berwarna Biru_Tua, tebal, berukuran sekitar 8rem, terpusat horizontal dan vertikal.
4. THE angka hitung mundur SHALL berada dalam elemen non-heading dengan `role="status"` dan `aria-live="assertive"`.
5. WHEN Countdown_Screen mulai ditampilkan, THE Shuffle_Recall_Page SHALL memutar `game-3/assets/audio/countdown.mp3` tepat satu kali.
6. WHILE Countdown_Screen ditampilkan, THE Shuffle_Recall_Page SHALL menonaktifkan tombol "Mulai", mengabaikan penekanan berulang, menjaga Timer_Fase tetap berhenti, tidak memilih Round, dan tidak menyimpan Game_Session_State.
7. WHEN angka 1 telah tampil selama 1 detik, THE Shuffle_Recall_Page SHALL menyembunyikan Countdown_Screen dalam waktu maksimal 500 milidetik, memilih Round, menetapkan `memorizeEnd` sama dengan waktu saat itu ditambah 5 detik dan `answerEnd` sama dengan `memorizeEnd` ditambah 5 detik, menyimpan Game_Session_State fase `playing`, dan memulai Fase_Mengingat.
8. IF pemain meninggalkan halaman saat Countdown_Screen ditampilkan, THEN THE Shuffle_Recall_Page SHALL menghentikan hitung mundur sehingga tidak ada timer tersisa dan menghentikan pemutaran `countdown.mp3`.
9. IF pemutaran audio diblokir oleh browser atau berkas audio gagal dimuat, THEN THE Shuffle_Recall_Page SHALL melanjutkan permainan tanpa menampilkan error.
10. WHILE Game_Screen dalam Fase_Mengingat atau Fase_Menyusun, atau Game_Session_State dipulihkan, THE Shuffle_Recall_Page SHALL tidak memutar `countdown.mp3`.
11. FOR ALL nilai `elapsedMs`, THE fungsi `countdownNumber` SHALL menghasilkan 3 bila `elapsedMs` negatif, non-finite, atau kurang dari 1000; 2 bila kurang dari 2000; 1 bila kurang dari 3000; dan 0 (selesai) bila 3000 atau lebih.

### Requirement 4: Daftar Gambar dan Pembentukan Round

**User Story:** Sebagai pemain, saya ingin kartu dan urutannya berbeda setiap permainan, sehingga permainan tidak dapat dihafal polanya.

#### Acceptance Criteria

1. THE Shuffle_Recall_Page SHALL mendefinisikan CARD_IMAGES sebagai satu konstanta di `game-3/game.js` yang berisi entri `zaitun-1` sampai `zaitun-3` (kategori `zaitun`), `product-1` sampai `product-10` (kategori `product`), dan `organ-1` sampai `organ-3` (kategori `organ`), dengan `src` relatif (mis. `assets/zaitun/zaitun-1.jpg`) dan `alt` deskriptif.
2. WHEN Round dibentuk, THE fungsi `buildRound` SHALL memilih tepat satu Card_Image secara acak dari tiap kategori `zaitun`, `product`, dan `organ`.
3. WHEN Round dibentuk, THE fungsi `buildRound` SHALL menghasilkan `originalOrder` berupa permutasi acak dari tiga Card_Image terpilih, berisi tiga id unik.
4. WHEN Round dibentuk, THE fungsi `buildRound` SHALL menghasilkan `optionOrder` berupa permutasi dari `originalOrder` yang berbeda dari `originalOrder` pada setidaknya satu posisi.
5. THE fungsi `buildRound` SHALL menerima sumber acak sebagai parameter dan tidak mengubah CARD_IMAGES.
6. WHERE entri baru ditambahkan ke CARD_IMAGES pada salah satu kategori, THE fungsi `buildRound` SHALL memakai entri tersebut sebagai kandidat tanpa perubahan kode lain.
7. IF salah satu dari tiga kategori tidak memiliki entri pada CARD_IMAGES, THEN THE fungsi `buildRound` SHALL mengembalikan `null`, dan THE Shuffle_Recall_Page SHALL menonaktifkan tombol "Mulai" tanpa melempar error.
8. IF Card_Image gagal dimuat, THEN THE Shuffle_Recall_Page SHALL tetap menampilkan bingkai dengan ukuran dan bentuk yang sama serta teks `alt`.

### Requirement 5: Fase Mengingat

**User Story:** Sebagai pemain, saya ingin melihat tiga kartu dalam urutan tertentu selama 5 detik, sehingga saya dapat menghafal urutannya.

#### Acceptance Criteria

1. WHEN Fase_Mengingat dimulai, THE Game_Screen SHALL menampilkan judul `h2` "Memory Shuffle & Recall", Phase_Badge "Hafalkan!" berlatar Biru_Muda dengan teks Biru_Tua, Timer_Fase bernilai 5, teks "Perhatikan gambar berikut dan urutannya" di atas kartu, dan tiga Card_Image dalam Original_Order.
2. THE tiga Card_Image pada Fase_Mengingat SHALL tersusun horizontal dalam satu baris dari kiri ke kanan, masing-masing berbentuk persegi (rasio 1:1) berlebar 33% dari lebar konten container, dibatasi maksimum 220px, dengan jarak 4px antar kartu, dan berborder tipis Biru_Muda.
3. THE tiga Card_Image SHALL muat dalam satu baris tanpa scroll horizontal pada lebar viewport 320px sampai 1920px.
4. WHILE Fase_Mengingat berlangsung, THE Timer_Fase SHALL berkurang 1 setiap 1 detik dari 5 hingga 0 dan memperbarui angka serta progress bar dalam 1 detik.
5. WHILE Fase_Mengingat berlangsung, THE Shuffle_Recall_Page SHALL tidak menampilkan Slot dan Option_Card serta tidak menerima klik pemilihan.
6. WHEN Fase_Mengingat selesai (5 detik berlalu sejak dimulai), THE Shuffle_Recall_Page SHALL beralih ke Fase_Menyusun secara otomatis tanpa tombol dan tanpa mengubah halaman.
7. WHILE sisa waktu Timer_Fase kurang dari atau sama dengan 2 detik dan lebih dari 0, THE Timer_Fase SHALL menampilkan angka dengan warna peringatan.
8. WHILE Fase_Mengingat berlangsung, THE Game_Screen SHALL menampilkan angka urutan 1, 2, 3 tepat di bawah masing-masing Card_Image dari kiri ke kanan (angka mengikuti posisi kotak), dengan font tebal dan rata tengah, tanpa membuat Game_Screen memerlukan scroll vertikal pada tinggi layar >= 550px, dan tidak menampilkan angka tersebut pada Fase_Menyusun maupun Result_Screen.
9. THE Game_Screen SHALL menampilkan Screen_Icon di bagian paling atas, di atas judul `h2`, dengan tinggi 56px yang mengecil hingga 32px mengikuti tinggi layar, dan `alt` deskriptif.

### Requirement 6: Fase Menyusun

**User Story:** Sebagai pemain, saya ingin menyusun kembali urutan kartu dengan mengklik kartu satu per satu, sehingga saya dapat mengumpulkan point.

#### Acceptance Criteria

1. WHEN Fase_Menyusun dimulai, THE Game_Screen SHALL menampilkan Phase_Badge "Jawab sekarang!" berlatar Biru_Tua dengan teks putih, Timer_Fase bernilai 5, tiga Slot kosong di bagian paling atas area kartu, teks "Pilih gambar dengan urutan yang tepat" di bawah Slot, dan tiga Option_Card dalam Option_Order di bawah teks tersebut.
2. THE tiga Slot SHALL tersusun horizontal dalam satu baris, berukuran persegi sama dengan Card_Image pada Fase_Mengingat (33% lebar konten container, maksimum 220px), berjarak 4px antar Slot, berborder tipis Hijau_Muda, dan menampilkan angka 1, 2, 3 berurutan dari kiri ke kanan di tengah Slot dengan ukuran font sedang dan tebal.
3. THE Game_Screen SHALL menempatkan jarak 16px antara baris Slot dan teks "Pilih gambar dengan urutan yang tepat", dan jarak 8px antara teks tersebut dan baris Option_Card.
4. THE tiga Option_Card SHALL berukuran sama dengan Slot, tersusun horizontal dengan jarak 4px antar kartu, berupa elemen `button` dengan `aria-label` deskriptif, dan menampilkan gambar sesuai `optionOrder`.
5. WHILE Fase_Menyusun berlangsung, THE Timer_Fase SHALL berkurang 1 setiap 1 detik dari 5 hingga 0 dan memperbarui angka serta progress bar dalam 1 detik.
6. WHEN pemain menekan Option_Card yang belum dipilih selama Fase_Menyusun dan panjang Picks kurang dari 3, THE Shuffle_Recall_Page SHALL menambahkan id kartu tersebut ke akhir Picks, memutar `game-3/assets/audio/flip.mp3`, dan menjalankan Fly_Animation kartu tersebut ke Slot bernomor panjang Picks setelah penambahan.
7. THE Fly_Animation SHALL berlangsung sekitar 0,4 detik dan menggerakkan kartu dari posisi Option_Card ke posisi Slot tujuan.
8. WHEN sebuah Option_Card telah dipilih, THE Shuffle_Recall_Page SHALL menonaktifkan Option_Card tersebut dan mengabaikan penekanan berikutnya sehingga pilihan tidak dapat dibatalkan atau dipilih ulang.
9. WHEN pemain menekan beberapa Option_Card secara beruntun cepat, THE Shuffle_Recall_Page SHALL menetapkan nomor urutan tiap kartu berdasarkan urutan penekanan pada saat penekanan terjadi, tanpa menunggu Fly_Animation sebelumnya selesai, sehingga tidak ada dua kartu menempati Slot yang sama dan tidak ada Slot terlewat.
10. WHEN panjang Picks mencapai 3, THE Shuffle_Recall_Page SHALL mengakhiri permainan dan menampilkan Result_Screen setelah Fly_Animation kartu ketiga selesai, dalam waktu maksimal 600 milidetik setelah penekanan ketiga.
11. WHEN Timer_Fase Fase_Menyusun mencapai 0 dan panjang Picks kurang dari 3, THE Shuffle_Recall_Page SHALL mengakhiri permainan dengan Picks yang ada dan menampilkan Result_Screen.
12. WHILE Fase_Menyusun belum dimulai atau permainan sudah berakhir, THE Shuffle_Recall_Page SHALL mengabaikan klik pada Option_Card.
13. WHILE sisa waktu Timer_Fase kurang dari atau sama dengan 2 detik dan lebih dari 0, THE Timer_Fase SHALL menampilkan angka dengan warna peringatan.
14. WHEN Fase_Menyusun dimulai, THE progress bar Timer_Fase SHALL langsung terisi penuh (100%) tanpa animasi pelebaran dari kosong, lalu menyusut mengikuti hitung mundur dari 5.
15. THE Game_Screen SHALL tetap menampilkan Screen_Icon di bagian paling atas pada Fase_Menyusun.

### Requirement 7: Penilaian

**User Story:** Sebagai pemain, saya ingin skor dihitung per posisi yang benar, sehingga susunan yang sebagian benar tetap mendapat point.

#### Acceptance Criteria

1. THE fungsi `gradeSlots(originalOrder, picks)` SHALL menghasilkan array tiga boolean dengan elemen ke-i bernilai `true` bila `picks[i]` ada dan sama dengan `originalOrder[i]`, dan `false` bila `picks[i]` tidak ada atau berbeda.
2. THE fungsi `calcScore(originalOrder, picks)` SHALL menghasilkan 10 dikalikan jumlah elemen `true` dari `gradeSlots(originalOrder, picks)`.
3. FOR ALL Picks lengkap (tiga id unik dari `originalOrder`), THE fungsi `calcScore` SHALL menghasilkan salah satu dari 0, 10, atau 30 dan tidak pernah 20.
4. FOR ALL Picks yang panjangnya kurang dari 3, THE fungsi `calcScore` SHALL menghitung Slot kosong sebagai salah dan menghasilkan kelipatan 10 antara 0 dan 30.
5. WHEN Picks sama dengan `originalOrder`, THE fungsi `calcScore` SHALL menghasilkan 30.

### Requirement 8: Result_Screen

**User Story:** Sebagai pemain, saya ingin melihat susunan saya beserta benar atau salahnya dan skor, serta memilih sendiri kapan lanjut, sehingga saya tahu hasil saya.

#### Acceptance Criteria

1. WHEN permainan berakhir, THE Shuffle_Recall_Page SHALL menyembunyikan Game_Screen dan menampilkan Result_Screen di halaman yang sama tanpa menambah entri riwayat browser.
2. THE Result_Screen SHALL menampilkan Screen_Icon di bagian paling atas, lalu judul `h2` "Memory Shuffle & Recall", lalu tiga Result_Slot horizontal, lalu Memorize_Score, lalu tombol "Lihat Hasil", dalam urutan vertikal tersebut.
3. THE Result_Slot ke-i SHALL menampilkan gambar kartu Picks[i] pada kotak berukuran sama dengan Slot dan Result_Icon di bawah gambar.
4. WHEN Slot ke-i benar menurut `gradeSlots`, THE Result_Slot ke-i SHALL menampilkan `assets/checked.png` dengan `alt` "Posisi benar".
5. WHEN Slot ke-i salah menurut `gradeSlots`, THE Result_Slot ke-i SHALL menampilkan `assets/wrong.png` dengan `alt` "Posisi salah".
6. WHEN Slot ke-i tidak terisi karena waktu habis, THE Result_Slot ke-i SHALL menampilkan kotak kosong bernomor `i+1` dan `assets/wrong.png` dengan `alt` "Posisi tidak terisi".
7. THE Result_Screen SHALL menampilkan Memorize_Score dalam angka besar dengan keterangan "point" dan "dari 30".
8. THE Result_Screen SHALL menampilkan tombol "Lihat Hasil" berkelas `btn btn-entrasol` dengan jarak 16px di bawah Memorize_Score.
9. WHEN pemain menekan tombol "Lihat Hasil", THE Shuffle_Recall_Page SHALL mengarahkan ke `../result.html` melalui helper navigasi di `js/app.js`.
10. WHILE Result_Screen ditampilkan, THE Shuffle_Recall_Page SHALL tidak berpindah ke Result_Page secara otomatis.
11. THE Result_Screen SHALL menampilkan seluruh teks dengan warna Biru_Tua tanpa teks terpotong pada lebar viewport 320px sampai 1920px.

### Requirement 9: Penyimpanan Skor

**User Story:** Sebagai pemain, saya ingin skor game-3 tersimpan dengan benar, sehingga dapat diakumulasi dalam skor total.

#### Acceptance Criteria

1. WHEN permainan berakhir, THE Shuffle_Recall_Page SHALL menyimpan Memorize_Score ke Score_Store pada field `memorize` melalui `js/storage.js` tepat satu kali per sesi permainan.
2. WHEN Memorize_Score disimpan, THE Score_Store SHALL menghitung ulang `total` sebagai `memoryFlip + memoryRecall + memorize` dan mempertahankan field `memoryFlip` dan `memoryRecall` tanpa perubahan.
3. IF LocalStorage tidak tersedia, data skor bukan JSON valid, atau penulisan gagal, THEN THE Shuffle_Recall_Page SHALL tetap menampilkan Result_Screen dengan skor yang dihitung pada sesi berjalan.
4. FOR ALL Picks, menyimpan `calcScore(originalOrder, picks)` ke field `memorize` lalu membaca kembali SHALL menghasilkan nilai yang sama (properti round-trip).
5. THE Shuffle_Recall_Page SHALL mengakses LocalStorage hanya melalui fungsi di `js/storage.js`.

### Requirement 10: Persistensi Sesi

**User Story:** Sebagai pemain, saya ingin permainan tidak mengulang saat halaman di-refresh atau saya menekan back, sehingga hasil tetap adil.

#### Acceptance Criteria

1. THE `js/storage.js` SHALL menyediakan fungsi untuk menyimpan, membaca (dengan validasi ketat), dan menghapus Game_Session_State pada key `entrasol_game3_state`, dan fungsi `resetScore` SHALL juga menghapus Game_Session_State game-3.
2. WHEN permainan dimulai setelah Countdown_Screen, THE Shuffle_Recall_Page SHALL menyimpan Game_Session_State fase `playing` berisi Round, `memorizeEnd`, `answerEnd`, dan `picks` kosong.
3. WHEN pemain memilih Option_Card, THE Shuffle_Recall_Page SHALL memperbarui `picks` pada Game_Session_State.
4. WHEN permainan berakhir, THE Shuffle_Recall_Page SHALL menyimpan Game_Session_State fase `finished` berisi Round, `picks`, dan `score`.
5. WHEN Shuffle_Recall_Page dimuat ulang dengan Game_Session_State `playing` dan waktu saat ini kurang dari `memorizeEnd`, THE Shuffle_Recall_Page SHALL langsung menampilkan Game_Screen pada Fase_Mengingat dengan Round yang sama dan sisa waktu nyata, tanpa Countdown_Screen.
6. WHEN Shuffle_Recall_Page dimuat ulang dengan Game_Session_State `playing` dan waktu saat ini antara `memorizeEnd` (inklusif) dan `answerEnd` (eksklusif), THE Shuffle_Recall_Page SHALL langsung menampilkan Game_Screen pada Fase_Menyusun dengan Option_Order yang sama, kartu yang sudah dipilih tampil pada Slotnya tanpa animasi, dan sisa waktu nyata `answerEnd` dikurangi waktu saat ini.
7. IF waktu saat ini mencapai atau melewati `answerEnd` saat halaman dimuat ulang pada fase `playing`, THEN THE Shuffle_Recall_Page SHALL mengakhiri permainan dengan Picks tersimpan, menyimpan skor ke Score_Store tepat satu kali, mengubah fase menjadi `finished`, dan menampilkan Result_Screen.
8. WHEN Shuffle_Recall_Page dimuat ulang dengan Game_Session_State `finished`, THE Shuffle_Recall_Page SHALL langsung menampilkan Result_Screen sesuai `picks` dan `score` tersimpan tanpa menyimpan skor ke Score_Store lagi.
9. IF Game_Session_State tidak ada, rusak, tidak valid, memuat id gambar yang tidak ada di CARD_IMAGES, atau LocalStorage tidak tersedia, THEN THE Shuffle_Recall_Page SHALL menampilkan Intro_Screen sebagai sesi baru tanpa menampilkan error.
10. WHEN Shuffle_Recall_Page dimuat ulang saat Countdown_Screen ditampilkan, THE Shuffle_Recall_Page SHALL menampilkan Intro_Screen karena tidak ada Game_Session_State tersimpan.
11. WHEN pemain menekan tombol back browser dari Shuffle_Recall_Page, THE browser SHALL kembali ke halaman sebelumnya dan Game_Session_State SHALL tetap tersimpan tanpa dihapus.
12. THE Shuffle_Recall_Page SHALL tidak menambah entri riwayat browser saat berpindah antar tampilan di halaman yang sama.
13. FOR ALL Game_Session_State yang valid, menyimpan lalu membaca kembali SHALL menghasilkan data yang setara (properti round-trip).
14. FOR ALL Game_Session_State fase `playing` yang valid dan waktu `now`, THE fungsi `restoreState` SHALL menghasilkan tahap `memorize` bila `now < memorizeEnd`, `answer` bila `memorizeEnd <= now < answerEnd`, dan hasil yang memerlukan finalisasi bila `now >= answerEnd`.

### Requirement 11: Fit-to-Viewport, Responsif, dan Offline

**User Story:** Sebagai pemain smartphone, saya ingin seluruh tampilan muat di layar tanpa scroll dan berjalan offline, sehingga nyaman dimainkan di mana saja.

#### Acceptance Criteria

1. WHILE tinggi viewport 550px atau lebih, THE Shuffle_Recall_Page SHALL menampilkan Intro_Screen, Countdown_Screen, Game_Screen (Fase_Mengingat dan Fase_Menyusun, termasuk saat Fly_Animation berlangsung), dan Result_Screen tanpa scroll vertikal, termasuk pada viewport sekitar 375×553.
2. WHILE tinggi viewport kurang dari 550px, THE Shuffle_Recall_Page SHALL membolehkan scroll vertikal.
3. THE Shuffle_Recall_Page SHALL menghitung tinggi container, ukuran font, jarak, ikon, dan ukuran kartu dari satuan `--dvh` dengan `clamp(min, calc(N * var(--dvh)), max)`, dengan `max` sama dengan ukuran desain penuh.
4. THE ukuran kartu dan Slot SHALL dibatasi sehingga judul, Phase_Badge, Timer_Fase, teks arahan, baris Slot, dan baris Option_Card muat dalam satu layar pada tinggi 550px.
5. THE Shuffle_Recall_Page SHALL tidak menampilkan scroll horizontal pada lebar viewport 320px sampai 1920px, termasuk saat Fly_Animation berlangsung.
6. THE Shuffle_Recall_Page SHALL tidak memakai utility spasi Bootstrap bertanda `!important` (`mb-*`, `py-*`, dan sejenisnya) pada elemen yang harus mengecil mengikuti tinggi layar.
7. THE Shuffle_Recall_Page SHALL memuat Bootstrap 5 dari `../vendor/bootstrap/`, CSS dari `../css/style.css`, serta `../js/storage.js`, `../js/app.js`, dan `game.js` melalui path relatif lokal.
8. THE Shuffle_Recall_Page SHALL tidak mereferensikan CDN atau URL eksternal untuk aset apa pun dan memakai JavaScript vanilla tanpa framework atau library pihak ketiga selain Bootstrap 5.
9. THE Shuffle_Recall_Page SHALL menggunakan tepat satu `h1` (judul Intro_Screen), `h2` untuk judul Game_Screen dan Result_Screen, dan atribut `alt` deskriptif pada semua gambar.
10. THE Phase_Badge SHALL membedakan fase lewat teks dan warna sehingga informasi fase tidak hanya disampaikan lewat warna.
11. WHERE pengguna mengaktifkan `prefers-reduced-motion`, THE Shuffle_Recall_Page SHALL menonaktifkan animasi pulse angka hitung mundur dan memendekkan Fly_Animation menjadi perpindahan langsung.

### Requirement 12: Integrasi dengan Alur Aplikasi

**User Story:** Sebagai pemain, saya ingin alur game-2 ke game-3 ke halaman hasil berjalan berurutan, sehingga skor terakumulasi dengan benar.

#### Acceptance Criteria

1. WHEN pemain menekan "Lanjutkan" di Result_Screen game-2, THE Shuffle_Recall_Page SHALL dimuat melalui `game-3/index.html` dan menampilkan Intro_Screen bila belum ada Game_Session_State game-3.
2. WHEN `resetScore` dipanggil dari Home untuk sesi baru, THE Score_Store SHALL menghapus Game_Session_State game-3 sehingga Shuffle_Recall_Page menampilkan Intro_Screen.
3. THE Shuffle_Recall_Page SHALL tidak mengubah field `memoryFlip` dan `memoryRecall` pada Score_Store.
4. WHEN Result_Page dimuat setelah game-3 selesai, THE Result_Page SHALL membaca Memorize_Score dari field `memorize` pada Score_Store.

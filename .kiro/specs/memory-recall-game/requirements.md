# Requirements Document

## Introduction

Fitur ini adalah halaman game kedua, Memory Recall, yang berada di folder `game-2/`. Seluruh tampilan berada dalam satu file `game-2/index.html` dan mengikuti struktur konten game-1: Intro_Screen (teks "GAME 02", ikon game, judul, sub judul, box petunjuk berisi alert dua keterangan waktu, tombol "Mulai"), Countdown_Screen (overlay hitung mundur 3, 2, 1 selama 3 detik yang menutupi Game_Screen), Game_Screen (dua fase: fase mengingat 5 detik dan fase memilih 5 detik), dan Result_Screen (judul, ikon hasil, skor, tombol "Lanjutkan"). Alur tampilan: Intro_Screen → Countdown_Screen → Game_Screen (Fase_Mengingat → Fase_Memilih) → Result_Screen.

Pada Fase_Mengingat, satu Card_Image yang dipilih acak ditampilkan selama 5 detik. Pada Fase_Memilih, tiga Card_Image ditampilkan dalam susunan piramida (satu di atas, dua di bawah) dan pemain memilih gambar yang tadi dihafal dalam 5 detik. Satu dari tiga pilihan adalah gambar target, dua lainnya adalah pengecoh: satu Sibling_Image (gambar sejenis dari grup yang sama dengan target, mis. target `1-a` pasti disertai `1-b`) dan satu gambar dari grup lain, dan posisi ketiganya diacak. Penilaian bersifat all-or-nothing: jawaban benar bernilai 30 point, jawaban salah atau waktu habis bernilai 0 point. Skor disimpan ke LocalStorage pada field `memoryRecall` tepat satu kali, lalu Result_Screen ditampilkan. Perpindahan ke game berikutnya hanya terjadi saat pemain menekan tombol "Lanjutkan"; tidak ada navigasi otomatis.

State sesi game-2 disimpan di LocalStorage (key `entrasol_game2_state`) sehingga refresh dan tombol back browser tidak mengulang permainan: ronde yang sedang berjalan dilanjutkan berdasarkan waktu nyata (tanpa mengulang Fase_Mengingat dari awal), dan permainan yang sudah selesai langsung menampilkan Result_Screen. Selaras dengan game-1, refresh saat Countdown_Screen kembali ke Intro_Screen.

Tampilan memakai container mobile maksimal 430px, aturan fit-to-viewport (tanpa scroll vertikal pada tinggi layar 550px ke atas), font Noto Sans offline, dan tema warna hijau muda `#8BC34A` (selaras dengan warna item "Memory Recall" di daftar game Home). Semua gaya khusus game-2 berprefix `recall-` di `css/style.css`.

### Asumsi Eksplisit

- **A1 (aset kartu):** Folder `game-2/assets/` saat ini berisi 4 gambar kartu persegi 360×360: `1-a.jpg` (Entrasol Active Choco Delight), `1-b.jpg` (Entrasol Active Vanilla Latte), `2-a.jpg` (Entrasol Gold Chocolate), dan `2-b.jpg` (Entrasol Gold Vanilla). Penamaan `N-a`/`N-b` dibaca sebagai dua varian rasa dari satu lini produk yang tampilannya mirip; angka sebelum tanda hubung (`1`, `2`) adalah grup, sehingga `1-a` dan `1-b` sejenis, dan `2-a` dan `2-b` sejenis. Keempatnya diperlakukan sebagai gambar yang setara dan valid sebagai target maupun pengecoh; varian mirip justru menjadi pengecoh yang menantang.
- **A2 (pemilihan pengecoh):** Target dipilih acak dari seluruh gambar. Tiga pilihan SELALU terdiri dari: target, Sibling_Image (gambar lain dalam grup yang sama dengan target), dan satu gambar acak dari grup lain; posisi ketiganya diacak. Contoh: target `1-a` menghasilkan pilihan `1-a`, `1-b`, dan salah satu dari `2-a` atau `2-b` dalam urutan acak. Dengan 4 gambar tersedia 4 kemungkinan target dan 2 kemungkinan gambar grup lain per target.
- **A3 (penambahan aset):** Aset kartu baru dapat ditambahkan nanti hanya dengan menambah satu entri pada konstanta daftar gambar di `game-2/game.js`, tanpa mengubah logika lain. Minimal diperlukan 3 gambar unik.
- **A4 (audio):** Satu-satunya aset audio game-2 adalah `game-2/assets/audio/countdown.mp3`, dipakai pada Countdown_Screen. Tidak ada efek suara lain pada game-2.
- **A5 (jawaban):** Pemain hanya dapat memilih satu gambar; pemilihan pertama langsung mengakhiri permainan tanpa tombol konfirmasi.
- **A6 (refresh saat ronde berjalan):** Ronde (gambar target, tiga pilihan beserta posisinya) disimpan saat permainan dimulai setelah Countdown_Screen. Saat halaman dimuat ulang, fase dan sisa waktu ditentukan dari waktu absolut yang tersimpan, bukan diulang dari awal.

## Glossary

- **Memory_Recall_Page**: halaman `game-2/index.html` beserta logika `game-2/game.js`.
- **Home**: halaman `index.html` di root.
- **Intro_Screen**: tampilan pengenalan dan petunjuk sebelum permainan dimulai (`#introScreen`).
- **Game_Icon**: ikon game pada Intro_Screen, yaitu `../assets/icon-game-2.svg`.
- **Instruction_Box**: box petunjuk pada Intro_Screen yang berisi dua paragraf petunjuk dan Time_Alert.
- **Time_Alert**: alert di dalam Instruction_Box yang berisi dua keterangan waktu: "Waktu mengingat gambar: 5 detik" dan "Waktu memilih gambar: 5 detik".
- **Countdown_Screen**: overlay penuh di dalam container halaman game-2 (`section#countdownScreen`) yang menutupi Game_Screen selama PRE_COUNTDOWN setelah tombol Mulai ditekan; menampilkan teks "Bersiap..." dan angka besar 3, 2, 1.
- **PRE_COUNTDOWN**: durasi hitung mundur awal, yaitu 3 detik (konstanta `PRE_COUNTDOWN_SECONDS = 3`).
- **countdownNumber**: fungsi murni `countdownNumber(elapsedMs)`: kurang dari 1000 ms menghasilkan 3, kurang dari 2000 ms menghasilkan 2, kurang dari 3000 ms menghasilkan 1, 3000 ms atau lebih menghasilkan 0 (selesai); nilai negatif atau non-finite menghasilkan 3.
- **Game_Screen**: tampilan gameplay yang berisi judul "Memory Recall", Phase_Badge, Timer_Fase, dan area gambar.
- **Fase_Mengingat**: fase pertama selama 5 detik yang menampilkan satu Target_Image dengan teks "Perhatikan gambar berikut".
- **Fase_Memilih**: fase kedua selama 5 detik yang menampilkan tiga Option_Image dengan teks "Pilih gambar yang tepat".
- **Phase_Badge**: label fase yang terlihat: "Hafalkan!" berlatar biru muda pada Fase_Mengingat, dan "Jawab sekarang!" berlatar biru tua pada Fase_Memilih.
- **Timer_Fase**: hitung mundur 5 detik per fase, berupa angka detik dan progress bar, yang baru berjalan setelah Countdown_Screen selesai.
- **Card_Image**: satu gambar kartu persegi pada daftar `CARD_IMAGES`.
- **CARD_IMAGES**: konstanta tunggal di `game-2/game.js` berisi daftar Card_Image (`id`, `src` relatif terhadap `game-2/`, `alt`); saat ini 4 entri: `1-a`, `1-b`, `2-a`, `2-b`.
- **Round**: hasil pemilihan satu permainan: `targetId` dan `optionIds` (3 id unik berposisi acak yang memuat `targetId`).
- **Target_Image**: Card_Image yang ditampilkan pada Fase_Mengingat dan menjadi jawaban benar.
- **Group**: kelompok Card_Image sejenis, diambil dari angka sebelum tanda hubung pada id (`1-a` dan `1-b` berada di grup `1`).`n- **Sibling_Image**: Card_Image lain dalam Group yang sama dengan Target_Image; selalu menjadi salah satu Option_Image.`n- **Decoy_Image**: Option_Image selain Target_Image; dua per Round: satu Sibling_Image dan satu gambar dari Group lain. Keduanya berbeda satu sama lain dan berbeda dari Target_Image.
- **Option_Image**: salah satu dari tiga gambar pilihan pada Fase_Memilih, berupa tombol yang dapat diklik.
- **Pyramid_Layout**: susunan tiga Option_Image: satu di baris atas terpusat, dua di baris bawah berdampingan; margin 4px pada tiap gambar sehingga jarak antar gambar 8px.
- **Result_Screen**: tampilan hasil di `game-2/index.html` yang berisi judul "Memory Recall", Result_Icon, Memory_Recall_Score, dan tombol "Lanjutkan".
- **Result_Status**: salah satu dari `correct`, `wrong`, `timeout`.
- **Result_Icon**: gambar hasil: `assets/checked.png` untuk `correct`, `assets/wrong.png` untuk `wrong`, `assets/times-up.png` untuk `timeout`.
- **Score_Store**: helper LocalStorage di `js/storage.js` dengan key `entrasol_game_score`.
- **Memory_Recall_Score**: nilai field `memoryRecall` pada Score_Store: 30 jika Result_Status `correct`, selain itu 0.
- **Game_Session_State**: state sesi game-2 pada key LocalStorage `entrasol_game2_state` (terpisah dari key skor). Berisi: fase (`playing` atau `finished`), Round (`targetId`, `optionIds`), `memorizeEnd` dan `answerEnd` (timestamp absolut dalam milidetik), serta `result` (Result_Status) dan `score` bila fase `finished`.
- **Next_Game_Page**: halaman game berikutnya, yaitu `../game-3/index.html`.
- **Biru_Tua**: warna `#141A8C` (`--entrasol-blue-dark`). **Biru_Muda**: `#A7D8F0` (`--entrasol-blue-light`). **Hijau_Muda**: `#8BC34A` (`--entrasol-green`).

## Requirements

### Requirement 1: Konten Intro_Screen

**User Story:** Sebagai pemain, saya ingin melihat pengenalan dan petunjuk game terlebih dahulu, sehingga saya paham cara bermain sebelum memulai.

#### Acceptance Criteria

1. WHEN Memory_Recall_Page dibuka dan tidak ada Game_Session_State yang valid, THE Memory_Recall_Page SHALL menampilkan Intro_Screen, menyembunyikan Countdown_Screen, Game_Screen, dan Result_Screen, dan tidak menjalankan Timer_Fase sampai tombol Mulai ditekan dan Countdown_Screen selesai.
2. THE Intro_Screen SHALL menampilkan teks "GAME 02" sebagai elemen paling atas.
3. THE Intro_Screen SHALL menampilkan Game_Icon bersumber dari `../assets/icon-game-2.svg` dengan atribut `alt` yang deskriptif langsung di bawah teks "GAME 02".
4. THE Intro_Screen SHALL menampilkan judul "Memory Recall" sebagai elemen `h1` langsung di bawah Game_Icon, dengan ukuran huruf lebih besar daripada teks "GAME 02".
5. THE Intro_Screen SHALL menampilkan sub judul "Amati baik-baik gambar yang muncul di layar." langsung di bawah judul.
6. THE Intro_Screen SHALL menampilkan Instruction_Box langsung di bawah sub judul, berisi secara berurutan: paragraf pertama "Satu gambar akan ditampilkan selama 5 detik. Perhatikan setiap detailnya dan ingat baik-baik!", paragraf kedua "Setelah gambar menghilang, temukan gambar yang sama di antara 3 pilihan yang tersedia!", lalu Time_Alert sebagai elemen paling bawah di dalam Instruction_Box.
7. THE Time_Alert SHALL menampilkan dua keterangan di dalam Instruction_Box: "Waktu mengingat gambar: 5 detik" dan "Waktu memilih gambar: 5 detik".
8. THE Intro_Screen SHALL menampilkan tombol dengan label "Mulai" langsung di bawah Instruction_Box sebagai elemen paling bawah.
9. THE Intro_Screen SHALL menampilkan elemen dalam urutan vertikal: "GAME 02", Game_Icon, judul, sub judul, Instruction_Box, tombol "Mulai".

### Requirement 2: Gaya Visual Tema Hijau

**User Story:** Sebagai pemain, saya ingin tampilan game-2 selaras dengan warna Memory Recall di Home, sehingga pengalaman terasa menyatu.

#### Acceptance Criteria

1. THE Memory_Recall_Page SHALL menggunakan container terpusat dengan lebar maksimum 430px dan `margin: 0 auto` pada semua lebar viewport.
2. THE Memory_Recall_Page SHALL menampilkan latar container berupa gradasi vertikal dari putih `#FFFFFF` di bagian atas ke Hijau_Muda transparan (sekitar `rgba(139, 195, 74, 0.45)`) di bagian bawah.
3. THE Memory_Recall_Page SHALL menampilkan `assets/background-wave.svg` di dasar container melalui pseudo-element `::after` seperti game-1, di bawah konten.
4. THE Memory_Recall_Page SHALL menerapkan latar body Hijau_Muda transparan (sekitar `rgba(139, 195, 74, 0.2)`) melalui kelas `recall-body` pada elemen `body`, tanpa mengubah latar halaman lain.
5. THE tombol "Mulai" dan tombol "Lanjutkan" SHALL berlatar Hijau_Muda, bertulisan Biru_Tua, berbentuk pill, dengan tinggi minimal 48px dan lebar minimal 44px.
6. THE Memory_Recall_Page SHALL memakai teks berwarna Biru_Tua pada tombol Hijau_Muda karena rasio kontras Biru_Tua terhadap Hijau_Muda lebih dari 4,5:1, sedangkan teks putih terhadap Hijau_Muda kurang dari 3:1.
7. THE Instruction_Box SHALL berlatar putih, berborder Hijau_Muda selebar 2px, dengan sudut membulat berjari-jari minimal 8px.
8. THE Time_Alert SHALL berlebar 100% Instruction_Box, berteks Biru_Tua, berlatar Hijau_Muda transparan (sekitar `rgba(139, 195, 74, 0.2)`), berborder tipis, dengan radius sekitar 0.5rem (bukan pill), dan menampilkan dua keterangan waktu sebagai dua baris terpisah.
9. THE Memory_Recall_Page SHALL menggunakan font Noto Sans dan Biru_Tua sebagai warna teks utama.
10. THE Memory_Recall_Page SHALL mendefinisikan seluruh gaya khusus game-2 dengan kelas berprefix `recall-` di `css/style.css` tanpa mengubah tampilan Home dan Memory Flip.
11. IF `assets/background-wave.svg` gagal dimuat, THEN THE Memory_Recall_Page SHALL tetap menampilkan latar gradasi dan seluruh konten tanpa elemen gelombang dan tanpa konten terpotong.

### Requirement 3: Memulai Permainan dan Countdown_Screen

**User Story:** Sebagai pemain, saya ingin hitung mundur 3, 2, 1 setelah menekan Mulai, sehingga saya siap sebelum gambar target muncul.

#### Acceptance Criteria

1. WHEN pemain menekan tombol "Mulai", THE Memory_Recall_Page SHALL menyembunyikan Intro_Screen, menampilkan Game_Screen tanpa Target_Image dan tanpa Option_Image (hanya bingkai kosong), dan menampilkan Countdown_Screen sebagai overlay penuh di dalam container yang menutupi Game_Screen.
2. WHILE Countdown_Screen ditampilkan, THE Memory_Recall_Page SHALL menampilkan angka 3, 2, lalu 1, masing-masing selama 1 detik, sehingga Countdown_Screen berlangsung selama PRE_COUNTDOWN (3 detik).
3. THE Countdown_Screen SHALL berlatar putih semi-opaque (sekitar `rgba(255, 255, 255, 0.85)`), menampilkan teks "Bersiap..." berwarna Biru_Tua tepat di atas angka, dan menampilkan angka berwarna Biru_Tua, tebal, berukuran sekitar 8rem, terpusat horizontal dan vertikal.
4. THE Countdown_Screen SHALL tidak memakai elemen heading, dan angka hitung mundur SHALL berada dalam elemen non-heading dengan `role="status"` dan `aria-live="assertive"`.
5. WHEN Countdown_Screen mulai ditampilkan, THE Memory_Recall_Page SHALL memutar `game-2/assets/audio/countdown.mp3` tepat satu kali.
6. WHILE Countdown_Screen ditampilkan, THE Memory_Recall_Page SHALL menonaktifkan tombol "Mulai", mengabaikan penekanan berulang, menjaga Timer_Fase tetap berhenti, tidak memilih Round, dan tidak menyimpan Game_Session_State.
7. WHEN angka 1 telah tampil selama 1 detik, THE Memory_Recall_Page SHALL menyembunyikan Countdown_Screen dalam waktu maksimal 500 milidetik, memilih Round, menetapkan `memorizeEnd` sama dengan waktu saat itu ditambah 5 detik dan `answerEnd` sama dengan `memorizeEnd` ditambah 5 detik, menyimpan Game_Session_State fase `playing`, dan memulai Fase_Mengingat.
8. IF pemain meninggalkan halaman saat Countdown_Screen ditampilkan, THEN THE Memory_Recall_Page SHALL menghentikan hitung mundur awal sehingga tidak ada timer tersisa dan menghentikan pemutaran `countdown.mp3`.
9. IF pemutaran `countdown.mp3` diblokir oleh browser atau berkas gagal dimuat, THEN THE Memory_Recall_Page SHALL melanjutkan hitung mundur sampai permainan dimulai tanpa menampilkan error.
10. WHILE Game_Screen dalam fase mengingat atau memilih atau Game_Session_State dipulihkan, THE Memory_Recall_Page SHALL tidak memutar `countdown.mp3`.
11. FOR ALL nilai `elapsedMs` bilangan real, THE fungsi `countdownNumber` SHALL menghasilkan 3 bila `elapsedMs` negatif, non-finite, atau kurang dari 1000; 2 bila kurang dari 2000; 1 bila kurang dari 3000; dan 0 (selesai) bila 3000 atau lebih, sehingga nilainya tidak pernah bertambah ketika `elapsedMs` bertambah pada rentang finite nonnegatif.

### Requirement 4: Daftar Gambar dan Pembentukan Round

**User Story:** Sebagai pemain, saya ingin gambar target dan pilihan berbeda setiap permainan, sehingga permainan tidak dapat dihafal polanya.

#### Acceptance Criteria

1. THE Memory_Recall_Page SHALL mendefinisikan CARD_IMAGES sebagai satu konstanta di `game-2/game.js` yang berisi entri `1-a`, `1-b`, `2-a`, dan `2-b` dengan `group` (`1` atau `2`), `src` relatif (`assets/<id>.jpg`) dan `alt` deskriptif yang menyebut lini produk dan rasa.
2. WHEN Round dibentuk, THE fungsi `buildRound` SHALL memilih satu `targetId` secara acak dari CARD_IMAGES.
3. WHEN Round dibentuk, THE fungsi `buildRound` SHALL memilih satu Sibling_Image (secara acak bila ada lebih dari satu) dari Group yang sama dengan Target_Image dan satu gambar dari Group lain secara acak sebagai Decoy_Image, sehingga Sibling_Image selalu ada di antara tiga pilihan.
4. WHEN Round dibentuk, THE fungsi `buildRound` SHALL menghasilkan `optionIds` berisi tepat tiga id unik yang memuat `targetId` tepat satu kali, dengan urutan posisi diacak.
5. THE fungsi `buildRound` SHALL menerima sumber acak sebagai parameter dan tidak mengubah CARD_IMAGES.
6. WHERE entri baru ditambahkan ke CARD_IMAGES, THE fungsi `buildRound` SHALL memakai entri baru tersebut sebagai kandidat target dan pengecoh tanpa perubahan kode lain.
7. IF tidak ada Card_Image yang memiliki Sibling_Image sekaligus tersedia gambar dari Group lain (termasuk bila CARD_IMAGES berisi kurang dari 3 entri), THEN THE fungsi `buildRound` SHALL mengembalikan `null`, dan THE Memory_Recall_Page SHALL menonaktifkan tombol "Mulai" tanpa melempar error.
8. IF gambar Card_Image gagal dimuat, THEN THE Memory_Recall_Page SHALL tetap menampilkan bingkai dengan ukuran dan bentuk yang sama serta teks `alt`.

### Requirement 5: Fase Mengingat

**User Story:** Sebagai pemain, saya ingin melihat satu gambar selama 5 detik, sehingga saya dapat menghafalnya.

#### Acceptance Criteria

1. WHEN Fase_Mengingat dimulai, THE Game_Screen SHALL menampilkan judul `h2` "Memory Recall", Phase_Badge "Hafalkan!" berlatar Biru_Muda dengan teks Biru_Tua, Timer_Fase bernilai 5, teks "Perhatikan gambar berikut" di atas gambar, dan Target_Image di bawah teks tersebut.
2. THE Target_Image SHALL berbentuk persegi (rasio 1:1) berukuran 50% lebar konten container dikurangi margin, dibatasi maksimum 280px dan dibatasi tinggi layar agar muat sesuai Requirement 10, serta berborder Hijau_Muda selebar minimal 3px dengan sudut membulat.
3. WHILE Fase_Mengingat berlangsung, THE Timer_Fase SHALL berkurang 1 setiap 1 detik dari 5 hingga 0 dan memperbarui angka serta progress bar dalam 1 detik.
4. WHILE Fase_Mengingat berlangsung, THE Memory_Recall_Page SHALL tidak menampilkan Option_Image dan tidak menerima klik pemilihan.
5. WHEN Fase_Mengingat selesai (5 detik berlalu sejak dimulai), THE Memory_Recall_Page SHALL beralih ke Fase_Memilih secara otomatis tanpa tombol dan tanpa mengubah halaman.
6. WHILE sisa waktu Timer_Fase kurang dari atau sama dengan 2 detik dan lebih dari 0, THE Timer_Fase SHALL menampilkan angka dengan warna peringatan.

### Requirement 6: Fase Memilih

**User Story:** Sebagai pemain, saya ingin memilih gambar yang tadi saya hafal dari tiga pilihan, sehingga saya dapat mengumpulkan point.

#### Acceptance Criteria

1. WHEN Fase_Memilih dimulai, THE Game_Screen SHALL menyembunyikan Target_Image, menampilkan Phase_Badge "Jawab sekarang!" berlatar Biru_Tua dengan teks putih, Timer_Fase bernilai 5, teks "Pilih gambar yang tepat" di atas gambar, dan tiga Option_Image dalam Pyramid_Layout.
2. THE Pyramid_Layout SHALL menempatkan satu Option_Image di baris atas terpusat horizontal dan dua Option_Image di baris bawah berdampingan, dengan margin 4px pada tiap Option_Image sehingga jarak antar gambar 8px.
3. THE Option_Image SHALL berbentuk persegi berukuran sama dengan Target_Image, berborder Hijau_Muda, dan berupa elemen `button` dengan target sentuh minimal 44×44px dan `aria-label` deskriptif.
4. THE tiga Option_Image SHALL menampilkan gambar sesuai `optionIds` pada Round, dengan Target_Image tepat satu kali dan dua Decoy_Image yang berbeda.
5. WHILE Fase_Memilih berlangsung, THE Timer_Fase SHALL berkurang 1 setiap 1 detik dari 5 hingga 0 dan memperbarui angka serta progress bar dalam 1 detik.
6. WHEN pemain menekan satu Option_Image selama Fase_Memilih, THE Memory_Recall_Page SHALL mengakhiri permainan dan menampilkan Result_Screen dalam waktu maksimal 500 milidetik.
7. WHEN Timer_Fase Fase_Memilih mencapai 0 tanpa pemilihan, THE Memory_Recall_Page SHALL mengakhiri permainan dengan Result_Status `timeout` dan menampilkan Result_Screen.
8. WHILE Fase_Memilih belum dimulai atau permainan sudah berakhir, THE Memory_Recall_Page SHALL mengabaikan klik pada Option_Image.
9. WHEN pemain menekan Option_Image lebih dari satu kali, THE Memory_Recall_Page SHALL hanya memproses penekanan pertama.
10. WHILE sisa waktu Timer_Fase kurang dari atau sama dengan 2 detik dan lebih dari 0, THE Timer_Fase SHALL menampilkan angka dengan warna peringatan.

### Requirement 7: Penilaian dan Result_Screen

**User Story:** Sebagai pemain, saya ingin melihat hasil jawaban dan skor, serta memilih sendiri kapan lanjut, sehingga saya tahu hasil saya.

#### Acceptance Criteria

1. THE fungsi `gradeAnswer(targetId, chosenId)` SHALL menghasilkan `correct` bila `chosenId` sama dengan `targetId`, dan `wrong` bila berbeda.
2. THE fungsi `calcScore(resultStatus)` SHALL menghasilkan 30 untuk `correct` dan 0 untuk `wrong`, `timeout`, atau nilai lain.
3. WHEN permainan berakhir, THE Memory_Recall_Page SHALL menyembunyikan Game_Screen dan menampilkan Result_Screen di halaman yang sama tanpa menambah entri riwayat browser.
4. THE Result_Screen SHALL menampilkan judul `h2` "Memory Recall", Result_Icon langsung di bawah judul, Memory_Recall_Score dalam angka besar dengan keterangan "point" dan "dari 30", lalu tombol "Lanjutkan".
5. WHEN Result_Status `correct`, THE Result_Screen SHALL menampilkan `assets/checked.png` dengan `alt` "Jawaban benar".
6. WHEN Result_Status `wrong`, THE Result_Screen SHALL menampilkan `assets/wrong.png` dengan `alt` "Jawaban salah".
7. WHEN Result_Status `timeout`, THE Result_Screen SHALL menampilkan `assets/times-up.png` dengan `alt` "Waktu habis".
8. WHEN pemain menekan tombol "Lanjutkan", THE Memory_Recall_Page SHALL mengarahkan ke Next_Game_Page.
9. WHILE Result_Screen ditampilkan, THE Memory_Recall_Page SHALL tidak berpindah ke Next_Game_Page secara otomatis.
10. THE Result_Screen SHALL menampilkan seluruh teks dengan warna Biru_Tua tanpa teks terpotong pada lebar viewport 320px sampai 1920px.

### Requirement 8: Penyimpanan Skor

**User Story:** Sebagai pemain, saya ingin skor game-2 tersimpan dengan benar, sehingga dapat diakumulasi dalam skor total.

#### Acceptance Criteria

1. WHEN permainan berakhir, THE Memory_Recall_Page SHALL menyimpan Memory_Recall_Score ke Score_Store pada field `memoryRecall` melalui `js/storage.js` tepat satu kali per sesi permainan.
2. WHEN Memory_Recall_Score disimpan, THE Score_Store SHALL menghitung ulang `total` sebagai `memoryFlip + memoryRecall + memorize` dan mempertahankan field `memoryFlip` dan `memorize` tanpa perubahan.
3. IF LocalStorage tidak tersedia, data skor bukan JSON valid, atau penulisan gagal, THEN THE Memory_Recall_Page SHALL tetap menampilkan Result_Screen dengan skor yang dihitung pada sesi berjalan.
4. FOR ALL Result_Status, menyimpan `calcScore(status)` ke field `memoryRecall` lalu membaca kembali SHALL menghasilkan nilai yang sama (properti round-trip).
5. THE Memory_Recall_Page SHALL mengakses LocalStorage hanya melalui fungsi di `js/storage.js`.

### Requirement 9: Persistensi Sesi

**User Story:** Sebagai pemain, saya ingin permainan tidak mengulang saat halaman di-refresh atau saya menekan back, sehingga hasil tetap adil.

#### Acceptance Criteria

1. THE `js/storage.js` SHALL menyediakan fungsi untuk menyimpan, membaca (dengan validasi ketat), dan menghapus Game_Session_State pada key `entrasol_game2_state`, dan fungsi `resetScore` SHALL juga menghapus Game_Session_State game-2.
2. WHEN permainan dimulai setelah Countdown_Screen, THE Memory_Recall_Page SHALL menyimpan Game_Session_State fase `playing` berisi Round, `memorizeEnd`, dan `answerEnd` sesuai Requirement 3.7.
3. WHEN permainan berakhir, THE Memory_Recall_Page SHALL menyimpan Game_Session_State fase `finished` berisi Round, `result`, dan `score`.
4. WHEN Memory_Recall_Page dimuat ulang dengan Game_Session_State `playing` dan waktu saat ini kurang dari `memorizeEnd`, THE Memory_Recall_Page SHALL langsung menampilkan Game_Screen pada Fase_Mengingat dengan Round yang sama dan sisa waktu nyata `memorizeEnd` dikurangi waktu saat ini, tanpa Countdown_Screen.
5. WHEN Memory_Recall_Page dimuat ulang dengan Game_Session_State `playing` dan waktu saat ini antara `memorizeEnd` (inklusif) dan `answerEnd` (eksklusif), THE Memory_Recall_Page SHALL langsung menampilkan Game_Screen pada Fase_Memilih dengan Round dan posisi pilihan yang sama dan sisa waktu nyata `answerEnd` dikurangi waktu saat ini.
6. IF waktu saat ini mencapai atau melewati `answerEnd` saat halaman dimuat ulang pada fase `playing`, THEN THE Memory_Recall_Page SHALL mengakhiri permainan dengan Result_Status `timeout`, menyimpan skor 0 ke Score_Store tepat satu kali, mengubah fase menjadi `finished`, dan menampilkan Result_Screen.
7. WHEN Memory_Recall_Page dimuat ulang dengan Game_Session_State `finished`, THE Memory_Recall_Page SHALL langsung menampilkan Result_Screen sesuai `result` dan `score` tersimpan tanpa menyimpan skor ke Score_Store lagi.
8. IF Game_Session_State tidak ada, rusak, tidak valid, atau LocalStorage tidak tersedia, THEN THE Memory_Recall_Page SHALL menampilkan Intro_Screen sebagai sesi baru tanpa menampilkan error.
9. WHEN Memory_Recall_Page dimuat ulang saat Countdown_Screen ditampilkan, THE Memory_Recall_Page SHALL menampilkan Intro_Screen karena tidak ada Game_Session_State tersimpan.
10. WHEN pemain menekan tombol back browser dari Memory_Recall_Page, THE browser SHALL kembali ke halaman sebelumnya dan Game_Session_State SHALL tetap tersimpan tanpa dihapus.
11. THE Memory_Recall_Page SHALL tidak menambah entri riwayat browser saat berpindah antar tampilan di halaman yang sama.
12. FOR ALL Game_Session_State yang valid, menyimpan lalu membaca kembali SHALL menghasilkan data yang setara (properti round-trip).
13. FOR ALL Game_Session_State fase `playing` yang valid dan waktu `now`, THE fungsi `restoreState` SHALL menghasilkan tahap `memorize` bila `now < memorizeEnd`, `answer` bila `memorizeEnd <= now < answerEnd`, dan hasil `timeout` yang memerlukan finalisasi bila `now >= answerEnd`.

### Requirement 10: Fit-to-Viewport, Responsif, dan Offline

**User Story:** Sebagai pemain smartphone, saya ingin seluruh tampilan muat di layar tanpa scroll dan berjalan offline, sehingga nyaman dimainkan di mana saja.

#### Acceptance Criteria

1. WHILE tinggi viewport 550px atau lebih, THE Memory_Recall_Page SHALL menampilkan Intro_Screen, Countdown_Screen, Game_Screen (Fase_Mengingat dan Fase_Memilih), dan Result_Screen tanpa scroll vertikal, termasuk pada viewport sekitar 375×553.
2. WHILE tinggi viewport kurang dari 550px, THE Memory_Recall_Page SHALL membolehkan scroll vertikal.
3. THE Memory_Recall_Page SHALL menghitung tinggi container, ukuran font, jarak, ikon, dan ukuran gambar dari satuan `--dvh` dengan `clamp(min, calc(N * var(--dvh)), max)`, dengan `max` sama dengan ukuran desain penuh.
4. THE ukuran gambar Target_Image dan Option_Image SHALL dibatasi sehingga judul, Phase_Badge, Timer_Fase, teks arahan, dan dua baris Pyramid_Layout muat dalam satu layar pada tinggi 550px.
5. THE Memory_Recall_Page SHALL tidak menampilkan scroll horizontal pada lebar viewport 320px sampai 1920px.
6. THE Memory_Recall_Page SHALL tidak memakai utility spasi Bootstrap bertanda `!important` (`mb-*`, `py-*`, dan sejenisnya) pada elemen yang harus mengecil mengikuti tinggi layar.
7. THE Memory_Recall_Page SHALL memuat Bootstrap 5 dari `../vendor/bootstrap/`, CSS dari `../css/style.css`, serta `../js/storage.js`, `../js/app.js`, dan `game.js` melalui path relatif lokal.
8. THE Memory_Recall_Page SHALL tidak mereferensikan CDN atau URL eksternal untuk aset apa pun.
9. THE Memory_Recall_Page SHALL menggunakan JavaScript vanilla tanpa framework atau library pihak ketiga selain Bootstrap 5.
10. THE Memory_Recall_Page SHALL menggunakan tepat satu `h1` (judul Intro_Screen), `h2` untuk judul Game_Screen dan Result_Screen, dan atribut `alt` deskriptif pada semua gambar.
11. THE Phase_Badge SHALL membedakan fase lewat teks dan warna sehingga informasi fase tidak hanya disampaikan lewat warna.
12. WHERE pengguna mengaktifkan `prefers-reduced-motion`, THE Memory_Recall_Page SHALL menonaktifkan animasi pulse angka hitung mundur.

### Requirement 11: Integrasi dengan Alur Aplikasi

**User Story:** Sebagai pemain, saya ingin alur game-1 ke game-2 ke game-3 berjalan berurutan, sehingga skor terakumulasi dengan benar.

#### Acceptance Criteria

1. WHEN pemain menekan "Lanjutkan" di Result_Screen game-1, THE Memory_Recall_Page SHALL dimuat melalui `game-2/index.html` dan menampilkan Intro_Screen bila belum ada Game_Session_State game-2.
2. WHEN `resetScore` dipanggil dari Home untuk sesi baru, THE Score_Store SHALL menghapus Game_Session_State game-2 sehingga Memory_Recall_Page menampilkan Intro_Screen.
3. THE Memory_Recall_Page SHALL tidak mengubah field `memoryFlip` dan `memorize` pada Score_Store.

# Design & UX Guidelines

Pedoman visual dan interaksi untuk seluruh halaman aplikasi. Tujuannya menjaga tampilan konsisten, mencerminkan merek Entrasol, dan nyaman digunakan di semua ukuran layar.

## Palet Warna (Tema Entrasol)

Tema warna: **Putih, Hijau muda, Biru muda, Biru tua**. Nilai hex berikut adalah **acuan awal** — sesuaikan jika ada panduan brand resmi Entrasol.

| Peran | Warna | Hex (acuan) | Penggunaan |
|-------|-------|-------------|------------|
| Background utama | Putih | `#FFFFFF` | Latar halaman, kartu konten |
| Aksen / sukses | Hijau muda | `#8BC34A` | Highlight, indikator benar, aksen branding |
| Sekunder / lembut | Biru muda | `#A7D8F0` | Panel, latar section, badge, fase hafal |
| Primer / utama | Biru tua | `#0D47A1` | Tombol utama (Start), header, teks penekanan, fase jawab |

Pedoman penggunaan:
- **Biru tua** sebagai warna primer untuk tombol aksi utama (Start) dan elemen penting.
- **Hijau muda** untuk feedback positif (pasangan cocok, jawaban benar) dan sentuhan aksen.
- **Biru muda** untuk latar panel/section yang lembut dan area sekunder.
- **Putih** mendominasi background agar bersih dan terbaca.
- Jaga **kontras** yang cukup antara teks dan latar (teks gelap di atas latar terang).
- Disarankan mendefinisikan warna sebagai CSS custom properties di `:root` (mis. `--entrasol-blue-dark`, `--entrasol-blue-light`, `--entrasol-green`, `--entrasol-white`) agar konsisten dan mudah diubah.

## Tipografi

- Font utama: **Noto Sans** (dimuat offline via `@font-face`, lihat `tech.md`).
- Terapkan ke seluruh aplikasi: `body { font-family: 'Noto Sans', sans-serif; }`.
- Sediakan setidaknya bobot Regular (400) dan Bold (700) untuk hierarki teks.
- Ukuran teks nyaman dibaca di mobile (body minimal ~16px) agar sesuai target remaja & dewasa.

## Responsive (Mobile-First)

- Pendekatan **mobile-first**: desain default untuk layar kecil, lalu tingkatkan untuk layar lebih besar memakai breakpoint Bootstrap.
- Wajib kompatibel di tiga kategori perangkat:
  - **Mobile** — prioritas utama; layout satu kolom, tombol besar mudah disentuh.
  - **Tablet** — manfaatkan ruang lebih, papan kartu lebih lega.
  - **Desktop** — konten terpusat dengan lebar maksimum (mis. container terbatas) agar tidak melebar berlebihan.
- Gunakan **grid & utility responsive Bootstrap** (`container`, `row`, `col`, breakpoint `sm/md/lg/xl`).
- Target sentuh minimal ~44×44px untuk tombol dan kartu agar ramah jari.
- Papan Memory Flip 4×4 harus tetap proporsional (kartu persegi) di semua ukuran — gunakan grid responsif dengan rasio aspek terjaga.

## Pedoman Komponen UI

### Tombol Start
- Warna primer **biru tua**, teks putih, ukuran besar dan menonjol.
- Ada di landing page dan di tiap halaman game.
- Jelas sebagai call-to-action utama di layar.

### Panel Petunjuk
- Setiap halaman game menampilkan **petunjuk permainan** sebelum mulai.
- Gunakan panel/card dengan latar **biru muda** lembut agar mudah dibaca dan terpisah dari area permainan.
- Teks petunjuk singkat, jelas, dan langsung (cara bermain + durasi).

### Indikator Timer
- Tampilkan hitung mundur yang jelas (angka detik dan/atau progress bar).
- Posisikan di tempat yang mudah terlihat (atas area permainan).
- Pertimbangkan perubahan warna saat waktu menipis untuk memberi urgensi.

### Indikator Fase (Memory Recall & Memorize)
- Bedakan **fase hafal** dan **fase jawab** secara visual yang jelas:
  - **Fase hafal:** label/aksen **biru muda** dengan teks seperti "Hafalkan!".
  - **Fase jawab:** label/aksen **biru tua** dengan teks seperti "Jawab sekarang!".
- Perbedaan warna + teks membantu pemain paham sedang di fase mana.

### Tampilan Kartu
- Kartu berbentuk persegi dengan sudut membulat dan bayangan halus.
- Sisi tertutup menampilkan pola/branding sederhana; sisi terbuka menampilkan gambar aset.
- Beri feedback animasi ringan saat flip (opsional, CSS transition sederhana).
- Feedback **hijau muda** saat pasangan cocok / jawaban benar.

### Layout Halaman Result
- Tampilkan rincian skor per game (Memory Flip, Memory Recall, Memorize) dalam daftar/kartu yang rapi.
- Tonjolkan **skor total / 100** dengan ukuran besar.
- Teks **"Terima kasih sudah bermain"** ditampilkan jelas.
- Jika total = 100, tampilkan teks perayaan **"Selamat, Anda menjadi pemenang"** dengan aksen hijau muda/biru tua yang menonjol.
- Tanpa tombol "Main Lagi".

## Keterbacaan & Aksesibilitas Dasar

- Pastikan kontras warna teks terhadap latar memadai.
- Gunakan atribut `alt` yang deskriptif pada semua gambar aset.
- Ukuran font dan target sentuh cukup besar untuk kenyamanan.
- Hindari menyampaikan informasi hanya lewat warna — dukung dengan teks/ikon (mis. label fase, bukan sekadar warna).
- Struktur heading HTML yang logis (`h1` → `h2` → ...).

## Aturan Aset Dummy

- Semua gambar game awalnya **placeholder `.jpeg`** dummy (mis. kotak warna solid atau angka sederhana).
- Simpan di folder `assets/` masing-masing game dengan **nama & path final**.
- Nanti aset asli cukup menimpa file dengan nama yang sama — tanpa mengubah kode.
- Placeholder sebaiknya memakai warna dari palet Entrasol agar tampilan tetap selaras saat demo.

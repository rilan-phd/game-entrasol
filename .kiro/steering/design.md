# Design & UX Guidelines

Pedoman visual dan interaksi untuk seluruh halaman aplikasi. Tujuannya menjaga tampilan konsisten, mencerminkan merek Entrasol, dan nyaman digunakan di semua ukuran layar.

## Palet Warna (Tema Entrasol)

Tema warna: **Putih, Hijau muda, Biru muda, Biru tua**. Nilai hex berikut adalah **acuan awal** — sesuaikan jika ada panduan brand resmi Entrasol.

| Peran | Warna | Hex (acuan) | Penggunaan |
|-------|-------|-------------|------------|
| Background utama | Putih | `#FFFFFF` | Latar halaman, kartu konten |
| Aksen / sukses | Hijau muda | `#8BC34A` | Highlight, indikator benar, aksen branding |
| Sekunder / lembut | Biru muda | `#A7D8F0` | Panel, latar section, badge, fase hafal |
| Primer / utama | Biru tua | `#141A8C` | Tombol utama (Start), header, teks penekanan, fase jawab |

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
- Ukuran teks nyaman dibaca di mobile (body minimal ~16px) agar sesuai target remaja & dewasa. Pengecualian: pada tinggi layar rendah, ukuran teks boleh mengecil hingga ~13px mengikuti aturan fit-to-viewport.

## Layout: Mobile Frame & Fit-to-Viewport

### Mobile Frame (semua perangkat)

- Aplikasi memakai **satu tampilan mobile** di semua perangkat. Container utama tiap halaman (mis. `.home-hero`, `.flip-page`) dibatasi `max-width: var(--app-max-width)` = **430px**, `margin: 0 auto`. Di tablet dan desktop tampilan tetap seperti di mobile, terpusat di tengah layar.
- Tidak ada layout terpisah untuk tablet/desktop. Jangan membuat media query lebar layar (`min-width`) yang mengubah susunan halaman.
- Warna **body**: `#EAF5F2` (`--body-bg`). Halaman game boleh memberi body warna sendiri (mis. `body.flip-body`).
- Latar **container halaman utama**:
  ```css
  background:
    radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #FFFFF8 38%, transparent 75%),
    radial-gradient(ellipse at 0% 75%, #E9F9D9 0%, transparent 55%),
    linear-gradient(180deg, #F0F8F5 0%, #F5F8EC 45%, #DDF3F4 100%);
  ```
- **Wave** `assets/background-wave.svg` (viewBox 390x120) ditempel di dasar container lewat `::after` (`aspect-ratio: 390 / 120`, `z-index: 0`, `pointer-events: none`). Konten berada di atasnya (`z-index: 1`).
- Bootstrap tetap dipakai untuk reset dan komponen (`btn`, `progress`, `alert`). Untuk elemen yang harus mengecil mengikuti tinggi layar, **jangan memakai utility spasi Bootstrap** (`mb-4`, `py-5`, dll). Utility itu memakai `!important` sehingga tidak bisa diatur ulang. Pakai class sendiri.
- Target sentuh minimal ~44x44px untuk tombol dan kartu.
- Papan Memory Flip 4x4 tetap persegi (`aspect-ratio: 1 / 1`) dan proporsional.

### Fit-to-Viewport (tanpa scroll vertikal)

- Aturan: pada layar dengan **tinggi >= 550px**, setiap halaman utama (`index.html`), setiap halaman game (`game-N/index.html`, termasuk semua tampilan di dalamnya: intro, bermain, hasil), dan `result.html` **tidak boleh punya scroll vertikal**. Di bawah 550px, scroll vertikal diperbolehkan.
- Target minimal: **iPhone SE Gen 2** (viewport sekitar 375x553 di Safari) ke atas harus muat tanpa scroll.
- Implementasi:
  - Definisikan satuan tinggi dinamis dengan fallback: `:root { --dvh: 1vh; }` lalu `@supports (height: 100dvh) { :root { --dvh: 1dvh; } }`.
  - Di dalam `@media (min-height: 550px)`: `html, body { height: 100%; overflow: hidden; }` dan container halaman `height: calc(100 * var(--dvh)); min-height: 0; overflow-x: hidden; overflow-y: auto;` (`overflow-y: auto` hanya jaring pengaman untuk layar sempit).
  - Di luar media query itu (tinggi < 550px), container memakai `min-height: 100svh` dan halaman scroll normal.
  - Ukuran elemen dihitung dari tinggi layar dengan `clamp(min, calc(N * var(--dvh)), max)`, dengan `max` = ukuran desain penuh. Berlaku untuk tinggi logo/ikon, ukuran font, tinggi item, jarak antar elemen, dan padding.
  - Elemen berukuran tetap harus dibatasi tinggi. Contoh: papan Memory Flip memakai `--flip-board-w: min(100%, 424px, calc(100 * var(--dvh) - 160px))` agar papan + HUD selalu muat.
  - Halaman dengan beberapa tampilan dalam satu file (intro/game/result) berbagi tinggi yang sama: tiap tampilan `flex: 1 1 auto; min-height: 0; justify-content: center`.
- Terapkan aturan yang sama pada halaman baru (game-2, game-3, result.html). Uji di tinggi sekitar 550-560px untuk setiap tampilan sebelum dianggap selesai.

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

### Daftar Game (halaman utama)
- Tiga item (`.game-item`) berupa kartu putih setinggi sekitar 90px (mengecil sesuai aturan fit-to-viewport), `border: 2px solid` berwarna sesuai game, sudut membulat, bayangan halus.
- Urutan kiri ke kanan: ikon game (`assets/icon-game-N.svg`, viewBox 160x120, lebar 30% dari item, persegi panjang bukan kotak), separator vertikal, badge nomor (01/02/03), nama game rata kiri.
- Warna per game: Memory Flip biru tua, Memory Recall hijau muda, Memorize biru muda. Dipakai pada outline, separator, dan badge nomor.
- Daftar ini adalah label, bukan tombol: jangan memakai fill solid atau bentuk pill penuh seperti tombol Start. "Mulai Permainan" adalah satu-satunya elemen dengan fill biru tua solid.

### Layar Hasil Game (tiap game)
- Tampil di dalam halaman game yang sama setelah waktu habis atau game selesai. Isinya judul game, skor game besar dengan keterangan "point" dan "dari N" (40 untuk game-1, 30 untuk game-2 dan game-3), dan tombol **"Lanjutkan"** bergaya tombol primer.
- Tidak ada navigasi otomatis. Pemain berpindah ke game berikutnya (atau ke `result.html` dari game-3) hanya dengan menekan "Lanjutkan".
- Layar hasil tunduk pada aturan fit-to-viewport seperti tampilan lain.

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
- Aset yang sudah disediakan (ikon SVG, logo, wave, gambar kartu, audio) dipakai apa adanya dengan nama file aslinya. Placeholder hanya untuk aset yang belum ada.

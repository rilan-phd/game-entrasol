# Design Document: Total Result Page

## Overview

`result.html` mengikuti pola `index.html` (container `.home-hero`-style, wave di dasar, kartu game). Isinya dirender dari skor di LocalStorage, lalu dibekukan per tab lewat `sessionStorage`. Tidak ada tombol; pemain mengulang dengan scan QR (tab baru → `index.html`).

## Keputusan penting

### 1. Bermain ulang harus mereset sesi lama

Masalah di kode saat ini: tombol Start di `index.html` hanya memanggil `resetScore()` bila `loadGame1State()` bernilai `null`. Setelah sesi selesai, state game-1 berstatus `finished`, sehingga scan QR kedua (LocalStorage dipakai bersama antar tab) akan masuk ke layar hasil game-1 lama, bukan permainan baru.

Solusi: Session_Done flag.
- `result.html` menulis `entrasol_session_done = "1"` (lewat `markSessionDone()` di `storage.js`).
- `index.html`: bila `isSessionDone()` true → `resetScore()` (sudah menghapus state game-1/2/3) + `clearSessionDone()`, lalu navigasi. Selain itu logika lama tetap.

### 2. Refresh dan tab lama tetap menampilkan hasil yang sama

Setelah tab baru memanggil `resetScore()`, LocalStorage berisi nol. Bila tab lama memakai LocalStorage saat refresh, ia akan menampilkan "Maaf" dengan skor 0. Karena itu hasil dibekukan di `sessionStorage` (per tab) pada pembukaan pertama:

```
loadResult():
  snap = getResultSnapshot()            // sessionStorage
  if snap valid → return snap
  if sessionFinished() (state game-3 phase 'finished') →
      snap = getScore() lalu total dihitung ulang
      saveResultSnapshot(snap); markSessionDone(); return snap
  return null  → location.replace('index.html')
```

`sessionStorage` bertahan saat refresh dan Back/Forward pada tab yang sama, dan tidak dibagikan ke tab baru.

### 3. Menahan tombol Back (best-effort)

- Saat load: `history.replaceState({ result: true }, '')` lalu `history.pushState({ result: true }, '')`.
- `window.addEventListener('popstate', () => history.pushState({ result: true }, ''))` sehingga Back selalu kembali ke halaman ini.
- `pageshow` dengan `event.persisted` → render ulang dan pasang ulang trap.
- game-3 berpindah ke result dengan `location.replace` (ubah `navigateTo` atau tambah `replaceTo(url)` di `app.js`; game-3 memakai helper itu untuk `NEXT_PAGE`). Dengan begitu game-3 tidak ada di riwayat.
- Keterbatasan: browser dapat mengabaikan `pushState` tanpa interaksi pengguna, dan pemain tetap dapat memakai long-press Back atau menutup tab. Tidak ada cara web yang menjamin 100%.

## Perubahan file

| File | Perubahan |
|------|-----------|
| `result.html` | Baru. |
| `css/style.css` | Tambah variabel, kelas `result-*`, keyframes, aturan fit-to-viewport. |
| `js/storage.js` | Tambah `getResultSnapshot`, `saveResultSnapshot`, `clearResultSnapshot` (sessionStorage); `markSessionDone`, `isSessionDone`, `clearSessionDone` (localStorage); `isSessionFinished()` (game-3 state finished). Ekspos juga di `ScoreStore` dan global. |
| `js/app.js` | Tambah `replaceTo(url)`, `loadResult()`, `renderResult()`, `lockBack()`, `launchConfetti()`; auto-init pada halaman result. |
| `index.html` | Tombol Start: cek `isSessionDone()` (lihat keputusan 1). |
| `game-3/game.js` | `NEXT_PAGE` memakai `replaceTo`. |

## Struktur HTML (`result.html`)

```html
<body class="result-body">
  <main class="result-page">
    <div class="result-confetti" id="resultConfetti" aria-hidden="true"></div>
    <div class="result-content">
      <img id="resultIcon" class="result-icon" src="assets/cancel.png" alt="">
      <h1 id="resultTitle" class="result-title"></h1>
      <p id="resultSubtitle" class="result-subtitle"></p>

      <ul class="result-list list-unstyled">
        <li class="game-item game-item--flip result-item">
          <img class="game-item__icon" src="assets/icon-game-1.svg" alt="Ikon Memory Flip">
          <span class="game-item__sep game-item__sep--flip" aria-hidden="true"></span>
          <span class="result-item__name">Memory Flip</span>
          <span class="result-item__score" id="scoreFlip">0</span>
        </li>
        <!-- recall (game-item--recall), memorize (game-item--memorize) -->
      </ul>

      <p class="result-total__label">Total point</p>
      <p class="result-total__value" id="scoreTotal">0</p>

      <div class="result-footer">
        <p class="result-thanks">Terimakasih telah berpartisipasi</p>
        <img src="assets/entrasol-text-blue.png" alt="Logo Entrasol" class="result-logo">
      </div>
    </div>
  </main>
  <script src="vendor/bootstrap/bootstrap.bundle.min.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/app.js"></script>
</body>
```

Item list memakai ulang `.game-item`, `.game-item__icon`, `.game-item__sep`, dan modifier warnanya. `.result-item` hanya menambah isi kanan.

`result-icon` dan teks diisi JS. Elemen `h1`→ heading logis. `result-subtitle` diberi `role="status"`.

## Styling

Variabel baru di `:root`:

```css
--result-green-dark: #2E7D32;
--result-red: #C62828;
--result-text-gray: #4A4A4A;
```

Container (`.result-page`) memakai background, wave `::after`, `max-width: var(--app-max-width)`, dan aturan fit-to-viewport yang sama seperti `.home-hero` (sebaiknya ditambahkan ke daftar selektor yang sudah ada di `@media (min-height: 550px)`). `body.result-body` memakai `--body-bg`.

Proporsi item list (lebar item = 100%):

| Elemen | Lebar |
|--------|-------|
| `.game-item__icon` | 30% (sudah ada) |
| `.game-item__sep` | 3px |
| `.result-item__name` | `flex: 0 0 40%`, rata kiri, bold |
| `.result-item__score` | `flex: 0 0 20%`, rata kanan, `font-weight: 500`, biru tua |
| Sisa | ±10% (jarak/padding, `margin-left` pada name, `padding-right` pada item) |

Pulse:

```css
@keyframes result-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.result-title, .result-subtitle { animation: result-pulse 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .result-title, .result-subtitle { animation: none; }
}
```

Modifier state: `.result-subtitle--win` (hijau tua), `.result-subtitle--lose` (merah). Untuk teks `transform`, elemen perlu `display: block`/`inline-block`.

Ukuran (dihitung dengan `--dvh`, nilai awal yang disarankan, disesuaikan saat uji 553px):

| Elemen | Nilai |
|--------|-------|
| `.result-icon` | `height: clamp(48px, calc(13 * var(--dvh)), 120px)` |
| `.result-title` | `clamp(1.75rem, calc(7 * var(--dvh)), 3rem)`, bold, biru tua |
| `.result-subtitle` | `clamp(0.9rem, calc(2.6 * var(--dvh)), 1.15rem)` |
| `.result-list` | margin atas `calc(3 * var(--dvh))`, gap seperti `.game-list` |
| `.result-total__label` | `clamp(0.85rem, calc(2.4 * var(--dvh)), 1.05rem)`, biru tua |
| `.result-total__value` | `clamp(2rem, calc(7 * var(--dvh)), 3.25rem)`, bold, biru tua |
| `.result-thanks` | `clamp(0.75rem, calc(2 * var(--dvh)), 0.875rem)`, `font-weight: 300`, `--result-text-gray` |
| `.result-logo` | `clamp(20px, calc(5 * var(--dvh)), 36px)` tinggi, `width: auto` |

`.result-content`: flex column, `align-items: center`, `justify-content: safe center`, `position: relative; z-index: 1`.

### Font weight

`fonts/` hanya berisi Regular (400) dan Bold (700). Weight 500 (medium) dan 300 (light) akan jatuh ke Regular di browser. Untuk hasil sesuai desain, tambahkan `NotoSans-Medium.woff2` (500) dan `NotoSans-Light.woff2` (300) beserta `@font-face`-nya. Bila file belum tersedia, implementasi tetap memakai `font-weight: 500/300` sehingga otomatis berlaku begitu file ditambahkan.

## Confetti

`launchConfetti(container)` dipanggil hanya saat menang dan `prefers-reduced-motion` tidak aktif:

- Buat ±40 elemen `<i class="result-confetti__piece">` dengan `left` acak (0-100%), ukuran 6-10px, warna acak dari `--entrasol-blue-dark`, `--entrasol-green`, `--entrasol-blue-light`, `--entrasol-gold`, `animation-delay` 0-3s, `animation-duration` 3-5s, rotasi acak.
- `@keyframes result-fall`: `translateY(-10vh)` → `translateY(110%)` disertai `rotate`; `infinite` agar terus jatuh.
- `.result-confetti`: `position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 2`. Karena container `.result-page` memiliki `overflow: hidden`, tidak ada scroll.
- Hanya memakai `transform`/`opacity` agar ringan.

## Penyelarasan teks

| Kondisi | Ikon | Teks utama | Sub teks |
|---------|------|-----------|----------|
| total = 100 | `assets/confetti-cone.png` | Selamat | Kamu mendapatkan hadiah (hijau tua) |
| total < 100 | `assets/cancel.png` | Maaf | Kamu belum beruntung (merah) |

## Asumsi

- Pulse diterapkan pada teks utama dan sub teks. Mudah dipersempit ke salah satunya bila bukan itu maksud desain.
- Total diambil dari penjumlahan tiga skor game dan "menang" diuji dengan `=== 100`.
- Dibuka tanpa sesi selesai (mis. URL diketik langsung) → diarahkan ke `index.html`.

## Pengujian manual

- Skor 100: ikon confetti, "Selamat", confetti jatuh, sub teks hijau tua.
- Skor < 100 (mis. 0, 35, 70): ikon cancel, "Maaf", tanpa confetti, sub teks merah.
- Back dan refresh tetap di `result.html` dengan skor sama.
- Tab baru → `index.html` → Start → game-1 baru (state bersih); tab lama setelah refresh masih menampilkan hasil lama.
- Tinggi 550-560px (375x553): tanpa scroll vertikal.
- `prefers-reduced-motion`: tanpa pulse dan confetti.

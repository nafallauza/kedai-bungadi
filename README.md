# Wedanguwuh BUNGADI — Frontend

Prototype web pemesanan lewat QR code meja untuk kedai Wedanguwuh BUNGADI (Capstone Asah 2026, tim A26-CS104).
Dibuat dengan React (Vite), Tailwind CSS, React Router, dan Lucide.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173/demo` untuk daftar semua halaman.
Supaya bisa dibuka dari HP, sambungkan HP ke Wi-Fi yang sama, lalu pakai alamat **Network** yang tampil di terminal.

### PWA (tetap terbuka saat sinyal hilang)

Service worker hanya aktif di hasil build, jadi uji dengan:

```bash
npm run build
npm run preview
```

Halaman, ikon, dan font disimpan di cache, sehingga menu tetap terbuka walau sinyal putus; mengirim pesanan tetap butuh koneksi.
Service worker hanya jalan di HTTPS atau `localhost`: dari HP lewat alamat IP lokal (`http://192.168…`) PWA belum aktif,
dan baru aktif setelah website di-deploy ke HTTPS. Di tablet kasir, website bisa dipasang sebagai aplikasi
(menu browser → *Install app* / *Tambahkan ke layar utama*); tekan lama ikonnya untuk pintasan ke Kasir atau Admin.

## Halaman

| Alamat | Untuk | Isi |
|---|---|---|
| `/` | Umum | Landing page profil kedai |
| `/meja/:kode` | Pelanggan | Alamat yang ada di QR meja (contoh `/meja/M01`) |
| `/pesan` | Pelanggan | Petunjuk scan QR + pilih meja (mode demo) |
| `/menu` | Pelanggan | Menu, pencarian, terlaris, asisten rombongan |
| `/keranjang` | Pelanggan | Ringkasan pesanan, nama pemesan, catatan, kirim |
| `/pesanan`, `/pesanan/:id` | Pelanggan | Daftar dan status pesanan (otomatis ter-update) |
| `/kasir` | Staf | Pesanan masuk, ubah status, tandai lunas, tagihan per meja |
| `/admin` | Pemilik | Ringkasan penjualan, menu terlaris, jam ramai |
| `/admin/menu` | Pemilik | Tambah/ubah menu, tandai menu habis |
| `/admin/meja` | Pemilik | Tambah meja, unduh & cetak QR |

## Struktur

```
src/
  data/        data contoh (menu, meja, info kedai, riwayat penjualan)
  lib/api.js   MOCK API — semua data lewat file ini
  lib/hooks.js hook data (useMenu, useOrders, ...)
  lib/session.jsx  meja + keranjang pelanggan
  components/  komponen bersama, layout, grafik, asisten
  pages/       halaman per peran (customer, staff, admin)
```

## Tema desain

Diambil dari tempat aslinya: kayu gelap & suasana malam (`kopi`), kertas buku menu (`kertas`),
warna harga di buku menu sebagai aksen (`terakota`), dan emas logo cangkir untuk aksen kecil.
Font: Cormorant Garamond (judul) + Plus Jakarta Sans (teks). Semua token ada di `src/index.css`
dan versi DTCG-nya di `design-tokens.json` (bisa disinkronkan ke Figma Variables lewat plugin FigCraft).

## Status data (penting)

- **Belum ada backend.** `src/lib/api.js` menyimpan data di `localStorage` browser dan menyinkronkan antar-tab
  lewat `BroadcastChannel`. Jadi "real-time" baru berlaku di **satu browser yang sama** (buka tab pelanggan dan tab kasir berdampingan).
- **Menyambungkan ke backend:** setiap fungsi di `api.js` sudah diberi komentar endpoint yang diharapkan
  (misalnya `POST /api/orders`). Ganti isinya dengan `fetch`, dan ganti `subscribe()` dengan Socket.io.
  Bentuk data yang dikembalikan sebaiknya tetap sama supaya halaman tidak perlu diubah.
- **Menu & info kedai** (`src/data/menu.js`, `src/data/site.js`) diambil dari buku menu resmi di linktr.ee/BuNgadi,
  Instagram @bu__ngadi, dan Google Maps. Tetap konfirmasi ke pemilik (harga, jam buka). Jam buka di Instagram
  (10.00–20.00, Selasa libur) berbeda dengan hasil wawancara, jadi tolong ditanyakan ulang.
- **Riwayat penjualan** di `src/data/salesSample.js` masih contoh acak, menunggu data asli dari kasir.
- **Foto:** belum ada foto asli; sementara tampil ilustrasi. Daftar foto yang perlu diminta ke pemilik ada di
  `public/images/README.md`.
- **Asisten rombongan** (`askAssistant`) dan **analisis penjualan** (`getBestSellers`, `getSalesSummary`) masih aturan sederhana.
  Nanti diganti endpoint dari tim AI Engineer dan Data Science.
- Halaman staf/admin belum memakai login. Login akan ditambahkan bersama backend.
- Tombol **Reset data demo** ada di sidebar halaman staf (layar lebar).

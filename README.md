# IDX Dashboard

Dashboard untuk data publik **Bursa Efek Indonesia (IDX)** — ringkasan perdagangan
saham harian, indeks, daftar emiten, dan pengumuman/aksi korporasi. Data diambil
(scrape) dari endpoint publik `www.idx.co.id` lalu disimpan sebagai snapshot JSON
di folder `data/`, dan ditampilkan oleh aplikasi Next.js.

## Struktur

```
app/                 Next.js App Router — halaman dashboard
  page.tsx           Ringkasan pasar (IHSG, top gainers/losers, paling aktif, pengumuman terbaru)
  stocks/            Ringkasan perdagangan saham (tabel cari + sortir)
  indices/           Daftar indeks + nilai terakhir
  companies/         Daftar emiten tercatat (filter sektor)
  announcements/     Pengumuman & aksi korporasi
components/          Komponen UI (tabel, navigasi, daftar pengumuman)
lib/
  idx-client.mjs     Klien HTTP + parser untuk endpoint IDX (dipakai scraper)
  data.ts            Loader snapshot JSON untuk Next.js (server-side)
  format.ts          Tipe data + helper format angka/tanggal (aman untuk client)
scripts/
  scrape.mjs         Skrip scrape — tulis snapshot ke data/
  sample-data.mjs    Generator data contoh (deterministik, BUKAN data nyata)
data/                Snapshot JSON (di-commit; diperbarui workflow harian)
.github/workflows/scrape.yml   Cron harian (16:30 WIB) yang menjalankan scraper & commit data
```

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
```

Repo sudah berisi **data contoh** supaya dashboard langsung tampil. Untuk mengisi
data sebenarnya:

```bash
npm run scrape              # ambil hari bursa terakhir dari www.idx.co.id
npm run scrape -- --date=20260109   # ambil tanggal tertentu (YYYYMMDD)
npm run scrape:mock         # tulis ulang data contoh
```

Setelah scrape, file di `data/` diperbarui dan halaman akan menampilkannya
(halaman bersifat `force-dynamic`, dibaca per request — tidak perlu rebuild).

## Sumber data

Endpoint `www.idx.co.id/primary/...` yang dipakai (bisa berubah sewaktu-waktu,
tidak ada API resmi yang terdokumentasi):

| Dataset | Endpoint |
| --- | --- |
| Ringkasan saham harian | `/primary/TradingSummary/GetStockSummary?length=9999&start=0&date=YYYYMMDD` |
| Daftar emiten | `/primary/ListedCompany/GetCompanyProfiles?start=0&length=9999&emitenType=*` |
| Indeks | `/primary/StockData/GetIndexData` (fallback `/primary/Home/GetIndexMover`) |
| Pengumuman | `/primary/NewsAnnouncement/GetAnnouncement?indexFrom=1&pageSize=150&lang=id` |

Catatan:
- Situs IDX berada di belakang Cloudflare. Scraper mengirim header mirip browser
  dan melakukan retry dengan backoff. Tetap ada kemungkinan request diblokir
  (mis. dari IP runner CI); kalau gagal, scraper membiarkan file `data/` yang lama
  agar dashboard tetap berfungsi.
- Hormati ketentuan penggunaan IDX. Jangan menjalankan scrape terlalu sering;
  jadwal default cukup 1× per hari bursa.
- Data hanya untuk keperluan informasi, **bukan nasihat investasi**.

## Update otomatis (cron)

`.github/workflows/scrape.yml` berjalan tiap hari kerja pukul 09:30 UTC (≈16:30 WIB),
menjalankan `node scripts/scrape.mjs`, lalu meng-commit perubahan `data/` ke branch
ini. Bisa juga dijalankan manual lewat tab **Actions → Run workflow** (opsional isi
tanggal). Workflow butuh izin `contents: write` (sudah diset di file workflow).

## Deploy

Aplikasi Next.js standar — bisa di-deploy ke Vercel/Node host mana pun:

```bash
npm run build
npm run start
```

Karena halaman membaca `data/` dari filesystem saat request, deploy ulang setelah
cron meng-commit data baru (mis. Vercel auto-deploy on push) akan memuat snapshot
terbaru.

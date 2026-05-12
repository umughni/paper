// Deterministic sample IDX data so the dashboard renders before the first real
// scrape. Numbers here are illustrative, NOT real market data.

const COMPANIES = [
  ['BBCA', 'Bank Central Asia Tbk.', 'Keuangan', 'Bank', '2000-05-31', 123275000000, 'Utama'],
  ['BBRI', 'Bank Rakyat Indonesia (Persero) Tbk.', 'Keuangan', 'Bank', '2003-11-10', 151559000000, 'Utama'],
  ['BMRI', 'Bank Mandiri (Persero) Tbk.', 'Keuangan', 'Bank', '2003-07-14', 93333330000, 'Utama'],
  ['TLKM', 'Telkom Indonesia (Persero) Tbk.', 'Infrastruktur', 'Telekomunikasi', '1995-11-14', 99062216600, 'Utama'],
  ['ASII', 'Astra International Tbk.', 'Perindustrian', 'Konglomerasi', '1990-04-04', 40483553140, 'Utama'],
  ['UNVR', 'Unilever Indonesia Tbk.', 'Barang Konsumen Primer', 'Produk Rumah Tangga', '1982-01-11', 38150000000, 'Utama'],
  ['GOTO', 'GoTo Gojek Tokopedia Tbk.', 'Teknologi', 'Aplikasi & Jasa Internet', '2022-04-11', 1184362299237, 'Utama'],
  ['BREN', 'Barito Renewables Energy Tbk.', 'Infrastruktur', 'Listrik', '2023-10-09', 133779789750, 'Utama'],
  ['AMMN', 'Amman Mineral Internasional Tbk.', 'Barang Baku', 'Logam & Mineral', '2023-07-07', 72557097400, 'Utama'],
  ['ADRO', 'Adaro Energy Indonesia Tbk.', 'Energi', 'Batu Bara', '2008-07-16', 31985962000, 'Utama'],
  ['ICBP', 'Indofood CBP Sukses Makmur Tbk.', 'Barang Konsumen Primer', 'Makanan Olahan', '2010-10-07', 11661908000, 'Utama'],
  ['ANTM', 'Aneka Tambang Tbk.', 'Barang Baku', 'Logam & Mineral', '1997-11-27', 24030764725, 'Utama'],
  ['PGAS', 'Perusahaan Gas Negara Tbk.', 'Energi', 'Minyak, Gas & Batu Bara', '2003-12-15', 24241508196, 'Utama'],
  ['MDKA', 'Merdeka Copper Gold Tbk.', 'Barang Baku', 'Logam & Mineral', '2015-06-19', 24475992789, 'Utama'],
  ['CPIN', 'Charoen Pokphand Indonesia Tbk.', 'Barang Konsumen Primer', 'Produk Peternakan', '1991-03-18', 16398000000, 'Utama'],
  ['INKP', 'Indah Kiat Pulp & Paper Tbk.', 'Barang Baku', 'Kertas', '1990-07-16', 5470982941, 'Utama'],
  ['KLBF', 'Kalbe Farma Tbk.', 'Kesehatan', 'Farmasi', '1991-07-30', 46875122110, 'Utama'],
  ['SMGR', 'Semen Indonesia (Persero) Tbk.', 'Barang Baku', 'Semen', '1991-07-08', 6717800000, 'Utama'],
  ['UNTR', 'United Tractors Tbk.', 'Perindustrian', 'Alat Berat', '1989-09-19', 3730135136, 'Utama'],
  ['BBNI', 'Bank Negara Indonesia (Persero) Tbk.', 'Keuangan', 'Bank', '1996-11-25', 37297000000, 'Utama'],
];

const BASE_PRICE = {
  BBCA: 9800, BBRI: 4200, BMRI: 6900, TLKM: 2900, ASII: 5100, UNVR: 2400, GOTO: 62,
  BREN: 7300, AMMN: 9100, ADRO: 2700, ICBP: 11500, ANTM: 1600, PGAS: 1600, MDKA: 2400,
  CPIN: 4900, INKP: 7200, KLBF: 1650, SMGR: 4100, UNTR: 24500, BBNI: 5400,
};

// Small deterministic pseudo-random generator.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function lastBusinessDay(d = new Date()) {
  const date = new Date(d);
  do {
    date.setUTCDate(date.getUTCDate() - 1);
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
  return date.toISOString().slice(0, 10);
}

export function sampleCompanies() {
  return COMPANIES.map(([code, name, sector, subSector, listingDate, shares, board]) => ({
    code,
    name,
    listingDate,
    sector,
    subSector,
    board,
    shares,
    logo: '',
  }));
}

export function sampleStockSummary(date = lastBusinessDay()) {
  const rand = rng(20260512);
  return COMPANIES.map(([code, name]) => {
    const previous = BASE_PRICE[code];
    const drift = (rand() - 0.5) * 0.06; // ±3%
    const close = Math.max(1, Math.round(previous * (1 + drift)));
    const open = Math.round(previous * (1 + (rand() - 0.5) * 0.02));
    const high = Math.max(open, close, Math.round(close * (1 + rand() * 0.015)));
    const low = Math.min(open, close, Math.round(close * (1 - rand() * 0.015)));
    const volume = Math.round((5e6 + rand() * 2e8) / 100) * 100;
    const change = close - previous;
    return {
      date,
      code,
      name,
      previous,
      open,
      high,
      low,
      close,
      change,
      changePercent: +((change / previous) * 100).toFixed(2),
      volume,
      value: volume * close,
      frequency: Math.round(1000 + rand() * 90000),
      foreignBuy: Math.round(rand() * volume * close * 0.4),
      foreignSell: Math.round(rand() * volume * close * 0.4),
      listedShares: COMPANIES.find((c) => c[0] === code)[5],
    };
  });
}

export function sampleIndices(date = lastBusinessDay()) {
  const rand = rng(777);
  const defs = [
    ['COMPOSITE', 'IHSG (Indeks Harga Saham Gabungan)', 7250],
    ['LQ45', 'LQ45', 905],
    ['IDX30', 'IDX30', 475],
    ['IDXBUMN20', 'IDX BUMN20', 392],
    ['JII', 'Jakarta Islamic Index', 530],
    ['IDXFINANCE', 'IDX Sektor Keuangan', 1480],
    ['IDXENERGY', 'IDX Sektor Energi', 2380],
    ['IDXTECHNO', 'IDX Sektor Teknologi', 4600],
  ];
  return defs.map(([code, name, base]) => {
    const pct = +((rand() - 0.5) * 2.4).toFixed(2);
    const last = +(base * (1 + pct / 100)).toFixed(3);
    return {
      code,
      name,
      last,
      change: +(last - base).toFixed(3),
      changePercent: pct,
      high: +(last * 1.004).toFixed(3),
      low: +(last * 0.996).toFixed(3),
      volume: Math.round(5e9 + rand() * 8e9),
      value: Math.round(8e12 + rand() * 6e12),
      date,
    };
  });
}

export function sampleAnnouncements(date = lastBusinessDay()) {
  const items = [
    ['BBRI', 'Penjelasan atas Pemberitaan Media Massa', 'Pengumuman'],
    ['TLKM', 'Laporan Penggunaan Dana Hasil Penawaran Umum', 'Laporan'],
    ['GOTO', 'Pelaksanaan Pembelian Kembali Saham (Buyback)', 'Aksi Korporasi'],
    ['ASII', 'Pemberitahuan Jadwal Pembayaran Dividen Tunai', 'Dividen'],
    ['BMRI', 'Hasil Rapat Umum Pemegang Saham Tahunan', 'RUPS'],
    ['BBCA', 'Keterbukaan Informasi Pemecahan Saham (Stock Split)', 'Aksi Korporasi'],
    ['ANTM', 'Laporan Bulanan Registrasi Pemegang Efek', 'Laporan'],
    ['ADRO', 'Penyampaian Bukti Iklan Ringkasan Risalah RUPST', 'RUPS'],
    ['UNVR', 'Perubahan Pengurus Perseroan', 'Pengumuman'],
    ['MDKA', 'Penambahan Modal Tanpa Hak Memesan Efek Terlebih Dahulu', 'Aksi Korporasi'],
  ];
  return items.map(([company, title, type], i) => {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCHours(9 + (i % 8), (i * 7) % 60, 0, 0);
    return {
      id: `SAMPLE-${date}-${i + 1}`,
      title,
      publishDate: d.toISOString().slice(0, 19),
      company,
      type,
      attachments: [{ name: `${company}_${i + 1}.pdf`, url: '' }],
    };
  });
}

export function sampleDataset() {
  const date = lastBusinessDay();
  return {
    date,
    companies: sampleCompanies(),
    stockSummary: sampleStockSummary(date),
    indices: sampleIndices(date),
    announcements: sampleAnnouncements(date),
  };
}

export { lastBusinessDay };

// Thin HTTP client for the public IDX (Bursa Efek Indonesia) JSON endpoints.
//
// IDX serves these under https://www.idx.co.id/primary/... — they are the same
// endpoints the official site's front-end calls. The site sits behind Cloudflare,
// so requests need browser-like headers and occasionally a retry. There is no
// official, documented public API; endpoint paths/params can change without notice.

const BASE_URL = 'https://www.idx.co.id';

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  Referer: 'https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan',
  'X-Requested-With': 'XMLHttpRequest',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * GET a JSON resource from IDX with retry + backoff.
 * @param {string} path  Path beginning with "/primary/...".
 * @param {Record<string, string|number|undefined>} [params]
 * @param {{ retries?: number, timeoutMs?: number }} [opts]
 */
export async function idxGet(path, params = {}, opts = {}) {
  const { retries = 4, timeoutMs = 20000 } = opts;
  const url = new URL(path, BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(Math.min(2000 * 2 ** (attempt - 1), 16000));
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.pathname}`);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Non-JSON response from ${url.pathname} (got ${text.slice(0, 80)}…)`);
      }
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`idxGet failed for ${url.pathname}: ${lastErr?.message ?? lastErr}`);
}

const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const str = (v) => (v === null || v === undefined ? '' : String(v).trim());

// ---------------------------------------------------------------------------
// Daily stock trading summary
// GET /primary/TradingSummary/GetStockSummary?length=9999&start=0&date=YYYYMMDD
// (omit `date` for the latest available trading day)
// ---------------------------------------------------------------------------
export async function fetchStockSummary(date) {
  const json = await idxGet('/primary/TradingSummary/GetStockSummary', {
    length: 9999,
    start: 0,
    date: date || undefined,
  });
  const rows = json?.data ?? json?.Items ?? [];
  return rows.map((r) => ({
    date: str(r.Date || r.date).slice(0, 10),
    code: str(r.StockCode || r.Code),
    name: str(r.StockName || r.Name),
    previous: num(r.Previous),
    open: num(r.OpenPrice ?? r.Open),
    high: num(r.High),
    low: num(r.Low),
    close: num(r.Close),
    change: num(r.Change),
    changePercent:
      num(r.Previous) > 0 ? +(((num(r.Close) - num(r.Previous)) / num(r.Previous)) * 100).toFixed(2) : 0,
    volume: num(r.Volume),
    value: num(r.Value),
    frequency: num(r.Frequency),
    foreignBuy: num(r.ForeignBuy),
    foreignSell: num(r.ForeignSell),
    listedShares: num(r.ListedShares),
  }));
}

// ---------------------------------------------------------------------------
// Listed companies
// GET /primary/ListedCompany/GetCompanyProfiles?start=0&length=9999&emitenType=*
// ---------------------------------------------------------------------------
export async function fetchCompanies() {
  const json = await idxGet('/primary/ListedCompany/GetCompanyProfiles', {
    start: 0,
    length: 9999,
    emitenType: '*',
  });
  const rows = json?.data ?? json?.Items ?? [];
  return rows.map((r) => ({
    code: str(r.KodeEmiten || r.Code),
    name: str(r.NamaEmiten || r.Name),
    listingDate: str(r.TanggalPencatatan || r.ListingDate).slice(0, 10),
    sector: str(r.Sektor || r.Sector || r.SectorName),
    subSector: str(r.SubSektor || r.SubSector),
    board: str(r.Papan || r.BoardName || r.PapanPencatatan),
    shares: num(r.JumlahSaham || r.Shares),
    logo: str(r.Logo),
  }));
}

// ---------------------------------------------------------------------------
// Stock index list + latest value
// GET /primary/StockData/GetIndexData  (list of indices with last value & change)
// Fallback shape handling included; index APIs on IDX change occasionally.
// ---------------------------------------------------------------------------
export async function fetchIndices() {
  let json;
  try {
    json = await idxGet('/primary/StockData/GetIndexData');
  } catch {
    json = await idxGet('/primary/Home/GetIndexMover');
  }
  const rows = json?.data ?? json?.Items ?? json?.replies ?? [];
  return rows.map((r) => ({
    code: str(r.IndexCode || r.Code || r.Kode),
    name: str(r.IndexName || r.Name || r.Nama || r.IndexCode || r.Code),
    last: num(r.Last ?? r.LastValue ?? r.Close ?? r.Value),
    change: num(r.Change ?? r.Net),
    changePercent: num(r.Percentage ?? r.ChangePercent ?? r.PercentChange),
    high: num(r.High),
    low: num(r.Low),
    volume: num(r.Volume),
    value: num(r.Value),
    date: str(r.Date || r.UpdateDate).slice(0, 10),
  }));
}

// ---------------------------------------------------------------------------
// Announcements / corporate actions
// GET /primary/NewsAnnouncement/GetAnnouncement?indexFrom=1&pageSize=50&lang=id&keyword=
// ---------------------------------------------------------------------------
export async function fetchAnnouncements({ pageSize = 100, dateFrom = '', dateTo = '' } = {}) {
  const json = await idxGet('/primary/NewsAnnouncement/GetAnnouncement', {
    indexFrom: 1,
    pageSize,
    dateFrom,
    dateTo,
    lang: 'id',
    keyword: '',
  });
  const rows = json?.Items ?? json?.Replies ?? json?.data ?? [];
  return rows.map((r) => {
    const info = r.DisclosureInformation || r.PengumumanInformation || {};
    const atts = r.Attachments || r.attachments || [];
    return {
      id: str(r.Id || r.Kode || info.NoPengumuman),
      title: str(r.Title || r.JudulPengumuman || info.Title || info.Judul),
      publishDate: str(r.PublishDate || info.TanggalPengumuman || info.PublishDate).slice(0, 19),
      company: str(info.Code || info.KodeEmiten || r.Kode_Emiten),
      type: str(info.TipePengumuman || r.Type || info.Klasifikasi || 'Pengumuman'),
      attachments: (Array.isArray(atts) ? atts : []).map((a) => ({
        name: str(a.OriginalFilename || a.OriginalFileName || a.FileName || a.Filename),
        url: str(a.FullSavePath || a.PathFile || a.Url),
      })),
    };
  });
}

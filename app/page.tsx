import Link from 'next/link';
import {
  fmtCompact,
  fmtDateTime,
  fmtInt,
  fmtPct,
  getAnnouncements,
  getCompanies,
  getIndices,
  getMeta,
  getStockSummary,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

function Change({ n, pct }: { n: number; pct?: boolean }) {
  const cls = n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
  return (
    <span className={cls}>
      {pct ? fmtPct(n) : `${n > 0 ? '+' : ''}${fmtInt(n)}`}
    </span>
  );
}

function MiniTable({
  title,
  rows,
  valueLabel,
  valueFn,
}: {
  title: string;
  rows: { code: string; name: string; changePercent: number }[];
  valueLabel: string;
  valueFn: (r: any) => string;
}) {
  return (
    <div>
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th className="num">% Perubahan</th>
              <th className="num">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code}>
                <td className="code">
                  <Link href={`/stocks?q=${r.code}`}>{r.code}</Link>
                </td>
                <td>{r.name}</td>
                <td className="num">
                  <Change n={r.changePercent} pct />
                </td>
                <td className="num">{valueFn(r)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="empty" colSpan={4}>
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  const [stocks, companies, indices, announcements, meta] = await Promise.all([
    getStockSummary(),
    getCompanies(),
    getIndices(),
    getAnnouncements(),
    getMeta(),
  ]);

  const composite =
    indices.find((i) => /composite|ihsg/i.test(i.code) || /ihsg/i.test(i.name)) ?? indices[0];
  const totalValue = stocks.reduce((s, r) => s + (r.value || 0), 0);
  const totalVolume = stocks.reduce((s, r) => s + (r.volume || 0), 0);
  const totalFreq = stocks.reduce((s, r) => s + (r.frequency || 0), 0);
  const advancers = stocks.filter((r) => r.change > 0).length;
  const decliners = stocks.filter((r) => r.change < 0).length;
  const traded = stocks.filter((r) => r.volume > 0);

  const gainers = [...traded].sort((a, b) => b.changePercent - a.changePercent).slice(0, 8);
  const losers = [...traded].sort((a, b) => a.changePercent - b.changePercent).slice(0, 8);
  const active = [...stocks].sort((a, b) => b.value - a.value).slice(0, 8);
  const recentAnn = announcements.slice(0, 6);

  const isMock = meta.source === 'mock';

  return (
    <>
      <div className="page-head">
        <h1>Ringkasan Pasar IDX</h1>
        <p>
          Hari bursa: {meta.tradingDate || '—'}
          {meta.lastUpdated ? ` · diperbarui ${fmtDateTime(meta.lastUpdated)}` : ''}
        </p>
      </div>

      {isMock && (
        <div className="banner">
          Menampilkan <strong>data contoh</strong> (angka tidak nyata). Jalankan{' '}
          <code>npm run scrape</code> dengan akses internet untuk mengisi data sebenarnya dari
          www.idx.co.id, atau biarkan workflow harian GitHub Actions yang mengisinya.
        </div>
      )}

      <div className="stat-grid">
        <div className="card">
          <div className="label">IHSG</div>
          <div className="value">{composite ? fmtInt(composite.last) : '—'}</div>
          <div className="sub">
            {composite ? (
              <>
                <Change n={composite.change} /> ({fmtPct(composite.changePercent)})
              </>
            ) : (
              'Data indeks belum tersedia'
            )}
          </div>
        </div>
        <div className="card">
          <div className="label">Nilai Transaksi</div>
          <div className="value">Rp {fmtCompact(totalValue)}</div>
          <div className="sub">{fmtInt(stocks.length)} saham tercatat dalam ringkasan</div>
        </div>
        <div className="card">
          <div className="label">Volume</div>
          <div className="value">{fmtCompact(totalVolume)}</div>
          <div className="sub">lembar saham</div>
        </div>
        <div className="card">
          <div className="label">Frekuensi</div>
          <div className="value">{fmtCompact(totalFreq)}</div>
          <div className="sub">transaksi</div>
        </div>
        <div className="card">
          <div className="label">Naik / Turun</div>
          <div className="value">
            <span className="up">{advancers}</span> / <span className="down">{decliners}</span>
          </div>
          <div className="sub">{fmtInt(companies.length)} emiten terdaftar</div>
        </div>
      </div>

      <div className="section cols-2">
        <MiniTable
          title="Top Gainers"
          rows={gainers}
          valueLabel="Harga"
          valueFn={(r) => fmtInt(r.close)}
        />
        <MiniTable
          title="Top Losers"
          rows={losers}
          valueLabel="Harga"
          valueFn={(r) => fmtInt(r.close)}
        />
      </div>

      <div className="section cols-2">
        <MiniTable
          title="Paling Aktif (Nilai)"
          rows={active}
          valueLabel="Nilai"
          valueFn={(r) => `Rp ${fmtCompact(r.value)}`}
        />
        <div>
          <h2>Pengumuman Terbaru</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Emiten</th>
                  <th>Judul</th>
                </tr>
              </thead>
              <tbody>
                {recentAnn.map((a) => (
                  <tr key={a.id}>
                    <td>{fmtDateTime(a.publishDate)}</td>
                    <td className="code">{a.company || '—'}</td>
                    <td style={{ whiteSpace: 'normal' }}>{a.title}</td>
                  </tr>
                ))}
                {recentAnn.length === 0 && (
                  <tr>
                    <td className="empty" colSpan={3}>
                      Belum ada pengumuman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 10 }}>
            <Link href="/announcements">Lihat semua pengumuman →</Link>
          </p>
        </div>
      </div>
    </>
  );
}

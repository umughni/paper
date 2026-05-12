import { fmtCompact, fmtDateTime, fmtInt, fmtPct, getIndices, getMeta } from '@/lib/data';

export const dynamic = 'force-dynamic';

const HIGHLIGHT = ['COMPOSITE', 'LQ45', 'IDX30', 'IDXBUMN20', 'JII'];

function Chg({ n, pct }: { n: number; pct?: boolean }) {
  const cls = n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
  return <span className={cls}>{pct ? fmtPct(n) : `${n > 0 ? '+' : ''}${fmtInt(n)}`}</span>;
}

export default async function IndicesPage() {
  const [indices, meta] = await Promise.all([getIndices(), getMeta()]);
  const top = indices.filter((i) => HIGHLIGHT.includes(i.code.toUpperCase()));
  const cards = top.length ? top : indices.slice(0, 5);

  return (
    <>
      <div className="page-head">
        <h1>Indeks Saham</h1>
        <p>
          {indices.length ? `${indices.length} indeks` : 'Belum ada data'}
          {meta.lastUpdated ? ` · diperbarui ${fmtDateTime(meta.lastUpdated)}` : ''}
        </p>
      </div>

      {cards.length > 0 && (
        <div className="stat-grid">
          {cards.map((i) => (
            <div className="card" key={i.code}>
              <div className="label">{i.name || i.code}</div>
              <div className="value">{fmtInt(i.last)}</div>
              <div className="sub">
                <Chg n={i.change} /> (<Chg n={i.changePercent} pct />)
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th className="num">Terakhir</th>
              <th className="num">Perubahan</th>
              <th className="num">%</th>
              <th className="num">Tertinggi</th>
              <th className="num">Terendah</th>
              <th className="num">Volume</th>
              <th className="num">Nilai (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {indices.map((i) => (
              <tr key={i.code}>
                <td className="code">{i.code}</td>
                <td>{i.name || '—'}</td>
                <td className="num">{fmtInt(i.last)}</td>
                <td className="num">
                  <Chg n={i.change} />
                </td>
                <td className="num">
                  <Chg n={i.changePercent} pct />
                </td>
                <td className="num">{fmtInt(i.high)}</td>
                <td className="num">{fmtInt(i.low)}</td>
                <td className="num">{fmtCompact(i.volume)}</td>
                <td className="num">{fmtCompact(i.value)}</td>
              </tr>
            ))}
            {indices.length === 0 && (
              <tr>
                <td className="empty" colSpan={9}>
                  Belum ada data indeks.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

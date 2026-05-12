import DataTable, { Column } from '@/components/DataTable';
import { fmtDateTime, getMeta, getStockSummary } from '@/lib/data';

export const dynamic = 'force-dynamic';

const COLUMNS: Column[] = [
  { key: 'code', label: 'Kode', format: 'code' },
  { key: 'name', label: 'Nama' },
  { key: 'previous', label: 'Prev', format: 'price' },
  { key: 'open', label: 'Open', format: 'price' },
  { key: 'high', label: 'High', format: 'price' },
  { key: 'low', label: 'Low', format: 'price' },
  { key: 'close', label: 'Close', format: 'price' },
  { key: 'change', label: 'Chg', format: 'change' },
  { key: 'changePercent', label: '%', format: 'changePct' },
  { key: 'volume', label: 'Volume', format: 'compact' },
  { key: 'value', label: 'Nilai (Rp)', format: 'compact' },
  { key: 'frequency', label: 'Freq', format: 'int' },
  { key: 'foreignBuy', label: 'Asing Beli', format: 'compact' },
  { key: 'foreignSell', label: 'Asing Jual', format: 'compact' },
];

export default async function StocksPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const [stocks, meta] = await Promise.all([getStockSummary(), getMeta()]);
  return (
    <>
      <div className="page-head">
        <h1>Ringkasan Perdagangan Saham</h1>
        <p>
          {stocks.length ? `${stocks.length} saham` : 'Belum ada data'} · hari bursa{' '}
          {meta.tradingDate || '—'}
          {meta.lastUpdated ? ` · diperbarui ${fmtDateTime(meta.lastUpdated)}` : ''}
        </p>
      </div>
      <DataTable
        columns={COLUMNS}
        rows={stocks}
        searchKeys={['code', 'name']}
        searchPlaceholder="Cari kode / nama saham…"
        initialSortKey="value"
        initialSortDir="desc"
        initialQuery={searchParams.q ?? ''}
      />
    </>
  );
}

import DataTable, { Column } from '@/components/DataTable';
import { fmtDateTime, getCompanies, getMeta } from '@/lib/data';

export const dynamic = 'force-dynamic';

const COLUMNS: Column[] = [
  { key: 'code', label: 'Kode', format: 'code' },
  { key: 'name', label: 'Nama Emiten' },
  { key: 'sector', label: 'Sektor' },
  { key: 'subSector', label: 'Sub-Sektor' },
  { key: 'board', label: 'Papan' },
  { key: 'listingDate', label: 'Tgl Pencatatan', format: 'date' },
  { key: 'shares', label: 'Jumlah Saham', format: 'compact' },
];

export default async function CompaniesPage() {
  const [companies, meta] = await Promise.all([getCompanies(), getMeta()]);
  return (
    <>
      <div className="page-head">
        <h1>Daftar Emiten Tercatat</h1>
        <p>
          {companies.length ? `${companies.length} perusahaan` : 'Belum ada data'}
          {meta.lastUpdated ? ` · diperbarui ${fmtDateTime(meta.lastUpdated)}` : ''}
        </p>
      </div>
      <DataTable
        columns={COLUMNS}
        rows={companies}
        searchKeys={['code', 'name', 'sector', 'subSector']}
        searchPlaceholder="Cari kode / nama / sektor…"
        initialSortKey="code"
        initialSortDir="asc"
        filterOptions={{ key: 'sector', label: 'Sektor' }}
      />
    </>
  );
}

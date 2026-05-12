'use client';

import { Fragment, useMemo, useState } from 'react';
import { fmtCompact, fmtDate, fmtInt, fmtPct } from '@/lib/format';

export type ColFormat =
  | 'text'
  | 'code'
  | 'int'
  | 'compact'
  | 'price'
  | 'change'
  | 'changePct'
  | 'date';

export interface Column {
  key: string;
  label: string;
  format?: ColFormat;
  sortable?: boolean;
}

const NUMERIC_FORMATS: ColFormat[] = ['int', 'compact', 'price', 'change', 'changePct'];

function cellNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function renderCell(value: unknown, format: ColFormat | undefined) {
  switch (format) {
    case 'int':
    case 'price':
      return <td className="num">{fmtInt(cellNumber(value))}</td>;
    case 'compact':
      return <td className="num">{fmtCompact(cellNumber(value))}</td>;
    case 'change': {
      const n = cellNumber(value);
      const cls = n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
      return (
        <td className={`num ${cls}`}>
          {n > 0 ? '+' : ''}
          {fmtInt(n)}
        </td>
      );
    }
    case 'changePct': {
      const n = cellNumber(value);
      const cls = n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
      return <td className={`num ${cls}`}>{fmtPct(n)}</td>;
    }
    case 'date':
      return <td>{fmtDate(String(value ?? ''))}</td>;
    case 'code':
      return <td className="code">{String(value ?? '')}</td>;
    default:
      return <td>{value === '' || value == null ? '—' : String(value)}</td>;
  }
}

export default function DataTable<T>({
  columns,
  rows,
  searchKeys,
  searchPlaceholder = 'Cari…',
  initialSortKey,
  initialSortDir = 'desc',
  initialQuery = '',
  filterOptions,
}: {
  columns: Column[];
  rows: readonly T[];
  searchKeys: string[];
  searchPlaceholder?: string;
  initialSortKey?: string;
  initialSortDir?: 'asc' | 'desc';
  initialQuery?: string;
  filterOptions?: { key: string; label: string };
}) {
  const [q, setQ] = useState(initialQuery);
  const [filterVal, setFilterVal] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDir);

  const val = (r: T, k: string): unknown => (r as Record<string, unknown>)[k];

  const colFormat = useMemo(() => {
    const m = new Map<string, ColFormat | undefined>();
    for (const c of columns) m.set(c.key, c.format);
    return m;
  }, [columns]);

  const filterValues = useMemo(() => {
    if (!filterOptions) return [] as string[];
    const set = new Set<string>();
    for (const r of rows) {
      const v = val(r, filterOptions.key);
      if (v) set.add(String(v));
    }
    return Array.from(set).sort();
  }, [rows, filterOptions]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out: T[] = rows.slice();
    if (needle) {
      out = out.filter((r) =>
        searchKeys.some((k) => String(val(r, k) ?? '').toLowerCase().includes(needle)),
      );
    }
    if (filterOptions && filterVal) {
      out = out.filter((r) => String(val(r, filterOptions.key) ?? '') === filterVal);
    }
    if (sortKey) {
      const numeric = NUMERIC_FORMATS.includes(colFormat.get(sortKey) as ColFormat);
      out = [...out].sort((a, b) => {
        const av = val(a, sortKey);
        const bv = val(b, sortKey);
        const cmp = numeric
          ? cellNumber(av) - cellNumber(bv)
          : String(av ?? '').localeCompare(String(bv ?? ''), 'id');
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, filterVal, sortKey, sortDir, searchKeys, filterOptions, colFormat]);

  function toggleSort(key: string, sortable: boolean | undefined) {
    if (sortable === false) return;
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(NUMERIC_FORMATS.includes(colFormat.get(key) as ColFormat) ? 'desc' : 'asc');
    }
  }

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {filterOptions && (
          <select value={filterVal} onChange={(e) => setFilterVal(e.target.value)}>
            <option value="">Semua {filterOptions.label}</option>
            {filterValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
        <span className="count">
          {fmtInt(filtered.length)} dari {fmtInt(rows.length)} baris
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => {
                const numeric = NUMERIC_FORMATS.includes(c.format as ColFormat);
                const isSort = sortKey === c.key;
                return (
                  <th
                    key={c.key}
                    className={`${numeric ? 'num' : ''} ${c.sortable === false ? 'no-sort' : ''}`}
                    onClick={() => toggleSort(c.key, c.sortable)}
                  >
                    {c.label}
                    {isSort && <span className="arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const rowKey = (val(r, 'id') as string) ?? (val(r, 'code') as string) ?? String(i);
              return (
                <tr key={rowKey}>
                  {columns.map((c) => (
                    <Fragment key={c.key}>{renderCell(val(r, c.key), c.format)}</Fragment>
                  ))}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="empty" colSpan={columns.length}>
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

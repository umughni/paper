'use client';

import { useMemo, useState } from 'react';
import { fmtDateTime, fmtInt } from '@/lib/format';
import type { AnnouncementRow } from '@/lib/format';

export default function AnnouncementList({ items }: { items: AnnouncementRow[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const a of items) if (a.type) set.add(a.type);
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((a) => {
      if (type && a.type !== type) return false;
      if (!needle) return true;
      return (
        a.title.toLowerCase().includes(needle) || a.company.toLowerCase().includes(needle)
      );
    });
  }, [items, q, type]);

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Cari judul / emiten…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Semua jenis</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="count">
          {fmtInt(filtered.length)} dari {fmtInt(items.length)} pengumuman
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Emiten</th>
              <th>Jenis</th>
              <th>Judul</th>
              <th className="no-sort">Lampiran</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>{fmtDateTime(a.publishDate)}</td>
                <td className="code">{a.company || '—'}</td>
                <td>
                  <span className="badge">{a.type || 'Pengumuman'}</span>
                </td>
                <td style={{ whiteSpace: 'normal', minWidth: 280 }}>{a.title}</td>
                <td>
                  {a.attachments.length === 0 && '—'}
                  {a.attachments.map((f, i) =>
                    f.url ? (
                      <a key={i} href={f.url} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>
                        {f.name || `Berkas ${i + 1}`}
                      </a>
                    ) : (
                      <span key={i} className="flat" style={{ marginRight: 8 }}>
                        {f.name || `Berkas ${i + 1}`}
                      </span>
                    ),
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="empty" colSpan={5}>
                  Tidak ada pengumuman yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

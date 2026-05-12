// Types + formatting helpers. No Node-only imports here so this module is safe
// to import from client components.

export interface StockRow {
  date: string;
  code: string;
  name: string;
  previous: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  value: number;
  frequency: number;
  foreignBuy: number;
  foreignSell: number;
  listedShares: number;
}

export interface CompanyRow {
  code: string;
  name: string;
  listingDate: string;
  sector: string;
  subSector: string;
  board: string;
  shares: number;
  logo: string;
}

export interface IndexRow {
  code: string;
  name: string;
  last: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  date: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  publishDate: string;
  company: string;
  type: string;
  attachments: { name: string; url: string }[];
}

export interface Meta {
  lastUpdated: string;
  tradingDate: string;
  source: string;
  counts: Record<string, number | null>;
}

export const fmtInt = (n: number) => new Intl.NumberFormat('id-ID').format(Math.round(n || 0));

export function fmtCompact(n: number) {
  const v = n || 0;
  if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)} T`;
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)} M`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)} jt`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)} rb`;
  return fmtInt(v);
}

export const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${(n || 0).toFixed(2)}%`;

export function fmtDateTime(s: string) {
  if (!s) return '—';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export function fmtDate(s: string) {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  AnnouncementRow,
  CompanyRow,
  IndexRow,
  Meta,
  StockRow,
} from './format';

export * from './format';

const DATA_DIR = join(process.cwd(), 'data');

async function loadJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(join(DATA_DIR, file), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const getStockSummary = () => loadJson<StockRow[]>('stock-summary.json', []);
export const getCompanies = () => loadJson<CompanyRow[]>('companies.json', []);
export const getIndices = () => loadJson<IndexRow[]>('indices.json', []);
export const getAnnouncements = () => loadJson<AnnouncementRow[]>('announcements.json', []);
export const getMeta = () =>
  loadJson<Meta>('meta.json', { lastUpdated: '', tradingDate: '', source: 'unknown', counts: {} });

#!/usr/bin/env node
// Scrapes the public IDX endpoints and writes JSON snapshots into ./data,
// which the Next.js dashboard reads. Run daily via .github/workflows/scrape.yml.
//
//   node scripts/scrape.mjs            # live scrape from www.idx.co.id
//   node scripts/scrape.mjs --mock     # write deterministic sample data instead
//   node scripts/scrape.mjs --date=20260109   # scrape a specific trading day

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fetchAnnouncements,
  fetchCompanies,
  fetchIndices,
  fetchStockSummary,
} from '../lib/idx-client.mjs';
import { sampleDataset } from './sample-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

const args = process.argv.slice(2);
const MOCK = args.includes('--mock');
const dateArg = args.find((a) => a.startsWith('--date='))?.split('=')[1] || '';

async function writeJson(name, value) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, name), JSON.stringify(value, null, 2) + '\n', 'utf8');
  const count = Array.isArray(value) ? value.length : Array.isArray(value?.data) ? value.data.length : '-';
  console.log(`  wrote data/${name} (${count} records)`);
}

async function tryFetch(label, fn) {
  try {
    const data = await fn();
    console.log(`  ✓ ${label}: ${data.length} records`);
    return data;
  } catch (err) {
    console.warn(`  ✗ ${label} failed: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log(`IDX scrape — ${new Date().toISOString()}${MOCK ? ' (MOCK MODE)' : ''}`);

  if (MOCK) {
    const ds = sampleDataset();
    await writeJson('companies.json', ds.companies);
    await writeJson('stock-summary.json', ds.stockSummary);
    await writeJson('indices.json', ds.indices);
    await writeJson('announcements.json', ds.announcements);
    await writeJson('meta.json', {
      lastUpdated: new Date().toISOString(),
      tradingDate: ds.date,
      source: 'mock',
      counts: {
        companies: ds.companies.length,
        stockSummary: ds.stockSummary.length,
        indices: ds.indices.length,
        announcements: ds.announcements.length,
      },
    });
    console.log('Done (mock).');
    return;
  }

  const [companies, stockSummary, indices, announcements] = await Promise.all([
    tryFetch('companies', () => fetchCompanies()),
    tryFetch('stock summary', () => fetchStockSummary(dateArg)),
    tryFetch('indices', () => fetchIndices()),
    tryFetch('announcements', () => fetchAnnouncements({ pageSize: 150 })),
  ]);

  const fetched = [companies, stockSummary, indices, announcements].filter(Boolean).length;
  if (fetched === 0) {
    console.error('All fetches failed — leaving existing data files untouched.');
    process.exitCode = 1;
    return;
  }

  if (companies) await writeJson('companies.json', companies);
  if (stockSummary) await writeJson('stock-summary.json', stockSummary);
  if (indices) await writeJson('indices.json', indices);
  if (announcements) await writeJson('announcements.json', announcements);

  const tradingDate =
    stockSummary?.[0]?.date || indices?.[0]?.date || new Date().toISOString().slice(0, 10);
  await writeJson('meta.json', {
    lastUpdated: new Date().toISOString(),
    tradingDate,
    source: 'idx.co.id',
    counts: {
      companies: companies?.length ?? null,
      stockSummary: stockSummary?.length ?? null,
      indices: indices?.length ?? null,
      announcements: announcements?.length ?? null,
    },
  });
  console.log(`Done (${fetched}/4 datasets updated).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

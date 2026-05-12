import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import { fmtDateTime, getMeta } from '@/lib/data';

export const metadata: Metadata = {
  title: 'IDX Dashboard',
  description: 'Dashboard data Bursa Efek Indonesia (IDX) — ringkasan saham, indeks, emiten, dan pengumuman.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const meta = await getMeta();
  return (
    <html lang="id">
      <body>
        <Nav lastUpdated={meta.lastUpdated ? fmtDateTime(meta.lastUpdated) : ''} />
        <main className="container">{children}</main>
        <footer className="site">
          Sumber data: www.idx.co.id (endpoint publik) · Data hanya untuk keperluan informasi, bukan
          nasihat investasi.
        </footer>
      </body>
    </html>
  );
}

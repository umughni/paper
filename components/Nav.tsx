'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Ringkasan' },
  { href: '/stocks', label: 'Saham' },
  { href: '/indices', label: 'Indeks' },
  { href: '/companies', label: 'Emiten' },
  { href: '/announcements', label: 'Pengumuman' },
];

export default function Nav({ lastUpdated }: { lastUpdated: string }) {
  const pathname = usePathname();
  return (
    <header className="site">
      <div className="inner">
        <Link href="/" className="brand">
          IDX<span>·</span>Dashboard
        </Link>
        <nav>
          {LINKS.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={active ? 'active' : ''}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="spacer" />
        <div className="updated">{lastUpdated ? `Diperbarui: ${lastUpdated}` : ''}</div>
      </div>
    </header>
  );
}

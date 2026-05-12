import AnnouncementList from '@/components/AnnouncementList';
import { fmtDateTime, getAnnouncements, getMeta } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AnnouncementsPage() {
  const [announcements, meta] = await Promise.all([getAnnouncements(), getMeta()]);
  return (
    <>
      <div className="page-head">
        <h1>Pengumuman & Aksi Korporasi</h1>
        <p>
          {announcements.length ? `${announcements.length} pengumuman terbaru` : 'Belum ada data'}
          {meta.lastUpdated ? ` · diperbarui ${fmtDateTime(meta.lastUpdated)}` : ''}
        </p>
      </div>
      <AnnouncementList items={announcements} />
    </>
  );
}

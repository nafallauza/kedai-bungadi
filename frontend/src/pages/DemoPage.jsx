import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Logo, card, cx } from '../components/ui';

// Daftar semua halaman untuk presentasi ke UMKM dan pengujian tim
const pages = [
  { to: '/', title: 'Landing page', desc: 'Profil kedai untuk pengunjung umum.' },
  { to: '/meja/M01', title: 'Pelanggan · scan QR Meja 1', desc: 'Simulasi pelanggan memindai QR di Meja 1.' },
  { to: '/meja/M05', title: 'Pelanggan · scan QR Meja 5', desc: 'Buka di tab lain untuk simulasi meja kedua.' },
  { to: '/kasir', title: 'Kasir & dapur', desc: 'Pesanan masuk real-time, ubah status, tandai lunas.' },
  { to: '/admin', title: 'Admin · ringkasan', desc: 'Penjualan, menu terlaris, dan jam ramai.' },
  { to: '/admin/menu', title: 'Admin · kelola menu', desc: 'Tambah, ubah, tandai menu habis.' },
  { to: '/admin/meja', title: 'Admin · meja & QR', desc: 'Buat dan cetak QR code per meja.' },
];

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight">Halaman demo prototype</h1>
      <p className="mt-2 text-sm text-kopi-600">
        Tips: buka halaman pelanggan dan halaman kasir di dua tab berdampingan. Pesanan dari tab pelanggan langsung
        muncul di tab kasir. Data hanya tersimpan di browser ini sampai backend tersambung.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {pages.map((p) => (
          <Link key={p.to} to={p.to} target="_blank" className={cx(card, 'group p-4 transition-colors hover:border-terakota-200')}>
            <span className="flex items-center justify-between font-semibold">
              {p.title}
              <ArrowUpRight strokeWidth={1.5} className="size-4 text-kopi-400 group-hover:text-terakota-700" />
            </span>
            <span className="mt-1 block text-sm text-kopi-500">{p.desc}</span>
            <code className="mt-3 block text-xs text-kopi-400">{p.to}</code>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { loginStaff, resetDemoData } from '../lib/api';
import { ConfirmSheet, Logo, btnSecondary, card, cx } from '../components/ui';

const pages = [
  { to: '/', title: 'Landing page', desc: 'Profil kedai untuk pengunjung umum.' },
  { to: '/menu', title: 'Katalog menu (tanpa QR)', desc: 'Mode lihat menu & harga bagi pengunjung luar.' },
  { to: '/meja/M01', title: 'Pelanggan · scan QR Meja 1', desc: 'Simulasi pelanggan memindai QR di Meja 1.' },
  { to: '/meja/M03', title: 'Pelanggan · scan QR Meja 3', desc: 'Meja aktif dengan contoh pesanan berjalan.' },
  { to: '/meja/M99', title: 'Pelanggan · QR tidak dikenal', desc: 'Uji penanganan kode meja tidak terdaftar + pilih meja.' },
  { to: '/masuk', title: 'Masuk staf (Kasir & Admin)', desc: 'Gerbang login kasir/dapur dan pemilik kedai.' },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');

  const openStaffAs = async (username, dest) => {
    await loginStaff({ username, password: 'bungadi2026' });
    navigate(dest);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Logo subtitle="Ruang Uji & Presentasi Tim A26-CS104" />
      <h1 className="mt-8 font-display text-[36px] font-bold leading-tight tracking-[-0.02em] text-kopi-900">
        Daftar halaman uji coba
      </h1>
      <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-kopi-600">
        Buka halaman pelanggan dan kasir pada dua tab berdampingan untuk menguji alur pesanan real-time (tersimpan lokal di browser sampai backend tersambung).
      </p>

      {notice && (
        <p className="mt-4 rounded-[12px] border border-kopi-200 bg-kertas-tua px-4 py-2.5 text-sm font-medium text-kopi-800" role="status">
          {notice}
        </p>
      )}

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {pages.map((p) => (
          <Link key={p.to} to={p.to} className={cx(card, 'group p-4 transition-colors hover:border-terakota-300')}>
            <span className="flex items-center justify-between font-semibold text-kopi-900">
              {p.title}
              <ArrowUpRight strokeWidth={1.5} className="size-4 text-kopi-500 group-hover:text-terakota-700" aria-hidden="true" />
            </span>
            <span className="mt-1 block text-sm text-kopi-600">{p.desc}</span>
            <code className="mt-3 block text-xs text-kopi-500">{p.to}</code>
          </Link>
        ))}
      </div>

      <section className={cx(card, 'mt-6 p-5')}>
        <h2 className="font-display text-[22px] font-bold text-kopi-900">Pintasan staf & reset data</h2>
        <p className="mt-1 text-sm text-kopi-600">Masuk otomatis sebagai staf untuk demonstrasi cepat, atau kembalikan data awal.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => openStaffAs('kasir1', '/kasir')} className={btnSecondary}>
            Buka Kasir & Dapur
          </button>
          <button type="button" onClick={() => openStaffAs('admin', '/admin')} className={btnSecondary}>
            Buka Dashboard Admin
          </button>
          <button type="button" onClick={() => setConfirmReset(true)} className={btnSecondary}>
            <RotateCcw strokeWidth={1.5} className="size-4" aria-hidden="true" /> Reset data contoh
          </button>
        </div>
      </section>

      <ConfirmSheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          setNotice('Seluruh pesanan dan perubahan menu telah dikembalikan ke data awal.');
        }}
        title="Kembalikan data awal?"
        description="Semua pesanan aktif, perubahan menu, dan meja tambahan di browser ini akan dihapus dan diganti data contoh awal."
        confirmLabel="Ya, reset data"
        danger
      />
    </main>
  );
}

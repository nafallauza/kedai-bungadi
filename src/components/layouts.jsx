import { Link, Navigate, NavLink, Outlet } from 'react-router-dom';
import { ChefHat, ExternalLink, LayoutDashboard, QrCode, RotateCcw, UtensilsCrossed } from 'lucide-react';
import { useOnline } from '../lib/hooks';
import { useSession } from '../lib/session';
import { resetDemoData } from '../lib/api';
import { Logo, OfflineBanner, cx } from './ui';

// Tampilan pelanggan dibuat selebar layar HP, juga saat dibuka di laptop
export function CustomerLayout() {
  const online = useOnline();
  return (
    <div className="paper mx-auto min-h-dvh max-w-md sm:border-x sm:border-kopi-900/10">
      <OfflineBanner online={online} />
      <Outlet />
    </div>
  );
}

// Halaman menu & keranjang hanya bisa dibuka setelah scan QR meja
export function RequireTable() {
  const { table } = useSession();
  return table ? <Outlet /> : <Navigate to="/pesan" replace />;
}

const staffNav = [
  { to: '/kasir', label: 'Kasir & Dapur', icon: ChefHat },
  { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Kelola Menu', icon: UtensilsCrossed },
  { to: '/admin/meja', label: 'Meja & QR', icon: QrCode },
];

export function StaffLayout() {
  const online = useOnline();

  const reset = () => {
    if (window.confirm('Hapus semua pesanan & perubahan menu, lalu kembali ke data contoh awal?')) resetDemoData();
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="no-print border-b border-black/[0.06] bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-5">
          <Link to="/" aria-label="Ke landing page">
            <Logo />
          </Link>
          <span className="rounded-full bg-kopi-100 px-2 py-0.5 text-xs font-medium text-kopi-600 lg:hidden">Staf</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {staffNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-terakota-50 text-terakota-800' : 'text-kopi-600 hover:bg-kopi-100',
                )
              }
            >
              <Icon strokeWidth={1.5} className="size-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-1 border-t border-black/[0.06] p-3 lg:block">
          <Link to="/pesan" target="_blank" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-kopi-500 hover:bg-kopi-100">
            <ExternalLink strokeWidth={1.5} className="size-4" /> Buka halaman pelanggan
          </Link>
          <button type="button" onClick={reset} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-kopi-500 hover:bg-kopi-100">
            <RotateCcw strokeWidth={1.5} className="size-4" /> Reset data demo
          </button>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="no-print sticky top-0 z-30">
          <OfflineBanner online={online} />
        </div>
        <Outlet />
      </main>
    </div>
  );
}

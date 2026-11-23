import { Link, Navigate, NavLink, Outlet } from 'react-router-dom';
import { ChefHat, ExternalLink, LayoutDashboard, QrCode, RotateCcw, UtensilsCrossed } from 'lucide-react';
import { useOnline } from '../lib/hooks';
import { useSession } from '../lib/session';
import { resetDemoData } from '../lib/api';
import { Logo, OfflineBanner, cx } from './ui';

// Tampilan pelanggan dibuat selebar layar HP (390px-448px), juga saat dibuka di laptop
export function CustomerLayout() {
  const online = useOnline();
  return (
    <div className="mx-auto min-h-dvh max-w-[420px] bg-white sm:border-x sm:border-[#e4e4e7]">
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
  { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/kasir', label: 'Pesanan (Kasir & POS)', icon: ChefHat },
  { to: '/admin/menu', label: 'Kelola menu', icon: UtensilsCrossed },
  { to: '/admin/meja', label: 'Meja dan QR', icon: QrCode },
];

export function StaffLayout() {
  const online = useOnline();

  const reset = () => {
    if (window.confirm('Hapus semua pesanan & perubahan menu, lalu kembali ke data contoh awal?')) resetDemoData();
  };

  return (
    <div className="min-h-dvh bg-[#fafafa] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="no-print border-b border-[#e4e4e7] bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r lg:px-[16px] lg:py-[24px]">
        <div className="flex items-center justify-between px-4 py-3 lg:px-[8px] lg:pt-0 lg:pb-[20px]">
          <Link to="/" aria-label="Ke landing page">
            <Logo subtitle="Admin & Kasir" />
          </Link>
        </div>
        <nav className="flex gap-[4px] overflow-x-auto px-3 pb-3 lg:flex-col lg:px-0 lg:pb-0">
          {staffNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex h-[44px] shrink-0 items-center gap-[12px] rounded-[10px] px-[12px] text-[14px] leading-[20px] transition-colors',
                  isActive
                    ? 'bg-[#f6eee7] font-semibold text-[#5e3920]'
                    : 'font-normal text-[#18181b] hover:bg-[#f4f4f5]',
                )
              }
            >
              <Icon strokeWidth={1.75} className="size-[20px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-1 border-t border-[#e4e4e7] pt-4 lg:block">
          <Link
            to="/meja/M03"
            target="_blank"
            className="flex h-[40px] items-center gap-[10px] rounded-[10px] px-[12px] text-[13px] text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#18181b]"
          >
            <ExternalLink strokeWidth={1.5} className="size-4" /> Buka halaman pelanggan
          </Link>
          <button
            type="button"
            onClick={reset}
            className="flex h-[40px] w-full items-center gap-[10px] rounded-[10px] px-[12px] text-[13px] text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#18181b]"
          >
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

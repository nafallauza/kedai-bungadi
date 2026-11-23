import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChefHat, ExternalLink, LayoutDashboard, LogOut, QrCode, UtensilsCrossed } from 'lucide-react';
import { useOnline } from '../lib/hooks';
import { useSession } from '../lib/session';
import { getStaffSession, logoutStaff } from '../lib/api';
import { Logo, OfflineBanner, cx } from './ui';

// Tampilan pelanggan: penuh di HP; di laptop /menu melebar adaptif (hingga 1360px), checkout tetap fokus (480px)
export function CustomerLayout() {
  const online = useOnline();
  const location = useLocation();
  const isWideCatalog = location.pathname === '/menu';
  return (
    <div className="min-h-dvh bg-kopi-50 sm:px-5 sm:py-5 lg:px-8">
      <div
        className={cx(
          'mx-auto min-h-dvh bg-kertas sm:min-h-[calc(100dvh-2.5rem)] sm:overflow-clip sm:rounded-[24px] sm:border sm:border-kopi-200 sm:shadow-soft',
          isWideCatalog ? 'max-w-[1360px]' : 'max-w-[480px]',
        )}
      >
        <OfflineBanner online={online} />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Halaman keranjang & pembayaran wajib memiliki meja aktif dari scan QR
export function RequireTable() {
  const { table } = useSession();
  return table ? <Outlet /> : <Navigate to="/pesan" replace />;
}

const staffNav = [
  { to: '/admin', label: 'Ringkasan', short: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/kasir', label: 'Kasir & Dapur', short: 'Kasir', icon: ChefHat },
  { to: '/admin/menu', label: 'Kelola Menu', short: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/meja', label: 'Meja & QR', short: 'Meja QR', icon: QrCode },
];

export function StaffLayout() {
  const online = useOnline();
  const location = useLocation();
  const navigate = useNavigate();
  const staff = getStaffSession();

  if (!staff) {
    return <Navigate to="/masuk" replace state={{ from: location.pathname }} />;
  }

  const handleLogout = () => {
    logoutStaff();
    navigate('/masuk', { replace: true });
  };

  return (
    <div className="staff-ui min-h-dvh bg-kopi-50 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="no-print border-b border-kopi-200 bg-kertas lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <div className="flex items-center justify-between px-4 py-3 lg:px-2 lg:pt-0 lg:pb-5">
          <Link to="/" aria-label="Ke halaman utama kedai">
            <Logo subtitle="Kasir & Pengelola" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="grid size-[44px] place-items-center rounded-[10px] text-kopi-600 hover:bg-kopi-100 hover:text-kopi-900 lg:hidden"
            aria-label="Keluar dari akun staf"
          >
            <LogOut strokeWidth={1.75} className="size-5" />
          </button>
        </div>

        {/* Mobile: 4-kolom rapi tanpa terpotong; Desktop: vertikal sidebar */}
        <nav aria-label="Navigasi staf" className="grid grid-cols-4 gap-1 border-t border-kopi-100 px-2 py-2 lg:flex lg:flex-col lg:gap-1 lg:border-t-0 lg:px-0 lg:py-0">
          {staffNav.map(({ to, label, short, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[10px] px-1.5 py-1.5 text-[11px] font-medium transition-colors lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-[14px]',
                  isActive
                    ? 'bg-terakota-50 font-semibold text-terakota-800 ring-1 ring-terakota-200/70'
                    : 'text-kopi-700 hover:bg-kopi-100 hover:text-kopi-900',
                )
              }
            >
              <Icon strokeWidth={1.75} className="size-[18px] shrink-0 lg:size-[20px]" aria-hidden="true" />
              <span className="truncate lg:hidden">{short}</span>
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden space-y-2 border-t border-kopi-200 pt-4 lg:block">
          <div className="rounded-[12px] bg-kopi-50 px-3 py-2.5">
            <p className="truncate text-[13px] font-semibold text-kopi-900">{staff.name}</p>
            <p className="text-xs capitalize text-kopi-600">Peran: {staff.role}</p>
          </div>
          <Link
            to="/menu"
            target="_blank"
            className="flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3 text-[13px] font-medium text-kopi-600 hover:bg-kopi-100 hover:text-kopi-900"
          >
            <ExternalLink strokeWidth={1.5} className="size-4" aria-hidden="true" /> Lihat katalog menu
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-[44px] w-full items-center gap-2.5 rounded-[10px] px-3 text-[13px] font-medium text-kopi-600 hover:bg-kopi-100 hover:text-kopi-900"
          >
            <LogOut strokeWidth={1.5} className="size-4" aria-hidden="true" /> Keluar staf
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

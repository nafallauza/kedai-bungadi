import { useEffect, useState } from 'react';
import { Bean, Coffee, Cookie, CookingPot, CupSoda, Leaf, LoaderCircle, Minus, Plus, Soup, WifiOff, X } from 'lucide-react';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/order';
import { categoryDefaultImage } from '../data/menu';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const card = 'rounded-[16px] border border-kopi-200 bg-kertas shadow-soft';
export const btn =
  'inline-flex items-center justify-center gap-2 rounded-[12px] px-5 min-h-[48px] py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
export const btnPrimary = cx(btn, 'bg-terakota-700 text-kertas hover:bg-terakota-800');
export const btnSecondary = cx(btn, 'border border-kopi-200 bg-kertas text-kopi-900 hover:bg-kopi-100');
export const btnGhost = cx(btn, 'text-kopi-600 hover:bg-kopi-100 hover:text-kopi-900');
export const btnLight = cx(btn, 'bg-kertas text-kopi-900 hover:bg-kertas-tua');
export const btnOutlineLight = cx(btn, 'border border-emas/40 text-kertas hover:bg-white/10');
export const input =
  'w-full rounded-[12px] border border-kopi-200 bg-kertas px-[14px] min-h-[48px] text-[14px] text-kopi-900 placeholder:text-kopi-500 transition focus:border-terakota-700';

export function CupMark({ className = 'size-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
      <path d="M6 2v2" />
    </svg>
  );
}

export function Logo({ light = false, subtitle = null }) {
  return (
    <span className={cx('inline-flex max-w-full items-center gap-2.5', light ? 'text-kertas' : 'text-kopi-900')}>
      <img
        src="/images/logo-bungadi.webp"
        alt=""
        width={40}
        height={40}
        className={cx(
          'size-[36px] shrink-0 rounded-[10px] bg-black object-cover sm:size-[40px]',
          light ? 'ring-1 ring-emas/40' : 'ring-1 ring-black/10',
        )}
      />
      <span className="min-w-0 leading-tight">
        <span className="block font-display text-[17px] font-bold tracking-[-0.015em] leading-[1.15] sm:text-[20px]">
          Wedang Uwuh Bu Ngadi
        </span>
        {subtitle && (
          <span className={cx('block text-[12px] font-medium leading-[16px]', light ? 'text-kopi-200' : 'text-kopi-600')}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}

const categoryIcon = {
  wedang: Coffee,
  kopi: Bean,
  jamu: Leaf,
  teh: CupSoda,
  makanan: CookingPot,
  snack: Cookie,
  tambahan: Soup,
};

export function MenuThumb({ item, className = 'size-[84px]', width = 84, height = 84, eager = false }) {
  const [broken, setBroken] = useState(false);
  const src = item?.image || categoryDefaultImage[item?.category];
  if (src && !broken) {
    return (
      <img
        src={src}
        alt={item?.name || 'Hidangan'}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setBroken(true)}
        className={cx(className, 'shrink-0 rounded-[14px] bg-kopi-100 object-cover')}
      />
    );
  }
  const Icon = categoryIcon[item?.category] ?? Coffee;
  return (
    <div className={cx(className, 'grid shrink-0 place-items-center rounded-[14px] bg-kopi-100 text-kopi-600')}>
      <Icon strokeWidth={1.5} className="size-1/3" aria-hidden="true" />
    </div>
  );
}

export function Photo({ src, alt, className, fallback, width, height, eager = false }) {
  const [broken, setBroken] = useState(!src);
  if (broken) return fallback ?? null;
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setBroken(true)}
      className={className}
    />
  );
}

// Penghitung jumlah dengan target sentuh 44x44px ramah jari di HP
export function Stepper({ value, onChange, max = 99 }) {
  return (
    <div className="inline-flex items-center gap-[4px]">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="grid size-[44px] place-items-center rounded-[10px] border border-kopi-200 bg-kertas text-kopi-900 transition-colors hover:bg-kopi-100"
        aria-label="Kurangi"
      >
        <Minus strokeWidth={1.75} className="size-[18px]" />
      </button>
      <span className="w-[28px] text-center text-[16px] font-semibold leading-[24px] tabular-nums text-kopi-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-[44px] place-items-center rounded-[10px] bg-terakota-700 text-kertas transition-colors hover:bg-terakota-800"
        aria-label="Tambah"
      >
        <Plus strokeWidth={1.75} className="size-[18px]" />
      </button>
    </div>
  );
}

const badgeBase =
  'inline-flex items-center gap-[6px] whitespace-nowrap rounded-full px-[10px] py-[4px] text-[12px] font-medium leading-[16px]';

export const StatusBadge = ({ status }) => {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.diterima;
  return (
    <span className={cx(badgeBase, s.badge)}>
      <span className={cx('size-[6px] rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
};

export const PaymentBadge = ({ status }) => {
  const s = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.belum_bayar;
  return (
    <span className={cx(badgeBase, s.badge)}>
      <span className={cx('size-[6px] rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
};

export function OfflineBanner({ online }) {
  if (online) return null;
  return (
    <div className="flex items-center gap-2 bg-kopi-950 px-4 py-2.5 text-sm text-kertas" role="status" aria-live="polite">
      <WifiOff strokeWidth={1.5} className="size-4 shrink-0 text-emas" aria-hidden="true" />
      Sinyal terputus. Menu tetap bisa dilihat, namun pesanan baru terkirim setelah koneksi kembali.
    </div>
  );
}

// Panel bawah di HP, dialog terpusat di laptop — atau layar penuh (fullScreen) untuk chat HP
export function Sheet({ open, onClose, title, subtitle = null, fullScreen = false, children, footer = null }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className={cx(
        'fixed inset-0 z-50 flex justify-center sm:items-center sm:p-4',
        fullScreen ? 'items-stretch' : 'items-end',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 animate-fade-in bg-kopi-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cx(
          'relative flex w-full animate-slide-up flex-col bg-kertas shadow-lift',
          fullScreen
            ? 'h-dvh rounded-none border-0 sm:h-[min(844px,calc(100dvh-2rem))] sm:max-w-[420px] sm:rounded-[24px] sm:border sm:border-kopi-200'
            : 'max-h-[92dvh] rounded-t-[24px] border border-kopi-200 sm:max-w-lg sm:rounded-[24px]',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-kopi-200/80 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="font-display text-[22px] font-bold leading-tight text-kopi-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-kopi-600">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-[44px] shrink-0 place-items-center rounded-full text-kopi-700 hover:bg-kopi-100"
            aria-label="Tutup"
          >
            <X strokeWidth={1.75} className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div
            className={cx(
              'border-t border-kopi-200/80 bg-kertas px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]',
              fullScreen ? 'sm:rounded-b-[24px]' : 'rounded-b-[24px]',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Pengganti window.confirm() yang konsisten dengan tema kedai
export function ConfirmSheet({ open, onClose, onConfirm, title, description, confirmLabel = 'Ya, lanjutkan', danger = false }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <p className="text-sm leading-relaxed text-kopi-700">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={btnSecondary}>
          Batal
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={cx(
            btn,
            danger ? 'bg-[#b42318] text-white hover:bg-[#912018]' : 'bg-terakota-700 text-kertas hover:bg-terakota-800',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}

export const Spinner = ({ className = 'size-5' }) => (
  <LoaderCircle strokeWidth={1.5} className={cx(className, 'animate-spin')} aria-label="Memuat" />
);

export function Loading({ text = 'Memuat…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-kopi-600">
      <Spinner /> {text}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-kertas-tua text-terakota-700">
          <Icon strokeWidth={1.5} className="size-7" aria-hidden="true" />
        </div>
      )}
      <p className="font-display text-[22px] font-bold text-kopi-900">{title}</p>
      {children && <div className="mt-1.5 max-w-xs text-sm text-kopi-600">{children}</div>}
    </div>
  );
}

export function InstagramIcon({ className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

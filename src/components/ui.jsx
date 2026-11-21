import { useEffect, useState } from 'react';
import { Coffee, Cookie, CookingPot, CupSoda, Leaf, LoaderCircle, Minus, Plus, Soup, WifiOff, X } from 'lucide-react';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/order';
import { categoryDefaultImage } from '../data/menu';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const card = 'rounded-2xl border border-kopi-900/[0.08] bg-white shadow-soft';
export const btn =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
export const btnPrimary = cx(btn, 'bg-terakota-700 text-white hover:bg-terakota-800');
export const btnSecondary = cx(btn, 'border border-kopi-900/[0.12] bg-white text-kopi-900 hover:bg-kopi-50');
export const btnGhost = cx(btn, 'text-kopi-600 hover:bg-kopi-50');
// Untuk latar gelap
export const btnLight = cx(btn, 'bg-kertas text-kopi-950 hover:bg-white');
export const btnOutlineLight = cx(btn, 'border border-kertas/25 text-kertas hover:bg-kertas/10');
export const input =
  'w-full rounded-xl border border-kopi-900/[0.12] bg-white px-3.5 h-11 text-sm outline-none transition focus:border-terakota-400 focus:ring-4 focus:ring-terakota-100';

// Cangkir mengepul seperti logo kedai
export function CupMark({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 32h28v5a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" />
      <path d="M44 34h3a5 5 0 0 1 0 10h-4.5" />
      <path d="M10 54h40" />
      <path d="M26 26c-3.5-3.5 3.5-7 0-12M34 26c-3.5-3.5 3.5-7 0-12" />
    </svg>
  );
}

export function Logo({ light = false }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <span className={cx('inline-flex items-center gap-2.5', light ? 'text-kertas' : 'text-kopi-950')}>
      <span className={cx('grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-kertas/15', light ? 'bg-kopi-950 text-[#e8c98a]' : 'bg-kopi-950 text-[#e8c98a]')}>
        {!imgErr ? (
          <img src="/images/logo-bungadi.jpg" alt="Logo Bungadi" onError={() => setImgErr(true)} className="size-full object-cover" />
        ) : (
          <CupMark className="size-6" />
        )}
      </span>
      <span className="leading-none">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">Wedang Uwuh</span>
        <span className="mt-0.5 block font-display text-[22px] font-semibold">Bungadi</span>
      </span>
    </span>
  );
}

const categoryIcon = { wedang: Coffee, kopi: Coffee, jamu: Leaf, teh: CupSoda, makanan: CookingPot, snack: Cookie, tambahan: Soup };

// Foto menu (item.image) dari Section Aset Figma.
export function MenuThumb({ item, className = 'size-20' }) {
  const [broken, setBroken] = useState(false);
  const src = item?.image || categoryDefaultImage[item?.category];
  if (src && !broken) {
    return <img src={src} alt={item.name} onError={() => setBroken(true)} className={cx(className, 'shrink-0 rounded-xl object-cover')} />;
  }
  const Icon = categoryIcon[item?.category] ?? Coffee;
  return (
    <div className={cx(className, 'paper grid shrink-0 place-items-center rounded-xl border border-kopi-900/[0.06] text-kopi-400')}>
      <Icon strokeWidth={1.5} className="size-1/3" aria-hidden="true" />
    </div>
  );
}

// Gambar yang otomatis diganti `fallback` bila filenya belum ada
export function Photo({ src, alt, className, fallback }) {
  const [broken, setBroken] = useState(!src);
  if (broken) return fallback;
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={className} />;
}

export function Stepper({ value, onChange, max = 99, size = 'md' }) {
  const box = size === 'sm' ? 'size-8' : 'size-9';
  return (
    <div className="inline-flex items-center rounded-xl border border-black/[0.08] bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className={cx(box, 'grid place-items-center rounded-l-xl text-kopi-700 hover:bg-kopi-50')}
        aria-label="Kurangi"
      >
        <Minus strokeWidth={1.5} className="size-4" />
      </button>
      <span className="min-w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cx(box, 'grid place-items-center rounded-r-xl text-terakota-700 hover:bg-terakota-50')}
        aria-label="Tambah"
      >
        <Plus strokeWidth={1.5} className="size-4" />
      </button>
    </div>
  );
}

const badgeBase = 'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset';

export const StatusBadge = ({ status }) => (
  <span className={cx(badgeBase, ORDER_STATUS[status].badge)}>{ORDER_STATUS[status].label}</span>
);

export const PaymentBadge = ({ status }) => (
  <span className={cx(badgeBase, PAYMENT_STATUS[status].badge)}>{PAYMENT_STATUS[status].label}</span>
);

export function OfflineBanner({ online }) {
  if (online) return null;
  return (
    <div className="flex items-center gap-2 bg-kopi-900 px-4 py-2 text-sm text-white" role="status">
      <WifiOff strokeWidth={1.5} className="size-4 shrink-0" />
      Sinyal terputus. Menu tetap bisa dilihat, tapi pesanan baru terkirim setelah koneksi kembali.
    </div>
  );
}

// Panel bawah di HP, kotak di tengah layar di laptop
export function Sheet({ open, onClose, title, children }) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-kopi-950/40" onClick={onClose} />
      <div className="relative flex max-h-[90dvh] w-full animate-slide-up flex-col rounded-t-3xl bg-white shadow-lift sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-kopi-100" aria-label="Tutup">
            <X strokeWidth={1.5} className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export const Spinner = ({ className = 'size-5' }) => (
  <LoaderCircle strokeWidth={1.5} className={cx(className, 'animate-spin')} aria-label="Memuat" />
);

export function Loading({ text = 'Memuat…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-kopi-500">
      <Spinner /> {text}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && <Icon strokeWidth={1.5} className="mb-3 size-10 text-kopi-300" />}
      <p className="font-semibold text-kopi-800">{title}</p>
      {children && <div className="mt-1 max-w-xs text-sm text-kopi-500">{children}</div>}
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

import { useEffect, useState } from 'react';
import { Coffee, Cookie, CookingPot, CupSoda, Leaf, LoaderCircle, Minus, Plus, Soup, WifiOff, X } from 'lucide-react';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/order';
import { categoryDefaultImage } from '../data/menu';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const card = 'rounded-[16px] border border-[#e4e4e7] bg-white';
export const btn =
  'inline-flex items-center justify-center gap-2 rounded-[12px] px-5 h-[48px] text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
export const btnPrimary = cx(btn, 'bg-[#7a4b2a] text-white hover:bg-[#5e3920]');
export const btnSecondary = cx(btn, 'border border-[#e4e4e7] bg-white text-[#18181b] hover:bg-[#f4f4f5]');
export const btnGhost = cx(btn, 'text-[#71717a] hover:bg-[#f4f4f5]');
export const btnLight = cx(btn, 'bg-white text-[#18181b] hover:bg-[#f4f4f5]');
export const btnOutlineLight = cx(btn, 'border border-white/25 text-white hover:bg-white/10');
export const input =
  'w-full rounded-[12px] border border-[#e4e4e7] bg-white px-[14px] h-[48px] text-[14px] text-[#18181b] placeholder:text-[#71717a] outline-none transition focus:border-[#7a4b2a]';

export function CupMark({ className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
      <path d="M6 2v2" />
    </svg>
  );
}

export function Logo({ light = false, subtitle = null }) {
  return (
    <span className={cx('inline-flex items-center gap-[10px]', light ? 'text-white' : 'text-[#18181b]')}>
      <span className="grid size-[36px] shrink-0 place-items-center rounded-[10px] bg-[#7a4b2a] text-white">
        <CupMark className="size-[20px]" />
      </span>
      <span className="leading-tight">
        <span className="block text-[16px] font-semibold leading-[24px]">Wedang Uwuh Bu Ngadi</span>
        {subtitle && <span className="block text-[12px] font-medium leading-[16px] text-[#71717a]">{subtitle}</span>}
      </span>
    </span>
  );
}

const categoryIcon = { wedang: Coffee, kopi: Coffee, jamu: Leaf, teh: CupSoda, makanan: CookingPot, snack: Cookie, tambahan: Soup };

// Foto menu (item.image) dari Section Aset Figma.
export function MenuThumb({ item, className = 'size-[84px]' }) {
  const [broken, setBroken] = useState(false);
  const src = item?.image || categoryDefaultImage[item?.category];
  if (src && !broken) {
    return <img src={src} alt={item.name} onError={() => setBroken(true)} className={cx(className, 'shrink-0 rounded-[14px] object-cover')} />;
  }
  const Icon = categoryIcon[item?.category] ?? Coffee;
  return (
    <div className={cx(className, 'grid shrink-0 place-items-center rounded-[14px] bg-[#f4f4f5] text-[#71717a]')}>
      <Icon strokeWidth={1.5} className="size-1/3" aria-hidden="true" />
    </div>
  );
}

export function Photo({ src, alt, className, fallback }) {
  const [broken, setBroken] = useState(!src);
  if (broken) return fallback;
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={className} />;
}

// Penghitung jumlah persis seperti Figma node 16:79 (Kurangi: putih border #e4e4e7, Tambah: #7a4b2a teks putih)
export function Stepper({ value, onChange, max = 99 }) {
  return (
    <div className="inline-flex items-center gap-[4px]">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="grid size-[36px] place-items-center rounded-[10px] border border-[#e4e4e7] bg-white text-[#18181b] transition-colors hover:bg-[#f4f4f5]"
        aria-label="Kurangi"
      >
        <Minus strokeWidth={1.75} className="size-[18px]" />
      </button>
      <span className="w-[28px] text-center text-[16px] font-semibold leading-[24px] tabular-nums text-[#18181b]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-[36px] place-items-center rounded-[10px] bg-[#7a4b2a] text-white transition-colors hover:bg-[#5e3920]"
        aria-label="Tambah"
      >
        <Plus strokeWidth={1.75} className="size-[18px]" />
      </button>
    </div>
  );
}

const badgeBase = 'inline-flex items-center gap-[6px] whitespace-nowrap rounded-full px-[10px] py-[4px] text-[12px] font-medium leading-[16px]';

export const StatusBadge = ({ status }) => {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.diterima;
  return (
    <span className={cx(badgeBase, s.badge)}>
      <span className={cx('size-[6px] rounded-full', s.dot)} />
      {s.label}
    </span>
  );
};

export const PaymentBadge = ({ status }) => {
  const s = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.belum_bayar;
  return (
    <span className={cx(badgeBase, s.badge)}>
      <span className={cx('size-[6px] rounded-full', s.dot)} />
      {s.label}
    </span>
  );
};

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

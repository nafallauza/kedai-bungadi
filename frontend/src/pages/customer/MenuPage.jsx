import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bean,
  ChevronRight,
  ClipboardList,
  Coffee,
  Cookie,
  CookingPot,
  CupSoda,
  Leaf,
  MessageCircle,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  Soup,
  Utensils,
  X,
} from 'lucide-react';
import { categories } from '../../data/menu';
import { useBestSellers, useMenu } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { formatRupiah } from '../../utils/format';
import { cartKey, cartLines, priceRange } from '../../utils/order';
import {
  EmptyState,
  Loading,
  MenuThumb,
  Sheet,
  Stepper,
  btnPrimary,
  btnSecondary,
  cx,
  input,
} from '../../components/ui';
import AssistantSheet from '../../components/AssistantSheet';

const CAT_ICONS = {
  semua: Utensils,
  wedang: Coffee,
  kopi: Bean,
  jamu: Leaf,
  teh: CupSoda,
  makanan: CookingPot,
  snack: Cookie,
  tambahan: Soup,
};

function DishDetailSheet({ item, onClose, canOrder }) {
  const { addItems } = useSession();
  const [choiceId, setChoiceId] = useState(item?.option?.choices[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [itemNote, setItemNote] = useState('');

  useEffect(() => {
    if (item) {
      setChoiceId(item.option?.choices[0]?.id ?? null);
      setQty(1);
      setItemNote('');
    }
  }, [item]);

  if (!item) return null;

  const activeChoice = item.option?.choices.find((c) => c.id === choiceId);
  const unitPrice = activeChoice?.price ?? item.price;

  const handleAdd = () => {
    addItems([
      {
        key: cartKey(item.id, choiceId),
        qty,
        note: itemNote.trim(),
      },
    ]);
    onClose();
  };

  return (
    <Sheet
      open={Boolean(item)}
      onClose={onClose}
      title={item.name}
      subtitle={formatRupiah(unitPrice)}
      footer={
        canOrder ? (
          <div className="flex items-center gap-3">
            <Stepper value={qty} onChange={(next) => setQty(Math.max(1, next))} />
            <button type="button" onClick={handleAdd} className={cx(btnPrimary, 'flex-1')}>
              Tambah · {formatRupiah(unitPrice * qty)}
            </button>
          </div>
        ) : (
          <Link to="/pesan" onClick={onClose} className={cx(btnPrimary, 'w-full')}>
            <QrCode strokeWidth={1.75} className="size-4" aria-hidden="true" />
            Scan QR / Pilih meja untuk memesan
          </Link>
        )
      }
    >
      <img
        src={item.image}
        alt={item.name}
        width={640}
        height={420}
        className="h-[220px] w-full rounded-[16px] bg-kopi-100 object-cover"
      />

      <p className="mt-4 text-[14px] leading-relaxed text-kopi-700">
        {item.longDescription || item.description}
      </p>

      {item.option && (
        <div className="mt-5">
          <p className="text-[14px] font-semibold text-kopi-900">{item.option.label}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.option.choices.map((c) => {
              const active = choiceId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChoiceId(c.id)}
                  className={cx(
                    'min-h-[44px] rounded-[12px] border px-4 text-[14px] font-semibold transition-colors',
                    active
                      ? 'border-terakota-700 bg-terakota-50 text-terakota-800'
                      : 'border-kopi-200 bg-kertas text-kopi-800 hover:bg-kopi-100',
                  )}
                >
                  {c.name}
                  {c.price && c.price !== item.price ? ` · ${formatRupiah(c.price)}` : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {canOrder && (
        <div className="mt-5">
          <label htmlFor="dish-note" className="block text-[14px] font-semibold text-kopi-900">
            Catatan dapur (opsional)
          </label>
          <input
            id="dish-note"
            type="text"
            value={itemNote}
            onChange={(e) => setItemNote(e.target.value)}
            placeholder="Contoh: gula dipisah, tidak terlalu manis, tanpa es"
            className={cx(input, 'mt-1.5')}
          />
        </div>
      )}
    </Sheet>
  );
}

function MenuRowAction({ item, cart, onOpenDetail, canOrder }) {
  const { setQty } = useSession();

  if (!item.available) {
    return (
      <span className="inline-flex min-h-[36px] items-center rounded-[10px] bg-kopi-100 px-3 text-xs font-semibold text-kopi-600">
        Habis
      </span>
    );
  }

  if (!canOrder) {
    return (
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="inline-flex min-h-[44px] items-center rounded-[10px] border border-kopi-200 bg-kertas px-3.5 text-xs font-semibold text-kopi-800 hover:bg-kopi-100"
      >
        Detail
      </button>
    );
  }

  // Hitung varian apa saja dari menu ini yang sudah masuk keranjang
  const entries = Object.entries(cart).filter(([k, q]) => q > 0 && (k === item.id || k.startsWith(`${item.id}:`)));
  const totalQty = entries.reduce((sum, [, q]) => sum + q, 0);

  if (totalQty === 0) {
    return (
      <button
        type="button"
        onClick={() => (item.option ? onOpenDetail(item) : setQty(cartKey(item.id), 1))}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-kopi-200 bg-kertas px-3.5 text-[13px] font-semibold text-kopi-900 transition-colors hover:border-terakota-400 hover:bg-terakota-50"
      >
        <Plus strokeWidth={1.75} className="size-4 text-terakota-700" aria-hidden="true" />
        Tambah
      </button>
    );
  }

  // Jika item punya pilihan (mis. Panas & Es keduanya di keranjang), buka detail agar tidak merusak jumlah varian lain
  if (item.option && entries.length > 1) {
    return (
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-terakota-700 px-3.5 text-[13px] font-semibold text-kertas hover:bg-terakota-800"
      >
        {totalQty} di keranjang · +
      </button>
    );
  }

  const singleKey = entries[0][0];
  return <Stepper value={entries[0][1]} onChange={(next) => setQty(singleKey, next)} />;
}

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { table, cart, itemNotes, cartCount, myOrderIds } = useSession();
  const { data: menu, loading, error, reload } = useMenu();
  const { data: bestSellers } = useBestSellers();

  const [category, setCategory] = useState('semua');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('bantuan') === '1') {
      setAssistantOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const lines = useMemo(() => (menu ? cartLines(menu, cart, itemNotes) : []), [menu, cart, itemNotes]);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  const filtered = useMemo(() => {
    if (!menu) return [];
    const q = query.trim().toLowerCase();
    return menu.filter((m) => {
      if (category !== 'semua' && m.category !== category) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    });
  }, [menu, category, query]);

  const grouped = useMemo(() => {
    return categories
      .map((cat) => ({ ...cat, items: filtered.filter((m) => m.category === cat.id) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  const canOrder = Boolean(table);

  return (
    <div className="min-h-dvh pb-28">
      {/* Header halaman menu */}
      <header className="sticky top-0 z-20 border-b border-kopi-200/80 bg-kertas/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate font-display text-[21px] font-bold leading-tight tracking-[-0.015em] text-kopi-950 sm:text-[28px]">
              Wedang Uwuh Bu Ngadi
            </h1>
            <p className="text-xs font-medium text-kopi-600">
              {table ? table.name : 'Katalog menu · Patuk, Gunungkidul'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {myOrderIds.length > 0 && (
              <Link
                to="/pesanan"
                className="relative grid size-[44px] place-items-center rounded-[12px] border border-kopi-200 bg-kertas text-kopi-800 hover:bg-kopi-100"
                aria-label={`Lihat ${myOrderIds.length} pesanan saya`}
              >
                <ClipboardList strokeWidth={1.75} className="size-5" />
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-terakota-700 text-[11px] font-bold text-kertas">
                  {myOrderIds.length}
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                if (searchOpen) setQuery('');
              }}
              className="grid size-[44px] place-items-center rounded-[12px] border border-kopi-200 bg-kertas text-kopi-800 hover:bg-kopi-100"
              aria-label={searchOpen ? 'Tutup pencarian' : 'Cari menu'}
            >
              {searchOpen ? <X strokeWidth={1.75} className="size-5" /> : <Search strokeWidth={1.75} className="size-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="mt-3">
            <label htmlFor="menu-search" className="sr-only">
              Cari nama atau bahan menu
            </label>
            <input
              id="menu-search"
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari wedang, kombucha, nasi pecel…"
              className={input}
            />
          </div>
        )}
      </header>

      {/* Pita mode lihat menu jika pengunjung datang dari landing/Google Maps tanpa scan QR */}
      {!canOrder && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-[14px] border border-kopi-200 bg-kertas-tua px-4 py-3">
          <p className="text-xs leading-relaxed text-kopi-800">
            Sedang dalam mode lihat menu. Scan QR meja saat di kedai untuk mulai memesan.
          </p>
          <Link
            to="/pesan"
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-[10px] bg-terakota-700 px-3 text-xs font-semibold text-kertas hover:bg-terakota-800"
          >
            <QrCode strokeWidth={1.75} className="size-3.5" aria-hidden="true" />
            Pilih meja
          </Link>
        </div>
      )}

      {/* Banner asisten rombongan Tanya Menu */}
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="flex w-full items-center gap-3 rounded-[16px] border border-terakota-200 bg-terakota-50 px-4 py-3.5 text-left transition-colors hover:bg-terakota-100/70"
        >
          <span className="grid size-[40px] shrink-0 place-items-center rounded-[12px] bg-kertas text-terakota-700 shadow-soft">
            <MessageCircle strokeWidth={1.75} className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-kopi-950">Datang rombongan?</span>
            <span className="block text-xs leading-relaxed text-kopi-700">
              Tanya Menu bantu pilihkan sesuai jumlah orang & anggaran.
            </span>
          </span>
          <ChevronRight strokeWidth={1.75} className="size-5 shrink-0 text-terakota-700" aria-hidden="true" />
        </button>
      </div>

      {/* Filter kategori dengan chip Semua yang jujur (tanpa garis scrollbar kasar) */}
      <nav
        aria-label="Kategori menu"
        className="mt-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6"
      >
        {[{ id: 'semua', shortName: 'Semua' }, ...categories].map((cat) => {
          const active = category === cat.id;
          const Icon = CAT_ICONS[cat.id] ?? Coffee;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              aria-pressed={active}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cx(
                  'grid size-[52px] place-items-center rounded-[14px] border transition-colors',
                  active
                    ? 'border-terakota-700 bg-terakota-700 text-kertas'
                    : 'border-kopi-200 bg-kopi-50 text-kopi-700 hover:bg-kopi-100',
                )}
              >
                <Icon strokeWidth={1.75} className="size-5" aria-hidden="true" />
              </span>
              <span
                className={cx(
                  'text-xs font-medium',
                  active ? 'font-semibold text-terakota-800' : 'text-kopi-700',
                )}
              >
                {cat.shortName}
              </span>
            </button>
          );
        })}
      </nav>

      {loading && <Loading text="Memuat daftar menu…" />}

      {error && (
        <div className="mx-4 mt-6 rounded-[16px] border border-[#f5c7c2] bg-[#fdf1f0] p-4 text-center">
          <p className="text-sm font-semibold text-[#b42318]">Menu belum berhasil dimuat</p>
          <p className="mt-1 text-xs text-kopi-700">{error}</p>
          <button type="button" onClick={reload} className={cx(btnSecondary, 'mt-3')}>
            Coba muat ulang
          </button>
        </div>
      )}

      {/* Paling laris minggu ini */}
      {!loading && !error && category === 'semua' && !query.trim() && bestSellers?.length > 0 && (
        <section className="mt-6">
          <h2 className="px-4 font-display text-[24px] font-bold leading-tight text-kopi-950 sm:px-6 sm:text-[28px]">
            Paling laris minggu ini
          </h2>
          <div className="mt-3 flex gap-3.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6">
            {bestSellers.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedDish(item)}
                className="w-[148px] shrink-0 text-left sm:w-[164px]"
              >
                <MenuThumb item={item} className="size-[148px] sm:size-[164px]" width={164} height={164} eager />
                <p className="mt-2 line-clamp-2 text-[14px] font-semibold leading-snug text-kopi-900">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs font-semibold tabular-nums text-terakota-700">
                  {formatRupiah(item.price)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Daftar menu per kategori */}
      {!loading && !error && grouped.length === 0 && (
        <EmptyState icon={Search} title="Menu tidak ditemukan">
          <p>Tidak ada hidangan yang cocok dengan “{query}”.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('semua');
            }}
            className={cx(btnSecondary, 'mt-4')}
          >
            Tampilkan semua menu
          </button>
        </EmptyState>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-8 px-4 sm:px-6">
          {grouped.map((group) => (
            <section key={group.id}>
              <div className="flex items-baseline justify-between border-b border-kopi-200 pb-2">
                <h2 className="font-display text-[24px] font-bold leading-tight text-kopi-950 sm:text-[28px]">
                  {group.name}
                </h2>
                <span className="text-xs font-medium text-kopi-600">{group.items.length} menu</span>
              </div>

              <ul className="divide-y divide-kopi-100 md:grid md:grid-cols-2 md:gap-x-7 md:divide-y-0 xl:grid-cols-3">
                {group.items.map((item) => {
                  const [minP, maxP] = priceRange(item);
                  const isSignature = ['wedang-uwuh-bungadi', 'kombucha', 'madu-jeruk'].includes(item.id);
                  return (
                    <li
                      key={item.id}
                      className={cx(
                        'flex items-start gap-3.5 py-4 md:border-b md:border-kopi-100',
                        !item.available && 'opacity-65',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => item.available && setSelectedDish(item)}
                        className="group flex min-w-0 flex-1 items-start gap-3.5 text-left"
                        aria-label={`Lihat detail ${item.name}`}
                      >
                        <MenuThumb item={item} className="size-[84px]" width={84} height={84} />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[15px] font-semibold leading-snug text-kopi-950 group-hover:text-terakota-700">
                              {item.name}
                            </span>
                            {isSignature && item.available && (
                              <span className="rounded-full bg-terakota-50 px-2 py-0.5 text-[11px] font-semibold text-terakota-800">
                                Khas
                              </span>
                            )}
                            {!item.available && (
                              <span className="rounded-full bg-kopi-100 px-2 py-0.5 text-[11px] font-semibold text-kopi-600">
                                Habis
                              </span>
                            )}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-kopi-600">
                            {item.description}
                          </span>
                          <span className="mt-2 block text-[14px] font-semibold tabular-nums text-terakota-700">
                            {minP === maxP ? formatRupiah(minP) : `${formatRupiah(minP)}–${formatRupiah(maxP)}`}
                          </span>
                        </span>
                      </button>

                      <div className="shrink-0 self-end">
                        <MenuRowAction
                          item={item}
                          cart={cart}
                          onOpenDetail={setSelectedDish}
                          canOrder={canOrder}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Bilah keranjang mengambang — sejajar dengan lebar katalog */}
      {canOrder && cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] p-4 md:max-w-[1360px] md:px-6">
          <Link
            to="/keranjang"
            className="flex min-h-[56px] items-center justify-between rounded-[16px] bg-terakota-700 px-4 py-3 text-kertas shadow-lift transition-colors hover:bg-terakota-800"
          >
            <div>
              <p className="text-xs font-medium text-terakota-100">{cartCount} item dipilih</p>
              <p className="text-[16px] font-bold tabular-nums">{formatRupiah(total)}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-[14px] font-semibold">
              Lihat keranjang
              <ShoppingBag strokeWidth={1.75} className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      )}

      <DishDetailSheet item={selectedDish} onClose={() => setSelectedDish(null)} canOrder={canOrder} />
      <AssistantSheet open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}

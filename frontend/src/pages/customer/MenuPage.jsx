import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame, MessageCircle, Plus, Receipt, Search, ShoppingBag, Snowflake, X } from 'lucide-react';
import { categories } from '../../data/menu';
import { useMenu } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { formatRupiah } from '../../utils/format';
import { cartKey, cartLines, priceRange } from '../../utils/order';
import AssistantSheet from '../../components/AssistantSheet';
import { EmptyState, Loading, MenuThumb, Stepper, cx, input } from '../../components/ui';

const priceText = (item) => {
  const [min, max] = priceRange(item);
  return min === max ? formatRupiah(min) : `${formatRupiah(min)} – ${formatRupiah(max).replace('Rp', '').trim()}`;
};

// Lembar Detail Hidangan persis sesuai Figma node 19:95
function DishDetailSheet({ item, onClose }) {
  const { addItems } = useSession();
  const [choiceId, setChoiceId] = useState(item?.option?.choices[0]?.id ?? null);
  const [itemNote, setItemNote] = useState('');
  const [qty, setQty] = useState(1);

  if (!item) return null;
  const choice = item.option?.choices.find((c) => c.id === choiceId);
  const price = choice?.price ?? item.price;

  const add = () => {
    addItems([{ key: cartKey(item.id, choiceId), qty }]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <div className="relative flex w-full max-w-md animate-slide-up flex-col gap-[16px] rounded-t-[24px] bg-white px-[20px] pt-[10px] pb-[34px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04),0px_8px_24px_0px_rgba(0,0,0,0.08)] sm:rounded-[24px]">
        {/* Pegangan (node 19:149) */}
        <div className="flex w-full justify-center">
          <div className="h-[4px] w-[40px] rounded-[2px] bg-[#e4e4e7]" />
        </div>

        {/* Foto 200px (node 19:151) */}
        <MenuThumb item={item} className="h-[200px] w-full rounded-[16px]" />

        {/* Nama dan harga (node 19:152) */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[24px] font-semibold leading-[32px] tracking-[-0.24px] text-[#18181b]">{item.name}</h2>
          <span className="text-[20px] font-semibold leading-[28px] tracking-[-0.1px] text-[#18181b]">
            {formatRupiah(price)}
          </span>
        </div>

        {/* Deskripsi (node 19:155) */}
        <p className="text-[14px] leading-[20px] text-[#71717a]">
          {item.longDescription || item.description || 'Disiapkan segar dari dapur Wedang Uwuh Bu Ngadi.'}
        </p>

        {/* Penyajian / Opsi (node 19:156) */}
        {item.option && (
          <div className="flex flex-col gap-[10px]">
            <p className="text-[14px] font-semibold leading-[20px] text-[#18181b]">{item.option.label}</p>
            <div className="flex flex-wrap gap-[8px]">
              {item.option.choices.map((c) => {
                const active = choiceId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setChoiceId(c.id)}
                    className={cx(
                      'inline-flex h-[36px] items-center justify-center gap-[6px] rounded-full border px-[14px] text-[14px] leading-[20px] transition-colors',
                      active
                        ? 'border-[#7a4b2a] bg-[#f6eee7] font-semibold text-[#5e3920]'
                        : 'border-[#e4e4e7] bg-white font-normal text-[#18181b] hover:bg-[#f4f4f5]',
                    )}
                  >
                    {c.id === 'panas' && <Flame strokeWidth={1.75} className="size-[16px]" />}
                    {c.id === 'es' && <Snowflake strokeWidth={1.75} className="size-[16px]" />}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Kolom isian Catatan (node 19:169) */}
        <div className="flex flex-col gap-[8px]">
          <label className="text-[14px] font-semibold leading-[20px] text-[#18181b]">Catatan</label>
          <input
            type="text"
            value={itemNote}
            onChange={(e) => setItemNote(e.target.value)}
            placeholder="Contoh: tidak terlalu manis"
            className={input}
          />
        </div>

        {/* Baris bawah: Penghitung jumlah + Tombol Tambah (node 19:170) */}
        <div className="flex items-center gap-[12px] pt-[4px]">
          <Stepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
          <button
            type="button"
            onClick={add}
            className="flex h-[48px] flex-1 items-center justify-center rounded-[12px] bg-[#7a4b2a] px-[20px] text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-[#5e3920]"
          >
            Tambah, {formatRupiah(price * qty)}
          </button>
        </div>
      </div>
    </div>
  );
}

// Tombol Tambah / Penghitung Jumlah di baris menu (sesuai Figma node 18:97 & 18:113)
function MenuRowAction({ item, onOpenDetail }) {
  const { cart, setQty } = useSession();
  if (!item.available) return <span className="text-[12px] font-medium text-[#71717a]">Habis</span>;

  // Hitung total qty item ini di keranjang (termasuk varian panas/es)
  const matchingEntries = Object.entries(cart).filter(([k]) => k === item.id || k.startsWith(`${item.id}:`));
  const totalQty = matchingEntries.reduce((s, [, q]) => s + q, 0);
  const primaryKey = matchingEntries[0]?.[0] ?? (item.option ? cartKey(item.id, item.option.choices[0].id) : item.id);

  if (totalQty > 0) {
    return <Stepper value={totalQty} onChange={(v) => setQty(primaryKey, v)} />;
  }

  return (
    <button
      type="button"
      onClick={() => (item.option ? onOpenDetail(item) : setQty(primaryKey, 1))}
      className="inline-flex h-[36px] items-center justify-center gap-[8px] rounded-[10px] border border-[#e4e4e7] bg-white px-[14px] text-[14px] font-semibold leading-[20px] text-[#18181b] transition-colors hover:bg-[#f4f4f5]"
    >
      <Plus strokeWidth={1.75} className="size-[16px]" />
      Tambah
    </button>
  );
}

// Baris menu persis sesuai Figma node 18:97
function MenuRow({ item, onOpenDetail }) {
  return (
    <li className={cx('flex items-start gap-[14px] border-b border-[#e4e4e7] bg-white py-[16px]', !item.available && 'opacity-60')}>
      <button type="button" onClick={() => onOpenDetail(item)} className="shrink-0 text-left">
        <MenuThumb item={item} className="size-[84px] rounded-[14px]" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <button
          type="button"
          onClick={() => onOpenDetail(item)}
          className="text-left text-[16px] font-semibold leading-[24px] text-[#18181b] hover:text-[#7a4b2a]"
        >
          {item.name}
        </button>
        {item.description && (
          <p className="text-[14px] font-normal leading-[20px] text-[#71717a]">{item.description}</p>
        )}
        <div className="flex w-full items-center justify-between pt-[6px]">
          <span className="text-[16px] font-semibold leading-[24px] tabular-nums text-[#18181b]">
            {priceText(item)}
          </span>
          <MenuRowAction item={item} onOpenDetail={onOpenDetail} />
        </div>
      </div>
    </li>
  );
}

export default function MenuPage() {
  const { table, cart, cartCount, addItems, myOrderIds } = useSession();
  const { data: menu, loading, error } = useMenu();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('wedang');
  const [showAllCats, setShowAllCats] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (menu ?? []).filter(
      (m) => (showAllCats || m.category === activeCat) && (!q || m.name.toLowerCase().includes(q)),
    );
  }, [menu, query, activeCat, showAllCats]);

  // 3 menu paling laris minggu ini persis seperti Figma node 18:76 (Wedang Uwuh Bu Ngadi, Nasi Pecel, Mendoan)
  const topThree = useMemo(() => {
    if (!menu) return [];
    const targetIds = ['wedang-uwuh-bungadi', 'nasi-pecel', 'mendoan'];
    const found = targetIds.map((id) => menu.find((m) => m.id === id)).filter(Boolean);
    return found.length > 0 ? found : menu.slice(0, 3);
  }, [menu]);

  const cartTotal = cartLines(menu ?? [], cart).reduce((sum, l) => sum + l.price * l.qty, 0);

  const handleSelectCategory = (catId) => {
    if (!showAllCats && activeCat === catId) {
      setShowAllCats(true);
      setActiveCat('wedang');
    } else {
      setActiveCat(catId);
      setShowAllCats(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white pb-[120px]">
      {/* KEPALA HALAMAN MENU (Sesuai Figma node 18:33) */}
      <header className="pt-[16px] px-[20px]">
        <div className="flex items-center gap-[12px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <h1 className="truncate text-[20px] font-semibold leading-[28px] tracking-[-0.1px] text-[#18181b]">
              Wedang Uwuh Bu Ngadi
            </h1>
            <p className="text-[14px] font-normal leading-[20px] text-[#71717a]">{table.name}</p>
          </div>

          {myOrderIds.length > 0 && (
            <Link
              to="/pesanan"
              className="relative grid size-[40px] shrink-0 place-items-center rounded-[12px] border border-[#e4e4e7] bg-white text-[#18181b] hover:bg-[#f4f4f5]"
              aria-label="Status pesanan"
            >
              <Receipt strokeWidth={1.5} className="size-[20px]" />
              <span className="absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-[#7a4b2a] text-[10px] font-bold text-white">
                {myOrderIds.length}
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              setSearchOpen((s) => !s);
              if (searchOpen) setQuery('');
            }}
            className="grid size-[40px] shrink-0 place-items-center rounded-[12px] border border-[#e4e4e7] bg-white text-[#18181b] hover:bg-[#f4f4f5]"
            aria-label="Cari menu"
          >
            {searchOpen ? <X strokeWidth={1.5} className="size-[20px]" /> : <Search strokeWidth={1.5} className="size-[20px]" />}
          </button>
        </div>

        {searchOpen && (
          <div className="mt-[12px]">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama wedang, kopi, atau makanan…"
              className={input}
            />
          </div>
        )}
      </header>

      {loading && <Loading text="Memuat menu…" />}
      {error && <EmptyState title="Menu gagal dimuat">{error}</EmptyState>}

      {menu && (
        <div className="mt-[20px] flex flex-col gap-[20px]">
          {/* KARTU TANYA MENU / DATANG ROMBONGAN (Sesuai Figma node 18:45 & screenshot user) */}
          <div className="px-[20px]">
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="flex w-full items-center gap-[12px] rounded-[16px] bg-[#f6eee7] px-[16px] py-[14px] text-left transition-colors hover:bg-[#efe2d6]"
            >
              <MessageCircle strokeWidth={1.5} className="size-[24px] shrink-0 text-[#5e3920]" />
              <div className="flex min-w-0 flex-1 flex-col gap-[2px] text-[14px] leading-[20px] text-[#5e3920]">
                <span className="font-semibold">Datang rombongan?</span>
                <span className="font-normal">
                  Tanya menu, kami bantu pilihkan sesuai jumlah orang dan anggaran.
                </span>
              </div>
              <ChevronRight strokeWidth={1.5} className="size-[20px] shrink-0 text-[#5e3920]" />
            </button>
          </div>

          {/* BARIS KATEGORI KOTAK IKON 56x56 (Sesuai Figma node 18:52) */}
          <div className="flex items-start gap-[12px] overflow-x-auto px-[20px] [scrollbar-width:none]">
            {categories.map((c) => {
              const isSelected = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCategory(c.id)}
                  className="flex w-[72px] shrink-0 flex-col items-center gap-[8px]"
                >
                  <div
                    className={cx(
                      'flex size-[56px] items-center justify-center rounded-[16px] transition-colors',
                      isSelected ? 'bg-[#7a4b2a]' : 'bg-[#f4f4f5] hover:bg-[#e4e4e7]',
                    )}
                  >
                    <img
                      src={c.icon}
                      alt={c.shortName}
                      className={cx('size-[24px]', isSelected && 'brightness-0 invert')}
                    />
                  </div>
                  <span
                    className={cx(
                      'w-full text-center text-[14px] leading-[20px]',
                      isSelected ? 'font-semibold text-[#5e3920]' : 'font-normal text-[#18181b]',
                    )}
                  >
                    {c.shortName || c.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* PALING LARIS MINGGU INI (Sesuai Figma node 18:76) */}
          {!query && showAllCats && topThree.length > 0 && (
            <section className="flex flex-col gap-[12px]">
              <div className="px-[20px]">
                <h2 className="text-[20px] font-semibold leading-[28px] tracking-[-0.1px] text-[#18181b]">
                  Paling laris minggu ini
                </h2>
              </div>
              <div className="flex items-start gap-[12px] overflow-x-auto px-[20px] [scrollbar-width:none]">
                {topThree.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDetailItem(item)}
                    className="flex w-[148px] shrink-0 flex-col items-start gap-[4px] text-left"
                  >
                    <MenuThumb item={item} className="size-[148px] rounded-[16px]" />
                    <div className="h-[4px] w-px" />
                    <p className="w-full truncate text-[14px] font-semibold leading-[20px] text-[#18181b]">
                      {item.name}
                    </p>
                    <p className="text-[14px] font-normal leading-[20px] text-[#71717a]">{priceText(item)}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* DAFTAR MENU PER KATEGORI (Sesuai Figma node 18:93) */}
          {filtered.length === 0 && (
            <EmptyState icon={Search} title="Menu tidak ditemukan">
              Coba kata kunci atau kategori lain.
            </EmptyState>
          )}

          {(showAllCats ? categories : categories.filter((c) => c.id === activeCat)).map((c) => {
            const items = filtered.filter((m) => m.category === c.id);
            if (items.length === 0) return null;
            return (
              <section key={c.id} className="px-[20px]">
                <div className="flex items-center justify-between pb-[4px]">
                  <h2 className="text-[20px] font-semibold leading-[28px] tracking-[-0.1px] text-[#18181b]">
                    {c.name}
                  </h2>
                  <span className="text-[14px] font-normal leading-[20px] text-[#71717a]">{items.length} menu</span>
                </div>
                <ul>
                  {items.map((item) => (
                    <MenuRow key={item.id} item={item} onOpenDetail={setDetailItem} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* BAR KERANJANG MENGAMBANG (Sesuai Figma node 17:48) */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-[20px] pb-[20px]">
          <Link
            to="/keranjang"
            className="flex h-[60px] w-full items-center justify-between rounded-[16px] bg-[#7a4b2a] px-[16px] text-white shadow-[0px_1px_1px_rgba(0,0,0,0.04),0px_8px_12px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#5e3920]"
          >
            <div className="flex flex-col items-start">
              <span className="text-[12px] font-medium leading-[16px] text-[#f6eee7]">{cartCount} item</span>
              <span className="text-[16px] font-semibold leading-[24px] text-white">{formatRupiah(cartTotal)}</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[14px] font-semibold leading-[20px] text-white">Lihat keranjang</span>
              <ShoppingBag strokeWidth={1.75} className="size-[20px] text-white" />
            </div>
          </Link>
        </div>
      )}

      <DishDetailSheet key={detailItem?.id} item={detailItem} onClose={() => setDetailItem(null)} />
      <AssistantSheet open={assistantOpen} onClose={() => setAssistantOpen(false)} onAdd={addItems} />
    </div>
  );
}

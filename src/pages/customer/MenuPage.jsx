import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Plus, Receipt, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { categories } from '../../data/menu';
import { useBestSellers, useMenu } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { formatRupiah } from '../../utils/format';
import { cartKey, cartLines, priceRange } from '../../utils/order';
import AssistantSheet from '../../components/AssistantSheet';
import { CupMark, EmptyState, Loading, MenuThumb, Sheet, Stepper, btnPrimary, card, cx, input } from '../../components/ui';

const priceText = (item) => {
  const [min, max] = priceRange(item);
  return min === max ? formatRupiah(min) : `${formatRupiah(min)} – ${formatRupiah(max).replace('Rp', '').trim()}`;
};

// Pilih penyajian (panas/es, goreng/bakar) sebelum masuk keranjang
function ChoiceSheet({ item, onClose }) {
  const { addItems } = useSession();
  const [choiceId, setChoiceId] = useState(item?.option?.choices[0].id);
  const [qty, setQty] = useState(1);
  if (!item) return null;
  const choice = item.option.choices.find((c) => c.id === choiceId);
  const price = choice?.price ?? item.price;

  const add = () => {
    addItems([{ key: cartKey(item.id, choiceId), qty }]);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={item.name}>
      <div className="flex gap-3">
        <MenuThumb item={item} className="size-16" />
        <p className="text-sm text-kopi-600">{item.description || 'Pilih penyajian sesuai selera.'}</p>
      </div>
      <p className="mt-5 text-sm font-medium">{item.option.label}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {item.option.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={choiceId === c.id}
            onClick={() => setChoiceId(c.id)}
            className={cx(
              'rounded-xl border px-3 py-3 text-left text-sm',
              choiceId === c.id ? 'border-terakota-600 bg-terakota-50 font-semibold text-terakota-900' : 'border-kopi-900/10',
            )}
          >
            {c.name}
            {c.price && <span className="block text-xs font-normal text-kopi-500">{formatRupiah(c.price)}</span>}
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-medium">Jumlah</span>
        <Stepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
      </div>
      <button type="button" onClick={add} className={cx(btnPrimary, 'mt-6 w-full')}>
        Tambah ke keranjang · {formatRupiah(price * qty)}
      </button>
    </Sheet>
  );
}

function AddButton({ item, onChoose }) {
  const { cart, setQty } = useSession();
  if (!item.available) return <span className="text-xs font-medium text-kopi-400">Habis</span>;

  if (item.option) {
    const inCart = Object.entries(cart)
      .filter(([key]) => key.startsWith(`${item.id}:`))
      .reduce((sum, [, q]) => sum + q, 0);
    return (
      <button
        type="button"
        onClick={() => onChoose(item)}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-terakota-200 bg-white px-3 text-sm font-semibold text-terakota-700 hover:bg-terakota-50"
      >
        <Plus strokeWidth={1.5} className="size-4" /> {inCart ? `${inCart} di keranjang` : 'Pilih'}
      </button>
    );
  }

  const qty = cart[item.id] ?? 0;
  if (qty > 0) return <Stepper value={qty} onChange={(v) => setQty(item.id, v)} size="sm" />;
  return (
    <button
      type="button"
      onClick={() => setQty(item.id, 1)}
      className="inline-flex h-8 items-center gap-1 rounded-full border border-terakota-200 bg-white px-3 text-sm font-semibold text-terakota-700 hover:bg-terakota-50"
    >
      <Plus strokeWidth={1.5} className="size-4" /> Tambah
    </button>
  );
}

function MenuRow({ item, onChoose }) {
  return (
    <li className={cx('flex gap-3 py-4', !item.available && 'opacity-60')}>
      <MenuThumb item={item} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-semibold leading-snug">
          {item.name}
          {item.tags.includes('khas') && (
            <span className="ml-2 rounded-full bg-terakota-700 px-1.5 py-px align-middle text-[10px] font-semibold tracking-wider text-white uppercase">
              Andalan
            </span>
          )}
        </p>
        {item.description && <p className="mt-0.5 line-clamp-2 text-sm text-kopi-500">{item.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-semibold tabular-nums">{priceText(item)}</span>
          <AddButton item={item} onChoose={onChoose} />
        </div>
      </div>
    </li>
  );
}

export default function MenuPage() {
  const { table, cart, cartCount, addItems, myOrderIds } = useSession();
  const { data: menu, loading, error } = useMenu();
  const { data: bestSellers } = useBestSellers();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('semua');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [choosing, setChoosing] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (menu ?? []).filter(
      (m) => (category === 'semua' || m.category === category) && (!q || m.name.toLowerCase().includes(q)),
    );
  }, [menu, query, category]);

  const cartTotal = cartLines(menu ?? [], cart).reduce((sum, l) => sum + l.price * l.qty, 0);
  const browsing = !query && category === 'semua';

  return (
    <div className="pb-28">
      <header className="grain sticky top-0 z-30 bg-kopi-950 px-4 pt-4 pb-3 text-kertas">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center overflow-hidden rounded-full border border-kertas/20 bg-kopi-950 text-[#e8c98a]">
              <img src="/images/logo-bungadi.jpg" alt="Bungadi" className="size-full object-cover" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">Bungadi</p>
              <p className="text-xs text-kertas/60">{table.name}</p>
            </div>
          </div>
          <Link to="/pesanan" className="relative grid size-10 place-items-center rounded-full border border-kertas/15" aria-label="Pesanan saya">
            <Receipt strokeWidth={1.5} className="size-5" />
            {myOrderIds.length > 0 && (
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-terakota-600 text-[10px] font-bold text-white">
                {myOrderIds.length}
              </span>
            )}
          </Link>
        </div>
        <div className="relative mt-3">
          <Search strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-kopi-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu…"
            className={cx(input, 'border-transparent pl-10 text-kopi-950')}
          />
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          {[{ id: 'semua', name: 'Semua' }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cx(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                category === c.id ? 'bg-kertas text-kopi-950' : 'border border-kertas/15 text-kertas/75',
              )}
            >
              {c.icon && (
                <img
                  src={c.icon}
                  alt=""
                  className={cx('size-4', category === c.id ? 'brightness-0' : 'brightness-0 invert opacity-80')}
                />
              )}
              {c.name}
            </button>
          ))}
        </div>
      </header>

      {loading && <Loading text="Memuat menu…" />}
      {error && <EmptyState title="Menu gagal dimuat">{error}</EmptyState>}

      {menu && (
        <div className="px-4">
          {browsing && (
            <>
              <button
                type="button"
                onClick={() => setAssistantOpen(true)}
                className={cx(card, 'mt-4 flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-terakota-200')}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-kopi-950 text-[#e8c98a]">
                  <Sparkles strokeWidth={1.5} className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">Datang rombongan? Biar kami bantu pilih</span>
                  <span className="block text-xs text-kopi-500">Isi jumlah orang dan anggaran, dapat rekomendasi menu.</span>
                </span>
                <ArrowRight strokeWidth={1.5} className="size-4 text-kopi-400" />
              </button>

              {bestSellers?.length > 0 && (
                <section className="mt-6">
                  <h2 className="flex items-center gap-1.5 font-display text-xl font-semibold">
                    <Flame strokeWidth={1.5} className="size-4 text-terakota-700" /> Paling sering dipesan
                  </h2>
                  <div className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                    {bestSellers.map((item, i) => (
                      <div key={item.id} className={cx(card, 'w-40 shrink-0 snap-start p-2.5')}>
                        <div className="relative">
                          <MenuThumb item={item} className="aspect-square w-full" />
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-kopi-950 px-1.5 py-0.5 text-[11px] font-bold text-kertas">
                            #{i + 1}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-xs tabular-nums text-kopi-500">{priceText(item)}</p>
                        <div className="mt-2">
                          <AddButton item={item} onChoose={setChoosing} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {filtered.length === 0 && <EmptyState icon={Search} title="Menu tidak ditemukan">Coba kata kunci lain.</EmptyState>}

          {(category === 'semua' ? categories : categories.filter((c) => c.id === category)).map((c) => {
            const items = filtered.filter((m) => m.category === c.id);
            if (items.length === 0) return null;
            return (
              <section key={c.id} className="mt-7">
                <h2 className="font-display text-xl font-semibold">{c.name}</h2>
                <ul className="divide-y divide-kopi-900/[0.08]">
                  {items.map((item) => (
                    <MenuRow key={item.id} item={item} onChoose={setChoosing} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md p-4">
          <Link
            to="/keranjang"
            className="flex h-14 items-center justify-between rounded-full bg-kopi-950 px-6 text-kertas shadow-lift transition-colors hover:bg-kopi-900"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <ShoppingBag strokeWidth={1.5} className="size-5 text-[#e8c98a]" />
              {cartCount} item · {formatRupiah(cartTotal)}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              Keranjang <ArrowRight strokeWidth={1.5} className="size-4" />
            </span>
          </Link>
        </div>
      )}

      <ChoiceSheet key={choosing?.id} item={choosing} onClose={() => setChoosing(null)} />
      <AssistantSheet open={assistantOpen} onClose={() => setAssistantOpen(false)} onAdd={addItems} />
    </div>
  );
}

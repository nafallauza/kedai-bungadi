import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Plus, ShoppingBag } from 'lucide-react';
import { useMenu } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { formatRupiah } from '../../utils/format';
import { cartLines } from '../../utils/order';
import {
  EmptyState,
  Loading,
  MenuThumb,
  Stepper,
  btnPrimary,
  btnSecondary,
  cx,
  input,
} from '../../components/ui';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    table,
    cart,
    itemNotes,
    setQty,
    setItemNote,
    customerName,
    setCustomerName,
    draftNote,
    setDraftNote,
  } = useSession();
  const { data: menu, loading } = useMenu();
  const [nameError, setNameError] = useState('');
  const nameRef = useRef(null);

  const lines = useMemo(() => (menu ? cartLines(menu, cart, itemNotes) : []), [menu, cart, itemNotes]);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  const proceedToPayment = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setNameError('Isi nama pemesan dulu agar staf tahu pesanan milik siapa di meja.');
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameRef.current?.focus({ preventScroll: true });
      return;
    }
    setNameError('');
    navigate('/pembayaran');
  };

  if (loading) return <Loading text="Memuat keranjang…" />;

  return (
    <div className="min-h-dvh pb-40">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-kopi-200/80 bg-kertas/95 px-4 py-3 backdrop-blur-sm">
        <Link
          to="/menu"
          className="grid size-[44px] -ml-2 place-items-center rounded-full text-kopi-700 hover:bg-kopi-100"
          aria-label="Kembali ke menu"
        >
          <ArrowLeft strokeWidth={1.75} className="size-5" />
        </Link>
        <div className="text-center">
          <h1 className="font-display text-[24px] font-bold leading-tight text-kopi-950">Keranjang</h1>
          <p className="text-xs font-medium text-kopi-600">{table?.name}</p>
        </div>
        <span className="w-[44px]" aria-hidden="true" />
      </header>

      {lines.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Keranjang masih kosong">
          <p>Pilih wedang, jamu, atau makanan rumahan dulu sebelum lanjut ke pembayaran.</p>
          <Link to="/menu" className={cx(btnPrimary, 'mt-5')}>
            Lihat daftar menu
          </Link>
        </EmptyState>
      ) : (
        <form onSubmit={proceedToPayment} noValidate className="px-4 pt-5">
          {/* Penanda langkah 1 dari 2 */}
          <div className="mb-4 flex items-center justify-between rounded-[12px] bg-kertas-tua px-3.5 py-2.5 text-xs font-medium text-kopi-700">
            <span>Langkah 1 dari 2 · Cek pesanan</span>
            <span className="font-semibold text-terakota-800">{table?.code}</span>
          </div>

          {/* Nama pemesan di atas agar langsung terlihat & tidak tenggelam di bawah daftar item */}
          <div
            className={cx(
              'mb-4 rounded-[16px] border p-4 transition-colors',
              nameError
                ? 'border-[#b42318] bg-[#fdf1f0]/75 ring-2 ring-[#b42318]/15'
                : 'border-kopi-200 bg-kertas',
            )}
          >
            <label htmlFor="customer-name" className="block text-[14px] font-semibold text-kopi-950">
              Nama pemesan <span className="text-[#b42318]">*</span>
            </label>
            <p className="mt-0.5 text-xs text-kopi-600">
              Supaya staf mudah mengantar saat satu meja diisi rombongan.
            </p>
            <input
              ref={nameRef}
              id="customer-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="Contoh: Rina atau Rombongan Pak Hadi"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'customer-name-error' : undefined}
              className={cx(
                input,
                'mt-2.5',
                nameError && 'border-[#b42318] bg-white focus:border-[#b42318]',
              )}
            />
            {nameError && (
              <p
                id="customer-name-error"
                className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-[#b42318]"
                role="alert"
              >
                <AlertCircle strokeWidth={2} className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          <ul className="divide-y divide-kopi-200/80 rounded-[16px] border border-kopi-200 bg-kertas px-4">
            {lines.map((line) => (
              <li key={line.key} className="py-4">
                <div className="flex items-start gap-3">
                  <MenuThumb item={line.item} className="size-[64px]" width={64} height={64} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug text-kopi-950">{line.name}</p>
                    {line.choice && <p className="text-xs font-medium text-kopi-600">{line.choice}</p>}
                    <p className="mt-1 text-[14px] font-semibold tabular-nums text-terakota-700">
                      {formatRupiah(line.price * line.qty)}
                    </p>
                  </div>
                  <Stepper value={line.qty} onChange={(next) => setQty(line.key, next)} />
                </div>

                {/* Catatan per item tetap terbawa dari detail hidangan & bisa disunting */}
                <div className="mt-2.5">
                  <label htmlFor={`note-${line.key}`} className="sr-only">
                    Catatan untuk {line.name}
                  </label>
                  <input
                    id={`note-${line.key}`}
                    type="text"
                    value={line.note}
                    onChange={(e) => setItemNote(line.key, e.target.value)}
                    placeholder="Catatan hidangan ini (mis. gula dipisah)"
                    className="w-full rounded-[10px] border border-kopi-200/80 bg-kopi-50/70 px-3 min-h-[40px] text-xs text-kopi-900 placeholder:text-kopi-500 focus:border-terakota-700 focus:bg-kertas"
                  />
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/menu"
            className={cx(btnSecondary, 'mt-3 w-full border-dashed text-[13px]')}
          >
            <Plus strokeWidth={1.75} className="size-4 text-terakota-700" aria-hidden="true" />
            Tambah menu lain
          </Link>

          <div className="mt-5">
            <label htmlFor="order-note" className="block text-[14px] font-semibold text-kopi-900">
              Catatan untuk dapur / kasir (opsional)
            </label>
            <input
              id="order-note"
              type="text"
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="Contoh: kami rombongan 12 orang, minta diantar bersamaan"
              className={cx(input, 'mt-2')}
            />
          </div>

          {/* Bilah bawah lanjut ke halaman Pilih Pembayaran */}
          <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-kopi-200 bg-kertas/95 px-4 py-3.5 backdrop-blur-sm">
            {nameError && (
              <p className="mb-2 flex items-center gap-1.5 rounded-[10px] bg-[#fdf1f0] px-3 py-1.5 text-xs font-semibold text-[#b42318]">
                <AlertCircle strokeWidth={2} className="size-3.5 shrink-0" aria-hidden="true" />
                Isi nama pemesan dulu untuk lanjut.
              </p>
            )}
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-xs font-medium text-kopi-600">Total ({count} item)</span>
              <span className="text-[18px] font-bold tabular-nums text-kopi-950">{formatRupiah(total)}</span>
            </div>
            <button type="submit" className={cx(btnPrimary, 'min-h-[52px] w-full')}>
              Pilih pembayaran
              <ArrowRight strokeWidth={1.75} className="size-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

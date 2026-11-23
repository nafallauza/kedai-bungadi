import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, QrCode, ShieldCheck, WifiOff } from 'lucide-react';
import { createOrder } from '../../lib/api';
import { useMenu, useOnline } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { formatRupiah } from '../../utils/format';
import { PAYMENT_METHODS, cartLines, lineName } from '../../utils/order';
import { Loading, btnPrimary, cx } from '../../components/ui';

const OPTIONS = [
  {
    ...PAYMENT_METHODS.kasir,
    icon: Banknote,
    note: 'Paling praktis — pesanan langsung masuk dapur, bayar di kasir sebelum pulang.',
  },
  {
    ...PAYMENT_METHODS.qris,
    icon: QrCode,
    note: 'Kode QRIS kedai tampil di layar berikutnya. Setelah transfer, kasir mengonfirmasi pembayaran.',
  },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const online = useOnline();
  const {
    table,
    cart,
    itemNotes,
    customerName,
    draftNote,
    clearCart,
    addMyOrder,
  } = useSession();
  const { data: menu, loading } = useMenu();

  const [method, setMethod] = useState('kasir');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const lines = useMemo(() => (menu ? cartLines(menu, cart, itemNotes) : []), [menu, cart, itemNotes]);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  if (loading) return <Loading text="Menyiapkan pembayaran…" />;
  if (lines.length === 0) return <Navigate to="/keranjang" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!online) {
      setError('Sinyal terputus. Pesanan belum terkirim — tunggu sinyal kembali lalu kirim ulang.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const order = await createOrder({
        tableCode: table.code,
        customerName: customerName.trim(),
        note: draftNote.trim(),
        paymentMethod: method,
        paymentStatus: 'belum_bayar',
        items: lines.map((l) => ({
          menuId: l.menuId,
          choiceId: l.choiceId,
          qty: l.qty,
          note: l.note,
        })),
      });
      addMyOrder(order.id);
      clearCart();
      navigate(`/pesanan/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesanan. Coba lagi sebentar.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh pb-36">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-kopi-200/80 bg-kertas/95 px-4 py-3 backdrop-blur-sm">
        <Link
          to="/keranjang"
          className="grid size-[44px] -ml-2 place-items-center rounded-full text-kopi-700 hover:bg-kopi-100"
          aria-label="Kembali ke keranjang"
        >
          <ArrowLeft strokeWidth={1.75} className="size-5" />
        </Link>
        <div className="text-center">
          <h1 className="font-display text-[24px] font-bold leading-tight text-kopi-950">Pilih Pembayaran</h1>
          <p className="text-xs font-medium text-kopi-600">{table?.name}</p>
        </div>
        <span className="w-[44px]" aria-hidden="true" />
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-5">
        <div className="mb-4 flex items-center justify-between rounded-[12px] bg-kertas-tua px-3.5 py-2.5 text-xs font-medium text-kopi-700">
          <span>Langkah 2 dari 2 · Metode bayar</span>
          <span className="font-semibold text-terakota-800">{customerName || table?.code}</span>
        </div>

        {/* Ringkasan pesanan ringkas */}
        <section className="rounded-[16px] border border-kopi-200 bg-kertas p-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-kopi-600">
                Pesanan {table?.name} · {count} item
              </p>
              {customerName && (
                <p className="mt-0.5 text-xs font-semibold text-kopi-900">Atas nama: {customerName}</p>
              )}
            </div>
            <p className="text-[20px] font-bold tabular-nums text-terakota-800">{formatRupiah(total)}</p>
          </div>

          <details className="mt-3 border-t border-kopi-100 pt-2.5">
            <summary className="inline-flex min-h-[36px] cursor-pointer items-center text-xs font-semibold text-kopi-700 hover:text-terakota-700">
              Lihat rincian {count} item
            </summary>
            <ul className="mt-2 space-y-1.5 text-xs text-kopi-700">
              {lines.map((l) => (
                <li key={l.key} className="flex justify-between gap-2">
                  <span>
                    {l.qty}× {lineName(l)}
                    {l.note ? ` (${l.note})` : ''}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-kopi-900">
                    {formatRupiah(l.price * l.qty)}
                  </span>
                </li>
              ))}
            </ul>
            {draftNote && (
              <p className="mt-2 rounded-[8px] bg-kopi-50 px-2.5 py-1.5 text-xs text-kopi-700">
                Catatan: {draftNote}
              </p>
            )}
          </details>
        </section>

        {/* 2 opsi pembayaran bersih dengan radio HTML native */}
        <fieldset className="mt-6 space-y-3">
          <legend className="mb-2 text-[15px] font-semibold text-kopi-950">Cara membayar</legend>

          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = method === opt.id;
            return (
              <label
                key={opt.id}
                className={cx(
                  'flex cursor-pointer items-start gap-3.5 rounded-[16px] border p-4 transition-colors',
                  active
                    ? 'border-terakota-700 bg-terakota-50/80 ring-1 ring-terakota-700/20'
                    : 'border-kopi-200 bg-kertas hover:border-kopi-300',
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.id}
                  checked={active}
                  onChange={() => setMethod(opt.id)}
                  className="mt-1 size-5 shrink-0 accent-[#7f3b25]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cx(
                        'grid size-8 shrink-0 place-items-center rounded-[10px]',
                        active ? 'bg-terakota-700 text-kertas' : 'bg-kopi-100 text-kopi-700',
                      )}
                    >
                      <Icon strokeWidth={1.75} className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] font-semibold text-kopi-950">{opt.label}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-kopi-700">{opt.note}</p>
                </div>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-5 flex items-start gap-2.5 rounded-[14px] border border-kopi-200 bg-kopi-50 px-3.5 py-3 text-xs leading-relaxed text-kopi-700">
          <ShieldCheck strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-terakota-700" aria-hidden="true" />
          <p>
            Pembayaran dicatat langsung pada layar kasir Wedang Uwuh Bu Ngadi. Tidak ada biaya tambahan aplikasi.
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-[14px] border border-[#f5c7c2] bg-[#fdf1f0] p-3.5 text-sm text-[#b42318]" role="alert">
            {!online && <WifiOff strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            <p>{error}</p>
          </div>
        )}

        {/* CTA bawah lapang (min-h 52px, padding lega) */}
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-kopi-200 bg-kertas/95 px-4 py-3.5 backdrop-blur-sm">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-medium text-kopi-600">
              {method === 'qris' ? 'Bayar lewat QRIS Kedai' : 'Bayar di Kasir'}
            </span>
            <span className="text-[17px] font-bold tabular-nums text-kopi-950">{formatRupiah(total)}</span>
          </div>
          <button type="submit" disabled={submitting || !online} className={cx(btnPrimary, 'min-h-[52px] w-full')}>
            {submitting
              ? 'Mengirim pesanan…'
              : method === 'qris'
                ? 'Kirim & tampilkan QRIS'
                : 'Kirim pesanan ke dapur'}
          </button>
        </div>
      </form>
    </div>
  );
}

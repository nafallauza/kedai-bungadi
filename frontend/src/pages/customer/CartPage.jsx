import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, Lock, Plus, QrCode, ShoppingBag, Trash2 } from 'lucide-react';
import { createOrder } from '../../lib/api';
import { useMenu, useOnline } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { site } from '../../data/site';
import { formatRupiah } from '../../utils/format';
import { PAYMENT_METHODS, cartLines, countItems, lineName } from '../../utils/order';
import { EmptyState, Loading, MenuThumb, Spinner, Stepper, btnPrimary, cx, input } from '../../components/ui';

export default function CartPage() {
  const navigate = useNavigate();
  const online = useOnline();
  const { table, cart, setQty, clearCart, customerName, setCustomerName, addMyOrder } = useSession();
  const { data: menu, loading } = useMenu();
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [paymentBank, setPaymentBank] = useState(site.payment.banks[0].id);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const lines = cartLines(menu ?? [], cart);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const totalQty = countItems(lines);
  const hasSoldOut = lines.some((l) => !l.item.available);

  const selectedBankInfo = site.payment.banks.find((b) => b.id === paymentBank) ?? site.payment.banks[0];

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const order = await createOrder({
        tableCode: table.code,
        orderType: 'meja',
        customerName,
        note,
        paymentMethod,
        paymentBank: paymentMethod === 'bank' ? paymentBank : null,
        paymentStatus: 'belum_bayar',
        items: lines.map((l) => ({ menuId: l.menuId, choiceId: l.choiceId, qty: l.qty })),
      });
      addMyOrder(order.id);
      clearCart();
      navigate(`/pesanan/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#fafafa] pb-[100px]">
      {/* Kepala layar persis sesuai Figma node 17:73 */}
      <header className="sticky top-0 z-20 flex h-[56px] items-center gap-[4px] border-b border-[#e4e4e7] bg-white px-[8px]">
        <Link
          to="/menu"
          className="grid size-[40px] place-items-center rounded-[12px] text-[#18181b] hover:bg-[#f4f4f5]"
          aria-label="Kembali ke menu"
        >
          <ChevronLeft strokeWidth={1.75} className="size-[20px]" />
        </Link>
        <h1 className="flex-1 text-center text-[16px] font-semibold leading-[24px] text-[#18181b]">Keranjang</h1>
        <div className="size-[40px] shrink-0" />
      </header>

      {loading && <Loading />}
      {menu && lines.length === 0 && (
        <EmptyState icon={ShoppingBag} title="Keranjang masih kosong">
          <Link to="/menu" className={cx(btnPrimary, 'mt-5')}>
            Lihat menu
          </Link>
        </EmptyState>
      )}

      {lines.length > 0 && (
        <form onSubmit={submit} className="flex flex-col gap-[16px] px-[20px] pt-[12px]">
          {/* Indikator Meja sesuai Figma node 52:1475 */}
          <div className="flex items-center gap-[6px]">
            <QrCode strokeWidth={1.5} className="size-[16px] text-[#71717a]" />
            <span className="text-[14px] font-normal leading-[20px] text-[#71717a]">
              Pesanan untuk {table.name.split(',')[0]}
            </span>
          </div>

          {/* Daftar pesanan sesuai Figma node 52:1478 */}
          <div className="flex flex-col rounded-[16px] border border-[#e4e4e7] bg-white px-[16px] pt-[4px] pb-[12px]">
            <ul>
              {lines.map((l) => (
                <li
                  key={l.key}
                  className="flex items-center gap-[12px] border-b border-[#e4e4e7] py-[12px]"
                >
                  <MenuThumb item={l.item} className="size-[56px] rounded-[12px]" />
                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <p className="truncate text-[14px] font-semibold leading-[20px] text-[#18181b]">{l.name}</p>
                    <p className="text-[12px] font-medium leading-[16px] text-[#71717a]">
                      {l.choice || 'Tanpa catatan'}
                    </p>
                    {l.item.available ? (
                      <p className="text-[14px] font-semibold leading-[20px] tabular-nums text-[#18181b]">
                        {formatRupiah(l.price * l.qty)}
                      </p>
                    ) : (
                      <p className="text-[12px] font-medium text-[#b42318]">Sedang habis, hapus dulu</p>
                    )}
                  </div>
                  {l.item.available ? (
                    <Stepper value={l.qty} onChange={(v) => setQty(l.key, v)} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQty(l.key, 0)}
                      className="grid size-[36px] place-items-center rounded-[10px] text-[#b42318] hover:bg-[#fef3f2]"
                      aria-label={`Hapus ${lineName(l)}`}
                    >
                      <Trash2 strokeWidth={1.5} className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <Link
              to="/menu"
              className="flex items-center gap-[6px] pt-[12px] text-[14px] font-semibold leading-[20px] text-[#7a4b2a]"
            >
              <Plus strokeWidth={1.75} className="size-[16px]" /> Tambah menu lain
            </Link>
          </div>

          {/* Nama pemesan & catatan sesuai Figma node 52:1503 */}
          <div className="flex flex-col gap-[8px]">
            <label htmlFor="name" className="text-[14px] font-semibold leading-[20px] text-[#18181b]">
              Nama pemesan
            </label>
            <input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              maxLength={40}
              placeholder="Contoh: Rina"
              className={input}
            />
            <p className="text-[12px] font-normal leading-[16px] text-[#71717a]">
              Membantu pelayan saat satu meja pesan dari beberapa HP.
            </p>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label htmlFor="note" className="text-[14px] font-semibold leading-[20px] text-[#18181b]">
              Catatan tambahan <span className="font-normal text-[#71717a]">(opsional)</span>
            </label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
              placeholder="Contoh: wedangnya tidak terlalu manis"
              className={input}
            />
          </div>

          {/* Pilih Metode Pembayaran sesuai Figma node 58:1526 (QRIS, DANA, Bank, Kasir) */}
          <div className="flex flex-col gap-[12px] pt-[4px]">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-[#18181b]">Metode Pembayaran</p>
              <span className="text-[12px] text-[#71717a]">{totalQty} item · {formatRupiah(total)}</span>
            </div>

            {/* 1. Opsi Barcode / QRIS (node 58:1541) */}
            <div
              onClick={() => setPaymentMethod('qris')}
              role="radio"
              aria-checked={paymentMethod === 'qris'}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPaymentMethod('qris')}
              className={cx(
                'flex cursor-pointer flex-col gap-[8px] rounded-[12px] p-[14px] transition-all',
                paymentMethod === 'qris'
                  ? 'border-[1.5px] border-[#7a4b2a] bg-[#f6eee7]'
                  : 'border border-[#e4e4e7] bg-white',
              )}
            >
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] border border-[#e4e4e7] bg-white">
                  <span className="text-[11px] font-bold text-[#cc1a1a]">QRIS</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <p className="text-[14px] font-bold text-[#18181b]">QRIS (Semua Bank & E-Wallet)</p>
                  <p className="text-[11px] text-[#71717a]">BCA, Mandiri, BRI, GoPay, OVO, ShopeePay</p>
                </div>
                <div
                  className={cx(
                    'flex size-[20px] shrink-0 items-center justify-center rounded-full',
                    paymentMethod === 'qris' ? 'bg-[#7a4b2a]' : 'border border-[#e4e4e7] bg-white',
                  )}
                >
                  {paymentMethod === 'qris' && <div className="size-[8px] rounded-full bg-white" />}
                </div>
              </div>
              <div className="inline-flex w-fit items-center rounded-[6px] bg-[#15803d] px-[8px] py-[4px]">
                <span className="text-[11px] font-semibold text-white">✓ Terverifikasi Otomatis Tanpa Antre</span>
              </div>
            </div>

            {/* 2. Opsi DANA (node 58:1552) */}
            <div
              onClick={() => setPaymentMethod('dana')}
              role="radio"
              aria-checked={paymentMethod === 'dana'}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPaymentMethod('dana')}
              className={cx(
                'flex cursor-pointer flex-col gap-[8px] rounded-[12px] p-[14px] transition-all',
                paymentMethod === 'dana'
                  ? 'border-[1.5px] border-[#7a4b2a] bg-[#f6eee7]'
                  : 'border border-[#e4e4e7] bg-white',
              )}
            >
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] bg-[#1071e2]">
                  <span className="text-[11px] font-bold text-white">DANA</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <p className="text-[14px] font-bold text-[#18181b]">DANA E-Wallet</p>
                  <p className="text-[11px] text-[#71717a]">Bayar instan via aplikasi atau nomor HP DANA</p>
                </div>
                <div
                  className={cx(
                    'flex size-[20px] shrink-0 items-center justify-center rounded-full',
                    paymentMethod === 'dana' ? 'bg-[#7a4b2a]' : 'border border-[#e4e4e7] bg-white',
                  )}
                >
                  {paymentMethod === 'dana' && <div className="size-[8px] rounded-full bg-white" />}
                </div>
              </div>
            </div>

            {/* 3. Opsi Transfer Bank */}
            <div
              onClick={() => setPaymentMethod('bank')}
              role="radio"
              aria-checked={paymentMethod === 'bank'}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPaymentMethod('bank')}
              className={cx(
                'flex cursor-pointer flex-col gap-[8px] rounded-[12px] p-[14px] transition-all',
                paymentMethod === 'bank'
                  ? 'border-[1.5px] border-[#7a4b2a] bg-[#f6eee7]'
                  : 'border border-[#e4e4e7] bg-white',
              )}
            >
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] bg-[#7a4b2a]">
                  <span className="text-[11px] font-bold text-white">BANK</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <p className="text-[14px] font-bold text-[#18181b]">Transfer Bank</p>
                  <p className="text-[11px] text-[#71717a]">Transfer ke rekening BCA, BRI, Mandiri, atau BPD DIY</p>
                </div>
                <div
                  className={cx(
                    'flex size-[20px] shrink-0 items-center justify-center rounded-full',
                    paymentMethod === 'bank' ? 'bg-[#7a4b2a]' : 'border border-[#e4e4e7] bg-white',
                  )}
                >
                  {paymentMethod === 'bank' && <div className="size-[8px] rounded-full bg-white" />}
                </div>
              </div>

              {paymentMethod === 'bank' && (
                <div
                  className="mt-[4px] flex flex-col gap-[8px] rounded-[10px] border border-[#e4e4e7] bg-white p-[10px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-4 gap-[6px]">
                    {site.payment.banks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setPaymentBank(b.id)}
                        className={cx(
                          'flex h-[32px] items-center justify-center gap-1 rounded-[8px] border text-[11px] font-semibold transition-colors',
                          paymentBank === b.id
                            ? 'border-[#7a4b2a] bg-[#7a4b2a] text-white'
                            : 'border-[#e4e4e7] bg-[#fafafa] text-[#18181b]',
                        )}
                      >
                        {paymentBank === b.id && <Check strokeWidth={2} className="size-3" />}
                        {b.id}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#71717a]">{selectedBankInfo.name}</span>
                    <span className="font-mono font-semibold text-[#18181b]">{selectedBankInfo.account}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Opsi Bayar di Kasir (node 58:1559) */}
            <div
              onClick={() => setPaymentMethod('kasir')}
              role="radio"
              aria-checked={paymentMethod === 'kasir'}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPaymentMethod('kasir')}
              className={cx(
                'flex cursor-pointer items-center gap-[12px] rounded-[12px] p-[14px] transition-all',
                paymentMethod === 'kasir'
                  ? 'border-[1.5px] border-[#7a4b2a] bg-[#f6eee7]'
                  : 'border border-[#e4e4e7] bg-white',
              )}
            >
              <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] border border-[#e4e4e7] bg-[#f4f4f5]">
                <span className="text-[10px] font-bold text-[#18181b]">KASIR</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <p className="text-[14px] font-bold text-[#18181b]">Bayar di Kasir (Tunai / Debit)</p>
                <p className="text-[11px] text-[#71717a]">Bayar langsung ke kasir sebelum pulang</p>
              </div>
              <div
                className={cx(
                  'flex size-[20px] shrink-0 items-center justify-center rounded-full',
                  paymentMethod === 'kasir' ? 'bg-[#7a4b2a]' : 'border border-[#e4e4e7] bg-white',
                )}
              >
                {paymentMethod === 'kasir' && <div className="size-[8px] rounded-full bg-white" />}
              </div>
            </div>

            {/* Info Box sesuai Figma node 58:1566 */}
            <div className="flex items-center gap-[8px] rounded-[10px] border border-[#e4e4e7] bg-white px-[12px] py-[10px]">
              <Lock strokeWidth={1.5} className="size-[16px] shrink-0 text-[#7a4b2a]" />
              <p className="text-[12px] leading-[16px] text-[#71717a]">
                Pembayaran Anda terenkripsi & tercatat otomatis ke sistem dapur.
              </p>
            </div>
          </div>

          {error && (
            <p className="rounded-[12px] bg-[#fef3f2] p-3 text-[13px] text-[#b42318]" role="alert">
              {error}
            </p>
          )}
          {!online && <p className="text-center text-[13px] text-[#71717a]">Menunggu koneksi kembali…</p>}

          {/* Bar Bawah sesuai Figma node 58:1568 */}
          <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-[#e4e4e7] bg-white px-[20px] py-[14px]">
            <button
              type="submit"
              disabled={sending || !online || hasSoldOut}
              className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#7a4b2a] px-[20px] text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-[#5e3920] disabled:opacity-50"
            >
              {sending && <Spinner className="size-4" />}
              {sending
                ? 'Mengirim pesanan…'
                : `Bayar dengan ${PAYMENT_METHODS[paymentMethod]?.shortLabel} · ${formatRupiah(total)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

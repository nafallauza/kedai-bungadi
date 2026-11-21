import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Check, Lock, Plus, QrCode, ShoppingBag, Smartphone, Store, Trash2, Wallet } from 'lucide-react';
import { createOrder } from '../../lib/api';
import { useMenu, useOnline } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { site } from '../../data/site';
import { formatRupiah } from '../../utils/format';
import { PAYMENT_METHODS, cartLines, countItems, lineName } from '../../utils/order';
import { EmptyState, Loading, MenuThumb, Spinner, Stepper, btnPrimary, card, cx, input } from '../../components/ui';

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

  const methodCards = [
    {
      id: 'qris',
      title: 'Barcode / QRIS (Semua Bank & E-Wallet)',
      subtitle: 'BCA, Mandiri, BRI, GoPay, OVO, ShopeePay',
      tag: '✓ Terverifikasi Otomatis Tanpa Antre',
      badge: (
        <div className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 shadow-2xs">
          <QrCode strokeWidth={1.75} className="size-4" />
          <span className="mt-0.5 text-[10px] font-extrabold tracking-tight">QRIS</span>
        </div>
      ),
    },
    {
      id: 'dana',
      title: 'DANA E-Wallet',
      subtitle: 'Bayar instan via aplikasi, QR DANA, atau nomor HP DANA',
      tag: '✓ Langsung Terhubung ke Akun DANA Kedai',
      badge: (
        <div className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#1071e2] text-white shadow-2xs">
          <Smartphone strokeWidth={1.75} className="size-4" />
          <span className="mt-0.5 text-[10px] font-extrabold tracking-tight">DANA</span>
        </div>
      ),
    },
    {
      id: 'bank',
      title: 'Transfer Bank (Rekening Resmi Kedai)',
      subtitle: 'Pilih BCA, BRI, Mandiri, atau BPD DIY dengan salin otomatis',
      tag: '✓ Tersedia 4 Rekening Bank Lokal & Nasional',
      badge: (
        <div className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-kopi-900 text-[#e8c98a] shadow-2xs">
          <Building2 strokeWidth={1.75} className="size-4" />
          <span className="mt-0.5 text-[10px] font-extrabold tracking-tight">BANK</span>
        </div>
      ),
    },
    {
      id: 'kasir',
      title: 'Bayar di Kasir (Tunai / Debit)',
      subtitle: 'Bayar langsung ke kasir sebelum pulang dengan kode pesanan',
      badge: (
        <div className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-50 text-amber-900 shadow-2xs">
          <Wallet strokeWidth={1.75} className="size-4" />
          <span className="mt-0.5 text-[10px] font-extrabold tracking-tight">KASIR</span>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-12">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xs">
        <Link to="/menu" className="grid size-10 place-items-center rounded-xl hover:bg-kopi-100" aria-label="Kembali ke menu">
          <ArrowLeft strokeWidth={1.5} className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold">Keranjang & Pilih Pembayaran</h1>
          <p className="text-xs text-kopi-500">
            {table.name} · {totalQty} item
          </p>
        </div>
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
        <form onSubmit={submit} className="space-y-4 px-4 pt-4">
          {/* Ringkasan Tagihan gaya Figma node 58:1535 */}
          <div className="rounded-2xl border border-kopi-900/10 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-kopi-500">
                Pesanan {table.name} ({totalQty} item)
              </span>
              <span className="text-lg font-bold tabular-nums text-terakota-700">{formatRupiah(total)}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-kopi-600">
              {lines.map((l) => `${l.qty}x ${lineName(l)}`).join(', ')}
            </p>
          </div>

          {/* Daftar item keranjang */}
          <div className={cx(card, 'px-4')}>
            <ul className="divide-y divide-black/[0.06]">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3 py-3">
                  <MenuThumb item={l.item} className="size-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{lineName(l)}</p>
                    {l.item.available ? (
                      <p className="text-sm tabular-nums text-kopi-500">{formatRupiah(l.price * l.qty)}</p>
                    ) : (
                      <p className="text-xs font-medium text-red-600">Sedang habis, hapus dulu</p>
                    )}
                  </div>
                  {l.item.available ? (
                    <Stepper value={l.qty} onChange={(v) => setQty(l.key, v)} size="sm" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQty(l.key, 0)}
                      className="grid size-9 place-items-center rounded-xl text-red-600 hover:bg-red-50"
                      aria-label={`Hapus ${lineName(l)}`}
                    >
                      <Trash2 strokeWidth={1.5} className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <Link to="/menu" className="flex items-center gap-1.5 border-t border-black/[0.06] py-3 text-sm font-semibold text-terakota-700">
              <Plus strokeWidth={1.5} className="size-4" /> Tambah menu lain
            </Link>
          </div>

          {/* Data pemesan & catatan */}
          <div className={cx(card, 'space-y-3.5 p-4')}>
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Nama pemesan <span className="font-normal text-kopi-400">(opsional)</span>
              </label>
              <input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                maxLength={40}
                placeholder="Contoh: Rina / Rombongan SMA 1"
                className={cx(input, 'mt-1.5')}
              />
              <p className="mt-1 text-xs text-kopi-500">Membantu staf saat satu meja memesan dari beberapa HP.</p>
            </div>
            <div>
              <label htmlFor="note" className="text-sm font-medium">
                Catatan dapur <span className="font-normal text-kopi-400">(opsional)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={150}
                rows={2}
                placeholder="Contoh: gula batu dipisah, es sedikit, sambal pisah"
                className={cx(input, 'mt-1.5 h-auto py-2.5')}
              />
            </div>
          </div>

          {/* Pilih Metode Pembayaran sesuai Figma node 58:1526 + 3 metode digital (Barcode/QRIS, DANA, Bank) + Tunai Kasir */}
          <section className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-[15px] font-semibold text-kopi-950">Metode Pembayaran</h2>
              <span className="text-xs font-medium text-kopi-500">Pilih salah satu</span>
            </div>

            <div className="space-y-2.5" role="radiogroup" aria-label="Metode Pembayaran">
              {methodCards.map((m) => {
                const active = paymentMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    role="radio"
                    aria-checked={active}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPaymentMethod(m.id)}
                    className={cx(
                      'cursor-pointer rounded-2xl border p-3.5 transition-all',
                      active
                        ? 'border-[1.5px] border-terakota-700 bg-[#f6eee7] shadow-soft'
                        : 'border-kopi-900/10 bg-white hover:border-kopi-900/25',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {m.badge}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-kopi-950">{m.title}</p>
                        <p className="mt-0.5 text-xs text-kopi-600">{m.subtitle}</p>
                      </div>
                      <span
                        className={cx(
                          'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                          active ? 'border-terakota-700 bg-terakota-700 text-white' : 'border-kopi-300 bg-white',
                        )}
                      >
                        {active && <span className="size-2 rounded-full bg-white" />}
                      </span>
                    </div>

                    {active && m.tag && (
                      <div className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {m.tag}
                      </div>
                    )}

                    {/* Sub-panel interaktif ketika pilih Transfer Bank */}
                    {active && m.id === 'bank' && (
                      <div
                        className="mt-3 space-y-2.5 rounded-xl border border-kopi-900/10 bg-white p-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-xs font-semibold text-kopi-700">Pilih Rekening Bank Tujuan:</p>
                        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                          {site.payment.banks.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setPaymentBank(b.id)}
                              className={cx(
                                'flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-bold transition-colors',
                                paymentBank === b.id
                                  ? 'border-terakota-700 bg-terakota-700 text-white'
                                  : 'border-kopi-900/10 bg-kopi-50/60 text-kopi-800 hover:bg-kopi-100',
                              )}
                            >
                              {paymentBank === b.id && <Check strokeWidth={2} className="size-3.5" />}
                              {b.id}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-kopi-50 px-3 py-2 text-xs">
                          <div>
                            <span className="font-semibold text-kopi-900">{selectedBankInfo.name}</span>
                            <span className="block text-[11px] text-kopi-500">a.n. {selectedBankInfo.holder}</span>
                          </div>
                          <span className="font-mono text-sm font-bold text-terakota-800">{selectedBankInfo.account}</span>
                        </div>
                      </div>
                    )}

                    {/* Sub-panel interaktif ketika pilih DANA */}
                    {active && m.id === 'dana' && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-xs">
                        <div>
                          <span className="font-semibold text-kopi-900">Akun DANA Kedai Bungadi</span>
                          <span className="block text-[11px] text-kopi-500">a.n. {site.payment.dana.holder}</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-[#1071e2]">{site.payment.dana.number}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Info Enkripsi & Pesan Bungkus di Kasir */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-kopi-900/10 bg-white px-3.5 py-2.5 text-xs text-kopi-600">
              <Lock strokeWidth={1.5} className="size-4 shrink-0 text-terakota-700" />
              <span>Pembayaran Anda terenkripsi & pesanan langsung tercatat otomatis ke layar kasir dan dapur.</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-900">
              <Store strokeWidth={1.5} className="size-4 shrink-0 text-amber-700" />
              <span>
                <b>Mau pesan bungkus (takeaway)?</b> Pemesanan bungkus dilayani langsung melalui staf di meja Kasir.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-sm font-medium text-kopi-600">Total Tagihan</span>
            <span className="text-xl font-bold tabular-nums text-kopi-950">{formatRupiah(total)}</span>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {!online && <p className="text-center text-sm text-kopi-500">Menunggu koneksi kembali untuk mengirim pesanan…</p>}

          <button type="submit" disabled={sending || !online || hasSoldOut} className={cx(btnPrimary, 'h-13 w-full text-base shadow-soft')}>
            {sending && <Spinner className="size-4" />}
            {sending
              ? 'Memproses Pesanan…'
              : paymentMethod === 'kasir'
                ? `Kirim Pesanan & Bayar di Kasir · ${formatRupiah(total)}`
                : `Lanjut Pembayaran ${PAYMENT_METHODS[paymentMethod]?.shortLabel} · ${formatRupiah(total)}`}
          </button>
        </form>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  QrCode,
  RefreshCw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { setPaymentStatus } from '../../lib/api';
import { useOrder, useOrders } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { site } from '../../data/site';
import { formatRupiah, formatTime } from '../../utils/format';
import {
  ORDER_STATUS,
  STATUS_FLOW,
  lineName,
  paymentMethodLabel,
} from '../../utils/order';
import {
  EmptyState,
  Loading,
  PaymentBadge,
  StatusBadge,
  btnPrimary,
  btnSecondary,
  cx,
} from '../../components/ui';

const QRIS_WINDOW_MS = 15 * 60 * 1000;

function QrisPaymentCard({ order }) {
  const deadline = new Date(order.createdAt).getTime() + QRIS_WINDOW_MS;
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadline - Date.now()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  const expired = remainingMs <= 0;

  const qrisPayload = `00020101021226590014ID.CO.QRIS.WWW0215${site.payment.qris.nmid}52045812530336054${String(order.total).length.toString().padStart(2, '0')}${order.total}5802ID5921WEDANG UWUH BU NGADI6011GUNUNGKIDUL62120508${order.code}`;

  const requestVerification = async () => {
    setBusy(true);
    setError('');
    try {
      await setPaymentStatus(order.id, 'menunggu_verifikasi');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const switchToCashier = async () => {
    setBusy(true);
    setError('');
    try {
      await setPaymentStatus(order.id, 'belum_bayar', { paymentMethod: 'kasir' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[18px] border border-terakota-200 bg-kertas p-5 shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-kopi-100 pb-3">
        <div>
          <p className="text-xs font-semibold text-terakota-700">{site.payment.qris.standard}</p>
          <p className="font-display text-[22px] font-bold leading-tight text-kopi-950">
            {site.payment.qris.merchantName}
          </p>
        </div>
        <span
          className={cx(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tabular-nums',
            expired ? 'bg-[#fdf1f0] text-[#b42318]' : 'bg-kertas-tua text-kopi-800',
          )}
        >
          <Clock strokeWidth={1.75} className="size-3.5" aria-hidden="true" />
          {expired ? 'Waktu habis' : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
        </span>
      </div>

      {!expired ? (
        <>
          <div className="mt-4 flex flex-col items-center rounded-[14px] border border-kopi-200 bg-white p-4">
            <QRCodeSVG value={qrisPayload} size={184} fgColor="#15110d" level="M" />
            <p className="mt-2.5 text-xs text-kopi-600">NMID {site.payment.qris.nmid}</p>
          </div>

          <div className="mt-4 flex items-baseline justify-between rounded-[12px] bg-kopi-50 px-3.5 py-2.5">
            <span className="text-xs font-medium text-kopi-600">Total transfer</span>
            <span className="text-[18px] font-bold tabular-nums text-terakota-800">
              {formatRupiah(order.total)}
            </span>
          </div>

          <ol className="mt-3.5 space-y-1.5 text-xs leading-relaxed text-kopi-700">
            <li>1. Buka mobile banking atau e-wallet, lalu scan kode QRIS di atas.</li>
            <li>2. Pastikan nama penerima <strong>{site.payment.qris.merchantName}</strong> dan nominal pas.</li>
            <li>3. Setelah selesai, ketuk tombol di bawah agar kasir segera mengonfirmasi.</li>
          </ol>

          {error && (
            <p className="mt-3 text-xs font-medium text-[#b42318]" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 space-y-2">
            <button type="button" disabled={busy} onClick={requestVerification} className={cx(btnPrimary, 'w-full')}>
              <QrCode strokeWidth={1.75} className="size-4" aria-hidden="true" />
              {busy ? 'Mengirim konfirmasi…' : 'Saya sudah transfer, konfirmasi ke kasir'}
            </button>
            <button type="button" disabled={busy} onClick={switchToCashier} className={cx(btnSecondary, 'w-full text-xs')}>
              Ganti ke Bayar di Kasir saja
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-kopi-700">
            Batas waktu QRIS meja telah berakhir. Pesananmu tetap tercatat — silakan bayar langsung di meja kasir dengan menyebut kode <strong>{order.code}</strong>.
          </p>
          <button type="button" disabled={busy} onClick={switchToCashier} className={cx(btnPrimary, 'w-full')}>
            Lanjutkan dengan Bayar di Kasir
          </button>
        </div>
      )}
    </section>
  );
}

// Halaman status pesanan pelanggan (/pesanan/:id) — ter-update otomatis saat kasir ubah status
export function OrderStatusPage() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useOrder(id);

  if (loading) return <Loading text="Memuat status pesanan…" />;

  if (error || !order) {
    return (
      <div className="px-4 py-10">
        <EmptyState icon={ClipboardList} title="Pesanan tidak ditemukan">
          <p>{error || 'Pesanan ini mungkin sudah direset atau tautannya tidak valid.'}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={reload} className={btnSecondary}>
              <RefreshCw strokeWidth={1.75} className="size-4" aria-hidden="true" /> Muat ulang
            </button>
            <Link to="/menu" className={btnPrimary}>
              Kembali ke menu
            </Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const statusInfo = ORDER_STATUS[order.status] ?? ORDER_STATUS.diterima;

  return (
    <div className="min-h-dvh pb-10">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-kopi-200/80 bg-kertas/95 px-4 py-3 backdrop-blur-sm">
        <Link
          to="/pesanan"
          className="grid size-[44px] -ml-2 place-items-center rounded-full text-kopi-700 hover:bg-kopi-100"
          aria-label="Ke daftar pesanan saya"
        >
          <ArrowLeft strokeWidth={1.75} className="size-5" />
        </Link>
        <h1 className="font-display text-[24px] font-bold leading-tight text-kopi-950">Status Pesanan</h1>
        <span className="w-[44px]" aria-hidden="true" />
      </header>

      <div className="space-y-4 px-4 pt-5">
        {/* Ringkasan kode & status live */}
        <section className="rounded-[18px] border border-kopi-200 bg-kertas p-5 shadow-soft" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[28px] font-bold leading-tight text-kopi-950">
                Pesanan {order.code}
              </p>
              <p className="mt-1 text-xs text-kopi-600">
                {order.tableName}
                {order.customerName ? ` · ${order.customerName}` : ''} · {formatTime(order.createdAt)}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-kopi-700">{statusInfo.customerText}</p>

          {/* Jejak status langkah demi langkah */}
          {order.status !== 'dibatalkan' && (
            <ol className="mt-5 space-y-3 border-t border-kopi-100 pt-4">
              {STATUS_FLOW.map((step, i) => {
                const done = i < currentIdx || order.status === 'selesai';
                const current = i === currentIdx && order.status !== 'selesai';
                const hist = order.statusHistory?.find((h) => h.status === step);
                return (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={cx(
                        'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold',
                        done
                          ? 'border-terakota-700 bg-terakota-700 text-kertas'
                          : current
                            ? 'border-terakota-700 bg-terakota-50 text-terakota-800'
                            : 'border-kopi-200 bg-kopi-50 text-kopi-500',
                      )}
                    >
                      {done ? <Check strokeWidth={2.5} className="size-3.5" aria-hidden="true" /> : i + 1}
                    </span>
                    <div className="flex flex-1 items-baseline justify-between gap-2">
                      <span
                        className={cx(
                          'text-sm',
                          done || current ? 'font-semibold text-kopi-950' : 'text-kopi-500',
                        )}
                      >
                        {ORDER_STATUS[step].label}
                      </span>
                      {hist && (
                        <span className="text-xs tabular-nums text-kopi-600">{formatTime(hist.at)}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Status pembayaran jujur */}
        {order.status !== 'dibatalkan' &&
          order.paymentMethod === 'qris' &&
          order.paymentStatus === 'belum_bayar' && <QrisPaymentCard order={order} />}

        {order.status !== 'dibatalkan' && order.paymentStatus === 'menunggu_verifikasi' && (
          <section className="rounded-[16px] border border-[#f2d6b0] bg-[#fdf4e7] p-4 text-sm text-[#7c3c09]">
            <p className="font-semibold">Menunggu konfirmasi kasir</p>
            <p className="mt-1 text-xs leading-relaxed">
              Bukti transfer QRIS sedang dicek kasir. Pesananmu tetap langsung diproses di dapur — tidak perlu memuat ulang halaman.
            </p>
          </section>
        )}

        {order.status !== 'dibatalkan' && order.paymentStatus === 'lunas' && (
          <section className="flex items-start gap-3 rounded-[16px] border border-[#c2e4cc] bg-[#edf7f0] p-4 text-[#166534]">
            <CheckCircle2 strokeWidth={1.75} className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Pembayaran lunas dikonfirmasi kasir</p>
              <p className="mt-0.5 text-xs">
                Metode: {paymentMethodLabel(order)} · Terima kasih telah mampir ke Wedang Uwuh Bu Ngadi.
              </p>
            </div>
          </section>
        )}

        {/* Rincian hidangan */}
        <section className="rounded-[18px] border border-kopi-200 bg-kertas p-5">
          <h2 className="text-sm font-semibold text-kopi-950">Rincian pesanan</h2>
          <ul className="mt-3 divide-y divide-kopi-100 text-sm">
            {order.items.map((it, idx) => (
              <li key={`${it.menuId}-${it.choiceId}-${idx}`} className="py-2.5">
                <div className="flex justify-between gap-2">
                  <span className="text-kopi-800">
                    <strong className="font-semibold text-kopi-950">{it.qty}×</strong> {lineName(it)}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-kopi-900">
                    {formatRupiah(it.price * it.qty)}
                  </span>
                </div>
                {it.note && <p className="mt-0.5 text-xs text-terakota-700">Catatan: {it.note}</p>}
              </li>
            ))}
          </ul>

          {order.note && (
            <p className="mt-3 rounded-[10px] bg-kopi-50 px-3 py-2 text-xs text-kopi-700">
              Catatan dapur: {order.note}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-kopi-200 pt-3.5">
            <span className="text-sm font-semibold text-kopi-900">Total</span>
            <span className="text-[18px] font-bold tabular-nums text-kopi-950">
              {formatRupiah(order.total)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-kopi-50 px-3 py-2.5 text-xs">
            <PaymentBadge status={order.paymentStatus} />
            <span className="font-medium text-kopi-700">
              {paymentMethodLabel(order)}
              {order.paymentMethod === 'kasir' && order.paymentStatus === 'belum_bayar'
                ? ' · Bayar sebelum pulang'
                : ''}
            </span>
          </div>
        </section>

        <Link to="/menu" className={cx(btnSecondary, 'w-full')}>
          Pesan menu lain
        </Link>
      </div>
    </div>
  );
}

// Daftar pesanan dari perangkat pelanggan ini (/pesanan)
export function MyOrdersPage() {
  const { myOrderIds, table } = useSession();
  const { data: orders, loading } = useOrders();

  const mine = (orders ?? [])
    .filter((o) => myOrderIds.includes(o.id) || (table && o.tableCode === table.code))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-dvh pb-10">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-kopi-200/80 bg-kertas/95 px-4 py-3 backdrop-blur-sm">
        <Link
          to="/menu"
          className="grid size-[44px] -ml-2 place-items-center rounded-full text-kopi-700 hover:bg-kopi-100"
          aria-label="Kembali ke menu"
        >
          <ArrowLeft strokeWidth={1.75} className="size-5" />
        </Link>
        <h1 className="font-display text-[24px] font-bold leading-tight text-kopi-950">Pesanan Saya</h1>
        <span className="w-[44px]" aria-hidden="true" />
      </header>

      {loading ? (
        <Loading text="Memuat daftar pesanan…" />
      ) : mine.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Belum ada pesanan">
          <p>Pesanan yang kamu kirim dari meja ini akan tampil di sini dan ter-update otomatis.</p>
          <Link to="/menu" className={cx(btnPrimary, 'mt-5')}>
            Lihat daftar menu
          </Link>
        </EmptyState>
      ) : (
        <ul className="space-y-3 px-4 pt-5">
          {mine.map((o) => (
            <li key={o.id}>
              <Link
                to={`/pesanan/${o.id}`}
                className="block rounded-[16px] border border-kopi-200 bg-kertas p-4 shadow-soft transition-colors hover:border-terakota-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-semibold text-kopi-950">
                      Pesanan {o.code} · {o.tableName}
                    </p>
                    <p className="mt-0.5 text-xs text-kopi-600">
                      {o.customerName || 'Pelanggan'} · {formatTime(o.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-kopi-100 pt-2.5 text-sm">
                  <PaymentBadge status={o.paymentStatus} />
                  <span className="font-bold tabular-nums text-kopi-950">{formatRupiah(o.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

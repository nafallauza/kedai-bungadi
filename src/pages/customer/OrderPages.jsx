import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { setPaymentStatus } from '../../lib/api';
import { useOrder, useOrders } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { site } from '../../data/site';
import { formatRupiah, formatTime } from '../../utils/format';
import { ORDER_STATUS, PAYMENT_METHODS, STATUS_FLOW, countItems, lineKey, lineName, paymentMethodLabel } from '../../utils/order';
import { EmptyState, Loading, PaymentBadge, Spinner, StatusBadge, btnPrimary, btnSecondary, card, cx } from '../../components/ui';

function PageHeader({ title, subtitle, back }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xs">
      <Link to={back} className="grid size-10 place-items-center rounded-xl hover:bg-kopi-100" aria-label="Kembali">
        <ArrowLeft strokeWidth={1.5} className="size-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-kopi-500">{subtitle}</p>}
      </div>
    </header>
  );
}

function Progress({ order }) {
  const current = STATUS_FLOW.indexOf(order.status);
  const timeOf = (status) => order.statusHistory.findLast((h) => h.status === status)?.at;
  return (
    <ol className="mt-5 space-y-4">
      {STATUS_FLOW.map((status, i) => {
        const done = i <= current;
        return (
          <li key={status} className="flex items-center gap-3">
            <span
              className={cx(
                'grid size-7 shrink-0 place-items-center rounded-full border text-xs',
                done ? 'border-terakota-700 bg-terakota-700 text-white' : 'border-black/[0.1] bg-white text-kopi-400',
                i === current && 'animate-ping-once',
              )}
            >
              {done ? <Check strokeWidth={2} className="size-3.5" /> : i + 1}
            </span>
            <span className={cx('flex-1 text-sm', done ? 'font-semibold' : 'text-kopi-400')}>{ORDER_STATUS[status].label}</span>
            {done && timeOf(status) && <span className="text-xs tabular-nums text-kopi-500">{formatTime(timeOf(status))}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function CopyButton({ value, label = 'Salin' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={cx(
        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
        copied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-kopi-900/12 bg-white text-kopi-800 hover:bg-kopi-50',
      )}
    >
      {copied ? <Check strokeWidth={2} className="size-3.5" /> : <Copy strokeWidth={1.5} className="size-3.5" />}
      {copied ? 'Tersalin' : label}
    </button>
  );
}

// Panel Pembayaran Interaktif: Barcode/QRIS (sesuai Figma 60:1533), DANA, Transfer Bank, & Tunai Kasir
function CustomerPaymentPanel({ order }) {
  const [method, setMethod] = useState(order.paymentMethod || 'qris');
  const [bankId, setBankId] = useState(order.paymentBank || site.payment.banks[0].id);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60 - 1);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (order.paymentMethod) setMethod(order.paymentMethod);
    if (order.paymentBank) setBankId(order.paymentBank);
  }, [order.paymentMethod, order.paymentBank]);

  useEffect(() => {
    if (order.paymentStatus === 'lunas') return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.paymentStatus]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const selectedBank = site.payment.banks.find((b) => b.id === bankId) ?? site.payment.banks[0];
  const isPaid = order.paymentStatus === 'lunas';

  const switchMethod = async (nextMethod, nextBank = bankId) => {
    setMethod(nextMethod);
    if (nextBank) setBankId(nextBank);
    try {
      await setPaymentStatus(order.id, order.paymentStatus, {
        paymentMethod: nextMethod,
        paymentBank: nextMethod === 'bank' ? nextBank : null,
      });
    } catch {
      // ignore offline switch error
    }
  };

  const confirmPaid = async () => {
    setConfirming(true);
    try {
      await setPaymentStatus(order.id, 'lunas', {
        paymentMethod: method,
        paymentBank: method === 'bank' ? bankId : null,
        paidAt: new Date().toISOString(),
      });
    } finally {
      setConfirming(false);
    }
  };

  if (isPaid) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <CheckCircle2 strokeWidth={1.75} className="size-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-emerald-950">Pembayaran Lunas</p>
              <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {paymentMethodLabel(order)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-emerald-800">
              Terima kasih! Pembayaran sebesar <b>{formatRupiah(order.total)}</b> sudah tercatat di kasir & dapur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'qris', label: 'Barcode / QRIS', icon: QrCode },
    { id: 'dana', label: 'DANA', icon: Smartphone },
    { id: 'bank', label: 'Transfer Bank', icon: Building2 },
    { id: 'kasir', label: 'Kasir', icon: Wallet },
  ];

  return (
    <div className={cx(card, 'overflow-hidden p-4')}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-kopi-950">Selesaikan Pembayaran</h2>
          <p className="text-xs text-kopi-500">Bisa ganti metode pembayaran di bawah ini</p>
        </div>
        <PaymentBadge status={order.paymentStatus} />
      </div>

      {/* Tab pemilih 4 metode pembayaran */}
      <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-xl bg-kopi-100/80 p-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = method === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchMethod(id)}
              className={cx(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[11px] font-semibold transition-all',
                active ? 'bg-terakota-700 text-white shadow-2xs' : 'text-kopi-700 hover:bg-white/60',
              )}
            >
              <Icon strokeWidth={1.75} className="size-4" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Banner hitung mundur sesuai Figma node 60:1542 */}
      {method !== 'kasir' && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-2 text-xs">
          <Clock strokeWidth={1.5} className="size-3.5 text-[#b45309]" />
          <span className="font-medium text-kopi-600">Selesaikan pembayaran dalam</span>
          <span className="font-mono text-sm font-bold tabular-nums text-[#b45309]">
            {mins}:{secs}
          </span>
        </div>
      )}

      {/* 1. TAMPILAN BARCODE / QRIS (Sesuai Figma node 60:1533) */}
      {method === 'qris' && (
        <div className="mt-3 rounded-2xl border border-kopi-900/10 bg-[#fafafa] p-4">
          <div className="text-center">
            <p className="text-[11px] font-extrabold tracking-wider text-[#d92626]">{site.payment.qris.standard}</p>
            <p className="mt-0.5 text-base font-bold text-kopi-950">{site.payment.qris.merchantName}</p>
            <p className="text-[11px] text-kopi-500">
              NMID: {site.payment.qris.nmid} • {order.tableName} ({order.code})
            </p>
          </div>

          <div className="relative mx-auto mt-3 grid size-52 place-items-center rounded-2xl border border-kopi-900/10 bg-white p-3 shadow-2xs">
            <QRCodeSVG
              value={`00020101021226590014ID.CO.QRIS.WWW01189360091431020039280215ID1020039281920520458125303360540${order.total}5802ID5919KEDAI BUNGADI JOGJA6010GUNUNGKIDUL62140110${order.code}6304B1A2`}
              size={176}
              level="M"
            />
            <span className="absolute rounded-md bg-terakota-700 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white shadow-2xs">
              BUNGADI
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-kopi-900/10 bg-white px-3.5 py-2.5">
            <div>
              <span className="block text-[11px] text-kopi-500">Total Bayar QRIS</span>
              <span className="text-lg font-bold tabular-nums text-terakota-700">{formatRupiah(order.total)}</span>
            </div>
            <CopyButton value={order.total} label="Salin Nominal" />
          </div>

          <p className="mt-2.5 text-center text-[11px] text-kopi-500">
            Menerima BCA Mobile, Livin Mandiri, BRImo, BNI, GoPay, OVO, DANA, ShopeePay
          </p>

          <button
            type="button"
            disabled={confirming}
            onClick={confirmPaid}
            className={cx(btnPrimary, 'mt-3.5 w-full')}
          >
            {confirming ? <Spinner className="size-4" /> : <ShieldCheck strokeWidth={1.75} className="size-4" />}
            Saya Sudah Scan & Bayar QRIS
          </button>
        </div>
      )}

      {/* 2. TAMPILAN DANA E-WALLET */}
      {method === 'dana' && (
        <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block rounded-md bg-[#1071e2] px-2 py-0.5 text-[10px] font-extrabold text-white">
                DANA E-WALLET
              </span>
              <p className="mt-1 text-base font-bold text-kopi-950">{site.payment.dana.holder}</p>
            </div>
            <Smartphone strokeWidth={1.5} className="size-7 text-[#1071e2]" />
          </div>

          <div className="relative mx-auto mt-3 grid size-44 place-items-center rounded-2xl border border-sky-200 bg-white p-3 shadow-2xs">
            <QRCodeSVG
              value={`https://link.dana.id/qr/${site.payment.dana.rawNumber}?amount=${order.total}&order=${order.code}`}
              size={148}
              fgColor="#0c4a9e"
              level="M"
            />
            <span className="absolute rounded-md bg-[#1071e2] px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white">
              DANA
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-sky-200/80 bg-white px-3.5 py-2.5">
              <div>
                <span className="block text-[11px] text-kopi-500">Nomor DANA Kedai</span>
                <span className="font-mono text-base font-bold text-[#1071e2]">{site.payment.dana.number}</span>
              </div>
              <CopyButton value={site.payment.dana.rawNumber} label="Salin Nomor" />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-sky-200/80 bg-white px-3.5 py-2.5">
              <div>
                <span className="block text-[11px] text-kopi-500">Nominal Transfer DANA</span>
                <span className="text-base font-bold tabular-nums text-kopi-950">{formatRupiah(order.total)}</span>
              </div>
              <CopyButton value={order.total} label="Salin Nominal" />
            </div>
          </div>

          <button
            type="button"
            disabled={confirming}
            onClick={confirmPaid}
            className="mt-3.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1071e2] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0d5ec0]"
          >
            {confirming ? <Spinner className="size-4" /> : <CheckCircle2 strokeWidth={1.75} className="size-4" />}
            Konfirmasi Sudah Bayar via DANA
          </button>
        </div>
      )}

      {/* 3. TAMPILAN TRANSFER BANK */}
      {method === 'bank' && (
        <div className="mt-3 rounded-2xl border border-kopi-900/10 bg-[#fafafa] p-4">
          <p className="text-xs font-semibold text-kopi-600">Pilih Bank Tujuan Transfer:</p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {site.payment.banks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => switchMethod('bank', b.id)}
                className={cx(
                  'rounded-lg border px-2 py-2 text-xs font-bold transition-colors',
                  bankId === b.id
                    ? 'border-terakota-700 bg-terakota-700 text-white'
                    : 'border-kopi-900/10 bg-white text-kopi-800 hover:bg-kopi-50',
                )}
              >
                {b.id}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <div className="rounded-xl border border-kopi-900/10 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-terakota-700">{selectedBank.name}</span>
                <span className="text-[11px] text-kopi-500">a.n. {selectedBank.holder}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-bold tracking-wide text-kopi-950">{selectedBank.account}</span>
                <CopyButton value={selectedBank.account} label="Salin Rekening" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-kopi-900/10 bg-white px-3.5 py-2.5">
              <div>
                <span className="block text-[11px] text-kopi-500">Total Nominal Transfer</span>
                <span className="text-base font-bold tabular-nums text-terakota-700">{formatRupiah(order.total)}</span>
              </div>
              <CopyButton value={order.total} label="Salin Nominal" />
            </div>
          </div>

          <p className="mt-2.5 text-[11px] text-kopi-500">
            Cantumkan berita transfer <b>{order.code}</b> ({order.tableName}) atau tunjukkan bukti transfer ke staf.
          </p>

          <button
            type="button"
            disabled={confirming}
            onClick={confirmPaid}
            className={cx(btnPrimary, 'mt-3.5 w-full')}
          >
            {confirming ? <Spinner className="size-4" /> : <CheckCircle2 strokeWidth={1.75} className="size-4" />}
            Konfirmasi Sudah Transfer ({selectedBank.id})
          </button>
        </div>
      )}

      {/* 4. TAMPILAN BAYAR DI KASIR */}
      {method === 'kasir' && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Kode Pembayaran Kasir</p>
          <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-kopi-950">{order.code}</p>
          <p className="mt-0.5 text-xs text-kopi-600">
            {order.tableName} • Total <b>{formatRupiah(order.total)}</b>
          </p>

          <div className="mx-auto my-3 grid size-36 place-items-center rounded-xl border border-amber-200 bg-white p-2.5">
            <QRCodeSVG value={`BUNGADI-ORDER:${order.code}:${order.total}`} size={116} />
          </div>

          <p className="text-xs text-kopi-700">
            Sebutkan kode <b>{order.code}</b> atau tunjukkan barcode di atas kepada staf di meja kasir untuk membayar tunai / debit.
          </p>
        </div>
      )}
    </div>
  );
}

// /pesanan/:id: status pesanan & pembayaran real-time
export function OrderStatusPage() {
  const { id } = useParams();
  const { table } = useSession();
  const { data: order, loading } = useOrder(id);

  if (loading) return <Loading text="Memuat pesanan…" />;
  if (!order) {
    return (
      <>
        <PageHeader title="Pesanan" back="/pesanan" />
        <EmptyState icon={Receipt} title="Pesanan tidak ditemukan" />
      </>
    );
  }

  const cancelled = order.status === 'dibatalkan';
  return (
    <div className="pb-10">
      <PageHeader
        title={order.paymentStatus === 'lunas' ? 'Status Pesanan' : 'Pembayaran & Status Pesanan'}
        subtitle={`${order.tableName} · Kode ${order.code}`}
        back={table ? '/menu' : '/pesanan'}
      />
      <div className="space-y-4 px-4 pt-4">
        {/* Panel Pembayaran 4 Metode (Barcode/QRIS, DANA, Bank, Kasir) */}
        {!cancelled && <CustomerPaymentPanel order={order} />}

        {/* Kartu Progres Status Dapur */}
        <div className={cx(card, 'p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-kopi-500">Kode pesanan</p>
              <p className="text-2xl font-bold tracking-tight">{order.code}</p>
              <p className="mt-0.5 text-sm text-kopi-500">
                {order.tableName} · {formatTime(order.createdAt)}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <p className={cx('mt-4 rounded-xl p-3 text-sm', cancelled ? 'bg-red-50 text-red-800' : 'bg-kopi-50 text-kopi-700')}>
            {ORDER_STATUS[order.status].customerText}
          </p>
          {!cancelled && <Progress order={order} />}
        </div>

        {/* Rincian Item Pesanan */}
        <div className={cx(card, 'p-5')}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Rincian Pesanan</h2>
            <span className="rounded-full bg-kopi-100 px-2.5 py-0.5 text-xs font-semibold text-kopi-800">
              {paymentMethodLabel(order)}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-black/[0.06] border-t border-black/[0.06]">
            {order.items.map((it) => (
              <li key={lineKey(it)} className="flex justify-between gap-3 py-2.5 text-sm">
                <span>
                  <span className="font-semibold tabular-nums">{it.qty}×</span> {lineName(it)}
                </span>
                <span className="tabular-nums text-kopi-600">{formatRupiah(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-black/[0.06] pt-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-terakota-700">{formatRupiah(order.total)}</span>
          </div>
          {order.note && <p className="mt-3 text-sm text-kopi-500">Catatan: {order.note}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to="/pesanan" className={btnSecondary}>
            Pesanan saya
          </Link>
          <Link to={table ? '/menu' : '/pesan'} className={btnPrimary}>
            Pesan lagi
          </Link>
        </div>
      </div>
    </div>
  );
}

// /pesanan: semua pesanan dari HP ini
export function MyOrdersPage() {
  const { table, myOrderIds } = useSession();
  const { data: orders, loading } = useOrders();
  const mine = (orders ?? []).filter((o) => myOrderIds.includes(o.id)).reverse();

  return (
    <div className="pb-10">
      <PageHeader title="Pesanan saya" back={table ? '/menu' : '/pesan'} />
      {loading && <Loading />}
      {orders && mine.length === 0 && (
        <EmptyState icon={Receipt} title="Belum ada pesanan">
          Pesanan yang kamu kirim dari HP ini akan muncul di sini.
        </EmptyState>
      )}
      <ul className="space-y-3 px-4 pt-4">
        {mine.map((o) => (
          <li key={o.id}>
            <Link to={`/pesanan/${o.id}`} className={cx(card, 'flex items-center gap-3 p-4 hover:border-terakota-200')}>
              <div className="flex-1">
                <p className="font-semibold">
                  {o.code} <span className="font-normal text-kopi-500">· {formatTime(o.createdAt)}</span>
                </p>
                <p className="mt-0.5 text-sm text-kopi-500">
                  {countItems(o.items)} item · {formatRupiah(o.total)} · {paymentMethodLabel(o)}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <StatusBadge status={o.status} />
                  <PaymentBadge status={o.paymentStatus} />
                </div>
              </div>
              <ChevronRight strokeWidth={1.5} className="size-5 text-kopi-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

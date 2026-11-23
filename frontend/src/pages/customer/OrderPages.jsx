import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Check, ChevronLeft, ChevronRight, Copy, Receipt } from 'lucide-react';
import { setPaymentStatus } from '../../lib/api';
import { useOrder, useOrders } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { site } from '../../data/site';
import { formatRupiah, formatTime } from '../../utils/format';
import { STATUS_FLOW, countItems, lineKey, lineName, paymentMethodLabel } from '../../utils/order';
import { EmptyState, Loading, PaymentBadge, Spinner, StatusBadge, btnPrimary, btnSecondary, cx } from '../../components/ui';

function PageHeader({ title, back }) {
  return (
    <header className="sticky top-0 z-20 flex h-[56px] items-center gap-[4px] border-b border-[#e4e4e7] bg-white px-[8px]">
      <Link
        to={back}
        className="grid size-[40px] place-items-center rounded-[12px] text-[#18181b] hover:bg-[#f4f4f5]"
        aria-label="Kembali"
      >
        <ChevronLeft strokeWidth={1.75} className="size-[20px]" />
      </Link>
      <h1 className="flex-1 text-center text-[16px] font-semibold leading-[24px] text-[#18181b]">{title}</h1>
      <div className="size-[40px] shrink-0" />
    </header>
  );
}

// Timeline vertikal 3 tahap persis sesuai Figma node 20:261
function OrderTimeline({ order }) {
  const idx = STATUS_FLOW.indexOf(order.status);
  const steps = [
    {
      key: 'diterima',
      title: 'Pesanan diterima',
      subtitle: `Pukul ${formatTime(order.createdAt)}`,
      done: idx > 0 || order.status === 'selesai',
      active: idx === 0,
    },
    {
      key: 'diproses',
      title: 'Sedang dibuat di dapur',
      subtitle: 'Perkiraan siap sekitar 10 menit lagi',
      done: idx > 1 || order.status === 'selesai',
      active: idx === 1,
    },
    {
      key: 'siap_diantar',
      title: 'Diantar ke meja',
      subtitle: `Pelayan mengantar ke ${order.tableName.split(',')[0]}`,
      done: idx >= 2,
      active: idx === 2,
    },
  ];

  return (
    <div className="mt-[12px] flex flex-col">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={s.key} className="flex items-start gap-[12px]">
            <div className="flex flex-col items-center gap-[4px]">
              {s.done ? (
                <div className="grid size-[24px] place-items-center rounded-full bg-[#7a4b2a] text-white">
                  <Check strokeWidth={2.25} className="size-[14px]" />
                </div>
              ) : s.active ? (
                <div className="grid size-[24px] place-items-center rounded-full border-2 border-[#7a4b2a] bg-[#f6eee7]">
                  <div className="size-[10px] rounded-full bg-[#7a4b2a]" />
                </div>
              ) : (
                <div className="size-[24px] rounded-full border-2 border-[#e4e4e7] bg-white" />
              )}
              {!isLast && (
                <div className={cx('h-[28px] w-[2px] rounded-[1px]', s.done ? 'bg-[#7a4b2a]' : 'bg-[#e4e4e7]')} />
              )}
            </div>
            <div className={cx('flex flex-1 flex-col gap-[2px] pt-[2px]', !isLast && 'pb-[12px]')}>
              <p
                className={cx(
                  'text-[14px] font-semibold leading-[20px]',
                  s.done || s.active ? 'text-[#18181b]' : 'text-[#71717a]',
                )}
              >
                {s.title}
              </p>
              <p className="text-[12px] font-medium leading-[16px] text-[#71717a]">{s.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
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
        'inline-flex items-center gap-1 rounded-[8px] border px-[10px] py-[4px] text-[12px] font-semibold transition-colors',
        copied
          ? 'border-[#15803d] bg-[#ecfdf3] text-[#15803d]'
          : 'border-[#e4e4e7] bg-white text-[#18181b] hover:bg-[#f4f4f5]',
      )}
    >
      {copied ? <Check strokeWidth={2} className="size-3.5" /> : <Copy strokeWidth={1.5} className="size-3.5" />}
      {copied ? 'Tersalin' : label}
    </button>
  );
}

// Kartu Pembayaran persis sesuai Figma node 60:1533 ("Pembayaran QRIS") + DANA + Bank + Kasir
function CustomerPaymentSection({ order }) {
  const [method, setMethod] = useState(order.paymentMethod || 'qris');
  const [bankId, setBankId] = useState(order.paymentBank || site.payment.banks[0].id);
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 59);
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

  if (order.paymentStatus === 'lunas') return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const selectedBank = site.payment.banks.find((b) => b.id === bankId) ?? site.payment.banks[0];

  const switchMethod = async (nextMethod, nextBank = bankId) => {
    setMethod(nextMethod);
    if (nextBank) setBankId(nextBank);
    try {
      await setPaymentStatus(order.id, order.paymentStatus, {
        paymentMethod: nextMethod,
        paymentBank: nextMethod === 'bank' ? nextBank : null,
      });
    } catch {
      // ignore
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

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Tab Ganti Metode Pembayaran (QRIS, DANA, Bank, Kasir) */}
      <div className="grid grid-cols-4 gap-[6px] rounded-[12px] border border-[#e4e4e7] bg-white p-[4px]">
        {[
          { id: 'qris', label: 'QRIS' },
          { id: 'dana', label: 'DANA' },
          { id: 'bank', label: 'Bank' },
          { id: 'kasir', label: 'Kasir' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchMethod(t.id)}
            className={cx(
              'h-[34px] rounded-[8px] text-[12px] font-semibold transition-colors',
              method === t.id ? 'bg-[#7a4b2a] text-white' : 'text-[#71717a] hover:bg-[#f4f4f5]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Banner hitung mundur sesuai Figma node 60:1542 */}
      {method !== 'kasir' && (
        <div className="flex h-[40px] items-center justify-center gap-[8px] rounded-[10px] border border-[#fed7aa] bg-[#fff7ed] px-[14px]">
          <span className="text-[12px] font-medium text-[#71717a]">Selesaikan pembayaran dalam</span>
          <span className="text-[13px] font-bold tabular-nums text-[#b45309]">
            {mins}:{secs}
          </span>
        </div>
      )}

      {/* 1. KARTU QRIS SESUAI FIGMA NODE 60:1545 */}
      {method === 'qris' && (
        <div className="flex flex-col items-center justify-center gap-[12px] rounded-[16px] border border-[#e4e4e7] bg-white p-[16px]">
          <div className="flex flex-col items-center gap-[2px] text-center">
            <p className="text-[11px] font-bold text-[#d92626]">{site.payment.qris.standard}</p>
            <p className="text-[15px] font-bold text-[#18181b]">{site.payment.qris.merchantName}</p>
            <p className="text-[11px] text-[#71717a]">
              NMID: {site.payment.qris.nmid} • {order.tableName.split(',')[0]}
            </p>
          </div>

          <div className="relative grid size-[190px] place-items-center rounded-[12px] border border-[#e4e4e7] bg-white p-3">
            <QRCodeSVG
              value={`00020101021226590014ID.CO.QRIS.WWW01189360091431020039280215ID1020039281920520458125303360540${order.total}5802ID5919KEDAI BUNGADI JOGJA6010GUNUNGKIDUL62140110${order.code}6304B1A2`}
              size={160}
              level="M"
            />
            <div className="absolute flex h-[24px] items-center justify-center rounded-[6px] bg-[#7a4b2a] px-[8px]">
              <span className="text-[9px] font-bold text-white">BUNGADI</span>
            </div>
          </div>

          <div className="flex w-full items-center justify-between rounded-[12px] bg-[#fafafa] px-[14px] py-[10px]">
            <div>
              <span className="block text-[11px] text-[#71717a]">Total Pembayaran</span>
              <span className="text-[18px] font-bold tabular-nums text-[#7a4b2a]">{formatRupiah(order.total)}</span>
            </div>
            <CopyButton value={order.total} label="Salin Nominal" />
          </div>

          <button
            type="button"
            disabled={confirming}
            onClick={confirmPaid}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#7a4b2a] px-[16px] text-[14px] font-semibold text-white hover:bg-[#5e3920]"
          >
            {confirming && <Spinner className="size-4" />}
            Saya sudah bayar QRIS
          </button>
        </div>
      )}

      {/* 2. KARTU DANA */}
      {method === 'dana' && (
        <div className="flex flex-col items-center gap-[12px] rounded-[16px] border border-[#e4e4e7] bg-white p-[16px]">
          <div className="flex flex-col items-center gap-[2px] text-center">
            <span className="rounded-[6px] bg-[#1071e2] px-[8px] py-[2px] text-[10px] font-bold text-white">
              DANA E-WALLET
            </span>
            <p className="mt-1 text-[15px] font-bold text-[#18181b]">{site.payment.dana.holder}</p>
            <p className="text-[11px] text-[#71717a]">Scan QR DANA atau transfer ke nomor DANA kedai</p>
          </div>

          <div className="relative grid size-[170px] place-items-center rounded-[12px] border border-[#e4e4e7] bg-white p-2.5">
            <QRCodeSVG
              value={`https://link.dana.id/qr/${site.payment.dana.rawNumber}?amount=${order.total}&order=${order.code}`}
              size={144}
              fgColor="#1071e2"
            />
            <div className="absolute flex h-[22px] items-center justify-center rounded-[6px] bg-[#1071e2] px-[8px]">
              <span className="text-[9px] font-bold text-white">DANA</span>
            </div>
          </div>

          <div className="flex w-full items-center justify-between rounded-[12px] bg-[#fafafa] px-[14px] py-[10px]">
            <div>
              <span className="block text-[11px] text-[#71717a]">Nomor DANA Kedai</span>
              <span className="font-mono text-[15px] font-bold text-[#1071e2]">{site.payment.dana.number}</span>
            </div>
            <CopyButton value={site.payment.dana.rawNumber} label="Salin Nomor" />
          </div>

          <button
            type="button"
            disabled={confirming}
            onClick={confirmPaid}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#7a4b2a] px-[16px] text-[14px] font-semibold text-white hover:bg-[#5e3920]"
          >
            {confirming && <Spinner className="size-4" />}
            Konfirmasi sudah bayar DANA
          </button>
        </div>
      )}

      {/* 3. KARTU TRANSFER BANK */}
      {method === 'bank' && (
        <div className="flex flex-col gap-[12px] rounded-[16px] border border-[#e4e4e7] bg-white p-[16px]">
          <div className="grid grid-cols-4 gap-[6px]">
            {site.payment.banks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => switchMethod('bank', b.id)}
                className={cx(
                  'h-[34px] rounded-[8px] border text-[12px] font-semibold transition-colors',
                  bankId === b.id
                    ? 'border-[#7a4b2a] bg-[#f6eee7] text-[#5e3920]'
                    : 'border-[#e4e4e7] bg-white text-[#18181b]',
                )}
              >
                {b.id}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-[12px] bg-[#fafafa] px-[14px] py-[12px]">
            <div>
              <span className="block text-[12px] font-semibold text-[#71717a]">
                {selectedBank.name} • a.n. {selectedBank.holder}
              </span>
              <span className="font-mono text-[18px] font-bold text-[#18181b]">{selectedBank.account}</span>
            </div>
            <CopyButton value={selectedBank.account} label="Salin" />
          </div>

          <div className="flex items-center justify-between rounded-[12px] bg-[#fafafa] px-[14px] py-[10px]">
            <div>
              <span className="block text-[11px] text-[#71717a]">Nominal Transfer</span>
              <span className="text-[16px] font-bold tabular-nums text-[#7a4b2a]">{formatRupiah(order.total)}</span>
            </div>
            <CopyButton value={order.total} label="Salin Nominal" />
          </div>

          <button
            type="button"
            disabled={confirming}
            onClick={confirmPaid}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#7a4b2a] px-[16px] text-[14px] font-semibold text-white hover:bg-[#5e3920]"
          >
            {confirming && <Spinner className="size-4" />}
            Konfirmasi sudah transfer
          </button>
        </div>
      )}

      {/* 4. KARTU BAYAR DI KASIR */}
      {method === 'kasir' && (
        <div className="flex flex-col items-center gap-[8px] rounded-[16px] border border-[#e4e4e7] bg-white p-[16px] text-center">
          <p className="text-[12px] font-medium text-[#71717a]">Sebutkan kode pesanan ini saat membayar di kasir</p>
          <p className="text-[24px] font-bold tracking-tight text-[#18181b]">{order.code}</p>
          <p className="text-[13px] text-[#71717a]">
            Total Tagihan: <b className="text-[#18181b]">{formatRupiah(order.total)}</b>
          </p>
        </div>
      )}
    </div>
  );
}

// /pesanan/:id: Status pesanan persis sesuai Figma node 20:245
export function OrderStatusPage() {
  const { id } = useParams();
  const { table } = useSession();
  const { data: order, loading } = useOrder(id);

  if (loading) return <Loading text="Memuat pesanan…" />;
  if (!order) {
    return (
      <>
        <PageHeader title="Status pesanan" back="/pesanan" />
        <EmptyState icon={Receipt} title="Pesanan tidak ditemukan" />
      </>
    );
  }

  const cancelled = order.status === 'dibatalkan';

  return (
    <div className="min-h-dvh bg-[#fafafa] pb-[40px]">
      <PageHeader title="Status pesanan" back={table ? '/menu' : '/pesanan'} />

      <div className="flex flex-col gap-[16px] px-[20px] pt-[16px]">
        {/* Ringkasan pesanan & Timeline sesuai Figma node 20:254 */}
        <div className="flex flex-col gap-[6px] rounded-[16px] border border-[#e4e4e7] bg-white p-[20px]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[24px] font-semibold leading-[32px] tracking-[-0.24px] text-[#18181b]">
              Pesanan {order.code}
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-[14px] font-normal leading-[20px] text-[#71717a]">
            {order.tableName.split(',')[0]}
            {order.customerName ? `, atas nama ${order.customerName}` : ''}
          </p>

          {!cancelled && <OrderTimeline order={order} />}
        </div>

        {/* Kartu Pembayaran Interaktif bila belum bayar */}
        {!cancelled && <CustomerPaymentSection order={order} />}

        {/* Isi pesanan sesuai Figma node 20:285 */}
        <div className="flex flex-col gap-[8px] rounded-[16px] border border-[#e4e4e7] bg-white p-[16px]">
          {order.items.map((it) => (
            <div
              key={lineKey(it)}
              className="flex items-center justify-between text-[14px] font-normal leading-[20px] text-[#18181b]"
            >
              <span>
                {it.qty}x {it.name}
                {it.choice ? `, ${it.choice.toLowerCase()}` : ''}
              </span>
              <span className="tabular-nums">{formatRupiah(it.price * it.qty)}</span>
            </div>
          ))}

          <div className="my-[2px] h-px w-full bg-[#e4e4e7]" />

          <div className="flex items-center justify-between text-[14px] font-semibold leading-[20px] text-[#18181b]">
            <span>Total ({paymentMethodLabel(order)})</span>
            <span className="tabular-nums">{formatRupiah(order.total)}</span>
          </div>

          <div className="mt-[4px] flex items-center justify-between">
            <span className="text-[12px] text-[#71717a]">Status pembayaran</span>
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[10px]">
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
    <div className="min-h-dvh bg-[#fafafa] pb-[40px]">
      <PageHeader title="Pesanan saya" back={table ? '/menu' : '/pesan'} />
      {loading && <Loading />}
      {orders && mine.length === 0 && (
        <EmptyState icon={Receipt} title="Belum ada pesanan">
          Pesanan yang kamu kirim dari HP ini akan muncul di sini.
        </EmptyState>
      )}
      <ul className="space-y-[12px] px-[20px] pt-[16px]">
        {mine.map((o) => (
          <li key={o.id}>
            <Link
              to={`/pesanan/${o.id}`}
              className="flex items-center gap-[12px] rounded-[16px] border border-[#e4e4e7] bg-white p-[16px] transition-colors hover:border-[#7a4b2a]"
            >
              <div className="flex-1">
                <p className="text-[16px] font-semibold text-[#18181b]">
                  Pesanan {o.code}{' '}
                  <span className="text-[14px] font-normal text-[#71717a]">· {formatTime(o.createdAt)}</span>
                </p>
                <p className="mt-0.5 text-[14px] text-[#71717a]">
                  {countItems(o.items)} item · {formatRupiah(o.total)} · {paymentMethodLabel(o)}
                </p>
                <div className="mt-[8px] flex gap-[6px]">
                  <StatusBadge status={o.status} />
                  <PaymentBadge status={o.paymentStatus} />
                </div>
              </div>
              <ChevronRight strokeWidth={1.5} className="size-5 text-[#71717a]" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

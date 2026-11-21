import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  Package,
  Plus,
  Printer,
  QrCode,
  Receipt,
  Rows3,
  Search,
  ShoppingBag,
  Smartphone,
  StickyNote,
  Store,
  Trash2,
  User,
  Utensils,
  Wallet,
} from 'lucide-react';
import { categories } from '../../data/menu';
import { site } from '../../data/site';
import { createOrder, setPaymentStatus, updateOrderStatus } from '../../lib/api';
import { useMenu, useNow, useOrders, useTables } from '../../lib/hooks';
import { formatRupiah, formatTime, minutesSince, timeAgo } from '../../utils/format';
import {
  ACTIVE_STATUSES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  cartKey,
  cartLines,
  countItems,
  lineKey,
  lineName,
  nextStatus,
  paymentMethodLabel,
} from '../../utils/order';
import {
  EmptyState,
  Loading,
  MenuThumb,
  PaymentBadge,
  Sheet,
  Spinner,
  StatusBadge,
  Stepper,
  btnPrimary,
  btnSecondary,
  card,
  cx,
  input,
} from '../../components/ui';

const columns = [
  { status: 'diterima', title: 'Masuk / Baru' },
  { status: 'diproses', title: 'Sedang Diproses Dapur' },
  { status: 'siap_diantar', title: 'Siap Diantar / Diambil' },
];

const PACKAGING_OPTIONS = [
  'Kemasan Rapat + Kantong Ramah Lingkungan',
  'Bungkus Perjalanan Jauh (Gula & Es Dipisah)',
  'Kotak Rombongan / Kardus Oleh-oleh',
];

const QUICK_NOTES = [
  'Bungkus rapat untuk dibawa perjalanan',
  'Gula batu dipisah',
  'Es dipisah',
  'Sambal dipisah',
];

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

function waitTone(order, now) {
  const minutes = minutesSince(order.createdAt, now);
  if (minutes >= 40) return 'text-red-700 font-semibold';
  if (minutes >= 20) return 'text-amber-700 font-semibold';
  return 'text-kopi-500';
}

// Modal Struk / Nota Kasir
function ReceiptModal({ order, onClose }) {
  if (!order) return null;
  const isTakeaway = order.orderType === 'bungkus' || order.tableCode === 'BUNGKUS';
  return (
    <Sheet open={Boolean(order)} onClose={onClose} title={`Struk Pesanan ${order.code}`}>
      <div className="rounded-2xl border border-dashed border-kopi-900/20 bg-[#fafafa] p-4 text-sm">
        <div className="border-b border-dashed border-kopi-900/15 pb-3 text-center">
          <p className="font-display text-lg font-bold text-kopi-950">{site.name}</p>
          <p className="text-xs text-kopi-500">{site.address}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-kopi-900 px-3 py-0.5 text-xs font-bold text-white">
            {isTakeaway ? '🥡 PESANAN BUNGKUS (TAKEAWAY)' : `🍽️ ${order.tableName}`}
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-kopi-600">
          <div className="flex justify-between">
            <span>Kode Antrean:</span>
            <b className="font-mono text-kopi-950">#{order.code}</b>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
            <span>{formatTime(order.createdAt)} WIB</span>
          </div>
          {order.customerName && (
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <b className="text-kopi-900">{order.customerName}</b>
            </div>
          )}
          {order.cashierName && (
            <div className="flex justify-between">
              <span>Dilayani oleh:</span>
              <span>{order.cashierName}</span>
            </div>
          )}
          {order.packagingType && (
            <div className="flex justify-between">
              <span>Kemasan:</span>
              <span className="text-right font-medium text-kopi-800">{order.packagingType}</span>
            </div>
          )}
        </div>

        <ul className="my-3 divide-y divide-dashed divide-kopi-900/10 border-y border-dashed border-kopi-900/15 py-2">
          {order.items.map((it) => (
            <li key={lineKey(it)} className="flex justify-between gap-2 py-1.5 text-xs">
              <span>
                <b>{it.qty}×</b> {lineName(it)}
              </span>
              <span className="tabular-nums font-semibold">{formatRupiah(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-kopi-500">
            <span>Kantong & Kemasan Ramah Lingkungan</span>
            <span>Gratis (Rp0)</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-kopi-950">
            <span>Total Tagihan</span>
            <span className="tabular-nums text-terakota-700">{formatRupiah(order.total)}</span>
          </div>
          <div className="flex justify-between pt-1 text-kopi-600">
            <span>Metode Pembayaran</span>
            <b className="text-kopi-900">{paymentMethodLabel(order)}</b>
          </div>
          <div className="flex justify-between text-kopi-600">
            <span>Status Bayar</span>
            <b className={order.paymentStatus === 'lunas' ? 'text-emerald-700' : 'text-red-700'}>
              {order.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM BAYAR'}
            </b>
          </div>
          {order.cashReceived > 0 && (
            <>
              <div className="flex justify-between text-kopi-600">
                <span>Tunai Diterima</span>
                <span className="tabular-nums">{formatRupiah(order.cashReceived)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Kembalian</span>
                <span className="tabular-nums">{formatRupiah(order.cashChange || 0)}</span>
              </div>
            </>
          )}
        </div>

        {order.note && (
          <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
            <b>Catatan:</b> {order.note}
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => window.print()} className={cx(btnSecondary, 'flex-1')}>
          <Printer strokeWidth={1.5} className="size-4" /> Cetak Struk
        </button>
        <button type="button" onClick={onClose} className={cx(btnPrimary, 'flex-1')}>
          Selesai
        </button>
      </div>
    </Sheet>
  );
}

// Modal Terima Pembayaran di Kasir (dengan pilihan 4 metode: Tunai, Barcode/QRIS, DANA, Bank + hitung kembalian)
function SettlePaymentModal({ order, onClose, onSaved }) {
  const [method, setMethod] = useState(order?.paymentMethod || 'kasir');
  const [bankId, setBankId] = useState(order?.paymentBank || site.payment.banks[0].id);
  const [cashInput, setCashInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setMethod(order.paymentMethod || 'kasir');
      setBankId(order.paymentBank || site.payment.banks[0].id);
      setCashInput(String(order.total));
    }
  }, [order]);

  if (!order) return null;

  const cashAmount = Number(String(cashInput).replace(/\D/g, '')) || 0;
  const change = Math.max(0, cashAmount - order.total);
  const cashEnough = method !== 'kasir' || cashAmount >= order.total;

  const quickCash = [order.total, 20000, 50000, 100000].filter((v, i, arr) => v >= order.total && arr.indexOf(v) === i);

  const handleSettle = async () => {
    if (!cashEnough) return;
    setSaving(true);
    try {
      const updated = await setPaymentStatus(order.id, 'lunas', {
        paymentMethod: method,
        paymentBank: method === 'bank' ? bankId : null,
        cashReceived: method === 'kasir' ? cashAmount : null,
        cashChange: method === 'kasir' ? change : null,
        paidAt: new Date().toISOString(),
      });
      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={Boolean(order)} onClose={onClose} title={`Terima Pembayaran · ${order.code}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-kopi-50 px-4 py-3">
          <div>
            <p className="text-xs text-kopi-500">
              {order.tableName} {order.customerName ? `· ${order.customerName}` : ''}
            </p>
            <p className="text-sm font-semibold">{countItems(order.items)} item pesanan</p>
          </div>
          <p className="text-xl font-bold tabular-nums text-terakota-700">{formatRupiah(order.total)}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-kopi-500">Pilih Metode Pembayaran</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { id: 'kasir', label: 'Tunai Kasir', icon: Wallet },
              { id: 'qris', label: 'Barcode / QRIS', icon: QrCode },
              { id: 'dana', label: 'DANA', icon: Smartphone },
              { id: 'bank', label: 'Transfer Bank', icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMethod(id)}
                className={cx(
                  'flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition-all',
                  method === id
                    ? 'border-terakota-700 bg-terakota-50 text-terakota-900'
                    : 'border-kopi-900/10 bg-white text-kopi-700 hover:bg-kopi-50',
                )}
              >
                <Icon strokeWidth={1.75} className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {method === 'kasir' && (
          <div className="space-y-2.5 rounded-2xl border border-kopi-900/10 bg-[#fafafa] p-3.5">
            <label className="block text-xs font-semibold text-kopi-700">Uang Tunai Diterima (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value.replace(/\D/g, ''))}
              className={cx(input, 'font-mono text-base font-bold')}
              placeholder={String(order.total)}
            />
            <div className="flex flex-wrap gap-1.5">
              {quickCash.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashInput(String(amt))}
                  className={cx(
                    'rounded-lg border px-2.5 py-1 text-xs font-semibold',
                    cashAmount === amt
                      ? 'border-terakota-700 bg-terakota-700 text-white'
                      : 'border-kopi-900/10 bg-white text-kopi-700 hover:bg-kopi-100',
                  )}
                >
                  {amt === order.total ? 'Uang Pas' : formatRupiah(amt)}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-kopi-900/10 pt-2.5 text-sm">
              <span className="font-medium text-kopi-600">Kembalian Pelanggan</span>
              <span className={cx('font-bold tabular-nums', cashEnough ? 'text-emerald-700' : 'text-red-600')}>
                {cashEnough ? formatRupiah(change) : 'Uang belum cukup'}
              </span>
            </div>
          </div>
        )}

        {method === 'qris' && (
          <div className="rounded-2xl border border-kopi-900/10 bg-[#fafafa] p-3.5 text-center">
            <p className="text-xs font-bold text-red-700">{site.payment.qris.standard}</p>
            <div className="mx-auto my-2.5 grid size-40 place-items-center rounded-xl border border-kopi-900/10 bg-white p-2">
              <QRCodeSVG value={`BUNGADI-QRIS:${order.code}:${order.total}`} size={136} />
            </div>
            <p className="text-xs text-kopi-600">Tunjukkan QRIS ini ke pelanggan atau cek mutasi QRIS kasir.</p>
          </div>
        )}

        {method === 'dana' && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-3.5 text-center">
            <p className="text-xs font-bold text-[#1071e2]">DANA KEDAI BUNGADI • {site.payment.dana.number}</p>
            <div className="mx-auto my-2.5 grid size-36 place-items-center rounded-xl border border-sky-200 bg-white p-2">
              <QRCodeSVG value={`https://link.dana.id/qr/${site.payment.dana.rawNumber}?amount=${order.total}`} size={120} fgColor="#0c4a9e" />
            </div>
            <p className="text-xs text-kopi-600">a.n. {site.payment.dana.holder}</p>
          </div>
        )}

        {method === 'bank' && (
          <div className="space-y-2 rounded-2xl border border-kopi-900/10 bg-[#fafafa] p-3.5">
            <p className="text-xs font-semibold text-kopi-700">Bank Tujuan:</p>
            <div className="grid grid-cols-4 gap-1.5">
              {site.payment.banks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBankId(b.id)}
                  className={cx(
                    'rounded-lg border py-1.5 text-xs font-bold',
                    bankId === b.id ? 'border-terakota-700 bg-terakota-700 text-white' : 'border-kopi-900/10 bg-white',
                  )}
                >
                  {b.id}
                </button>
              ))}
            </div>
            {site.payment.banks
              .filter((b) => b.id === bankId)
              .map((b) => (
                <div key={b.id} className="rounded-xl bg-white p-2.5 text-xs">
                  <span className="font-semibold">{b.name}</span> · <span className="font-mono font-bold">{b.account}</span>
                  <span className="block text-kopi-500">a.n. {b.holder}</span>
                </div>
              ))}
          </div>
        )}

        <button type="button" disabled={saving || !cashEnough} onClick={handleSettle} className={cx(btnPrimary, 'w-full')}>
          {saving ? <Spinner className="size-4" /> : <CheckCircle2 strokeWidth={1.75} className="size-4" />}
          Konfirmasi Lunas · {formatRupiah(order.total)}
        </button>
      </div>
    </Sheet>
  );
}

function OrderCard({ order, now, fresh, run, onSettle, onReceipt }) {
  const next = nextStatus(order.status);
  const paid = order.paymentStatus === 'lunas';
  const isTakeaway = order.orderType === 'bungkus' || order.tableCode === 'BUNGKUS';

  return (
    <article className={cx(card, 'p-4', fresh && 'animate-ping-once border-terakota-300')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cx(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white',
                isTakeaway ? 'bg-terakota-700' : 'bg-kopi-900',
              )}
            >
              {isTakeaway ? '🥡 BUNGKUS' : `🍽️ ${order.tableName}`}
            </span>
            <span className="font-mono text-sm font-bold text-kopi-950">#{order.code}</span>
          </div>
          {order.customerName && <p className="mt-1.5 text-sm font-medium text-kopi-700">👤 {order.customerName}</p>}
          {order.packagingType && (
            <p className="mt-0.5 text-xs text-terakota-800">📦 {order.packagingType}</p>
          )}
        </div>
        <span className={cx('shrink-0 text-xs tabular-nums', waitTone(order, now))}>
          {formatTime(order.createdAt)} · {timeAgo(order.createdAt, now)}
        </span>
      </div>

      <ul className="mt-3 space-y-1 border-t border-black/[0.05] pt-2.5">
        {order.items.map((it) => (
          <li key={lineKey(it)} className="flex justify-between gap-2 text-sm">
            <span>
              <span className="inline-block w-6 font-bold tabular-nums text-kopi-950">{it.qty}×</span>
              <span>{lineName(it)}</span>
            </span>
            <span className="tabular-nums text-xs text-kopi-500">{formatRupiah(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="mt-2.5 flex gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          <StickyNote strokeWidth={1.5} className="mt-0.5 size-3.5 shrink-0" />
          <span>{order.note}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] pt-3">
        <div>
          <span className="text-sm font-bold tabular-nums text-kopi-950">{formatRupiah(order.total)}</span>
          <span className="ml-2 rounded-md bg-kopi-100 px-2 py-0.5 text-[11px] font-semibold text-kopi-700">
            {paymentMethodLabel(order)}
          </span>
        </div>
        <PaymentBadge status={order.paymentStatus} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {next && (
          <button
            type="button"
            onClick={() => run(() => updateOrderStatus(order.id, next))}
            className={cx(btnPrimary, 'h-9 flex-1 px-3 text-xs')}
          >
            {isTakeaway && next === 'siap_diantar' ? 'Siap Diambil' : ORDER_STATUS[next].action}
          </button>
        )}
        {!paid ? (
          <button
            type="button"
            onClick={() => onSettle(order)}
            className={cx(btnSecondary, 'h-9 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-50', !next && 'flex-1')}
          >
            Terima Bayar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => run(() => setPaymentStatus(order.id, 'belum_bayar'))}
            className={cx(btnSecondary, 'h-9 px-2.5 text-xs', !next && 'flex-1')}
          >
            Batal Lunas
          </button>
        )}
        <button
          type="button"
          onClick={() => onReceipt(order)}
          className="grid size-9 place-items-center rounded-full border border-kopi-900/12 bg-white text-kopi-700 hover:bg-kopi-50"
          title="Lihat / Cetak Struk"
          aria-label="Struk"
        >
          <Printer strokeWidth={1.5} className="size-4" />
        </button>
        {order.status === 'diterima' && (
          <button
            type="button"
            onClick={() => window.confirm(`Batalkan pesanan ${order.code}?`) && run(() => updateOrderStatus(order.id, 'dibatalkan'))}
            className="h-9 rounded-full px-2.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Batal
          </button>
        )}
      </div>
    </article>
  );
}

// Tagihan per meja: memudahkan rombongan yang membayar sekaligus
function TableView({ orders, run, onSettle }) {
  const groups = new Map();
  orders.forEach((o) => groups.set(o.tableCode, [...(groups.get(o.tableCode) ?? []), o]));
  if (groups.size === 0) return <EmptyState icon={ClipboardList} title="Tidak ada meja atau pesanan aktif" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[...groups.values()].map((list) => {
        const unpaid = list.filter((o) => o.paymentStatus !== 'lunas');
        const unpaidTotal = unpaid.reduce((sum, o) => sum + o.total, 0);
        const isTakeaway = list[0].tableCode === 'BUNGKUS';
        return (
          <article key={list[0].tableCode} className={cx(card, 'p-4')}>
            <div className="flex items-center justify-between">
              <span
                className={cx(
                  'rounded-lg px-2.5 py-1 text-sm font-semibold text-white',
                  isTakeaway ? 'bg-terakota-700' : 'bg-kopi-900',
                )}
              >
                {isTakeaway ? '🥡 Pesanan Bungkus' : list[0].tableName}
              </span>
              <span className="text-sm text-kopi-500">{list.length} pesanan</span>
            </div>
            <ul className="mt-3 space-y-2">
              {list.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    <b>#{o.code}</b> {o.customerName && <span className="text-kopi-500">· {o.customerName}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <StatusBadge status={o.status} />
                    {o.paymentStatus !== 'lunas' ? (
                      <button
                        type="button"
                        onClick={() => onSettle(o)}
                        className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 hover:bg-amber-200"
                      >
                        Bayar
                      </button>
                    ) : (
                      <PaymentBadge status={o.paymentStatus} />
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-3">
              <span className="text-sm text-kopi-500">Belum dibayar</span>
              <span className="font-semibold tabular-nums">{formatRupiah(unpaidTotal)}</span>
            </div>
            <button
              type="button"
              disabled={unpaid.length === 0}
              onClick={() => run(() => Promise.all(unpaid.map((o) => setPaymentStatus(o.id, 'lunas'))))}
              className={cx(btnPrimary, 'mt-3 h-10 w-full')}
            >
              {unpaid.length ? 'Tandai semua lunas' : 'Sudah lunas semua'}
            </button>
          </article>
        );
      })}
    </div>
  );
}

// ============================================================================
// KOMPONEN POS KASIR ("Menu & Pesan di Kasir") SESUAI FIGMA NODE 61:1540
// Khusus melayani pelanggan yang pesan BUNGKUS (Takeaway) atau pesan langsung di kasir
// ============================================================================
function CashierPosView({ cashierName, onOrderCreated }) {
  const { data: menu, loading } = useMenu();
  const { data: tables } = useTables();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('semua');
  const [selectedChoices, setSelectedChoices] = useState({});
  const [posCart, setPosCart] = useState({});

  // Opsi Kasir & Pelanggan Bungkus
  const [orderType, setOrderType] = useState('bungkus'); // 'bungkus' | 'meja'
  const [tableCode, setTableCode] = useState('M01');
  const [customerName, setCustomerName] = useState('');
  const [packagingType, setPackagingType] = useState(PACKAGING_OPTIONS[0]);
  const [note, setNote] = useState('Bungkus rapat untuk dibawa perjalanan');

  // Opsi Pembayaran Kasir (4 cara: Tunai Kasir, Barcode/QRIS, DANA, Bank)
  const [paymentMethod, setPaymentMethod] = useState('kasir');
  const [paymentBank, setPaymentBank] = useState(site.payment.banks[0].id);
  const [payNow, setPayNow] = useState(true);
  const [cashInput, setCashInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableMenu = useMemo(() => (menu ?? []).filter((m) => m.available), [menu]);

  const filteredMenu = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (menu ?? []).filter(
      (m) => (category === 'semua' || m.category === category) && (!q || m.name.toLowerCase().includes(q)),
    );
  }, [menu, query, category]);

  const lines = useMemo(() => cartLines(menu ?? [], posCart), [menu, posCart]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines]);
  const totalItems = useMemo(() => countItems(lines), [lines]);

  // Sinkronisasi default uang diterima dengan total tagihan
  useEffect(() => {
    if (total > 0) setCashInput(String(total));
    else setCashInput('');
  }, [total]);

  const setItemQty = (key, qty) => {
    setPosCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = qty;
      return next;
    });
  };

  const addMenuItem = (item) => {
    const choiceId = item.option ? (selectedChoices[item.id] ?? item.option.choices[0].id) : null;
    const key = cartKey(item.id, choiceId);
    setItemQty(key, (posCart[key] ?? 0) + 1);
  };

  const getItemInCartCount = (item) => {
    return Object.entries(posCart)
      .filter(([k]) => k === item.id || k.startsWith(`${item.id}:`))
      .reduce((s, [, q]) => s + q, 0);
  };

  const cashAmount = Number(String(cashInput).replace(/\D/g, '')) || 0;
  const cashChange = Math.max(0, cashAmount - total);
  const cashValid = !payNow || paymentMethod !== 'kasir' || cashAmount >= total;

  const quickCashAmounts = useMemo(() => {
    if (total <= 0) return [];
    return [total, 20000, 50000, 100000].filter((v, i, arr) => v >= total && arr.indexOf(v) === i);
  }, [total]);

  const submitPosOrder = async (e) => {
    e.preventDefault();
    if (lines.length === 0) return;
    if (!cashValid) {
      setError('Nominal uang tunai yang diterima kurang dari total tagihan.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formattedCustomer =
        customerName.trim() || (orderType === 'bungkus' ? 'Pelanggan Bungkus' : `Pelanggan ${tableCode}`);
      const order = await createOrder({
        tableCode: orderType === 'bungkus' ? 'BUNGKUS' : tableCode,
        orderType,
        customerName:
          orderType === 'bungkus' && !formattedCustomer.toLowerCase().includes('bungkus')
            ? `${formattedCustomer} (Bungkus)`
            : formattedCustomer,
        note,
        cashierName,
        packagingType: orderType === 'bungkus' ? packagingType : null,
        paymentMethod,
        paymentBank: paymentMethod === 'bank' ? paymentBank : null,
        paymentStatus: payNow ? 'lunas' : 'belum_bayar',
        cashReceived: payNow && paymentMethod === 'kasir' ? cashAmount : null,
        cashChange: payNow && paymentMethod === 'kasir' ? cashChange : null,
        items: lines.map((l) => ({ menuId: l.menuId, choiceId: l.choiceId, qty: l.qty })),
      });
      setPosCart({});
      setCustomerName('');
      onOrderCreated(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Memuat katalog kasir…" />;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
      {/* PANEL KIRI: KATALOG MENU KASIR (Sesuai Figma node 61:1558) */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-kopi-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari wedang, kopi, makanan, atau camilan untuk dibungkus…"
              className={cx(input, 'pl-10')}
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs text-amber-900">
            <Package strokeWidth={1.5} className="size-4 shrink-0 text-terakota-700" />
            <span>
              Mode Kasir: <b>Input Pesanan Bungkus & Langsung</b>
            </span>
          </div>
        </div>

        {/* Filter Kategori Menu (Sesuai Figma node 61:1561) */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setCategory('semua')}
            className={cx(
              'shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors',
              category === 'semua'
                ? 'bg-terakota-700 text-white shadow-2xs'
                : 'border border-kopi-900/10 bg-white text-kopi-800 hover:bg-kopi-50',
            )}
          >
            Semua ({availableMenu.length})
          </button>
          {categories.map((c) => {
            const count = (menu ?? []).filter((m) => m.category === c.id).length;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cx(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-terakota-700 text-white shadow-2xs'
                    : 'border border-kopi-900/10 bg-white text-kopi-800 hover:bg-kopi-50',
                )}
              >
                {c.icon && (
                  <img
                    src={c.icon}
                    alt=""
                    className={cx('size-3.5', active ? 'brightness-0 invert' : 'brightness-0 opacity-75')}
                  />
                )}
                {c.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid Kisi Menu Kasir (Sesuai Figma node 61:1572) */}
        {filteredMenu.length === 0 ? (
          <EmptyState icon={Search} title="Menu tidak ditemukan">
            Coba kata kunci atau kategori lain.
          </EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMenu.map((item) => {
              const countInCart = getItemInCartCount(item);
              const activeChoiceId = item.option ? (selectedChoices[item.id] ?? item.option.choices[0].id) : null;
              const activeChoice = item.option?.choices.find((c) => c.id === activeChoiceId);
              const displayPrice = activeChoice?.price ?? item.price;

              return (
                <div
                  key={item.id}
                  className={cx(
                    'flex flex-col rounded-2xl border bg-white p-3 transition-all',
                    countInCart > 0 ? 'border-[1.5px] border-terakota-700 shadow-soft' : 'border-kopi-900/10',
                    !item.available && 'opacity-55',
                  )}
                >
                  <div className="relative">
                    <MenuThumb item={item} className="h-28 w-full rounded-xl" />
                    {item.tags.includes('khas') && (
                      <span className="absolute top-2 right-2 rounded-md bg-terakota-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                        Favorit
                      </span>
                    )}
                    {countInCart > 0 && (
                      <span className="absolute top-2 left-2 rounded-md bg-kopi-950/90 px-2 py-0.5 text-[11px] font-bold text-[#e8c98a]">
                        {countInCart}× dipilih
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-kopi-400">
                      {categories.find((c) => c.id === item.category)?.name ?? item.category}
                    </p>
                    <p className="mt-0.5 font-semibold leading-snug text-kopi-950">{item.name}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-terakota-700">{formatRupiah(displayPrice)}</p>
                  </div>

                  {/* Pilihan varian langsung di kartu kasir (Panas/Es, Goreng/Bakar, Rebus/Goreng) */}
                  {item.option && (
                    <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-kopi-50 p-1">
                      {item.option.choices.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedChoices((prev) => ({ ...prev, [item.id]: c.id }))}
                          className={cx(
                            'rounded-md py-1 text-[11px] font-semibold transition-colors',
                            activeChoiceId === c.id ? 'bg-kopi-900 text-white' : 'text-kopi-600 hover:bg-white',
                          )}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => addMenuItem(item)}
                    className={cx(
                      'mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors',
                      countInCart > 0
                        ? 'bg-[#f6eee7] text-terakota-800 hover:bg-terakota-100'
                        : 'bg-kopi-100/80 text-kopi-900 hover:bg-kopi-200/70',
                    )}
                  >
                    {!item.available ? (
                      'Sedang Habis'
                    ) : countInCart > 0 ? (
                      <>
                        <Check strokeWidth={2} className="size-3.5" /> {countInCart} di Keranjang (+ Tambah)
                      </>
                    ) : (
                      <>
                        <Plus strokeWidth={2} className="size-3.5" /> Tambah
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PANEL KANAN: CHECKOUT KASIR & OPSI BUNGKUS (Sesuai Figma node 61:1635) */}
      <aside className="xl:sticky xl:top-16 xl:self-start">
        <form onSubmit={submitPosOrder} className={cx(card, 'space-y-4 p-4 sm:p-5')}>
          {/* Pilihan Tipe Pesanan: Bungkus (Takeaway) vs Makan di Meja */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-kopi-500">Tipe Layanan Kasir</span>
              <span className="font-mono text-xs font-bold text-terakota-700">
                {orderType === 'bungkus' ? '#BUN-AUTO' : `#${tableCode}`}
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-xl bg-kopi-100/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setOrderType('bungkus');
                  if (!note) setNote('Bungkus rapat untuk dibawa perjalanan');
                }}
                className={cx(
                  'flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all',
                  orderType === 'bungkus' ? 'bg-terakota-700 text-white shadow-2xs' : 'text-kopi-700 hover:bg-white/60',
                )}
              >
                <Package strokeWidth={1.75} className="size-4" />
                🥡 Bungkus (Takeaway)
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderType('meja');
                  if (note === 'Bungkus rapat untuk dibawa perjalanan') setNote('');
                }}
                className={cx(
                  'flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all',
                  orderType === 'meja' ? 'bg-kopi-900 text-white shadow-2xs' : 'text-kopi-700 hover:bg-white/60',
                )}
              >
                <Utensils strokeWidth={1.75} className="size-4" />
                🍽️ Makan di Meja
              </button>
            </div>
          </div>

          {/* Data Pelanggan & Opsi Kemasan Bungkus (Sesuai Figma node 61:1641) */}
          <div className="space-y-2.5 rounded-2xl border border-kopi-900/10 bg-[#fafafa] p-3.5">
            <div className="flex items-center gap-2">
              <User strokeWidth={1.5} className="size-4 shrink-0 text-terakota-700" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={
                  orderType === 'bungkus' ? 'Nama pelanggan (mis. Mas Dimas - Bungkus)' : 'Nama pelanggan / rombongan'
                }
                className="w-full bg-transparent text-sm font-semibold text-kopi-950 outline-none placeholder:font-normal placeholder:text-kopi-400"
              />
            </div>

            {orderType === 'bungkus' ? (
              <div className="border-t border-kopi-900/10 pt-2.5">
                <label className="block text-[11px] font-semibold text-kopi-500">Opsi Kemasan Bungkus Kasir:</label>
                <select
                  value={packagingType}
                  onChange={(e) => setPackagingType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-kopi-900/12 bg-white px-2.5 py-1.5 text-xs font-semibold text-kopi-900 outline-none"
                >
                  {PACKAGING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      📦 {opt}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="border-t border-kopi-900/10 pt-2.5">
                <label className="block text-[11px] font-semibold text-kopi-500">Pilih Nomor Meja:</label>
                <select
                  value={tableCode}
                  onChange={(e) => setTableCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-kopi-900/12 bg-white px-2.5 py-1.5 text-xs font-semibold text-kopi-900 outline-none"
                >
                  {(tables ?? []).map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Daftar Item Pesanan di Kasir (Sesuai Figma node 61:1644) */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-kopi-500">
                Item Pesanan ({totalItems})
              </span>
              {lines.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPosCart({})}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                >
                  <Trash2 strokeWidth={1.5} className="size-3.5" /> Kosongkan
                </button>
              )}
            </div>

            {lines.length === 0 ? (
              <div className="mt-2 rounded-2xl border border-dashed border-kopi-900/15 py-8 text-center text-xs text-kopi-400">
                <ShoppingBag strokeWidth={1.5} className="mx-auto mb-1.5 size-6 opacity-60" />
                Klik menu di sebelah kiri untuk menambahkan pesanan bungkus/kasir.
              </div>
            ) : (
              <ul className="mt-2 max-h-56 divide-y divide-black/[0.06] overflow-y-auto rounded-2xl border border-kopi-900/10 bg-white px-3">
                {lines.map((l) => (
                  <li key={l.key} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-kopi-950">{lineName(l)}</p>
                      <p className="text-xs font-semibold tabular-nums text-terakota-700">
                        {formatRupiah(l.price * l.qty)}
                      </p>
                    </div>
                    <Stepper value={l.qty} onChange={(v) => setItemQty(l.key, v)} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Catatan Bungkus / Dapur (Sesuai Figma node 61:1672) */}
          <div>
            <label className="block text-xs font-semibold text-kopi-700">Catatan Bungkus / Dapur</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Bungkus rapat untuk perjalanan, gula batu dipisah"
              className={cx(input, 'mt-1 h-9 text-xs')}
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {QUICK_NOTES.map((qn) => (
                <button
                  key={qn}
                  type="button"
                  onClick={() => setNote(qn)}
                  className="rounded-md border border-kopi-900/10 bg-kopi-50 px-2 py-0.5 text-[10px] font-medium text-kopi-700 hover:bg-kopi-100"
                >
                  + {qn}
                </button>
              ))}
            </div>
          </div>

          {/* Ringkasan Pembayaran (Sesuai Figma node 61:1674) */}
          <div className="space-y-1.5 border-y border-black/[0.08] py-3 text-xs">
            <div className="flex justify-between text-kopi-600">
              <span>Subtotal ({totalItems} item)</span>
              <span className="tabular-nums font-semibold">{formatRupiah(total)}</span>
            </div>
            {orderType === 'bungkus' && (
              <div className="flex justify-between text-emerald-700">
                <span>Kantong & Kemasan Ramah Lingkungan</span>
                <span className="font-semibold">Gratis (Rp0)</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 text-sm font-bold text-kopi-950">
              <span>Total Tagihan</span>
              <span className="text-lg tabular-nums text-terakota-700">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Pilihan Metode Bayar di Kasir (4 Cara: Tunai, Barcode/QRIS, DANA, Bank) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kopi-800">Metode Pembayaran Kasir:</span>
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <input
                  type="checkbox"
                  checked={payNow}
                  onChange={(e) => setPayNow(e.target.checked)}
                  className="size-3.5 accent-terakota-700"
                />
                Langsung Lunas
              </label>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'kasir', label: 'Tunai' },
                { id: 'qris', label: 'QRIS' },
                { id: 'dana', label: 'DANA' },
                { id: 'bank', label: 'Bank' },
              ].map((m) => {
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={cx(
                      'rounded-xl border py-2 text-xs font-bold transition-colors',
                      active
                        ? 'border-terakota-700 bg-[#f6eee7] text-terakota-800'
                        : 'border-kopi-900/10 bg-white text-kopi-700 hover:bg-kopi-50',
                    )}
                  >
                    {active ? `✓ ${m.label}` : m.label}
                  </button>
                );
              })}
            </div>

            {/* Kalkulator Tunai & Kembalian Otomatis */}
            {payNow && paymentMethod === 'kasir' && total > 0 && (
              <div className="space-y-2 rounded-xl border border-kopi-900/10 bg-[#fafafa] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-kopi-600">Uang Diterima:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value.replace(/\D/g, ''))}
                    className="w-32 rounded-lg border border-kopi-900/15 bg-white px-2.5 py-1 text-right font-mono text-sm font-bold outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {quickCashAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashInput(String(amt))}
                      className={cx(
                        'rounded-md border px-2 py-0.5 text-[11px] font-semibold',
                        cashAmount === amt
                          ? 'border-terakota-700 bg-terakota-700 text-white'
                          : 'border-kopi-900/10 bg-white text-kopi-700',
                      )}
                    >
                      {amt === total ? 'Uang Pas' : formatRupiah(amt)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-kopi-900/10 pt-1.5 text-xs">
                  <span className="font-semibold text-kopi-700">Kembalian:</span>
                  <span className={cx('font-mono text-sm font-bold', cashValid ? 'text-emerald-700' : 'text-red-600')}>
                    {cashValid ? formatRupiah(cashChange) : 'Uang kurang'}
                  </span>
                </div>
              </div>
            )}

            {/* Preview Barcode/QRIS di Kasir */}
            {paymentMethod === 'qris' && total > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/30 p-2.5">
                <div className="rounded-lg border border-kopi-900/10 bg-white p-1.5">
                  <QRCodeSVG value={`BUNGADI-POS-QRIS:${total}`} size={64} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-red-700">QRIS Standar Nasional</p>
                  <p className="text-kopi-600">{site.payment.qris.merchantName}</p>
                  <p className="font-semibold text-kopi-900">Pelanggan scan QR di kasir</p>
                </div>
              </div>
            )}

            {/* Preview DANA di Kasir */}
            {paymentMethod === 'dana' && total > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/40 p-2.5">
                <div className="rounded-lg border border-sky-200 bg-white p-1.5">
                  <QRCodeSVG
                    value={`https://link.dana.id/qr/${site.payment.dana.rawNumber}?amount=${total}`}
                    size={64}
                    fgColor="#0c4a9e"
                  />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#1071e2]">DANA E-Wallet Kedai</p>
                  <p className="font-mono font-bold text-kopi-900">{site.payment.dana.number}</p>
                  <p className="text-kopi-500">a.n. {site.payment.dana.holder}</p>
                </div>
              </div>
            )}

            {/* Pilihan Bank di Kasir */}
            {paymentMethod === 'bank' && (
              <div className="space-y-1.5 rounded-xl border border-kopi-900/10 bg-[#fafafa] p-2.5">
                <div className="grid grid-cols-4 gap-1">
                  {site.payment.banks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setPaymentBank(b.id)}
                      className={cx(
                        'rounded-md py-1 text-[11px] font-bold',
                        paymentBank === b.id ? 'bg-kopi-900 text-white' : 'bg-white text-kopi-700',
                      )}
                    >
                      {b.id}
                    </button>
                  ))}
                </div>
                {site.payment.banks
                  .filter((b) => b.id === paymentBank)
                  .map((b) => (
                    <p key={b.id} className="text-[11px] text-kopi-600">
                      <b>{b.name}</b>: <span className="font-mono font-bold text-kopi-950">{b.account}</span> (a.n. {b.holder})
                    </p>
                  ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting || lines.length === 0 || !cashValid}
            className={cx(btnPrimary, 'h-12 w-full text-sm shadow-soft')}
          >
            {submitting ? <Spinner className="size-4" /> : <Receipt strokeWidth={1.75} className="size-4" />}
            {orderType === 'bungkus'
              ? `Proses Pesanan Bungkus · ${formatRupiah(total)}`
              : `Proses Pesanan ${tableCode} · ${formatRupiah(total)}`}
          </button>
        </form>
      </aside>
    </div>
  );
}

export default function CashierPage() {
  const { data: orders, loading } = useOrders();
  const now = useNow(30000);

  // Mode Utama Kasir sesuai Figma node 61:1548: 'antrean' | 'pos'
  const [mode, setMode] = useState('antrean');
  const [view, setView] = useState('status');
  const [filterType, setFilterType] = useState('semua'); // 'semua' | 'bungkus' | 'meja'
  const [cashierName, setCashierName] = useState('Kasir 1');
  const [fresh, setFresh] = useState([]);
  const [notice, setNotice] = useState(null);
  const [settlingOrder, setSettlingOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const seen = useRef(null);

  useEffect(() => {
    if (!orders) return undefined;
    const ids = orders.map((o) => o.id);
    if (seen.current) {
      const added = orders.filter((o) => !seen.current.has(o.id));
      if (added.length) {
        setFresh((f) => [...f, ...added.map((o) => o.id)]);
        setNotice({
          tone: 'info',
          text: `Pesanan baru ${added.map((o) => `#${o.code} (${o.tableName})`).join(', ')}`,
        });
      }
    }
    seen.current = new Set(ids);
    const timer = setTimeout(() => setFresh([]), 8000);
    return () => clearTimeout(timer);
  }, [orders]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const run = async (action) => {
    try {
      await action();
    } catch (err) {
      setNotice({ tone: 'error', text: err.message });
    }
  };

  const today = (orders ?? []).filter((o) => isToday(o.createdAt));
  const filteredToday = today.filter((o) => {
    const isBun = o.orderType === 'bungkus' || o.tableCode === 'BUNGKUS';
    if (filterType === 'bungkus') return isBun;
    if (filterType === 'meja') return !isBun;
    return true;
  });

  const active = filteredToday.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const takeawayCount = today.filter(
    (o) => ACTIVE_STATUSES.includes(o.status) && (o.orderType === 'bungkus' || o.tableCode === 'BUNGKUS'),
  ).length;
  const tableOrders = filteredToday.filter(
    (o) => o.status !== 'dibatalkan' && (ACTIVE_STATUSES.includes(o.status) || o.paymentStatus !== 'lunas'),
  );
  const history = filteredToday.filter((o) => !ACTIVE_STATUSES.includes(o.status)).reverse();

  const views = [
    ['status', 'Per status', LayoutGrid],
    ['meja', 'Per meja / grup', Rows3],
    ['riwayat', `Selesai (${history.length})`, ClipboardList],
  ];

  return (
    <div className="min-h-dvh bg-[#fafafa]">
      {/* BILAH ATAS KASIR & POS SESUAI FIGMA NODE 61:1541 */}
      <header className="sticky top-0 z-20 border-b border-kopi-900/10 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Mode */}
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-terakota-700 text-lg font-bold text-white shadow-2xs">
              <img src="/images/logo-bungadi.jpg" alt="B" className="size-full object-cover" />
            </span>
            <div>
              <h1 className="text-base font-bold text-kopi-950">Kedai Bungadi</h1>
              <p className="text-xs text-kopi-500">Layar Kasir & POS Dapur</p>
            </div>
          </div>

          {/* Navigasi Mode Utama: Antrean Pesanan vs Pesan di Kasir (Bungkus) */}
          <div className="flex rounded-xl bg-kopi-100/80 p-1">
            <button
              type="button"
              onClick={() => setMode('antrean')}
              className={cx(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                mode === 'antrean' ? 'bg-terakota-700 text-white shadow-2xs' : 'text-kopi-600 hover:text-kopi-950',
              )}
            >
              <LayoutGrid strokeWidth={1.75} className="size-4" />
              Antrean Pesanan
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 text-[11px] tabular-nums',
                  mode === 'antrean' ? 'bg-white/20 text-white' : 'bg-white text-kopi-800',
                )}
              >
                {today.filter((o) => ACTIVE_STATUSES.includes(o.status)).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('pos')}
              className={cx(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:text-sm',
                mode === 'pos' ? 'bg-terakota-700 text-white shadow-2xs' : 'text-kopi-600 hover:text-kopi-950',
              )}
            >
              <Store strokeWidth={1.75} className="size-4" />
              + Pesan di Kasir (Bungkus)
            </button>
          </div>

          {/* Opsi Kasir Bertugas, Status Koneksi & Jam */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-kopi-900/10 bg-kopi-50/70 px-2.5 py-1.5 text-xs">
              <span className="size-2 rounded-full bg-emerald-500" />
              <select
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                aria-label="Pilih Staf Kasir"
                className="bg-transparent font-semibold text-kopi-800 outline-none"
              >
                <option value="Kasir 1">Kasir 1 • Terhubung</option>
                <option value="Kasir 2">Kasir 2 • Terhubung</option>
                <option value="Staf Dapur">Staf Dapur • Terhubung</option>
              </select>
            </div>
            <span className="hidden font-mono text-sm font-bold text-kopi-900 sm:inline">
              {formatTime(new Date(now).toISOString())}
            </span>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {notice && (
          <div
            role="status"
            className={cx(
              'fixed top-4 right-4 left-4 z-50 mx-auto flex max-w-md animate-slide-up items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lift sm:left-auto',
              notice.tone === 'error' ? 'bg-red-700 text-white' : 'bg-kopi-900 text-white',
            )}
          >
            <Bell strokeWidth={1.5} className="size-4 shrink-0" /> {notice.text}
          </div>
        )}

        {/* MODE 1: POS KASIR (UNTUK PESAN BUNGKUS / TAKEAWAY & LANGSUNG) */}
        {mode === 'pos' && (
          <CashierPosView
            cashierName={cashierName}
            onOrderCreated={(order) => {
              setReceiptOrder(order);
              setNotice({
                tone: 'info',
                text: `Pesanan #${order.code} (${order.customerName}) berhasil masuk antrean dapur!`,
              });
            }}
          />
        )}

        {/* MODE 2: ANTREAN PESANAN & DAPUR */}
        {mode === 'antrean' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Filter Tipe Pesanan: Semua vs Bungkus vs Makan di Meja */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'semua', label: 'Semua Pesanan' },
                  { id: 'bungkus', label: `🥡 Pesanan Bungkus (${takeawayCount})` },
                  { id: 'meja', label: '🍽️ Makan di Meja' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterType(f.id)}
                    className={cx(
                      'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors',
                      filterType === f.id
                        ? 'bg-kopi-900 text-white'
                        : 'border border-kopi-900/10 bg-white text-kopi-700 hover:bg-kopi-50',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-black/[0.06] bg-white p-1">
                  {views.map(([key, label, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      className={cx(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                        view === key ? 'bg-kopi-900 text-white' : 'text-kopi-600 hover:bg-kopi-50',
                      )}
                    >
                      <Icon strokeWidth={1.5} className="size-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              {loading && <Loading text="Memuat pesanan…" />}

              {orders && view === 'status' && (
                <div className="grid gap-4 lg:grid-cols-3">
                  {columns.map((col) => {
                    const list = active.filter((o) => o.status === col.status);
                    return (
                      <section key={col.status} className="rounded-2xl bg-kopi-100/70 p-3">
                        <h2 className="flex items-center justify-between px-1 pb-3 text-sm font-semibold">
                          {col.title}
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs tabular-nums text-kopi-600">
                            {list.length}
                          </span>
                        </h2>
                        <div className="space-y-3">
                          {list.map((o) => (
                            <OrderCard
                              key={o.id}
                              order={o}
                              now={now}
                              fresh={fresh.includes(o.id)}
                              run={run}
                              onSettle={setSettlingOrder}
                              onReceipt={setReceiptOrder}
                            />
                          ))}
                          {list.length === 0 && (
                            <p className="px-1 py-6 text-center text-sm text-kopi-400">Tidak ada antrean</p>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}

              {orders && view === 'meja' && (
                <TableView orders={tableOrders} run={run} onSettle={setSettlingOrder} />
              )}

              {orders &&
                view === 'riwayat' &&
                (history.length === 0 ? (
                  <EmptyState icon={ClipboardList} title="Belum ada pesanan selesai hari ini" />
                ) : (
                  <div className={cx(card, 'divide-y divide-black/[0.06]')}>
                    {history.map((o) => {
                      const isBun = o.orderType === 'bungkus' || o.tableCode === 'BUNGKUS';
                      return (
                        <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                          <span>
                            <b>#{o.code}</b> · {isBun ? '🥡 Bungkus' : o.tableName}{' '}
                            {o.customerName ? `(${o.customerName})` : ''} · {formatTime(o.createdAt)} ·{' '}
                            {countItems(o.items)} item
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="rounded-md bg-kopi-100 px-2 py-0.5 text-xs font-semibold text-kopi-700">
                              {paymentMethodLabel(o)}
                            </span>
                            <span className="font-semibold tabular-nums">{formatRupiah(o.total)}</span>
                            <StatusBadge status={o.status} />
                            <PaymentBadge status={o.paymentStatus} />
                            <button
                              type="button"
                              onClick={() => setReceiptOrder(o)}
                              className="grid size-8 place-items-center rounded-lg border border-kopi-900/10 hover:bg-kopi-50"
                              title="Cetak Struk"
                            >
                              <Printer strokeWidth={1.5} className="size-3.5" />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Terima Pembayaran & Modal Cetak Struk */}
      <SettlePaymentModal
        order={settlingOrder}
        onClose={() => setSettlingOrder(null)}
        onSaved={(updated) =>
          setNotice({
            tone: 'info',
            text: `Pembayaran #${updated.code} (${paymentMethodLabel(updated)}) berhasil ditandai LUNAS.`,
          })
        }
      />
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
    </div>
  );
}

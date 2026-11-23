import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Bell,
  BellOff,
  Check,
  ChefHat,
  Clock,
  Printer,
  QrCode,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Users,
  Utensils,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { categories, DRINK_CATEGORIES } from '../../data/menu';
import {
  createOrder,
  getStaffSession,
  setPaymentStatus,
  updateOrderStatus,
  updateOrderTable,
} from '../../lib/api';
import { useMenu, useNow, useOnline, useOrders, useTables } from '../../lib/hooks';
import { formatRupiah, formatTime, timeAgo } from '../../utils/format';
import {
  ACTIVE_STATUSES,
  ORDER_STATUS,
  cartKey,
  cartLines,
  countItems,
  lineName,
  nextStatus,
  paymentMethodLabel,
  prevStatus,
} from '../../utils/order';
import {
  ConfirmSheet,
  EmptyState,
  Loading,
  MenuThumb,
  PaymentBadge,
  Sheet,
  StatusBadge,
  Stepper,
  btnPrimary,
  btnSecondary,
  card,
  cx,
  input,
} from '../../components/ui';

function playSoftChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Abaikan jika browser memblokir autoplay audio
  }
}

function PrintableReceipt({ order }) {
  if (!order) return null;
  return (
    <div className="print-area hidden print:block print:p-6 print:text-black">
      <div className="mx-auto max-w-[300px] font-mono text-xs">
        <p className="text-center text-sm font-bold">WEDANG UWUH BU NGADI</p>
        <p className="text-center">Jl. Patuk–Tawang KM 4, Gunungkidul</p>
        <hr className="my-2 border-dashed border-black" />
        <p>Kode : {order.code}</p>
        <p>Meja : {order.tableName}</p>
        {order.customerName && <p>Nama : {order.customerName}</p>}
        <p>Waktu: {formatTime(order.createdAt)}</p>
        <hr className="my-2 border-dashed border-black" />
        {order.items.map((it, idx) => (
          <div key={idx} className="mb-1">
            <div className="flex justify-between">
              <span>
                {it.qty}x {lineName(it)}
              </span>
              <span>{formatRupiah(it.price * it.qty)}</span>
            </div>
            {it.note && <p className="text-[10px]">* {it.note}</p>}
          </div>
        ))}
        <hr className="my-2 border-dashed border-black" />
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
        <p className="mt-1">
          Bayar: {paymentMethodLabel(order)} ({order.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'})
        </p>
        <p className="mt-3 text-center">Matur nuwun sampun rawuh!</p>
      </div>
    </div>
  );
}

function OrderCard({ order, now, onSelect, onAdvance, onTogglePaid, onPrint }) {
  const next = nextStatus(order.status);
  const currentInfo = ORDER_STATUS[order.status] ?? ORDER_STATUS.diterima;
  const needsQrisCheck = order.paymentStatus === 'menunggu_verifikasi';
  const isPaid = order.paymentStatus === 'lunas';

  return (
    <article
      className={cx(
        'rounded-[14px] border bg-kertas p-4 shadow-soft transition-colors',
        needsQrisCheck ? 'border-[#e6b566] ring-1 ring-[#f2d6b0]' : 'border-kopi-200 hover:border-kopi-300',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(order)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[16px] font-bold text-kopi-950">{order.tableName}</span>
            {order.orderType === 'bungkus' && (
              <span className="rounded-full bg-kertas-tua px-2 py-0.5 text-[11px] font-semibold text-terakota-800">
                Bungkus
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-kopi-600">
            <strong className="font-semibold text-kopi-800">{order.code}</strong>
            {order.customerName ? ` · ${order.customerName}` : ''}
          </p>
        </button>

        <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-kopi-600">
          <Clock strokeWidth={1.75} className="size-3.5" aria-hidden="true" />
          {timeAgo(order.createdAt, now)}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-[13px] text-kopi-800">
        {order.items.map((it, idx) => (
          <li key={`${it.menuId}-${it.choiceId}-${idx}`}>
            <span className="font-semibold text-kopi-950">{it.qty}×</span> {lineName(it)}
            {it.note && <span className="block pl-4 text-xs text-terakota-700">Catatan: {it.note}</span>}
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="mt-2.5 rounded-[10px] bg-[#fdf4e7] px-3 py-1.5 text-xs font-medium text-[#8a450b]">
          Catatan: {order.note}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-kopi-100 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <PaymentBadge status={order.paymentStatus} />
          <span className="text-xs font-medium text-kopi-600">{paymentMethodLabel(order)}</span>
        </div>
        <span className="text-[14px] font-bold tabular-nums text-kopi-950">{formatRupiah(order.total)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onTogglePaid(order)}
          className={cx(
            'min-h-[44px] flex-1 rounded-[10px] border px-3 text-xs font-semibold transition-colors',
            needsQrisCheck
              ? 'border-[#d9942c] bg-[#fdf4e7] text-[#8a450b] hover:bg-[#fae8cc]'
              : isPaid
                ? 'border-kopi-200 bg-kopi-50 text-kopi-700 hover:bg-kopi-100'
                : 'border-kopi-200 bg-kertas text-kopi-900 hover:bg-kopi-100',
          )}
        >
          {needsQrisCheck ? 'Konfirmasi QRIS' : isPaid ? 'Batalkan lunas' : 'Tandai lunas'}
        </button>

        <button
          type="button"
          onClick={() => onPrint(order)}
          className="grid size-[44px] shrink-0 place-items-center rounded-[10px] border border-kopi-200 bg-kertas text-kopi-700 hover:bg-kopi-100"
          aria-label={`Cetak struk ${order.code}`}
        >
          <Printer strokeWidth={1.75} className="size-4" />
        </button>

        {next && (
          <button
            type="button"
            onClick={() => onAdvance(order, next)}
            className="min-h-[44px] flex-1 rounded-[10px] bg-terakota-700 px-3 text-xs font-semibold text-kertas transition-colors hover:bg-terakota-800"
          >
            {currentInfo.action}
          </button>
        )}
      </div>
    </article>
  );
}

function OrderDetailSheet({ order, tables, onClose, onStatus, onPayment, onChangeTable, onCancel, onPrint }) {
  const [tableCode, setTableCode] = useState(order?.tableCode ?? '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (order) setTableCode(order.tableCode);
  }, [order]);

  if (!order) return null;

  const prev = prevStatus(order.status);
  const next = nextStatus(order.status);
  const currentInfo = ORDER_STATUS[order.status] ?? ORDER_STATUS.diterima;

  const saveTable = async () => {
    if (!tableCode || tableCode === order.tableCode) return;
    setBusy(true);
    try {
      await onChangeTable(order, tableCode);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={Boolean(order)}
      onClose={onClose}
      title={`${order.tableName} · ${order.code}`}
      subtitle={`${order.customerName || 'Pelanggan'} · Masuk pukul ${formatTime(order.createdAt)}`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
          <span className="rounded-full bg-kopi-100 px-2.5 py-1 text-xs font-medium text-kopi-700">
            {paymentMethodLabel(order)}
          </span>
        </div>

        {/* Rincian item */}
        <ul className="divide-y divide-kopi-100 rounded-[14px] border border-kopi-200 bg-kopi-50/50 px-4 text-sm">
          {order.items.map((it, idx) => (
            <li key={idx} className="py-2.5">
              <div className="flex justify-between gap-2">
                <span className="text-kopi-900">
                  <strong>{it.qty}×</strong> {lineName(it)}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{formatRupiah(it.price * it.qty)}</span>
              </div>
              {it.note && <p className="mt-0.5 text-xs text-terakota-700">Catatan: {it.note}</p>}
            </li>
          ))}
          <li className="flex justify-between py-3 font-bold text-kopi-950">
            <span>Total</span>
            <span className="tabular-nums">{formatRupiah(order.total)}</span>
          </li>
        </ul>

        {order.note && (
          <p className="rounded-[12px] bg-[#fdf4e7] px-3.5 py-2.5 text-xs font-medium text-[#8a450b]">
            Catatan umum: {order.note}
          </p>
        )}

        {/* Koreksi nomor meja (Project Plan hal. 16 wajib) */}
        {order.orderType !== 'bungkus' && tables?.length > 0 && (
          <div className="rounded-[14px] border border-kopi-200 p-3.5">
            <label htmlFor="change-table-select" className="block text-xs font-semibold text-kopi-800">
              Koreksi nomor meja (bila QR tertukar)
            </label>
            <div className="mt-2 flex gap-2">
              <select
                id="change-table-select"
                value={tableCode}
                onChange={(e) => setTableCode(e.target.value)}
                className={cx(input, 'min-h-[44px] flex-1')}
              >
                {tables.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.code} — {t.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy || tableCode === order.tableCode}
                onClick={saveTable}
                className={cx(btnSecondary, 'min-h-[44px] shrink-0 px-4')}
              >
                Simpan meja
              </button>
            </div>
          </div>
        )}

        {/* Aksi status & pembayaran */}
        <div className="space-y-2.5 border-t border-kopi-200 pt-4">
          {order.status !== 'dibatalkan' && (
            <div className="flex flex-wrap gap-2">
              {prev && (
                <button
                  type="button"
                  onClick={() => onStatus(order, prev)}
                  className={cx(btnSecondary, 'flex-1')}
                >
                  <Undo2 strokeWidth={1.75} className="size-4" aria-hidden="true" />
                  Kembali ke {ORDER_STATUS[prev].label}
                </button>
              )}
              {next && (
                <button
                  type="button"
                  onClick={() => onStatus(order, next)}
                  className={cx(btnPrimary, 'flex-1')}
                >
                  {currentInfo.action}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPayment(order)}
              className={cx(btnSecondary, 'flex-1')}
            >
              <Check strokeWidth={1.75} className="size-4 text-terakota-700" aria-hidden="true" />
              {order.paymentStatus === 'lunas' ? 'Ubah ke Belum bayar' : `Tandai lunas (${formatRupiah(order.total)})`}
            </button>
            <button type="button" onClick={() => onPrint(order)} className={btnSecondary}>
              <Printer strokeWidth={1.75} className="size-4" aria-hidden="true" />
              Struk
            </button>
          </div>

          {order.status !== 'dibatalkan' && order.status !== 'selesai' && (
            <button
              type="button"
              onClick={() => onCancel(order)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#f5c7c2] bg-[#fdf1f0] text-sm font-semibold text-[#b42318] hover:bg-[#fbe2df]"
            >
              <XCircle strokeWidth={1.75} className="size-4" aria-hidden="true" />
              Batalkan pesanan
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

// Mode POS ringkas untuk pesanan bungkus langsung di kasir
function WalkInPosView({ menu, staffName, onCreated }) {
  const [cat, setCat] = useState('semua');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('kasir');
  const [cashReceived, setCashReceived] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const visibleMenu = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (menu ?? []).filter((m) => {
      if (!m.available) return false;
      if (cat !== 'semua' && m.category !== cat) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q);
    });
  }, [menu, cat, query]);

  const lines = useMemo(() => cartLines(menu ?? [], cart), [menu, cart]);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const cashNum = Number(cashReceived) || 0;
  const change = paymentMethod === 'kasir' && cashNum >= total ? cashNum - total : 0;

  const setQty = (key, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty > 0) next[key] = qty;
      else delete next[key];
      return next;
    });
  };

  const submitWalkIn = async (e) => {
    e.preventDefault();
    if (lines.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const order = await createOrder({
        orderType: 'bungkus',
        tableCode: 'BUNGKUS',
        customerName: customerName.trim() || 'Pelanggan Bungkus',
        note: note.trim(),
        paymentMethod,
        paymentStatus: 'lunas',
        cashReceived: paymentMethod === 'kasir' && cashNum > 0 ? cashNum : total,
        cashChange: change,
        cashierName: staffName,
        items: lines.map((l) => ({ menuId: l.menuId, choiceId: l.choiceId, qty: l.qty })),
      });
      setCart({});
      setCustomerName('');
      setNote('');
      setCashReceived('');
      onCreated(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_380px]">
      {/* Katalog cepat kasir */}
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              strokeWidth={1.75}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-kopi-500"
              aria-hidden="true"
            />
            <label htmlFor="pos-search" className="sr-only">
              Cari menu di kasir
            </label>
            <input
              id="pos-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari wedang, kopi, makanan…"
              className={cx(input, 'pl-10')}
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[{ id: 'semua', shortName: 'Semua' }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cx(
                'min-h-[44px] shrink-0 rounded-[10px] border px-3.5 text-xs font-semibold transition-colors',
                cat === c.id
                  ? 'border-terakota-700 bg-terakota-700 text-kertas'
                  : 'border-kopi-200 bg-kertas text-kopi-800 hover:bg-kopi-100',
              )}
            >
              {c.shortName}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMenu.map((item) => {
            const defaultChoice = item.option?.choices[0]?.id ?? null;
            const key = cartKey(item.id, defaultChoice);
            const qty = cart[key] ?? 0;
            return (
              <div key={item.id} className={cx(card, 'flex items-center gap-3 p-3')}>
                <MenuThumb item={item} className="size-[60px]" width={60} height={60} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-kopi-950">{item.name}</p>
                  <p className="text-xs font-semibold tabular-nums text-terakota-700">
                    {formatRupiah(item.price)}
                  </p>
                  <div className="mt-2">
                    {qty > 0 ? (
                      <Stepper value={qty} onChange={(next) => setQty(key, next)} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setQty(key, 1)}
                        className="min-h-[40px] rounded-[10px] border border-kopi-200 bg-kopi-50 px-3 text-xs font-semibold text-kopi-900 hover:border-terakota-400 hover:bg-terakota-50"
                      >
                        + Tambah
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Panel ringkasan bungkus */}
      <aside className={cx(card, 'h-fit p-5')}>
        <div className="flex items-center justify-between border-b border-kopi-200 pb-3">
          <h2 className="font-display text-[22px] font-bold text-kopi-950">Pesanan Bungkus</h2>
          {lines.length > 0 && (
            <button
              type="button"
              onClick={() => setCart({})}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-[8px] px-2 text-xs font-semibold text-[#b42318] hover:bg-[#fdf1f0]"
            >
              <Trash2 strokeWidth={1.75} className="size-3.5" aria-hidden="true" /> Kosongkan
            </button>
          )}
        </div>

        <form onSubmit={submitWalkIn} className="mt-4 space-y-4">
          <div>
            <label htmlFor="pos-customer" className="block text-xs font-semibold text-kopi-800">
              Nama pelanggan
            </label>
            <input
              id="pos-customer"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Mas Dimas"
              className={cx(input, 'mt-1 min-h-[44px]')}
            />
          </div>

          {lines.length === 0 ? (
            <p className="rounded-[12px] bg-kopi-50 px-4 py-6 text-center text-xs text-kopi-600">
              Pilih menu di sebelah kiri untuk mencatat pesanan bungkus.
            </p>
          ) : (
            <ul className="divide-y divide-kopi-100 text-sm">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-kopi-900">{lineName(l)}</p>
                    <p className="text-xs tabular-nums text-kopi-600">
                      {l.qty}× {formatRupiah(l.price)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">{formatRupiah(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
          )}

          <div>
            <label htmlFor="pos-note" className="block text-xs font-semibold text-kopi-800">
              Catatan bungkus (opsional)
            </label>
            <input
              id="pos-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mis. gula dipisah, bungkus rapat"
              className={cx(input, 'mt-1 min-h-[44px]')}
            />
          </div>

          {/* 2 metode bayar konsisten */}
          <fieldset>
            <legend className="text-xs font-semibold text-kopi-800">Metode bayar</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { id: 'kasir', label: 'Tunai Kasir', icon: Banknote },
                { id: 'qris', label: 'QRIS Kedai', icon: QrCode },
              ].map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className={cx(
                    'flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-3 text-xs font-semibold transition-colors',
                    paymentMethod === id
                      ? 'border-terakota-700 bg-terakota-50 text-terakota-800'
                      : 'border-kopi-200 bg-kertas text-kopi-700',
                  )}
                >
                  <input
                    type="radio"
                    name="posPayment"
                    value={id}
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="sr-only"
                  />
                  <Icon strokeWidth={1.75} className="size-4" aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {paymentMethod === 'kasir' && total > 0 && (
            <div>
              <label htmlFor="pos-cash" className="block text-xs font-semibold text-kopi-800">
                Uang diterima (opsional untuk hitung kembalian)
              </label>
              <input
                id="pos-cash"
                type="number"
                min={0}
                step={1000}
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={String(total)}
                className={cx(input, 'mt-1 min-h-[44px]')}
              />
              {cashNum >= total && (
                <p className="mt-1 text-xs font-semibold text-[#166534]">
                  Kembalian: {formatRupiah(change)}
                </p>
              )}
            </div>
          )}

          <div className="flex items-baseline justify-between border-t border-kopi-200 pt-3">
            <span className="text-sm font-semibold text-kopi-800">Total tagihan</span>
            <span className="text-[20px] font-bold tabular-nums text-terakota-800">{formatRupiah(total)}</span>
          </div>

          {error && (
            <p className="text-xs font-medium text-[#b42318]" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy || lines.length === 0} className={cx(btnPrimary, 'w-full')}>
            {busy ? 'Menyimpan…' : 'Catat pesanan & tandai lunas'}
          </button>
        </form>
      </aside>
    </div>
  );
}

export default function CashierPage() {
  const { data: orders, loading } = useOrders();
  const { data: menu } = useMenu();
  const { data: tables } = useTables();
  const online = useOnline();
  const now = useNow(30000);
  const staff = getStaffSession();

  const [mode, setMode] = useState('antrean'); // 'antrean' | 'pos'
  const [view, setView] = useState('status'); // 'status' | 'meja' | 'selesai'
  const [typeFilter, setTypeFilter] = useState('semua'); // 'semua' | 'meja' | 'bungkus'
  const [stationFilter, setStationFilter] = useState('semua'); // 'semua' | 'minuman' | 'makanan'
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [toast, setToast] = useState('');

  const menuCatMap = useMemo(
    () => new Map((menu ?? []).map((m) => [m.id, m.category])),
    [menu],
  );

  // Bunyi notifikasi lembut saat pesanan baru masuk
  const prevCountRef = useRef(null);
  useEffect(() => {
    if (!orders) return;
    if (prevCountRef.current !== null && orders.length > prevCountRef.current) {
      const latest = orders[orders.length - 1];
      if (soundOn) playSoftChime();
      setToast(`Pesanan baru masuk dari ${latest.tableName} (${latest.code})`);
    }
    prevCountRef.current = orders.length;
  }, [orders, soundOn]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredOrders = useMemo(() => {
    return (orders ?? []).filter((o) => {
      if (typeFilter === 'meja' && o.orderType === 'bungkus') return false;
      if (typeFilter === 'bungkus' && o.orderType !== 'bungkus') return false;
      if (stationFilter !== 'semua') {
        const hasMatch = o.items.some((it) => {
          const cat = menuCatMap.get(it.menuId);
          const isDrink = DRINK_CATEGORIES.has(cat);
          return stationFilter === 'minuman' ? isDrink : !isDrink;
        });
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [orders, typeFilter, stationFilter, menuCatMap]);

  const activeOrders = filteredOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const finishedOrders = filteredOrders
    .filter((o) => o.status === 'selesai' || o.status === 'dibatalkan')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Kelompokkan pesanan aktif per meja (untuk rombongan dari banyak HP — Project Plan wajib!)
  const byTable = useMemo(() => {
    const groups = new Map();
    for (const o of activeOrders) {
      const prev = groups.get(o.tableCode) ?? {
        tableCode: o.tableCode,
        tableName: o.tableName,
        orders: [],
        total: 0,
        unpaidTotal: 0,
      };
      prev.orders.push(o);
      prev.total += o.total;
      if (o.paymentStatus !== 'lunas') prev.unpaidTotal += o.total;
      groups.set(o.tableCode, prev);
    }
    return [...groups.values()];
  }, [activeOrders]);

  const selectedOrder = (orders ?? []).find((o) => o.id === selectedId) ?? null;

  const handleAdvance = async (order, targetStatus) => {
    await updateOrderStatus(order.id, targetStatus);
  };

  const handleTogglePaid = async (order) => {
    const nextPay = order.paymentStatus === 'lunas' ? 'belum_bayar' : 'lunas';
    await setPaymentStatus(order.id, nextPay);
  };

  const handleChangeTable = async (order, newTableCode) => {
    await updateOrderTable(order.id, newTableCode);
    setToast(`Pesanan ${order.code} dipindahkan ke ${newTableCode}.`);
  };

  const handlePrint = (order) => {
    setPrintOrder(order);
    setTimeout(() => window.print(), 80);
  };

  if (loading) return <Loading text="Memuat layar kasir & dapur…" />;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header tunggal bersih (bebas double-header, hierarki tipografi tegas) */}
      <header className="no-print flex flex-col gap-4 border-b border-kopi-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-kopi-950">
            Kasir & Dapur
          </h1>
          <p className="mt-1 text-sm text-kopi-600">
            {activeOrders.length} pesanan aktif · Bertugas: {staff?.name ?? 'Kasir'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Indikator koneksi asli (useOnline) */}
          <span
            className={cx(
              'inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border px-3 text-xs font-semibold',
              online
                ? 'border-[#c2e4cc] bg-[#edf7f0] text-[#166534]'
                : 'border-[#f5c7c2] bg-[#fdf1f0] text-[#b42318]',
            )}
          >
            {online ? <Wifi strokeWidth={1.75} className="size-3.5" aria-hidden="true" /> : <WifiOff strokeWidth={1.75} className="size-3.5" aria-hidden="true" />}
            {online ? 'Terhubung' : 'Offline'}
          </span>

          <button
            type="button"
            onClick={() => setSoundOn((v) => !v)}
            className="grid size-[44px] place-items-center rounded-[10px] border border-kopi-200 bg-kertas text-kopi-800 hover:bg-kopi-100"
            aria-label={soundOn ? 'Matikan bunyi notifikasi' : 'Nyalakan bunyi notifikasi'}
            aria-pressed={soundOn}
          >
            {soundOn ? <Bell strokeWidth={1.75} className="size-4 text-terakota-700" /> : <BellOff strokeWidth={1.75} className="size-4 text-kopi-500" />}
          </button>

          {/* Switcher mode Antrean QR vs Pesan Bungkus */}
          <div className="inline-flex rounded-[12px] border border-kopi-200 bg-kertas p-1">
            <button
              type="button"
              onClick={() => setMode('antrean')}
              className={cx(
                'inline-flex min-h-[40px] items-center gap-1.5 rounded-[9px] px-3.5 text-xs font-semibold transition-colors',
                mode === 'antrean' ? 'bg-terakota-700 text-kertas' : 'text-kopi-700 hover:text-kopi-950',
              )}
            >
              <ChefHat strokeWidth={1.75} className="size-4" aria-hidden="true" />
              Antrean ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setMode('pos')}
              className={cx(
                'inline-flex min-h-[40px] items-center gap-1.5 rounded-[9px] px-3.5 text-xs font-semibold transition-colors',
                mode === 'pos' ? 'bg-terakota-700 text-kertas' : 'text-kopi-700 hover:text-kopi-950',
              )}
            >
              <ShoppingBag strokeWidth={1.75} className="size-4" aria-hidden="true" />
              Pesan Bungkus
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div
          role="status"
          className="no-print mt-4 flex items-center justify-between gap-2 rounded-[12px] border border-terakota-200 bg-terakota-50 px-4 py-3 text-sm font-medium text-terakota-900"
        >
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} className="text-xs font-semibold underline">
            Tutup
          </button>
        </div>
      )}

      {mode === 'pos' ? (
        <WalkInPosView
          menu={menu}
          staffName={staff?.name ?? 'Kasir'}
          onCreated={(order) => {
            setMode('antrean');
            setToast(`Pesanan bungkus ${order.code} dicatat dan masuk antrean dapur.`);
          }}
        />
      ) : (
        <div className="no-print mt-4">
          {/* Toolbar ringkas: di HP 1 baris tab + tombol Saring agar kartu pesanan #1 langsung terlihat */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex rounded-[10px] border border-kopi-200 bg-kertas p-1">
              {[
                { id: 'status', label: 'Per status' },
                { id: 'meja', label: 'Per meja' },
                { id: 'selesai', label: `Selesai (${finishedOrders.length})` },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={cx(
                    'min-h-[38px] whitespace-nowrap rounded-[8px] px-3 text-xs font-semibold transition-colors',
                    view === v.id ? 'bg-kopi-900 text-kertas' : 'text-kopi-700 hover:text-kopi-950',
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className={cx(
                'inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border px-3 text-xs font-semibold md:hidden',
                stationFilter !== 'semua' || typeFilter !== 'semua'
                  ? 'border-terakota-700 bg-terakota-50 text-terakota-800'
                  : 'border-kopi-200 bg-kertas text-kopi-800',
              )}
            >
              <SlidersHorizontal strokeWidth={1.75} className="size-3.5" aria-hidden="true" />
              Saring
              {(stationFilter !== 'semua' || typeFilter !== 'semua') && ' •'}
            </button>

            <div className={cx('w-full flex-wrap items-center gap-2 md:flex md:w-auto', filtersOpen ? 'flex' : 'hidden')}>
              {/* Filter stasiun dapur (Semua / Minuman / Makanan) */}
              <div className="inline-flex rounded-[10px] border border-kopi-200 bg-kertas p-1">
                {[
                  { id: 'semua', label: 'Semua dapur' },
                  { id: 'minuman', label: 'Minuman' },
                  { id: 'makanan', label: 'Makanan' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStationFilter(st.id)}
                    className={cx(
                      'min-h-[38px] whitespace-nowrap rounded-[8px] px-3 text-xs font-semibold transition-colors',
                      stationFilter === st.id ? 'bg-kopi-900 text-kertas' : 'text-kopi-700 hover:text-kopi-950',
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Filter meja vs bungkus */}
              <div className="inline-flex rounded-[10px] border border-kopi-200 bg-kertas p-1">
                {[
                  { id: 'semua', label: 'Semua', icon: null },
                  { id: 'meja', label: 'Meja QR', icon: Utensils },
                  { id: 'bungkus', label: 'Bungkus', icon: ShoppingBag },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTypeFilter(id)}
                    className={cx(
                      'inline-flex min-h-[38px] items-center gap-1.5 whitespace-nowrap rounded-[8px] px-3 text-xs font-semibold transition-colors',
                      typeFilter === id ? 'bg-terakota-50 text-terakota-800' : 'text-kopi-700 hover:text-kopi-950',
                    )}
                  >
                    {Icon && <Icon strokeWidth={1.75} className="size-3.5" aria-hidden="true" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tampilan 1: Kanban 3 kolom status */}
          {view === 'status' && (
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {ACTIVE_STATUSES.map((st) => {
                const info = ORDER_STATUS[st];
                const colOrders = activeOrders
                  .filter((o) => o.status === st)
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                return (
                  <section
                    key={st}
                    className="flex flex-col rounded-[18px] border border-kopi-200 bg-kopi-100/55 p-3.5"
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <h2 className="flex items-center gap-2 text-[15px] font-bold text-kopi-950">
                        <span className={cx('size-2.5 rounded-full', info.dot)} aria-hidden="true" />
                        {info.label}
                      </h2>
                      <span className="grid min-w-[26px] place-items-center rounded-full bg-kertas px-2 py-0.5 text-xs font-bold tabular-nums text-kopi-800">
                        {colOrders.length}
                      </span>
                    </div>

                    {colOrders.length === 0 ? (
                      <p className="py-10 text-center text-xs font-medium text-kopi-600">
                        Belum ada pesanan di tahap ini
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {colOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            now={now}
                            onSelect={(o) => setSelectedId(o.id)}
                            onAdvance={handleAdvance}
                            onTogglePaid={handleTogglePaid}
                            onPrint={handlePrint}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {/* Tampilan 2: Terkelompok per meja (mendukung rombongan banyak HP) */}
          {view === 'meja' && (
            <div className="mt-5">
              {byTable.length === 0 ? (
                <EmptyState icon={Users} title="Belum ada meja aktif">
                  Pesanan yang masuk dari QR meja akan otomatis dikelompokkan di sini.
                </EmptyState>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {byTable.map((group) => (
                    <section key={group.tableCode} className={cx(card, 'p-5')}>
                      <div className="flex items-start justify-between gap-2 border-b border-kopi-200 pb-3">
                        <div>
                          <h2 className="font-display text-[24px] font-bold leading-tight text-kopi-950">
                            {group.tableName}
                          </h2>
                          <p className="text-xs text-kopi-600">
                            {group.orders.length} pesanan ·{' '}
                            {group.orders.reduce((s, o) => s + countItems(o.items), 0)} item
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[18px] font-bold tabular-nums text-kopi-950">
                            {formatRupiah(group.total)}
                          </p>
                          {group.unpaidTotal > 0 ? (
                            <p className="text-xs font-semibold text-[#b42318]">
                              Belum lunas: {formatRupiah(group.unpaidTotal)}
                            </p>
                          ) : (
                            <p className="text-xs font-semibold text-[#166534]">Semua lunas</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        {group.orders.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setSelectedId(o.id)}
                            className="flex w-full items-center justify-between gap-2 rounded-[12px] border border-kopi-200/80 bg-kopi-50/70 px-3.5 py-3 text-left hover:border-terakota-300"
                          >
                            <div>
                              <p className="text-sm font-semibold text-kopi-950">
                                {o.code} · {o.customerName || 'Pelanggan'}
                              </p>
                              <p className="text-xs text-kopi-600">
                                {countItems(o.items)} item · {formatRupiah(o.total)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <PaymentBadge status={o.paymentStatus} />
                              <StatusBadge status={o.status} />
                            </div>
                          </button>
                        ))}
                      </div>

                      {group.unpaidTotal > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            Promise.all(
                              group.orders
                                .filter((o) => o.paymentStatus !== 'lunas')
                                .map((o) => setPaymentStatus(o.id, 'lunas')),
                            )
                          }
                          className={cx(btnPrimary, 'mt-4 w-full')}
                        >
                          Tandai seluruh meja lunas ({formatRupiah(group.unpaidTotal)})
                        </button>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tampilan 3: Riwayat selesai & dibatalkan */}
          {view === 'selesai' && (
            <div className="mt-5">
              {finishedOrders.length === 0 ? (
                <EmptyState icon={Check} title="Belum ada pesanan selesai">
                  Pesanan yang sudah diantar atau dibatalkan akan tercatat di sini.
                </EmptyState>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {finishedOrders.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedId(o.id)}
                      className={cx(card, 'p-4 text-left hover:border-terakota-300')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-kopi-950">
                            {o.tableName} · {o.code}
                          </p>
                          <p className="text-xs text-kopi-600">
                            {o.customerName || 'Pelanggan'} · {formatTime(o.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-kopi-100 pt-2.5 text-sm">
                        <PaymentBadge status={o.paymentStatus} />
                        <span className="font-bold tabular-nums">{formatRupiah(o.total)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Drawer detail pesanan (Ubah meja, undo status, batal, cetak) */}
      <OrderDetailSheet
        order={selectedOrder}
        tables={tables}
        onClose={() => setSelectedId(null)}
        onStatus={handleAdvance}
        onPayment={handleTogglePaid}
        onChangeTable={handleChangeTable}
        onCancel={(o) => setCancelTarget(o)}
        onPrint={handlePrint}
      />

      <ConfirmSheet
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return;
          await updateOrderStatus(cancelTarget.id, 'dibatalkan');
          setSelectedId(null);
          setToast(`Pesanan ${cancelTarget.code} dibatalkan.`);
        }}
        title={`Batalkan pesanan ${cancelTarget?.code ?? ''}?`}
        description="Status pesanan akan berubah menjadi Dibatalkan dan dipindahkan ke tab Selesai."
        confirmLabel="Ya, batalkan"
        danger
      />

      <PrintableReceipt order={printOrder} />
    </div>
  );
}

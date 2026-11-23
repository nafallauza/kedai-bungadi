// MOCK API: semua data disimpan di localStorage browser supaya halaman bisa dicoba tanpa backend.
// Sinkron "real-time" antartab memakai BroadcastChannel, jadi hanya berlaku di browser yang sama.
// Saat backend siap, ganti isi tiap fungsi dengan fetch ke endpoint yang tertulis di komentarnya.
// Bentuk data yang dikembalikan sebaiknya tetap sama supaya halaman tidak perlu diubah.
import { initialMenu, initialTables } from '../data/menu';
import { generateSalesHistory } from '../data/salesSample';
import { createId } from '../utils/format';

const KEY = {
  menu: 'bungadi.v4.menu',
  tables: 'bungadi.v4.tables',
  orders: 'bungadi.v4.orders',
  counter: 'bungadi.v4.counter',
};

const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('bungadi');
const listeners = new Set();
channel?.addEventListener('message', (e) => listeners.forEach((fn) => fn(e.data)));

// Dengarkan perubahan data ('menu' | 'tables' | 'orders'). Nanti diganti Socket.io dari backend.
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(type, payload) {
  const event = { type, payload };
  listeners.forEach((fn) => fn(event));
  channel?.postMessage(event);
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('Penyimpanan browser penuh atau diblokir.');
  }
}

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureOnline() {
  if (!navigator.onLine) {
    throw new Error('Koneksi internet terputus. Coba lagi setelah sinyal kembali.');
  }
}

// ---------- Menu ----------

// GET /api/menu
export async function getMenu() {
  await wait(150);
  const stored = read(KEY.menu, initialMenu);
  const imageLookup = new Map(initialMenu.map((m) => [m.id, m.image]));
  return stored.map((m) => ({
    ...m,
    image: m.image || imageLookup.get(m.id),
  }));
}

// POST /api/menu (baru) atau PUT /api/menu/:id (ubah)
export async function saveMenuItem(item) {
  ensureOnline();
  await wait();
  const name = item.name?.trim();
  const price = Number(item.price);
  if (!name) throw new Error('Nama menu wajib diisi.');
  if (!Number.isInteger(price) || price <= 0) throw new Error('Harga harus berupa angka lebih dari 0.');

  const menu = read(KEY.menu, initialMenu);
  const saved = {
    ...item,
    id: item.id ?? createId(),
    name,
    price,
    description: item.description?.trim() ?? '',
    tags: item.tags ?? [],
    available: item.available ?? true,
  };
  const exists = menu.some((m) => m.id === saved.id);
  const next = exists ? menu.map((m) => (m.id === saved.id ? saved : m)) : [...menu, saved];
  write(KEY.menu, next);
  emit('menu');
  return saved;
}

// DELETE /api/menu/:id
export async function deleteMenuItem(id) {
  ensureOnline();
  await wait();
  write(KEY.menu, read(KEY.menu, initialMenu).filter((m) => m.id !== id));
  emit('menu');
}

// ---------- Meja ----------

// GET /api/tables
export async function getTables() {
  await wait(100);
  return read(KEY.tables, initialTables);
}

// GET /api/tables/:code
export async function getTable(code) {
  const tables = await getTables();
  return tables.find((t) => t.code.toLowerCase() === String(code).toLowerCase()) ?? null;
}

// POST /api/tables
export async function addTable(name) {
  ensureOnline();
  await wait();
  const tables = read(KEY.tables, initialTables);
  const lastNumber = Math.max(0, ...tables.map((t) => Number(t.code.slice(1)) || 0));
  const code = `M${String(lastNumber + 1).padStart(2, '0')}`;
  const table = { code, name: name?.trim() || `Meja ${lastNumber + 1}` };
  write(KEY.tables, [...tables, table]);
  emit('tables');
  return table;
}

// DELETE /api/tables/:code
export async function deleteTable(code) {
  ensureOnline();
  await wait();
  write(KEY.tables, read(KEY.tables, initialTables).filter((t) => t.code !== code));
  emit('tables');
}

// ---------- Pesanan ----------

function nextOrderCode(prefix = 'B') {
  const today = new Date().toDateString();
  const counter = read(KEY.counter, { date: today, n: 0 });
  const n = counter.date === today ? counter.n + 1 : 1;
  write(KEY.counter, { date: today, n });
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

function seedDemoOrdersIfEmpty() {
  const existing = read(KEY.orders, null);
  if (existing && existing.length > 0) return existing;
  const t1 = new Date(Date.now() - 6 * 60000).toISOString();
  const t2 = new Date(Date.now() - 3 * 60000).toISOString();
  const seeded = [
    {
      id: 'demo-meja-03',
      code: 'A27',
      orderType: 'meja',
      tableCode: 'M03',
      tableName: 'Meja 3',
      customerName: 'Rina',
      note: 'wedangnya tidak terlalu manis',
      items: [
        { menuId: 'wedang-uwuh', choiceId: 'panas', name: 'Wedang Uwuh', choice: 'Panas', price: 8000, qty: 2 },
        { menuId: 'nasi-pecel', choiceId: null, name: 'Nasi Pecel', choice: null, price: 15000, qty: 1 },
        { menuId: 'mendoan', choiceId: null, name: 'Mendoan', choice: null, price: 8000, qty: 1 },
      ],
      total: 39000,
      status: 'diproses',
      paymentMethod: 'qris',
      paymentBank: null,
      paymentStatus: 'belum_bayar',
      createdAt: t1,
      statusHistory: [
        { status: 'diterima', at: t1 },
        { status: 'diproses', at: t2 },
      ],
    },
    {
      id: 'demo-bun-042',
      code: 'BUN-042',
      orderType: 'bungkus',
      tableCode: 'BUNGKUS',
      tableName: 'Bungkus (Takeaway)',
      customerName: 'Mas Dimas (Bungkus)',
      cashierName: 'Kasir 1',
      packagingType: 'Kemasan Rapat + Kantong Ramah Lingkungan',
      note: 'Bungkus rapat untuk dibawa perjalanan',
      items: [
        { menuId: 'wedang-uwuh-bungadi', choiceId: 'panas', name: 'Wedang Uwuh Bu Ngadi', choice: 'Panas', price: 10000, qty: 1 },
        { menuId: 'kopi-bungadi', choiceId: null, name: 'Kopi Bu Ngadi', choice: null, price: 12000, qty: 1 },
        { menuId: 'nasi-pecel', choiceId: null, name: 'Nasi Pecel', choice: null, price: 15000, qty: 1 },
      ],
      total: 37000,
      status: 'diterima',
      paymentMethod: 'kasir',
      paymentBank: null,
      paymentStatus: 'lunas',
      cashReceived: 50000,
      cashChange: 13000,
      createdAt: t2,
      statusHistory: [{ status: 'diterima', at: t2 }],
    },
  ];
  write(KEY.orders, seeded);
  return seeded;
}

// POST /api/orders  body: { tableCode, orderType, customerName, note, items, paymentMethod, paymentBank, paymentStatus, cashReceived, cashChange, cashierName, packagingType }
// Harga dihitung ulang dari data menu (bukan dari browser pelanggan).
export async function createOrder({
  tableCode,
  orderType = 'meja',
  customerName,
  note,
  items,
  paymentMethod = 'kasir',
  paymentBank = null,
  paymentStatus = 'belum_bayar',
  cashReceived = null,
  cashChange = null,
  cashierName = null,
  packagingType = null,
}) {
  ensureOnline();
  await wait(350);

  const isTakeaway = orderType === 'bungkus' || String(tableCode).toUpperCase() === 'BUNGKUS';
  let resolvedTable = { code: 'BUNGKUS', name: 'Bungkus (Takeaway)' };
  if (!isTakeaway) {
    const table = await getTable(tableCode);
    if (!table) throw new Error('Meja tidak dikenali. Silakan scan ulang QR code di meja.');
    resolvedTable = table;
  }

  const menu = await getMenu();
  const lines = items
    .filter((it) => it.qty > 0)
    .map((it) => {
      const m = menu.find((x) => x.id === it.menuId);
      if (!m) throw new Error('Ada menu yang sudah tidak tersedia. Muat ulang halaman menu.');
      if (!m.available) throw new Error(`${m.name} sedang habis. Hapus dari keranjang dulu, ya.`);
      const choice = m.option?.choices.find((c) => c.id === it.choiceId) ?? m.option?.choices[0] ?? null;
      return {
        menuId: m.id,
        choiceId: choice?.id ?? null,
        name: m.name,
        choice: choice?.name ?? null,
        price: choice?.price ?? m.price,
        qty: it.qty,
      };
    });
  if (lines.length === 0) throw new Error('Keranjang masih kosong.');

  const now = new Date().toISOString();
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const order = {
    id: createId(),
    code: nextOrderCode(isTakeaway ? 'BUN' : 'B'),
    orderType: isTakeaway ? 'bungkus' : 'meja',
    tableCode: resolvedTable.code,
    tableName: resolvedTable.name,
    customerName: customerName?.trim() || (isTakeaway ? 'Pelanggan Bungkus' : ''),
    note: note?.trim() || '',
    items: lines,
    total,
    status: 'diterima',
    paymentMethod,
    paymentBank: paymentMethod === 'bank' ? paymentBank || 'BCA' : null,
    paymentStatus,
    cashReceived,
    cashChange,
    cashierName,
    packagingType: isTakeaway ? packagingType || 'Kemasan Standar + Kantong Ramah Lingkungan' : null,
    createdAt: now,
    statusHistory: [{ status: 'diterima', at: now }],
  };
  const currentOrders = seedDemoOrdersIfEmpty();
  write(KEY.orders, [...currentOrders, order]);
  emit('orders', { kind: 'created', order });
  return order;
}

// GET /api/orders
export async function getOrders() {
  await wait(120);
  return seedDemoOrdersIfEmpty();
}

// GET /api/orders/:id
export async function getOrder(id) {
  const orders = await getOrders();
  return orders.find((o) => o.id === id) ?? null;
}

function updateOrder(id, change) {
  const orders = seedDemoOrdersIfEmpty();
  const order = orders.find((o) => o.id === id);
  if (!order) throw new Error('Pesanan tidak ditemukan.');
  const updated = change(order);
  write(KEY.orders, orders.map((o) => (o.id === id ? updated : o)));
  emit('orders', { kind: 'updated', order: updated });
  return updated;
}

// PATCH /api/orders/:id/status  body: { status }
export async function updateOrderStatus(id, status) {
  ensureOnline();
  await wait();
  return updateOrder(id, (o) => ({
    ...o,
    status,
    statusHistory: [...o.statusHistory, { status, at: new Date().toISOString() }],
  }));
}

// PATCH /api/orders/:id/payment  body: { paymentStatus, ...extra }
export async function setPaymentStatus(id, paymentStatus, extra = {}) {
  ensureOnline();
  await wait();
  return updateOrder(id, (o) => ({
    ...o,
    paymentStatus,
    ...extra,
  }));
}

// ---------- Data penjualan (nanti dari tim Data Science) ----------

// Gabungan riwayat contoh + pesanan yang dibuat lewat prototype ini
function salesRecords(days) {
  const since = Date.now() - days * 86400000;
  const live = read(KEY.orders, [])
    .filter((o) => o.status !== 'dibatalkan')
    .map((o) => ({ at: o.createdAt, items: o.items, total: o.total }));
  return [...generateSalesHistory(30), ...live].filter((s) => new Date(s.at).getTime() >= since);
}

// GET /api/analytics/best-sellers?limit=6
export async function getBestSellers(limit = 6) {
  await wait(150);
  const menu = read(KEY.menu, initialMenu);
  const qtyById = new Map();
  for (const sale of salesRecords(30)) {
    for (const it of sale.items) qtyById.set(it.menuId, (qtyById.get(it.menuId) ?? 0) + it.qty);
  }
  return menu
    .filter((m) => m.available && qtyById.has(m.id))
    .map((m) => ({ ...m, sold: qtyById.get(m.id) }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

// GET /api/analytics/summary?days=14
export async function getSalesSummary(days = 14) {
  await wait(200);
  const records = salesRecords(days);
  const byDay = new Map();
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 }));
  const byItem = new Map();

  for (let d = days - 1; d >= 0; d -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    byDay.set(date.toDateString(), { date: date.toISOString(), revenue: 0, orders: 0 });
  }
  for (const s of records) {
    const at = new Date(s.at);
    const day = byDay.get(at.toDateString());
    if (day) {
      day.revenue += s.total;
      day.orders += 1;
    }
    byHour[at.getHours()].orders += 1;
    for (const it of s.items) {
      const prev = byItem.get(it.menuId) ?? { menuId: it.menuId, name: it.name, qty: 0, revenue: 0 };
      prev.qty += it.qty;
      prev.revenue += it.qty * it.price;
      byItem.set(it.menuId, prev);
    }
  }

  const revenue = records.reduce((sum, s) => sum + s.total, 0);
  return {
    days,
    revenue,
    orders: records.length,
    averageOrder: records.length ? Math.round(revenue / records.length) : 0,
    daily: [...byDay.values()],
    hourly: byHour.filter((h) => h.hour >= 8 && h.hour <= 22),
    topItems: [...byItem.values()].sort((a, b) => b.qty - a.qty).slice(0, 8),
  };
}

// ---------- Asisten menu (nanti dari layanan AI tim AI Engineer) ----------

// POST /api/assistant/recommend  body: { people, budget, preferences }
// Versi contoh ini memakai aturan sederhana, bukan AI.
export async function askAssistant({ people, budget, preferences = [] }) {
  ensureOnline();
  await wait(700);
  const menu = read(KEY.menu, initialMenu).filter((m) => m.available);
  const best = await getBestSellers(menu.length);
  const rank = (m) => {
    const i = best.findIndex((b) => b.id === m.id);
    return i === -1 ? 999 : i;
  };
  const byRank = (list) => [...list].sort((a, b) => rank(a) - rank(b));
  const minPrice = (m) => Math.min(...(m.option?.choices.map((c) => c.price ?? m.price) ?? [m.price]));
  const byPrice = (list) => [...list].sort((a, b) => minPrice(a) - minPrice(b));
  const has = (p) => preferences.includes(p);

  // Minuman andalan: wedang uwuh & rempah; jamu dingin ikut bila ingin yang segar
  const drinks = menu.filter((m) => m.category === 'wedang' || (has('dingin') && m.category === 'jamu'));
  const pickFoods = byRank(menu.filter((m) => m.category === (has('berat') ? 'makanan' : 'snack')));
  const drinkPrefs = has('dingin') && has('hangat') ? ['panas', 'es'] : [has('dingin') ? 'es' : 'panas'];

  // Pilih penyajian sesuai preferensi; makanan memakai pilihan pertama (goreng/rebus)
  const pick = (m, qty, pref) => {
    const c = m.option?.choices.find((x) => x.id === pref) ?? m.option?.choices[0];
    return { menuId: m.id, choiceId: c?.id ?? null, choice: c?.name ?? null, name: m.name, price: c?.price ?? m.price, qty };
  };
  const split = (list, total, prefs = []) => {
    if (list.length === 0 || total <= 0) return [];
    if (list.length === 1 || total === 1) return [pick(list[0], total, prefs[0])];
    const first = Math.ceil(total * 0.6);
    return [pick(list[0], first, prefs[0]), pick(list[1], total - first, prefs[1] ?? prefs[0])];
  };

  const foodQty = has('berat') ? people : Math.ceil(people / 3);
  // Dari rencana paling lengkap ke paling hemat; dipilih yang pertama masuk anggaran
  const plans = [
    [...split(byRank(drinks), people, drinkPrefs), ...split(pickFoods, foodQty)],
    [...split(byRank(drinks).slice(0, 1), people, drinkPrefs), ...split(byPrice(pickFoods), foodQty)],
    [...split(byPrice(drinks), people, drinkPrefs), ...split(byPrice(pickFoods), foodQty)],
    [...split(byPrice(drinks), people, drinkPrefs), ...split(byPrice(pickFoods), Math.ceil(people / 4))],
    split(byPrice(drinks), people, drinkPrefs),
  ];
  const totalOf = (plan) => plan.reduce((sum, it) => sum + it.price * it.qty, 0);
  const items = plans.find((p) => !budget || totalOf(p) <= budget) ?? plans[plans.length - 1];
  const total = totalOf(items);

  let reply = `Untuk ${people} orang, ini rekomendasi yang pas.`;
  if (budget && total > budget) {
    reply = `Anggaran Rp${budget.toLocaleString('id-ID')} belum cukup untuk ${people} orang. Ini pilihan paling hemat yang ada.`;
  } else if (budget && budget > total) {
    reply += ` Masih sisa Rp${(budget - total).toLocaleString('id-ID')} dari anggaran.`;
  } else if (budget) {
    reply += ' Pas dengan anggaranmu.';
  }
  return { reply, items, total };
}

// Hapus semua data demo dan kembali ke data contoh awal
export function resetDemoData() {
  Object.values(KEY).forEach((k) => localStorage.removeItem(k));
  emit('menu');
  emit('tables');
  emit('orders');
}

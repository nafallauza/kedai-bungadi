// MOCK API: menyimpan data di localStorage & sinkron antartab lewat BroadcastChannel.
// Ganti isi tiap fungsi dengan fetch ke endpoint backend (Node.js/Express + Socket.io + FastAPI AI) saat backend siap.
import { initialMenu, initialTables } from '../data/menu';
import { generateSalesHistory } from '../data/salesSample';
import { createId } from '../utils/format';

const KEY = {
  menu: 'bungadi.v5.menu',
  tables: 'bungadi.v5.tables',
  orders: 'bungadi.v5.orders',
  counter: 'bungadi.v5.counter',
};

const STAFF_AUTH_KEY = 'bungadi.v5.staffAuth';

const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('bungadi');
const listeners = new Set();
channel?.addEventListener('message', (e) => listeners.forEach((fn) => fn(e.data)));

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

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureOnline() {
  if (!navigator.onLine) {
    throw new Error('Koneksi internet terputus. Pesanan belum terkirim — coba lagi setelah sinyal kembali.');
  }
}

// ---------- Autentikasi staf (sementara lokal; nanti diganti JWT dari backend) ----------

export function getStaffSession() {
  try {
    return JSON.parse(sessionStorage.getItem(STAFF_AUTH_KEY));
  } catch {
    return null;
  }
}

export async function loginStaff({ username, password }) {
  await wait(220);
  const cleanUser = username?.trim().toLowerCase();
  const cleanPass = password?.trim();
  const accounts = {
    kasir1: { username: 'kasir1', name: 'Mbak Sari (Kasir 1)', role: 'kasir' },
    kasir2: { username: 'kasir2', name: 'Mas Bagus (Kasir 2)', role: 'kasir' },
    admin: { username: 'admin', name: 'Bu Ngadi (Pemilik)', role: 'admin' },
    bungadi: { username: 'bungadi', name: 'Pak Alfian (Pemilik)', role: 'admin' },
  };
  const validPass = cleanPass === 'bungadi2026' || cleanPass === '123456' || cleanPass === 'patuk';
  const account = accounts[cleanUser];
  if (!account || !validPass) {
    throw new Error('Nama pengguna atau kata sandi belum cocok. Gunakan akun staf yang tersedia.');
  }
  const session = { ...account, loggedInAt: new Date().toISOString() };
  sessionStorage.setItem(STAFF_AUTH_KEY, JSON.stringify(session));
  return session;
}

export function logoutStaff() {
  sessionStorage.removeItem(STAFF_AUTH_KEY);
}

// ---------- Menu ----------

// GET /api/menu
export async function getMenu() {
  await wait(100);
  const stored = read(KEY.menu, initialMenu);
  const imageLookup = new Map(initialMenu.map((m) => [m.id, m.image]));
  return stored.map((m) => ({
    ...m,
    image: m.image || imageLookup.get(m.id),
  }));
}

// POST /api/menu atau PUT /api/menu/:id
export async function saveMenuItem(item) {
  ensureOnline();
  await wait();
  const name = item.name?.trim();
  const price = Number(item.price);
  if (!name) throw new Error('Nama menu wajib diisi.');
  if (!Number.isInteger(price) || price <= 0) throw new Error('Harga harus berupa angka bulat lebih dari 0.');

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
  await wait(80);
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
  const table = { code, name: name?.trim() || `Meja ${lastNumber + 1}, lantai 2` };
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
  const t1 = new Date(Date.now() - 8 * 60000).toISOString();
  const t2 = new Date(Date.now() - 3 * 60000).toISOString();
  const seeded = [
    {
      id: 'demo-meja-03',
      code: 'A27',
      orderType: 'meja',
      tableCode: 'M03',
      tableName: 'Meja 3, lantai 2',
      customerName: 'Rina',
      note: 'Wedangnya tidak terlalu manis ya',
      items: [
        { menuId: 'wedang-uwuh-bungadi', choiceId: 'panas', name: 'Wedang Uwuh Bu Ngadi', choice: 'Panas', price: 10000, qty: 2, note: 'Gula dipisah' },
        { menuId: 'nasi-pecel', choiceId: null, name: 'Nasi Pecel', choice: null, price: 15000, qty: 1, note: '' },
        { menuId: 'mendoan', choiceId: null, name: 'Mendoan', choice: null, price: 8000, qty: 1, note: '' },
      ],
      total: 43000,
      status: 'diproses',
      paymentMethod: 'qris',
      paymentStatus: 'menunggu_verifikasi',
      createdAt: t1,
      statusHistory: [
        { status: 'diterima', at: t1 },
        { status: 'diproses', at: t2 },
      ],
    },
    {
      id: 'demo-meja-05',
      code: 'A28',
      orderType: 'meja',
      tableCode: 'M05',
      tableName: 'Meja 5, lantai 2',
      customerName: 'Rombongan Pak Hadi',
      note: 'Pesanan meja rombongan 6 orang',
      items: [
        { menuId: 'wedang-uwuh', choiceId: 'panas', name: 'Wedang Uwuh', choice: 'Panas', price: 8000, qty: 4, note: '' },
        { menuId: 'kombucha', choiceId: null, name: 'Kombucha', choice: null, price: 15000, qty: 2, note: '' },
        { menuId: 'mendoan', choiceId: null, name: 'Mendoan', choice: null, price: 8000, qty: 2, note: 'Sambal dipisah' },
      ],
      total: 78000,
      status: 'diterima',
      paymentMethod: 'kasir',
      paymentStatus: 'belum_bayar',
      createdAt: t2,
      statusHistory: [{ status: 'diterima', at: t2 }],
    },
    {
      id: 'demo-bun-042',
      code: 'BUN-042',
      orderType: 'bungkus',
      tableCode: 'BUNGKUS',
      tableName: 'Bungkus (Takeaway)',
      customerName: 'Mas Dimas',
      cashierName: 'Kasir 1',
      packagingType: 'Kemasan Rapat + Kantong Ramah Lingkungan',
      note: 'Bungkus rapat untuk dibawa perjalanan',
      items: [
        { menuId: 'madu-jeruk', choiceId: 'panas', name: 'Madu Jeruk', choice: 'Panas', price: 12000, qty: 1, note: '' },
        { menuId: 'kopi-bungadi', choiceId: null, name: 'Kopi Bu Ngadi', choice: null, price: 12000, qty: 1, note: '' },
        { menuId: 'nasi-pecel', choiceId: null, name: 'Nasi Pecel', choice: null, price: 15000, qty: 1, note: '' },
      ],
      total: 39000,
      status: 'diterima',
      paymentMethod: 'kasir',
      paymentStatus: 'lunas',
      cashReceived: 50000,
      cashChange: 11000,
      createdAt: t2,
      statusHistory: [{ status: 'diterima', at: t2 }],
    },
  ];
  write(KEY.orders, seeded);
  return seeded;
}

// POST /api/orders
export async function createOrder({
  tableCode,
  orderType = 'meja',
  customerName,
  note,
  items,
  paymentMethod = 'kasir',
  paymentStatus = 'belum_bayar',
  cashReceived = null,
  cashChange = null,
  cashierName = null,
  packagingType = null,
}) {
  ensureOnline();
  await wait(280);

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
        note: it.note?.trim() || '',
      };
    });
  if (lines.length === 0) throw new Error('Keranjang masih kosong.');

  const now = new Date().toISOString();
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const method = paymentMethod === 'qris' ? 'qris' : 'kasir';
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
    paymentMethod: method,
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
  await wait(100);
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

// PATCH /api/orders/:id/status
export async function updateOrderStatus(id, status) {
  ensureOnline();
  await wait(140);
  return updateOrder(id, (o) => ({
    ...o,
    status,
    statusHistory: [...o.statusHistory, { status, at: new Date().toISOString() }],
  }));
}

// PATCH /api/orders/:id/table — koreksi nomor meja bila QR tertukar (Project Plan hal. 16)
export async function updateOrderTable(id, tableCode) {
  ensureOnline();
  await wait(140);
  const table = await getTable(tableCode);
  if (!table) throw new Error('Nomor meja tidak terdaftar.');
  return updateOrder(id, (o) => ({
    ...o,
    orderType: 'meja',
    tableCode: table.code,
    tableName: table.name,
  }));
}

// PATCH /api/orders/:id/payment
export async function setPaymentStatus(id, paymentStatus, extra = {}) {
  ensureOnline();
  await wait(140);
  return updateOrder(id, (o) => ({
    ...o,
    paymentStatus,
    ...extra,
  }));
}

// ---------- Data penjualan & prediksi (tim Data Science & AI Engineer) ----------

function salesRecords(days) {
  const since = Date.now() - days * 86400000;
  const live = read(KEY.orders, [])
    .filter((o) => o.status !== 'dibatalkan')
    .map((o) => ({ at: o.createdAt, items: o.items, total: o.total }));
  return [...generateSalesHistory(30), ...live].filter((s) => new Date(s.at).getTime() >= since);
}

// GET /api/analytics/best-sellers?limit=6
export async function getBestSellers(limit = 6) {
  await wait(100);
  const menu = read(KEY.menu, initialMenu);
  const qtyById = new Map();
  for (const sale of salesRecords(30)) {
    for (const it of sale.items) qtyById.set(it.menuId, (qtyById.get(it.menuId) ?? 0) + it.qty);
  }
  return menu
    .filter((m) => m.available)
    .map((m) => ({ ...m, sold: qtyById.get(m.id) ?? 0 }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

// GET /api/analytics/summary?days=14
export async function getSalesSummary(days = 14) {
  await wait(150);
  const records = salesRecords(days);
  const byDay = new Map();
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 }));
  const byItem = new Map();
  let groupOrders = 0;

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
    const itemCount = s.items.reduce((sum, it) => sum + it.qty, 0);
    if (itemCount >= 6) groupOrders += 1;
    for (const it of s.items) {
      const prev = byItem.get(it.menuId) ?? { menuId: it.menuId, name: it.name, qty: 0, revenue: 0 };
      prev.qty += it.qty;
      prev.revenue += it.qty * it.price;
      byItem.set(it.menuId, prev);
    }
  }

  const revenue = records.reduce((sum, s) => sum + s.total, 0);
  const topItems = [...byItem.values()].sort((a, b) => b.qty - a.qty).slice(0, 8);

  // GET /api/ai/forecast — perkiraan kebutuhan bahan/porsi 7 hari ke depan (slot integrasi Model AI FastAPI)
  const scale = days > 0 ? 7 / days : 1;
  const forecast = topItems.slice(0, 5).map((item, idx) => {
    const projected = Math.max(12, Math.round(item.qty * scale * (1.08 - idx * 0.02)));
    const deltaPct = 6 + ((item.qty + idx * 3) % 11);
    return { menuId: item.menuId, name: item.name, projectedPortions: projected, deltaPct };
  });

  return {
    days,
    revenue,
    orders: records.length,
    groupOrders,
    averageOrder: records.length ? Math.round(revenue / records.length) : 0,
    daily: [...byDay.values()],
    hourly: byHour.filter((h) => h.hour >= 9 && h.hour <= 21),
    topItems,
    forecast,
  };
}

// ---------- Asisten menu (slot integrasi FastAPI + Gemini API tim AI Engineer) ----------

const OFF_TOPIC = /\b(politik|presiden|coding|python|javascript|matematika|skripsi|cuaca besok|saham|kripto|crypto|bola|film)\b/i;

// POST /api/assistant/recommend  body: { prompt, people, budget, preferences, exclude }
export async function askAssistant({ prompt = '', people = 4, budget = 0, preferences = [], exclude = [] }) {
  ensureOnline();
  await wait(450);

  if (prompt && OFF_TOPIC.test(prompt)) {
    return {
      reply:
        'Maaf, saya hanya membantu memilihkan menu dan menghitung estimasi anggaran untuk Wedang Uwuh Bu Ngadi. Sebutkan jumlah orang dan anggaranmu, ya.',
      items: [],
      total: 0,
      offTopic: true,
    };
  }

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
  const noCoffee = exclude.includes('kopi');

  const safeMenu = menu.filter((m) => !(noCoffee && (m.category === 'kopi' || m.tags?.includes('kopi'))));

  const drinks = safeMenu.filter(
    (m) =>
      m.category === 'wedang' ||
      m.category === 'teh' ||
      (has('dingin') && m.category === 'jamu') ||
      (!noCoffee && has('kopi') && m.category === 'kopi'),
  );
  const foods = safeMenu.filter((m) => (has('berat') ? m.category === 'makanan' : m.category === 'snack' || m.category === 'makanan'));
  const drinkPrefs = has('dingin') && has('hangat') ? ['panas', 'es'] : [has('dingin') ? 'es' : 'panas'];

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

  const foodQty = has('berat') ? people : Math.max(2, Math.ceil(people / 2.5));
  const rankedDrinks = byRank(drinks);
  const rankedFoods = byRank(foods);
  const plans = [
    [...split(rankedDrinks, people, drinkPrefs), ...split(rankedFoods, foodQty)],
    [...split(rankedDrinks.slice(0, 1), people, drinkPrefs), ...split(byPrice(foods), foodQty)],
    [...split(byPrice(drinks), people, drinkPrefs), ...split(byPrice(foods), foodQty)],
    [...split(byPrice(drinks), people, drinkPrefs), ...split(byPrice(foods), Math.ceil(people / 4))],
    split(byPrice(drinks), people, drinkPrefs),
  ];
  const totalOf = (plan) => plan.reduce((sum, it) => sum + it.price * it.qty, 0);
  const items = plans.find((p) => !budget || totalOf(p) <= budget) ?? plans[plans.length - 1];
  const total = totalOf(items);

  const noteSuffix = noCoffee ? ' (tanpa kopi)' : '';
  let reply = `Usulan untuk ${people} orang${noteSuffix}. Semua menu tersedia hari ini.`;
  if (budget && total > budget) {
    reply = `Anggaran Rp${budget.toLocaleString('id-ID')} sedikit di bawah kebutuhan ${people} orang${noteSuffix}. Ini kombinasi paling hemat yang tersedia.`;
  } else if (budget && budget > total) {
    reply += ` Masih tersisa Rp${(budget - total).toLocaleString('id-ID')} dari anggaran.`;
  } else if (budget) {
    reply += ' Pas dengan anggaranmu.';
  }
  return { reply, items, total };
}

export function resetDemoData() {
  Object.values(KEY).forEach((k) => localStorage.removeItem(k));
  emit('menu');
  emit('tables');
  emit('orders');
}

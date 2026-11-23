// DATA CONTOH: riwayat penjualan yang dibangkitkan acak (dengan seed tetap) supaya
// "menu terlaris" dan dashboard admin tidak kosong saat demo.
// Nanti diganti hasil pengolahan data penjualan asli dari tim Data Science.
import { initialMenu } from './menu';

// Generator angka acak sederhana dengan seed, supaya hasilnya selalu sama
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted(rand, entries) {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [value, weight] of entries) {
    r -= weight;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

// Ramai di sore hari, sesuai hasil wawancara dengan pemilik
const HOUR_WEIGHTS = [
  [9, 2], [10, 3], [11, 4], [12, 5], [13, 4], [14, 5], [15, 8],
  [16, 10], [17, 10], [18, 7], [19, 5], [20, 2], [21, 1],
];

// Bobot contoh: wedang uwuh paling laku; nasi pecel & kunir asem disebut favorit di ulasan Google Maps
const ITEM_WEIGHTS = {
  'wedang-uwuh': 12,
  'wedang-uwuh-bungadi': 11,
  'jahe-susu': 6,
  'kunir-asem': 6,
  'kombucha': 5,
  'madu-jeruk': 6,
  'beras-kencur': 4,
  'gula-asem': 4,
  'kopi-bungadi': 6,
  teh: 5,
  mendoan: 8,
  'nasi-pecel': 7,
  'nasi-telor-bungadi': 5,
  'soto-ayam': 5,
};

export function generateSalesHistory(days = 14, now = new Date()) {
  const rand = mulberry32(2026);
  const menuEntries = initialMenu.map((m) => [m, ITEM_WEIGHTS[m.id] ?? (m.category === 'tambahan' ? 0.5 : 2)]);
  const sales = [];

  for (let d = days; d >= 1; d -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const orderCount = Math.round((weekend ? 26 : 14) + rand() * 8);

    for (let i = 0; i < orderCount; i += 1) {
      const at = new Date(date);
      at.setHours(pickWeighted(rand, HOUR_WEIGHTS), Math.floor(rand() * 60), 0, 0);

      // Sebagian pesanan berasal dari rombongan sehingga jumlahnya lebih banyak
      const isGroup = rand() < 0.2;
      const lineCount = 1 + Math.floor(rand() * (isGroup ? 4 : 3));
      const lines = new Map();
      for (let j = 0; j < lineCount; j += 1) {
        const menu = pickWeighted(rand, menuEntries);
        const qty = 1 + Math.floor(rand() * (isGroup ? 6 : 2));
        const prev = lines.get(menu.id);
        lines.set(menu.id, {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          qty: (prev?.qty ?? 0) + qty,
        });
      }
      const items = [...lines.values()];
      sales.push({
        at: at.toISOString(),
        items,
        total: items.reduce((sum, it) => sum + it.price * it.qty, 0),
      });
    }
  }
  return sales;
}

// Alur status pesanan: diterima → diproses → siap diantar → selesai
export const STATUS_FLOW = ['diterima', 'diproses', 'siap_diantar', 'selesai'];

export const ORDER_STATUS = {
  diterima: {
    label: 'Diterima',
    customerText: 'Pesananmu sudah masuk ke kasir.',
    badge: 'bg-sky-100 text-sky-800 ring-sky-200',
    action: 'Terima',
  },
  diproses: {
    label: 'Diproses',
    customerText: 'Pesananmu sedang disiapkan di dapur.',
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    action: 'Proses',
  },
  siap_diantar: {
    label: 'Siap diantar',
    customerText: 'Pesananmu siap dan sebentar lagi diantar ke meja.',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    action: 'Siap diantar',
  },
  selesai: {
    label: 'Selesai',
    customerText: 'Pesanan sudah diantar. Selamat menikmati!',
    badge: 'bg-kopi-200 text-kopi-700 ring-kopi-300',
    action: 'Sudah diantar',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    customerText: 'Pesanan dibatalkan. Silakan hubungi kasir bila ada pertanyaan.',
    badge: 'bg-red-100 text-red-800 ring-red-200',
    action: 'Batalkan',
  },
};

export const PAYMENT_STATUS = {
  belum_bayar: { label: 'Belum bayar', badge: 'bg-red-50 text-red-700 ring-red-200' },
  menunggu_verifikasi: { label: 'Menunggu verifikasi', badge: 'bg-amber-50 text-amber-800 ring-amber-200' },
  lunas: { label: 'Lunas', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

export const PAYMENT_METHODS = {
  qris: {
    id: 'qris',
    shortLabel: 'Barcode / QRIS',
    label: 'Barcode / QRIS (Semua Bank & E-Wallet)',
    subLabel: 'BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, DANA',
    badgeText: 'QRIS',
    badgeClass: 'bg-white border border-red-200 text-red-700',
    pillBadge: 'bg-red-50 text-red-700 ring-red-200',
  },
  dana: {
    id: 'dana',
    shortLabel: 'DANA',
    label: 'DANA E-Wallet',
    subLabel: 'Bayar instan via aplikasi, QR DANA, atau nomor HP DANA',
    badgeText: 'DANA',
    badgeClass: 'bg-[#1071e2] text-white',
    pillBadge: 'bg-sky-50 text-[#1071e2] ring-sky-200',
  },
  bank: {
    id: 'bank',
    shortLabel: 'Transfer Bank',
    label: 'Transfer Bank (Rekening Kedai)',
    subLabel: 'Transfer ke rekening resmi BCA, BRI, Mandiri, atau BPD DIY',
    badgeText: 'BANK',
    badgeClass: 'bg-kopi-900 text-[#e8c98a]',
    pillBadge: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
  kasir: {
    id: 'kasir',
    shortLabel: 'Tunai Kasir',
    label: 'Bayar di Kasir (Tunai / Debit)',
    subLabel: 'Bayar langsung ke staf kasir dengan menyebutkan kode pesanan',
    badgeText: 'KASIR',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
    pillBadge: 'bg-kopi-100 text-kopi-800 ring-kopi-200',
  },
};

export function paymentMethodLabel(order) {
  if (!order?.paymentMethod) return PAYMENT_METHODS.kasir.shortLabel;
  const base = PAYMENT_METHODS[order.paymentMethod]?.shortLabel ?? 'Tunai Kasir';
  if (order.paymentMethod === 'bank' && order.paymentBank) return `Bank ${order.paymentBank}`;
  return base;
}

export const ACTIVE_STATUSES = ['diterima', 'diproses', 'siap_diantar'];

export function nextStatus(status) {
  const index = STATUS_FLOW.indexOf(status);
  if (index === -1 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export const countItems = (items) => items.reduce((sum, it) => sum + it.qty, 0);

// Kunci keranjang: "menuId", atau "menuId:pilihan" untuk menu dengan pilihan (panas/es, goreng/bakar)
export const cartKey = (menuId, choiceId) => (choiceId ? `${menuId}:${choiceId}` : menuId);

// Isi keranjang → baris pesanan lengkap dengan nama pilihan dan harganya
export function cartLines(menu, cart) {
  return Object.entries(cart).flatMap(([key, qty]) => {
    const [menuId, choiceId] = key.split(':');
    const item = menu.find((m) => m.id === menuId);
    if (!item) return [];
    const choice = item.option?.choices.find((c) => c.id === choiceId);
    return [{ key, item, menuId, choiceId: choice?.id ?? null, name: item.name, choice: choice?.name ?? null, price: choice?.price ?? item.price, qty }];
  });
}

export const lineName = (line) => (line.choice ? `${line.name} (${line.choice})` : line.name);
export const lineKey = (line) => `${line.menuId}:${line.choiceId ?? ''}`;

export function priceRange(item) {
  const prices = item.option?.choices.map((c) => c.price ?? item.price) ?? [item.price];
  return [Math.min(...prices), Math.max(...prices)];
}

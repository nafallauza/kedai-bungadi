// Alur status pesanan: diterima → diproses → siap diantar → selesai
export const STATUS_FLOW = ['diterima', 'diproses', 'siap_diantar', 'selesai'];

export const ORDER_STATUS = {
  diterima: {
    label: 'Baru',
    customerText: 'Pesananmu sudah masuk dan diterima kasir.',
    badge: 'bg-[#fdf4e7] text-[#9a4b0b] ring-1 ring-[#f2d6b0]',
    dot: 'bg-[#b45309]',
    action: 'Proses pesanan',
  },
  diproses: {
    label: 'Diproses',
    customerText: 'Sedang disiapkan di dapur. Perkiraan siap sekitar 10 menit lagi.',
    badge: 'bg-[#eef4fb] text-[#1d4ed8] ring-1 ring-[#c9dcf7]',
    dot: 'bg-[#1d4ed8]',
    action: 'Siap diantar',
  },
  siap_diantar: {
    label: 'Siap diantar',
    customerText: 'Pesanan sudah siap dan sedang diantar ke mejamu.',
    badge: 'bg-[#edf7f0] text-[#166534] ring-1 ring-[#c2e4cc]',
    dot: 'bg-[#15803d]',
    action: 'Tandai selesai',
  },
  selesai: {
    label: 'Selesai',
    customerText: 'Pesanan sudah diantar ke meja. Selamat menikmati!',
    badge: 'bg-kopi-100 text-kopi-700 ring-1 ring-kopi-200',
    dot: 'bg-kopi-500',
    action: 'Selesai',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    customerText: 'Pesanan dibatalkan. Silakan hubungi kasir bila ada pertanyaan.',
    badge: 'bg-[#fdf1f0] text-[#b42318] ring-1 ring-[#f5c7c2]',
    dot: 'bg-[#b42318]',
    action: 'Batalkan',
  },
};

export const PAYMENT_STATUS = {
  belum_bayar: { label: 'Belum bayar', badge: 'bg-[#fdf1f0] text-[#b42318] ring-1 ring-[#f5c7c2]', dot: 'bg-[#b42318]' },
  menunggu_verifikasi: { label: 'Menunggu konfirmasi', badge: 'bg-[#fdf4e7] text-[#9a4b0b] ring-1 ring-[#f2d6b0]', dot: 'bg-[#b45309]' },
  lunas: { label: 'Lunas', badge: 'bg-[#edf7f0] text-[#166534] ring-1 ring-[#c2e4cc]', dot: 'bg-[#15803d]' },
};

// 2 opsi pembayaran bersih: Bayar di Kasir (default warung) & QRIS Kedai (konfirmasi kasir)
export const PAYMENT_METHODS = {
  kasir: {
    id: 'kasir',
    shortLabel: 'Bayar di Kasir',
    label: 'Bayar di Kasir',
    subLabel: 'Pesan sekarang, bayar tunai atau QRIS di meja kasir sebelum pulang.',
    badgeText: 'KASIR',
    pillBadge: 'bg-kopi-100 text-kopi-800 ring-kopi-200',
  },
  qris: {
    id: 'qris',
    shortLabel: 'QRIS Kedai',
    label: 'QRIS Kedai (Scan dari Meja)',
    subLabel: 'Scan QRIS dari aplikasi bank atau e-wallet, lalu kasir akan mengonfirmasi pembayaranmu.',
    badgeText: 'QRIS',
    pillBadge: 'bg-terakota-50 text-terakota-800 ring-terakota-200',
  },
};

export function paymentMethodLabel(order) {
  if (!order?.paymentMethod) return PAYMENT_METHODS.kasir.shortLabel;
  return PAYMENT_METHODS[order.paymentMethod]?.shortLabel ?? PAYMENT_METHODS.kasir.shortLabel;
}

export const ACTIVE_STATUSES = ['diterima', 'diproses', 'siap_diantar'];

export function nextStatus(status) {
  const index = STATUS_FLOW.indexOf(status);
  if (index === -1 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export function prevStatus(status) {
  const index = STATUS_FLOW.indexOf(status);
  if (index <= 0) return null;
  return STATUS_FLOW[index - 1];
}

export const countItems = (items) => items.reduce((sum, it) => sum + it.qty, 0);

// Kunci keranjang: "menuId", atau "menuId:pilihan" untuk menu dengan pilihan (panas/es, dadar/ceplok)
export const cartKey = (menuId, choiceId) => (choiceId ? `${menuId}:${choiceId}` : menuId);

// Isi keranjang → baris pesanan lengkap dengan pilihan, harga, dan catatan dapur per item
export function cartLines(menu, cart, itemNotes = {}) {
  return Object.entries(cart).flatMap(([key, qty]) => {
    const [menuId, choiceId] = key.split(':');
    const item = menu.find((m) => m.id === menuId);
    if (!item) return [];
    const choice = item.option?.choices.find((c) => c.id === choiceId);
    return [
      {
        key,
        item,
        menuId,
        choiceId: choice?.id ?? null,
        name: item.name,
        choice: choice?.name ?? null,
        price: choice?.price ?? item.price,
        qty,
        note: itemNotes[key] ?? '',
      },
    ];
  });
}

export const lineName = (line) => (line.choice ? `${line.name} (${line.choice})` : line.name);
export const lineKey = (line) => `${line.menuId}:${line.choiceId ?? ''}`;

export function priceRange(item) {
  const prices = item.option?.choices.map((c) => c.price ?? item.price) ?? [item.price];
  return [Math.min(...prices), Math.max(...prices)];
}

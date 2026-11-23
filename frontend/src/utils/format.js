const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export const formatRupiah = (value) => rupiah.format(value || 0);

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

export const minutesSince = (iso, now = Date.now()) =>
  Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));

export function timeAgo(iso, now = Date.now()) {
  const minutes = minutesSince(iso, now);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  return `${hours} jam ${minutes % 60} mnt lalu`;
}

// crypto.randomUUID hanya ada di HTTPS/localhost, jadi siapkan cadangan
// untuk uji coba dari HP lewat alamat IP lokal (http://192.168.x.x)
export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

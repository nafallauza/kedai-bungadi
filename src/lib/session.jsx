import { createContext, useContext, useEffect, useState } from 'react';

// Sesi pelanggan di HP: meja hasil scan QR, isi keranjang, nama pemesan, dan pesanan miliknya.
// Disimpan di sessionStorage: tidak hilang saat dimuat ulang, dan tiap tab dianggap satu HP (memudahkan demo).
const STORAGE_KEY = 'bungadi.v2.session';
const SESSION_HOURS = 6;

const emptySession = { table: null, startedAt: null, cart: {}, customerName: '', myOrderIds: [] };

function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    const expired = Date.now() - new Date(saved?.startedAt).getTime() > SESSION_HOURS * 3600000;
    return saved && !expired ? { ...emptySession, ...saved } : emptySession;
  } catch {
    return emptySession;
  }
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Tetap jalan walau penyimpanan diblokir (mode privat)
    }
  }, [session]);

  const update = (change) => setSession((s) => ({ ...s, ...change(s) }));

  const value = {
    ...session,
    cartCount: Object.values(session.cart).reduce((sum, qty) => sum + qty, 0),
    // Meja baru mengosongkan keranjang, tetapi pesanan sebelumnya tetap bisa dilihat
    setTable: (table) =>
      update((s) => ({
        table,
        startedAt: new Date().toISOString(),
        cart: s.table?.code === table.code ? s.cart : {},
      })),
    // key = cartKey(menuId, choiceId), lihat utils/order.js
    setQty: (key, qty) =>
      update((s) => {
        const cart = { ...s.cart };
        if (qty > 0) cart[key] = qty;
        else delete cart[key];
        return { cart };
      }),
    addItems: (items) =>
      update((s) => {
        const cart = { ...s.cart };
        items.forEach(({ key, qty }) => {
          cart[key] = (cart[key] ?? 0) + qty;
        });
        return { cart };
      }),
    clearCart: () => update(() => ({ cart: {} })),
    setCustomerName: (customerName) => update(() => ({ customerName })),
    addMyOrder: (id) => update((s) => ({ myOrderIds: [id, ...s.myOrderIds] })),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);

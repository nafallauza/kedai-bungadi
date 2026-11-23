import { createContext, useContext, useEffect, useState } from 'react';

// Sesi pelanggan di HP: meja hasil scan QR, keranjang + catatan per item, nama pemesan, catatan umum, dan riwayat pesanan.
const STORAGE_KEY = 'bungadi.v3.session';
const SESSION_HOURS = 6;

const emptySession = {
  table: null,
  startedAt: null,
  cart: {},
  itemNotes: {},
  customerName: '',
  draftNote: '',
  myOrderIds: [],
};

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
      // Tetap berjalan pada mode privat
    }
  }, [session]);

  const update = (change) => setSession((s) => ({ ...s, ...change(s) }));

  const value = {
    ...session,
    cartCount: Object.values(session.cart).reduce((sum, qty) => sum + qty, 0),
    setTable: (table) =>
      update((s) => ({
        table,
        startedAt: new Date().toISOString(),
        cart: s.table?.code === table.code ? s.cart : {},
        itemNotes: s.table?.code === table.code ? s.itemNotes : {},
      })),
    setQty: (key, qty) =>
      update((s) => {
        const cart = { ...s.cart };
        const itemNotes = { ...s.itemNotes };
        if (qty > 0) {
          cart[key] = qty;
        } else {
          delete cart[key];
          delete itemNotes[key];
        }
        return { cart, itemNotes };
      }),
    setItemNote: (key, note) =>
      update((s) => {
        const itemNotes = { ...s.itemNotes };
        const clean = note?.trim();
        if (clean) itemNotes[key] = clean;
        else delete itemNotes[key];
        return { itemNotes };
      }),
    addItems: (items) =>
      update((s) => {
        const cart = { ...s.cart };
        const itemNotes = { ...s.itemNotes };
        items.forEach(({ key, qty, note }) => {
          cart[key] = (cart[key] ?? 0) + qty;
          if (note?.trim()) {
            const prev = itemNotes[key];
            const clean = note.trim();
            itemNotes[key] = prev && !prev.includes(clean) ? `${prev}; ${clean}` : clean;
          }
        });
        return { cart, itemNotes };
      }),
    clearCart: () => update(() => ({ cart: {}, itemNotes: {}, draftNote: '' })),
    setCustomerName: (customerName) => update(() => ({ customerName })),
    setDraftNote: (draftNote) => update(() => ({ draftNote })),
    addMyOrder: (id) => update((s) => ({ myOrderIds: [id, ...s.myOrderIds] })),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);

import { useCallback, useEffect, useState } from 'react';
import * as api from './api';

// Ambil data dari api lalu muat ulang otomatis saat ada perubahan bertipe `types` ("orders|menu")
function useLiveData(load, types) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });

  const reload = useCallback(() => {
    load()
      .then((data) => setState({ data, loading: false, error: '' }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: err.message })));
  }, [load]);

  useEffect(() => {
    reload();
    return api.subscribe((event) => {
      if (types.split('|').includes(event.type)) reload();
    });
  }, [reload, types]);

  return { ...state, reload };
}

export const useMenu = () => useLiveData(api.getMenu, 'menu');
export const useTables = () => useLiveData(api.getTables, 'tables');
export const useOrders = () => useLiveData(api.getOrders, 'orders');
export const useBestSellers = () => useLiveData(api.getBestSellers, 'orders|menu');

export function useOrder(id) {
  const load = useCallback(() => api.getOrder(id), [id]);
  return useLiveData(load, 'orders');
}

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

// Waktu sekarang yang diperbarui berkala, untuk teks "5 mnt lalu"
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

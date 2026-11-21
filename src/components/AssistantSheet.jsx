import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { askAssistant } from '../lib/api';
import { formatRupiah } from '../utils/format';
import { cartKey, lineKey, lineName } from '../utils/order';
import { Sheet, Spinner, Stepper, btnPrimary, btnSecondary, cx, input } from './ui';

const preferenceOptions = [
  ['hangat', 'Minuman hangat'],
  ['dingin', 'Minuman dingin'],
  ['berat', 'Makan berat'],
  ['camilan', 'Camilan'],
];
const budgetOptions = [50000, 100000, 200000, 300000];

// Asisten menu untuk rombongan. Saat ini memanggil versi contoh di api.js;
// nanti api.askAssistant diarahkan ke layanan AI buatan tim AI Engineer.
export default function AssistantSheet({ open, onClose, onAdd }) {
  const [people, setPeople] = useState(4);
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState(['hangat']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (p) =>
    setPreferences((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setResult(await askAssistant({ people, budget: Number(budget) || null, preferences }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAll = () => {
    onAdd(result.items.map(({ menuId, choiceId, qty }) => ({ key: cartKey(menuId, choiceId), qty })));
    setResult(null);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Bantu pilih menu">
      {result ? (
        <div className="animate-fade-in">
          <p className="flex gap-2 rounded-xl bg-terakota-50 p-3 text-sm text-terakota-900">
            <Sparkles strokeWidth={1.5} className="mt-0.5 size-4 shrink-0" />
            {result.reply}
          </p>
          <ul className="mt-4 divide-y divide-black/[0.06]">
            {result.items.map((it) => (
              <li key={lineKey(it)} className="flex justify-between gap-3 py-2.5 text-sm">
                <span>
                  <span className="font-semibold tabular-nums">{it.qty}×</span> {lineName(it)}
                </span>
                <span className="tabular-nums text-kopi-600">{formatRupiah(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-black/[0.06] pt-3 font-semibold">
            <span>Perkiraan total</span>
            <span className="tabular-nums">{formatRupiah(result.total)}</span>
          </div>
          <div className="mt-5 grid grid-cols-[auto_1fr] gap-2">
            <button type="button" onClick={() => setResult(null)} className={btnSecondary}>
              Ubah
            </button>
            <button type="button" onClick={addAll} className={btnPrimary}>
              Masukkan keranjang
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Jumlah orang</label>
            <Stepper value={people} onChange={(v) => setPeople(Math.max(1, v))} max={50} />
          </div>
          <div>
            <label htmlFor="budget" className="text-sm font-medium">
              Anggaran total <span className="font-normal text-kopi-400">(opsional)</span>
            </label>
            <input
              id="budget"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              placeholder="Contoh: 150000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={cx(input, 'mt-2')}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {budgetOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(String(b))}
                  className={cx(
                    'rounded-full border px-3 py-1 text-xs font-medium',
                    Number(budget) === b ? 'border-terakota-300 bg-terakota-50 text-terakota-800' : 'border-black/[0.08] text-kopi-600',
                  )}
                >
                  {formatRupiah(b)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Preferensi</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {preferenceOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggle(value)}
                  aria-pressed={preferences.includes(value)}
                  className={cx(
                    'rounded-full border px-3 py-1.5 text-sm',
                    preferences.includes(value)
                      ? 'border-terakota-300 bg-terakota-50 font-medium text-terakota-800'
                      : 'border-black/[0.08] text-kopi-600',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className={cx(btnPrimary, 'w-full')}>
            {loading ? <Spinner className="size-4" /> : <Sparkles strokeWidth={1.5} className="size-4" />}
            Minta rekomendasi
          </button>
        </form>
      )}
    </Sheet>
  );
}

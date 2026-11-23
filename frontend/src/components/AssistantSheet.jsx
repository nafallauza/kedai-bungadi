import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendHorizontal, Sparkles } from 'lucide-react';
import { askAssistant } from '../lib/api';
import { useSession } from '../lib/session';
import { formatRupiah } from '../utils/format';
import { cartKey, lineName } from '../utils/order';
import { Sheet, btnPrimary, cx, input } from './ui';

const QUICK_PROMPTS = [
  '8 orang, anggaran 150rb, kebanyakan mau yang hangat',
  '20 orang, anggaran 300rb, ada yang tidak minum kopi',
  '4 orang, anggaran 90rb, ingin jamu dingin dan camilan',
];

function parsePrompt(text) {
  const lower = text.toLowerCase();

  let people = 4;
  const pMatch = lower.match(/(\d+)\s*(orang|org|teman|tamu|pax|peserta)/);
  if (pMatch) people = Math.min(100, Math.max(1, Number(pMatch[1])));

  let budget = 0;
  const bMatch = lower.match(/(?:rp\.?\s*|anggaran\s*|budget\s*)?(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta)/i);
  if (bMatch) {
    const val = Number(bMatch[1].replace(',', '.'));
    const unit = bMatch[2].toLowerCase();
    budget = unit.startsWith('j') ? Math.round(val * 1000000) : Math.round(val * 1000);
  } else {
    const rawNum = lower.match(/(?:rp\.?\s*|anggaran\s*|budget\s*)(\d{5,7})/);
    if (rawNum) budget = Number(rawNum[1]);
  }

  const preferences = [];
  const exclude = [];
  if (/(tanpa|tidak|nggak|gak|bukan|jangan|no)\s+(minum\s+)?kopi/.test(lower)) {
    exclude.push('kopi');
  } else if (/kopi/.test(lower)) {
    preferences.push('kopi');
  }
  if (/dingin|es|segar|jamu|kombucha/.test(lower)) preferences.push('dingin');
  if (/hangat|panas|wedang/.test(lower)) preferences.push('hangat');
  if (/makan|kenyang|berat|nasi|soto|pecel/.test(lower)) preferences.push('berat');
  if (!preferences.length) preferences.push('hangat');

  return { people, budget, preferences, exclude };
}

export default function AssistantSheet({ open, onClose }) {
  const navigate = useNavigate();
  const { table, addItems } = useSession();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Halo! Sebutkan jumlah orang, anggaran, dan selera rombonganmu (misalnya tanpa kopi atau mau yang hangat). Saya pilihkan dari menu yang tersedia hari ini.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [addedIndex, setAddedIndex] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const clean = text.trim();
    if (!clean || busy) return;
    setDraft('');
    setMessages((prev) => [...prev, { role: 'user', text: clean }]);
    setBusy(true);
    try {
      const parsed = parsePrompt(clean);
      const res = await askAssistant({ prompt: clean, ...parsed });
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: res.reply, items: res.items, total: res.total, budget: parsed.budget },
      ]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: err.message || 'Gagal memuat rekomendasi.' }]);
    } finally {
      setBusy(false);
    }
  };

  const applyRecommendation = (msg, idx) => {
    if (!table) {
      onClose();
      navigate('/pesan');
      return;
    }
    addItems(msg.items.map((it) => ({ key: cartKey(it.menuId, it.choiceId), qty: it.qty })));
    setAddedIndex(idx);
    setTimeout(() => {
      onClose();
      setAddedIndex(null);
    }, 450);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      fullScreen
      title="Tanya Menu"
      subtitle="Asisten rombongan Wedang Uwuh Bu Ngadi"
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Tulis jumlah orang dan anggaran
          </label>
          <input
            id="assistant-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Misal: 12 orang, anggaran 200rb, tanpa kopi"
            className={input}
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="grid size-[48px] shrink-0 place-items-center rounded-[12px] bg-terakota-700 text-kertas transition-colors hover:bg-terakota-800 disabled:opacity-50"
            aria-label="Kirim pertanyaan"
          >
            <SendHorizontal strokeWidth={1.75} className="size-5" />
          </button>
        </form>
      }
    >
      <div className="space-y-3 pb-2">
        {messages.map((m, idx) => (
          <div key={idx} className={cx('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}>
            <div
              className={cx(
                'max-w-[92%] rounded-[16px] px-4 py-3 text-[14px] leading-relaxed',
                m.role === 'user'
                  ? 'bg-terakota-700 text-kertas'
                  : 'border border-kopi-200 bg-kopi-50 text-kopi-900',
              )}
            >
              <p>{m.text}</p>

              {m.items?.length > 0 && (
                <div className="mt-3 border-t border-kopi-200 pt-2.5">
                  <ul className="divide-y divide-kopi-200/70 text-[13px]">
                    {m.items.map((it) => (
                      <li key={`${it.menuId}-${it.choiceId}`} className="flex justify-between gap-2 py-1.5">
                        <span className="text-kopi-800">
                          <strong className="font-semibold text-kopi-950">{it.qty}×</strong> {lineName(it)}
                        </span>
                        <span className="shrink-0 font-semibold tabular-nums text-kopi-950">
                          {formatRupiah(it.price * it.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center justify-between border-t border-kopi-200 pt-2.5 text-[14px]">
                    <span className="font-semibold text-kopi-800">Total</span>
                    <span className="font-bold tabular-nums text-terakota-800">{formatRupiah(m.total)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyRecommendation(m, idx)}
                    className={cx(btnPrimary, 'mt-3 min-h-[44px] w-full text-[13px]')}
                  >
                    {addedIndex === idx
                      ? 'Masuk ke keranjang!'
                      : table
                        ? 'Masukkan semua ke keranjang'
                        : 'Pilih meja dulu untuk memesan'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Contoh cepat saat obrolan baru dibuka */}
        {messages.length === 1 && (
          <div className="pt-1">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-kopi-600">
              <Sparkles strokeWidth={1.75} className="size-3.5 text-terakota-700" aria-hidden="true" />
              Coba salah satu contoh ini:
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="min-h-[44px] rounded-[12px] border border-kopi-200 bg-kertas px-3.5 py-2 text-left text-xs font-medium text-kopi-800 transition-colors hover:border-terakota-300 hover:bg-terakota-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {busy && <p className="text-xs text-kopi-600">Sedang menyusun rekomendasi menu…</p>}
        <div ref={endRef} />
      </div>
    </Sheet>
  );
}

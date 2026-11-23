import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { askAssistant } from '../lib/api';
import { formatRupiah } from '../utils/format';
import { cartKey } from '../utils/order';
import { Spinner } from './ui';

const INITIAL_MESSAGES = [
  {
    id: 'greeting',
    role: 'assistant',
    text: 'Halo, mau pesan untuk berapa orang dan berapa anggarannya? Nanti aku pilihkan menunya.',
    chips: ['5 orang', '10 orang', 'Anggaran Rp200.000'],
  },
  {
    id: 'demo-user',
    role: 'user',
    text: 'Kami 8 orang, anggaran 150 ribu. Kebanyakan mau yang hangat.',
  },
  {
    id: 'demo-reply',
    role: 'assistant',
    text: 'Ini usulanku untuk 8 orang. Semuanya ada di menu hari ini:',
    proposal: {
      items: [
        { menuId: 'wedang-uwuh', choiceId: 'panas', name: 'Wedang Uwuh', price: 8000, qty: 4 },
        { menuId: 'jahe-susu', choiceId: 'panas', name: 'Jahe Susu', price: 10000, qty: 4 },
        { menuId: 'nasi-pecel', choiceId: null, name: 'Nasi Pecel', price: 15000, qty: 2 },
        { menuId: 'mendoan', choiceId: null, name: 'Mendoan', price: 8000, qty: 5 },
      ],
      total: 142000,
      budgetNote: 'Sisa anggaran Rp8.000',
    },
  },
];

function parsePrompt(rawText) {
  const lower = rawText.toLowerCase();
  let people = 5;
  const peopleMatch = lower.match(/(\d+)\s*orang/);
  if (peopleMatch) {
    people = Math.max(1, Math.min(100, Number(peopleMatch[1])));
  }

  let budget = 0;
  const ribuMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb)/);
  const rpMatch = lower.match(/(?:rp\.?\s*|anggaran\s*)(\d{2,3}(?:[.,]\d{3})+|\d{4,7})/);
  if (ribuMatch) {
    budget = Math.round(Number(ribuMatch[1].replace(',', '.')) * 1000);
  } else if (rpMatch) {
    budget = Number(rpMatch[1].replace(/[.,]/g, ''));
  }

  const preferences = [];
  if (lower.includes('hangat') || lower.includes('panas')) preferences.push('hangat');
  if (lower.includes('dingin') || lower.includes('es') || lower.includes('segar')) preferences.push('dingin');
  if (lower.includes('berat') || lower.includes('nasi') || lower.includes('makan') || lower.includes('kenyang')) {
    preferences.push('berat');
  }
  if (preferences.length === 0) preferences.push('hangat');

  return { people, budget, preferences };
}

// Layar penuh "Tanya Menu" persis sesuai Figma node 20:313
export default function AssistantSheet({ open, onClose, onAdd }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  if (!open) return null;

  const sendQuery = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const { people, budget, preferences } = parsePrompt(trimmed);
      const res = await askAssistant({ people, budget, preferences });
      const remaining = budget && budget >= res.total ? budget - res.total : null;
      const budgetNote =
        remaining !== null
          ? `Sisa anggaran ${formatRupiah(remaining)}`
          : budget && budget < res.total
            ? `Melebihi anggaran ${formatRupiah(res.total - budget)}`
            : null;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: `Ini usulanku untuk ${people} orang. Semuanya ada di menu hari ini:`,
          proposal: {
            items: res.items,
            total: res.total,
            budgetNote,
          },
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: err.message || 'Maaf, asisten sedang sibuk. Silakan coba lagi.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip) => {
    if (chip === '5 orang') sendQuery('Kami 5 orang, anggaran 100 ribu. Mau wedang hangat dan camilan.');
    else if (chip === '10 orang') sendQuery('Kami 10 orang, anggaran 200 ribu. Mau wedang hangat, pecel, dan mendoan.');
    else if (chip === 'Anggaran Rp200.000') sendQuery('Kami 8 orang dengan anggaran Rp200.000, pilihkan menu hangat & makanan.');
    else sendQuery(chip);
  };

  const addProposalToCart = (proposal) => {
    onAdd(proposal.items.map((it) => ({ key: cartKey(it.menuId, it.choiceId), qty: it.qty })));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-[#fafafa] sm:border-x sm:border-[#e4e4e7]"
      role="dialog"
      aria-modal="true"
      aria-label="Tanya Menu"
    >
      {/* Kepala layar sesuai Figma node 17:73 */}
      <header className="flex h-[56px] shrink-0 items-center gap-[4px] border-b border-[#e4e4e7] bg-white px-[8px]">
        <button
          type="button"
          onClick={onClose}
          className="grid size-[40px] place-items-center rounded-[12px] text-[#18181b] hover:bg-[#f4f4f5]"
          aria-label="Kembali"
        >
          <ChevronLeft strokeWidth={1.75} className="size-[20px]" />
        </button>
        <h1 className="flex-1 text-center text-[16px] font-semibold leading-[24px] text-[#18181b]">Tanya Menu</h1>
        <div className="size-[40px] shrink-0" />
      </header>

      {/* Catatan AI sesuai Figma node 20:321 */}
      <div className="shrink-0 px-[24px] pt-[12px] pb-[4px]">
        <p className="text-center text-[12px] font-medium leading-[16px] text-[#71717a]">
          Asisten memilihkan menu dari daftar Bu Ngadi. Total harga dihitung dari daftar menu.
        </p>
      </div>

      {/* Percakapan sesuai Figma node 20:323 */}
      <div className="flex-1 space-y-[12px] overflow-y-auto px-[16px] py-[12px]">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-[12px]">
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="w-[260px] max-w-[85%] rounded-tl-[16px] rounded-tr-[4px] rounded-br-[16px] rounded-bl-[16px] bg-[#7a4b2a] px-[14px] py-[12px] text-[14px] leading-[20px] text-white">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-[12px]">
                <div
                  className={
                    msg.proposal
                      ? 'flex w-[320px] max-w-full flex-col gap-[10px] rounded-tl-[4px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[16px] border border-[#e4e4e7] bg-white px-[14px] py-[12px]'
                      : 'w-[290px] max-w-[90%] rounded-tl-[4px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[16px] border border-[#e4e4e7] bg-white px-[14px] py-[12px]'
                  }
                >
                  <p className="text-[14px] leading-[20px] text-[#18181b]">{msg.text}</p>

                  {msg.proposal && (
                    <>
                      <div className="flex w-full flex-col gap-[8px] rounded-[12px] bg-[#fafafa] p-[12px]">
                        {msg.proposal.items.map((it) => (
                          <div
                            key={`${it.menuId}:${it.choiceId ?? ''}`}
                            className="flex items-center justify-between text-[14px] leading-[20px] text-[#18181b]"
                          >
                            <span>
                              {it.qty}× {it.name}
                            </span>
                            <span className="tabular-nums">{formatRupiah(it.price * it.qty)}</span>
                          </div>
                        ))}
                        <div className="h-px w-full bg-[#e4e4e7]" />
                        <div className="flex items-center justify-between text-[14px] font-semibold leading-[20px] text-[#18181b]">
                          <span>Total</span>
                          <span className="tabular-nums">{formatRupiah(msg.proposal.total)}</span>
                        </div>
                        {msg.proposal.budgetNote && (
                          <p className="text-[12px] font-medium leading-[16px] text-[#5e3920]">
                            {msg.proposal.budgetNote}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addProposalToCart(msg.proposal)}
                        className="flex h-[36px] w-full items-center justify-center rounded-[10px] bg-[#7a4b2a] px-[14px] text-[14px] font-semibold leading-[20px] text-white transition-colors hover:bg-[#5e3920]"
                      >
                        Masukkan semua ke keranjang
                      </button>
                    </>
                  )}
                </div>

                {msg.chips && (
                  <div className="flex flex-wrap gap-[8px]">
                    {msg.chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        className="flex h-[36px] items-center justify-center rounded-full border border-[#e4e4e7] bg-white px-[14px] text-[14px] leading-[20px] text-[#18181b] transition-colors hover:border-[#7a4b2a] hover:bg-[#f6eee7]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="inline-flex items-center gap-2 rounded-tl-[4px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[16px] border border-[#e4e4e7] bg-white px-[14px] py-[10px] text-[13px] text-[#71717a]">
            <Spinner className="size-4" /> Sedang menyiapkan usulan menu…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Kolom chat bawah sesuai Figma node 20:372 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuery(inputText);
        }}
        className="flex shrink-0 items-center gap-[8px] border-t border-[#e4e4e7] bg-white px-[16px] pt-[12px] pb-[20px]"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pertanyaan"
          className="h-[44px] min-w-0 flex-1 rounded-full border border-[#e4e4e7] bg-[#fafafa] px-[16px] text-[14px] leading-[20px] text-[#18181b] placeholder:text-[#71717a] outline-none focus:border-[#7a4b2a]"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="grid size-[40px] shrink-0 place-items-center rounded-[12px] bg-[#7a4b2a] text-white transition-colors hover:bg-[#5e3920] disabled:opacity-50"
          aria-label="Kirim"
        >
          <Send strokeWidth={1.75} className="size-[18px]" />
        </button>
      </form>
    </div>
  );
}

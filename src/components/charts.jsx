import { useState } from 'react';
import { cx } from './ui';

const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });

// Angka sumbu yang "bulat": 0, 250rb, 500rb, ...
function niceMax(value) {
  if (value <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].map((m) => m * step).find((m) => m >= value);
}

// Grafik kolom satu seri. Tiap kolom bisa di-hover/fokus untuk melihat nilainya,
// nilai tertinggi diberi label langsung, dan versi tabelnya tersedia di bawah grafik.
export function ColumnChart({ data, format, labelEvery = 1, caption }) {
  const [active, setActive] = useState(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const ticks = [max, max / 2, 0];

  return (
    <figure>
      <div className="flex gap-2">
        <div className="relative h-44 w-9 shrink-0 text-right text-[11px] tabular-nums text-kopi-400">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2 leading-none" style={{ bottom: `${(t / max) * 100}%` }}>
              {compact.format(t)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-44">
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 border-t border-kopi-200" style={{ bottom: `${(t / max) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]" onPointerLeave={() => setActive(null)}>
              {data.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  aria-label={`${d.label}: ${format(d.value)}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                >
                  <span
                    className={cx(
                      'block w-full max-w-6 rounded-t-[4px] transition-colors',
                      active === i ? 'bg-terakota-500' : 'bg-terakota-600',
                      'group-focus-visible:ring-2 group-focus-visible:ring-terakota-300',
                    )}
                    style={{ height: `${Math.max((d.value / max) * 100, d.value ? 1.5 : 0)}%` }}
                  />
                  {i === peak && active === null && d.value > 0 && (
                    <span
                      className="pointer-events-none absolute text-[11px] font-semibold whitespace-nowrap text-kopi-700"
                      style={{ bottom: `calc(${(d.value / max) * 100}% + 4px)` }}
                    >
                      {format(d.value)}
                    </span>
                  )}
                  {active === i && (
                    <span
                      className="pointer-events-none absolute z-10 rounded-lg border border-black/[0.06] bg-white px-2.5 py-1.5 text-left whitespace-nowrap shadow-lift"
                      style={{ bottom: `calc(${(d.value / max) * 100}% + 8px)` }}
                    >
                      <span className="block text-sm font-semibold text-kopi-900">{format(d.value)}</span>
                      <span className="block text-xs text-kopi-500">{d.label}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-[2px] text-[11px] text-kopi-400">
            {data.map((d, i) => (
              <span key={d.label} className="flex-1 text-center whitespace-nowrap">
                {i % labelEvery === 0 ? d.short : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-medium text-kopi-500 hover:text-kopi-800">Lihat sebagai tabel</summary>
        <table className="mt-2 w-full text-left text-xs">
          {caption && <caption className="sr-only">{caption}</caption>}
          <tbody className="divide-y divide-kopi-100">
            {data.map((d) => (
              <tr key={d.label}>
                <td className="py-1 text-kopi-500">{d.label}</td>
                <td className="py-1 text-right font-medium tabular-nums">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

// Daftar peringkat dengan batang horizontal; setiap nilai sudah tertulis di ujung batang
export function RankedBars({ data, format }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ol className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate">
              <span className="mr-1.5 tabular-nums text-kopi-400">{i + 1}.</span>
              {d.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{format(d.value)}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-r-[4px] bg-terakota-600" style={{ width: `${(d.value / max) * 100}%` }} />
        </li>
      ))}
    </ol>
  );
}

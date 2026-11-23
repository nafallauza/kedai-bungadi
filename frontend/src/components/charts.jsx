import { useState } from 'react';
import { cx } from './ui';

const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });

function niceMax(value) {
  if (value <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].map((m) => m * step).find((m) => m >= value);
}

// Pewarnaan semantik yang tenang (tidak mencolok seperti lampu lalu lintas):
// - mode="trend": hijau >= rata-rata (ramai), slate netral 50–99% (normal), merah < 50% (sepi tajam)
// - mode="load" : merah >= 75% puncak (jam sibuk), amber 40–74% (sedang), slate lembut < 40% (longgar)
function barColor({ mode, value, avg, peakVal, isActive, isPeak }) {
  if (mode === 'trend') {
    if (value >= avg) return isActive || isPeak ? 'bg-[#15803d]' : 'bg-[#16a34a]';
    if (avg > 0 && value < avg * 0.5) return isActive ? 'bg-[#b91c1c]' : 'bg-[#dc2626]';
    return isActive ? 'bg-[#64748b]' : 'bg-[#94a3b8]';
  }
  if (mode === 'load') {
    const ratio = peakVal > 0 ? value / peakVal : 0;
    if (ratio >= 0.75) return isActive || isPeak ? 'bg-[#b91c1c]' : 'bg-[#dc2626]';
    if (ratio >= 0.4) return isActive ? 'bg-[#b45309]' : 'bg-[#d97706]';
    return isActive ? 'bg-[#94a3b8]' : 'bg-[#cbd5e1]';
  }
  return isActive ? 'bg-terakota-800' : isPeak ? 'bg-terakota-700' : 'bg-terakota-500/80';
}

// Grafik kolom satu seri dengan kontras tinggi, pewarnaan semantik merah-hijau tenang, & versi tabel.
export function ColumnChart({ data, format, labelEvery = 1, caption, mode = 'default' }) {
  const [active, setActive] = useState(null);
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const peakVal = data[peak]?.value ?? 0;
  const max = niceMax(peakVal);
  const nonZero = data.filter((d) => d.value > 0);
  const avg = nonZero.length ? nonZero.reduce((s, d) => s + d.value, 0) / nonZero.length : 0;
  const ticks = [max, max / 2, 0];

  return (
    <figure>
      {mode === 'trend' && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-kopi-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#16a34a]" aria-hidden="true" />
            Di atas rata-rata ({format(Math.round(avg))})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#94a3b8]" aria-hidden="true" />
            Normal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#dc2626]" aria-hidden="true" />
            Sepi (&lt;50%)
          </span>
        </div>
      )}

      {mode === 'load' && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-kopi-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#dc2626]" aria-hidden="true" />
            Jam puncak padat
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#d97706]" aria-hidden="true" />
            Sedang
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#cbd5e1]" aria-hidden="true" />
            Longgar
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative h-44 w-10 shrink-0 text-right text-xs tabular-nums text-kopi-600">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2 leading-none" style={{ bottom: `${(t / max) * 100}%` }}>
              {compact.format(t)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-44">
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 border-t border-kopi-200/80" style={{ bottom: `${(t / max) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end gap-[3px]" onPointerLeave={() => setActive(null)}>
              {data.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  aria-label={`${d.label}: ${format(d.value)}`}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => setActive(active === i ? null : i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full flex-1 items-end justify-center"
                >
                  <span
                    className={cx(
                      'block w-full max-w-7 rounded-t-[5px] transition-colors',
                      barColor({ mode, value: d.value, avg, peakVal, isActive: active === i, isPeak: i === peak }),
                    )}
                    style={{ height: `${Math.max((d.value / max) * 100, d.value ? 2 : 0)}%` }}
                  />
                  {i === peak && active === null && d.value > 0 && (
                    <span
                      className="pointer-events-none absolute text-xs font-semibold whitespace-nowrap text-kopi-900"
                      style={{ bottom: `calc(${(d.value / max) * 100}% + 4px)` }}
                    >
                      {format(d.value)}
                    </span>
                  )}
                  {active === i && (
                    <span
                      className="pointer-events-none absolute z-10 rounded-lg border border-kopi-200 bg-kertas px-2.5 py-1.5 text-left whitespace-nowrap shadow-lift"
                      style={{ bottom: `calc(${(d.value / max) * 100}% + 8px)` }}
                    >
                      <span className="block text-sm font-semibold text-kopi-900">{format(d.value)}</span>
                      <span className="block text-xs text-kopi-600">{d.label}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-[3px] text-xs text-kopi-600">
            {data.map((d, i) => (
              <span key={d.label} className="flex-1 text-center whitespace-nowrap">
                {i % labelEvery === 0 ? d.short : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <details className="mt-3 text-sm">
        <summary className="inline-flex min-h-[36px] cursor-pointer items-center text-xs font-medium text-kopi-600 hover:text-kopi-900">
          Lihat sebagai tabel
        </summary>
        <table className="mt-2 w-full text-left text-xs">
          {caption && <caption className="sr-only">{caption}</caption>}
          <tbody className="divide-y divide-kopi-100">
            {data.map((d) => (
              <tr key={d.label}>
                <td className="py-1.5 text-kopi-600">{d.label}</td>
                <td className="py-1.5 text-right font-medium tabular-nums text-kopi-900">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

// Daftar peringkat dengan batang horizontal (hijau untuk teratas, turun bertahap)
export function RankedBars({ data, format }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ol className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate text-kopi-900">
              <span className="mr-1.5 font-semibold tabular-nums text-kopi-600">{i + 1}.</span>
              {d.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-kopi-900">{format(d.value)}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-kopi-100">
            <div
              className={cx('h-full rounded-full', i < 2 ? 'bg-[#16a34a]' : 'bg-terakota-600')}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

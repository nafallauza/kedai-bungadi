import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { getSalesSummary, subscribe } from '../../lib/api';
import { formatDate, formatRupiah } from '../../utils/format';
import { ColumnChart, RankedBars } from '../../components/charts';
import { Loading, card, cx } from '../../components/ui';

const PERIODS = [
  { days: 1, label: 'Hari ini' },
  { days: 7, label: '7 hari' },
  { days: 14, label: '14 hari' },
  { days: 30, label: '30 hari' },
];

export default function SummaryPage() {
  const [days, setDays] = useState(14);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () => getSalesSummary(days).then((s) => active && setSummary(s));
    load();
    const unsub = subscribe((e) => e.type === 'orders' && load());
    return () => {
      active = false;
      unsub();
    };
  }, [days]);

  if (!summary) return <Loading text="Menghitung ringkasan penjualan…" />;

  const peakHour = summary.hourly.reduce(
    (best, h) => (h.orders > best.orders ? h : best),
    { hour: 16, orders: 0 },
  );

  const kpis = [
    { label: 'Pendapatan', value: formatRupiah(summary.revenue), sub: `Periode ${days === 1 ? 'hari ini' : `${days} hari terakhir`}` },
    { label: 'Total pesanan', value: `${summary.orders}`, sub: 'Pesanan masuk & tercatat' },
    { label: 'Rata-rata transaksi', value: formatRupiah(summary.averageOrder), sub: 'Per struk pesanan' },
    { label: 'Pesanan rombongan', value: `${summary.groupOrders}`, sub: 'Pesanan ≥ 6 item per meja' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-kopi-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-kopi-950">
            Ringkasan Penjualan
          </h1>
          <p className="mt-1 text-sm text-kopi-600">
            Pantau pendapatan, pola jam ramai, menu terlaris, dan perkiraan kebutuhan porsi mingguan.
          </p>
        </div>

        <div className="inline-flex shrink-0 rounded-[12px] border border-kopi-200 bg-kertas p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              className={cx(
                'min-h-[40px] whitespace-nowrap rounded-[9px] px-3 text-xs font-semibold transition-colors sm:px-3.5',
                days === p.days ? 'bg-terakota-700 text-kertas' : 'text-kopi-700 hover:text-kopi-950',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* 4 Metrik utama */}
      <section aria-label="Ringkasan angka" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={cx(card, 'p-5')}>
            <p className="text-xs font-semibold text-kopi-600">{k.label}</p>
            <p className="mt-2 text-[26px] font-bold leading-tight tabular-nums text-kopi-950">
              {k.value}
            </p>
            <p className="mt-1 text-xs text-kopi-600">{k.sub}</p>
          </div>
        ))}
      </section>

      {/* Grafik penjualan & jam ramai */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className={cx(card, 'p-5')}>
          <h2 className="font-display text-[24px] font-bold text-kopi-950">
            Penjualan {days === 1 ? 'hari ini' : `${days} hari terakhir`}
          </h2>
          <p className="mt-1 text-xs text-kopi-600">
            Ketuk atau sorot batang untuk melihat rincian pendapatan harian.
          </p>
          <div className="mt-5">
            <ColumnChart
              mode="trend"
              data={summary.daily.map((d) => ({
                label: formatDate(d.date),
                short: new Date(d.date).getDate(),
                value: d.revenue,
              }))}
              format={formatRupiah}
              labelEvery={days > 14 ? 3 : 1}
              caption="Pendapatan harian Wedang Uwuh Bu Ngadi"
            />
          </div>
        </section>

        <section className={cx(card, 'p-5')}>
          <h2 className="font-display text-[24px] font-bold text-kopi-950">Pola jam ramai</h2>
          <p className="mt-1 text-xs text-kopi-600">
            Paling ramai sekitar pukul{' '}
            <strong className="font-semibold text-kopi-900">
              {String(peakHour.hour).padStart(2, '0')}.00–{String(peakHour.hour + 1).padStart(2, '0')}.00
            </strong>{' '}
            ({peakHour.orders} pesanan). Siapkan stok wedang dan tambahan staf dapur sebelum jam tersebut.
          </p>
          <div className="mt-5">
            <ColumnChart
              mode="load"
              data={summary.hourly.map((h) => ({
                label: `Pukul ${String(h.hour).padStart(2, '0')}.00`,
                short: `${String(h.hour).padStart(2, '0')}`,
                value: h.orders,
              }))}
              format={(v) => `${v} pesanan`}
              labelEvery={2}
              caption="Jumlah pesanan per jam"
            />
          </div>
        </section>
      </div>

      {/* Menu terlaris + Perkiraan laris minggu depan (slot Model AI Wajib Project Plan hal. 6) */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className={cx(card, 'p-5')}>
          <h2 className="font-display text-[24px] font-bold text-kopi-950">Menu terlaris</h2>
          <p className="mt-1 text-xs text-kopi-600">Berdasarkan jumlah porsi terjual pada periode terpilih.</p>
          <div className="mt-5">
            <RankedBars
              data={summary.topItems.slice(0, 6).map((item) => ({
                label: item.name,
                value: item.qty,
              }))}
              format={(v) => `${v} terjual`}
            />
          </div>
        </section>

        <section className={cx(card, 'p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[24px] font-bold text-kopi-950">
                Perkiraan laris minggu depan
              </h2>
              <p className="mt-1 text-xs text-kopi-600">
                Estimasi kebutuhan porsi dari model prediksi penjualan untuk membantu belanja bahan baku.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-terakota-50 px-2.5 py-1 text-xs font-semibold text-terakota-800">
              <Sparkles strokeWidth={1.75} className="size-3.5" aria-hidden="true" />
              Prediksi AI
            </span>
          </div>

          <ul className="mt-5 divide-y divide-kopi-100">
            {summary.forecast.map((f) => (
              <li key={f.menuId} className="flex items-center justify-between gap-3 py-3">
                <span className="font-medium text-kopi-900">{f.name}</span>
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="font-semibold tabular-nums text-kopi-950">
                    sekitar {f.projectedPortions} porsi
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#edf7f0] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#166534]">
                    <TrendingUp strokeWidth={1.75} className="size-3" aria-hidden="true" />+{f.deltaPct}%
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-[12px] bg-kertas-tua px-3.5 py-2.5 text-xs leading-relaxed text-kopi-700">
            Saran dapur: siapkan tambahan bahan secang, jahe bakar, dan tempe mendoan untuk lonjakan akhir pekan pukul 15.00–18.00.
          </p>
        </section>
      </div>
    </div>
  );
}

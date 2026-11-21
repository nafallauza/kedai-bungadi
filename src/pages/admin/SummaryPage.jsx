import { useEffect, useState } from 'react';
import { getSalesSummary, subscribe } from '../../lib/api';
import { formatDate, formatRupiah } from '../../utils/format';
import { ColumnChart, RankedBars } from '../../components/charts';
import { Loading, card, cx } from '../../components/ui';

const ranges = [7, 14, 30];
const hourLabel = (h) => `${String(h).padStart(2, '0')}.00`;

export default function SummaryPage() {
  const [days, setDays] = useState(14);
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState(true);
  const [version, setVersion] = useState(0);

  // Muat ulang saat rentang diganti atau ada pesanan baru
  useEffect(() => subscribe((e) => e.type === 'orders' && setVersion((v) => v + 1)), []);
  useEffect(() => {
    let active = true;
    setPending(true);
    getSalesSummary(days).then((s) => {
      if (!active) return;
      setSummary(s);
      setPending(false);
    });
    return () => {
      active = false;
    };
  }, [days, version]);

  if (!summary) return <Loading text="Memuat ringkasan…" />;

  const peak = summary.hourly.reduce((best, h) => (h.orders > best.orders ? h : best));
  const top = summary.topItems[0];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Ringkasan penjualan</h1>
          <p className="mt-0.5 text-sm text-kopi-500">
            Data contoh + pesanan dari prototype. Nanti diganti hasil olahan data penjualan asli.
          </p>
        </div>
      </div>

      {/* Filter rentang waktu: berlaku untuk semua angka & grafik di bawahnya */}
      <div className="mt-5 flex rounded-xl border border-black/[0.06] bg-white p-1 sm:inline-flex">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setDays(r)}
            className={cx(
              'flex-1 rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap sm:flex-none',
              days === r ? 'bg-kopi-900 text-white' : 'text-kopi-600 hover:bg-kopi-50',
            )}
          >
            {r} hari
          </button>
        ))}
      </div>

      <div className={cx('mt-5 space-y-4 transition-opacity', pending && 'opacity-60')}>
        <div className="grid gap-4 md:grid-cols-4">
          <div className={cx(card, 'p-5 md:col-span-2')}>
            <p className="text-sm text-kopi-500">Pendapatan {days} hari terakhir</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{formatRupiah(summary.revenue)}</p>
          </div>
          <div className={cx(card, 'p-5')}>
            <p className="text-sm text-kopi-500">Jumlah pesanan</p>
            <p className="mt-2 text-3xl font-semibold">{summary.orders.toLocaleString('id-ID')}</p>
          </div>
          <div className={cx(card, 'p-5')}>
            <p className="text-sm text-kopi-500">Rata-rata per pesanan</p>
            <p className="mt-2 text-3xl font-semibold">{formatRupiah(summary.averageOrder)}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className={cx(card, 'p-5 lg:col-span-2')}>
            <h2 className="font-semibold">Pendapatan per hari</h2>
            <p className="mb-5 text-sm text-kopi-500">Arahkan kursor ke batang untuk melihat angkanya.</p>
            <ColumnChart
              caption="Pendapatan per hari"
              format={formatRupiah}
              labelEvery={days > 14 ? 5 : days > 7 ? 2 : 1}
              data={summary.daily.map((d) => ({
                label: formatDate(d.date),
                short: new Date(d.date).getDate(),
                value: d.revenue,
              }))}
            />
          </section>
          <section className={cx(card, 'p-5')}>
            <h2 className="font-semibold">Menu terlaris</h2>
            <p className="mb-5 text-sm text-kopi-500">
              {top ? `${top.name} paling banyak dipesan.` : 'Belum ada data.'}
            </p>
            <RankedBars data={summary.topItems.map((i) => ({ label: i.name, value: i.qty }))} format={(v) => `${v} porsi`} />
          </section>
        </div>

        <section className={cx(card, 'p-5')}>
          <h2 className="font-semibold">Pola jam ramai</h2>
          <p className="mb-5 text-sm text-kopi-500">
            Jumlah pesanan per jam. Paling ramai sekitar pukul {hourLabel(peak.hour)}, siapkan staf tambahan sebelum jam ini.
          </p>
          <ColumnChart
            caption="Jumlah pesanan per jam"
            format={(v) => `${v} pesanan`}
            labelEvery={2}
            data={summary.hourly.map((h) => ({ label: `Pukul ${hourLabel(h.hour)}`, short: h.hour, value: h.orders }))}
          />
        </section>
      </div>
    </div>
  );
}

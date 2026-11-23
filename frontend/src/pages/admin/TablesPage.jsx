import { useMemo, useRef, useState } from 'react';
import { Download, Plus, Printer, Settings2, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { addTable, deleteTable } from '../../lib/api';
import { useOrders, useTables } from '../../lib/hooks';
import { ACTIVE_STATUSES } from '../../utils/order';
import {
  ConfirmSheet,
  Loading,
  StatusBadge,
  btnPrimary,
  btnSecondary,
  card,
  cx,
  input,
} from '../../components/ui';

function TableQrCard({ table, baseUrl, activeOrder, onDelete, onPrintOne }) {
  const canvasWrap = useRef(null);
  const url = `${baseUrl.replace(/\/$/, '')}/meja/${table.code}`;

  const downloadPng = () => {
    const canvas = canvasWrap.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${table.code.toLowerCase()}-bu-ngadi.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <article className={cx(card, 'flex flex-col p-4')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-bold text-kopi-950">{table.name}</h2>
          <p className="text-xs font-semibold text-kopi-600">Kode {table.code}</p>
        </div>
        {activeOrder ? (
          <StatusBadge status={activeOrder.status} />
        ) : (
          <span className="rounded-full bg-kopi-100 px-2.5 py-1 text-xs font-medium text-kopi-600">
            Kosong
          </span>
        )}
      </div>

      <div ref={canvasWrap} className="mt-4 flex flex-col items-center rounded-[12px] bg-white p-3.5">
        <p className="font-display text-[15px] font-bold text-kopi-950">Wedang Uwuh Bu Ngadi</p>
        <div className="mt-2">
          <QRCodeCanvas value={url} size={148} fgColor="#15110d" bgColor="#ffffff" level="M" />
        </div>
        <p className="mt-2.5 max-w-full truncate text-xs font-medium text-kopi-600">{url.replace(/^https?:\/\//, '')}</p>
      </div>

      <div className="no-print mt-4 flex items-center gap-1.5">
        <button type="button" onClick={downloadPng} className={cx(btnSecondary, 'min-h-[44px] flex-1 whitespace-nowrap px-2.5 text-xs')}>
          <Download strokeWidth={1.75} className="size-3.5 shrink-0" aria-hidden="true" />
          Unduh
        </button>
        <button
          type="button"
          onClick={() => onPrintOne(table)}
          className={cx(btnSecondary, 'min-h-[44px] flex-1 whitespace-nowrap px-2.5 text-xs')}
          aria-label={`Cetak QR ${table.name}`}
        >
          <Printer strokeWidth={1.75} className="size-3.5 shrink-0" aria-hidden="true" />
          Cetak
        </button>
        <button
          type="button"
          onClick={() => onDelete(table)}
          className="grid size-[44px] shrink-0 place-items-center rounded-[10px] border border-[#f5c7c2] bg-[#fdf1f0] text-[#b42318] hover:bg-[#fbe2df]"
          aria-label={`Hapus ${table.name}`}
        >
          <Trash2 strokeWidth={1.75} className="size-4" />
        </button>
      </div>
    </article>
  );
}

export default function TablesPage() {
  const { data: tables, loading } = useTables();
  const { data: orders } = useOrders();
  const [baseUrl, setBaseUrl] = useState(() => window.location.origin);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [printSingle, setPrintSingle] = useState(null);

  const activeByTable = useMemo(() => {
    const map = new Map();
    for (const o of orders ?? []) {
      if (ACTIVE_STATUSES.includes(o.status) && !map.has(o.tableCode)) {
        map.set(o.tableCode, o);
      }
    }
    return map;
  }, [orders]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addTable(newName);
      setNewName('');
    } finally {
      setSaving(false);
    }
  };

  const printAll = () => {
    setPrintSingle(null);
    setTimeout(() => window.print(), 80);
  };

  const printOne = (table) => {
    setPrintSingle(table);
    setTimeout(() => {
      window.print();
      setPrintSingle(null);
    }, 80);
  };

  if (loading) return <Loading text="Memuat daftar meja & QR…" />;

  const toPrint = printSingle ? [printSingle] : tables ?? [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="no-print flex flex-col gap-4 border-b border-kopi-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-kopi-950">
            Meja & QR Code
          </h1>
          <p className="mt-1 max-w-[62ch] text-sm text-kopi-600">
            {tables?.length ?? 0} meja terdaftar. Unduh atau cetak kartu QR untuk dipasang di tiap meja kedai.
          </p>
        </div>

        <button type="button" onClick={printAll} className={cx(btnPrimary, 'shrink-0 whitespace-nowrap')}>
          <Printer strokeWidth={1.75} className="size-4" aria-hidden="true" />
          Cetak semua QR
        </button>
      </header>

      {/* Tambah meja baru + pengaturan alamat QR tersembunyi rapi */}
      <section className="no-print mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <form onSubmit={handleAdd} className="flex max-w-md flex-1 gap-2">
          <label htmlFor="new-table-name" className="sr-only">
            Nama meja baru
          </label>
          <input
            id="new-table-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama meja baru (mis. Meja 13, teras barat)"
            className={input}
          />
          <button type="submit" disabled={saving} className={cx(btnPrimary, 'shrink-0 px-4')}>
            <Plus strokeWidth={1.75} className="size-4" aria-hidden="true" />
            Tambah
          </button>
        </form>

        <details className="rounded-[12px] border border-kopi-200 bg-kertas px-4 py-2.5 lg:max-w-md">
          <summary className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 text-xs font-semibold text-kopi-700 hover:text-kopi-950">
            <Settings2 strokeWidth={1.75} className="size-4 text-terakota-700" aria-hidden="true" />
            Pengaturan alamat tautan QR
          </summary>
          <div className="mt-3 space-y-2 pb-1">
            <label htmlFor="qr-base-url" className="block text-xs font-medium text-kopi-700">
              Domain website yang ditanam di kode QR
            </label>
            <input
              id="qr-base-url"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className={cx(input, 'min-h-[42px] text-xs')}
            />
            <p className="max-w-[55ch] text-xs leading-relaxed text-kopi-600">
              Ganti dengan domain resmi kedai saat sudah tayang online agar kartu QR yang dicetak permanen.
            </p>
          </div>
        </details>
      </section>

      {/* Grid meja — 2 kolom di 1024px (ada sidebar 248px), 3 kolom mulai 1280px agar tidak meluber */}
      <div className="no-print mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {(tables ?? []).map((t) => (
          <TableQrCard
            key={t.code}
            table={t}
            baseUrl={baseUrl}
            activeOrder={activeByTable.get(t.code)}
            onDelete={setDeleteTarget}
            onPrintOne={printOne}
          />
        ))}
      </div>

      {/* Lembar cetak QR rapi */}
      <div className="print-area hidden print:grid print:grid-cols-3 print:gap-6 print:p-6">
        {toPrint.map((t) => {
          const url = `${baseUrl.replace(/\/$/, '')}/meja/${t.code}`;
          return (
            <div key={t.code} className="flex flex-col items-center rounded-xl border border-black p-5 text-center text-black">
              <p className="font-display text-lg font-bold">Wedang Uwuh Bu Ngadi</p>
              <p className="mt-0.5 text-xs">Scan untuk lihat menu & pesan dari meja</p>
              <div className="my-3">
                <QRCodeCanvas value={url} size={150} fgColor="#000000" bgColor="#ffffff" level="M" />
              </div>
              <p className="text-base font-bold">{t.name}</p>
              <p className="text-xs">Kode meja: {t.code}</p>
            </div>
          );
        })}
      </div>

      <ConfirmSheet
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteTable(deleteTarget.code)}
        title={`Hapus ${deleteTarget?.name ?? ''}?`}
        description="QR meja ini tidak lagi berlaku setelah dihapus. Kamu bisa membuat meja baru kapan saja."
        confirmLabel="Ya, hapus meja"
        danger
      />
    </div>
  );
}

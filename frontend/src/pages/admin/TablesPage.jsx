import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Plus, Printer, Trash2 } from 'lucide-react';
import { addTable, deleteTable } from '../../lib/api';
import { useTables } from '../../lib/hooks';
import { Loading, btnPrimary, btnSecondary, card, cx, input } from '../../components/ui';

const BASE_KEY = 'bungadi.qrBase';

function TableQr({ table, baseUrl, onDelete }) {
  const ref = useRef(null);
  const url = `${baseUrl.replace(/\/+$/, '')}/meja/${table.code}`;

  const download = () => {
    const link = document.createElement('a');
    link.href = ref.current.querySelector('canvas').toDataURL('image/png');
    link.download = `QR-${table.name.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className={cx(card, 'flex break-inside-avoid flex-col items-center p-5 text-center')}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-kopi-500">Wedanguwuh BUNGADI</p>
      <p className="mt-1 text-2xl font-semibold">{table.name}</p>
      <div ref={ref} className="mt-4 rounded-xl border border-black/[0.06] bg-white p-3">
        <QRCodeCanvas value={url} size={168} marginSize={0} fgColor="#300c11" level="M" />
      </div>
      <p className="mt-3 text-sm font-medium">Scan untuk pesan dari meja</p>
      <p className="mt-1 max-w-full truncate text-xs text-kopi-400">{url}</p>
      <div className="no-print mt-4 flex w-full gap-2">
        <button type="button" onClick={download} className={cx(btnSecondary, 'h-9 flex-1')}>
          <Download strokeWidth={1.5} className="size-4" /> PNG
        </button>
        <button type="button" onClick={() => onDelete(table)} className="grid size-9 place-items-center rounded-xl text-red-600 hover:bg-red-50" aria-label={`Hapus ${table.name}`}>
          <Trash2 strokeWidth={1.5} className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function TablesPage() {
  const { data: tables, loading } = useTables();
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem(BASE_KEY) || window.location.origin);
  const [error, setError] = useState('');

  const changeBase = (value) => {
    setBaseUrl(value);
    localStorage.setItem(BASE_KEY, value);
  };

  const run = async (action) => {
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = (table) =>
    window.confirm(`Hapus ${table.name}? QR yang sudah dicetak untuk meja ini tidak bisa dipakai lagi.`) &&
    run(() => deleteTable(table.code));

  return (
    <div className="p-4 sm:p-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Meja & QR code</h1>
          <p className="mt-0.5 text-sm text-kopi-500">Cetak lalu tempel di setiap meja. Nomor meja otomatis terbaca saat QR dipindai.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className={btnSecondary}>
            <Printer strokeWidth={1.5} className="size-4" /> Cetak semua
          </button>
          <button type="button" onClick={() => run(() => addTable())} className={btnPrimary}>
            <Plus strokeWidth={1.5} className="size-4" /> Tambah meja
          </button>
        </div>
      </div>

      <div className={cx(card, 'no-print mt-5 p-4')}>
        <label htmlFor="base-url" className="block text-sm font-medium">Alamat website di QR</label>
        <input id="base-url" value={baseUrl} onChange={(e) => changeBase(e.target.value)} className={cx(input, 'mt-1.5 max-w-md')} />
        <p className="mt-1.5 text-xs text-kopi-500">
          Untuk uji coba dari HP, isi dengan alamat <b>Network</b> yang tampil di terminal saat menjalankan <code>npm run dev</code>,
          misalnya http://192.168.1.5:5173. Setelah online, ganti dengan domain website.
        </p>
      </div>
      {error && <p className="no-print mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

      {loading && <Loading />}
      {tables && (
        <div className="print-area mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-3">
          {tables.map((t) => (
            <TableQr key={t.code} table={t} baseUrl={baseUrl} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

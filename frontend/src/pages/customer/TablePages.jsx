import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, QrCode, TriangleAlert } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getTable } from '../../lib/api';
import { useTables } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { Loading, Logo, btnPrimary, btnSecondary, cx, input } from '../../components/ui';

function TablePicker({ onPick }) {
  const { data: tables, loading } = useTables();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submitCode = (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Masukkan kode meja, misalnya M03.');
      return;
    }
    const found = tables?.find((t) => t.code.toUpperCase() === clean);
    if (!found) {
      setError(`Kode "${clean}" tidak terdaftar. Pilih salah satu nomor meja di bawah.`);
      return;
    }
    setError('');
    onPick(found);
  };

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={submitCode} className="flex gap-2">
        <label htmlFor="manual-table-code" className="sr-only">
          Ketik kode meja
        </label>
        <input
          id="manual-table-code"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
          }}
          placeholder="Ketik kode meja (mis. M03)"
          className={input}
        />
        <button type="submit" className={cx(btnPrimary, 'shrink-0 px-4')}>
          Buka
        </button>
      </form>
      {error && (
        <p className="text-xs font-medium text-[#b42318]" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Loading text="Memuat daftar meja…" />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {(tables ?? []).map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => onPick(t)}
              className="flex min-h-[48px] flex-col items-center justify-center rounded-[12px] border border-kopi-200 bg-kertas px-2 py-2 text-center transition-colors hover:border-terakota-400 hover:bg-terakota-50"
            >
              <span className="text-sm font-semibold text-kopi-900">{t.code}</span>
              <span className="truncate text-xs text-kopi-600">{t.name.replace(', lantai 2', '')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Halaman petunjuk scan QR + cadangan pilih/ketik kode meja (Project Plan hal. 16)
export function ScanPage() {
  const navigate = useNavigate();
  const { setTable } = useSession();
  const [showPicker, setShowPicker] = useState(false);

  const pickTable = (table) => {
    setTable(table);
    navigate('/menu');
  };

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="grid size-[44px] -ml-2 place-items-center rounded-full text-kopi-700 hover:bg-kopi-100"
          aria-label="Kembali ke beranda"
        >
          <ArrowLeft strokeWidth={1.75} className="size-5" />
        </Link>
        <Logo />
        <span className="w-[44px]" aria-hidden="true" />
      </div>

      {/* Ilustrasi kartu QR meja (dekoratif, aria-hidden) */}
      <div
        aria-hidden="true"
        className="mt-5 flex h-[230px] items-center justify-center rounded-[20px] border border-kopi-200 bg-kertas-tua"
      >
        <div className="flex w-[160px] flex-col items-center rounded-[16px] border border-kopi-200 bg-kertas px-4 py-4 shadow-soft">
          <p className="font-display text-[15px] font-bold text-kopi-900">Bu Ngadi</p>
          <div className="mt-2 rounded-[10px] border border-kopi-100 p-1.5">
            <QRCodeSVG value={`${window.location.origin}/meja/M03`} size={96} fgColor="#221b15" />
          </div>
          <p className="mt-2 text-xs font-semibold text-kopi-800">Meja 3</p>
        </div>
      </div>

      <h1 className="mt-6 font-display text-[32px] font-bold leading-tight text-kopi-950">
        Scan QR di mejamu
      </h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-kopi-600">
        Pesan langsung dari meja tanpa antre di kasir. Nomor meja tercatat otomatis dari kartu QR.
      </p>

      <ol className="mt-5 space-y-2.5 text-[14px] text-kopi-800">
        {[
          'Buka kamera HP atau pemindai QR bawaan.',
          'Arahkan ke kode QR di kartu kecil meja.',
          'Ketuk tautan yang muncul untuk membuka menu.',
        ].map((step, i) => (
          <li key={step} className="flex items-center gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-terakota-100 text-xs font-semibold text-terakota-800">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-2.5">
        <button type="button" onClick={() => setShowPicker((v) => !v)} className={cx(btnPrimary, 'w-full')}>
          <QrCode strokeWidth={1.75} className="size-4" aria-hidden="true" />
          {showPicker ? 'Sembunyikan daftar meja' : 'Kamera bermasalah? Pilih meja manual'}
        </button>
        <Link to="/menu" className={cx(btnSecondary, 'w-full')}>
          Lihat daftar menu dulu
        </Link>
      </div>

      {showPicker && (
        <section aria-label="Pilih nomor meja manual" className="mt-4 rounded-[16px] border border-kopi-200 bg-kopi-50 p-4">
          <p className="text-sm font-semibold text-kopi-900">Pilih atau ketik kode meja</p>
          <p className="mt-0.5 text-xs text-kopi-600">Kode tercetak di bawah QR meja, misalnya M01–M12.</p>
          <TablePicker onPick={pickTable} />
        </section>
      )}
    </div>
  );
}

// Alamat yang dituju dari QR code meja (/meja/M03)
export function TableEntryPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { setTable } = useSession();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setNotFound(false);
    getTable(code).then((table) => {
      if (!active) return;
      if (table) {
        setTable(table);
        navigate('/menu', { replace: true });
      } else {
        setNotFound(true);
      }
    });
    return () => {
      active = false;
    };
  }, [code, navigate, setTable]);

  if (!notFound) return <Loading text="Membuka meja…" />;

  const pickTable = (table) => {
    setTable(table);
    navigate('/menu', { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-6 pb-8">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-[#fdf1f0] text-[#b42318]">
          <TriangleAlert strokeWidth={1.75} className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-[30px] font-bold leading-tight text-kopi-950">
          Kode meja tidak dikenal
        </h1>
        <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-kopi-600">
          Kode <strong className="font-semibold text-kopi-900">{code}</strong> belum terdaftar. Scan ulang QR di meja, atau pilih nomor mejamu di bawah ini.
        </p>
      </div>

      <section aria-label="Pilih meja pengganti" className="mt-6 rounded-[16px] border border-kopi-200 bg-kopi-50 p-4">
        <p className="text-sm font-semibold text-kopi-900">Pilih nomor meja yang sesuai</p>
        <TablePicker onPick={pickTable} />
      </section>

      <div className="mt-5 flex gap-2">
        <Link to="/pesan" className={cx(btnSecondary, 'flex-1')}>
          Petunjuk scan QR
        </Link>
        <Link to="/menu" className={cx(btnSecondary, 'flex-1')}>
          Lihat menu
        </Link>
      </div>
    </div>
  );
}

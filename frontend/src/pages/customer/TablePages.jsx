import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import { getTable } from '../../lib/api';
import { useTables } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { CupMark, Loading, cx, input } from '../../components/ui';

// /pesan: Mulai pesan persis sesuai Figma node 28:594 & Kode meja tidak dikenal 28:704
export function ScanPage() {
  const navigate = useNavigate();
  const { table } = useSession();
  const { data: tables } = useTables();
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState('M03');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    navigate(`/meja/${manualCode.trim().toUpperCase()}`);
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-white px-[20px] pt-[16px] pb-[28px]">
      <div className="flex flex-col items-center gap-[20px]">
        {/* Brand Kedai (node 28:597) */}
        <div className="flex items-center gap-[10px]">
          <div className="grid size-[32px] place-items-center rounded-[10px] bg-[#7a4b2a] text-white">
            <CupMark className="size-[18px]" />
          </div>
          <span className="text-[16px] font-semibold leading-[24px] text-[#18181b]">Wedang Uwuh Bu Ngadi</span>
        </div>

        {/* Gambar Kartu QR (node 28:604) */}
        <div className="flex h-[290px] w-full items-center justify-center rounded-[24px] bg-[#f6eee7]">
          <div className="flex w-[165px] flex-col items-center gap-[8px] rounded-[12px] border border-[#e4e4e7] bg-white p-[15px] shadow-2xs">
            <div className="flex items-center gap-[6px]">
              <div className="grid size-[21px] place-items-center rounded-[6px] bg-[#7a4b2a] text-white">
                <CupMark className="size-[12px]" />
              </div>
              <span className="text-[9px] font-medium leading-[12px] text-[#18181b]">Wedang Uwuh Bu Ngadi</span>
            </div>
            <span className="text-[12px] font-semibold leading-[18px] text-[#18181b]">Scan untuk pesan</span>
            <div className="my-0.5 rounded-lg bg-white p-1">
              <QRCodeSVG value={`${window.location.origin}/meja/M03`} size={104} />
            </div>
            <span className="text-[18px] font-semibold leading-[24px] tracking-[-0.18px] text-[#18181b]">
              {table ? table.name.split(',')[0] : 'Meja 3'}
            </span>
            <span className="text-[9px] font-medium leading-[12px] text-[#71717a]">
              Kode meja {table ? table.code : 'M03'}
            </span>
          </div>
        </div>

        {/* Judul & Langkah (node 28:618) */}
        <div className="text-center">
          <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.24px] text-[#18181b]">
            Scan QR di mejamu
          </h1>
          <p className="mt-[6px] text-[14px] leading-[20px] text-[#71717a]">
            Pesan langsung dari meja, tanpa antre di kasir.
          </p>
        </div>

        <ol className="flex w-full max-w-[260px] flex-col gap-[10px]">
          {['Buka kamera HP', 'Arahkan ke QR di meja', 'Ketuk tautan yang muncul'].map((step, i) => (
            <li key={step} className="flex items-center gap-[12px]">
              <span className="grid size-[28px] shrink-0 place-items-center rounded-[14px] bg-[#f4f4f5] text-[14px] font-semibold text-[#18181b]">
                {i + 1}
              </span>
              <span className="text-[14px] leading-[20px] text-[#18181b]">{step}</span>
            </li>
          ))}
        </ol>

        {manualOpen && (
          <form onSubmit={handleManualSubmit} className="w-full space-y-2 rounded-[16px] border border-[#e4e4e7] bg-[#fafafa] p-3.5">
            <label className="block text-[12px] font-semibold text-[#18181b]">Masukkan kode meja (contoh: M03)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="M03"
                className={cx(input, 'h-[40px] uppercase')}
              />
              <button
                type="submit"
                className="h-[40px] shrink-0 rounded-[10px] bg-[#7a4b2a] px-4 text-[14px] font-semibold text-white hover:bg-[#5e3920]"
              >
                Buka Meja
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(tables ?? []).slice(0, 6).map((t) => (
                <Link
                  key={t.code}
                  to={`/meja/${t.code}`}
                  className="rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1 text-[12px] font-medium text-[#18181b] hover:border-[#7a4b2a] hover:bg-[#f6eee7]"
                >
                  {t.code}
                </Link>
              ))}
            </div>
          </form>
        )}
      </div>

      {/* Tombol Bawah (node 28:633) */}
      <div className="mt-6 flex flex-col items-center gap-[8px]">
        <Link
          to={table ? '/menu' : '/meja/M03'}
          className="flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[12px] bg-[#7a4b2a] px-[20px] text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-[#5e3920]"
        >
          <QrCode strokeWidth={1.75} className="size-[20px]" />
          {table ? `Lanjut pesan di ${table.name.split(',')[0]}` : 'Buka pemindai QR (Simulasi Meja 3)'}
        </Link>
        <button
          type="button"
          onClick={() => setManualOpen((o) => !o)}
          className="flex h-[36px] items-center justify-center px-[4px] text-[14px] font-semibold leading-[20px] text-[#7a4b2a]"
        >
          Ketik kode meja
        </button>
      </div>
    </div>
  );
}

// /meja/:code: alamat yang tertanam di QR code meja (plus tampilan Kode meja tidak dikenal sesuai Figma node 28:704)
export function TableEntryPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { setTable } = useSession();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
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
  }, [code]);

  if (!notFound) return <Loading text="Menyiapkan meja…" />;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-[24px] text-center">
      <div className="grid size-[64px] place-items-center rounded-[20px] bg-[#fef3f2] text-[#b42318]">
        <QrCode strokeWidth={1.5} className="size-[32px]" />
      </div>
      <h1 className="mt-[20px] text-[22px] font-semibold leading-[30px] text-[#18181b]">Kode meja tidak dikenal</h1>
      <p className="mt-[8px] max-w-xs text-[14px] leading-[20px] text-[#71717a]">
        Kode meja <b>{code}</b> tidak terdaftar di sistem kedai. Coba scan ulang QR di mejamu atau pilih meja di bawah.
      </p>
      <Link
        to="/pesan"
        className="mt-[24px] flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#7a4b2a] px-[20px] text-[16px] font-semibold text-white hover:bg-[#5e3920]"
      >
        Scan ulang QR meja
      </Link>
    </div>
  );
}

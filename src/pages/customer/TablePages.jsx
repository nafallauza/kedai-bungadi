import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Camera, QrCode, ScanLine } from 'lucide-react';
import { getTable } from '../../lib/api';
import { useTables } from '../../lib/hooks';
import { useSession } from '../../lib/session';
import { EmptyState, Loading, Logo, btnPrimary, card, cx } from '../../components/ui';

// /pesan: dibuka bila pelanggan belum scan QR meja
export function ScanPage() {
  const { table } = useSession();
  const { data: tables } = useTables();

  return (
    <div className="px-5 py-8">
      <Logo />
      {table ? (
        <div className={cx(card, 'mt-8 p-5')}>
          <p className="text-sm text-kopi-500">Kamu sedang di</p>
          <p className="text-2xl font-semibold">{table.name}</p>
          <Link to="/menu" className={cx(btnPrimary, 'mt-5 w-full')}>
            Lanjut pesan <ArrowRight strokeWidth={1.5} className="size-4" />
          </Link>
          <p className="mt-3 text-center text-xs text-kopi-500">Pindah meja? Scan QR code di meja barumu.</p>
        </div>
      ) : (
        <div className="mt-10 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-terakota-50 text-terakota-700">
            <QrCode strokeWidth={1.5} className="size-8" />
          </span>
          <h1 className="mt-5 text-xl font-semibold">Scan QR code di mejamu</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-kopi-500">Pesan langsung dari meja tanpa perlu antre di kasir.</p>
          <ol className="mx-auto mt-6 max-w-xs space-y-3 text-left text-sm">
            {[
              [Camera, 'Buka kamera HP'],
              [ScanLine, 'Arahkan ke QR code yang ada di meja'],
              [ArrowRight, 'Ketuk tautan yang muncul'],
            ].map(([Icon, text], i) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/[0.08] bg-white text-xs font-semibold">
                  {i + 1}
                </span>
                <Icon strokeWidth={1.5} className="size-4 text-kopi-400" />
                {text}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Untuk uji coba tanpa QR. Hapus saat dipakai di kedai. */}
      <div className="mt-12 border-t border-dashed border-black/[0.1] pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-kopi-400">Mode demo · pilih meja</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {(tables ?? []).map((t) => (
            <Link
              key={t.code}
              to={`/meja/${t.code}`}
              className="rounded-xl border border-black/[0.06] bg-white py-2 text-center text-sm font-medium hover:border-terakota-200 hover:text-terakota-700"
            >
              {t.name.replace('Meja ', 'M')}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// /meja/:code: alamat yang tertanam di QR code meja
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
    // setTable berubah tiap render; cukup jalan sekali per kode meja
  }, [code]);

  if (!notFound) return <Loading text="Menyiapkan meja…" />;
  return (
    <EmptyState icon={QrCode} title="QR code tidak dikenali">
      Kode meja <b>{code}</b> tidak terdaftar. Coba scan ulang, atau tanyakan ke kasir.
      <Link to="/pesan" className={cx(btnPrimary, 'mt-5 w-full')}>
        Kembali
      </Link>
    </EmptyState>
  );
}

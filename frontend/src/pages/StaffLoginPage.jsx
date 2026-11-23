import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { loginStaff } from '../lib/api';
import { site } from '../data/site';
import { Logo, btnPrimary, btnSecondary, input } from '../components/ui';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const target = location.state?.from || '/kasir';

  const [username, setUsername] = useState('kasir1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await loginStaff({ username, password });
      const dest = location.state?.from || (session.role === 'admin' ? '/admin' : '/kasir');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const quickFill = (user) => {
    setUsername(user);
    setPassword('bungadi2026');
    setError('');
  };

  return (
    <div className="min-h-dvh bg-kopi-50 lg:grid lg:grid-cols-2">
      {/* Kiri: suasana asli kedai di Patuk (tampil di layar lebar) */}
      <div className="relative hidden overflow-hidden bg-kopi-950 lg:block">
        <img
          src={site.photos.hero}
          alt="Balkon kayu Wedang Uwuh Bu Ngadi menghadap perbukitan Patuk dan Merapi"
          width={1440}
          height={960}
          className="h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kopi-950/90 via-kopi-950/30 to-transparent" />
        <div className="absolute right-10 bottom-10 left-10 text-kertas">
          <Logo light subtitle="Patuk, Gunungkidul" />
          <p className="mt-4 max-w-md font-display text-[32px] font-semibold leading-tight text-kertas">
            Kelola antrean meja, menu harian, dan laporan kedai dari satu layar.
          </p>
          <p className="mt-2 text-sm text-kopi-200">{site.shortAddress}</p>
        </div>
      </div>

      {/* Kanan: formulir masuk staf */}
      <main className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-[400px]">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-kopi-600 hover:text-kopi-900"
          >
            <ArrowLeft strokeWidth={1.75} className="size-4" aria-hidden="true" /> Kembali ke beranda
          </Link>

          <div className="mt-6 lg:hidden">
            <Logo subtitle="Kasir & Pengelola" />
          </div>

          <h1 className="mt-6 font-display text-[36px] font-bold leading-tight tracking-[-0.02em] text-kopi-900">
            Masuk untuk staf
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-kopi-600">
            Khusus kasir, dapur, dan pemilik kedai. Pelanggan tidak perlu masuk — cukup scan QR di meja.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="staff-user" className="block text-sm font-semibold text-kopi-800">
                Nama pengguna
              </label>
              <input
                id="staff-user"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kasir1 atau admin"
                className={`${input} mt-1.5`}
              />
            </div>

            <div>
              <label htmlFor="staff-pass" className="block text-sm font-semibold text-kopi-800">
                Kata sandi
              </label>
              <input
                id="staff-pass"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi staf"
                className={`${input} mt-1.5`}
              />
            </div>

            {error && (
              <p className="rounded-[12px] border border-[#f5c7c2] bg-[#fdf1f0] px-3.5 py-2.5 text-sm text-[#b42318]" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
              <KeyRound strokeWidth={1.75} className="size-4" aria-hidden="true" />
              {loading ? 'Memeriksa akun…' : 'Masuk ke dashboard'}
            </button>
          </form>

          <div className="mt-6 rounded-[14px] border border-kopi-200 bg-kertas p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-kopi-800">
              <ShieldCheck strokeWidth={1.75} className="size-4 text-terakota-700" aria-hidden="true" />
              Akun uji coba cepat
            </p>
            <p className="mt-1 text-xs text-kopi-600">
              Sandi: <code className="rounded bg-kopi-100 px-1.5 py-0.5 font-semibold text-kopi-900">bungadi2026</code> · Tujuan:{' '}
              <code className="text-kopi-800">{target}</code>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => quickFill('kasir1')} className={`${btnSecondary} min-h-[44px] px-3 text-xs`}>
                Isi akun Kasir
              </button>
              <button type="button" onClick={() => quickFill('admin')} className={`${btnSecondary} min-h-[44px] px-3 text-xs`}>
                Isi akun Pemilik
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

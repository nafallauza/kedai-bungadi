import { Link } from 'react-router-dom';
import { btnPrimary, btnSecondary, Logo } from '../components/ui';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-kopi-50 px-5 text-center">
      <Logo />
      <h1 className="mt-8 font-display text-[40px] font-bold leading-tight text-kopi-950">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-kopi-600">
        Tautan yang dibuka mungkin sudah berubah atau tidak tersedia. Kembali ke beranda atau buka daftar menu kedai.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className={btnPrimary}>
          Ke beranda
        </Link>
        <Link to="/menu" className={btnSecondary}>
          Lihat menu
        </Link>
      </div>
    </main>
  );
}

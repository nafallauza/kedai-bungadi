import { Link } from 'react-router-dom';
import { Logo, btnPrimary } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-8 text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-kopi-500">Alamat yang kamu buka tidak ada. Kalau sedang di kedai, scan ulang QR code di meja.</p>
      <Link to="/" className={`${btnPrimary} mt-6`}>
        Ke beranda
      </Link>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin, QrCode, Star, Wine } from 'lucide-react';
import { categories } from '../data/menu';
import { site, whatsappUrl } from '../data/site';
import { useMenu } from '../lib/hooks';
import { priceRange } from '../utils/order';
import MerapiWindow, { WindowIllustration } from '../components/MerapiWindow';
import { BenchScene, CarafeScene, LampScene } from '../components/SceneIllustrations';
import { InstagramIcon, Logo, Photo, btnLight, btnOutlineLight, btnPrimary, cx } from '../components/ui';

const reservasi = whatsappUrl('Halo Bu Ngadi, saya ingin reservasi tempat untuk rombongan.');
const rempah = ['Secang', 'Jahe', 'Cengkeh', 'Kayu manis', 'Daun pala', 'Serai', 'Gula batu'];
const scenes = { lampu: LampScene, karaf: CarafeScene, bangku: BenchScene, jendela: () => <WindowIllustration fit="meet" /> };
// Susunan petak galeri 4 foto: besar, lebar, lalu dua kecil
const gallerySpan = ['sm:row-span-2 lg:col-span-2', 'lg:col-span-2', '', 'sm:col-span-2 lg:col-span-1'];

// Harga ditulis seperti di buku menu kedai: 8K, 16K/18K
function shortPrice(item) {
  const [min, max] = priceRange(item);
  return min === max ? `${min / 1000}K` : `${min / 1000}K/${max / 1000}K`;
}

function serveMark(item) {
  if (item.option?.label === 'Penyajian') return 'H/I';
  if (item.option?.label === 'Dimasak') return '★';
  if (item.tags.includes('panas')) return 'panas';
  if (item.tags.includes('es')) return 'es';
  return null;
}

function MenuBoard({ menu }) {
  const [active, setActive] = useState('wedang');
  const items = menu.filter((m) => m.category === active);

  return (
    <div>
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={cx(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active === c.id ? 'bg-kopi-950 text-kertas' : 'border border-kopi-900/15 text-kopi-700 hover:bg-kertas-tua/60',
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-x-12 gap-y-5 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className={cx(!item.available && 'opacity-50')}>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-wide text-kopi-950 uppercase">{item.name}</span>
              {serveMark(item) && <span className="text-xs italic text-kopi-500">{serveMark(item)}</span>}
              {item.tags.includes('khas') && (
                <span className="rounded-full bg-terakota-700 px-2 py-px text-[10px] font-semibold tracking-wider text-white uppercase">
                  Andalan
                </span>
              )}
              <span className="mb-1 min-w-6 flex-1 border-b border-dotted border-kopi-900/30" />
              <span className="font-bold text-terakota-700 tabular-nums">{item.available ? shortPrice(item) : 'Habis'}</span>
            </div>
            {item.description && <p className="mt-0.5 text-sm italic text-kopi-600">{item.description}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-kopi-500">
        Harga dalam ribuan rupiah. H/I = panas atau es · ★ = goreng atau bakar. Harga dapat berubah sewaktu-waktu.
      </p>
    </div>
  );
}

export default function LandingPage() {
  const { data: menu } = useMenu();

  return (
    <div className="bg-kopi-950 text-kertas">
      {/* Hero: malam di kedai */}
      <section className="grain relative">
        <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo light />
          <nav className="hidden items-center gap-8 text-sm text-kertas/70 md:flex">
            <a href="#menu" className="hover:text-kertas">Menu</a>
            <a href="#suasana" className="hover:text-kertas">Suasana</a>
            <a href="#lokasi" className="hover:text-kertas">Lokasi</a>
          </nav>
          <a href={reservasi} target="_blank" rel="noreferrer" className={cx(btnOutlineLight, 'h-10')}>
            Reservasi
          </a>
        </header>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-8 pb-20 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:pt-14 md:pb-28">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-kertas/55 uppercase">Patuk · Gunungkidul</p>
            <h1 className="mt-5 font-display text-[3.4rem] leading-[0.95] font-semibold tracking-tight sm:text-7xl lg:text-[5.5rem]">
              Melambat <em className="font-medium text-[#e8c98a]">sejenak</em>
              <br />
              di Yogyakarta.
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-kertas/70">
              Wedang uwuh racikan rempah, kopi tubruk, dan masakan rumahan. Duduk di bangku kayu, pandangan lepas ke
              Merapi dan perbukitan.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#menu" className={btnLight}>
                Lihat menu <ArrowRight strokeWidth={1.5} className="size-4" />
              </a>
              <a href={site.mapsUrl} target="_blank" rel="noreferrer" className={btnOutlineLight}>
                <MapPin strokeWidth={1.5} className="size-4" /> Petunjuk arah
              </a>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-2 gap-6 border-t border-kertas/10 pt-6 text-sm">
              <div>
                <dt className="text-kertas/50">Buka</dt>
                <dd className="mt-1 font-medium">10.00 – 20.00 · Selasa libur</dd>
              </div>
              <div>
                <dt className="text-kertas/50">Google Maps</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium">
                  <Star strokeWidth={1.5} className="size-4 fill-[#e8c98a] text-[#e8c98a]" />
                  {site.rating.score} · {site.rating.count} ulasan
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <MerapiWindow src={site.photos.hero} className="aspect-[4/5]" />
            <p className="mt-3 text-center font-display text-lg italic text-kertas/55">Pemandangan dari jendela kedai</p>
          </div>
        </div>
      </section>

      {/* Rempah wedang uwuh */}
      <div className="border-y border-kertas/10 bg-kopi-900">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center font-display text-xl text-kertas/70 italic sm:px-6 sm:text-2xl">
          {rempah.join('  ·  ')}
        </p>
      </div>

      {/* Buku menu */}
      <section id="menu" className="paper scroll-mt-4 text-kopi-950">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-terakota-700 uppercase">Buku menu</p>
              <h2 className="mt-3 font-display text-5xl leading-none font-semibold tracking-tight sm:text-6xl">
                Dari wedang uwuh sampai nasi pecel.
              </h2>
            </div>
            <p className="max-w-md text-kopi-700 md:justify-self-end">
              Wedang uwuh mulai 8 ribu, kopi tubruk, jamu dingin, dan masakan rumahan dengan lalapan & sambel.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-kopi-900/10 bg-kertas/70 p-6 sm:p-10">
            {menu && <MenuBoard menu={menu} />}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-3xl bg-kopi-950 p-6 text-kertas">
              <QrCode strokeWidth={1.5} className="mt-0.5 size-6 shrink-0 text-[#e8c98a]" />
              <div>
                <p className="font-semibold">Sudah di kedai?</p>
                <p className="mt-1 text-sm text-kertas/65">
                  Scan QR code di meja, pilih menu dari HP, pesanan langsung masuk ke dapur tanpa antre di kasir.
                </p>
              </div>
            </div>
            <a
              href={site.tokopediaUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-3xl border border-kopi-900/10 bg-kertas/70 p-6 transition-colors hover:bg-kertas"
            >
              <Wine strokeWidth={1.5} className="mt-0.5 size-6 shrink-0 text-terakota-700" />
              <div className="flex-1">
                <p className="font-semibold">Bawa pulang wedang uwuh</p>
                <p className="mt-1 text-sm text-kopi-600">Rempah wedang uwuh kemasan tersedia di Tokopedia.</p>
              </div>
              <ArrowUpRight strokeWidth={1.5} className="size-5 text-kopi-400 group-hover:text-terakota-700" />
            </a>
          </div>
        </div>
      </section>

      {/* Suasana */}
      <section id="suasana" className="grain scroll-mt-4">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-kertas/55 uppercase">Suasana</p>
              <h2 className="mt-3 font-display text-5xl leading-none font-semibold tracking-tight sm:text-6xl">
                Bangku kayu, lampu anyaman, dan Merapi di jendela.
              </h2>
            </div>
            <a href={site.instagramUrl} target="_blank" rel="noreferrer" className={btnOutlineLight}>
              <InstagramIcon className="size-4" /> @{site.instagram}
            </a>
          </div>

          <div className="mt-12 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.photos.gallery.map((g, i) => {
              const Scene = scenes[g.scene] ?? LampScene;
              return (
                <figure key={g.src} className={cx('relative overflow-hidden rounded-3xl bg-kopi-900', gallerySpan[i])}>
                  <Photo src={g.src} alt={g.caption} className="h-full w-full object-cover" fallback={<Scene />} />
                  <div className="grain pointer-events-none absolute inset-0" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kopi-950/80 to-transparent p-5 pt-12 font-display text-lg italic text-kertas">
                    {g.caption}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rombongan */}
      <section className="paper text-kopi-950">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-terakota-700 uppercase">Rombongan & acara</p>
            <h2 className="mt-3 font-display text-5xl leading-none font-semibold tracking-tight">Datang beramai-ramai?</h2>
            <p className="mt-5 max-w-md text-kopi-700">
              Sekolah, komunitas, atau keluarga besar. Kabari kami lebih dulu supaya tempat dan pesanan siap. Untuk acara,
              tempat bisa disewa hingga {site.eventCapacity}.
            </p>
            <a href={reservasi} target="_blank" rel="noreferrer" className={cx(btnPrimary, 'mt-8')}>
              Reservasi lewat WhatsApp
            </a>
          </div>
          <ol className="divide-y divide-kopi-900/10 border-y border-kopi-900/10">
            {[
              ['Scan QR di meja', 'Setiap orang bisa membuka menu dari HP masing-masing.'],
              ['Pilih menu & kirim', 'Ada bantuan pilih menu untuk rombongan sesuai jumlah orang dan anggaran.'],
              ['Pesanan diantar', 'Pesanan langsung masuk ke kasir & dapur. Bayar di kasir sebelum pulang.'],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-6 py-6">
                <span className="text-3xl leading-none font-light text-terakota-700 tabular-nums">0{i + 1}</span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-kopi-600">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lokasi */}
      <section id="lokasi" className="grain scroll-mt-4">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-kertas/55 uppercase">Lokasi</p>
            <h2 className="mt-3 font-display text-5xl leading-none font-semibold tracking-tight">Mampir ke kedai</h2>
            <p className="mt-6 flex gap-3 text-kertas/75">
              <MapPin strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-[#e8c98a]" />
              {site.address}
            </p>
            <table className="mt-8 w-full max-w-sm text-sm">
              <tbody className="divide-y divide-kertas/10">
                {site.hours.map((h) => (
                  <tr key={h.day}>
                    <td className="py-3 text-kertas/60">{h.day}</td>
                    <td className={cx('py-3 text-right font-medium', h.time === 'Libur' && 'text-[#e8c98a]')}>{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={site.mapsUrl} target="_blank" rel="noreferrer" className={btnLight}>
                Buka Google Maps
              </a>
              <a href={whatsappUrl('Halo Bu Ngadi, mau tanya.')} target="_blank" rel="noreferrer" className={btnOutlineLight}>
                WhatsApp
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-kertas/10 bg-kopi-900">
            <iframe
              title="Peta lokasi Wedang Uwuh Bu Ngadi"
              src={site.mapsEmbed}
              className="h-80 w-full md:h-full md:min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-kertas/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-xs text-kertas/50 sm:px-6">
          <Logo light />
          <span>
            Prototype Capstone Asah 2026 · A26-CS104 ·{' '}
            <Link to="/demo" className="underline-offset-2 hover:underline">
              Halaman demo
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

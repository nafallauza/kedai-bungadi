import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  QrCode,
  Star,
  Users,
} from 'lucide-react';
import { site, whatsappUrl } from '../data/site';
import { initialMenu } from '../data/menu';
import { formatRupiah } from '../utils/format';
import { InstagramIcon, Logo, btnPrimary, btnSecondary, cx } from '../components/ui';

const featuredIds = ['wedang-uwuh-bungadi', 'madu-jeruk', 'kombucha', 'nasi-pecel'];
const featuredMenu = featuredIds
  .map((id) => initialMenu.find((m) => m.id === id))
  .filter(Boolean);

const steps = [
  {
    num: '1',
    title: 'Duduk, lalu scan QR di meja',
    desc: 'Arahkan kamera HP ke kartu QR di mejamu. Nomor meja tercatat otomatis tanpa mengunduh aplikasi.',
  },
  {
    num: '2',
    title: 'Pilih menu bersama satu meja',
    desc: 'Tiap orang memesan dari HP sendiri. Datang rombongan? Pakai Asisten Tanya Menu untuk hitung anggaran.',
  },
  {
    num: '3',
    title: 'Diantar ke meja, bayar dengan tenang',
    desc: 'Pantau status pesanan langsung dari HP. Bayar di kasir sebelum pulang atau lewat QRIS kedai.',
  },
];

const groupSample = [
  { name: '10× Wedang Uwuh Bu Ngadi', price: 100000 },
  { name: '6× Madu Jeruk', price: 72000 },
  { name: '4× Beras Kencur', price: 40000 },
  { name: '8× Mendoan', price: 64000 },
];
const groupSampleTotal = groupSample.reduce((s, r) => s + r.price, 0);

const wrap = 'mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 xl:px-16';

export default function LandingPage() {
  const waReservation = whatsappUrl(
    'Halo Bu Ngadi, kami berencana datang rombongan ke Wedang Uwuh Bu Ngadi di Patuk. Boleh info ketersediaan meja lantai 2?',
  );

  return (
    <div className="min-h-dvh bg-kopi-50 text-kopi-900">
      {/* Header penuh dengan tepi kiri-kanan sejajar di seluruh layar */}
      <header className="sticky top-0 z-30 border-b border-kopi-200/90 bg-kertas/95 backdrop-blur-sm">
        <div className={cx(wrap, 'flex h-[72px] items-center justify-between gap-3')}>
          <Link to="/" aria-label="Beranda Wedang Uwuh Bu Ngadi" className="min-w-0 shrink">
            <Logo />
          </Link>

          <nav aria-label="Navigasi beranda" className="hidden items-center gap-1 md:flex">
            {[
              { href: '#menu-pilihan', label: 'Menu' },
              { href: '#cara-pesan', label: 'Cara pesan' },
              { href: '#rombongan', label: 'Rombongan' },
              { href: '#lokasi', label: 'Lokasi' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex min-h-[44px] items-center rounded-[10px] px-4 text-[14px] font-medium text-kopi-700 transition-colors hover:bg-kopi-100 hover:text-kopi-950"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            to="/menu"
            className={cx(btnPrimary, 'min-h-[44px] shrink-0 whitespace-nowrap px-3.5 text-[13px] sm:px-5 sm:text-[14px]')}
          >
            Lihat menu
          </Link>
        </div>
      </header>

      <main>
        {/* Layar 1: Hero penuh 1 viewport, proporsional dari HP 320px sampai monitor 1920px */}
        <section className="flex min-h-[calc(100svh-72px)] items-center py-8 sm:py-12 lg:py-14">
          <div className={cx(wrap, 'grid items-center gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16')}>
            <div className="lg:col-span-5">
              <h1 className="font-display text-[36px] font-bold leading-[1.03] tracking-[-0.025em] text-kopi-950 sm:text-[52px] lg:text-[62px] xl:text-[72px] 2xl:text-[78px]">
                Wedang hangat dan masakan rumahan di perbukitan Patuk
              </h1>
              <p className="mt-5 max-w-[46ch] text-[15px] leading-[1.7] text-kopi-700 sm:text-[16px] xl:text-[17px]">
                Melambat sejenak di jalur Patuk–Nglanggeran menghadap Merapi. Di kedai, cukup scan QR di meja untuk memesan tanpa antre di kasir.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/menu" className={cx(btnPrimary, 'whitespace-nowrap')}>
                  Lihat daftar menu
                  <ArrowRight strokeWidth={1.75} className="size-4" aria-hidden="true" />
                </Link>
                <a href={site.mapsUrl} target="_blank" rel="noreferrer" className={cx(btnSecondary, 'whitespace-nowrap')}>
                  <MapPin strokeWidth={1.75} className="size-4 text-terakota-700" aria-hidden="true" />
                  Petunjuk arah
                </a>
              </div>

              <dl className="mt-8 grid gap-y-2.5 border-t border-kopi-200 pt-5 text-[14px] text-kopi-700 sm:flex sm:flex-wrap sm:gap-x-6">
                <div className="flex items-center gap-2">
                  <Clock strokeWidth={1.75} className="size-4 shrink-0 text-terakota-700" aria-hidden="true" />
                  <dd>Buka 10.00–20.00, Selasa libur</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Star strokeWidth={1.75} className="size-4 shrink-0 fill-terakota-600 text-terakota-600" aria-hidden="true" />
                  <dd>
                    <strong className="font-semibold text-kopi-950">{site.rating.score}</strong> ({site.rating.count} ulasan Google Maps)
                  </dd>
                </div>
              </dl>
            </div>

            {/* Kolase foto arsitektural penuh di kanan */}
            <div className="grid gap-3.5 lg:col-span-7">
              <div className="overflow-hidden rounded-[20px] border border-kopi-200 bg-kopi-100 shadow-soft">
                <img
                  src={site.photos.hero}
                  alt="Meja kayu di lantai dua Wedang Uwuh Bu Ngadi menghadap perbukitan Patuk dan Gunung Merapi"
                  width={1440}
                  height={960}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 hover:scale-[1.02] lg:aspect-[16/9.2]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="overflow-hidden rounded-[18px] border border-kopi-200 bg-kopi-100 shadow-soft">
                  <img
                    src={site.photos.wedangAsli}
                    alt="Wedang uwuh asli dalam karaf kaca dan gelas kecil di meja kayu kedai"
                    width={864}
                    height={1024}
                    className="aspect-[16/10] w-full object-cover object-[50%_72%] transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
                <div className="overflow-hidden rounded-[18px] border border-kopi-200 bg-kopi-100 shadow-soft">
                  <img
                    src={site.photos.jamuPatuk}
                    alt="Tiga gelas jamu beras kencur, gula asem, dan kunir asem di balkon kayu menghadap lembah Patuk"
                    width={798}
                    height={1024}
                    className="aspect-[16/10] w-full object-cover object-[50%_74%] transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layar 2: Menu pilihan bergaya editorial (tanpa kartu kotak kaku) */}
        <section id="menu-pilihan" className="border-y border-kopi-200 bg-kertas py-16 lg:py-24">
          <div className={wrap}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-[36px] font-bold leading-tight tracking-[-0.02em] text-kopi-950 sm:text-[46px]">
                  Yang paling sering dipesan
                </h2>
                <p className="mt-2 max-w-[56ch] text-[15px] text-kopi-600">
                  Disiapkan hangat dari dapur Bu Ngadi. Sebagian besar minuman bisa dipesan panas atau es.
                </p>
              </div>
              <Link to="/menu" className={cx(btnSecondary, 'shrink-0 self-start whitespace-nowrap sm:self-auto')}>
                Lihat semua {initialMenu.length} menu
                <ArrowRight strokeWidth={1.75} className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {featuredMenu.map((dish) => (
                <Link key={dish.id} to="/menu" className="group flex flex-col">
                  <div className="overflow-hidden rounded-[16px] border border-kopi-200/80 bg-kopi-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-2 border-b border-kopi-200 pb-2.5">
                    <h3 className="text-[16px] font-semibold text-kopi-950 transition-colors group-hover:text-terakota-700">
                      {dish.name}
                    </h3>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums text-terakota-700">
                      {formatRupiah(dish.price)}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-kopi-600">{dish.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Layar 3: Cara pesan lewat QR */}
        <section id="cara-pesan" className="bg-kertas-tua/65 py-16 lg:py-24">
          <div className={cx(wrap, 'grid items-center gap-10 lg:grid-cols-12 lg:gap-14')}>
            <div className="lg:col-span-7">
              <h2 className="font-display text-[36px] font-bold leading-tight tracking-[-0.02em] text-kopi-950 sm:text-[46px]">
                Pesan dari meja, tanpa antre di kasir
              </h2>
              <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-kopi-700">
                Setiap meja punya kartu QR sendiri. Pesanan langsung masuk ke layar dapur dan kasir lengkap dengan nomor meja serta nama pemesan.
              </p>

              <ol className="mt-8 divide-y divide-kopi-200 border-y border-kopi-200">
                {steps.map((s) => (
                  <li key={s.num} className="flex gap-5 py-5">
                    <span className="font-display text-[32px] font-bold leading-none text-terakota-700">
                      {s.num}
                    </span>
                    <div>
                      <h3 className="text-[16px] font-semibold text-kopi-950">{s.title}</h3>
                      <p className="mt-1 text-[14px] leading-relaxed text-kopi-600">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/pesan" className={cx(btnPrimary, 'whitespace-nowrap')}>
                  <QrCode strokeWidth={1.75} className="size-4" aria-hidden="true" />
                  Cara scan QR meja
                </Link>
                <Link to="/menu" className={cx(btnSecondary, 'whitespace-nowrap')}>
                  Intip daftar menu
                </Link>
              </div>
            </div>

            {/* Pratinjau tampilan HP sejajar tepi kanan kontainer */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end" aria-hidden="true">
              <div className="w-full max-w-[420px] rounded-[28px] border border-kopi-200 bg-kertas p-6 shadow-lift">
                <div className="flex items-center justify-between border-b border-kopi-100 pb-3.5">
                  <div>
                    <p className="font-display text-[21px] font-bold leading-tight text-kopi-950">
                      Wedang Uwuh Bu Ngadi
                    </p>
                    <p className="text-xs text-kopi-600">Meja 3, lantai 2</p>
                  </div>
                  <span className="rounded-full bg-terakota-50 px-2.5 py-1 text-xs font-semibold text-terakota-800">
                    QR Aktif
                  </span>
                </div>

                <div className="mt-4 rounded-[14px] border border-terakota-200/70 bg-terakota-50 p-3.5">
                  <p className="text-xs font-semibold text-terakota-900">Datang rombongan?</p>
                  <p className="mt-0.5 text-xs text-kopi-700">
                    Tanya Menu bantu pilihkan paket sesuai jumlah orang & anggaran.
                  </p>
                </div>

                <div className="mt-4 divide-y divide-kopi-100">
                  {[featuredMenu[0], featuredMenu[1]].filter(Boolean).map((dish, idx) => (
                    <div key={dish.id} className="flex items-center gap-3 py-3">
                      <img
                        src={dish.image}
                        alt=""
                        width={56}
                        height={56}
                        loading="lazy"
                        className="size-14 shrink-0 rounded-[12px] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-kopi-950">{dish.name}</p>
                        <p className="text-xs font-semibold tabular-nums text-terakota-700">
                          {formatRupiah(dish.price)}
                        </p>
                      </div>
                      <span className="rounded-[8px] bg-terakota-700 px-2.5 py-1 text-xs font-semibold text-kertas">
                        {idx === 0 ? '2×' : '+ Tambah'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-[14px] bg-kopi-950 px-4 py-3 text-kertas">
                  <div>
                    <p className="text-xs text-kopi-200">2 item di meja</p>
                    <p className="text-sm font-semibold tabular-nums">Rp 20.000</p>
                  </div>
                  <span className="text-xs font-semibold text-emas">Lihat keranjang →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layar 4: Rombongan — satu pita kayu gelap khas kedai malam Patuk */}
        <section id="rombongan" className="bg-kopi-950 py-16 text-kertas lg:py-24">
          <div className={cx(wrap, 'grid items-center gap-10 lg:grid-cols-12 lg:gap-14')}>
            <div className="lg:col-span-6">
              <h2 className="font-display text-[36px] font-bold leading-tight tracking-[-0.02em] text-kertas sm:text-[48px]">
                Datang rombongan sampai 100 orang
              </h2>
              <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-kopi-200">
                Lantai dua cukup untuk acara komunitas, keluarga besar, maupun wisata {site.eventCapacity}. Kabari kami dulu agar meja dan dapur siap menyambut.
              </p>

              <ul className="mt-7 space-y-3.5 text-[15px] text-kopi-100">
                {[
                  'Reservasi tempat lantai 2 lewat WhatsApp sebelum kedatangan.',
                  'Tiap orang memesan dari HP sendiri; pesanan otomatis terkelompok per meja.',
                  'Asisten Tanya Menu menyusun paket sesuai jumlah orang, anggaran, dan pantangan.',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <Check strokeWidth={2} className="mt-1 size-4 shrink-0 text-emas" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={waReservation}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-terakota-600 px-5 py-2.5 text-[14px] font-semibold text-kertas transition-colors hover:bg-terakota-500"
                >
                  <MessageCircle strokeWidth={1.75} className="size-4" aria-hidden="true" />
                  Reservasi lewat WhatsApp
                </a>
                <Link
                  to="/menu?bantuan=1"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-emas/40 px-5 py-2.5 text-[14px] font-semibold text-kertas transition-colors hover:bg-white/10"
                >
                  <Users strokeWidth={1.75} className="size-4 text-emas" aria-hidden="true" />
                  Coba Tanya Menu
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 lg:pl-6">
              <div className="rounded-[20px] border border-kopi-700 bg-kertas p-6 text-kopi-900 shadow-lift sm:p-7">
                <div className="border-b border-dashed border-kopi-300 pb-4">
                  <p className="font-display text-[24px] font-bold leading-tight text-kopi-950">
                    Contoh susunan Tanya Menu
                  </p>
                  <p className="mt-1 text-xs text-kopi-600">
                    “Kami 20 orang, anggaran 300 ribu, tanpa kopi.”
                  </p>
                </div>

                <ul className="mt-4 divide-y divide-kopi-100 text-[14px]">
                  {groupSample.map((row) => (
                    <li key={row.name} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="text-kopi-800">{row.name}</span>
                      <span className="font-semibold tabular-nums text-kopi-950">
                        {formatRupiah(row.price)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-baseline justify-between rounded-[12px] bg-kertas-tua px-4 py-3.5">
                  <div>
                    <p className="text-xs font-semibold text-kopi-700">Estimasi total</p>
                    <p className="text-xs text-kopi-600">
                      Sisa anggaran {formatRupiah(300000 - groupSampleTotal)}
                    </p>
                  </div>
                  <p className="text-[20px] font-bold tabular-nums text-terakota-800">
                    {formatRupiah(groupSampleTotal)}
                  </p>
                </div>

                <Link to="/menu?bantuan=1" className={cx(btnPrimary, 'mt-4 w-full')}>
                  Hitung untuk rombonganmu
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Layar 5: Jam buka & lokasi */}
        <section id="lokasi" className="bg-kertas py-16 lg:py-24">
          <div className={cx(wrap, 'grid items-start gap-10 lg:grid-cols-12 lg:gap-14')}>
            <div className="lg:col-span-5">
              <h2 className="font-display text-[36px] font-bold leading-tight tracking-[-0.02em] text-kopi-950 sm:text-[46px]">
                Jam buka dan lokasi
              </h2>

              <dl className="mt-6 divide-y divide-kopi-200 border-y border-kopi-200 text-[15px]">
                {site.hours.map((h) => (
                  <div key={h.day} className="flex items-center justify-between py-3.5">
                    <dt className="text-kopi-700">{h.day}</dt>
                    <dd
                      className={cx(
                        'font-semibold tabular-nums',
                        h.closed ? 'text-terakota-700' : 'text-kopi-950',
                      )}
                    >
                      {h.time}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-kopi-700">
                {site.address}
              </p>
              <p className="mt-1.5 text-sm text-kopi-600">
                Sekitar 35 menit dari pusat Kota Yogyakarta lewat jalur Patuk–Nglanggeran.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={site.mapsUrl} target="_blank" rel="noreferrer" className={cx(btnPrimary, 'whitespace-nowrap')}>
                  <MapPin strokeWidth={1.75} className="size-4" aria-hidden="true" />
                  Buka di Google Maps
                </a>
                <a
                  href={whatsappUrl('Halo Bu Ngadi, saya ingin bertanya tentang kedai Wedang Uwuh Bu Ngadi.')}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(btnSecondary, 'whitespace-nowrap')}
                >
                  WhatsApp {site.whatsappDisplay}
                </a>
              </div>
            </div>

            {/* Peta dengan latar foto Patuk agar tetap kaya secara visual saat offline/embed lambat */}
            <div className="relative overflow-hidden rounded-[20px] border border-kopi-200 bg-kopi-950 shadow-soft lg:col-span-7">
              <div className="relative h-[340px] w-full sm:h-[420px] xl:h-[460px]">
                <img
                  src={site.photos.hero}
                  alt=""
                  aria-hidden="true"
                  width={1440}
                  height={960}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-kopi-950/90 via-kopi-950/35 to-kopi-950/25 p-6 text-kertas">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-kopi-950/80 px-3.5 py-1.5 text-xs font-semibold text-kertas backdrop-blur-sm">
                    <MapPin strokeWidth={1.75} className="size-3.5 text-emas" aria-hidden="true" />
                    Jalur Patuk–Nglanggeran · ~35 mnt dari Yogyakarta
                  </span>
                  <div className="max-w-md">
                    <p className="font-display text-[28px] font-bold leading-tight text-kertas">{site.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-kopi-100">{site.address}</p>
                    <a
                      href={site.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-emas underline hover:text-kertas"
                    >
                      Buka petunjuk arah di Google Maps
                      <ExternalLink strokeWidth={1.75} className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <iframe
                  title="Peta lokasi Wedang Uwuh Bu Ngadi di Patuk, Gunungkidul"
                  src={site.mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="relative z-10 h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer sejajar penuh dengan tepi kiri-kanan */}
      <footer className="border-t border-kopi-200 bg-kopi-50 py-12">
        <div className={wrap}>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div>
              <Logo subtitle="Patuk, Gunungkidul" />
              <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-kopi-600">
                {site.address}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-kopi-600">Instagram</p>
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-kopi-950 hover:text-terakota-700"
                >
                  <InstagramIcon className="size-4" /> @{site.instagram}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold text-kopi-600">WhatsApp</p>
                <a
                  href={waReservation}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-kopi-950 hover:text-terakota-700"
                >
                  {site.whatsappDisplay}
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold text-kopi-600">Tokopedia</p>
                <a
                  href={site.tokopediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-kopi-950 hover:text-terakota-700"
                >
                  wedanguwuhbungadi
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-2 border-t border-kopi-200 pt-5 text-xs text-kopi-600 sm:flex-row sm:items-center">
            <p>© 2026 Wedang Uwuh Bu Ngadi · Patuk, Gunungkidul</p>
            <div className="flex items-center gap-4">
              <Link to="/masuk" className="inline-flex min-h-[44px] items-center font-medium text-kopi-600 hover:text-kopi-950">
                Masuk staf
              </Link>
              <Link to="/demo" className="inline-flex min-h-[44px] items-center font-medium text-kopi-600 hover:text-kopi-950">
                Ruang uji
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Check, ChevronRight, Clock, MapPin, MessageCircle, Plus, Search, ShoppingBag } from 'lucide-react';
import { categories } from '../data/menu';
import { site } from '../data/site';
import { useMenu } from '../lib/hooks';
import { formatRupiah } from '../utils/format';
import { CupMark, MenuThumb, cx } from '../components/ui';

export default function LandingPage() {
  const { data: menu } = useMenu();

  const popularIds = ['wedang-uwuh', 'jahe-susu', 'nasi-pecel', 'mendoan'];
  const popularItems = popularIds
    .map((id) => (menu ?? []).find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-dvh bg-white text-[#18181b]">
      {/* 1. NAVIGASI (Sesuai Figma node 34:1307) */}
      <header className="sticky top-0 z-30 border-b border-[#e4e4e7] bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-[72px] max-w-[1160px] items-center gap-[24px] px-[20px] sm:gap-[32px]">
          <Link to="/" className="flex items-center gap-[10px]">
            <div className="grid size-[36px] place-items-center rounded-[10px] bg-[#7a4b2a] text-white">
              <CupMark className="size-[20px]" />
            </div>
            <span className="text-[16px] font-semibold leading-[24px] text-[#18181b]">Wedang Uwuh Bu Ngadi</span>
          </Link>

          <div className="flex-1" />

          <nav className="hidden items-center gap-[32px] text-[14px] leading-[20px] text-[#18181b] md:flex">
            <a href="#menu" className="hover:text-[#7a4b2a]">
              Menu
            </a>
            <a href="#cara-pesan" className="hover:text-[#7a4b2a]">
              Cara pesan
            </a>
            <a href="#rombongan" className="hover:text-[#7a4b2a]">
              Rombongan
            </a>
            <a href="#lokasi" className="hover:text-[#7a4b2a]">
              Lokasi
            </a>
          </nav>

          <Link
            to="/meja/M03"
            className="flex h-[36px] items-center justify-center rounded-[10px] bg-[#7a4b2a] px-[14px] text-[14px] font-semibold leading-[20px] text-white transition-colors hover:bg-[#5e3920]"
          >
            Lihat menu
          </Link>
        </div>
      </header>

      {/* 2. PEMBUKA / HERO (Sesuai Figma node 34:1328) */}
      <section className="bg-white py-[36px] md:py-[45px]">
        <div className="mx-auto grid max-w-[1160px] items-center gap-[36px] px-[20px] lg:grid-cols-[1fr_560px] lg:gap-[72px]">
          <div className="flex flex-col items-start gap-[12px]">
            <h1 className="text-[34px] font-bold leading-[42px] tracking-[-0.68px] text-[#18181b] sm:text-[48px] sm:leading-[56px] sm:tracking-[-0.96px]">
              Wedang hangat dan masakan rumahan di perbukitan Patuk
            </h1>
            <p className="text-[16px] font-normal leading-[24px] text-[#71717a]">
              Melambat sejenak di Yogyakarta. Di kedai, pelanggan memesan langsung dari meja lewat QR, tanpa antre di
              kasir.
            </p>

            <div className="h-[12px] w-px" />

            <div className="flex flex-wrap items-center gap-[12px]">
              <Link
                to="/meja/M03"
                className="flex h-[48px] items-center justify-center rounded-[12px] bg-[#7a4b2a] px-[20px] text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-[#5e3920]"
              >
                Lihat menu
              </Link>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-[48px] items-center justify-center rounded-[12px] border border-[#e4e4e7] bg-white px-[20px] text-[16px] font-semibold leading-[24px] text-[#18181b] transition-colors hover:bg-[#f4f4f5]"
              >
                Petunjuk arah
              </a>
            </div>

            <div className="h-[12px] w-px" />

            <div className="flex flex-col gap-[8px] text-[14px] leading-[20px] text-[#71717a]">
              <div className="flex items-center gap-[8px]">
                <MapPin strokeWidth={1.5} className="size-[18px] shrink-0 text-[#71717a]" />
                <span>Jl. Patuk–Tawang KM 4, Gunungkidul</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Clock strokeWidth={1.5} className="size-[18px] shrink-0 text-[#71717a]" />
                <span>Buka 10.00–20.00, Selasa libur</span>
              </div>
            </div>
          </div>

          {/* Kolom Foto Hero: 1 foto besar 560x340 + 2 foto kecil 272x200 (node 34:1359) */}
          <div className="flex flex-col gap-[16px]">
            <img
              src="/images/suasana-kedai.png"
              alt="Suasana lantai dua"
              className="h-[260px] w-full rounded-[24px] object-cover sm:h-[340px]"
            />
            <div className="grid grid-cols-2 gap-[16px]">
              <img
                src="/images/menu/wedang-uwuh.png"
                alt="Wedang Uwuh"
                className="h-[160px] w-full rounded-[20px] object-cover sm:h-[200px]"
              />
              <img
                src="/images/menu/nasi-pecel.png"
                alt="Nasi Pecel"
                className="h-[160px] w-full rounded-[20px] object-cover sm:h-[200px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. CARA PESAN (Sesuai Figma node 34:1364) */}
      <section id="cara-pesan" className="bg-[#fafafa] py-[45px]">
        <div className="mx-auto grid max-w-[1160px] items-center gap-[36px] px-[20px] lg:grid-cols-[1fr_420px] lg:gap-[72px]">
          <div className="flex flex-col items-start gap-[12px]">
            <h2 className="text-[28px] font-bold leading-[36px] tracking-[-0.48px] text-[#18181b] sm:text-[32px] sm:leading-[40px]">
              Pesan dari meja, tanpa antre
            </h2>
            <p className="text-[16px] leading-[24px] text-[#71717a]">
              Setiap meja punya QR sendiri. Pesanan langsung masuk ke kasir dan dapur, lengkap dengan nomor meja.
            </p>

            <div className="h-[12px] w-px" />

            {[
              {
                num: '1',
                title: 'Duduk, lalu scan QR di meja',
                desc: 'Cukup pakai kamera HP. Nomor meja langsung tercatat.',
              },
              {
                num: '2',
                title: 'Pilih menu dan kirim pesanan',
                desc: 'Satu meja bisa memesan dari beberapa HP. Datang rombongan bisa tanya asisten menu.',
              },
              {
                num: '3',
                title: 'Pesanan diantar ke meja',
                desc: 'Pantau status pesanan dari layar HP dan bayar praktis via QRIS, DANA, Bank, atau di kasir.',
              },
            ].map((step) => (
              <div key={step.num} className="flex w-full items-start gap-[16px] border-t border-[#e4e4e7] py-[18px]">
                <span className="w-[28px] shrink-0 text-[20px] font-semibold leading-[28px] text-[#7a4b2a]">
                  {step.num}
                </span>
                <div className="flex flex-col gap-[4px]">
                  <p className="text-[16px] font-semibold leading-[24px] text-[#18181b]">{step.title}</p>
                  <p className="text-[14px] leading-[20px] text-[#71717a]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview HP Menu di sebelah kanan (node 34:1388) */}
          <div className="mx-auto w-full max-w-[320px] rounded-[28px] border border-[#e4e4e7] bg-white p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.04),0px_8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-[#18181b]">Wedang Uwuh Bu Ngadi</p>
                <p className="text-[12px] text-[#71717a]">Meja 3, lantai 2</p>
              </div>
              <div className="grid size-[32px] place-items-center rounded-[10px] border border-[#e4e4e7]">
                <Search strokeWidth={1.5} className="size-[16px]" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-[12px] bg-[#f6eee7] px-3 py-2.5 text-[#5e3920]">
              <MessageCircle strokeWidth={1.5} className="size-4 shrink-0" />
              <div className="flex-1 text-[11px] leading-[15px]">
                <p className="font-semibold">Datang rombongan?</p>
                <p>Tanya menu, kami bantu pilihkan sesuai jumlah orang dan anggaran.</p>
              </div>
              <ChevronRight strokeWidth={1.5} className="size-4 shrink-0" />
            </div>

            <div className="mt-3 flex gap-2 overflow-hidden">
              {categories.slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex w-[48px] shrink-0 flex-col items-center gap-1">
                  <div
                    className={cx(
                      'grid size-[40px] place-items-center rounded-[12px]',
                      i === 0 ? 'bg-[#7a4b2a]' : 'bg-[#f4f4f5]',
                    )}
                  >
                    <img src={c.icon} alt="" className={cx('size-[18px]', i === 0 && 'brightness-0 invert')} />
                  </div>
                  <span className={cx('text-[10px]', i === 0 ? 'font-semibold text-[#5e3920]' : 'text-[#18181b]')}>
                    {c.shortName}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-[#e4e4e7] pt-3">
              <div className="flex items-center gap-3">
                <img
                  src="/images/menu/wedang-uwuh.png"
                  alt="Wedang Uwuh"
                  className="size-[56px] rounded-[10px] object-cover"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold">Wedang Uwuh</p>
                  <p className="text-[11px] text-[#71717a]">Gula batu cair. Bisa panas atau es.</p>
                  <p className="mt-0.5 text-[13px] font-semibold">Rp8.000</p>
                </div>
                <span className="inline-flex h-[28px] items-center gap-1 rounded-[8px] border border-[#e4e4e7] px-2 text-[11px] font-semibold">
                  <Plus className="size-3" /> Tambah
                </span>
              </div>
            </div>

            <Link
              to="/meja/M03"
              className="mt-4 flex h-[44px] items-center justify-between rounded-[12px] bg-[#7a4b2a] px-3.5 text-white"
            >
              <div className="leading-tight">
                <span className="block text-[10px] text-[#f6eee7]">2 item</span>
                <span className="text-[13px] font-semibold">Rp23.000</span>
              </div>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                Coba sekarang <ShoppingBag className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. MENU TERLARIS (Sesuai Figma node 34:1439) */}
      <section id="menu" className="bg-white py-[45px]">
        <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-[12px] px-[20px]">
          <h2 className="text-[28px] font-bold leading-[36px] tracking-[-0.48px] text-[#18181b] sm:text-[32px] sm:leading-[40px]">
            Yang paling sering dipesan
          </h2>
          <p className="text-[16px] leading-[24px] text-[#71717a]">
            Harga dalam rupiah. Hampir semua minuman bisa dipesan panas atau es.
          </p>

          <div className="h-[8px] w-px" />

          <div className="grid w-full gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
            {popularItems.map((item) => (
              <Link
                key={item.id}
                to="/meja/M03"
                className="group flex flex-col items-start gap-[6px]"
              >
                <MenuThumb
                  item={item}
                  className="h-[240px] w-full rounded-[16px] transition-transform group-hover:scale-[1.01] sm:h-[272px]"
                />
                <div className="h-[4px] w-px" />
                <div className="flex w-full items-start justify-between text-[16px] font-semibold leading-[24px] text-[#18181b]">
                  <span>{item.name}</span>
                  <span>{formatRupiah(item.price)}</span>
                </div>
                <p className="text-[14px] leading-[20px] text-[#71717a]">{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="pt-[12px]">
            <Link
              to="/meja/M03"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#e4e4e7] bg-white px-[20px] text-[16px] font-semibold text-[#18181b] transition-colors hover:bg-[#f4f4f5]"
            >
              Lihat semua menu ({(menu ?? []).length} menu)
            </Link>
          </div>
        </div>
      </section>

      {/* 5. ROMBONGAN / ASISTEN MENU AI (Sesuai Figma node 35:1440) */}
      <section id="rombongan" className="bg-[#fafafa] py-[45px]">
        <div className="mx-auto grid max-w-[1160px] items-center gap-[36px] px-[20px] lg:grid-cols-[1fr_420px] lg:gap-[72px]">
          <div className="flex flex-col items-start gap-[12px]">
            <h2 className="text-[28px] font-bold leading-[36px] tracking-[-0.48px] text-[#18181b] sm:text-[32px] sm:leading-[40px]">
              Datang rombongan? Asisten menu siap bantu
            </h2>
            <p className="text-[16px] leading-[24px] text-[#71717a]">
              Sebutkan jumlah orang dan anggaran di fitur Tanya Menu. Asisten langsung menyusun kombinasi wedang,
              makanan, dan camilan dari menu yang tersedia beserta total harganya.
            </p>
            <ul className="mt-2 space-y-2.5 text-[14px] text-[#18181b]">
              {[
                'Hanya menyarankan menu yang benar-benar tersedia di kedai',
                'Hitungan harga pas sesuai anggaran rombongan',
                'Satu ketukan untuk memasukkan semua ke keranjang meja',
              ].map((point) => (
                <li key={point} className="flex items-center gap-2.5">
                  <span className="grid size-[22px] place-items-center rounded-full bg-[#f6eee7] text-[#7a4b2a]">
                    <Check strokeWidth={2.25} className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Kartu Contoh Usulan Asisten sesuai Figma node 35:1459 */}
          <div className="flex flex-col gap-[10px] rounded-[16px] border border-[#e4e4e7] bg-white p-[16px] shadow-soft">
            <p className="text-[14px] leading-[20px] text-[#18181b]">
              Ini usulanku untuk 20 orang dengan anggaran Rp300.000:
            </p>
            <div className="flex flex-col gap-[8px] rounded-[12px] bg-[#fafafa] p-[12px] text-[14px] leading-[20px]">
              <div className="flex justify-between">
                <span>10x Wedang Uwuh</span>
                <span>Rp80.000</span>
              </div>
              <div className="flex justify-between">
                <span>6x Jahe Susu</span>
                <span>Rp60.000</span>
              </div>
              <div className="flex justify-between">
                <span>4x Kunir Asem</span>
                <span>Rp48.000</span>
              </div>
              <div className="flex justify-between">
                <span>8x Mendoan</span>
                <span>Rp64.000</span>
              </div>
              <div className="h-px w-full bg-[#e4e4e7]" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Rp252.000</span>
              </div>
              <p className="text-[12px] font-medium text-[#5e3920]">Sisa anggaran Rp48.000</p>
            </div>
            <Link
              to="/meja/M03"
              className="flex h-[36px] w-full items-center justify-center rounded-[10px] bg-[#7a4b2a] px-[14px] text-[14px] font-semibold text-white hover:bg-[#5e3920]"
            >
              Masukkan semua ke keranjang
            </Link>
          </div>
        </div>
      </section>

      {/* 6. JAM BUKA DAN LOKASI (Sesuai Figma node 35:1486) */}
      <section id="lokasi" className="bg-white py-[45px]">
        <div className="mx-auto grid max-w-[1160px] items-start gap-[36px] px-[20px] lg:grid-cols-2 lg:gap-[72px]">
          <div className="flex flex-col items-start gap-[12px]">
            <h2 className="text-[28px] font-bold leading-[36px] tracking-[-0.48px] text-[#18181b] sm:text-[32px] sm:leading-[40px]">
              Jam buka dan lokasi
            </h2>
            <div className="w-full divide-y divide-[#e4e4e7] border-y border-[#e4e4e7] text-[16px] leading-[24px]">
              {site.hours.map((h) => (
                <div key={h.day} className="flex items-center justify-between py-[14px]">
                  <span className="text-[#18181b]">{h.day}</span>
                  <span className={h.time === 'Libur' ? 'font-semibold text-[#b42318]' : 'font-semibold text-[#18181b]'}>
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="pt-[8px] text-[16px] leading-[24px] text-[#71717a]">{site.address}</p>
            <div className="flex flex-wrap gap-[12px] pt-[8px]">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-[48px] items-center justify-center rounded-[12px] bg-[#7a4b2a] px-[20px] text-[16px] font-semibold text-white hover:bg-[#5e3920]"
              >
                Buka di Google Maps
              </a>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-[48px] items-center justify-center rounded-[12px] border border-[#e4e4e7] bg-white px-[20px] text-[16px] font-semibold text-[#18181b] hover:bg-[#f4f4f5]"
              >
                Instagram @{site.instagram}
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[#e4e4e7] bg-[#fafafa]">
            <iframe
              title={`Peta lokasi ${site.name}`}
              src={site.mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[340px] w-full border-0"
            />
          </div>
        </div>
      </section>

      {/* KAKI HALAMAN */}
      <footer className="border-t border-[#e4e4e7] bg-[#fafafa] py-[28px]">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-[16px] px-[20px] text-[14px] text-[#71717a]">
          <span>© 2026 {site.name} · Patuk, Gunungkidul</span>
          <div className="flex flex-wrap gap-[20px]">
            <Link to="/demo" className="hover:text-[#18181b]">
              Semua halaman demo
            </Link>
            <Link to="/meja/M03" className="hover:text-[#18181b]">
              Simulasi Pelanggan (Meja 3)
            </Link>
            <Link to="/kasir" className="hover:text-[#18181b]">
              Kasir & POS
            </Link>
            <Link to="/admin" className="hover:text-[#18181b]">
              Dashboard Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

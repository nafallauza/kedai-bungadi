// Info kedai dari Instagram @bu__ngadi, linktr.ee/BuNgadi, buku menu, dan Google Maps (dicek 8 Nov 2026).
// Konfirmasi ulang ke pemilik sebelum website dipublikasikan.
export const site = {
  name: 'Wedang Uwuh Bu Ngadi',
  tagline: 'Melambat sejenak di Yogyakarta',
  address: 'Jl. Patuk–Tawang KM 4, Soka, Ngoro-oro, Patuk, Gunungkidul, Yogyakarta',
  mapsUrl: 'https://maps.app.goo.gl/3MVvzmSJJKbD2LUA9',
  mapsEmbed: 'https://www.google.com/maps?q=-7.8376636,110.5105525&z=15&output=embed',
  instagram: 'bu__ngadi',
  instagramUrl: 'https://www.instagram.com/bu__ngadi',
  tokopediaUrl: 'https://www.tokopedia.com/wedanguwuhbungadi',
  // WhatsApp admin yang dicantumkan kedai di Linktree & Google Maps
  whatsapp: '6281226576732',
  rating: { score: '4,9', count: 181 },
  hours: [
    { day: 'Senin', time: '10.00 – 20.00' },
    { day: 'Selasa', time: 'Libur' },
    { day: 'Rabu – Minggu', time: '10.00 – 20.00' },
  ],
  eventCapacity: '70–100 orang',
  logo: '/images/logo-bungadi.jpg',
  // Foto dari Section Aset Figma
  photos: {
    hero: '/images/suasana-kedai.png',
    // scene = ilustrasi pengganti selama foto belum ada
    gallery: [
      { src: '/images/suasana-kedai.png', caption: 'Suasana hangat kedai menghadap Merapi', scene: 'jendela' },
      { src: '/images/menu/wedang-uwuh.png', caption: 'Wedang uwuh rempah asli gula batu', scene: 'karaf' },
      { src: '/images/menu/kopi-tubruk.png', caption: 'Kopi tubruk & camilan hangat', scene: 'bangku' },
      { src: '/images/menu/nasi-pecel.png', caption: 'Sajian kuliner tradisional Bu Ngadi', scene: 'lampu' },
    ],
  },
  payment: {
    qris: {
      merchantName: 'Kedai Bungadi Jogja',
      nmid: 'ID1020039281920',
      standard: 'QRIS • STANDAR NASIONAL',
    },
    dana: {
      number: '0812-2657-6732',
      rawNumber: '081226576732',
      holder: 'Wedang Uwuh Bu Ngadi',
    },
    banks: [
      { id: 'BCA', name: 'Bank BCA', account: '4560891234', holder: 'Wedang Uwuh Bu Ngadi', badgeBg: 'bg-blue-700' },
      { id: 'BRI', name: 'Bank BRI', account: '002901023456508', holder: 'Wedang Uwuh Bu Ngadi', badgeBg: 'bg-sky-700' },
      { id: 'Mandiri', name: 'Bank Mandiri', account: '1370019283746', holder: 'Wedang Uwuh Bu Ngadi', badgeBg: 'bg-amber-600' },
      { id: 'BPD DIY', name: 'Bank BPD DIY', account: '005221004829', holder: 'Wedang Uwuh Bu Ngadi', badgeBg: 'bg-emerald-700' },
    ],
  },
};

export const whatsappUrl = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

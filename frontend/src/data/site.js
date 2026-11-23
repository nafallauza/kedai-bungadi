// Info kedai Wedang Uwuh Bu Ngadi (Patuk, Gunungkidul).
export const site = {
  name: 'Wedang Uwuh Bu Ngadi',
  tagline: 'Melambat sejenak di Yogyakarta',
  address: 'Jl. Patuk–Tawang KM 4, Soka, Ngoro-oro, Patuk, Gunungkidul, Daerah Istimewa Yogyakarta',
  shortAddress: 'Jl. Patuk–Tawang KM 4, Patuk, Gunungkidul',
  mapsUrl: 'https://maps.app.goo.gl/3MVvzmSJJKbD2LUA9',
  mapsEmbed: 'https://www.google.com/maps?q=-7.8376636,110.5105525&z=15&output=embed',
  instagram: 'bu__ngadi',
  instagramUrl: 'https://www.instagram.com/bu__ngadi',
  tokopediaUrl: 'https://www.tokopedia.com/wedanguwuhbungadi',
  whatsapp: '6281226576732',
  whatsappDisplay: '0812 2657 6732',
  rating: { score: '4,9', count: 181 },
  hours: [
    { day: 'Senin', time: '10.00 – 20.00' },
    { day: 'Selasa', time: 'Libur', closed: true },
    { day: 'Rabu – Minggu', time: '10.00 – 20.00' },
  ],
  eventCapacity: '70–100 orang',
  logo: '/images/logo-bungadi.webp',
  photos: {
    hero: '/images/suasana-kedai.webp',
    wedangAsli: '/images/wedang-uwuh-asli.webp',
    jamuPatuk: '/images/jamu-patuk.webp',
    maduJeruk: '/images/menu/madu-jeruk.webp',
    kombucha: '/images/menu/kombucha.webp',
  },
  payment: {
    qris: {
      merchantName: 'Wedang Uwuh Bu Ngadi',
      nmid: 'ID1020039281920',
      standard: 'QRIS · Standar Nasional',
    },
  },
};

export const whatsappUrl = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

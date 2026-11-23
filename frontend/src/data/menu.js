// Menu Wedang Uwuh Bu Ngadi (harga 4 menu baru masih perkiraan sementara, bisa diubah di /admin/menu)

export const categories = [
  { id: 'wedang', name: 'Wedang & Rempah', shortName: 'Wedang', station: 'minuman', icon: '/images/icons/cat-wedang.svg', image: '/images/menu/wedang-uwuh.webp' },
  { id: 'kopi', name: 'Kopi', shortName: 'Kopi', station: 'minuman', icon: '/images/icons/cat-kopi.svg', image: '/images/menu/kopi-tubruk.webp' },
  { id: 'jamu', name: 'Jamu & Fermentasi', shortName: 'Jamu', station: 'minuman', icon: '/images/icons/cat-jamu.svg', image: '/images/menu/kunir-asem.webp' },
  { id: 'teh', name: 'Teh & Madu', shortName: 'Teh', station: 'minuman', icon: '/images/icons/cat-teh.svg', image: '/images/menu/madu-jeruk.webp' },
  { id: 'makanan', name: 'Makanan', shortName: 'Makanan', station: 'makanan', icon: '/images/icons/cat-makanan.svg', image: '/images/menu/nasi-pecel.webp' },
  { id: 'snack', name: 'Camilan', shortName: 'Camilan', station: 'makanan', icon: '/images/icons/cat-snack.svg', image: '/images/menu/mendoan.webp' },
  { id: 'tambahan', name: 'Tambahan', shortName: 'Tambahan', station: 'makanan', icon: '/images/icons/cat-tambahan.svg', image: '/images/menu/nasi-telur.webp' },
];

export const categoryDefaultImage = {
  wedang: '/images/menu/wedang-uwuh.webp',
  kopi: '/images/menu/kopi-tubruk.webp',
  jamu: '/images/menu/kunir-asem.webp',
  teh: '/images/menu/madu-jeruk.webp',
  makanan: '/images/menu/nasi-pecel.webp',
  snack: '/images/menu/mendoan.webp',
  tambahan: '/images/menu/nasi-telur.webp',
};

export const DRINK_CATEGORIES = new Set(['wedang', 'kopi', 'jamu', 'teh']);

export const panasEs = {
  label: 'Penyajian',
  choices: [
    { id: 'panas', name: 'Panas' },
    { id: 'es', name: 'Es' },
  ],
};

const pilih = (label, ...names) => ({
  label,
  choices: names.map((name) => ({ id: name.toLowerCase(), name })),
});

const item = (id, name, category, price, description, extra = {}) => ({
  id,
  name,
  category,
  price,
  description,
  image: extra.image ?? categoryDefaultImage[category],
  tags: [],
  available: true,
  ...extra,
});

export const initialMenu = [
  // Wedang & Rempah
  item(
    'wedang-uwuh',
    'Wedang Uwuh',
    'wedang',
    8000,
    'Rempah kering dengan gula batu cair. Bisa panas atau es.',
    {
      longDescription: 'Secang, jahe bakar, cengkeh, dan kayu manis diseduh air panas bersama gula batu cair.',
      image: '/images/menu/wedang-uwuh-gelas.webp',
      option: panasEs,
      tags: ['khas', 'panas'],
    },
  ),
  item(
    'wedang-uwuh-bungadi',
    'Wedang Uwuh Bu Ngadi',
    'wedang',
    10000,
    'Racikan khas dengan gula palem. Bisa panas atau es.',
    {
      longDescription: 'Wedang uwuh andalan Bu Ngadi disajikan dalam karaf kecil dengan aroma rempah lebih pekat dan gula palem.',
      image: '/images/menu/wedang-uwuh.webp',
      option: panasEs,
      tags: ['khas', 'laris', 'panas'],
    },
  ),
  item(
    'jahe-susu',
    'Jahe Susu',
    'wedang',
    10000,
    'Jahe geprek dengan susu kental manis. Bisa panas atau es.',
    {
      image: '/images/menu/jahe-susu.webp',
      option: panasEs,
      tags: ['panas'],
    },
  ),

  // Kopi
  item(
    'kopi-bungadi',
    'Kopi Bu Ngadi',
    'kopi',
    12000,
    'Kopi ireng tubruk sangrai rumahan khas Bu Ngadi.',
    {
      image: '/images/menu/kopi-tubruk.webp',
      tags: ['panas', 'khas', 'kopi'],
    },
  ),

  // Jamu & Fermentasi
  item(
    'kombucha',
    'Kombucha',
    'jamu',
    15000,
    'Teh fermentasi dingin dengan rasa segar asam-manis alami.',
    {
      longDescription: 'Fermentasi teh racikan kedai disajikan dingin di atas es batu, ringan dan menyegarkan setelah perjalanan naik Patuk.',
      image: '/images/menu/kombucha.webp',
      tags: ['es', 'khas'],
    },
  ),
  item(
    'kunir-asem',
    'Kunir Asem',
    'jamu',
    12000,
    'Kunyit segar dan asam jawa. Disajikan dingin.',
    {
      image: '/images/menu/kunir-asem.webp',
      tags: ['es', 'khas'],
    },
  ),
  item(
    'beras-kencur',
    'Beras Kencur',
    'jamu',
    10000,
    'Jamu beras kencur rumahan yang lembut dan menghangatkan.',
    {
      image: '/images/menu/beras-kencur.webp',
      option: panasEs,
      tags: ['khas', 'panas'],
    },
  ),
  item(
    'gula-asem',
    'Gula Asem',
    'jamu',
    10000,
    'Asam jawa dan gula aren asli yang segar di tenggorokan.',
    {
      image: '/images/menu/gula-asem.webp',
      option: panasEs,
      tags: ['es'],
    },
  ),

  // Teh & Madu
  item(
    'madu-jeruk',
    'Madu Jeruk',
    'teh',
    12000,
    'Madu murni dengan perasan jeruk nipis segar. Bisa panas atau es.',
    {
      longDescription: 'Seduhan madu murni dipadukan irisan jeruk nipis segar, cocok dinikmati hangat saat sore berkabut di Patuk.',
      image: '/images/menu/madu-jeruk.webp',
      option: panasEs,
      tags: ['panas', 'khas'],
    },
  ),
  item(
    'teh',
    'Es Teh',
    'teh',
    5000,
    'Teh seduh gula batu. Bisa es atau panas.',
    {
      image: '/images/menu/es-teh.webp',
      option: panasEs,
      tags: ['es'],
    },
  ),

  // Makanan
  item(
    'nasi-pecel',
    'Nasi Pecel',
    'makanan',
    15000,
    'Sayur rebus, telur, rempeyek kacang, dan bumbu pecel rumahan.',
    {
      image: '/images/menu/nasi-pecel.webp',
      tags: ['khas', 'laris'],
    },
  ),
  item(
    'soto-ayam',
    'Soto Ayam',
    'makanan',
    15000,
    'Soto kuah bening hangat dengan suwiran ayam kampung.',
    {
      image: '/images/menu/soto-ayam.webp',
      tags: ['berkuah'],
    },
  ),

  // Camilan
  item(
    'mendoan',
    'Mendoan',
    'snack',
    8000,
    'Tempe mendoan goreng hangat isi 4, dengan sambal kecap.',
    {
      image: '/images/menu/mendoan.webp',
      tags: ['khas', 'laris'],
    },
  ),

  // Tambahan
  item(
    'nasi-telor-bungadi',
    'Nasi dan Telur',
    'tambahan',
    10000,
    'Nasi putih hangat dengan telur dadar atau ceplok dan sambal.',
    {
      image: '/images/menu/nasi-telur.webp',
      option: pilih('Jenis', 'Dadar', 'Ceplok'),
    },
  ),
];

export const initialTables = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return { code: `M${String(n).padStart(2, '0')}`, name: `Meja ${n}, lantai 2` };
});

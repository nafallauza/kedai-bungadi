// Menu terkurasi sesuai desain Figma BUNGADI – Desain UI/UX (Section Aset & Halaman Menu 18:30)

export const categories = [
  { id: 'wedang', name: 'Wedang & Rempah', shortName: 'Wedang', icon: '/images/icons/cat-wedang.svg', image: '/images/categories/wedang.png' },
  { id: 'kopi', name: 'Kopi', shortName: 'Kopi', icon: '/images/icons/cat-kopi.svg', image: '/images/categories/kopi.png' },
  { id: 'jamu', name: 'Jamu & Fermentasi', shortName: 'Jamu', icon: '/images/icons/cat-jamu.svg', image: '/images/categories/jamu.png' },
  { id: 'teh', name: 'Teh, Madu & Coklat', shortName: 'Teh', icon: '/images/icons/cat-teh.svg', image: '/images/categories/teh.png' },
  { id: 'makanan', name: 'Makanan', shortName: 'Makanan', icon: '/images/icons/cat-makanan.svg', image: '/images/categories/makanan.png' },
  { id: 'snack', name: 'Snack', shortName: 'Snack', icon: '/images/icons/cat-snack.svg', image: '/images/categories/snack.png' },
  { id: 'tambahan', name: 'Tambahan', shortName: 'Tambahan', icon: '/images/icons/cat-tambahan.svg', image: '/images/categories/tambahan.png' },
];

export const categoryDefaultImage = {
  wedang: '/images/menu/wedang-uwuh.png',
  kopi: '/images/menu/kopi-tubruk.png',
  jamu: '/images/menu/kunir-asem.png',
  teh: '/images/menu/es-teh.png',
  makanan: '/images/menu/nasi-pecel.png',
  snack: '/images/menu/mendoan.png',
  tambahan: '/images/menu/nasi-telur.png',
};

const panasEs = {
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
    'Gula batu cair. Bisa panas atau es.',
    {
      longDescription: 'Rempah kering seperti secang, jahe, cengkeh, dan kayu manis yang diseduh air panas, dengan gula batu cair.',
      image: '/images/menu/wedang-uwuh.png',
      option: panasEs,
      tags: ['khas', 'panas'],
    },
  ),
  item(
    'wedang-uwuh-bungadi',
    'Wedang Uwuh Bu Ngadi',
    'wedang',
    10000,
    'Wedang uwuh dengan gula palem. Bisa panas atau es.',
    {
      image: '/images/menu/wedang-uwuh.png',
      option: panasEs,
      tags: ['khas', 'laris'],
    },
  ),
  item(
    'jahe-susu',
    'Jahe Susu',
    'wedang',
    10000,
    'Jahe dengan susu kental manis. Bisa panas atau es.',
    {
      image: '/images/menu/jahe-susu.png',
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
    'Kopi ireng tubruk khas Bu Ngadi.',
    {
      image: '/images/menu/kopi-tubruk.png',
      tags: ['panas', 'khas'],
    },
  ),

  // Jamu & Fermentasi
  item(
    'kunir-asem',
    'Kunir Asem',
    'jamu',
    12000,
    'Kunyit segar & asam jawa. Disajikan dingin.',
    {
      image: '/images/menu/kunir-asem.png',
      tags: ['es', 'khas'],
    },
  ),

  // Teh, Madu & Coklat
  item(
    'teh',
    'Es Teh',
    'teh',
    5000,
    'Teh seduh gula batu. Bisa es atau panas.',
    {
      image: '/images/menu/es-teh.png',
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
    'Nasi pecel sayur & telur dengan bumbu kacang.',
    {
      image: '/images/menu/nasi-pecel.png',
      tags: ['khas', 'laris'],
    },
  ),
  item(
    'soto-ayam',
    'Soto Ayam',
    'makanan',
    15000,
    'Soto kuah hangat dengan suwiran ayam kampung.',
    {
      image: '/images/menu/soto-ayam.png',
      tags: ['berkuah'],
    },
  ),

  // Snack
  item(
    'mendoan',
    'Mendoan',
    'snack',
    8000,
    'Tempe mendoan hangat, isi 4.',
    {
      image: '/images/menu/mendoan.png',
      tags: ['khas', 'laris'],
    },
  ),

  // Tambahan
  item(
    'nasi-telor-bungadi',
    'Nasi dan Telur',
    'tambahan',
    10000,
    'Nasi putih hangat dengan telur dadar atau ceplok.',
    {
      image: '/images/menu/nasi-telur.png',
      option: pilih('Jenis', 'Dadar', 'Ceplok'),
    },
  ),
];

export const initialTables = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return { code: `M${String(n).padStart(2, '0')}`, name: `Meja ${n}, lantai 2` };
});

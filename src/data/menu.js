// Menu diambil dari buku menu resmi kedai (PDF "NEW MENU B 2026" di linktr.ee/BuNgadi).
// Tetap konfirmasi ulang ke pemilik sebelum dipakai, karena harga bisa berubah.

export const categories = [
  { id: 'wedang', name: 'Wedang & Rempah', icon: '/images/icons/cat-wedang.svg', image: '/images/categories/wedang.png' },
  { id: 'kopi', name: 'Kopi', icon: '/images/icons/cat-kopi.svg', image: '/images/categories/kopi.png' },
  { id: 'jamu', name: 'Jamu & Fermentasi', icon: '/images/icons/cat-jamu.svg', image: '/images/categories/jamu.png' },
  { id: 'teh', name: 'Teh, Madu & Coklat', icon: '/images/icons/cat-teh.svg', image: '/images/categories/teh.png' },
  { id: 'makanan', name: 'Makanan', icon: '/images/icons/cat-makanan.svg', image: '/images/categories/makanan.png' },
  { id: 'snack', name: 'Snack', icon: '/images/icons/cat-snack.svg', image: '/images/categories/snack.png' },
  { id: 'tambahan', name: 'Tambahan', icon: '/images/icons/cat-tambahan.svg', image: '/images/categories/tambahan.png' },
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

// Pilihan penyajian. Harga di pilihan menggantikan harga dasar bila diisi.
const panasEs = {
  label: 'Penyajian',
  choices: [
    { id: 'panas', name: 'Panas' },
    { id: 'es', name: 'Es' },
  ],
};
const gorengBakar = (goreng, bakar) => ({
  label: 'Dimasak',
  choices: [
    { id: 'goreng', name: 'Goreng', price: goreng },
    { id: 'bakar', name: 'Bakar', price: bakar },
  ],
});
const pilih = (label, ...names) => ({
  label,
  choices: names.map((name) => ({ id: name.toLowerCase(), name })),
});

const itemImageMap = {
  'wedang-uwuh': '/images/menu/wedang-uwuh.png',
  'wedang-uwuh-bungadi': '/images/menu/wedang-uwuh.png',
  'wedang-uwuh-temanten': '/images/menu/wedang-uwuh.png',
  'jahe': '/images/menu/jahe-susu.png',
  'jahe-susu': '/images/menu/jahe-susu.png',
  'jahe-jeruk': '/images/menu/jahe-susu.png',
  'jahe-coklat': '/images/menu/jahe-susu.png',
  'kopi-bungadi': '/images/menu/kopi-tubruk.png',
  'kunir-asem': '/images/menu/kunir-asem.png',
  'teh': '/images/menu/es-teh.png',
  'soto-ayam': '/images/menu/soto-ayam.png',
  'nasi-telor-bungadi': '/images/menu/nasi-telur.png',
  'nasi-pecel': '/images/menu/nasi-pecel.png',
  'mendoan': '/images/menu/mendoan.png',
};

// tags: panas/es dipakai asisten menu; khas = menu andalan kedai
const item = (id, name, category, price, description, extra = {}) => ({
  id,
  name,
  category,
  price,
  description,
  image: extra.image ?? itemImageMap[id] ?? categoryDefaultImage[category],
  tags: [],
  available: true,
  ...extra,
});

export const initialMenu = [
  item('wedang-uwuh', 'Wedang Uwuh', 'wedang', 8000, 'Wedang uwuh dengan gula batu cair.', { option: panasEs, tags: ['khas'] }),
  item('wedang-uwuh-bungadi', 'Wedang Uwuh Bu Ngadi', 'wedang', 10000, 'Wedang uwuh dengan gula palem.', { option: panasEs, tags: ['khas'] }),
  item('wedang-uwuh-temanten', 'Wedang Uwuh Temanten', 'wedang', 12000, 'Wedang uwuh dengan susu kental manis.', { option: panasEs, tags: ['khas'] }),
  item('jahe', 'Jahe', 'wedang', 7000, 'Wedang jahe.', { option: panasEs }),
  item('jahe-susu', 'Jahe Susu', 'wedang', 10000, 'Jahe dengan susu kental manis.', { option: panasEs }),
  item('jahe-jeruk', 'Jahe Jeruk', 'wedang', 10000, 'Jahe dengan jeruk nipis.', { option: panasEs }),
  item('jahe-coklat', 'Jahe Coklat', 'wedang', 15000, 'Jahe dengan dark chocolate.', { option: panasEs }),
  item('jeruk-nipis', 'Jeruk Nipis', 'wedang', 6000, 'Perasan jeruk nipis.', { option: panasEs }),
  item('jeruk-wedang', 'Jeruk Wedang', 'wedang', 6000, 'Wedang jeruk.', { option: panasEs }),

  item('kopi-bungadi', 'Kopi Bu Ngadi', 'kopi', 12000, 'Kopi ireng tubruk.', { tags: ['panas', 'khas'] }),
  item('kopi-tarik-ireng', 'Kopi Tarik Ireng', 'kopi', 12000, 'Kopi ireng tanpa ampas.', { tags: ['panas'] }),
  item('kopi-tarik-susu', 'Kopi Tarik Susu', 'kopi', 15000, 'Kopi susu tanpa ampas.', { tags: ['panas'] }),
  item('kopi-jahe', 'Kopi Jahe', 'kopi', 15000, 'Kopi dengan jahe.', { tags: ['panas'] }),
  item('arjuna', 'Arjuna', 'kopi', 20000, 'Espresso, gula palem, susu segar.', { tags: ['es'] }),
  item('ayem', 'Ayem', 'kopi', 20000, 'Espresso, susu kental manis, gula batu, susu segar.', { tags: ['es'] }),
  item('tresna', 'Tresna', 'kopi', 22000, 'Espresso, dark chocolate, susu segar.', { tags: ['es'] }),
  item('filter-coffee', 'Filter Coffee', 'kopi', 20000, '', { option: panasEs }),

  item('beras-kencur', 'Beras Kencur', 'jamu', 12000, 'Rimpang kencur & rendaman beras.', { tags: ['es', 'khas'] }),
  item('kunir-asem', 'Kunir Asem', 'jamu', 12000, 'Kunyit & asam jawa.', { tags: ['es', 'khas'] }),
  item('gula-asem', 'Gula Asem', 'jamu', 12000, 'Asam jawa & gula merah.', { tags: ['es'] }),
  item('kombucha', 'Kombucha', 'jamu', 17000, 'Minuman teh fermentasi.', { tags: ['es'] }),

  item('teh', 'Teh', 'teh', 5000, '', { option: panasEs }),
  item('teh-jahe', 'Teh Jahe', 'teh', 10000, 'Teh dengan jahe.', { option: panasEs }),
  item('teh-lemon', 'Teh Lemon', 'teh', 12000, 'Teh dengan lemon.', { option: panasEs }),
  item('teh-leci', 'Teh Leci', 'teh', 15000, 'Teh dengan leci.', { option: panasEs }),
  item('madu', 'Madu', 'teh', 15000, 'Madu.', { option: panasEs }),
  item('madu-jeruk', 'Madu Jeruk', 'teh', 18000, 'Madu dengan jeruk nipis.', { option: panasEs }),
  item('madu-susu', 'Madu Susu', 'teh', 18000, 'Madu dengan susu segar.', { option: panasEs }),
  item('madu-jahe', 'Madu Jahe', 'teh', 18000, 'Madu dengan jahe.', { option: panasEs }),
  item('coklat-wae', 'Coklat Wae', 'teh', 15000, 'Dark chocolate.', { option: panasEs }),
  item('coklat-susu', 'Coklat Susu', 'teh', 18000, 'Dark chocolate dan susu segar.', { option: panasEs }),
  item('matcha', 'Matcha', 'teh', 18000, 'Matcha dan susu segar.', { option: panasEs }),

  item('soto-ayam', 'Soto Ayam Kampung', 'makanan', 15000, 'Soto dengan daging ayam kampung.', { tags: ['berkuah'] }),
  item('nasi-telor-bungadi', 'Nasi Telor Bu Ngadi', 'makanan', 13000, 'Nasi telor bumbu khas Bu Ngadi.', { tags: ['khas'] }),
  item('indomie', 'Indomie', 'makanan', 13000, 'Indomie dengan isian telor & sayuran.', { option: pilih('Jenis', 'Rebus', 'Goreng') }),
  item('nasi-lele', 'Nasi Lele', 'makanan', 16000, 'Nasi lele dengan lalapan & sambel.', { option: gorengBakar(16000, 18000) }),
  item('nasi-ayam-kota', 'Nasi Ayam Kota', 'makanan', 20000, 'Nasi ayam kota dengan lalapan & sambel.', { option: gorengBakar(20000, 22000) }),
  item('nasi-ayam-kampung', 'Nasi Ayam Kampung', 'makanan', 28000, 'Nasi ayam kampung dengan lalapan & sambel.', { option: gorengBakar(28000, 30000) }),
  item('nasi-bebek', 'Nasi Bebek', 'makanan', 33000, 'Nasi bebek dengan lalapan & sambel.', { option: gorengBakar(33000, 35000) }),
  item('nasi-goreng', 'Nasi Goreng', 'makanan', 20000, 'Nasi goreng dengan isian ayam & telur.'),
  item('chicken-steak', 'Chicken Steak', 'makanan', 25000, 'Steak ayam dengan saus BBQ.'),
  item('nasi-nila', 'Nasi Nila', 'makanan', 22000, 'Nasi nila dengan lalapan & sambel.', { option: gorengBakar(22000, 24000) }),
  item('nasi-pecel', 'Nasi Pecel', 'makanan', 15000, 'Nasi pecel sayur & telur dengan bumbu kacang.', { tags: ['khas'] }),

  item('mendoan', 'Mendoan', 'snack', 8000, 'Tempe mendoan, isi 4.'),
  item('bakwan', 'Bakwan', 'snack', 8000, 'Bakwan sayur, isi 4.'),
  item('pisang', 'Pisang Goreng', 'snack', 8000, 'Pisang kepok goreng, isi 3.'),
  item('singkong', 'Singkong', 'snack', 10000, 'Singkong goreng.'),
  item('tahu-walik', 'Tahu Walik', 'snack', 10000, 'Tahu walik, isi 5.'),
  item('tahu-bakso', 'Tahu Bakso', 'snack', 12000, 'Tahu bakso, isi 3.'),
  item('kentang', 'Kentang Goreng', 'snack', 10000, 'Kentang goreng.'),

  item('tempe-garit', 'Tempe Garit', 'tambahan', 6000, 'Isi 3.'),
  item('telur', 'Telur', 'tambahan', 5000, 'Telur dadar atau ceplok.', { option: pilih('Jenis', 'Dadar', 'Ceplok') }),
  item('ati-ampela', 'Ati Ampela', 'tambahan', 6000, ''),
  item('kepala', 'Kepala', 'tambahan', 7000, ''),
  item('sambel', 'Sambel', 'tambahan', 5000, 'Sambel bawang atau kecap.', { option: pilih('Jenis', 'Bawang', 'Kecap') }),
  item('nasi', 'Nasi Putih', 'tambahan', 5000, 'Seporsi nasi putih.'),
];

// DATA CONTOH: daftar meja. Kode meja dipakai di URL QR, misalnya /meja/M01.
export const initialTables = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  return { code: `M${String(n).padStart(2, '0')}`, name: `Meja ${n}` };
});

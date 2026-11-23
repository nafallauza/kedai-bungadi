import { useMemo, useState } from 'react';
import { ImagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { categories, categoryDefaultImage, panasEs } from '../../data/menu';
import { deleteMenuItem, saveMenuItem } from '../../lib/api';
import { useMenu } from '../../lib/hooks';
import { formatRupiah } from '../../utils/format';
import {
  ConfirmSheet,
  Loading,
  MenuThumb,
  Sheet,
  btnPrimary,
  btnSecondary,
  card,
  cx,
  input,
} from '../../components/ui';

const TAG_OPTIONS = [
  { id: 'khas', label: 'Khas Bu Ngadi' },
  { id: 'laris', label: 'Sering dipesan' },
  { id: 'panas', label: 'Panas / hangat' },
  { id: 'es', label: 'Dingin / es' },
  { id: 'kopi', label: 'Mengandung kopi' },
  { id: 'berkuah', label: 'Berkuah' },
];

function MenuFormSheet({ initial, open, onClose }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'wedang');
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [hasPanasEs, setHasPanasEs] = useState(Boolean(initial?.option?.choices?.some((c) => c.id === 'panas')));
  const [image, setImage] = useState(initial?.image ?? '');
  const [tags, setTags] = useState(initial?.tags ?? []);
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleTag = (id) => {
    setTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto terlalu besar (maksimal 2 MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const numPrice = Number(price);
    if (!name.trim()) {
      setError('Nama menu wajib diisi.');
      return;
    }
    if (!Number.isInteger(numPrice) || numPrice <= 0) {
      setError('Harga harus berupa angka bulat positif (misalnya 10000).');
      return;
    }
    setSaving(true);
    try {
      await saveMenuItem({
        ...initial,
        name: name.trim(),
        category,
        price: numPrice,
        description: description.trim(),
        image: image || categoryDefaultImage[category],
        option: hasPanasEs ? panasEs : initial?.option && !initial.option.choices.some((c) => c.id === 'panas') ? initial.option : undefined,
        tags,
        available,
      });
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Ubah menu' : 'Tambah menu baru'}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {/* Pratinjau & unggah foto */}
        <div className="flex items-center gap-4">
          <MenuThumb
            item={{ name: name || 'Pratinjau', category, image: image || categoryDefaultImage[category] }}
            className="size-[72px]"
            width={72}
            height={72}
          />
          <div>
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border border-kopi-200 bg-kertas px-3.5 text-xs font-semibold text-kopi-800 hover:bg-kopi-100">
              <ImagePlus strokeWidth={1.75} className="size-4 text-terakota-700" aria-hidden="true" />
              Ganti foto hidangan
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="sr-only" />
            </label>
            <p className="mt-1 text-xs text-kopi-600">JPG, PNG, atau WebP (maks. 2 MB).</p>
          </div>
        </div>

        <div>
          <label htmlFor="m-name" className="block text-sm font-semibold text-kopi-900">
            Nama menu <span className="text-terakota-700">*</span>
          </label>
          <input
            id="m-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Wedang Uwuh Gula Palem"
            className={cx(input, 'mt-1.5')}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="m-cat" className="block text-sm font-semibold text-kopi-900">
              Kategori
            </label>
            <select
              id="m-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cx(input, 'mt-1.5')}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="m-price" className="block text-sm font-semibold text-kopi-900">
              Harga (Rp) <span className="text-terakota-700">*</span>
            </label>
            <input
              id="m-price"
              type="number"
              min={500}
              step={500}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="10000"
              className={cx(input, 'mt-1.5')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="m-desc" className="block text-sm font-semibold text-kopi-900">
            Deskripsi singkat
          </label>
          <textarea
            id="m-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bahan utama atau cara penyajian"
            className={cx(input, 'mt-1.5 py-2.5')}
          />
        </div>

        <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-[12px] border border-kopi-200 bg-kopi-50 px-3.5 py-2.5 text-sm font-medium text-kopi-900">
          <input
            type="checkbox"
            checked={hasPanasEs}
            onChange={(e) => setHasPanasEs(e.target.checked)}
            className="size-4 accent-[#7f3b25]"
          />
          Sediakan pilihan penyajian Panas / Es
        </label>

        <fieldset>
          <legend className="text-sm font-semibold text-kopi-900">Penanda menu (untuk Asisten Tanya Menu)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const active = tags.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  aria-pressed={active}
                  className={cx(
                    'min-h-[40px] rounded-full border px-3.5 text-xs font-semibold transition-colors',
                    active
                      ? 'border-terakota-700 bg-terakota-50 text-terakota-800'
                      : 'border-kopi-200 bg-kertas text-kopi-700 hover:bg-kopi-100',
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm font-medium text-kopi-900">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="size-4 accent-[#7f3b25]"
          />
          Tampilkan sebagai menu tersedia hari ini
        </label>

        {error && (
          <p className="rounded-[10px] border border-[#f5c7c2] bg-[#fdf1f0] px-3.5 py-2 text-xs font-medium text-[#b42318]" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-kopi-200 pt-4">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Batal
          </button>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? 'Menyimpan…' : 'Simpan menu'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export default function MenuAdminPage() {
  const { data: menu, loading } = useMenu();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('semua');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (menu ?? []).filter((m) => {
      if (cat !== 'semua' && m.category !== cat) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    });
  }, [menu, query, cat]);

  const toggleAvailable = (item) => saveMenuItem({ ...item, available: !item.available });

  if (loading) return <Loading text="Memuat daftar menu…" />;

  const availableCount = (menu ?? []).filter((m) => m.available).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-kopi-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-kopi-950">
            Kelola Menu
          </h1>
          <p className="mt-1 text-sm text-kopi-600">
            {menu?.length ?? 0} menu terdaftar · {availableCount} tersedia hari ini. Perubahan langsung tampil di HP pelanggan.
          </p>
        </div>
        <button type="button" onClick={() => setAdding(true)} className={btnPrimary}>
          <Plus strokeWidth={1.75} className="size-4" aria-hidden="true" />
          Tambah menu
        </button>
      </header>

      {/* Cari & filter kategori */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ id: 'semua', shortName: 'Semua' }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cx(
                'min-h-[42px] shrink-0 rounded-[10px] border px-3.5 text-xs font-semibold transition-colors',
                cat === c.id
                  ? 'border-terakota-700 bg-terakota-700 text-kertas'
                  : 'border-kopi-200 bg-kertas text-kopi-800 hover:bg-kopi-100',
              )}
            >
              {c.shortName}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-kopi-500"
            aria-hidden="true"
          />
          <label htmlFor="admin-menu-search" className="sr-only">
            Cari nama menu
          </label>
          <input
            id="admin-menu-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu…"
            className={cx(input, 'pl-10')}
          />
        </div>
      </div>

      {/* Daftar menu responsif */}
      <section className={cx(card, 'mt-5 overflow-hidden')}>
        <ul className="divide-y divide-kopi-100">
          {filtered.map((item) => {
            const catLabel = categories.find((c) => c.id === item.category)?.shortName ?? item.category;
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:flex-nowrap"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <MenuThumb item={item} className="size-[52px]" width={52} height={52} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-kopi-950">{item.name}</p>
                    <p className="mt-0.5 text-xs text-kopi-600">
                      {catLabel} · <span className="font-semibold tabular-nums text-terakota-700">{formatRupiah(item.price)}</span>
                      {item.option ? ` · ${item.option.choices.map((c) => c.name).join('/')}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAvailable(item)}
                    className={cx(
                      'min-h-[44px] rounded-[10px] border px-3 text-xs font-semibold transition-colors',
                      item.available
                        ? 'border-[#c2e4cc] bg-[#edf7f0] text-[#166534] hover:bg-[#dff2e5]'
                        : 'border-kopi-200 bg-kopi-100 text-kopi-700 hover:bg-kopi-200',
                    )}
                  >
                    {item.available ? 'Tersedia' : 'Habis'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="grid size-[44px] place-items-center rounded-[10px] border border-kopi-200 bg-kertas text-kopi-800 hover:bg-kopi-100"
                    aria-label={`Ubah ${item.name}`}
                  >
                    <Pencil strokeWidth={1.75} className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="grid size-[44px] place-items-center rounded-[10px] border border-[#f5c7c2] bg-[#fdf1f0] text-[#b42318] hover:bg-[#fbe2df]"
                    aria-label={`Hapus ${item.name}`}
                  >
                    <Trash2 strokeWidth={1.75} className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {adding && <MenuFormSheet open onClose={() => setAdding(false)} />}
      {editing && <MenuFormSheet key={editing.id} initial={editing} open onClose={() => setEditing(null)} />}

      <ConfirmSheet
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMenuItem(deleteTarget.id)}
        title={`Hapus "${deleteTarget?.name ?? ''}"?`}
        description="Menu akan dihapus dari daftar pelanggan. Kamu bisa menambahkannya lagi kapan saja."
        confirmLabel="Ya, hapus menu"
        danger
      />
    </div>
  );
}

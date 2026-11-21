import { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { categories } from '../../data/menu';
import { deleteMenuItem, saveMenuItem } from '../../lib/api';
import { useMenu } from '../../lib/hooks';
import { formatRupiah } from '../../utils/format';
import { Loading, MenuThumb, Sheet, Spinner, btnPrimary, card, cx, input } from '../../components/ui';

const tagOptions = ['hangat', 'dingin', 'manis', 'pedas', 'gurih', 'berat', 'camilan', 'khas'];
const emptyItem = { name: '', category: 'wedang', price: '', description: '', tags: [], available: true };
const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? id;

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-emerald-600' : 'bg-kopi-300')}
    >
      <span className={cx('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-soft transition-transform', checked && 'translate-x-5')} />
    </button>
  );
}

function MenuForm({ item, onDone }) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveMenuItem(form);
      onDone();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="menu-name" className="text-sm font-medium">Nama menu</label>
        <input id="menu-name" required value={form.name} onChange={(e) => set('name', e.target.value)} className={cx(input, 'mt-1.5')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="menu-category" className="text-sm font-medium">Kategori</label>
          <select id="menu-category" value={form.category} onChange={(e) => set('category', e.target.value)} className={cx(input, 'mt-1.5')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="menu-price" className="text-sm font-medium">Harga (Rp)</label>
          <input
            id="menu-price"
            type="number"
            inputMode="numeric"
            min="1"
            step="500"
            required
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            className={cx(input, 'mt-1.5')}
          />
        </div>
      </div>
      <div>
        <label htmlFor="menu-desc" className="text-sm font-medium">Deskripsi</label>
        <textarea
          id="menu-desc"
          rows={2}
          maxLength={160}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className={cx(input, 'mt-1.5 h-auto py-2.5')}
        />
      </div>
      <div>
        <p className="text-sm font-medium">Label <span className="font-normal text-kopi-400">(dipakai asisten rekomendasi)</span></p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tagOptions.map((t) => {
            const on = form.tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => set('tags', on ? form.tags.filter((x) => x !== t) : [...form.tags, t])}
                className={cx(
                  'rounded-full border px-3 py-1 text-xs font-medium capitalize',
                  on ? 'border-terakota-300 bg-terakota-50 text-terakota-800' : 'border-black/[0.08] text-kopi-600',
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-kopi-50 p-3">
        <span className="text-sm font-medium">Tersedia untuk dipesan</span>
        <Switch checked={form.available} onChange={(v) => set('available', v)} label="Tersedia" />
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={saving} className={cx(btnPrimary, 'w-full')}>
        {saving && <Spinner className="size-4" />} Simpan
      </button>
    </form>
  );
}

export default function MenuAdminPage() {
  const { data: menu, loading } = useMenu();
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const run = async (action) => {
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = (item) =>
    window.confirm(`Hapus "${item.name}" dari menu?`) && run(() => deleteMenuItem(item.id));

  const list = (menu ?? []).filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Kelola menu</h1>
          <p className="mt-0.5 text-sm text-kopi-500">Matikan "Tersedia" saat menu habis supaya tidak bisa dipesan pelanggan.</p>
        </div>
        <button type="button" onClick={() => setEditing(emptyItem)} className={btnPrimary}>
          <Plus strokeWidth={1.5} className="size-4" /> Tambah menu
        </button>
      </div>

      <div className="relative mt-5 max-w-sm">
        <Search strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-kopi-400" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari menu…" className={cx(input, 'pl-10')} />
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

      {loading && <Loading />}
      {menu && (
        <div className={cx(card, 'mt-5 divide-y divide-black/[0.06]')}>
          {list.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 sm:px-4">
              <MenuThumb item={item} className="size-12" />
              <div className="min-w-0 flex-1">
                <p className={cx('truncate font-medium', !item.available && 'text-kopi-400')}>{item.name}</p>
                <p className="text-sm text-kopi-500">
                  {categoryName(item.category)} · <span className="tabular-nums">{formatRupiah(item.price)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-kopi-500 sm:inline">{item.available ? 'Tersedia' : 'Habis'}</span>
                <Switch
                  checked={item.available}
                  onChange={(v) => run(() => saveMenuItem({ ...item, available: v }))}
                  label={`${item.name} tersedia`}
                />
                <button type="button" onClick={() => setEditing(item)} className="grid size-9 place-items-center rounded-lg text-kopi-600 hover:bg-kopi-100" aria-label={`Ubah ${item.name}`}>
                  <Pencil strokeWidth={1.5} className="size-4" />
                </button>
                <button type="button" onClick={() => remove(item)} className="grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label={`Hapus ${item.name}`}>
                  <Trash2 strokeWidth={1.5} className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="p-6 text-center text-sm text-kopi-500">Menu tidak ditemukan.</p>}
        </div>
      )}

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? 'Ubah menu' : 'Tambah menu'}>
        {editing && <MenuForm key={editing.id ?? 'baru'} item={editing} onDone={() => setEditing(null)} />}
      </Sheet>
    </div>
  );
}

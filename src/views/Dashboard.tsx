import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FolderPlus, LogOut, Plus, Loader2, Edit2, Trash2, X, Search } from 'lucide-react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
  category_id: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const apiEndpoint = import.meta.env.VITE_ENDPOINT;
  const token = localStorage.getItem('token');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QUERY STATE
  const [searchQuery, setSearchQuery] = useState('');

  // KATEGORI STATE
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // PRODUK STATE
  const [productName, setProductName] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productPrice, setProductPrice] = useState(''); // Disimpan sebagai string berformat
  const [productCategoryId, setProductCategoryId] = useState<number | ''>('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${apiEndpoint}/categories`, authHeaders),
        axios.get(`${apiEndpoint}/products`, authHeaders),
      ]);

      setCategories(catRes.data.data || catRes.data);
      setProducts(prodRes.data.data || prodRes.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setError(err.response?.data?.message || 'Gagal memuat data dari server.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [token, navigate, fetchData]);

  // ANGKA FORMATTER
  const formatNumber = (value: string) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatNumber(rawValue);
    setProductPrice(formatted);
  };

  // FILTER PRODUK USING .CONTAIN
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =================== KATEGORI HANDLERS ===================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCategoryId) {
        const response = await axios.patch(
          `${apiEndpoint}/categories/${editingCategoryId}`,
          { name: categoryName, description: categoryDesc },
          authHeaders
        );
        const updatedCat = response.data.data || response.data;
        setCategories(categories.map((c) => (c.id === editingCategoryId ? updatedCat : c)));
        setEditingCategoryId(null);
        alert('Kategori berhasil diperbarui');
      } else {
        const response = await axios.post(
          `${apiEndpoint}/categories`,
          { name: categoryName, description: categoryDesc },
          authHeaders
        );
        const newCat = response.data.data || response.data;
        setCategories([...categories, newCat]);
        alert('Kategori berhasil ditambahkan');
      }
      setCategoryName('');
      setCategoryDesc('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Gagal menyimpan kategori');
      }
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await axios.delete(`${apiEndpoint}/categories/${id}`, authHeaders);
      setCategories(categories.filter((c) => c.id !== id));
      alert('Kategori berhasil dihapus');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Gagal menghapus kategori');
      }
    }
  };
  // =================== END KATEGORI HANDLERS ===================

  // =================== PRODUK HANDLERS ===================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice || !productStock || productCategoryId === '') return;
    const rawPrice = Number(productPrice.replace(/\./g, ''));

    try {
      const payload = {
        name: productName,
        stock: Number(productStock),
        price: rawPrice,
        category_id: Number(productCategoryId),
      };

      if (editingProductId) {
        const response = await axios.patch(`${apiEndpoint}/products/${editingProductId}`, payload, authHeaders);
        const updatedProd = response.data.data || response.data;
        setProducts(products.map((p) => (p.id === editingProductId ? updatedProd : p)));
        setEditingProductId(null);
        alert('Produk berhasil diperbarui');
      } else {
        const response = await axios.post(`${apiEndpoint}/products`, payload, authHeaders);
        const newProd = response.data.data || response.data;
        setProducts([...products, newProd]);
        alert('Produk berhasil ditambahkan');
      }

      setProductName('');
      setProductStock('');
      setProductPrice('');
      setProductCategoryId('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Gagal menyimpan produk');
      }
    }
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductStock(prod.stock.toString());
    setProductPrice(formatNumber(prod.price.toString()));
    setProductCategoryId(prod.category_id);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await axios.delete(`${apiEndpoint}/products/${id}`, authHeaders);
      setProducts(products.filter((p) => p.id !== id));
      alert('Produk berhasil dihapus');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Gagal menghapus produk');
      }
    }
  };
  // =================== END PRODUK HANDLERS ===================

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const getCategoryName = (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Tanpa Kategori';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <Package className="h-6 w-6" /> Product Manager
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 transition"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kelola Kategori */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-sky-300">
                <FolderPlus className="h-5 w-5" /> {editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              {editingCategoryId && (
                <button
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryName('');
                    setCategoryDesc('');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Batal
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Elektronik"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Deskripsi</label>
                <input
                  type="text"
                  placeholder="Perangkat elektronik dan gadget"
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-500 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition flex items-center justify-center gap-1 mt-2"
              >
                {editingCategoryId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingCategoryId ? 'Update Kategori' : 'Tambah Kategori'}
              </button>
            </form>

            <div className="mt-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daftar Kategori</span>
              <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-500">Belum ada kategori</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center bg-slate-700/50 px-3 py-2 rounded-md border border-slate-600/50 text-xs">
                      <div>
                        <span className="font-medium text-white">{cat.name}</span>
                        {cat.description && <p className="text-slate-400 text-[10px]">{cat.description}</p>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEditCategory(cat)} className="text-sky-400 hover:text-sky-300 p-1">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Form Tambah/Edit Produk */}
          <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-sky-300">
                <Package className="h-5 w-5" /> {editingProductId ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
              {editingProductId && (
                <button
                  onClick={() => {
                    setEditingProductId(null);
                    setProductName('');
                    setProductStock('');
                    setProductPrice('');
                    setProductCategoryId('');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Batal
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laptop Gaming"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Kategori</label>
                <select
                  required
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stok</label>
                <input
                  type="number"
                  required
                  placeholder="10"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Harga (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="15.000.000"
                  value={productPrice}
                  onChange={handlePriceChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-sky-500 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition flex items-center justify-center gap-1"
                >
                  {editingProductId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingProductId ? 'Update Produk' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tabel Produk & Search Bar */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200">Daftar Produk</h3>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-sky-400" />}
            </div>

            {/* Input Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3">Nama Produk</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Stok</th>
                <th className="px-6 py-3">Harga</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    {searchQuery ? 'Produk tidak ditemukan.' : 'Belum ada produk tersedia.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 px-2 py-0.5 rounded text-xs border border-slate-600">
                        {getCategoryName(item.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.stock} pcs</td>
                    <td className="px-6 py-4">Rp {Number(item.price).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditProduct(item)}
                        className="text-sky-400 hover:text-sky-300 transition p-1"
                        title="Edit Produk"
                      >
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="text-red-400 hover:text-red-300 transition p-1"
                        title="Hapus Produk"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
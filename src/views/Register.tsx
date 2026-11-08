import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const apiEndpoint = import.meta.env.VITE_ENDPOINT;

    try {
      await axios.post(`${apiEndpoint}/auth/register`, {
        email,
        password,
      });
      alert('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert('Gagal mendaftarkan akun, periksa kembali data Anda');
        setError(err.response?.data?.message || 'Gagal mendaftarkan akun, periksa kembali data Anda');
      } else {
        alert('Terjadi kesalahan yang tidak diketahui');
        setError('Terjadi kesalahan yang tidak diketahui');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">Buat Akun Baru</h2>
          <p className="mt-1 text-sm text-slate-400">Isi data di bawah untuk mendaftar</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white focus:border-sky-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-sky-500 py-2.5 font-medium text-white transition hover:bg-sky-600 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Daftar Akun'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Sudah punya akun?{' '}
          <Link to="/" className="font-medium text-sky-400 hover:underline">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
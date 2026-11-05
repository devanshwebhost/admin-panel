'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShield, FiLock } from 'react-icons/fi';
import DotGrid from '@/components/DotGrid';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (res?.ok) {
      router.push('/dashboard');
      return;
    }

    // Avoid reading credentials/error info from the URL (can leak to address bar)
    const rawError = (res?.error || '').toLowerCase();
    const err = rawError || '';

    if (err.includes('email') && err.includes('verify')) {
      setMsg('⚠️ Please verify your email before logging in.');
    } else if (err.includes('admin') || err.includes('access') || err.includes('deny')) {
      setMsg('Your access has been denied by the administrator. Please contact the administrator for assistance.');
    } else {
      setMsg('❌ Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b1a] px-4">
      <div style={{ width: '100%', height: '100vh', position: 'fixed' }}>
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#16294f"
          activeColor="#22d3ee"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#0a1428]/95 border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.25)] backdrop-blur p-6 sm:p-10">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
            <FiShield size={28} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-white">Welcome back, IDM member</h2>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">
          Sign in with your verified account to continue.
        </p>

        {msg && (
          <p
            role="alert"
            className="text-red-300 text-sm text-center mb-4 px-3 py-2 rounded-lg border border-red-400/30 bg-red-500/10"
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-[#050b1a] border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition"
            required
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-[#050b1a] border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition"
            required
          />

          <div className="flex justify-between text-sm">
            <Link href="/forgot-password" className="text-cyan-300 hover:underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-slate-300 hover:underline">
              New here? Sign up
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition text-white rounded-xl font-semibold shadow-lg shadow-blue-900/40 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
          <FiLock className="text-cyan-300" />
          <span>Encrypted connection. Members only.</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  if (res.ok) {
  router.push('/dashboard');
} else {
  // Extract error from URL if available
  const error = new URLSearchParams(window.location.search).get('error');

  if (error?.toLowerCase().includes('email not verified')) {
    setMsg('⚠️ Please verify your email before logging in.');
  } else {
    setMsg('❌ Invalid email or password');
  }
}
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-black md:px-4">
      <div style={{ width: '100%', height: '100vh', position: 'fixed' }}>
  <DotGrid
    dotSize={10}
    gap={15}
    baseColor="#271e37"
    activeColor="#902ba9"
    proximity={120}
    shockRadius={250}
    shockStrength={5}
    resistance={750}
    returnDuration={1.5}
  />
</div>
      <div className="bg-black border border-purple-500 shadow-2xl md:p-8  p-4 sm:p-10 w-[80vw] md:max-w-md fixed">
        <h2 className="text-2xl font-bold text-center  text-white">Welcome Back IDM Member 😃</h2>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Please enter your login info🔑 to continue.
        </p>

        {msg && (
          <p className="text-red-500 text-sm text-center mb-4 animate-fade-in">
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border text-purple-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />

          <div className="flex justify-between text-sm text-gray-600">
            <Link href="/forgot-password" className="text-[#902ba9] hover:underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="hover:underline">
              New here? Sign up
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#902ba9] hover:bg-[#2c1d30] transition text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

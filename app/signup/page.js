'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShield, FiLock } from 'react-icons/fi';

import Particles from '@/components/Particles';

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-[#050b1a] border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition';

export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    agree: false,
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.agree) {
      setMsg('❗ Required fields missing or terms not agreed.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg('Please verify your email before logging in.');
      router.push('/verify-notice'); // instead of login
    } else {
      setMsg(data.error || '❌ Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex-col flex items-center justify-center bg-[#050b1a] px-4 py-8">
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
        <Particles
          particleColors={['#22d3ee', '#3b82f6']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#0a1428]/95 border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.25)] backdrop-blur p-6 sm:p-8">
        <div className="flex justify-center mb-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
            <FiShield size={28} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-1">Create your IDM account</h2>
        <p className="text-sm text-slate-400 text-center mb-5">
          Your details are kept private and used only for member verification.
        </p>

        {msg && (
          <p
            role="alert"
            className="text-center text-sm text-cyan-200 mb-4 px-3 py-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10"
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              name="firstName"
              autoComplete="given-name"
              placeholder="First name *"
              onChange={handleChange}
              className={inputClass}
            />
            <input
              name="lastName"
              autoComplete="family-name"
              placeholder="Last name"
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address *"
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Password *"
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="phone"
            autoComplete="tel"
            placeholder="Phone (optional)"
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="address"
            autoComplete="street-address"
            placeholder="Address (optional)"
            onChange={handleChange}
            className={inputClass}
          />

          <label className="flex items-center text-sm text-slate-300 mt-2">
            <input
              type="checkbox"
              name="agree"
              onChange={handleChange}
              className="mr-2 accent-cyan-400"
            />
            I agree to the <span className="text-cyan-300 ml-1 underline">terms and conditions *</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition text-white rounded-xl font-semibold shadow-lg shadow-blue-900/40 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <Link href="/login" className="text-cyan-300 hover:underline text-sm block text-center">
            Already have an account? Login
          </Link>
        </form>

        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400">
          <FiLock className="text-cyan-300" />
          <span>Encrypted connection. Members only.</span>
        </div>
      </div>
    </div>
  );
}

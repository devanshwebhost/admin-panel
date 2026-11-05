'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiKey, FiLock } from 'react-icons/fi';
import Waves from '@/components/Waves';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      localStorage.setItem('userEmailForOTP', email);
      router.push('/verify-otp');
    } else {
      setMsg(data.error || 'Error sending OTP');
      // Optional: Redirect to signup if user doesn't exist
      if (data.redirect) {
        setTimeout(() => {
          router.push(data.redirect);
        }, 2000); // Wait 2 seconds before redirecting
      }
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-[#050b1a] px-4">
      <Waves
        lineColor="#1d4ed8"
        backgroundColor="#050b1a"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#0a1428]/95 border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.25)] backdrop-blur p-6 sm:p-10">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
            <FiKey size={30} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Forgot your password?</h2>
          <p className="text-sm text-slate-400 mt-1 text-center">
            Enter your email address and we’ll send you a one-time code (OTP) to reset it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#050b1a] border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition"
            required
          />

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition text-white rounded-xl font-semibold shadow-lg shadow-blue-900/40 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        {msg && (
          <p
            role="alert"
            className="mt-4 text-center text-sm text-red-300 px-3 py-2 rounded-lg border border-red-400/30 bg-red-500/10"
          >
            {msg}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
          <FiLock className="text-cyan-300" />
          <span>Encrypted connection. Members only.</span>
        </div>
      </div>
    </div>
  );
}

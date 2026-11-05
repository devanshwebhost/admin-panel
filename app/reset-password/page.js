'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Galaxy from '@/components/Galaxy';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('userEmailForOTP');
    if (!stored) {
      setMsg('⚠️ No email found. Please start from "Forgot Password".');
    } else {
      setEmail(stored);
    }
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setMsg('🔐 Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg('✅ Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } else {
      setMsg(data.error || '❌ Error resetting password');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050b1a] px-6">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Galaxy />
      </div>

      {/* Card */}
      <div className="relative z-10 mx-auto w-full max-w-sm rounded-lg border border-cyan-400/30 bg-[#0a1428] p-8 shadow-[0_0_18px_rgba(34,211,238,0.35)]">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-2xl backdrop-blur">
            🔒
          </div>
          <h2 className="mt-4 text-2xl font-bold text-cyan-300">Reset Password</h2>
          <p className="mt-1 text-sm text-slate-200">Choose a strong new password</p>
        </div>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-cyan-400/30 bg-[#050b1a] px-4 py-3 text-white placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        />

        <button
          onClick={handleReset}
          disabled={loading || !password}
          className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 py-3 font-semibold text-white backdrop-blur transition hover:bg-cyan-400/20 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        {msg && (
          <p className="mt-4 text-center text-sm text-blue-300">{msg}</p>
        )}
      </div>
    </div>
  );
}

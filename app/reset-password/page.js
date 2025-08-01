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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div style={{ width: '100%', height: '600px', position: 'fixed' }}>
  <Galaxy />
</div>
      <div className="w-[90vw] md:w-[30vw] bg-black fixed border border-[#902ba9] shadow-2xl rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl text-purple-600 shadow-inner">
            🔒
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">Choose a strong new password</p>
        </div>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-purple-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition mb-4"
        />

        <button
          onClick={handleReset}
          disabled={loading || !password}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        {msg && (
          <p className="mt-4 text-center text-sm text-purple-600 animate-fade-in">{msg}</p>
        )}
      </div>
    </div>
  );
}

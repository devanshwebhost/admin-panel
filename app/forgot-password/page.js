'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-xl text-blue-600 shadow-inner">
            📧
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Enter your email address and we’ll send you an OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        {msg && (
          <p className="mt-4 text-center text-sm text-red-500 animate-fade-in">{msg}</p>
        )}
      </div>
    </div>
  );
}

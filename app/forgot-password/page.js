'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Waves
  lineColor="#902ba9"
  backgroundColor="#000"
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
      <div className=" md:w-[30vw] w-[90vw] bg-black border border-[#902ba9] shadow-2xl rounded-2xl p-8 sm:p-10  fixed z-[9999]">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl text-[#902ba9] shadow-inner">
            🧐
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Forgot Password?</h2>
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
            className="w-full px-4 py-3 rounded-xl border text-purple-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 bg-[#902ba9] hover:bg-[#27182b] transition text-white rounded-xl font-semibold shadow-lg "
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

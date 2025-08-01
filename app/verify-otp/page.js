'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LetterGlitch from '@/components/LetterGlitch';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmailForOTP');
    if (!storedEmail) {
      setMsg('⚠️ No email found. Please go back and enter your email.');
    } else {
      setEmail(storedEmail);
    }
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length < 4) return;

    setLoading(true);
    setMsg('');

    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg('✅ OTP verified! Redirecting...');
      setTimeout(() => {
        router.push('/reset-password');
      }, 1500);
    } else {
      setMsg(`❌ ${data.error || 'Verification failed'}`);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg('📩 OTP resent to your email!');
    } else {
      setMsg(`❌ ${data.error || 'Could not resend OTP'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black ">
      <LetterGlitch
  glitchSpeed={100}
  centerVignette={true}
  outerVignette={false}
  smooth={true}
/>
      <div className=" w-[90vw] md:w-[30vw] bg-black border border-purple-600 shadow-2xl rounded-2xl p-8 sm:p-10 fixed">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl text-purple-600 shadow-inner">
            🔑
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Verify OTP</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter the OTP sent to your email
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-purple-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition mb-4"
        />

        <button
          onClick={handleVerify}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
          disabled={loading || !otp}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-3">
          Didn’t get the code?{' '}
          <button onClick={handleResend} className="text-purple-600 hover:underline">
            Resend
          </button>
        </p>

        {msg && (
          <p className="mt-4 text-center text-sm text-purple-600 animate-fade-in">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

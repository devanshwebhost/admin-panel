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
    <div className="relative flex min-h-screen items-center justify-center bg-[#050b1a] px-6">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <LetterGlitch
          glitchSpeed={100}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 mx-auto w-full max-w-sm rounded-lg border border-cyan-400/30 bg-[#0a1428] p-8 shadow-[0_0_18px_rgba(34,211,238,0.35)]">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-2xl backdrop-blur">
            🔑
          </div>
          <h2 className="mt-4 text-2xl font-bold text-cyan-300">Verify OTP</h2>
          <p className="mt-1 text-sm text-slate-200">
            Enter the OTP sent to your email
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mb-4 w-full rounded-lg border border-cyan-400/30 bg-[#050b1a] px-4 py-3 text-white placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        />

        <button
          onClick={handleVerify}
          className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 py-3 font-semibold text-white backdrop-blur transition hover:bg-cyan-400/20 disabled:opacity-50"
          disabled={loading || !otp}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <p className="mt-3 text-center text-sm text-slate-200">
          Didn’t get the code?{' '}
          <button
            onClick={handleResend}
            className="text-cyan-300 hover:underline"
          >
            Resend
          </button>
        </p>

        {msg && (
          <p className="mt-4 text-center text-sm text-blue-300">{msg}</p>
        )}
      </div>
    </div>
  );
}

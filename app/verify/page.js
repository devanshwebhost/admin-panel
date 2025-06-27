'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [status, setStatus] = useState('Verifying your email...');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setStatus('❌ Invalid or missing verification token.');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
          setSuccess(true);
          setStatus('✅ Email verified successfully! Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setStatus(`❌ ${data.error || 'Verification failed.'}`);
        }
      } catch (err) {
        setLoading(false);
        setStatus('❌ Something went wrong. Please try again later.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 sm:p-10 text-center">
        <div className="text-4xl mb-4">{loading ? '🔄' : success ? '✅' : '❌'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verification</h2>
        <p className="text-gray-600 text-sm">{status}</p>
        {!success && !loading && (
          <button
            onClick={() => router.push('/login')}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl font-semibold"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}

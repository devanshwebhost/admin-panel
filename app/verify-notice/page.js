'use client';

export default function VerifyNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✅ Signup successful! Please Verify Your Email</h2>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to your email. Please check your inbox and verify your account to continue.
        </p>
        <p className="text-sm text-gray-500">You can close this page after verifying.</p>
      </div>
    </div>
  );
}

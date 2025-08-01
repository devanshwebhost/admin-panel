'use client';

import LightRays from "@/components/LightRays";

export default function VerifyNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center  bg-black px-4">
      <div style={{ width: '100vw', height: '100vh', position: 'fixed' }}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#902ba9"
    raysSpeed={1.5}
    lightSpread={1.8}
    rayLength={1.5}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0.1}
    distortion={0.05}
    className="custom-rays"
  />
</div>
      <div className="bg-black p-6 rounded-xl shadow-xl text-center max-w-md w-full fixed">
        <h2 className="text-2xl font-bold text-white mb-2">😉 Signup successful! Please Verify Your Email</h2>
        <p className="text-gray-600 mb-4">
          🥰 We've sent a verification link to your email. Please check your inbox and verify your account to continue.
        </p>
        <p className="text-sm text-gray-500">You can close this page after verifying.</p>
      </div>
    </div>
  );
}

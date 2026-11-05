'use client';

import LightRays from "@/components/LightRays";

export default function VerifyNotice() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050b1a] px-6">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <LightRays
          raysOrigin="top-center"
          raysColor="#22d3ee"
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

      {/* Card */}
      <div className="relative z-10 mx-auto w-full max-w-sm rounded-lg border border-cyan-400/30 bg-[#0a1428] p-8 text-center shadow-[0_0_18px_rgba(34,211,238,0.35)]">
        <h2 className="mb-3 text-2xl font-bold text-cyan-300">
          😉 Signup successful! Please Verify Your Email
        </h2>
        <p className="mb-4 text-slate-200">
          🥰 We've sent a verification link to your email. Please check your
          inbox and verify your account to continue.
        </p>
        <span className="inline-block rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-blue-300 backdrop-blur md:text-base">
          You can close this page after verifying.
        </span>
      </div>
    </div>
  );
}

import RippleGrid from '@/components/RippelGrid';
import Link from 'next/link';

export default function GoodbyePage() {
  return (
    <div className="relative min-h-screen bg-[#050b1a] px-6 py-12 text-center">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <RippleGrid
          enableRainbow={false}
          gridColor="#22d3ee"
          rippleIntensity={0.05}
          gridSize={10}
          gridThickness={15}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
          opacity={0.5}
        />
      </div>

      {/* Content */}
      <div className="pointer-events-none relative z-10 flex min-h-[80vh] flex-col items-center justify-center">
        <div className="pointer-events-auto mx-auto w-full max-w-sm rounded-lg border border-cyan-400/30 bg-[#0a1428] p-8 shadow-[0_0_18px_rgba(34,211,238,0.35)]">
          <img
            src="/logo.png"
            alt="IDM Logo"
            width={100}
            height={100}
            className="mx-auto mb-6 rounded-full"
          />

          <h1 className="mb-4 text-4xl font-bold text-cyan-300">
            You’ve been signed out!
          </h1>

          <p className="mb-6 text-slate-200">
            Thank you for visiting{' '}
            <span className="font-semibold text-blue-300">PCL</span>. We look
            forward to seeing you again soon!
          </p>

          <Link
            href="/login"
            className="inline-block rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-6 py-2 text-white backdrop-blur transition hover:bg-cyan-400/20"
          >
            Back to Login
          </Link>
        </div>
      </div>

      {/* Trust strip */}
      <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-10 flex justify-center">
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-indigo-300 backdrop-blur md:text-base">
          Your session has ended securely
        </span>
      </div>
    </div>
  );
}


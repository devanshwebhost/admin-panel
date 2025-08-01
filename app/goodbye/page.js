
import RippleGrid from '@/components/RippelGrid';
import Link from 'next/link';

export default function GoodbyePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 py-12 text-center">
      <div style={{position: 'fixed', height: '500px', overflow: 'hidden'}}>
  <RippleGrid
    enableRainbow={false}
    gridColor="#902ba9"
    rippleIntensity={0.05}
    gridSize={10}
    gridThickness={15}
    mouseInteraction={true}
    mouseInteractionRadius={1.2}
    opacity={0.8}
  />
</div>
      <img
        src="/logo.png" // 🖼️ Replace with your actual logo path
        alt="IDM Logo"
        width={100}
        height={100}
        className="mt-6 rounded-full"
      />
      
      <div className='mt-15'>

      <h1 className="text-4xl font-bold text-[#902ba9] mb-4 ">
        You’ve been signed out!
      </h1>

      <p className="text-gray-700 mb-6">
        Thank you for visiting <span className="font-semibold text-[#902ba9]">PCL</span>. 
        We look forward to seeing you again soon!
      </p>

      <Link
        href="/login"
        className="bg-[#902ba9] hover:bg-[#311e36] text-white px-6 py-2 rounded-lg transition relative z-10 "
      >
        Back to Login
      </Link>
      </div>
    </div>
  );
}

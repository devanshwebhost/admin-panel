'use client';

import Cubes from '@/components/Cube';
import GlassIcons from '@/components/GlassIcons';
import { FiLogIn, FiUserPlus, FiShield, FiLock, FiCheckCircle } from 'react-icons/fi';
import CardSwap, { Card } from '@/components/Lanyard';
import { useRouter } from 'next/navigation';
import Squares from '@/components/Square';

export default function StartPage() {
  const router = useRouter();

  const items = [
    { icon: <FiLogIn />, color: 'blue', label: 'Login', onClick: () => router.push('/login') },
    { icon: <FiUserPlus />, color: 'indigo', label: 'Sign Up', onClick: () => router.push('/signup') },
  ];

  return (
    <div
      className="overflow-hidden bg-[#050b1a]"
      style={{ height: '100vh', position: 'relative' }}
    >
      <Cubes />
      <Squares
        speed={0.5}
        squareSize={40}
        direction="diagonal" // up, down, left, right, diagonal
        borderColor="#16294f"
        hoverFillColor="#0c1f4a"
      />

      <CardSwap cardDistance={60} verticalDistance={70} delay={5000} pauseOnHover={false}>
        <Card className="bg-[#0a1428] border border-cyan-400/30 rounded-lg shadow-[0_0_18px_rgba(34,211,238,0.35)] p-8 max-w-sm mx-auto font-sans">
          <div className="flex items-center gap-2 mb-3 text-cyan-300">
            <FiShield size={22} />
            <span className="text-sm">Verified workspace</span>
          </div>
          <h3 className="text-cyan-300 text-3xl font-extrabold mb-4 tracking-wide">
            Welcome to Pascel Workspace
          </h3>
          <p className="text-slate-200 text-lg leading-relaxed font-light">
            Empower your team management with seamless collaboration and smart automation.
          </p>
        </Card>

        <Card className="bg-[#0a1428] border border-blue-400/30 rounded-lg shadow-[0_0_18px_rgba(59,130,246,0.35)] p-8 max-w-sm mx-auto font-sans">
          <div className="flex items-center gap-2 mb-3 text-blue-300">
            <FiLock size={22} />
            <span className="text-sm">Private by design</span>
          </div>
          <h3 className="text-blue-300 text-3xl font-extrabold mb-4 tracking-wide">
            Intelligent AI Integration
          </h3>
          <p className="text-slate-200 text-lg leading-relaxed font-light">
            Harness powerful AI features designed to simplify workflows and boost productivity.
          </p>
        </Card>

        <Card className="bg-[#0a1428] border border-indigo-400/30 rounded-lg shadow-[0_0_18px_rgba(99,102,241,0.35)] p-8 max-w-sm mx-auto font-sans">
          <div className="flex items-center gap-2 mb-3 text-indigo-300">
            <FiCheckCircle size={22} />
            <span className="text-sm">Members only</span>
          </div>
          <h3 className="text-indigo-300 text-3xl font-extrabold mb-4 tracking-wide">
            IDM Presents PSL
          </h3>
          <p className="text-slate-200 text-lg leading-relaxed font-light">
            Manage your teams effortlessly — no headaches, just smooth collaboration.
          </p>
        </Card>
      </CardSwap>

      {/* Heading + security badge */}
      <div className="fixed z-10 md:top-[8vh] md:left-[1vw] md:pl-[50px] left-[50px] top-[80px]">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 text-sm md:text-base backdrop-blur">
          <FiShield />
          <span>Secure access for IDM members</span>
        </div>
        <h1 className="text-white text-6xl md:text-9xl">
          Pascel <br /> Workspace
        </h1>
      </div>

      {/* Login / Sign up */}
      <div className="fixed z-10 md:top-[50vh] md:right-[69vw] top-[40vh] right-[80px]">
        <GlassIcons items={items} className="custom-class" />
        <div className="flex gap-[100px] relative top-[-40px] left-[10px]">
          <h3 className="text-white relative">Sign in</h3>
          <h3 className="text-white relative">Sign up</h3>
        </div>
        <p className="md:hidden text-slate-200 text-center mt-20">
          Powered by <span className="text-cyan-300">Teen Era PVT LTD</span>
        </p>
      </div>

      {/* Trust strip */}
      <div className="fixed z-10 bottom-4 left-0 right-0 flex justify-center px-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#0a1428]/80 text-slate-300 text-xs md:text-sm backdrop-blur">
          <FiLock className="text-cyan-300" />
          <span>Encrypted connection. Only verified IDM members can sign in.</span>
        </div>
      </div>
    </div>
  );
}

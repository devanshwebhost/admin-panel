'use client';

import Cubes from '@/components/Cube';
import GlassIcons from '@/components/GlassIcons';
import { FiFileText, FiLogIn, FiUserPlus, FiCloud,FiEdit, FiBarChart2 } from 'react-icons/fi';
import CardSwap, { Card } from '@/components/Lanyard';
import Lanyard from '@/components/Lanyard';
import { useRouter } from 'next/navigation';
import Hyperspeed from '@/components/HyperSpeed';
import Squares from '@/components/Square';
// import CardSwap, { Card } from './CardSwap'

// update with your own icons and colors




export default function StartPage() {
  const router = useRouter();

    const items = [
  { icon: <FiLogIn />, color: 'purple', label: 'Login', onClick: () => router.push('/login') },
  { icon: <FiUserPlus />, color: 'gray', label: 'Sign Up', onClick: () => router.push('/signup') },
];

  return (
    <div className="overflow-hidden bg-black " style={{ height: '100vh', position: 'relative' }} >
      <Cubes/>
   <Squares 
speed={0.5} 
squareSize={40}
direction='diagonal' // up, down, left, right, diagonal
borderColor='#fff'
hoverFillColor='#222'
/>

      {/* <div > */}
<CardSwap
  cardDistance={60}
  verticalDistance={70}
  delay={5000}
  pauseOnHover={false}
>
  <Card className="dark:bg-gray-900 rounded-lg shadow-[0_0_15px_#902ba9] p-8 max-w-sm mx-auto font-sans">
    <h3 className="text-purple-400 text-3xl font-extrabold mb-4 tracking-wide drop-shadow-[0_0_5px_rgba(144,43,169,0.8)]">
      Welcome to Pascel Workspace
    </h3>
    <p className="text-white text-lg leading-relaxed font-light">
      Empower your team management with seamless collaboration and smart automation.
    </p>
  </Card>

  <Card className="dark:bg-gray-900 rounded-lg shadow-[0_0_15px_#7b22a4] p-8 max-w-sm mx-auto font-sans">
    <h3 className="text-purple-500 text-3xl font-extrabold mb-4 tracking-wide drop-shadow-[0_0_5px_rgba(123,34,164,0.8)]">
      Intelligent AI Integration
    </h3>
    <p className="text-white text-lg leading-relaxed font-light">
      Harness powerful AI features designed to simplify workflows and boost productivity.
    </p>
  </Card>

  <Card className="dark:bg-gray-900 rounded-lg shadow-[0_0_15px_#6a1ea0] p-8 max-w-sm mx-auto font-sans">
    <h3 className="text-purple-600 text-3xl font-extrabold mb-4 tracking-wide drop-shadow-[0_0_5px_rgba(106,30,160,0.8)]">
      IDM Presents PSL
    </h3>
    <p className="text-white text-lg leading-relaxed font-light">
      Manage your teams effortlessly — no headaches, just smooth collaboration.
    </p>
  </Card>
</CardSwap>


{/* </div> */}
         <h1 className='text-white md:text-9xl fixed md:top-[10vh] md:pl-[50px] left-[50px] top-[100px] text-6xl md:left-[1vw]' >Pascel <br/> Workspace</h1>
        <div className="fixed md:top-[50vh] md:right-[69vw] top-[40vh] right-[80px]">
          <GlassIcons items={items} className="custom-class" />
          <div className='flex gap-[100px] relative top-[-40px] left-[10px]'>
          <h3 className='text-white relative '>Sing in</h3>
          <h3 className='text-white relative '>Sing Up</h3>
          </div>
          <p className='md:hidden text-white text-center mt-20 '>Powerd By <span className='text-purple-600'>Teen Era PVT LTD</span></p>
        </div>
      </div>
  );
}

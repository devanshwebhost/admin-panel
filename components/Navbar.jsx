'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-3 md:px-6 py-3 bg-black shadow-md fixed">
      {/* Left Side - Main Logo */}
      <div className="flex items-center">
        <img
          src="/logo.png" // Change to your logo path
          alt="Main Logo"
          width={80}
          height={40}
          className="object-contain"
        />
      </div>


      <div className=' items-center gap-4 text-white hidden md:flex'>
      <h1 className="md:text-2xl hidden md:block">PASCEL | IDM Team Panel</h1>
      <div className='flex  gap-4 text-white'>
        <Link href="/" className='text-purple-500'>Home</Link>
        <Link href="/dashboard" className='text-purple-500'>Already Logged In? Go to Dashboard</Link>
      </div>
      </div>

      {/* Right Side - IDM Logo */}
      <div className="flex items-center">
        <img
          src="/idm-logo.jpg" // Change to IDM logo path
          alt="IDM Logo"
          width={80}
          height={40}
          className="object-contain"
        />
      </div>
    </nav>
  );
}

'use client';

export default function PcNavbar({ title }) {
  return (
    <nav className="hidden md:flex w-full px-8 py-4 border-b border-gray-200 bg-white shadow-sm fixed z-[999]">
      <h1 className="text-xl font-bold text-[#902ba9]">
        {title}
      </h1>
    </nav>
  );
}

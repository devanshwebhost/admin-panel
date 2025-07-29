"use client";
// import Image from "next/image";

const MobileNavbar = ({ title = "Page" }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[rgb(255_251_237)] border-b p-3 shadow md:hidden flex justify-between items-center h-[56px]">
      <h1 className="text-lg font-semibold text-gray-700 pl-2">{title}</h1>
      <img src="/logo.png" alt="logo" width={40} height={40} className="mr-2 rounded" />
    </div>
  );
};

export default MobileNavbar;

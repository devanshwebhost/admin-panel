
import Link from 'next/link';

export default function GoodbyePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12 text-center">
      <img
        src="/assets/logo.jpg" // 🖼️ Replace with your actual logo path
        alt="IDM Logo"
        width={100}
        height={100}
        className="mb-6 rounded-full"
      />

      <h1 className="text-4xl font-bold text-[#902ba9] mb-4">
        You’ve been signed out!
      </h1>

      <p className="text-gray-700 mb-6">
        Thank you for visiting <span className="font-semibold text-[#902ba9]">IDM</span>. 
        We look forward to seeing you again soon!
      </p>

      <Link
        href="/login"
        className="bg-[#902ba9] hover:bg-[#311e36] text-white px-6 py-2 rounded-lg transition"
      >
        Back to Login
      </Link>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';

export default function StartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 to-purple-100">
      <div className="text-center p-6 max-w-xl bg-white shadow-2xl rounded-3xl border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Team Indocs Media 😊</h1>
        <p className="text-gray-600 text-lg mb-6">The future is here, and it's all about the AI and Creative</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-lg transition shadow-md"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl text-lg transition shadow-md"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

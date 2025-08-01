'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Particles from '@/components/Particles';

export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    agree: false,
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.agree) {
      setMsg('❗ Required fields missing or terms not agreed.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);
    

  if (res.ok) {
  setMsg('Please verify your email before logging in.');
  router.push('/verify-notice'); // instead of login

  } else {
      setMsg(data.error || '❌ Something went wrong');
    }
}


  return (
    <div className="min-h-screen flex-col flex items-center justify-center bg-black px-4">
      {/* <h1 className='text-white'>Let,s Create Magic Together</h1> */}
      {/* <SplashCursor/> */}
      <div style={{ width: '100%', height: '600px', position: 'fixed' }}>
  <Particles
    particleColors={['#ffffff', '#ffffff']}
    particleCount={200}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
</div>
      <div className="w-full max-w-md  border border-[#902ba9] shadow-2xl rounded-2xl p-4 sm:p-8 fixed " >
        <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome To IDM 🎥 Create Account</h2>
        <p className="text-sm text-gray-500 text-center mb-4">New Member 🤭 Ready to Create Future</p>

        {msg && (
          <p className="text-center text-sm text-purple-600 mb-4 animate-fade-in">
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="firstName"
            placeholder="First Name *"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address *"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            name="password"
            type="password"
            placeholder="Password *"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            name="phone"
            placeholder="Phone (optional)"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <input
            name="address"
            placeholder="Address (optional)"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          <label className="flex items-center text-sm text-gray-600 mt-2">
            <input
              type="checkbox"
              name="agree"
              onChange={handleChange}
              className="mr-2 accent-purple-600"
            />
            I agree to the <span className="text-purple-600 ml-1 underline">terms and conditions *</span>
          </label>
          
          <Link href="/login" className="text-purple-600 hover:underline text-sm mt-2 block text-center">
          Already have an account? Login
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

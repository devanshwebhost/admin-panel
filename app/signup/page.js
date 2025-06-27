'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
        <p className="text-sm text-gray-500 text-center mb-4">It's quick and easy</p>

        {msg && (
          <p className="text-center text-sm text-blue-600 mb-4 animate-fade-in">
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="firstName"
            placeholder="First Name *"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address *"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            name="password"
            type="password"
            placeholder="Password *"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            name="phone"
            placeholder="Phone (optional)"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            name="address"
            placeholder="Address (optional)"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <label className="flex items-center text-sm text-gray-600 mt-2">
            <input
              type="checkbox"
              name="agree"
              onChange={handleChange}
              className="mr-2 accent-blue-600"
            />
            I agree to the <span className="text-blue-600 ml-1 underline">terms and conditions *</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

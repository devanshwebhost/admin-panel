'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountSection({ user }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const res = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      if (res.ok) {
        setStatus('✅ Account deleted successfully. Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const err = await res.json();
        setStatus(`❌ ${err.error || 'Failed to delete account'}`);
      }
    } catch (error) {
      setStatus('❌ Error deleting account. Please try again.');
    }
  };

  return (
    <div className="bg-red-100 bg-opacity-5 border border-red-500 p-6 rounded-xl mt-10 text-left">
      <h3 className="text-xl font-bold text-red-400">⚠️ Danger Zone</h3>

      <p className="text-sm text-red-500 mt-3">
        Deleting your account will:
        <ul className="list-disc list-inside mt-2 text-red-500 space-y-1">
          <li>Permanently delete your profile, forms & API keys</li>
          <li>Revoke all current and future access to this app</li>
          <li>Remove login capability using this email</li>
        </ul>
        <span className="block font-semibold mt-3">
          This action <u>cannot</u> be undone.
        </span>
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="mt-5 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white shadow-md"
        >
          Delete My Account
        </button>
      ) : (
        <>
          <p className="text-sm text-red-500 mt-4">
            Are you sure you want to delete your account <strong>({user.email})</strong>?
          </p>
          <div className="mt-4 space-x-4">
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-900 hover:bg-gray-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {status && (
        <p className="text-sm mt-4 text-yellow-200">
          {status}
        </p>
      )}
    </div>
  );
}

'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/goodbye' })}
      className="flex items-center gap-2 px-5 py-2 mt-6 text-white bg-[#0c52a2] hover:bg-[#083d7a] rounded-xl shadow-md transition-all duration-200"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  );
}

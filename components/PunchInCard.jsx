'use client';
import { useEffect, useState } from 'react';

export default function PunchInBanner({ user }) {
  const [showPunch, setShowPunch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    const isWorkingDay = day !== 0 && day !== 6;
    const isWithinTime = hour >= 8 && hour < 10;

    if (isWorkingDay && isWithinTime) {
      setShowPunch(true);
    }
  }, []);

  const handlePunchIn = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        body: JSON.stringify({ userId: user._id }),
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        alert('Attendance marked!');
        setShowPunch(false);
      }
    } catch (err) {
      console.error('Error marking attendance', err);
    } finally {
      setLoading(false);
    }
  };

  if (!showPunch) return null;

  return (
    <div className="bg-green-100 p-4 shadow-md text-center">
      <p className="mb-2 font-medium">Mark your attendance</p>
      <button
        onClick={handlePunchIn}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Marking...' : 'Punch In'}
      </button>
    </div>
  );
}

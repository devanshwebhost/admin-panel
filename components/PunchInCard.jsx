'use client';
import { useEffect, useState } from 'react';

export default function PunchInBanner({ user }) {
  const [showPunch, setShowPunch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAttendance = async () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const isWorkingDay = day !== 0 && day !== 6;
      const isWithinTime = hour >= 8 && hour < 11;

      if (!isWorkingDay || !isWithinTime || !user?._id) return;

      try {
        const res = await fetch(`/api/attendance?userId=${user._id}`);
        const data = await res.json();

        const today = new Date().toISOString().split('T')[0];
        const alreadyMarked = data?.attendance?.some(
          (entry) => new Date(entry.date).toISOString().split('T')[0] === today
        );

        if (!alreadyMarked) setShowPunch(true);
      } catch (err) {
        console.error('Error checking attendance:', err);
      }
    };

    checkAttendance();
  }, [user?._id]);

  const handlePunchIn = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      const result = await res.json();
      if (result.success) {
        alert('Attendance marked!');
        setShowPunch(false);
      } else {
        alert('Failed to mark attendance!');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
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

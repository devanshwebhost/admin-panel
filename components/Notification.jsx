import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationBell({ tasks }) {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const hasRecent = tasks.some(task => {
      return (new Date() - new Date(task.createdAt)) / (1000 * 60 * 60) < 24;
    });
    setHasNew(hasRecent);
  }, [tasks]);

  const togglePanel = () => {
    setOpen(!open);
    setHasNew(false); // remove red dot once opened
  };

  return (
    <>
      {/* Bell Button */}
      <div className="fixed md:top-10 top-15 right-6 z-50 cursor-pointer" onClick={togglePanel}>
        <BellIcon className="h-6 w-6 text-gray-700" />
        {hasNew && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-ping" />
        )}
        {hasNew && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
        )}
      </div>

      {/* Notification Sidebar */}
      <div className={` z-50 fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button onClick={togglePanel} className="text-sm text-gray-600">Close</button>
        </div>
        <ul className="p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-80px)]">
          {tasks.length > 0 ? (
  [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((task, index) => {
      const isNew = (new Date() - new Date(task.createdAt)) / (1000 * 60 * 60) < 24;
      return (
        <li
          key={index}
          className={`p-3 rounded-lg text-sm ${
            isNew
              ? 'bg-green-50 border border-green-300 shadow-[0_0_10px_2px_rgba(34,197,94,0.5)]'
              : 'bg-yellow-50 border border-yellow-300 shadow-[0_0_10px_2px_rgba(253,224,71,0.5)]'
          }`}
        >
          <div className="font-medium">{task.title}</div>
          <div className="text-gray-600 text-xs">
            Assigned by: {task.assignedBy?.firstName || 'Unknown'}<br />
            On: {new Date(task.createdAt).toLocaleString()}<br />
            Status: {task.status}
          </div>
        </li>
      );
    })
) : (
  <li className="text-sm text-gray-600">No new tasks yet.</li>
)}

        </ul>
      </div>
    </>
  );
}

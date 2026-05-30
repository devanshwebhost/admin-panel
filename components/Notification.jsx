'use client';

import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useSession } from "next-auth/react";
import axios from "axios";

export default function NotificationBell({ tasks = [] }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState([]);

  const userEmail = session?.user?.email;

  // 1. Fetch System Notifications (Pascel API Alerts) from DB
  useEffect(() => {
    if (!userEmail) return;
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`/api/notifications?email=${userEmail}`);
        setSystemAlerts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };
    fetchAlerts();
  }, [userEmail]);

  // 2. Combine Tasks and System Alerts into a single timeline feed
  const combinedFeed = [
    // Format Tasks
    ...tasks.map(task => {
      const createdAt = task.createdAt ?? task.created_at ?? Date.now();
      return {
        type: 'task',
        id: task._id || Math.random(),
        title: task.title,
        assignedBy: task.assignedBy?.firstName || 'Unknown',
        status: task.status,
        date: new Date(createdAt),
        isNew: (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60) < 24
      };
    }),
    // Format System Alerts
    ...systemAlerts.map(alert => ({
      type: 'alert',
      id: alert._id,
      title: alert.title,
      message: alert.message,
      date: new Date(alert.createdAt),
      isNew: !alert.isRead // Alert tab tak naya hai jab tak isRead false hai
    }))
  ].sort((a, b) => b.date - a.date); // Naye notifications sabse upar

  // 3. Check for any unread/new items to show the red dot
  useEffect(() => {
    const hasUnread = combinedFeed.some(item => item.isNew);
    setHasNew(hasUnread);
  }, [tasks, systemAlerts]);

  if (!userEmail) return null;

  // 4. Toggle Panel & Mark Alerts as Read
  const togglePanel = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    
    if (willOpen && hasNew) {
      setHasNew(false); // remove red dot
      
      // Database me alerts ko "Read" mark karo
      if (userEmail && systemAlerts.some(a => !a.isRead)) {
        try {
          await axios.patch("/api/notifications", { email: userEmail });
          // Update local state so they don't glow red next time
          setSystemAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
        } catch (err) {
          console.error("Failed to mark read:", err);
        }
      }
    }
  };

  return (
    <>
      {/* Bell Button */}
      <div className="fixed md:top-4 top-4 right-4 z-[10000] cursor-pointer" onClick={togglePanel}>
        <BellIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        {hasNew && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-ping" />
        )}
        {hasNew && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
        )}
      </div>

      {/* Notification Sidebar */}
      <div className={`z-[10000] fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h2>
          <button onClick={togglePanel} className="text-sm font-medium text-purple-600 hover:text-purple-800 transition">Close</button>
        </div>
        
        <ul className="p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-80px)] hide-scrollbar">
          {combinedFeed.length > 0 ? (
            combinedFeed.map((item) => {
              
              // 🎨 RENDERING FOR TASKS
              if (item.type === 'task') {
                return (
                  <li
                    key={item.id}
                    onClick={() => window.location.href = `/notifications?id=${item.id}`}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      item.isNew
                        ? 'bg-green-50 border border-green-300 shadow-[0_0_10px_2px_rgba(34,197,94,0.5)] dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-yellow-50 border border-yellow-300 shadow-[0_0_10px_2px_rgba(253,224,71,0.5)] dark:bg-yellow-900/20 dark:border-yellow-800'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      Assigned by: {item.assignedBy}<br />
                      On: {item.date.toLocaleString()}<br />
                      Status: <span className="capitalize font-semibold">{item.status}</span>
                    </div>
                  </li>
                );
              }

              // 🚨 RENDERING FOR SYSTEM ALERTS (Pascel Errors)
              if (item.type === 'alert') {
                return (
                  <li
                    key={item.id}
                    onClick={() => window.location.href = `/notifications?id=${item.id}`}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      item.isNew
                        ? 'bg-red-50 border border-red-300 shadow-[0_0_10px_2px_rgba(239,68,68,0.5)] dark:bg-red-900/20 dark:border-red-800'
                        : 'bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-80'
                    }`}
                  >
                    <div className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                      🚨 {item.title}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 text-xs mt-1.5 whitespace-pre-wrap">
                      {item.message}
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-[10px] mt-2 font-medium">
                      {item.date.toLocaleString()}
                    </div>
                  </li>
                );
              }
            })
          ) : (
            <li className="text-sm text-gray-500 text-center mt-10">No new notifications. You're all caught up! ✨</li>
          )}
        </ul>
        {/* 👇 NAYA BUTTON YAHAN ADD KARNA HAI 👇 */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
           <a 
             href="/notifications" 
             className="block w-full text-center py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 font-medium text-sm hover:bg-purple-50 dark:hover:bg-gray-700 transition"
           >
             View all in Full Page →
           </a>
        </div>
      </div>
    </>
  );
}
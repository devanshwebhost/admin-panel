'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react"; 
import MobileNavbar from "@/components/MobileNavbar";
import PcNavbar from "@/components/PcNavbar"; 
import Link from "next/link"; 
import { BellAlertIcon, CheckCircleIcon, ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"; 

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 💡 NAYA STATE: Kon sa notification row expanded hai uski ID track karne ke liye
  const [expandedId, setExpandedId] = useState(null);
  
  const userEmail = session?.user?.email; 

  const fetchNotifications = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`/api/notifications?email=${userEmail}`);
      // Sort: Naye alerts sabse upar
      const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 NAYA FUNCTION: Row click hone par toggle expand karna aur single notification ko read mark karna
  const handleNotificationClick = async (notif) => {
    const isCurrentlyExpanded = expandedId === notif._id;
    setExpandedId(isCurrentlyExpanded ? null : notif._id);

    // Agar message unread hai toh click karte hi background me 'Read' mark karo
    if (!notif.isRead) {
      try {
        await axios.patch("/api/notifications", { email: userEmail, notifId: notif._id });
        // Local state instantly update karo taaki unread status/bold text hat jaye
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error("Failed to mark single notification as read:", err);
      }
    }
  };

  const markAllAsRead = async () => {
    if (!userEmail) return;
    try {
      await axios.patch("/api/notifications", { email: userEmail });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userEmail) fetchNotifications();
  }, [userEmail]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#131314] text-gray-800 dark:text-gray-200">
      <div className="hidden md:block">
         <PcNavbar />
      </div>
      <div className="md:hidden">
         <MobileNavbar title="All Notifications" />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-12">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all group"
          >
            <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <BellAlertIcon className="w-8 h-8 text-purple-600" />
              Notifications Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Yahan aap system alerts, task updates, aur access notices dekh sakte ho. Har item pe click kar ke details khol sakte ho.
            </p>
          </div>
          
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification feed */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1e1e20] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20 mb-5">
               <BellAlertIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Koi nayi notification nahi mili.</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Abhi tak koi access issue ya system alert nahi aaya. Dobara check karo jab aapka task ya system update chal raha ho.</p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-xl bg-white dark:bg-[#1e1e20] divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notif) => {
              const isExpanded = expandedId === notif._id;
              
              return (
                <div 
                  key={notif._id}
                  className={`transition-all duration-150 cursor-pointer ${
                    isExpanded 
                      ? "bg-purple-50/10 dark:bg-purple-900/5" 
                      : notif.isRead 
                        ? "hover:bg-gray-50 dark:hover:bg-[#19191b]" 
                        : "bg-purple-50/20 dark:bg-purple-900/10 hover:bg-purple-50/30"
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Row Summary (Gmail Style Header Bar) */}
                  <div className="flex items-center justify-between gap-4 p-4 md:p-5 select-none">
                    <div className="flex items-center gap-3 min-w-0 flex-grow">
                      {/* Unread indicator dot */}
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 transition-opacity ${
                        notif.isRead ? "bg-transparent opacity-0" : "bg-purple-600 animate-pulse"
                      }`} />
                      
                      {/* Title & snippet block */}
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 min-w-0 flex-grow">
                        <span className={`text-[15px] md:w-52 flex-shrink-0 truncate ${
                          notif.isRead ? "text-gray-700 dark:text-gray-300 font-normal" : "text-gray-900 dark:text-white font-semibold"
                        }`}>
                          {notif.title || "Pascel Alert 🚨"}
                        </span>
                        
                        {/* Summary preview snippet (if not expanded) */}
                        {!isExpanded && (
                          <span className="text-sm text-gray-400 dark:text-gray-500 truncate max-w-xl">
                            {notif.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Icon controls */}
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500">
                      <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Body Content Box (Slides open on Click) */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-1 md:pl-14">
                      <div className="text-gray-700 dark:text-gray-300 text-[15px] whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-[#131314] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-inner font-mono overflow-x-auto">
                        {notif.message}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-medium">
                        Log Timestamp: {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
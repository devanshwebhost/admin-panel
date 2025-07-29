'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2Icon,
  XCircleIcon,
  TimerIcon,
  UserIcon,
  CalendarIcon,
  InfoIcon,
} from 'lucide-react';
import MobileNavbar from '@/components/MobileNavbar';

export default function MyTasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // 'active' or 'completed'

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks?assignedTo=${user._id}`);
        const data = await res.json();
        if (res.ok && data.tasks) {
          setTasks(data.tasks);
        }
      } catch (err) {
        console.error('❌ Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);


  

  const markAsComplete = async (taskId) => {
    // console.log(`hey id - ${taskId}`)
    try {
      await fetch(`/api/UserTask/${taskId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ status: 'completed' }),
});


      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, ...updated.task } : t))
        );
      }
    } catch (err) {
      console.error('Failed to mark task as complete', err);
    }
  };

  const isOverdue = (deadline) => new Date(deadline) < new Date();

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
const completedTasks = tasks.filter((t) => t.status === 'completed');


  return (
    <>
      <MobileNavbar title="My Tasks" />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 mb-20">
        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              tab === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setTab('active')}
          >
            📝 Active Tasks
          </button>
          <button
            className={`px-4 py-2 rounded ${
              tab === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setTab('completed')}
          >
            ✅ Completed Tasks
          </button>
        </div>

        {loading ? (
          <div className="max-w-4xl mx-auto p-4">
            <img src="../pascelloading.gif" alt="Loading" />
          </div>
        ) : tab === 'active' ? (
          activeTasks.length === 0 ? (
            <p className="text-gray-500 text-center">No active tasks assigned.</p>
          ) : (
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-lg shadow border transition ${
                    isOverdue(task.dueDate)
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    <p>ID - {task._id} Status - {task.status}</p>
                    <div className="flex items-center gap-2">
                      {isOverdue(task.dueDate) ? (
                        <span className="text-red-600 flex items-center text-sm">
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Overdue
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center text-sm">
                          <TimerIcon className="w-4 h-4 mr-1" />
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      Assigned by: {task.assignedBy?.firstName || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <button
  onClick={() => {
    const confirmed = window.confirm("Are you sure you want to mark this task as complete? This action cannot be undone.");
    if (confirmed) {
      markAsComplete(task._id);
    }
  }}
  className="mt-3 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
>
  ✔ Mark as Complete
</button>

                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {completedTasks.length === 0 ? (
              <p className="text-center text-gray-500">No tasks completed yet.</p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 rounded-lg shadow border bg-green-50 border-green-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    <span className="text-green-600 flex items-center text-sm">
                      <CheckCircle2Icon className="w-4 h-4 mr-1" />
                      Completed
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      Assigned by: {task.assignedBy?.firstName || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      Completed on:{' '}
                      {task.completedAt
                        ? new Date(task.completedAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

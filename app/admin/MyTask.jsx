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

export default function MyTasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (!user || !user._id) {
      console.warn("User not found or _id missing.");
      return;
    }

    const fetchTasks = async () => {
  try {
    const res = await fetch(`/api/tasks?assignedTo=${user._id}`);
    const data = await res.json();
    console.log('🔥 API Response:', data);

    if (res.ok && data.tasks) {
      setTasks(data.tasks);
    } else {
      console.log("⚠️ No tasks found or response not ok");
    }
  } catch (err) {
    console.error('❌ Failed to load tasks', err);
  } finally {
    setLoading(false);
  }
};


    fetchTasks();
  }, [user]);

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-[#902ba9] mb-6 flex items-center gap-2">
        <InfoIcon className="w-5 h-5" />
        My Assigned Tasks
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500 text-center">No tasks assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 rounded-lg shadow border transition ${
                task.status === 'complete'
                  ? 'bg-green-50 border-green-300'
                  : isOverdue(task.dueDate)
                  ? 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                <div className="flex items-center gap-2">
                  {task.status === 'complete' ? (
                    <span className="text-green-600 flex items-center text-sm">
                      <CheckCircle2Icon className="w-4 h-4 mr-1" />
                      Completed
                    </span>
                  ) : isOverdue(task.dueDate) ? (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

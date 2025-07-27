"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2Icon,
  XCircleIcon,
  TimerIcon,
  UserIcon,
  CalendarIcon,
  InfoIcon,
} from "lucide-react";

// Dummy tasks for UI example — Replace with real data from API later
const dummyTasks = [
  {
    id: 1,
    title: "Edit Instagram Reels",
    summary: "Edit and finalize reels for client XYZ’s new campaign.",
    assignedBy: "Anshu@indocs.in",
    status: "incomplete",
    deadline: "2025-08-28",
  },
  {
    id: 2,
    title: "Update Portfolio Website",
    summary: "Add latest projects and update team section.",
    assignedBy: "devansh@indocs.in",
    status: "incomplete",
    deadline: "2025-07-30",
  },
  {
    id: 3,
    title: "Design Logo",
    summary: "Create 3 logo variations for a new crypto client.",
    assignedBy: "mithilesh@indocs.in",
    status: "complete",
    deadline: "2025-07-20",
  },
];

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Replace this with real API fetch call
    setTasks(dummyTasks);
  }, []);

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date() && deadline !== "complete";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-[#902ba9] mb-6 flex items-center gap-2">
        <InfoIcon className="w-5 h-5" />
        My Assigned Tasks
      </h2>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center">No tasks assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg shadow border transition ${
                task.status === "complete"
                  ? "bg-green-50 border-green-300"
                  : isOverdue(task.deadline)
                  ? "bg-red-50 border-red-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2">
                  {task.status === "complete" ? (
                    <span className="text-green-600 flex items-center text-sm">
                      <CheckCircle2Icon className="w-4 h-4 mr-1" />
                      Completed
                    </span>
                  ) : isOverdue(task.deadline) ? (
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

              <p className="text-sm text-gray-700 mb-2">{task.summary}</p>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  Assigned by: {task.assignedBy}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileNavbar from "@/components/MobileNavbar";
import PcNavbar from "@/components/PcNavbar";
import { toast } from "react-toastify";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';


export default function Assign({ user }) {
  // const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const isCompleted = (task) => task.status === "completed";

  // Employees load karo
const {
  data: employees = [],
  isLoading: employeesLoading,
  error: employeesError,
} = useQuery({
  queryKey: ["employees"],
  queryFn: async () => {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("Failed to fetch employees");

    const users = await res.json();
    console.log("Fetched Users:", users); // Debug here

    // Filter out admins (use correct condition)
    const nonAdminUsers = users.filter(user => user.isAdmin !== true && user.isAdmin !== "true");

    return nonAdminUsers;
  },
});



  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ["tasks", user?._id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?userId=${user._id}`);
      const json = await res.json();
      return json.tasks;
    },
    enabled: !!user?._id, // only fetch if user is available
  });
  const [filter, setFilter] = useState("new"); // default filter
  const now = new Date();

  const filteredTasks = tasks.filter((task) => {
  if (!task.dueDate) return true; // safety check
  const dueDate = new Date(task.dueDate);
  const now = new Date();

  if (filter === "deadlineCrossed") {
    return dueDate < now && task.status !== "completed";
  }

  if (filter === "nearDeadline") {
    const diffInDays = (dueDate - now) / (1000 * 60 * 60 * 24);
    return diffInDays >= 0 && diffInDays <= 3 && task.status !== "completed";
  }

  if (filter === "complete") {
    return task.status === "completed";
  }

  return true; // for 'new', 'old', or default
});


  // Sort filtered tasks:
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (filter === "new") {
      return new Date(b.createdAt) - new Date(a.createdAt); // newest first
    }
    if (filter === "old") {
      return new Date(a.createdAt) - new Date(b.createdAt); // oldest first
    }
    if (filter === "deadlineCrossed" || filter === "nearDeadline") {
      return new Date(a.dueDate) - new Date(b.dueDate); // earliest deadline first
    }
    if (filter === "complete") {
      return new Date(b.updatedAt) - new Date(a.updatedAt); // most recently completed first
    }
    return 0;
  });

  const assignTaskMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user._id] }); // ⤴️ Refresh task list
      setSuccessMessage("✅ Task assigned successfully!");
      setTaskTitle("");
      setDescription("");
      setDeadline("");
      setSelectedEmployee("");
    },
    onError: (error) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  const handleAssignTask = (e) => {
     // ✅ Prevent double click during load
  e.preventDefault();
  if (submitting || assignTaskMutation.isLoading) return;


 if (!selectedEmployee || !taskTitle || !deadline) {
    toast.warn("Please fill in all required fields.");
    return;
  }

  if (!user || !user._id) {
    toast.warn("Admin ID (assignedBy) not found!");
    return;
  }

  setSubmitting(true);

  const payload = {
    title: taskTitle,
    description,
    deadline,
    assignedTo: selectedEmployee,
    assignedBy: user._id,
  };

  assignTaskMutation.mutate(payload, {
    onSettled: () => setSubmitting(false),
  });
};


  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/taskUpdate/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("🗑️ Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks", user._id] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("❌ Failed to delete");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await fetch(`/api/taskUpdate/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update task");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("✅ Task updated");
      queryClient.invalidateQueries({ queryKey: ["tasks", user._id] });
      setEditTaskId(null); // Close edit form
    },
    onError: (error) => {
      toast.error(`❌ ${error.message}`);
    },
  });

  return (
    <>
      <MobileNavbar title="Assign Tasks" />
      <PcNavbar title="Assign Tasks" />
      <div className="bg-white min-h-screen p-6 rounded-xl shadow-md mt-[50px]">
        <p className="text-gray-600 text-sm mb-2">
          Total Employees: <strong>{employees.length}</strong>
        </p>

        <form onSubmit={handleAssignTask} className="max-w-xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee<span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">-- Select an Employee --</option>
{employees
  .filter(emp => emp.isAdmin !== true && emp.isAdmin !== "true") // or emp.role !== 'admin'
  .map(emp => (
    <option key={emp._id} value={emp._id}>
      {emp.firstName} {emp.lastName}
    </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
              placeholder="Add a Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full border p-2 rounded"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border p-2 rounded"
              required
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // 👈 tomorrow only
            />
          </div>

<button
  type="submit"
  disabled={assignTaskMutation.isLoading || submitting}
  className={`bg-[#902ba9] text-white py-2 px-4 rounded hover:bg-purple-700 transition ${
    assignTaskMutation.isLoading || submitting ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  {assignTaskMutation.isLoading || submitting ? "Assigning..." : "Assign Task"}
</button>


          {successMessage && (
            <p className="text-green-600 font-medium mt-2">{successMessage}</p>
          )}
        </form>

        {/* section of see the assigned tasks  */}

        <div className=" p-6 mt-8 md:mb-0 mb-10">
          <h2 className="text-xl font-bold mb-4 text-[#902ba9]">
            📋 All Assigned Tasks
          </h2>
          <div className="mb-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setFilter("new")}
              className={`px-3 py-1 rounded text-sm sm:text-base ${
                filter === "new" ? "bg-[#902ba9] text-white" : "bg-gray-200"
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setFilter("old")}
              className={`px-3 py-1 rounded text-sm sm:text-base ${
                filter === "old" ? "bg-[#902ba9] text-white" : "bg-gray-200"
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => setFilter("deadlineCrossed")}
              className={`px-3 py-1 rounded text-sm sm:text-base ${
                filter === "deadlineCrossed"
                  ? "bg-[#902ba9] text-white"
                  : "bg-gray-200"
              }`}
            >
              Deadline Crossed
            </button>
            <button
              onClick={() => setFilter("nearDeadline")}
              className={`px-3 py-1 rounded text-sm sm:text-base ${
                filter === "nearDeadline"
                  ? "bg-[#902ba9] text-white"
                  : "bg-gray-200"
              }`}
            >
              Near Deadline
            </button>
            <button
              onClick={() => setFilter("complete")}
              className={`px-3 py-1 rounded text-sm sm:text-base ${
                filter === "complete"
                  ? "bg-[#902ba9] text-white"
                  : "bg-gray-200"
              }`}
            >
              Completed Tasks
            </button>
          </div>

          {sortedTasks.length === 0 ? (
            <p className="text-gray-600 text-sm">
              You haven't assigned any tasks yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {sortedTasks.map((task) => {
                const completed = isCompleted(task);
                return (
                  <li
                    key={task._id}
                    className={`border p-4 rounded-md shadow-sm ${
                      completed ? "bg-green-50 border-green-300" : ""
                    }`}
                  >
                    <h3 className="font-semibold text-lg text-[#902ba9]">
                      {task.title}
                    </h3>
                    <p className="text-sm italic text-gray-600">
                      Status: {task.status}
                    </p>
                    <p className="text-gray-700 text-sm">{task.description}</p>
                    <p className="text-gray-600 text-sm">
                      Assigned to:{" "}
                      <strong>
                        {task.assignedTo?.[0]?.firstName}{" "}
                        {task.assignedTo?.[0]?.lastName}
                      </strong>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Assigned By:{" "}
                      <strong>
                        {task.assignedBy?.firstName} {task.assignedBy?.lastName}
                      </strong>
                    </p>
                    <p className="text-gray-500 text-xs">
                      Deadline: {new Date(task.dueDate).toLocaleDateString()}
                    </p>

                    {/* ✅ Only show these for non-completed tasks */}
                      
                      
                    {!completed && (
                      <>
                      {(task.assignedBy?._id === user._id || user.isAdmin) && (
                        <>
                        <button
                          onClick={() => {
                            setEditTaskId(task._id);
                            setEditTitle(task.title);
                            setEditDescription(task.description);
                            setEditDeadline(task.dueDate.slice(0, 10)); // format yyyy-mm-dd
                          }}
                          className="text-sm text-[#902ba9] hover:underline mr-3"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this task?"
                              )
                            ) {
                              deleteTaskMutation.mutate(task._id);
                            }
                          }}
                          disabled={deleteTaskMutation.isLoading}
                          className="text-sm text-red-600 hover:underline disabled:opacity-50"
                        >
                          🗑️ Delete
                        </button></>
                        )}
                      </>
                    )}
                    
                  

                    {/* ✅ Edit form (only show if not completed) */}
                    {editTaskId === task._id && !completed && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateTaskMutation.mutate({
                            id: task._id,
                            updates: {
                              title: editTitle,
                              description: editDescription,
                              deadline: editDeadline,
                            },
                          });
                        }}
                        className="mt-4 space-y-2"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border px-2 py-1 rounded"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full border px-2 py-1 rounded"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={updateTaskMutation.isLoading}
                            className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                          >
                            {updateTaskMutation.isLoading
                              ? "Saving..."
                              : "💾 Save"}
                          </button>
                          <button
                            onClick={() => setEditTaskId(null)}
                            className="text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

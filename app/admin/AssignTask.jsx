'use client';

import { useEffect, useState } from 'react';

export default function Assign({ user }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
const [editTitle, setEditTitle] = useState('');
const [editDescription, setEditDescription] = useState('');
const [editDeadline, setEditDeadline] = useState('');


  // Employees load karo
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error('Failed to load users', err));
  }, []);

   useEffect(() => {
    if (!user?._id) return;

    fetch(`/api/tasks?userId=${user._id}`)
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasks(data.tasks);
      })
      .catch(err => console.error("Failed to fetch tasks", err));
  }, [user]);

const handleAssignTask = async (e) => {
  e.preventDefault();

  if (!selectedEmployee || !taskTitle || !deadline) {
    alert('Please fill in all required fields.');
    return;
  }

  if (!user || !user._id) {
    alert("Admin ID (assignedBy) not found!");
    return;
  }
  console.log("Logged in admin ID:", user?._id);


  const payload = {
    title: taskTitle,
    description,
    deadline,
    assignedTo: selectedEmployee,
    assignedBy: user._id,  // ✅ get from prop
  };

  console.log('--- Payload being sent ---', payload);

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      setSuccessMessage('✅ Task assigned successfully!');
      setTaskTitle('');
      setDescription('');
      setDeadline('');
      setSelectedEmployee('');
    } else {
      alert(`❌ ${result.error || 'Something went wrong.'}`);
    }
  } catch (err) {
    console.error('Task assignment error:', err);
    alert('❌ Task assignment failed!');
  }
};



  return (
    <div className="bg-white min-h-screen p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-[#902ba9] mb-6 text-center">📝 Assign Task</h1>

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
            {employees.map(emp => (
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Assign Task
        </button>

        {successMessage && (
          <p className="text-green-600 font-medium mt-2">{successMessage}</p>
        )}
      </form>
      <div className="bg-white shadow rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 text-indigo-700">📋 Tasks You Assigned</h2>

      {tasks.length === 0 ? (
        <p className="text-gray-600 text-sm">You haven't assigned any tasks yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(task => (
            <li key={task._id} className="border p-4 rounded-md shadow-sm">
              <h3 className="font-semibold text-lg text-indigo-600">{task.title}</h3>
              <p className="text-gray-700 text-sm">{task.description}</p>
              <p className="text-gray-600 text-sm">
                Assigned to: <strong>{task.assignedTo?.[0]?.firstName} {task.assignedTo?.[0]?.lastName}</strong>
              </p>
              <p className="text-gray-500 text-xs">Deadline: {new Date(task.dueDate).toLocaleDateString()}</p>
              <button
  onClick={() => {
    setEditTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditDeadline(task.dueDate.slice(0, 10)); // format yyyy-mm-dd
  }}
  className="text-sm text-blue-600 hover:underline mr-3"
>
  ✏️ Edit
</button>
<button
  onClick={async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('🗑️ Task deleted');
        // Optionally reload tasks
      } else {
        alert('❌ Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Server error');
    }
  }}
  className="text-sm text-red-600 hover:underline"
>
  🗑️ Delete
</button>

{editTaskId === task._id && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`/api/taskUpdate/${task._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            deadline: editDeadline,
          }),
        });

        const result = await res.json();
        if (res.ok) {
          alert('✅ Task updated');
          setEditTaskId(null);
          // Optionally reload tasks
        } else {
          alert('❌ ' + result.error);
        }
      } catch (err) {
        alert('❌ Update failed');
        console.error(err);
      }
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
    <input
      type="date"
      value={editDeadline}
      onChange={(e) => setEditDeadline(e.target.value)}
      className="w-full border px-2 py-1 rounded"
    />
    <div className="flex gap-2">
      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">💾 Save</button>
      <button onClick={() => setEditTaskId(null)} className="text-gray-600">Cancel</button>
    </div>
  </form>
)}



            </li>
            
          ))}
          
        </ul>
      )}
    </div>
    </div>
  );
}

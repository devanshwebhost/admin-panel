'use client';

import { useState } from 'react';

export default function Assign() {
  const [employees] = useState([
    { id: 1, name: 'Aman Sharma' },
    { id: 2, name: 'Ravi Kumar' },
    { id: 3, name: 'Sneha Verma' },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!selectedEmployee || !taskTitle || !deadline) {
      alert('Please fill in all required fields.');
      return;
    }

    // Here you would make an API call to assign the task
    console.log('Assigned Task:', {
      to: selectedEmployee,
      title: taskTitle,
      description,
      deadline,
    });

    setSuccessMessage(`Task "${taskTitle}" assigned to ${selectedEmployee}!`);
    setTaskTitle('');
    setDescription('');
    setDeadline('');
    setSelectedEmployee('');
  };

  return (
    <div className="bg-white min-h-screen p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-[#902ba9] mb-6 text-center">📝 Assign Task</h1>

      <form onSubmit={handleAssignTask} className="max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee<span className="text-red-500">*</span></label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Select an Employee --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.name}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Title<span className="text-red-500">*</span></label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline<span className="text-red-500">*</span></label>
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
    </div>
  );
}

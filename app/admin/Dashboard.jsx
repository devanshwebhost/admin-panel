"use client";

import { useEffect, useState } from "react";

export default function Dashboard({user}) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem("todos")) || [];
    setTodos(storedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { text: newTodo, completed: false }]);
    setNewTodo("");
  };

  const toggleComplete = (index) => {
    const updated = [...todos];
    updated[index].completed = !updated[index].completed;
    setTodos(updated);
  };

  const deleteTodo = (index) => {
    const updated = todos.filter((_, i) => i !== index);
    setTodos(updated);
  };

  const editTodo = (index) => {
    setEditIndex(index);
    setNewTodo(todos[index].text);
  };

  const updateTodo = () => {
    if (!newTodo.trim()) return;
    const updated = [...todos];
    updated[editIndex].text = newTodo;
    setTodos(updated);
    setEditIndex(null);
    setNewTodo("");
  };

  return (
    <div className="p-4 space-y-6 md:mt-0 mt-10">
      <h1 className="md:text-2xl font-bold mb-4 text-[18px] md:text-left text-center text-[#902ba9]">{user.firstName} 🤓 Welcome To Your Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Running Projects</h2>
          <p>3 ongoing projects</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Completed Projects</h2>
          <p>12 completed</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Upcoming Projects</h2>
          <p>2 upcoming</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Team</h2>
          <p>You are in Team Alpha</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">My Attendance</h2>
          <p>Present: 20 days | Absent: 2 days</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">My Holidays</h2>
          <p>Next Holiday: 15th August</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Pending Tasks</h2>
          <ul className="list-disc ml-4">
            <li>Finish onboarding presentation</li>
            <li>Review team progress reports</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold text-lg mb-2">Notifications</h2>
        <ul className="list-disc ml-4 text-sm text-gray-700">
          <li>New task assigned: "Social Media Audit"</li>
          <li>Project "Vision X" moved to Completed</li>
        </ul>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold text-lg mb-4">My Todos</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-grow border rounded px-3 py-1"
            placeholder="Add a todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          {editIndex !== null ? (
            <button
              onClick={updateTodo}
              className="bg-yellow-500 text-white px-4 py-1 rounded"
            >
              Update
            </button>
          ) : (
            <button
              onClick={addTodo}
              className="bg-[#902ba9] text-white px-4 py-1 rounded"
            >
              Add
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li
              key={index}
              className="flex justify-between md:flex-row flex-col items-center border-b py-2"
            >
              <span
                className={`flex-grow ${
                  todo.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.text}
              </span>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleComplete(index)}
                  className="text-green-600 text-sm"
                >
                  {todo.completed ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => editTodo(index)}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(index)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

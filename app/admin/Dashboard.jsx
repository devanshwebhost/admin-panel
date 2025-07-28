"use client";

import { useEffect, useState } from "react";

export default function Dashboard({ user }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'new' | 'old' | 'complete'


  useEffect(() => {
  const fetchTodos = async () => {
    const res = await fetch(`/api/userTodos?userId=${user._id}`);
    const data = await res.json();
    setTodos(data.myTodos);
  };

  if (user?._id) fetchTodos();
}, [user]);


  useEffect(() => {
    const fetchTasks = async () => {
      if (!user || !user._id) return;

      try {
        const res = await fetch(`/api/tasks?assignedTo=${user._id}`);
        const data = await res.json();
        if (res.ok) {
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, [user]);

 const addTodo = async () => {
  if (!newTodo.trim()) return;
  const res = await fetch('/api/userTodos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id, text: newTodo }),
  });

  const data = await res.json();
  setTodos(data.myTodos);
  setNewTodo('');
};

const editTodo = (index) => {
  setEditIndex(index);
  setNewTodo(todos[index].text);
};

const updateTodo = async () => {
  if (!newTodo.trim()) return;
  const updatedTodo = todos[editIndex];

  const res = await fetch('/api/userTodos', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user._id,
      todoId: updatedTodo._id,
      text: newTodo,
      completed: updatedTodo.completed,
    }),
  });

  const data = await res.json();
  setTodos(data.todos);
  setEditIndex(null);
  setNewTodo('');
};

const toggleComplete = async (index) => {
  const updatedTodo = { ...todos[index], completed: !todos[index].completed };

  const res = await fetch('/api/userTodos', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user._id,
      todoId: updatedTodo._id,
      text: updatedTodo.text,
      completed: updatedTodo.completed,
    }),
  });

  const data = await res.json();
  setTodos(data.todos);
};

const deleteTodo = async (index) => {
  const todoId = todos[index]._id;

  const res = await fetch('/api/userTodos', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id, todoId }),
  });

  const data = await res.json();
  setTodos(data.todos);
};

const filteredTodos = () => {
  let filtered = [...todos];

  if (filter === 'complete') {
    filtered = filtered.filter(todo => todo.completed);
  }

  if (filter === 'new') {
    filtered = filtered.sort((a, b) => new Date(b._id) - new Date(a._id)); // Assuming ObjectId timestamps
  }

  if (filter === 'old') {
    filtered = filtered.sort((a, b) => new Date(a._id) - new Date(b._id));
  }

  return filtered;
};


  return (
    <div className="p-4 space-y-6 md:mt-0 mt-10">
      <h1 className="md:text-2xl font-bold mb-4 text-[18px] md:text-left text-center text-[#902ba9]">
        {user.firstName} 🤓 Welcome To Your Dashboard
      </h1>

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
          <p>{user?.teamName || "No team assigned"}</p>
          <p>T-ID - {user?._team || "No team assigned"}</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">My Attendance</h2>
          <p>
            Present: {user?.attendance?.present || "{No Info yet}"} days |
            Absent: {user?.attendance?.absent || "{No Info yet}"} days
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">My Holidays</h2>
          <p>Next Holiday: 15th August</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Pending Tasks</h2>
          <ul className="list-disc ml-4">
  {tasks.filter(task => task.status !== "complete").length > 0 ? (
    tasks
      .filter(task => task.status !== "complete")
      .map(task => (
        <li key={task._id}>{task.title}</li>
      ))
  ) : (
    <li className="list-none text-gray-500 italic">No pending tasks!</li>
  )}
</ul>

        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold text-lg mb-2">Notifications</h2>
        <ul className="list-disc ml-4 text-sm text-gray-700">
  {tasks.length > 0 ? (
    (() => {
      const latestTask = [...tasks].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      return (
        <li>
          New task assigned:{" "}
          <span className="font-medium">{latestTask.title}</span> <br />
          <span className="text-gray-600">
            By: {latestTask.assignedBy?.firstName || 'Unknown'} |{" "}
            On: {new Date(latestTask.createdAt).toLocaleDateString()}
          </span>
        </li>
      );
    })()
  ) : (
    <li>No new tasks yet.</li>
  )}
</ul>

      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold text-lg mb-4">My Todos</h2>
        <div className="flex gap-2 mb-4">
  <button
    onClick={() => setFilter('all')}
    className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-[#902ba9] text-white' : 'bg-gray-200'}`}
  >
    All
  </button>
  <button
    onClick={() => setFilter('new')}
    className={`px-3 py-1 rounded ${filter === 'new' ? 'bg-[#902ba9] text-white' : 'bg-gray-200'}`}
  >
    New
  </button>
  <button
    onClick={() => setFilter('old')}
    className={`px-3 py-1 rounded ${filter === 'old' ? 'bg-[#902ba9] text-white' : 'bg-gray-200'}`}
  >
    Old
  </button>
  <button
    onClick={() => setFilter('complete')}
    className={`px-3 py-1 rounded ${filter === 'complete' ? 'bg-[#902ba9] text-white' : 'bg-gray-200'}`}
  >
    Complete
  </button>
</div>

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
  {filteredTodos().length === 0 ? (
    <li className="text-gray-500 italic">No todos match your criteria.</li>
  ) : (
    filteredTodos().map((todo, index) => {
      // Extract creation time from MongoDB ObjectId (_id)
      const timestamp = parseInt(todo._id.toString().substring(0, 8), 16) * 1000;
      const createdDate = new Date(timestamp).toLocaleDateString();

      return (
        <li
          key={todo._id}
          className="flex justify-between md:flex-row flex-col items-center border-b py-2"
        >
          <div className={`flex-grow ${todo.completed ? "line-through text-gray-500" : ""}`}>
            {todo.text}
            <div className="text-xs text-gray-400 mt-1">Created: {createdDate}</div>
          </div>
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
      );
    })
  )}
</ul>

      </div>
    </div>
  );
}

"use client";

import MobileNavbar from "@/components/MobileNavbar";
import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import PunchInBanner from "@/components/PunchInCard";
import NotificationBell from "@/components/Notification";
import PcNavbar from "@/components/PcNavbar";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";


// const projectStatusData = [
//   { name: "Running", value: runningCount },
//   { name: "Completed", value: completedCount },
//   { name: "Upcoming", value: upcomingCount },
// ];



const staticHolidays = [
  { name: "Independence Day", date: new Date("2025-08-15") },
  { name: "Janmashtami", date: new Date("2025-08-16") },
  { name: "MahaUtsav Radh Aastmi", date: new Date("2025-08-31") },
  { name: "Mahatma Gandhi's Birthday", date: new Date("2025-10-02") },
  { name: "Dussehra", date: new Date("2025-10-02") },
  { name: "Diwali", date: new Date("2025-10-20") },
  { name: "Guru Nanak's Birthday", date: new Date("2025-11-05") },
  { name: "Christmas Day", date: new Date("2025-12-25") },
];





export default function Dashboard({ user }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'new' | 'old' | 'complete'
  const [projectFilter, setProjectFilter] = useState("current"); // current | lastWeek | lastMonth | lastYear | custom
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

  // const queryClient = useQueryClient();
  // const [projects, setProjects] = useState([]);

  const filterProjects = () => {
  let now = new Date();
  let start;

  if (projectFilter === "lastWeek") {
    start = new Date(now.setDate(now.getDate() - 7));
  } else if (projectFilter === "lastMonth") {
    start = new Date(now.setMonth(now.getMonth() - 1));
  } else if (projectFilter === "lastYear") {
    start = new Date(now.setFullYear(now.getFullYear() - 1));
  } else if (projectFilter === "custom") {
    start = new Date(startDate);
    now = new Date(endDate);
  } else {
    // current month default
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return projects.filter((p) => {
    const projectDate = new Date(p.date); // ensure your API returns project.date
    return projectDate >= start && projectDate <= now;
  });
};


useEffect(() => {
  const getProjects = async () => {
    const data = await fetchProjects();
    setProjects(data);
  };
  getProjects();
}, []);

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

const editTodo = (todoId) => {
  const index = todos.findIndex(t => t._id === todoId);
  if (index === -1) return;
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

const toggleComplete = async (todoId) => {
  const index = todos.findIndex(t => t._id === todoId);
  if (index === -1) return;
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

const deleteTodo = async (todoId) => {
  const res = await fetch('/api/userTodos', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id, todoId }),
  });

  const data = await res.json();
  setTodos(data.todos);
};

const filteredTodos = () => {
  let todosWithDate = todos.map(todo => {
    const timestamp = parseInt(todo._id.toString().substring(0, 8), 16) * 1000;
    return {
      ...todo,
      createdAt: new Date(timestamp),
    };
  });

  switch (filter) {
    case 'new':
      return [...todosWithDate].sort((a, b) => b.createdAt - a.createdAt);
    case 'old':
      return [...todosWithDate].sort((a, b) => a.createdAt - b.createdAt);
    case 'complete':
      return todosWithDate.filter(todo => todo.completed);
    case 'incomplete':
      return todosWithDate.filter(todo => !todo.completed);
    case 'all':
    default:
      return todosWithDate;
  }
};

const fetchProjects = async () => {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
};

const { data: projects = [], isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
});

// some backends use "status" instead of "type"
const getStatus = (p) => (p?.type || p?.status || '').toLowerCase();

const runningCount   = projects.filter(p => getStatus(p) === 'running').length;
const completedCount = projects.filter(p => getStatus(p) === 'completed').length;
const upcomingCount  = projects.filter(p => getStatus(p) === 'upcoming').length;

const projectStatusData = [
  { name: 'Running',   value: runningCount },
  { name: 'Completed', value: completedCount },
  { name: 'Upcoming',  value: upcomingCount },
];

const COLORS = ["#8b5cf6", "#22c55e", "#eab308"];
// Count present and absent days
const presentDays = user?.attendance?.filter((a) => a.status === 'present').length || 0;
const absentDays = user?.attendance?.filter((a) => a.status === 'absent').length || 0;
 // kya yeh array hai?
// console.log(user?.attendance)


  const [nextHoliday, setNextHoliday] = useState(null);

 useEffect(() => {
    // This function finds the next holiday
    const getNextHolidayFromList = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      return staticHolidays.find(holiday => new Date(holiday.date) >= today);
    };

    setNextHoliday(getNextHolidayFromList());
  }, []); 

  return (
    <>
    <MobileNavbar title="Dashboard" />
    <PcNavbar title="Dashboard" />
    <div className="p-4 space-y-6  md:mb-0 mb-10 mt-[50px]">
      <h1 className="md:text-2xl font-bold mb-4 text-[25px] md:text-left  text-[#902ba9]">
        Hello👋 {user.firstName}
      </h1>

    <PunchInBanner user={user}/>
    <NotificationBell tasks={tasks}/>
{/* 
<div className="flex gap-2 mb-4">
  <select
    value={projectFilter}
    onChange={(e) => setProjectFilter(e.target.value)}
    className="border px-3 py-2 rounded"
  >
    <option value="current">Current</option>
    <option value="lastWeek">Last Week</option>
    <option value="lastMonth">Last Month</option>
    <option value="lastYear">Last Year</option>
    <option value="custom">Custom</option>
  </select>

  {projectFilter === "custom" && (
    <>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-2 py-1 rounded" />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-2 py-1 rounded" />
    </>
  )}
</div> */}


{/* Running Projects Graph */}
{/* // ... (existing code) */}


<div className="bg-white rounded shadow p-4">
  <h2 className="font-semibold text-lg mb-2 text-[#902ba9]">Projects Status</h2>
  <div className="h-48">
    {isLoading ? (
      <p className="text-center text-gray-400">Loading…</p>
    ) : projectStatusData.every(data => data.value === 0) ? (
      <div className="flex items-center justify-center w-full h-full text-gray-500 italic">
        No project data available.
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={projectStatusData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" barSize={20}>
            {projectStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
</div>

{/* ... other JSX ... */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Team</h2>
          <p>{user?.teamName || "No team assigned"}</p>
          <p className="font-mono ">T-ID - {user?._team || "No team assigned"}</p>
        </div>

        <div className="bg-white rounded shadow p-4">
  <h2 className="font-semibold text-lg mb-2">My Attendance</h2>
  <p>
    Present: {presentDays} day{presentDays !== 1 ? 's' : ''} | 
    Absent: {absentDays} day{absentDays !== 1 ? 's' : ''}
  </p>
</div>

    <div className="bg-white rounded shadow p-4">
  <h2 className="font-semibold text-lg mb-2">Upcoming Holiday</h2>
  <p>
    {nextHoliday ? 
      <>
        Next Holiday: {nextHoliday.name} on{" "}
        <span className="font-bold text-purple-700">
          {new Date(nextHoliday.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </>
      : "No upcoming holidays this year."
    }
  </p>
</div>

        <div className="bg-white rounded shadow p-4">
  <h2 className="font-semibold text-lg mb-2">Pending Tasks</h2>
  <ul className="list-disc ml-4">
    {tasks.filter(task => task.status !== "completed").length > 0 ? (
      [...tasks]
        .filter(task => task.status !== "completed")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // latest first
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
        <h2 className="font-semibold text-lg mb-4">My Todos</h2>
<div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
  {['all', 'new', 'old', 'complete', 'incomplete'].map(type => (
    <button
      key={type}
      onClick={() => setFilter(type)}
      className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded whitespace-nowrap transition-all duration-200 ${
        filter === type ? 'bg-[#902ba9] text-white' : 'bg-gray-200 text-gray-800'
      }`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </button>
  ))}
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
      disabled={!newTodo.trim()}
      className={`px-4 py-1 rounded text-white transition
        ${!newTodo.trim() 
          ? "bg-purple-300 cursor-not-allowed" 
          : "bg-[#902ba9] hover:bg-[#7c1d91]"}`}
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
              onClick={() => toggleComplete(todo._id)}
              className="text-green-600 text-sm"
              >
              {todo.completed ? "Undo" : "Complete"}
            </button>
            <button
              onClick={() => editTodo(todo._id)}
              className="text-blue-600 text-sm"
              >
              Edit
            </button>
            <button
              onClick={() => deleteTodo(todo._id)}
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
  </>
  );
}

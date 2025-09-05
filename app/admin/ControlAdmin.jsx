'use client';
import MobileNavbar from '@/components/MobileNavbar';
import { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PcNavbar from '@/components/PcNavbar';
import { toast } from "react-toastify";


export default function AdminControlPanel({user}) {
  const [users, setUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false); // loader state
  const [projects, setProjects] = useState({
    running: [],
    upcoming: [],
    completed: [],
  });
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setNewProject({ startDate: today });
  }, []);

  const [newProject, setNewProject] = useState({
  title: '',
  startDate: '',
  description: '',
  amount: '',
  timeline: '',
  clientName: '',
  clientOrigin: '',
  type: '',
  createdBy: '',
});

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    GetData();
  }, 1000); // fetch every 1 second

  return () => clearInterval(interval); // cleanup on unmount
}, []);


  async function fetchData() {
  try {
    const [userRes, projectRes, teamRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/projects'),
      fetch('/api/teams'),
    ]);

    const usersData = await userRes.json();
    const projectData = await projectRes.json();
    const teamData = await teamRes.json();

    const categorized = {
      running: [],
      upcoming: [],
      completed: [],
    };

    projectData.forEach((p) => {
      const status = p.status?.toLowerCase();
      if (status === 'running') categorized.running.push(p);
      else if (status === 'upcoming') categorized.upcoming.push(p);
      else if (status === 'completed') categorized.completed.push(p);
    });

    setUsers(usersData);
    setProjects(categorized); // ✅ Now this works correctly
    setTeams(teamData.teams);
  } catch (err) {
    console.error('Admin fetch error:', err);
  }
}

const addProjectMutation = useMutation({
  mutationFn: async (newProjectData) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProjectData),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },
  onSuccess: (createdProject) => {
    toast.success('Project created successfully');
    setIsAdding(false)
    queryClient.invalidateQueries(['projects']); // Refresh project list
    setNewProject({
      title: '',
      startDate: '',
      description: '',
      amount: '',
      timeline: '',
      clientName: '',
      clientOrigin: '',
      type: '',
      createdBy: user?._id,
    });
  },
  onError: (error) => {
    console.error('Create error:', error);
    toast.error('Could not create project. Try again.');
  }
});

// Trigger function on form submit
const handleAddProject = () => {
  if (!newProject.title || !newProject.type) {
    return toast.warn("Title and type are required");
  }

  addProjectMutation.mutate({ ...newProject, createdBy: user?._id });
};




  const handleVerifyEmail = async (userId) => {
    await fetch(`/api/users/${userId}/verify`, { method: 'PATCH' });
    fetchData();
  };

  const handleToggleLogin = async (userId, allowLogin) => {
    await fetch(`/api/users/${userId}/toggle-login`, {
      method: 'PATCH',
      body: JSON.stringify({ allowLogin }),
    });
    fetchData();
  };

  const handleDeleteUser = async (userId) => {
    const confirm = window.confirm('Are you sure you want to delete this user?');
    if (!confirm) return;

    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    fetchData();
  };
  // console.log("Created By:", user._id);

  const GetData = async () => {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();

    // Assuming your component is grouping projects by type
    const grouped = data.reduce((acc, project) => {
      acc[project.type] = acc[project.type] || [];
      acc[project.type].push(project);
      return acc;
    }, {});

    setProjects(grouped);
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

const handleDelete = (projectId) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this project?');
  if (!confirmDelete) return;

  mutation.mutate(projectId);
};

// hendel project delete 
const deleteProject = async (projectId) => {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete project');
  }

  return res.json();
};

const mutation = useMutation({
  mutationFn: deleteProject,
  onSuccess: () => {
    toast.success('Project deleted successfully');
    queryClient.invalidateQueries(['projects']); // 👈 Refetch the project list
  },
  onError: (err) => {
    console.error('Error deleting project:', err);
    toast.error('Something went wrong while deleting the project');
  },
});

// const isFormValid = Object.values(newProject).every(value => value?.toString().trim() !== "");
const isFormComplete = Object.values(newProject).every(val => val !== '' && val !== null);

  return (
    
    <>
    <MobileNavbar title='Admin Control'/>
    <PcNavbar title="Admin Control" />
    <div className="p-4 space-y-6 mb-12 mt-[50px]">
      {/* <h1 className="text-2xl font-bold text-[#0c52a2]">Admin Control Panel</h1> */}

      {/* Add New Project */}
<section className="my-4">
  <h2 className="text-xl font-semibold mb-2">Add New Project</h2>
  <div className="grid md:grid-cols-3 gap-4">
    <input type="text" placeholder="Project Title" className="border p-2 rounded" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
    <input type="date" className="border p-2 rounded" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} />
    <input type="text" placeholder="Description" className="border p-2 rounded" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
    <input type="number" placeholder="Amount" className="border p-2 rounded" value={newProject.amount} onChange={(e) => setNewProject({ ...newProject, amount: e.target.value })} />
    <input type="text" placeholder="Timeline" className="border p-2 rounded" value={newProject.timeline} onChange={(e) => setNewProject({ ...newProject, timeline: e.target.value })} />
    <input type="text" placeholder="Client Name" className="border p-2 rounded" value={newProject.clientName} onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })} />
    <input type="text" placeholder="Client Origin" className="border p-2 rounded" value={newProject.clientOrigin} onChange={(e) => setNewProject({ ...newProject, clientOrigin: e.target.value })} />
    <select className="border p-2 rounded" value={newProject.type} onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}>
      <option value="">Select Type</option>
      <option value="running">Running</option>
      <option value="upcoming">Upcoming</option>
      <option value="completed">Completed</option>
    </select>
    
    <button
      onClick={handleAddProject}
      disabled={isAdding || !isFormComplete}
      className={`px-4 py-2 rounded text-white transition 
        ${isAdding || !isFormComplete ? 'bg-[#902ba9] opacity-50 cursor-not-allowed' : 'bg-[#902ba9] hover:bg-[#6b22a4]'}`}
    >
      {isAdding ? 'Adding...' : 'Add Project'}
    </button>
  </div>
</section>
{/* Search Projects */}
<section className="my-4">
  <input
    type="text"
    className="border p-2 rounded w-full"
    placeholder="Search by name, origin, client..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
  />
</section>

{/* All Projects List */}
<section className="my-4">
  <h2 className="text-xl font-semibold mb-2">All Projects</h2>
  <ul className="space-y-2 max-h-56 overflow-y-auto pr-2">
    {Object.values(projects).flat().filter((p) =>
      p.title.toLowerCase().includes(searchQuery) ||
      p.clientOrigin.toLowerCase().includes(searchQuery) ||
      p.clientName.toLowerCase().includes(searchQuery)
    ).length === 0 ? (
      <li className="text-gray-500 italic">Here is No projects to Showcase</li>
    ) : (
      Object.values(projects)
        .flat()
        .filter((p) =>
          p.title.toLowerCase().includes(searchQuery) ||
          p.clientOrigin.toLowerCase().includes(searchQuery) ||
          p.clientName.toLowerCase().includes(searchQuery)
        )
        .map((p) => (
          <li key={p._id} className="border p-2 rounded shadow">
            <h3 className="font-bold text-lg">{p.title}</h3>
            <p className="text-sm text-gray-500">
              Client: {p.clientName} ({p.clientOrigin})
            </p>
            <p className="text-sm text-gray-500">
              Start: {p.startDate} | Type: {p.type}
            </p>
            <p className="text-sm">{p.description}</p>
            <p className="text-sm text-green-600 font-medium">
              Amount: ₹{p.amount}
            </p>
            <button
              onClick={() => handleDelete(p._id)}
              className="text-red-600 underline"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))
    )}
  </ul>
</section>





      {/* Users Section */}
      <section>
        <h2 className="text-xl font-semibold">Employees</h2>
        <div className="overflow-auto">
          <table className="w-full border mt-2 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-1">Name</th>
                <th className="border p-1">Email</th>
                <th className="border p-1">Admin Verified</th>
                <th className="border p-1">Email Verified</th>
                <th className="border p-1">Actions</th>
              </tr>
            </thead>
            <tbody>
  {users
    .filter((u) => !u.isAdmin) // ⛔️ Filter out admin users
    .map((u) => (
      <tr key={u._id}>
        <td className="border p-1">{u.firstName}</td>
        <td className="border p-1">{u.email}</td>
        <td className="border p-1">{u.adminVerified ? 'Yes' : 'No'}</td>
        <td className="border p-1">{u.emailVerified ? 'Yes' : 'No'}</td>
        <td className="border p-1 space-x-1">
          {!u.emailVerified && (
            <button
              onClick={() => handleVerifyEmail(u._id)}
              className="text-blue-600 underline"
            >
              Verify
            </button>
          )}
          <button
            onClick={() => handleToggleLogin(u._id, !u.allowLogin)}
            className="text-yellow-600 underline"
          >
            {u.adminVerified ? 'Disable' : 'Allow'} Login
          </button>

          {user.isAdmin && (
            <button
              onClick={() => handleDeleteUser(u._id)}
              className="text-red-600 underline"
            >
              Delete
            </button>
          )}
        </td>
      </tr>
    ))}
</tbody>

          </table>
        </div>
      </section>

      {/* Teams Section */}
      <section>
        <h2 className="text-xl font-semibold">Teams & Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
  {teams.map((team) => {
    const reportValues = Object.values(team.report || {});
    const completedTasks = reportValues.reduce(
      (sum, member) => sum + (member?.completed || 0),
      0
    );
    const totalTasks = reportValues.reduce(
      (sum, member) => sum + (member?.total || 0),
      0
    );
    const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const isDelayed = progress < 50;

    const createdDate = team.createdAt
      ? format(new Date(team.createdAt), "dd MMM yyyy")
      : "N/A";
    const updatedDate = team.updatedAt
      ? format(new Date(team.updatedAt), "dd MMM yyyy")
      : "N/A";

    const timeAgo = team.updatedAt
      ? formatDistanceToNow(new Date(team.updatedAt), { addSuffix: true })
      : "";
    const CtimeAgo = team.createdAt
      ? formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })
      : "";

    return (
      <div key={team._id} className="border p-4 rounded shadow space-y-1">
        <h3 className="font-bold text-lg">{team.name}</h3>
        <p>👥 Members: {team.members.length}</p>
        <p>📈 Progress: {progress}%</p>
        <p>🕒 Created: {createdDate} ({CtimeAgo})</p>
        {/* <p>🔄 Last Updated: {updatedDate} ({timeAgo})</p> */}
        <p className={isDelayed ? "text-red-600" : "text-green-600"}>
          {isDelayed ? "⚠️ Delayed" : "✅ On Track"}
        </p>
      </div>
    );
  })}
</div>

      </section>

      
    </div>
    </>
  );
}

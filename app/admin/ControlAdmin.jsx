'use client';
import MobileNavbar from '@/components/MobileNavbar';
import { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';


export default function AdminControlPanel({user}) {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState({
    running: [],
    upcoming: [],
    completed: [],
  });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchData();
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

  return (
    
    <>
    <MobileNavbar title='Admin Control'/>
    <div className="p-4 space-y-6 mb-12">
      <h1 className="text-2xl font-bold text-[#0c52a2]">Admin Control Panel</h1>

      {/* Projects Section */}
      <section>
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {['running', 'upcoming', 'completed'].map((type) => (
            <div key={type} className="border p-2 rounded shadow">
              <h3 className="font-bold capitalize">{type} Projects</h3>
              <ul className="text-sm list-disc list-inside">
                {projects[type]?.map((p) => (
                  <li key={p._id}>{p.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
              {users.map((u) => (
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
        <p>🔄 Last Updated: {updatedDate} ({timeAgo})</p>
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

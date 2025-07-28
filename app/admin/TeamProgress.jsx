'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function TeamProgress() {
  const queryClient = useQueryClient();

  // Fetch teams
  const { data, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await axios.get('/api/teams');
      return res.data.teams;
    },
    refetchInterval: 3000, // live updates every 3 seconds
  });

  // Delete mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`/api/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
    },
  });

  if (isLoading) return <p>Loading teams...</p>;
  if (error) return <p>Error fetching teams</p>;

  return (
    <div className="bg-white min-h-screen p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-[#902ba9] text-center mb-6">📈 Team Progress</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data && data.length > 0 ? (
  data.map((team) => {
    const completedTasks = team.tasks?.filter(t => t.status === 'completed')?.length || 0;
    const totalTasks = team.tasks?.length || 1;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    const isDelayed = progress < 50;
    const createdDate = team.createdAt ? format(new Date(team.createdAt), 'dd MMM yyyy') : 'N/A';

    return (
      <div key={team._id} className="p-4 border rounded-lg shadow-sm bg-gray-50 relative">
        <h2 className="text-lg font-semibold text-indigo-600">{team.name}</h2>
        <p className="text-sm text-gray-600 mt-1">Created by: {"TeamLeader" || 'Unknown'} on {createdDate}</p>
        <p className="text-sm text-gray-600">Members: {team.members?.length || 0}</p>
        <p className="text-sm text-gray-600 mt-1">
          Tasks: {completedTasks}/{totalTasks} completed
        </p>

        <div className="mt-4 h-2 bg-gray-200 rounded">
          <div
            className={`h-2 rounded ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{progress}% completed</p>

        <p className={`text-xs mt-2 font-semibold ${isDelayed ? 'text-red-500' : 'text-green-600'}`}>
          {isDelayed ? '⚠️ Delayed Team' : '🚀 Performing Well'}
        </p>

        <button
          className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-700"
          onClick={() => deleteTeamMutation.mutate(team._id)}
        >
          🗑️ Delete
        </button>
      </div>
    );
  })
) : (
  <p className="text-center text-gray-500 text-sm py-6">📭 No team created yet!</p>
)}

      </div>
    </div>
  );
}

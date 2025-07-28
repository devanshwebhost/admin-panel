"use client";

import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ManageTeam() {
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newName, setNewName] = useState({});
  const [memberId, setMemberId] = useState({});

  const queryClient = useQueryClient();

  // Fetch Teams
  const {
    data: teams = [],
    isLoading: loadingTeams,
    error: teamError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await axios.get("/api/teams");
      return res.data.teams || [];
    },
  });

  // Fetch Employees
  const {
    data: employees = [],
    isLoading: loadingEmployees,
    error: employeeError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      return data.employees || data.users || [];
    },
  });

  // Create Team Mutation
  const createTeamMutation = useMutation({
    mutationFn: async () =>
      axios.post("/api/teams", {
        name: teamName,
        members: selectedMembers,
      }),
    onSuccess: () => {
      setTeamName("");
      setSelectedMembers([]);
      queryClient.invalidateQueries(["teams"]);
    },
  });

  // Update Team Mutation
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, name, addMemberId }) =>
      axios.put(`/api/manageTeam/${id}`, { name, addMemberId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
    },
  });

  const toggleSelect = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  if (loadingTeams || loadingEmployees) return <div>Loading...</div>;
  if (teamError || employeeError)
    return <div>Error loading data: {teamError?.message || employeeError?.message}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-[#0c52a2]">Manage Teams</h1>

      {/* Create Team Form */}
      <div className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter team name"
          className="border p-2 rounded w-full"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-scroll border p-2 rounded">
          {employees.map((emp) => (
            <label key={emp._id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedMembers.includes(emp._id)}
                onChange={() => toggleSelect(emp._id)}
              />
              {emp.name} ({emp.email})
            </label>
          ))}
        </div>
        <button
          onClick={() => createTeamMutation.mutate()}
          className="bg-[#0c52a2] text-white px-4 py-2 rounded"
          disabled={createTeamMutation.isPending}
        >
          {createTeamMutation.isPending ? "Creating..." : "Create Team"}
        </button>
      </div>

      {/* Team List */}
      {teams.map((team) => (
        <div key={team._id} className="border p-4 rounded mb-4 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">{team.name}</h2>

          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="New name"
              className="border p-1 rounded"
              onChange={(e) =>
                setNewName({ ...newName, [team._id]: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Add member ID"
              className="border p-1 rounded"
              onChange={(e) =>
                setMemberId({ ...memberId, [team._id]: e.target.value })
              }
            />
            <button
              onClick={() =>
                updateTeamMutation.mutate({
                  id: team._id,
                  name: newName[team._id],
                  addMemberId: memberId[team._id],
                })
              }
              className="bg-green-600 text-white px-3 py-1 rounded"
              disabled={updateTeamMutation.isPending}
            >
              {updateTeamMutation.isPending ? "Updating..." : "Update"}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Members:</p>
            <ul className="list-disc list-inside text-sm">
              {team.members?.map((m) => (
                <li key={m._id || m}>{m.name || m.email || m}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

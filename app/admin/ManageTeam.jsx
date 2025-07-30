"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileNavbar from "@/components/MobileNavbar";

export default function ManageTeam({ user }) {
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newName, setNewName] = useState({});
  const [memberId, setMemberId] = useState({});
  const [memberTasks, setMemberTasks] = useState({});
  const [teamReport, setTeamReport] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);
  const [updatingTeamId, setUpdatingTeamId] = useState(null);



  const currentUserId = user._id || "someDefaultId";

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


useEffect(() => {
  const fetchDetailedTeamReport = async () => {
    const teamReports = {};
    // let grandTotal = 0;

    for (const team of teams) {
      const teamId = team._id;
      const members = team.members;
      const reportMap = {};
      let teamTotal = 0;

      for (const member of members) {
        const memberId = typeof member === 'object' ? member._id : member;

        try {
          const res = await fetch(`/api/tasks?assignedTo=${memberId}`);
          const data = await res.json();

          if (res.ok && data?.tasks) {
            const tasks = data.tasks;

            const total = tasks.length;
            const pending = tasks.filter((t) => t.status === "pending").length;
            const completed = tasks.filter((t) => t.status === "completed").length;
            const inProgress = tasks.filter((t) => t.status === "in progress").length;

            reportMap[memberId] = { total, pending, completed, inProgress };
            teamTotal += total;
          } else {
            reportMap[memberId] = { total: 0, pending: 0, completed: 0, inProgress: 0 };
          }
        } catch (err) {
          console.error(`Error fetching tasks for ${memberId}`, err);
          reportMap[memberId] = { total: 0, pending: 0, completed: 0, inProgress: 0 };
        }
      }

      teamReports[teamId] = {
        teamName: team.name || team.teamName || "Unnamed Team",
        report: reportMap,
        teamTotal,
      };

      // console.log(teamTotal)

      // grandTotal = teamTotal;

      // Update team report in backend
      try {
        await fetch(`/api/teams/${teamId}/report`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ report: reportMap }),
        });
      } catch (err) {
        console.error(`Failed to update team report for team ${teamId}`, err);
      }
    }

    setTeamReport(teamReports);
    // setGrandTotal(grandTotal);
  };

  if (teams?.length > 0) {
    fetchDetailedTeamReport();
  }
}, [teams]);



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
      return res.json(); // assuming it returns an array of users
    },
  });
  
  useEffect(() => {
  const fetchTasksForMembers = async () => {
    const taskMap = {};

    const allMembers = teams.flatMap((team) => team.members);

    for (const member of allMembers) {
      const memberId = member._id || member; // Handle Object or ID string
      try {
        const res = await fetch(`/api/tasks?assignedTo=${memberId}`);
        const data = await res.json();

        if (res.ok && data.tasks) {
          taskMap[memberId] = data.tasks.length;
        } else {
          taskMap[memberId] = 0;
        }
      } catch (err) {
        console.error(`Error fetching tasks for ${memberId}`, err);
        taskMap[memberId] = 0;
      }
    }

    setMemberTasks(taskMap);
  };

  fetchTasksForMembers();
}, [teams]);


  // Create Team Mutation
  const createTeamMutation = useMutation({
  mutationFn: async () => {
    const res = await axios.post("/api/teams", {
      name: teamName,
      members: selectedMembers,
      createdBy: currentUserId,
    });

    return res.data;
  },
  onSuccess: () => {
    setTeamName("");
    setSelectedMembers([]);
    queryClient.invalidateQueries(["teams"]);
  },
  onError: (error) => {
    if (error.response?.status === 409) {
      const message = error.response.data.message;
      alert(message);
    } else {
      alert("Failed to create team. Please try again.");
    }
  },
});


  const handleRemove = () => {
    // ✅ Should be a valid MongoDB ObjectId strin
  removeMemberMutation.mutate({ teamId, memberId });
};


  // console.log("memberId:", memberId);  

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
  mutationFn: ({ teamId, memberId }) =>
    axios.put(`/api/manageTeam/${teamId}`, {
      removeMemberId: memberId,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries(["teams"]);
  },
});


  // Update Team Mutation
  const updateTeamMutation = useMutation({
  mutationFn: async ({ id, name, addMemberId }) => {
    const res = await fetch(`/api/manageTeam/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, addMemberId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed.");
    return data;
  },
  onMutate: ({ id }) => {
    setUpdatingTeamId(id); // ✅ set which team is being updated
  },
  onSettled: () => {
    setUpdatingTeamId(null); // ✅ clear once mutation is done
  },
  onSuccess: () => {
    alert("Team updated successfully!");
  },
  onError: (error) => {
    alert(error.message || "Something went wrong during update!");
  },
});


  const toggleSelect = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

const deleteTeamMutation = useMutation({
  mutationFn: async (teamId) => {
    const res = await fetch(`/api/teams/${teamId}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete team.");

    return teamId;
  },
  onSuccess: (deletedTeamId) => {
    alert("Team deleted successfully!");
    queryClient.invalidateQueries(["teams"]);
    setTeams((prev) => prev.filter((team) => team._id !== deletedTeamId));
  },
  onError: (error) => {
    console.error(error.message || "Something went wrong!");
  },
});

const handleDeleteTeam = (teamId) => {
  if (!confirm("Are you sure you want to delete this team?")) return;
  deleteTeamMutation.mutate(teamId);
};

  

  if (loadingTeams || employeesLoading) return <div className="max-w-4xl mx-auto p-4">
    <img src="../pascelloading.gif" alt="Loading" />
  </div>;
  if (teamError || employeesError)
    return (
      <div>
        Error loading data: {teamError?.message || employeeError?.message}
      </div>
    );

  return (
    <>
    <MobileNavbar title="Manage Team"/>
    <div className="max-w-4xl mx-auto p-4 md:mb-0 mb-10 mt-11">

      {user?.teamName && user?._team ? (
  <p className="max-w-md mx-auto bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-md shadow-sm text-center text-sm sm:text-base">
    <strong>Note:</strong> If you are already in a team, you can't create a new team. <br />
    You are currently in team <span className="font-semibold">{user.teamName}</span> <br />
    Team ID: <span className="font-mono text-gray-700">{user._team}</span>
  </p>
) : (

      <div className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter team name"
          className="border p-2 rounded w-full"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <div className="flex md:grid flex-col md:flex-row grid-cols-2 gap-2 max-h-40 overflow-y-scroll border p-2 rounded">
  {employees
    .filter(emp => !emp.isAdmin && emp.role !== "admin") // hide admins
    .map((emp) => (
      <label key={emp._id} className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={selectedMembers.includes(emp._id)}
          onChange={() => toggleSelect(emp._id)}
        />
        {emp.firstName} ({emp.email}) <br /> ID - ({emp._id})
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

      )}

      {/* Team List */}
      {teams.map((team) => (
  <div key={team._id} className="border p-4 rounded mb-4 shadow-sm">
<h2 className="text-xl font-semibold text-gray-800">
  {team.name} - Created by: {team.createdBy?.email || team.createdBy?.firstName || team.createdBy}
  {/* {} */}
</h2>



{(!team || team?.createdBy?.email === user.email) && (
  <form className="mt-2 flex flex-wrap gap-2">
    <input
      type="text"
      placeholder="Add member ID"
      className="border p-1 rounded"
      required
      value={memberId[team._id] || ""}
      onChange={(e) =>
        setMemberId({ ...memberId, [team._id]: e.target.value })
      }
    />
    <button
      type="submit"
      onClick={(e) => {
        e.preventDefault();
        updateTeamMutation.mutate({
          id: team._id,
          name: newName[team._id],
          addMemberId: memberId[team._id],
        });
      }}
      className={`text-white px-3 py-1 rounded transition-all duration-200 ${
        updatingTeamId === team._id || !memberId[team._id]?.trim()
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
      disabled={updatingTeamId === team._id || !memberId[team._id]?.trim()}
    >
      {updatingTeamId === team._id ? "Updating..." : "Update"}
    </button>
  </form>
)}




    <div className="mt-4">
      <p className="text-sm text-gray-500 mb-2 font-medium">Team Members: {team.members.length}</p>
      <p className="text-sm text-gray-500 mb-2 font-medium">
        Total Team Tasks: {teamReport?.[team._id]?.teamTotal || 0}
      </p>

      <ul className="space-y-2">
        {team.members?.map((m) => (
          <li
            key={m._id || m}
            className="flex justify-between items-center bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-all"
          >
            <span className="text-sm text-gray-700">
              {m.firstName} {m.email}
              <br />
              ID: {m._id}
              <br />
              Total Tasks: {teamReport?.[team._id]?.report?.[m._id || m]?.total || 0}
            </span>
          {(!team || team?.createdBy?.email === user.email) && (
            <button
              onClick={() =>
                removeMemberMutation.mutate({
                  teamId: team._id,
                  memberId: m._id,
                })
              }
              className="text-xs text-red-500 hover:text-red-700 transition"
            >
              ❌ Remove
            </button>
          )}
          </li>
        ))}
      </ul>
    </div>
{(!team || team?.createdBy?.email === user.email || user.isAdmin) && (
    <button
      onClick={() => handleDeleteTeam(team._id)}
      className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
    >
      Delete Team
    </button>
)}
  </div>
))}

      
    </div>
    </>
  );
}

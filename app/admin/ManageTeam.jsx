'use client';

import { useState, useEffect } from 'react';

export default function Manage() {
  const [teamName, setTeamName] = useState('Alpha Team');
  const [isEditingName, setIsEditingName] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    const fetchedEmployees = [
      { id: 1, name: 'Aman Sharma', team: 'Alpha Team' },
      { id: 2, name: 'Ravi Kumar', team: null },
      { id: 3, name: 'Sneha Verma', team: 'Beta Team' },
      { id: 4, name: 'Tina Mehra', team: null }
    ];

    setAllEmployees(fetchedEmployees);
    setTeamMembers(fetchedEmployees.filter(emp => emp.team === teamName));
    setAvailableMembers(fetchedEmployees.filter(emp => emp.team === null));
  }, [teamName]);

  const handleAddMember = (id) => {
    const member = allEmployees.find(emp => emp.id === id);
    if (!member || member.team) return;

    member.team = teamName;
    setTeamMembers(prev => [...prev, member]);
    setAvailableMembers(prev => prev.filter(emp => emp.id !== id));
  };

  const handleTeamNameChange = () => {
    setIsEditingName(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[#902ba9] mb-6 text-center">👥 Manage Your Team</h2>

      {/* Team Name */}
      <div className="mb-8 bg-white border rounded-lg p-4 shadow-sm">
        <label className="block text-gray-600 font-medium mb-2">Team Name</label>
        {isEditingName ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleTeamNameChange}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">{teamName}</span>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-indigo-600 hover:underline"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="mb-8 bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-700 mb-3">👨‍💼 Team Members</h3>
        {teamMembers.length === 0 ? (
          <p className="text-sm text-gray-500">No members in your team yet.</p>
        ) : (
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            {teamMembers.map(member => (
              <li key={member.id}>{member.name}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Available Members */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-700 mb-3">➕ Add Members</h3>
        {availableMembers.length === 0 ? (
          <p className="text-sm text-gray-500">No available members to add.</p>
        ) : (
          <ul className="space-y-3">
            {availableMembers.map(member => (
              <li
                key={member.id}
                className="flex justify-between items-center bg-gray-50 border rounded-md px-3 py-2"
              >
                <span className="text-gray-800">{member.name}</span>
                <button
                  onClick={() => handleAddMember(member.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

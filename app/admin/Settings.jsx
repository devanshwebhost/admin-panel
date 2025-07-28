"use client";
import { useState } from "react";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import SignOutButton from "@/components/SignOut";

export default function Settings({ user }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [address, setAddress] = useState(user.address || "");
  const [phone, setPhone] = useState(user.phone || "");

  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log("User:", user);


  const handleSave = async (field) => {
    setLoading(true);
    try {
      const res = await fetch("/api/updateuser", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          field,
          value:
            field === "firstName"
              ? firstName
              : field === "lastName"
              ? lastName
              : field === "address"
              ? address
              : phone,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");
      setEditingField(null);
    } catch (err) {
      alert("Error updating field.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, field, value, setValue) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b">
      <label className="font-semibold text-gray-700 w-32">{label}</label>
      {editingField === field ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
          <input
            className="border rounded px-3 py-2 w-full sm:w-auto flex-1 text-sm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="flex gap-1">
            <button
              className="text-green-600 flex items-center text-sm"
              onClick={() => handleSave(field)}
              disabled={loading}
            >
              <SaveIcon className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              className="text-red-500 flex items-center text-sm"
              onClick={() => setEditingField(null)}
              disabled={loading}
            >
              <XIcon className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 flex-1 text-sm text-gray-800">
          <span>{value || "Not set"}</span>
          <button
            className="text-blue-600 hover:underline flex items-center text-sm"
            onClick={() => setEditingField(field)}
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border md:mt-6 mt-[60px]">
      <h2 className="text-xl font-bold  mb-4 text-[#902ba9]">User Settings</h2>

      <div className="text-sm text-gray-800 mb-4 space-y-1">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
        <p><strong>Admin Verified:</strong> {user.adminVerified ? "Yes" : "No"}</p>
        <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
        <p><strong>Team Member ID:</strong> {user._id}</p>
        <p><strong>Current Team Name:</strong> {user.teamName}</p>
        <p><strong>Current Team ID:</strong> {user._team || "No Team Assigned"}</p>
      </div>

      <div className="divide-y">
        {renderField("First Name", "firstName", firstName, setFirstName)}
        {renderField("Last Name", "lastName", lastName, setLastName)}
        {renderField("Phone", "phone", phone, setPhone)}
        {renderField("Address", "address", address, setAddress)}
      </div>
      <SignOutButton/>
      <DeleteAccountSection user={user}/>
    </div>
  );
}

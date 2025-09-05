"use client";
import { useState } from "react";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import SignOutButton from "@/components/SignOut";
import MobileNavbar from "@/components/MobileNavbar";
import PcNavbar from "@/components/PcNavbar";
import { toast } from "react-toastify";

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
      toast.error("Error updating field.");
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
    <>
    <MobileNavbar title="Settings"/>
    <PcNavbar title="Settings" />
<div className="w-full max-w-[900px] mx-auto bg-white p-6 rounded-xl  
                mt-[50px] mb-10
                md:px-10 md:py-8">

  {/* User Info */}
  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm md:text-base">
    <p><strong className="text-gray-600 font-medium">Email:</strong> <span className="text-gray-800">{user.email}</span></p>
    <p><strong className="text-gray-600 font-medium">Email Verified:</strong> <span className="text-gray-800">{user.emailVerified ? "Yes" : "No"}</span></p>
    <p><strong className="text-gray-600 font-medium">Admin Verified:</strong> <span className="text-gray-800">{user.adminVerified ? "Yes" : "No"}</span></p>
    <p><strong className="text-gray-600 font-medium">Account Created:</strong> <span className="text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</span></p>
    <p><strong className="text-gray-600 font-medium">Last Updated:</strong> <span className="text-gray-800">{new Date(user.updatedAt).toLocaleDateString()}</span></p>
    <p><strong className="text-gray-600 font-medium">Team Member ID:</strong> <span className="text-gray-800">{user._id}</span></p>
    <p><strong className="text-gray-600 font-medium">Current Team Name:</strong> <span className="text-gray-800">{user.teamName || "N/A"}</span></p>
    <p><strong className="text-gray-600 font-medium">Current Team ID:</strong> <span className="text-gray-800">{user._team || "No Team Assigned"}</span></p>
  </div>

  {/* Editable Fields Container */}
  <div className="divide-y divide-gray-200 border-t border-b border-gray-200 -mx-6 md:-mx-10 px-6 md:px-10">
    {renderField("First Name", "firstName", firstName, setFirstName)}
    {renderField("Last Name", "lastName", lastName, setLastName)}
    {renderField("Phone", "phone", phone, setPhone)}
    {renderField("Address", "address", address, setAddress)}
  </div>

  {/* Buttons */}
  <div className="mt-10 flex flex-col gap-4 max-w-sm mx-auto">
    <SignOutButton
      className="w-full py-3 rounded-lg bg-[#902ba9] text-white font-semibold text-base
                 hover:bg-[#6b22a4] transition duration-200 shadow-md"
    />
    {!user.isAdmin && (
      <DeleteAccountSection
        user={user}
        className="w-full py-3 rounded-lg bg-[#d93025] text-white font-semibold text-base
                   hover:bg-[#a8221a] transition duration-200 shadow-md"
      />
    )}
  </div>
</div>
    </>
  );
}

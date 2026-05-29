'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import MobileNavbar from "@/components/MobileNavbar";
import PcNavbar from "@/components/PcNavbar";
import { toast } from "react-toastify";
import GlitchText from "@/components/Glitch";

export default function PascelControl() {
  const [role, setRole] = useState("");
  const [services, setServices] = useState("");
  const [holidays, setHolidays] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch existing info on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/admin");
        setRole(res.data.role || "");
        setServices(res.data.services || "");
        setHolidays(JSON.stringify(res.data.holidays || [], null, 2));
      } catch (err) {
        console.log("No existing settings found.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      let parsedHolidays = [];
      try {
        parsedHolidays = JSON.parse(holidays);
      } catch (e) {
        toast.error("Invalid Holidays JSON format");
        return;
      }
      await axios.patch("/api/admin", { role, services, holidays: parsedHolidays });
      toast.success("Pascel updated successfully!");
    } catch (error) {
      toast.error("Error updating Pascel");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  

  return (
    <>
    <MobileNavbar title="AI Settings"/>
    <PcNavbar title="AI Settings"/>
    <div className="w-full max-w-3xl mx-auto px-4 py-8 mt-[50px]">
      {/* <h1 className="text-2xl md:text-3xl font-bold text-[#902ba9] mb-6">Pascel AI Control Panel</h1> */}

      <div className="space-y-4">
        {/* Role */}
        <div>
          <label htmlFor="role" className="block font-semibold text-gray-700 mb-1">
            AI Role
          </label>
          <textarea
            id="role"
            placeholder="Define the AI's role (e.g. 'You are a project assistant...')"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#902ba9] transition"
            rows={4}
          />
        </div>

        {/* Services */}
        <div>
          <label htmlFor="services" className="block font-semibold text-gray-700 mb-1">
            AI Services Info
          </label>
          <textarea
            id="services"
            placeholder="List the services AI is aware of..."
            value={services}
            onChange={(e) => setServices(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#902ba9] transition"
            rows={10}
          />
        </div>

        {/* Holidays */}
        <div>
          <label htmlFor="holidays" className="block font-semibold text-gray-700 mb-1">
            Holidays JSON
          </label>
          <textarea
            id="holidays"
            placeholder='[{"name": "Republic Day", "date": "2025-01-26"}]'
            value={holidays}
            onChange={(e) => setHolidays(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#902ba9] transition"
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">Provide an array of objects with "name" and "date" (YYYY-MM-DD).</p>
        </div>

        {/* Save Button */}
        <div className="">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`bg-[#902ba9] hover:bg-[#6b22a4] text-white md:px-6 px-4 md:py-3 py-2 rounded-xl text-base font-semibold transition-all w-full sm:w-auto ${updating ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {updating ? "⏳ Saving..." : "💾 Save Updates"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

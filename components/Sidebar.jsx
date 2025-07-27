"use client";
import { useState } from "react";
import {
  HomeIcon,
  ListCheckIcon,
  BotIcon,
  SettingsIcon,
  UsersIcon,
  BarChart2Icon,
  ClipboardListIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

const Sidebar = ({ setActiveTab }) => {
  const [active, setActive] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: <HomeIcon className="w-5 h-5 mr-2" />, value: "dashboard" },
    { label: "My Tasks", icon: <ListCheckIcon className="w-5 h-5 mr-2" />, value: "myTasks" },
    { label: "Pascel AI", icon: <BotIcon className="w-5 h-5 mr-2" />, value: "pascel" },
    { label: "Settings", icon: <SettingsIcon className="w-5 h-5 mr-2" />, value: "settings" },
  ];

  const teamItems = [
    { label: "Manage Team", icon: <UsersIcon className="w-5 h-5 mr-2" />, value: "manageTeam" },
    { label: "Team Progress", icon: <BarChart2Icon className="w-5 h-5 mr-2" />, value: "teamProgress" },
    { label: "Assign Task", icon: <ClipboardListIcon className="w-5 h-5 mr-2" />, value: "assignTask" },
  ];

  const renderButton = ({ label, icon, value }) => (
    <button
      key={value}
      onClick={() => {
        setActiveTab(value);
        setActive(value);
        setIsOpen(false); // Close sidebar on mobile
      }}
      className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors text-left font-medium ${
        active === value ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      {/* Hamburger Button (Mobile Only) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="text-gray-700 bg-white shadow-md p-2 rounded-md"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[rgb(255_251_237)] shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:shadow-none md:flex md:flex-col`}
      >
        {/* Close Button (Mobile Only) */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={() => setIsOpen(false)}>
            <XIcon />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="logo" width={120} />
        </div>

        {/* Main Menu */}
        <div className="space-y-2 px-4">
          {menuItems.map(renderButton)}
        </div>

        <hr className="my-4 mx-4" />

        {/* Team Menu */}
        <div className="space-y-2 px-4">
          {teamItems.map(renderButton)}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

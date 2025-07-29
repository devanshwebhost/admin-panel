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
} from "lucide-react";

const Sidebar = ({ setActiveTab, isAdmin }) => {
  const [active, setActive] = useState("dashboard");

  const allTabs = [
    { label: "Dashboard", icon: HomeIcon, value: "dashboard" },
    { label: "My Tasks", icon: ListCheckIcon, value: "myTasks" },
    { label: "Pascel AI", icon: BotIcon, value: "pascel" },
    { label: "Settings", icon: SettingsIcon, value: "settings" },
    { label: "Manage Team", icon: UsersIcon, value: "manageTeam" },
    { label: "Team Progress", icon: BarChart2Icon, value: "teamProgress" },
    { label: "Assign Task", icon: ClipboardListIcon, value: "assignTask" },
  ];

  const filteredTabs = isAdmin
    ? allTabs.filter(tab => tab.value !== "myTasks")
    : allTabs;

  const renderButton = ({ label, icon: Icon, value }) => (
    <button
      key={value}
      onClick={() => {
        setActiveTab(value);
        setActive(value);
      }}
      className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors text-left font-medium ${
        active === value ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </button>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-[rgb(255_251_237)] h-full shadow-lg relative">
        <div className="flex justify-center my-6">
          <img src="/logo.png" alt="logo" width={120} />
        </div>

        <div className="space-y-2 px-4">
          {filteredTabs.slice(0, 4).map(renderButton)}
        </div>

        <hr className="my-4 mx-4" />

        <div className="space-y-2 px-4">
          {filteredTabs.slice(4).map(renderButton)}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[rgb(255_251_237)] border-t p-2 shadow-inner md:hidden overflow-x-auto">
        <div className="flex gap-4 px-2 min-w-max w-full">
          {filteredTabs.map(({ icon: Icon, label, value }) => (
            <button
              key={value}
              onClick={() => {
                setActiveTab(value);
                setActive(value);
              }}
              className={`flex flex-col items-center text-xs min-w-[64px] ${
                active === value ? "text-purple-700" : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="whitespace-nowrap">
                {label.length > 10 ? label.slice(0, 8) + "…" : label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

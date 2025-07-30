'use client';
import { useState } from 'react';
// import Sidebar from './Sidebar';
import Dashboard from '@/app/admin/Dashboard';
import MyTasks from '@/app/admin//MyTask';
import Pascal from '@/app/admin/Pascal';
import Settings from '@/app/admin/Settings';
import ManageTeam from '@/app/admin/ManageTeam';
import TeamProgress from '@/app/admin/TeamProgress';
import AssignTask from '@/app/admin/AssignTask';
import Sidebar from '@/components/Sidebar';
import AdminControlPanel from '@/app/admin/ControlAdmin';

export default function DashboardPage({user}) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'myTasks':
        return <MyTasks user={user} />;
      case 'pascel':
        return <Pascal user={user} />;
      case 'settings':
        return <Settings user={user} />;
      case 'manageTeam':
        return <ManageTeam user={user} />;
      case 'teamProgress':
        return <TeamProgress />;
      case 'assignTask':
        return <AssignTask user={user} />;
      case 'adminControl':
        return <AdminControlPanel user={user}/> ;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* <Sidebar setActiveTab={setActiveTab} /> */}
      <Sidebar setActiveTab={setActiveTab} isAdmin={user.isAdmin} />
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
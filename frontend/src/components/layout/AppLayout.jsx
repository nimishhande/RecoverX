import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Derive title from pathname (basic logic for now)
  const getPageTitle = (pathname) => {
    if (pathname.includes('/projects/')) return 'Project Details';
    const path = pathname.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <div className="rx-app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className="rx-main-content">
        <Topbar
          onMenuClick={toggleSidebar}
          title={getPageTitle(location.pathname)}
        />
        <div className="rx-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

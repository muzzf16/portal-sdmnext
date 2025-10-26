import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Role } from '../types';
import { LayoutContext } from '../context/LayoutContext';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import LayoutWrapper from '../components/layout/LayoutWrapper';
import { motion } from 'framer-motion';

const DashboardLayout: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useContext(LayoutContext);
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useNotification();

  const mainContentVariants = {
    expanded: { marginLeft: '16rem' },
    collapsed: { marginLeft: '5rem' },
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header userRole={user.user.role} userName={user.user.name} onLogout={logout} notificationCount={unreadCount} />
      <div className="flex">
        <Sidebar 
          userRole={user.user.role} 
          userName={user.user.name} 
          onLogout={logout} 
        />
        <div className={`flex-1 pt-20 ${isSidebarCollapsed ? 'md:ml-sidebar-collapsed' : 'md:ml-sidebar-expanded'} transition-all duration-300`}>
          <LayoutWrapper>
            <Outlet />
          </LayoutWrapper>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthenticatedSidebar } from './AuthenticatedSidebar';

const UserAuthenticatedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthenticatedSidebar />
      <div className="p-4 lg:ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default UserAuthenticatedLayout; 
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminMobileNavigation from './AdminMobileNavigation';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-slate-100 selection:bg-teal-600 selection:text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminMobileNavigation />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}


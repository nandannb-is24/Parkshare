import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';

export default function ResidentLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNavigation />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
}


import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Car,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between shrink-0 h-screen sticky top-0 z-20 text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white tracking-tight text-lg leading-tight">ParkShare</h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800/80">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Platform Management
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick Switch
            </p>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-800/60"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Return to Resident Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Identity & Sign Out Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-teal-950 border border-teal-700/60 text-teal-200 font-bold text-xs flex items-center justify-center shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span className="capitalize">{user?.role || 'Administrator'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

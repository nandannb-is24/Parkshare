import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Car,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminMobileNavigation() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  ];

  return (
    <header className="lg:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-200">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-base">ParkShare</span>
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle admin navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Collapsible Mobile Drawer */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2 shadow-2xl">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
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

          <div className="pt-2">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Quick Switch
            </p>
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Return to Resident Portal</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 px-1 mb-3">
              <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-700/60 text-teal-200 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span className="capitalize">{user?.role || 'Administrator'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  ParkingSquare,
  CalendarCheck,
  Inbox,
  CreditCard,
  LogOut,
  Car,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Find Parking', path: '/slots', icon: Search },
    { label: 'My Slots', path: '/my-slots', icon: ParkingSquare },
    { label: 'My Bookings', path: '/my-bookings', icon: CalendarCheck },
    { label: 'Received Bookings', path: '/received-bookings', icon: Inbox },
    { label: 'Payments', path: '/payments', icon: CreditCard },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">ParkShare</h1>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-600">
              Resident Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Console Switch - visible only to administrators */}
        {user?.role === 'admin' && (
          <div className="px-4 pt-1 pb-3">
            <p className="px-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Administrator
            </p>
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100/80 transition-all border border-teal-200/60 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Switch to Admin Console</span>
            </Link>
          </div>
        )}
      </div>

      {/* User Profile & Sign Out Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.flatNumber || 'Resident'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}


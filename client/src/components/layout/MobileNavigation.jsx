import React, { useState } from 'react';
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
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNavigation() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Find Parking', path: '/slots', icon: Search },
    { label: 'My Slots', path: '/my-slots', icon: ParkingSquare },
    { label: 'My Bookings', path: '/my-bookings', icon: CalendarCheck },
    { label: 'Received Bookings', path: '/received-bookings', icon: Inbox },
    { label: 'Payments', path: '/payments', icon: CreditCard },
  ];

  return (
    <header className="lg:hidden bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Car className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-base">ParkShare</span>
        </div>

        {/* Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Collapsible Mobile Drawer */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
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

          {user?.role === 'admin' && (
            <div className="pt-2">
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-200"
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Switch to Admin Console</span>
              </Link>
            </div>
          )}

          <div className="pt-3 mt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.flatNumber || 'Resident'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
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


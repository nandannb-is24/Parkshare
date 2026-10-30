import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Search,
  PlusCircle,
  ParkingSquare,
  ArrowRight,
  Sparkles,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ParkingSlotCard from '../../components/slots/ParkingSlotCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [mySlotsCount, setMySlotsCount] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Parallel fetch for my slots and available slots
      const [mineRes, availableRes] = await Promise.all([
        api.get('/slots/mine'),
        api.get('/slots'),
      ]);

      if (mineRes.data.success) {
        setMySlotsCount(mineRes.data.count || 0);
      }

      if (availableRes.data.success) {
        setAvailableSlots(availableRes.data.slots || []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to load dashboard data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-950/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-semibold mb-4 border border-white/10">
            <Building className="w-3.5 h-3.5" />
            <span>Apartment {user?.flatNumber || 'Resident'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-brand-100/90 text-sm leading-relaxed">
            Discover available parking spaces within your apartment complex or monetize your unused slot when you're away.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/slots"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-brand-900 bg-white hover:bg-brand-50 shadow-md transition-all active:scale-95"
            >
              <Search className="w-4 h-4 text-brand-600" />
              <span>Find Parking Now</span>
            </Link>
            <Link
              to="/slots/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600/60 hover:bg-brand-600 border border-white/20 shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Slot</span>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop icon */}
        <Car className="absolute -bottom-6 -right-6 w-56 h-56 text-white/5 pointer-events-none" />
      </div>

      {/* Error Banner */}
      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">My Listed Slots</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '-' : mySlotsCount}
            </h3>
            <Link
              to="/my-slots"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 mt-2"
            >
              <span>Manage your slots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ParkingSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Slots</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '-' : availableSlots.length}
            </h3>
            <Link
              to="/slots"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 mt-2"
            >
              <span>Explore all slots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Available Listings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Nearby</h2>
            <p className="text-xs text-slate-500">Active slots listed by your fellow society residents</p>
          </div>
          {availableSlots.length > 0 && (
            <Link
              to="/slots"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>View all ({availableSlots.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching community parking slots..." />
        ) : availableSlots.length === 0 ? (
          <EmptyState
            icon={ParkingSquare}
            title="No community slots available right now"
            description="Be the first to share an unused parking slot with your society members!"
            actionLabel="List a Parking Slot"
            actionLink="/slots/create"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableSlots.slice(0, 6).map((slot) => (
              <ParkingSlotCard key={slot._id} slot={slot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

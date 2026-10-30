import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Car,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Clock,
  RotateCcw,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats || res.data);
      } else {
        setError(res.data.message || 'Failed to retrieve administrative statistics');
      }
    } catch (err) {
      console.error('fetchStats error:', err);
      setError(
        err.response?.data?.message || 'Server error occurred while fetching platform statistics'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner message="Loading administrative metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Unable to load dashboard</h2>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => fetchStats()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-md shadow-teal-600/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Now</span>
        </button>
      </div>
    );
  }

  const u = stats?.users || {
    total: stats?.totalUsers || 0,
    residents: stats?.totalResidents || 0,
    admins: stats?.totalAdmins || 0,
  };

  const s = stats?.slots || {
    total: stats?.totalSlots || 0,
    active: stats?.activeSlots || 0,
    inactive: stats?.inactiveSlots || 0,
  };

  const b = stats?.bookings || {
    total: stats?.totalBookings || 0,
    confirmed: stats?.confirmedBookings || 0,
    cancelled: stats?.cancelledBookings || 0,
  };

  const f = stats?.financials || {
    netRetainedRevenue: stats?.netRetainedRevenue ?? stats?.totalPaidRevenue ?? 0,
    grossPaidRevenue: stats?.grossPaidRevenue ?? stats?.grossPaidAmount ?? 0,
    totalRefundedAmount: stats?.totalRefundedAmount ?? 0,
    totalPendingAmount: stats?.totalPendingAmount ?? 0,
  };

  // Safe percentage helper
  const calcPct = (val, total) => (total > 0 ? Math.round((val / total) * 100) : 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Title and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800">
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and management across apartment users, slots, bookings, and verified revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all disabled:opacity-50"
            title="Refresh statistics from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
          </button>
        </div>
      </div>

      {/* 1. Financial Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Financial Summary (INR)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Strict settlement tracking • Excludes uncollected pending
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Retained Revenue */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Net Retained Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(f.netRetainedRevenue)}
            </p>
            <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Actual funds currently held
            </p>
          </div>

          {/* Gross Paid Revenue */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Gross Paid Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(f.grossPaidRevenue)}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Total funds processed before refunds
            </p>
          </div>

          {/* Total Refunded Amount */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Total Refunded</span>
              <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/80 text-sky-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-sky-200 tracking-tight">
              {formatCurrency(f.totalRefundedAmount)}
            </p>
            <p className="text-[11px] text-sky-400 mt-2">
              Cancelled paid reservations refunded
            </p>
          </div>

          {/* Pending Payment Amount */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Pending Amount</span>
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-200 tracking-tight">
              {formatCurrency(f.totalPendingAmount)}
            </p>
            <p className="text-[11px] text-amber-400 mt-2">
              Unsettled reservations (not counted in revenue)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Platform KPIs Grid (Users, Slots, Bookings) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Metrics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800/80 text-blue-400 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">User Base</h3>
              </div>
              <Link
                to="/admin/users"
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-black text-white">{u.total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total Registered Accounts</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <UserCheck className="w-3 h-3 text-blue-400" />
                <span>Residents</span>
              </div>
              <p className="text-base font-bold text-white">{u.residents}</p>
              <span className="text-[10px] text-slate-400">{calcPct(u.residents, u.total)}% of total</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                <span>Admins</span>
              </div>
              <p className="text-base font-bold text-white">{u.admins}</p>
              <span className="text-[10px] text-slate-400">{calcPct(u.admins, u.total)}% of total</span>
            </div>
          </div>
        </div>

        {/* Slot Metrics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Parking Slots</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Community Spaces</span>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-black text-white">{s.total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total Listed Spaces</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Active</span>
              </div>
              <p className="text-base font-bold text-emerald-300">{s.active}</p>
              <span className="text-[10px] text-slate-400">{calcPct(s.active, s.total)}% operational</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <XCircle className="w-3 h-3 text-slate-400" />
                <span>Inactive</span>
              </div>
              <p className="text-base font-bold text-slate-300">{s.inactive}</p>
              <span className="text-[10px] text-slate-400">{calcPct(s.inactive, s.total)}% disabled</span>
            </div>
          </div>
        </div>

        {/* Booking Metrics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-950/60 border border-teal-800/80 text-teal-400 flex items-center justify-center">
                  <CalendarCheck className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Reservations</h3>
              </div>
              <Link
                to="/admin/bookings"
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-black text-white">{b.total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total Reservation Requests</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Confirmed</span>
              </div>
              <p className="text-base font-bold text-white">{b.confirmed}</p>
              <span className="text-[10px] text-slate-400">{calcPct(b.confirmed, b.total)}% fulfillment</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <XCircle className="w-3 h-3 text-rose-400" />
                <span>Cancelled</span>
              </div>
              <p className="text-base font-bold text-rose-300">{b.cancelled}</p>
              <span className="text-[10px] text-slate-400">{calcPct(b.cancelled, b.total)}% cancellation</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Distributions & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Flow Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-1">Revenue Comparison & Retention</h3>
          <p className="text-xs text-slate-400 mb-6">
            Proportional analysis of gross collected funds vs refunded settlements.
          </p>

          <div className="space-y-4">
            {/* Visual multi-segment bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Gross Capital Flow</span>
                <span className="font-bold text-white">{formatCurrency(f.grossPaidRevenue)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  style={{
                    width: `${f.grossPaidRevenue > 0 ? (f.netRetainedRevenue / f.grossPaidRevenue) * 100 : 0}%`,
                  }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Net Retained: ${formatCurrency(f.netRetainedRevenue)}`}
                />
                <div
                  style={{
                    width: `${f.grossPaidRevenue > 0 ? (f.totalRefundedAmount / f.grossPaidRevenue) * 100 : 0}%`,
                  }}
                  className="bg-sky-500 h-full transition-all duration-500"
                  title={`Refunded: ${formatCurrency(f.totalRefundedAmount)}`}
                />
              </div>
            </div>

            {/* Breakdown Items */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-300 font-medium">Net Retained</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {formatCurrency(f.netRetainedRevenue)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-xs text-slate-300 font-medium">Refunded</span>
                </div>
                <span className="text-xs font-bold text-sky-400">
                  {formatCurrency(f.totalRefundedAmount)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-amber-300 font-medium">Pending Unpaid Pipeline</span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {formatCurrency(f.totalPendingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Distribution Ratios */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-1">Operational Health & Distributions</h3>
          <p className="text-xs text-slate-400 mb-6">
            Platform ratio indicators for booking fulfillment and community slot inventory.
          </p>

          <div className="space-y-5">
            {/* Booking Fulfillment Rate */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Booking Confirmation Rate</span>
                <span className="font-bold text-emerald-400">{calcPct(b.confirmed, b.total)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${calcPct(b.confirmed, b.total)}%` }}
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{b.confirmed} Confirmed</span>
                <span>{b.cancelled} Cancelled</span>
              </div>
            </div>

            {/* Active Parking Slots */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Active Slots Availability</span>
                <span className="font-bold text-blue-400">{calcPct(s.active, s.total)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${calcPct(s.active, s.total)}%` }}
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{s.active} Active</span>
                <span>{s.inactive} Inactive</span>
              </div>
            </div>

            {/* Resident Ratio */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Resident Adoption Ratio</span>
                <span className="font-bold text-teal-400">{calcPct(u.residents, u.total)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${calcPct(u.residents, u.total)}%` }}
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{u.residents} Residents</span>
                <span>{u.admins} Admins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

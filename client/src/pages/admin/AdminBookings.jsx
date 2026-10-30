import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  CalendarCheck,
  Car,
  Bike,
  Filter,
  IndianRupee,
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Hash,
} from 'lucide-react';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import PaymentStatusBadge from '../../components/bookings/PaymentStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (paymentStatusFilter) {
        params.paymentStatus = paymentStatusFilter;
      }

      const res = await api.get('/admin/bookings', { params });
      if (res.data.success) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalBookings(res.data.total || 0);
      } else {
        setError(res.data.message || 'Failed to retrieve bookings list');
      }
    } catch (err) {
      console.error('fetchBookings error:', err);
      setError(err.response?.data?.message || 'Server error occurred while loading bookings');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, paymentStatusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusFilter = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePaymentFilter = (val) => {
    setPaymentStatusFilter(val);
    setPage(1);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Booking Management</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              {totalBookings} Total Reservations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit log of all resident parking reservations, payment states, and slot allocations.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Booking Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-teal-400" />
            <span>Booking:</span>
          </span>
          <button
            onClick={() => handleStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === ''
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => handleStatusFilter('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'confirmed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => handleStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'cancelled'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Payment Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0">Payment:</span>
          <button
            onClick={() => handlePaymentFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              paymentStatusFilter === ''
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => handlePaymentFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              paymentStatusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => handlePaymentFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              paymentStatusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handlePaymentFilter('refunded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              paymentStatusFilter === 'refunded'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Refunded
          </button>
        </div>
      </div>

      {/* Bookings Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner message="Loading reservation records..." />
        </div>
      ) : error ? (
        <div className="py-12 bg-slate-900/90 border border-slate-800 rounded-2xl text-center px-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white mb-1">Failed to retrieve bookings</p>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white rounded-xl shadow-md transition-all"
          >
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 bg-slate-900/90 border border-slate-800 rounded-2xl text-center px-4">
          <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No reservations found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {statusFilter || paymentStatusFilter
              ? 'No bookings match the selected status or payment filters.'
              : 'There are currently no parking bookings logged in the system.'}
          </p>
          {(statusFilter || paymentStatusFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setPaymentStatusFilter('');
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Ref / Slot</th>
                  <th className="py-3.5 px-4">Resident</th>
                  <th className="py-3.5 px-4">Time Window</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => {
                  const isCar = b.slot?.vehicleType !== 'bike';
                  return (
                    <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Ref & Slot */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                            {isCar ? <Car className="w-4 h-4 text-blue-400" /> : <Bike className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              Slot {b.slot?.slotNumber || 'N/A'}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                              <Hash className="w-2.5 h-2.5" />
                              {b._id?.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Resident */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-white">{b.user?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span>Flat {b.user?.flatNumber || 'N/A'}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-500">{b.user?.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">
                          <p>{formatDateTime(b.startTime)}</p>
                          <p className="text-[11px] text-slate-500">to {formatDateTime(b.endTime)}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-white text-sm">
                          {formatCurrency(b.totalAmount)}
                        </span>
                      </td>

                      {/* Booking Status */}
                      <td className="py-3.5 px-4">
                        <BookingStatusBadge status={b.status} />
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <PaymentStatusBadge status={b.paymentStatus} />
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        {b.paymentMethod ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                            {b.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden space-y-3">
            {bookings.map((b) => {
              const isCar = b.slot?.vehicleType !== 'bike';
              return (
                <div
                  key={b._id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300">
                        {isCar ? <Car className="w-4 h-4 text-blue-400" /> : <Bike className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Slot {b.slot?.slotNumber || 'N/A'}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Ref: #{b._id?.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-white">{formatCurrency(b.totalAmount)}</p>
                      {b.paymentMethod && (
                        <span className="text-[10px] text-slate-400 font-semibold">{b.paymentMethod}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <BookingStatusBadge status={b.status} />
                    <PaymentStatusBadge status={b.paymentStatus} />
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Resident</p>
                      <p className="font-bold text-slate-200">{b.user?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-500">Flat {b.user?.flatNumber || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Time Window</p>
                      <p className="font-medium text-slate-300">{formatDateTime(b.startTime)}</p>
                      <p className="text-[11px] text-slate-500">to {formatDateTime(b.endTime)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-lg">
            <span className="text-xs text-slate-400 font-medium">
              Showing page <span className="font-bold text-white">{page}</span> of{' '}
              <span className="font-bold text-white">{totalPages}</span> ({totalBookings} total bookings)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


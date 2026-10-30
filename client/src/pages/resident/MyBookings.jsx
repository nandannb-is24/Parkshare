import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, PlusCircle, Search, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import BookingCard from '../../components/bookings/BookingCard';
import PaymentModal from '../../components/bookings/PaymentModal';
import CancellationModal from '../../components/bookings/CancellationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'upcoming', 'past', 'cancelled'

  // Modal states
  const [payingBooking, setPayingBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/mine');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching my bookings:', err);
      setError('Unable to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  // Handle successful payment callback
  const handlePaymentSuccess = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
    );
  };

  // Handle successful cancellation callback
  const handleCancellationSuccess = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
    );
  };

  // Filter logic
  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'cancelled') return b.status === 'cancelled';
    if (filterTab === 'upcoming') {
      return b.status === 'confirmed' && new Date(b.endTime) >= now;
    }
    if (filterTab === 'past') {
      return b.status === 'confirmed' && new Date(b.endTime) < now;
    }
    return true; // 'all'
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal parking reservations, settle pending balances, or cancel upcoming bookings.
          </p>
        </div>
        <Link
          to="/slots"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Find Parking</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
        {[
          { id: 'all', label: `All (${bookings.length})` },
          {
            id: 'upcoming',
            label: `Upcoming (${bookings.filter((b) => b.status === 'confirmed' && new Date(b.endTime) >= now).length})`,
          },
          {
            id: 'past',
            label: `Completed (${bookings.filter((b) => b.status === 'confirmed' && new Date(b.endTime) < now).length})`,
          },
          {
            id: 'cancelled',
            label: `Cancelled (${bookings.filter((b) => b.status === 'cancelled').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterTab === tab.id
                ? 'bg-brand-50 text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && <ErrorMessage message={error} onRetry={fetchMyBookings} />}

      {/* Content Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching your reservations..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No reservations found"
          description={
            filterTab === 'all'
              ? 'You have not booked any parking slots yet. Explore community slots to reserve one.'
              : `You have no ${filterTab} reservations at the moment.`
          }
          actionLabel="Explore Parking Slots"
          actionLink="/slots"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBookings.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              isReceivedView={false}
              onPay={(booking) => setPayingBooking(booking)}
              onCancel={(booking) => setCancellingBooking(booking)}
            />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={Boolean(payingBooking)}
        booking={payingBooking}
        onClose={() => setPayingBooking(null)}
        onPaid={handlePaymentSuccess}
      />

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={Boolean(cancellingBooking)}
        booking={cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        onCancelled={handleCancellationSuccess}
      />
    </div>
  );
}

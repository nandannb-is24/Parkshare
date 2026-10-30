import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, ParkingSquare, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import BookingCard from '../../components/bookings/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function ReceivedBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReceivedBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/received');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching received bookings:', err);
      setError('Unable to load received bookings on your slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceivedBookings();
  }, [fetchReceivedBookings]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Received Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reservations made by neighbors on parking spaces listed by you.
          </p>
        </div>
        <Link
          to="/slots/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Another Slot</span>
        </Link>
      </div>

      {/* Error Banner */}
      {error && <ErrorMessage message={error} onRetry={fetchReceivedBookings} />}

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading incoming reservations on your slots..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No bookings received yet"
          description="When other society residents reserve your parking space, their booking details and arrival times will appear here."
          actionLabel="Manage My Slots"
          actionLink="/my-slots"
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500">
            Total incoming bookings: <strong className="text-slate-800">{bookings.length}</strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                isReceivedView={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

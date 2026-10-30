import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Car,
  Bike,
  MapPin,
  Building,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import PaymentModal from '../../components/bookings/PaymentModal';

export default function BookSlot() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Helper to format ISO for datetime-local
  const toLocalISO = (d) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchSlot = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/slots/${id}`);
        if (res.data.success) {
          const s = res.data.slot;
          setSlot(s);

          // Calculate reasonable initial start and end times within slot window
          const slotStart = new Date(s.availableFrom);
          const now = new Date();
          // Pick start: max of now+30mins or slotStart
          const initialStart = new Date(Math.max(now.getTime() + 30 * 60 * 1000, slotStart.getTime()));
          const initialEnd = new Date(initialStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours

          setStartTime(toLocalISO(initialStart));
          setEndTime(toLocalISO(initialEnd));
        }
      } catch (err) {
        console.error('Error fetching slot:', err);
        setError(err.response?.data?.message || 'Slot not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlot();
  }, [id]);

  // Compute duration and estimated price
  const calculateEstimate = () => {
    if (!startTime || !endTime || !slot) return { hours: 0, estimate: 0 };
    const s = new Date(startTime);
    const e = new Date(endTime);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
      return { hours: 0, estimate: 0 };
    }
    const diffHours = (e - s) / (1000 * 60 * 60);
    const billedHours = Math.ceil(diffHours);
    const estimate = billedHours * (slot.pricePerHour || 0);
    return { hours: diffHours.toFixed(1), billedHours, estimate };
  };

  const { hours, billedHours, estimate } = calculateEstimate();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!startTime || !endTime) {
      setBookingError('Please select both start and end times.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start <= new Date()) {
      setBookingError('Start time must be in the future.');
      return;
    }

    if (end <= start) {
      setBookingError('End time must be after start time.');
      return;
    }

    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours < 1) {
      setBookingError('Minimum booking duration is 1 hour.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await api.post('/bookings', {
        slotId: id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      if (res.data.success) {
        setConfirmedBooking(res.data.booking);
      }
    } catch (err) {
      console.error('Booking creation error:', err);
      // HTTP 409 Conflict handling or validation error
      if (err.response?.status === 409) {
        setBookingError('Conflict: This slot is already booked for the selected time window. Please choose another slot or time.');
      } else {
        setBookingError(err.response?.data?.message || 'Failed to complete booking.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading parking reservation details..." />;
  }

  if (error || !slot) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4">
        <ErrorMessage message={error || 'Parking slot not found.'} />
        <Link
          to="/slots"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parking Search</span>
        </Link>
      </div>
    );
  }

  const isBike = slot.vehicleType === 'bike';
  const VehicleIcon = isBike ? Bike : Car;

  // Render Confirmation Screen upon successful booking
  if (confirmedBooking) {
    return (
      <div className="max-w-xl mx-auto py-8 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Booking Confirmed
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
              Your Parking Space is Reserved!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Slot {slot.slotNumber} · {slot.location}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Server-Confirmed Total</span>
              <span className="text-xl font-extrabold text-slate-900">
                ₹{confirmedBooking.totalAmount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Booking Status</span>
              <span className="font-bold text-emerald-700 capitalize">{confirmedBooking.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment Status</span>
              <span className="font-bold text-amber-700 capitalize">{confirmedBooking.paymentStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Reservation Start</span>
              <span className="font-semibold text-slate-800">
                {new Date(confirmedBooking.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Reservation End</span>
              <span className="font-semibold text-slate-800">
                {new Date(confirmedBooking.endTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Make Demo Payment (₹{confirmedBooking.totalAmount})</span>
            </button>
            <Link
              to="/my-bookings"
              className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              View in My Bookings
            </Link>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          booking={confirmedBooking}
          onClose={() => setShowPaymentModal(false)}
          onPaid={(updated) => {
            setConfirmedBooking(updated);
            setShowPaymentModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Link */}
      <Link
        to={`/slots/${id}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Slot Details</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        {/* Header Summary */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isBike ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'
              }`}
            >
              <VehicleIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Reserve Slot {slot.slotNumber}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{slot.location}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Rate</span>
            <span className="text-xl font-extrabold text-slate-900">₹{slot.pricePerHour}</span>
            <span className="text-xs text-slate-500 font-normal"> / hr</span>
          </div>
        </div>

        {/* Conflict / Backend Error Banner */}
        {bookingError && (
          <div className="my-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold mb-0.5">Reservation Conflict / Validation Error</strong>
              {bookingError}
            </div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label htmlFor="startTime" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reservation Start Time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                required
                disabled={bookingLoading}
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (bookingError) setBookingError('');
                }}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none bg-white transition-all"
              />
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="endTime" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reservation End Time
              </label>
              <input
                id="endTime"
                type="datetime-local"
                required
                disabled={bookingLoading}
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (bookingError) setBookingError('');
                }}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none bg-white transition-all"
              />
            </div>
          </div>

          {/* Pricing Estimation Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Selected Duration</span>
              <span className="font-bold text-slate-800">
                {hours > 0 ? `${hours} hrs (billed as ${billedHours} hr${billedHours === 1 ? '' : 's'})` : 'Invalid Range'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Hourly Rate</span>
              <span>₹{slot.pricePerHour} / hr</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>Estimated Amount</span>
              <span className="text-brand-700 font-extrabold text-base">₹{estimate}</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 leading-normal">
              * Final charge is calculated and confirmed by the backend: Math.ceil(duration in hours) × ₹{slot.pricePerHour}.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={bookingLoading || estimate <= 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Slot Availability...</span>
              </>
            ) : (
              <span>Confirm & Book Parking Slot</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


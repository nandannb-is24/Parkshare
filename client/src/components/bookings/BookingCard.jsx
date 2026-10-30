import React from 'react';
import { Calendar, Clock, MapPin, Car, Bike, User, CreditCard, XCircle } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

export default function BookingCard({
  booking,
  isReceivedView = false,
  onPay,
  onCancel,
}) {
  if (!booking) return null;

  const isBike = booking.slot?.vehicleType === 'bike';
  const VehicleIcon = isBike ? Bike : Car;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Cancellation is only allowed before start time according to backend rules
  const isCancellable =
    booking.status === 'confirmed' &&
    new Date() < new Date(booking.startTime);

  // Payment is allowed if confirmed and pending, and before endTime
  const isPayable =
    booking.status === 'confirmed' &&
    booking.paymentStatus === 'pending' &&
    new Date() <= new Date(booking.endTime);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isBike ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'
              }`}
            >
              <VehicleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Slot {booking.slot?.slotNumber}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider capitalize">
                {booking.slot?.vehicleType || 'Car'} Space
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} method={booking.paymentMethod} size="xs" />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-slate-600 text-xs mb-4">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{booking.slot?.location}</span>
        </div>

        {/* Schedule & Timing Info */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Reservation Window</span>
            <span className="font-bold text-slate-800 text-sm">
              ₹{booking.totalAmount}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Start Time</span>
              <span className="font-semibold">{formatDate(booking.startTime)} · {formatTime(booking.startTime)}</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">End Time</span>
              <span className="font-semibold">{formatDate(booking.endTime)} · {formatTime(booking.endTime)}</span>
            </div>
          </div>
        </div>

        {/* Booker info if in Received Bookings view */}
        {isReceivedView && booking.user && (
          <div className="p-3 rounded-xl bg-brand-50/40 border border-brand-100/60 text-xs mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">{booking.user.name}</p>
                <p className="text-[11px] text-slate-500">Flat: {booking.user.flatNumber}</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">{booking.user.email}</span>
          </div>
        )}
      </div>

      {/* Action Footer (for My Bookings) */}
      {!isReceivedView && (isPayable || isCancellable) && (
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          {isPayable && (
            <button
              type="button"
              onClick={() => onPay && onPay(booking)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Now (₹{booking.totalAmount})</span>
            </button>
          )}

          {isCancellable && (
            <button
              type="button"
              onClick={() => onCancel && onCancel(booking)}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import api from '../../services/api';

export default function CancellationModal({ isOpen, booking, onClose, onCancelled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const isPaid = booking.paymentStatus === 'paid';

  const handleCancel = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/bookings/${booking._id}/cancel`);
      if (res.data.success) {
        onCancelled(res.data.booking);
        onClose();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking. It may have already started.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 animate-fadeIn">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Cancel Reservation?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Slot <strong className="text-slate-800">{booking.slot?.slotNumber}</strong> · {booking.slot?.location}
            </p>
          </div>
        </div>

        {isPaid ? (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-900 text-xs mb-5 flex items-start gap-2.5">
            <RotateCcw className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Simulated Refund Notice:</strong> This booking was previously paid (₹{booking.totalAmount}). Upon cancellation, your payment status will immediately update to <strong>Refunded</strong>.
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            Are you sure you want to cancel this booking? This will immediately free up the parking space for other community residents.
          </p>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Keep Reservation
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Cancellation</span>
          </button>
        </div>
      </div>
    </div>
  );
}


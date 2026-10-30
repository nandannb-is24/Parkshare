import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, CreditCard, Smartphone, Banknote, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function PaymentModal({ isOpen, booking, onClose, onPaid }) {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/bookings/${booking._id}/pay`, {
        paymentMethod,
      });

      if (res.data.success) {
        onPaid(res.data.booking);
        onClose();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Simulated payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'Instant virtual demo transfer' },
    { id: 'Card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'Simulated card transaction' },
    { id: 'Cash', label: 'Cash on Arrival', icon: Banknote, desc: 'Pay directly to parking host' },
  ];

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

        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Simulated Sandbox Payment
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2.5">
            Complete Reservation Payment
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Slot <strong className="text-slate-800">{booking.slot?.slotNumber}</strong> · {booking.slot?.location}
          </p>
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Demonstration Payment Only:</strong> No real money or bank accounts are debited. Do not enter actual card numbers or UPI PINs.
          </div>
        </div>

        {/* Amount to pay display */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Amount Due</span>
          <span className="text-2xl font-extrabold text-slate-900">
            ₹{booking.totalAmount}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Payment Methods Selection */}
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Demo Payment Mode
            </label>
            <div className="space-y-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>
                          {m.label}
                        </p>
                        <p className="text-[11px] text-slate-500">{m.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Demo Payment (₹{booking.totalAmount})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


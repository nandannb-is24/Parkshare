import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle2, RotateCcw, Clock, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import api from '../../services/api';
import PaymentStatusBadge from '../../components/bookings/PaymentStatusBadge';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/payments');
      if (res.data.success) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Unable to load payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review simulated payments, settled balances, and automatic refund records.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simulated Ledger</span>
        </span>
      </div>

      {/* Error Banner */}
      {error && <ErrorMessage message={error} onRetry={fetchPayments} />}

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Retrieving payment transaction records..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No transaction records"
          description="Your completed and refunded simulated parking transactions will be recorded here."
          actionLabel="View My Bookings"
          actionLink="/my-bookings"
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500">
            Total records: <strong className="text-slate-800">{payments.length}</strong>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Booking / Slot</th>
                    <th className="py-3.5 px-4">Period</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Mode</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Paid At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          Slot {p.slot?.slotNumber || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {p.slot?.location}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        <div>{formatDate(p.startTime)}</div>
                        <div className="text-[11px] text-slate-400">to {formatDate(p.endTime)}</div>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                        ₹{p.totalAmount}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-700">
                          {p.paymentMethod || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <PaymentStatusBadge status={p.paymentStatus} method={p.paymentMethod} size="xs" />
                      </td>
                      <td className="py-4 px-4 text-[11px] text-slate-500">
                        {p.paidAt ? formatDate(p.paidAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {payments.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2.5 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Slot {p.slot?.slotNumber || 'N/A'}
                    </h4>
                    <p className="text-[11px] text-slate-400">{p.slot?.location}</p>
                  </div>
                  <PaymentStatusBadge status={p.paymentStatus} method={p.paymentMethod} size="xs" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Total Billed</span>
                  <span className="font-bold text-slate-900 text-sm">₹{p.totalAmount}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Method</span>
                  <span className="font-semibold text-slate-700">{p.paymentMethod || 'Pending'}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Paid At</span>
                  <span>{p.paidAt ? formatDate(p.paidAt) : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

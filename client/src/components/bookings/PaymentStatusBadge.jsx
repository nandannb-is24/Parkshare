import React from 'react';
import { CheckCircle, Clock, RotateCcw } from 'lucide-react';

export default function PaymentStatusBadge({ status, method, size = 'sm' }) {
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (status === 'paid') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 ${sizeClasses}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Paid {method ? `(${method})` : ''}</span>
      </span>
    );
  }

  if (status === 'refunded') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-sky-50 text-sky-700 border-sky-200 ${sizeClasses}`}>
        <RotateCcw className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span>Refunded</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200 ${sizeClasses}`}>
      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span>Payment Pending</span>
    </span>
  );
}


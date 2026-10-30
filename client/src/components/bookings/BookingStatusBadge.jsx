import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function BookingStatusBadge({ status, size = 'sm' }) {
  const isConfirmed = status === 'confirmed';
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClasses} ${
        isConfirmed
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      {isConfirmed ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
      )}
      <span className="capitalize">{status || 'confirmed'}</span>
    </span>
  );
}


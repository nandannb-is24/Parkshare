import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const isActive = status === 'active';
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClasses} ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
      />
      <span className="capitalize">{status || 'inactive'}</span>
    </span>
  );
}


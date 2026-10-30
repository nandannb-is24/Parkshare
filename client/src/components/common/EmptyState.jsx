import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  actionLink,
  onAction,
}) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}


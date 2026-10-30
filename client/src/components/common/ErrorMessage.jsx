import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-sm flex items-start justify-between gap-3 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
        <div>
          <p className="font-semibold text-rose-900">Error</p>
          <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-rose-700 border border-rose-200 hover:bg-rose-100/50 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}


import React from 'react';
import { Filter, RotateCcw, Car, Bike, Sparkles } from 'lucide-react';

export default function FilterPanel({
  vehicleType = '',
  minPrice = '',
  maxPrice = '',
  onVehicleChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}) {
  const hasActiveFilters = Boolean(vehicleType || minPrice || maxPrice);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Filter className="w-3.5 h-3.5 text-brand-600" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Vehicle Type Switcher */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Vehicle Type
          </label>
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => onVehicleChange('')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                vehicleType === ''
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onVehicleChange('car')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                vehicleType === 'car'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Car</span>
            </button>
            <button
              type="button"
              onClick={() => onVehicleChange('bike')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                vehicleType === 'bike'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Bike</span>
            </button>
          </div>
        </div>

        {/* Min Price */}
        <div>
          <label htmlFor="minPrice" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Min Price (₹ / hr)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400 font-medium">₹</span>
            <input
              id="minPrice"
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0"
              className="block w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="maxPrice" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Max Price (₹ / hr)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400 font-medium">₹</span>
            <input
              id="maxPrice"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="500"
              className="block w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


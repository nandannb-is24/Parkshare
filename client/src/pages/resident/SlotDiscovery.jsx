import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, PlusCircle, ParkingSquare, Sparkles } from 'lucide-react';
import api from '../../services/api';
import ParkingSlotCard from '../../components/slots/ParkingSlotCard';
import SearchBar from '../../components/slots/SearchBar';
import FilterPanel from '../../components/slots/FilterPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function SlotDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL query parameters
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [vehicleType, setVehicleType] = useState(searchParams.get('vehicleType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch slots matching current filter parameters
  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (location.trim()) params.location = location.trim();
      if (vehicleType) params.vehicleType = vehicleType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      // Update URL search query params
      setSearchParams(params, { replace: true });

      const res = await api.get('/slots', { params });
      if (res.data.success) {
        setSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Unable to load available parking slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location, vehicleType, minPrice, maxPrice, setSearchParams]);

  // Debounced search trigger when filter values change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSlots();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchSlots]);

  const handleResetFilters = () => {
    setLocation('');
    setVehicleType('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Find Parking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and reserve available slots shared by verified community residents.
          </p>
        </div>
        <Link
          to="/slots/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List a Parking Slot</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchBar
          value={location}
          onChange={setLocation}
          onClear={() => setLocation('')}
          placeholder="Search by block, wing, floor or building..."
        />

        <FilterPanel
          vehicleType={vehicleType}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onVehicleChange={setVehicleType}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onReset={handleResetFilters}
        />
      </div>

      {/* Error state */}
      {error && <ErrorMessage message={error} onRetry={fetchSlots} />}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-800">{slots.length}</strong> available parking space{slots.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <LoadingSpinner message="Searching for available parking spaces..." />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={ParkingSquare}
          title="No slots match your search"
          description="Try broadening your location search, adjusting your price range, or clearing filters."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slots.map((slot) => (
            <ParkingSlotCard key={slot._id} slot={slot} />
          ))}
        </div>
      )}
    </div>
  );
}


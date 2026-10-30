import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Car, Bike, AlertCircle, Loader2, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function CreateSlot() {
  const navigate = useNavigate();

  // Helper: Default from = now + 1 hour, to = now + 24 hours
  const getDefaultDates = () => {
    const now = new Date();
    const from = new Date(now.getTime() + 60 * 60 * 1000);
    const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const toLocalISO = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    return {
      availableFrom: toLocalISO(from),
      availableTo: toLocalISO(to),
    };
  };

  const [formData, setFormData] = useState({
    slotNumber: '',
    location: '',
    vehicleType: 'car',
    pricePerHour: '',
    ...getDefaultDates(),
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.slotNumber.trim() || !formData.location.trim()) {
      setError('Slot number and parking location are required.');
      return;
    }

    const price = Number(formData.pricePerHour);
    if (isNaN(price) || price < 1) {
      setError('Price per hour must be at least ₹1.');
      return;
    }

    const fromDate = new Date(formData.availableFrom);
    const toDate = new Date(formData.availableTo);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      setError('Please provide valid availability start and end dates.');
      return;
    }

    if (toDate <= fromDate) {
      setError('Availability end date must be after the start date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/slots', {
        slotNumber: formData.slotNumber.trim(),
        location: formData.location.trim(),
        vehicleType: formData.vehicleType,
        pricePerHour: price,
        availableFrom: fromDate.toISOString(),
        availableTo: toDate.toISOString(),
        status: 'active',
      });

      if (res.data.success) {
        navigate('/my-slots', { replace: true });
      }
    } catch (err) {
      console.error('Error creating slot:', err);
      setError(err.response?.data?.message || 'Unable to list parking slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Navigation Breadcrumb */}
      <Link
        to="/my-slots"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Parking Slots</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              List a Parking Slot
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Share your allocated apartment parking space with other society members.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div className="font-medium text-xs leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slot Number */}
            <div>
              <label htmlFor="slotNumber" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Slot Number / Identifier
              </label>
              <input
                id="slotNumber"
                type="text"
                name="slotNumber"
                required
                disabled={loading}
                value={formData.slotNumber}
                onChange={handleChange}
                placeholder="e.g. A-42 or B2-15"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label htmlFor="vehicleType" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Eligible Vehicle
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, vehicleType: 'car' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    formData.vehicleType === 'car'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Car Slot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, vehicleType: 'bike' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    formData.vehicleType === 'bike'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Bike Slot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Location Description */}
          <div>
            <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Specific Location in Society
            </label>
            <input
              id="location"
              type="text"
              name="location"
              required
              disabled={loading}
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Tower 3 Basement Level 1, near Pillar C-12"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Price Per Hour */}
          <div>
            <label htmlFor="pricePerHour" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Price per Hour (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm font-semibold">
                ₹
              </span>
              <input
                id="pricePerHour"
                type="number"
                min="1"
                step="1"
                name="pricePerHour"
                required
                disabled={loading}
                value={formData.pricePerHour}
                onChange={handleChange}
                placeholder="50"
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Availability Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="availableFrom" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Available From
              </label>
              <input
                id="availableFrom"
                type="datetime-local"
                name="availableFrom"
                required
                disabled={loading}
                value={formData.availableFrom}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label htmlFor="availableTo" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Available Until
              </label>
              <input
                id="availableTo"
                type="datetime-local"
                name="availableTo"
                required
                disabled={loading}
                value={formData.availableTo}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all bg-white"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/my-slots"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Publish Parking Slot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


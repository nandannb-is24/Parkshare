import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function SlotEditModal({ isOpen, slot, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    slotNumber: '',
    location: '',
    vehicleType: 'car',
    pricePerHour: '',
    availableFrom: '',
    availableTo: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Format ISO date into HTML datetime-local format (YYYY-MM-DDTHH:mm)
  const toLocalISO = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (slot) {
      setFormData({
        slotNumber: slot.slotNumber || '',
        location: slot.location || '',
        vehicleType: slot.vehicleType || 'car',
        pricePerHour: slot.pricePerHour !== undefined ? slot.pricePerHour : '',
        availableFrom: toLocalISO(slot.availableFrom),
        availableTo: toLocalISO(slot.availableTo),
        status: slot.status || 'active',
      });
      setError('');
    }
  }, [slot]);

  if (!isOpen || !slot) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.slotNumber.trim() || !formData.location.trim()) {
      setError('Slot number and location are required.');
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
      setError('Please provide valid availability dates.');
      return;
    }

    if (toDate <= fromDate) {
      setError('Available Until must be after Available From.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/slots/${slot._id}`, {
        slotNumber: formData.slotNumber.trim(),
        location: formData.location.trim(),
        vehicleType: formData.vehicleType,
        pricePerHour: price,
        availableFrom: fromDate.toISOString(),
        availableTo: toDate.toISOString(),
        status: formData.status,
      });

      if (res.data.success) {
        onUpdated(res.data.slot);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update parking slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-fadeIn">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          Edit Slot {slot.slotNumber}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Update parking location, availability, or rate details.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="slotNumber" className="block text-xs font-semibold text-slate-600 mb-1">
                Slot Number
              </label>
              <input
                id="slotNumber"
                type="text"
                name="slotNumber"
                required
                disabled={loading}
                value={formData.slotNumber}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="vehicleType" className="block text-xs font-semibold text-slate-600 mb-1">
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none capitalize bg-white"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-semibold text-slate-600 mb-1">
              Location / Wing
            </label>
            <input
              id="location"
              type="text"
              name="location"
              required
              disabled={loading}
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pricePerHour" className="block text-xs font-semibold text-slate-600 mb-1">
                Price (₹ / hour)
              </label>
              <input
                id="pricePerHour"
                type="number"
                min="1"
                name="pricePerHour"
                required
                disabled={loading}
                value={formData.pricePerHour}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-slate-600 mb-1">
                Listing Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none capitalize bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="availableFrom" className="block text-xs font-semibold text-slate-600 mb-1">
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="availableTo" className="block text-xs font-semibold text-slate-600 mb-1">
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


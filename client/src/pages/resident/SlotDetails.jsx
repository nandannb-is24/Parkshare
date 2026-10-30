import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Bike,
  MapPin,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function SlotDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookNotice, setBookNotice] = useState(false);

  useEffect(() => {
    const fetchSlot = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/slots/${id}`);
        if (res.data.success) {
          setSlot(res.data.slot);
        }
      } catch (err) {
        console.error('Error fetching slot details:', err);
        setError(err.response?.data?.message || 'Slot not found or invalid slot identifier.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlot();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Loading parking slot details..." />;
  }

  if (error || !slot) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4">
        <ErrorMessage message={error || 'Parking slot not found.'} />
        <Link
          to="/slots"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parking Discovery</span>
        </Link>
      </div>
    );
  }

  const isBike = slot.vehicleType === 'bike';
  const VehicleIcon = isBike ? Bike : Car;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Parking Search</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isBike ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'
              }`}
            >
              <VehicleIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Slot {slot.slotNumber}
                </h1>
                <StatusBadge status={slot.status} />
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider capitalize mt-0.5">
                Dedicated {slot.vehicleType} Space
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hourly Rate</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
              ₹{slot.pricePerHour}
              <span className="text-xs font-normal text-slate-500 ml-1">/ hour</span>
            </p>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Location in Society</span>
            </div>
            <p className="text-sm font-bold text-slate-800">{slot.location}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Building className="w-4 h-4 text-brand-600" />
              <span>Owner & Residence</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {slot.owner?.name || 'Resident'}
              <span className="font-normal text-slate-500 ml-1.5">
                (Flat {slot.owner?.flatNumber || 'N/A'})
              </span>
            </p>
          </div>
        </div>

        {/* Availability Schedule */}
        <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100 mb-6">
          <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Availability Window</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Available From:</span>
              <span className="font-bold text-slate-800 text-sm">
                {formatDate(slot.availableFrom)} at {formatTime(slot.availableFrom)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Available Until:</span>
              <span className="font-bold text-slate-800 text-sm">
                {formatDate(slot.availableTo)} at {formatTime(slot.availableTo)}
              </span>
            </div>
          </div>
        </div>

        {/* Booking CTA Link */}
        <div>
          <Link
            to={`/slots/${slot._id}/book`}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all"
          >
            <span>Proceed to Book This Slot</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


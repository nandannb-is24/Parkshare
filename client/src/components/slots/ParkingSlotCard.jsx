import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Bike, MapPin, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function ParkingSlotCard({ slot, isOwnerView = false, onEdit, onDelete }) {
  if (!slot) return null;

  const isBike = slot.vehicleType === 'bike';
  const VehicleIcon = isBike ? Bike : Car;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isBike ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'
              }`}
            >
              <VehicleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Slot {slot.slotNumber}
              </h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 capitalize">
                {slot.vehicleType} Parking
              </span>
            </div>
          </div>
          <StatusBadge status={slot.status} />
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-slate-600 text-xs mb-3.5">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{slot.location}</span>
        </div>

        {/* Price & Availability details */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/80 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hourly Rate</span>
            <span className="font-bold text-slate-900 text-sm">
              ₹{slot.pricePerHour} <span className="text-xs font-normal text-slate-500">/ hr</span>
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              <span>{formatDate(slot.availableFrom)}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>{formatDate(slot.availableTo)}</span>
            </div>
          </div>
        </div>

        {/* Owner details (if populated) */}
        {slot.owner && typeof slot.owner === 'object' && slot.owner.name && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-4 px-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Listed by <strong className="text-slate-700">{slot.owner.name}</strong> ({slot.owner.flatNumber})
            </span>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="pt-2 border-t border-slate-100">
        {isOwnerView ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit && onEdit(slot)}
              className="flex-1 py-2 px-3 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors text-center"
            >
              Edit Slot
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(slot)}
              className="py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors text-center"
            >
              Delete
            </button>
          </div>
        ) : (
          <Link
            to={`/slots/${slot._id}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 group-hover:shadow-md transition-all"
          >
            <span>View & Book</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}


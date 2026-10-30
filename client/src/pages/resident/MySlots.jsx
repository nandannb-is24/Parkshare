import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ParkingSquare, Trash2, Edit3, Car } from 'lucide-react';
import api from '../../services/api';
import ParkingSlotCard from '../../components/slots/ParkingSlotCard';
import SlotEditModal from '../../components/slots/SlotEditModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function MySlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [editingSlot, setEditingSlot] = useState(null);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMySlots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/slots/mine');
      if (res.data.success) {
        setSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error('Error fetching my slots:', err);
      setError('Unable to load your listed parking slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMySlots();
  }, [fetchMySlots]);

  // Handle delete execution
  const handleDeleteConfirm = async () => {
    if (!deletingSlot) return;
    setDeleteLoading(true);

    try {
      const res = await api.delete(`/slots/${deletingSlot._id}`);
      if (res.data.success) {
        setDeletingSlot(null);
        await fetchMySlots();
      }
    } catch (err) {
      console.error('Error deleting slot:', err);
      setError(err.response?.data?.message || 'Failed to delete parking slot.');
      setDeletingSlot(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSlotUpdated = (updatedSlot) => {
    setSlots((prev) =>
      prev.map((s) => (s._id === updatedSlot._id ? updatedSlot : s))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Parking Slots</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your listed parking spaces, edit availability, and monitor active listings.
          </p>
        </div>
        <Link
          to="/slots/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-500/20 hover:shadow-lg transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Slot</span>
        </Link>
      </div>

      {/* Error Banner */}
      {error && <ErrorMessage message={error} onRetry={fetchMySlots} />}

      {/* Main Content */}
      {loading ? (
        <LoadingSpinner message="Loading your parking slots..." />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={ParkingSquare}
          title="You haven't listed any slots yet"
          description="Monetize your empty parking slot by sharing it with society residents while you're away."
          actionLabel="List Your First Slot"
          actionLink="/slots/create"
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500">
            You have listed <strong className="text-slate-800">{slots.length}</strong> parking slot{slots.length === 1 ? '' : 's'}:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {slots.map((slot) => (
              <ParkingSlotCard
                key={slot._id}
                slot={slot}
                isOwnerView={true}
                onEdit={(s) => setEditingSlot(s)}
                onDelete={(s) => setDeletingSlot(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      <SlotEditModal
        isOpen={Boolean(editingSlot)}
        slot={editingSlot}
        onClose={() => setEditingSlot(null)}
        onUpdated={handleSlotUpdated}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingSlot)}
        title="Delete Parking Slot?"
        message={`Are you sure you want to delete Slot ${deletingSlot?.slotNumber}? This action cannot be undone.`}
        confirmLabel="Delete Slot"
        cancelLabel="Keep Slot"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingSlot(null)}
      />
    </div>
  );
}


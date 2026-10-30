const mongoose = require('mongoose');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// Helper: detect an invalid Mongo ObjectId string
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: normalise Mongoose / custom errors into a 400 response
const handleValidationError = (err, res) => {
  if (err.code === 11000) {
    // Duplicate key on compound index { owner, slotNumber }
    return res.status(409).json({
      success: false,
      message: 'You already have a slot with that slot number',
    });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  // Date-range error thrown from pre-save hook
  if (err.message && err.message.includes('availableTo must be after')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error('slot error:', err);
  return res.status(500).json({ success: false, message: 'Server error' });
};

// POST /api/slots
// Protected. Creates a slot owned by the authenticated user.
const createSlot = async (req, res) => {
  try {
    // owner is always set from the verified JWT - never from req.body
    const { slotNumber, location, vehicleType, pricePerHour, availableFrom, availableTo, status } =
      req.body;

    if (!slotNumber || !location || pricePerHour === undefined || !availableFrom || !availableTo) {
      return res.status(400).json({
        success: false,
        message: 'slotNumber, location, pricePerHour, availableFrom and availableTo are all required',
      });
    }

    const slot = await Slot.create({
      owner: req.user._id,
      slotNumber,
      location,
      vehicleType,
      pricePerHour,
      availableFrom,
      availableTo,
      status,
    });

    return res.status(201).json({ success: true, slot });
  } catch (err) {
    return handleValidationError(err, res);
  }
};

// GET /api/slots
// Protected. Returns active slots that do NOT belong to the logged-in user.
// Supports query filters: vehicleType, location (case-insensitive), minPrice, maxPrice.
const getSlots = async (req, res) => {
  try {
    const { vehicleType, location, minPrice, maxPrice } = req.query;

    const filter = {
      status: 'active',
      owner: { $ne: req.user._id }, // exclude own slots
    };

    if (vehicleType) filter.vehicleType = vehicleType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    const slots = await Slot.find(filter)
      .populate('owner', 'name flatNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: slots.length, slots });
  } catch (err) {
    console.error('getSlots error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/slots/mine
// Protected. Returns all slots owned by the authenticated user.
const getMySlots = async (req, res) => {
  try {
    const slots = await Slot.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: slots.length, slots });
  } catch (err) {
    console.error('getMySlots error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/slots/:id
// Protected. Returns a single slot by ID.
const getSlotById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid slot ID' });
    }

    const slot = await Slot.findById(req.params.id).populate('owner', 'name flatNumber');
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    return res.status(200).json({ success: true, slot });
  } catch (err) {
    console.error('getSlotById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/slots/:id
// Protected. Only the slot owner or an admin can update.
// owner field is stripped from the update payload.
const updateSlot = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid slot ID' });
    }

    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    // Ownership / admin check
    const isOwner = slot.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to update this slot' });
    }

    // Strip owner from update payload - it must never change via API
    const { owner: _ignored, ...allowedUpdates } = req.body;

    // Validate date range if both dates are being updated
    const newFrom = allowedUpdates.availableFrom
      ? new Date(allowedUpdates.availableFrom)
      : slot.availableFrom;
    const newTo = allowedUpdates.availableTo
      ? new Date(allowedUpdates.availableTo)
      : slot.availableTo;
    if (newTo <= newFrom) {
      return res
        .status(400)
        .json({ success: false, message: 'availableTo must be after availableFrom' });
    }

    const updated = await Slot.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, slot: updated });
  } catch (err) {
    return handleValidationError(err, res);
  }
};

// DELETE /api/slots/:id
// Protected. Only the slot owner or an admin can delete.
// Protected against deletion if slot has future confirmed bookings.
const deleteSlot = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid slot ID' });
    }

    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    const isOwner = slot.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this slot' });
    }

    // Protect against deleting slot if it has active or future confirmed bookings
    const futureBooking = await Booking.findOne({
      slot: req.params.id,
      status: 'confirmed',
      endTime: { $gt: new Date() },
    });

    if (futureBooking) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slot with future confirmed bookings',
      });
    }

    await slot.deleteOne();
    return res.status(200).json({ success: true, message: 'Slot deleted successfully' });
  } catch (err) {
    console.error('deleteSlot error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createSlot, getSlots, getMySlots, getSlotById, updateSlot, deleteSlot };


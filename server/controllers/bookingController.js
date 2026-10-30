const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Slot    = require('../models/Slot');

// Helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/bookings
// Protected. Creates a booking for the authenticated user.
// totalAmount, user and paymentStatus are NEVER sourced from req.body.
const createBooking = async (req, res) => {
  try {
    const { slotId, startTime, endTime } = req.body;

    // 1. Presence checks
    if (!slotId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'slotId, startTime and endTime are all required',
      });
    }

    // 2. Validate slotId format
    if (!isValidObjectId(slotId)) {
      return res.status(400).json({ success: false, message: 'Invalid slot ID' });
    }

    // 3. Parse and validate times
    const start = new Date(startTime);
    const end   = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format for startTime or endTime' });
    }

    if (start <= Date.now()) {
      return res.status(400).json({ success: false, message: 'startTime must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'endTime must be after startTime' });
    }

    const durationMs   = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours < 1) {
      return res.status(400).json({ success: false, message: 'Minimum booking duration is 1 hour' });
    }

    // 4. Fetch and validate the slot
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This slot is not available for booking' });
    }

    // 5. Cannot book own slot
    if (slot.owner.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot book your own slot' });
    }

    // 6. Booking must fall within slot availability window
    if (start < slot.availableFrom || end > slot.availableTo) {
      return res.status(400).json({
        success: false,
        message: `Booking must be within the slot availability window (${slot.availableFrom.toISOString()} - ${slot.availableTo.toISOString()})`,
      });
    }

    // 7. Overlap check: any CONFIRMED booking that overlaps [start, end)
    //   Overlap condition: existingStart < end  AND  existingEnd > start
    const overlap = await Booking.findOne({
      slot: slotId,
      status: 'confirmed',
      startTime: { $lt: end },
      endTime:   { $gt: start },
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'This slot is already booked for the requested time period',
      });
    }

    // 8. Server-side price calculation
    const totalAmount = Math.ceil(durationHours) * slot.pricePerHour;

    // 9. Create booking: user set from JWT, not from request body
    const booking = await Booking.create({
      slot:        slotId,
      user:        req.user._id,   // always from JWT
      startTime:   start,
      endTime:     end,
      totalAmount,                 // always server-calculated
      // status defaults to 'confirmed', paymentStatus defaults to 'pending'
    });

    // Populate for a rich response
    await booking.populate([
      { path: 'slot', select: 'slotNumber location vehicleType pricePerHour' },
      { path: 'user', select: 'name email flatNumber' },
    ]);

    return res.status(201).json({ success: true, booking });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('createBooking error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/mine
// Protected. Returns all bookings made by the authenticated user.
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('slot', 'slotNumber location vehicleType pricePerHour owner')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('getMyBookings error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/received
// Protected. Returns all bookings for slots owned by the authenticated user.
const getReceivedBookings = async (req, res) => {
  try {
    // Find all slots owned by the requesting user
    const ownedSlotIds = await Slot.find({ owner: req.user._id }).distinct('_id');

    const bookings = await Booking.find({ slot: { $in: ownedSlotIds } })
      .populate('slot', 'slotNumber location vehicleType pricePerHour')
      .populate('user', 'name email flatNumber')  // expose booker details to slot owner
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('getReceivedBookings error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id/cancel
// Protected. Booking owner or admin can cancel before startTime.
// paid → refunded; pending stays pending.
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(id)
      .populate('slot', 'slotNumber location')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership / admin check
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to cancel this booking' });
    }

    // Already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Must cancel before startTime
    if (new Date() >= booking.startTime) {
      return res.status(400).json({
        success: false,
        message: 'Booking can only be cancelled before its start time',
      });
    }

    // Determine new paymentStatus
    const newPaymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : booking.paymentStatus;

    booking.status        = 'cancelled';
    booking.paymentStatus = newPaymentStatus;
    await booking.save();

    return res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('cancelBooking error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id/pay
// Protected. SIMULATED payment only - no real gateway.
// Booking owner or admin. Confirmed bookings only. Before endTime. No duplicates.
// paymentStatus, paidAt and totalAmount are NEVER sourced from the client.
const payBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    // Validate paymentMethod from body
    const VALID_METHODS = ['UPI', 'Card', 'Cash'];
    const { paymentMethod } = req.body;
    if (!paymentMethod || !VALID_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `paymentMethod is required and must be one of: ${VALID_METHODS.join(', ')}`,
      });
    }

    const booking = await Booking.findById(id)
      .populate('slot', 'slotNumber location pricePerHour')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership / admin check
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to pay for this booking' });
    }

    // Only confirmed bookings can be paid
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot pay for a cancelled booking' });
    }

    // Prevent duplicate payments
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking has already been paid' });
    }

    // Must pay before booking endTime
    if (new Date() > booking.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Payment window has expired - booking end time has passed',
      });
    }

    // Apply simulated payment: all fields set server-side
    booking.paymentStatus = 'paid';
    booking.paidAt        = new Date();   // server timestamp, never from client
    booking.paymentMethod = paymentMethod;
    await booking.save();

    return res.status(200).json({
      success: true,
      // Clearly label this as simulated
      message: '[SIMULATED] Payment processed successfully. No real transaction occurred.',
      booking,
    });
  } catch (err) {
    console.error('payBooking error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/payments
// Protected.
// Residents: see their own booking payment records.
// Admins: see all payment records.
const getPaymentHistory = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const bookings = await Booking.find(filter)
      .select('slot user startTime endTime totalAmount status paymentStatus paymentMethod paidAt createdAt')
      .populate('slot', 'slotNumber location vehicleType pricePerHour')
      .populate('user', 'name email flatNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, payments: bookings });
  } catch (err) {
    console.error('getPaymentHistory error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getReceivedBookings,
  cancelBooking,
  payBooking,
  getPaymentHistory,
};


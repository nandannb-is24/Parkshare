const mongoose = require('mongoose');

// Schema
const bookingSchema = new mongoose.Schema(
  {
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Slot is required'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    startTime: {
      type: Date,
      required: [true, 'startTime is required'],
    },

    endTime: {
      type: Date,
      required: [true, 'endTime is required'],
    },

    totalAmount: {
      type: Number,
      required: [true, 'totalAmount is required'],
      min: [1, 'totalAmount must be at least 1'],
    },

    status: {
      type: String,
      enum: { values: ['confirmed', 'cancelled'], message: 'status must be "confirmed" or "cancelled"' },
      default: 'confirmed',
    },

    paymentStatus: {
      type: String,
      enum: { values: ['pending', 'paid', 'refunded'], message: 'paymentStatus must be pending, paid or refunded' },
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: { values: ['UPI', 'Card', 'Cash'], message: 'paymentMethod must be UPI, Card or Cash' },
      // optional - set during payment phase
    },

    paidAt: {
      type: Date,
      // optional - set when payment is confirmed
    },
  },
  { timestamps: true }
);

// Index for fast overlap queries: slot + status + time range
bookingSchema.index({ slot: 1, status: 1, startTime: 1, endTime: 1 });

// Index for booking history lookups
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);


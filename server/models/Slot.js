const mongoose = require('mongoose');

// Schema
const slotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },

    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      trim: true,
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    vehicleType: {
      type: String,
      enum: { values: ['car', 'bike'], message: 'vehicleType must be "car" or "bike"' },
      default: 'car',
    },

    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [1, 'Price per hour must be at least 1'],
    },

    availableFrom: {
      type: Date,
      required: [true, 'availableFrom is required'],
    },

    availableTo: {
      type: Date,
      required: [true, 'availableTo is required'],
    },

    status: {
      type: String,
      enum: { values: ['active', 'inactive'], message: 'status must be "active" or "inactive"' },
      default: 'active',
    },
  },
  { timestamps: true }
);

// Compound unique index: one slot number per owner
slotSchema.index({ owner: 1, slotNumber: 1 }, { unique: true });

// Virtual/instance date-range validator
slotSchema.pre('save', function () {
  if (this.availableTo <= this.availableFrom) {
    throw new Error('availableTo must be after availableFrom');
  }
});

// Also validate on findOneAndUpdate paths
slotSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  const from = update.availableFrom || update.$set?.availableFrom;
  const to   = update.availableTo   || update.$set?.availableTo;
  if (from && to && new Date(to) <= new Date(from)) {
    throw new Error('availableTo must be after availableFrom');
  }
});

module.exports = mongoose.model('Slot', slotSchema);


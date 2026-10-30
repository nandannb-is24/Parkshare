const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by default queries
    },

    flatNumber: {
      type: String,
      required: [true, 'Flat number is required'],
      trim: true,
    },

    role: {
      type: String,
      enum: ['resident', 'admin'],
      default: 'resident',
    },
  },
  { timestamps: true }
);

// Pre-save hook: hash password before storing
// Mongoose 7+ async pre-hooks: do NOT call next(), just return/throw.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method: compare plain-text password with stored hash
userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

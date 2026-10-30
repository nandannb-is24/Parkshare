const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: sign a JWT for a given user id
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Helper: build a safe user object (no password)
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  flatNumber: user.flatNumber,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    // role is intentionally excluded - public registration is always 'resident'.
    // Admins must be promoted directly in the database by an existing admin.
    const { name, email, password, flatNumber } = req.body;

    // Basic presence validation
    if (!name || !email || !password || !flatNumber) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password and flatNumber are all required',
      });
    }

    // Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Create user - role is not sourced from req.body; schema default ('resident') applies.
    const user = await User.create({ name, email, password, flatNumber });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Explicitly select password (it is excluded by default via select:false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  // req.user is attached by the protect middleware - no DB call needed
  return res.status(200).json({ success: true, user: safeUser(req.user) });
};

module.exports = { register, login, getMe };


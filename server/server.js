const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const slotRoutes    = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes   = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Initialise Express
const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Slot routes
app.use('/api/slots', slotRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Payment history route
app.use('/api/payments', paymentRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus =
    dbState === 1
      ? 'connected'
      : dbState === 2
        ? 'connecting'
        : 'disconnected';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB(); // connect to MongoDB first
  app.listen(PORT, () => {
    console.log(`🚀 ParkShare server running on http://localhost:${PORT}`);
    console.log(`   Health check → http://localhost:${PORT}/api/health`);
  });
};

start();

const express = require('express');
const router  = express.Router();

const {
  createBooking,
  getMyBookings,
  getReceivedBookings,
  cancelBooking,
  payBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// All booking routes require authentication
router.use(protect);

// POST   /api/bookings - create a booking
router.post('/', createBooking);

// GET    /api/bookings/mine - bookings made by the logged-in user
router.get('/mine', getMyBookings);

// GET    /api/bookings/received - bookings received on own slots
router.get('/received', getReceivedBookings);

// PUT    /api/bookings/:id/cancel - cancel a booking (owner or admin)
router.put('/:id/cancel', cancelBooking);

// PUT    /api/bookings/:id/pay - simulated payment (owner or admin)
router.put('/:id/pay', payBooking);

module.exports = router;


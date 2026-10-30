const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  getStats,
  getUsers,
  getBookings,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, admin);

// GET /api/admin/stats - summary dashboard statistics
router.get('/stats', getStats);

// GET /api/admin/users - paginated user management
router.get('/users', getUsers);

// GET /api/admin/bookings - paginated booking management
router.get('/bookings', getBookings);

module.exports = router;


const express = require('express');
const router  = express.Router();

const { getPaymentHistory } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// GET /api/payments - resident sees own; admin sees all
router.get('/', protect, getPaymentHistory);

module.exports = router;


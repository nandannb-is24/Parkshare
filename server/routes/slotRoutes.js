const express = require('express');
const router = express.Router();

const {
  createSlot,
  getSlots,
  getMySlots,
  getSlotById,
  updateSlot,
  deleteSlot,
} = require('../controllers/slotController');
const { protect } = require('../middleware/auth');

// All slot routes require authentication
router.use(protect);

// POST   /api/slots - create a slot (owner = req.user)
router.post('/', createSlot);

// GET    /api/slots - list active slots (excluding own)
router.get('/', getSlots);

// GET    /api/slots/mine - list own slots
// NOTE: this route MUST be defined before /:id to avoid "mine" being treated as an ObjectId
router.get('/mine', getMySlots);

// GET    /api/slots/:id - get one slot
router.get('/:id', getSlotById);

// PUT    /api/slots/:id - update (owner or admin only)
router.put('/:id', updateSlot);

// DELETE /api/slots/:id - delete (owner or admin only)
router.delete('/:id', deleteSlot);

module.exports = router;


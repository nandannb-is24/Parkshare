const User = require('../models/User');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// Helper: Escape special regex characters to prevent regex injection / ReDoS
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// Helper: Validate and parse pagination parameters
const parsePagination = (query) => {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    const parsedPage = Number(query.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return { error: 'Invalid page number. Page must be a positive integer.' };
    }
    page = parsedPage;
  }

  if (query.limit !== undefined) {
    const parsedLimit = Number(query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return { error: 'Invalid limit. Limit must be an integer between 1 and 100.' };
    }
    limit = parsedLimit;
  }

  return { page, limit };
};

// GET /api/admin/stats
// Protected (Admin only). Aggregates user, slot, booking and revenue statistics.
const getStats = async (req, res) => {
  try {
    // 1. User stats aggregation
    const userAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalResidents: {
            $sum: { $cond: [{ $eq: ['$role', 'resident'] }, 1, 0] },
          },
          totalAdmins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] },
          },
        },
      },
    ]);

    const uStats = userAgg[0] || { totalUsers: 0, totalResidents: 0, totalAdmins: 0 };

    // 2. Slot stats aggregation
    const slotAgg = await Slot.aggregate([
      {
        $group: {
          _id: null,
          totalSlots: { $sum: 1 },
          activeSlots: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          inactiveSlots: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] },
          },
        },
      },
    ]);

    const sStats = slotAgg[0] || { totalSlots: 0, activeSlots: 0, inactiveSlots: 0 };

    // 3. Booking and financial stats aggregation
    const bookingAgg = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          // Retained revenue: bookings currently marked 'paid'
          totalPaidRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
          },
          // Pending payments amount
          totalPendingAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalAmount', 0] },
          },
          // Refunded payments amount
          totalRefundedAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, '$totalAmount', 0] },
          },
        },
      },
    ]);

    const bStats = bookingAgg[0] || {
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      totalPaidRevenue: 0,
      totalPendingAmount: 0,
      totalRefundedAmount: 0,
    };

    // Revenue calculations:
    // netRetainedRevenue: actual funds currently retained from paid bookings (excludes refunded)
    const netRetainedRevenue = bStats.totalPaidRevenue;
    const totalRefundedAmount = bStats.totalRefundedAmount;
    // grossPaidAmount: total gross funds received prior to any refunds
    const grossPaidAmount = netRetainedRevenue + totalRefundedAmount;
    const totalPendingAmount = bStats.totalPendingAmount;

    const statsData = {
      // User statistics
      totalUsers: uStats.totalUsers,
      totalResidents: uStats.totalResidents,
      totalAdmins: uStats.totalAdmins,

      // Slot statistics
      totalSlots: sStats.totalSlots,
      activeSlots: sStats.activeSlots,
      inactiveSlots: sStats.inactiveSlots,

      // Booking statistics
      totalBookings: bStats.totalBookings,
      confirmedBookings: bStats.confirmedBookings,
      cancelledBookings: bStats.cancelledBookings,

      // Financial statistics (clearly distinguishing gross vs net retained)
      totalPaidRevenue: netRetainedRevenue,
      netRetainedRevenue,
      grossPaidAmount,
      grossPaidRevenue: grossPaidAmount,
      totalPendingAmount,
      totalRefundedAmount,

      // Structured breakdowns
      users: {
        total: uStats.totalUsers,
        residents: uStats.totalResidents,
        admins: uStats.totalAdmins,
      },
      slots: {
        total: sStats.totalSlots,
        active: sStats.activeSlots,
        inactive: sStats.inactiveSlots,
      },
      bookings: {
        total: bStats.totalBookings,
        confirmed: bStats.confirmedBookings,
        cancelled: bStats.cancelledBookings,
      },
      financials: {
        netRetainedRevenue,
        totalPaidRevenue: netRetainedRevenue,
        grossPaidAmount,
        grossPaidRevenue: grossPaidAmount,
        totalRefundedAmount,
        totalPendingAmount,
      },
    };

    return res.status(200).json({
      success: true,
      stats: statsData,
      ...statsData,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving statistics' });
  }
};

// GET /api/admin/users
// Protected (Admin only). Returns paginated list of users with search and filter.
const getUsers = async (req, res) => {
  try {
    const { page, limit, error } = parsePagination(req.query);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const filter = {};

    // Filter by role
    if (req.query.role !== undefined) {
      const validRoles = ['resident', 'admin'];
      if (!validRoles.includes(req.query.role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role filter. Allowed values: ${validRoles.join(', ')}`,
        });
      }
      filter.role = req.query.role;
    }

    // Search by name or email
    if (req.query.search) {
      const escaped = escapeRegex(req.query.search.trim());
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    } else {
      if (req.query.name) {
        filter.name = { $regex: escapeRegex(req.query.name.trim()), $options: 'i' };
      }
      if (req.query.email) {
        filter.email = { $regex: escapeRegex(req.query.email.trim()), $options: 'i' };
      }
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('name email flatNumber role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      users,
    });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

// GET /api/admin/bookings
// Protected (Admin only). Returns paginated list of all bookings with filters.
const getBookings = async (req, res) => {
  try {
    const { page, limit, error } = parsePagination(req.query);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const filter = {};

    // Filter by booking status
    if (req.query.status !== undefined) {
      const validStatuses = ['confirmed', 'cancelled'];
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed values: ${validStatuses.join(', ')}`,
        });
      }
      filter.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus !== undefined) {
      const validPaymentStatuses = ['pending', 'paid', 'refunded'];
      if (!validPaymentStatuses.includes(req.query.paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid paymentStatus filter. Allowed values: ${validPaymentStatuses.join(', ')}`,
        });
      }
      filter.paymentStatus = req.query.paymentStatus;
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('user', 'name email flatNumber role')
      .populate('slot', 'slotNumber location vehicleType pricePerHour')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      bookings,
    });
  } catch (err) {
    console.error('getBookings error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving bookings' });
  }
};

module.exports = {
  getStats,
  getUsers,
  getBookings,
};


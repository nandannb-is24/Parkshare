/**
 * admin middleware
 * ----------------
 * Verifies that the authenticated user (attached to req.user by protect middleware)
 * has the 'admin' role.
 *
 * Never trusts role values from the request body or headers.
 * Returns 403 if the user is not an administrator.
 */
const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
  next();
};

module.exports = { admin, requireAdmin: admin };


const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * -------
 * Verifies the Bearer JWT from the Authorization header.
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorised - no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB (excludes password via select:false on schema)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorised - user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorised - invalid or expired token' });
  }
};

module.exports = { protect };


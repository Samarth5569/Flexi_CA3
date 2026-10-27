const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDbConnected } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'mealmate_super_secret_jwt_key_ca3_25070521188_secure_2025';
      const decoded = jwt.verify(token, secret);

      // Verify database readiness before querying user record
      if (!isDbConnected()) {
        return res.status(503).json({
          success: false,
          message: 'Database service is currently unavailable. Please verify that MongoDB is running and connected.'
        });
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Authorization denied.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid authentication token.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token was provided.'
    });
  }
};

module.exports = { protect };

const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('../utils/errors');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(new AppError('Access token required', 401));
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return next(new AppError('Invalid or expired token', 403));
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
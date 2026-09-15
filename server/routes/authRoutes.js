const express = require('express');
const router = express.Router();
const { loginUser, registerUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Middleware that optionally decodes the token (does NOT block if missing)
const optionalProtect = async (req, res, next) => {
  const { protect: _protect } = require('../middleware/authMiddleware');
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return _protect(req, res, next);
  }
  next();
};

router.post('/login', loginUser);
router.post('/register', optionalProtect, registerUser);
router.put('/profile', protect, updateProfile);

module.exports = router;

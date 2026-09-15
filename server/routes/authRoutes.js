const express = require('express');
const router = express.Router();
const { loginUser, registerUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Optional protect — populates req.user if a valid Bearer token is present,
 * but does NOT block the request if there is no token or the token is missing.
 * This lets public registration work while also letting admins assign roles.
 */
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Re-use the existing protect middleware — if token is invalid it will
    // respond with 401, which prevents bad tokens from masquerading as admins.
    return protect(req, res, next);
  }
  // No token — allow through as unauthenticated
  next();
};

router.post('/login', loginUser);
router.post('/register', optionalProtect, registerUser);
router.put('/profile', protect, updateProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUserRole, 
  updateUserStatus,
  deleteUser
} = require('../controllers/userController');
const { updateUserProfile } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser);

router.route('/:id/role')
  .put(protect, admin, updateUserRole);

router.route('/:id/status')
  .put(protect, admin, updateUserStatus);

// Admin can update any user's name, email, username, password
router.route('/:id/profile')
  .put(protect, admin, updateUserProfile);

module.exports = router;

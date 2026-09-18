const express = require('express');
const router = express.Router();
const { 
  getRefreshments, 
  addRefreshment,
  updateRefreshment,
  deleteRefreshment 
} = require('../controllers/refreshmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getRefreshments)
  .post(protect, addRefreshment);

router.route('/:id')
  .put(protect, updateRefreshment)
  .delete(protect, deleteRefreshment);

module.exports = router;

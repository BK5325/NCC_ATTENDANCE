const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  addPayment, 
  deletePayment 
} = require('../controllers/uniformController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPayments)
  .post(protect, addPayment);

router.route('/:id')
  .delete(protect, deletePayment);

module.exports = router;

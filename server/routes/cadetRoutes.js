const express = require('express');
const router = express.Router();
const { 
  createCadet, 
  getCadets, 
  getCadetById, 
  updateCadet, 
  deleteCadet 
} = require('../controllers/cadetController');
const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, staffOrAdmin, getCadets)
  .post(protect, staffOrAdmin, createCadet);

router.route('/:id')
  .get(protect, staffOrAdmin, getCadetById)
  .put(protect, staffOrAdmin, updateCadet)
  .delete(protect, admin, deleteCadet); // Only admin can delete

module.exports = router;

const express = require('express');
const router = express.Router();
const { getOverviewStats, getMonthlyStats, getYearwiseStats } = require('../controllers/analyticsController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

router.route('/overview').get(protect, staffOrAdmin, getOverviewStats);
router.route('/monthly').get(protect, staffOrAdmin, getMonthlyStats);
router.route('/by-year').get(protect, staffOrAdmin, getYearwiseStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendance, 
  getCadetAttendance, 
  getCadetAttendanceSummary 
} = require('../controllers/attendanceController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, staffOrAdmin, markAttendance)
  .get(protect, staffOrAdmin, getAttendance);

router.route('/cadet/:cadetId')
  .get(protect, getCadetAttendance);

router.route('/cadet/:cadetId/summary')
  .get(protect, getCadetAttendanceSummary);

module.exports = router;

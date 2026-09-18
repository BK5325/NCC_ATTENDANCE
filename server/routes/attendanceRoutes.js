const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendance, 
  getCadetAttendance, 
  getCadetAttendanceSummary,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, staffOrAdmin, markAttendance)
  .get(protect, staffOrAdmin, getAttendance);

router.route('/:id')
  .put(protect, staffOrAdmin, updateAttendance)
  .delete(protect, staffOrAdmin, deleteAttendance);

router.route('/cadet/:cadetId')
  .get(protect, getCadetAttendance);

router.route('/cadet/:cadetId/summary')
  .get(protect, getCadetAttendanceSummary);

module.exports = router;

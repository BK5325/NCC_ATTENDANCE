const Cadet = require('../models/Cadet');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get dashboard overview stats
// @route   GET /api/analytics/overview
// @access  Private/Staff or Admin
const getOverviewStats = async (req, res) => {
  try {
    const totalCadets = await Cadet.countDocuments();
    const firstYear = await Cadet.countDocuments({ year: '1st Year' });
    const secondYear = await Cadet.countDocuments({ year: '2nd Year - B Certificate' });
    const thirdYear = await Cadet.countDocuments({ year: '3rd Year - C Certificate' });

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.find({ date: today });
    const todayPresent = todayAttendance.filter(a => a.status === 'Present').length;
    const todayAbsent = todayAttendance.filter(a => a.status === 'Absent').length;

    // Overall attendance %
    const allAttendance = await Attendance.find();
    const totalRecords = allAttendance.length;
    const totalPresent = allAttendance.filter(a => a.status === 'Present').length;
    const overallPercentage = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(2) : 0;

    let response = {
      totalCadets,
      firstYear,
      secondYear,
      thirdYear,
      todayPresent,
      todayAbsent,
      overallPercentage
    };

    if (req.user.role === 'admin') {
      const totalUsers = await User.countDocuments({ role: 'user' });
      const totalStaff = await User.countDocuments({ role: 'staff' });
      const totalAdmins = await User.countDocuments({ role: 'admin' });
      response = { ...response, totalUsers, totalStaff, totalAdmins };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get monthly attendance stats for charts
// @route   GET /api/analytics/monthly
// @access  Private/Staff or Admin
const getMonthlyStats = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const monthly = [];

    for (let month = 0; month < 12; month++) {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      const records = await Attendance.find({ date: { $gte: start, $lte: end } });
      const total = records.length;
      const present = records.filter(r => r.status === 'Present').length;
      monthly.push({
        month: start.toLocaleString('en-IN', { month: 'short' }),
        present,
        absent: total - present,
        total,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    }
    res.json(monthly);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get year-wise attendance stats
// @route   GET /api/analytics/by-year
// @access  Private/Staff or Admin
const getYearwiseStats = async (req, res) => {
  try {
    const nccYears = ['1st Year', '2nd Year - B Certificate', '3rd Year - C Certificate'];
    const result = [];

    for (const nccYear of nccYears) {
      const cadets = await Cadet.find({ year: nccYear });
      const cadetIds = cadets.map(c => c._id);
      const records = await Attendance.find({ cadetId: { $in: cadetIds } });
      const total = records.length;
      const present = records.filter(r => r.status === 'Present').length;
      result.push({
        year: nccYear,
        cadets: cadets.length,
        present,
        absent: total - present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getOverviewStats,
  getMonthlyStats,
  getYearwiseStats,
};

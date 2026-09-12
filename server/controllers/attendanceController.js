const Attendance = require('../models/Attendance');
const Cadet = require('../models/Cadet');

// @desc    Mark attendance (bulk)
// @route   POST /api/attendance
// @access  Private/Staff or Admin
const markAttendance = async (req, res) => {
  try {
    const { date, attendanceRecords } = req.body;
    
    if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    const operations = attendanceRecords.map(record => ({
      updateOne: {
        filter: { cadetId: record.cadetId, date: formattedDate },
        update: { $set: { status: record.status, markedBy: req.user._id } },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);
    
    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while marking attendance' });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private/Staff or Admin
const getAttendance = async (req, res) => {
  try {
    const { date, year } = req.query;
    
    let cadetQuery = {};
    if (year) {
      cadetQuery.year = year;
    }
    
    const cadets = await Cadet.find(cadetQuery).select('_id regNo name year');
    const cadetIds = cadets.map(c => c._id);

    let query = { cadetId: { $in: cadetIds } };
    
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }

    const records = await Attendance.find(query)
      .populate('cadetId', 'regNo name year')
      .populate('markedBy', 'name');

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get specific cadet attendance
// @route   GET /api/attendance/cadet/:cadetId
// @access  Private
const getCadetAttendance = async (req, res) => {
  try {
    // Check if user is trying to view someone else's data
    if (req.user.role === 'user') {
      const cadetInfo = await Cadet.findOne({ email: req.user.email }); // Assuming email links user to cadet
      if (!cadetInfo || cadetInfo._id.toString() !== req.params.cadetId) {
        return res.status(403).json({ message: 'Not authorized to view this record' });
      }
    }

    const records = await Attendance.find({ cadetId: req.params.cadetId }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get cadet attendance summary
// @route   GET /api/attendance/cadet/:cadetId/summary
// @access  Private
const getCadetAttendanceSummary = async (req, res) => {
  try {
    if (req.user.role === 'user') {
      const cadetInfo = await Cadet.findOne({ email: req.user.email }); 
      if (!cadetInfo || cadetInfo._id.toString() !== req.params.cadetId) {
        return res.status(403).json({ message: 'Not authorized to view this record' });
      }
    }

    const records = await Attendance.find({ cadetId: req.params.cadetId });
    
    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({ total, present, absent, percentage });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getCadetAttendance,
  getCadetAttendanceSummary
};

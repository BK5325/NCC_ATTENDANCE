const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  cadetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cadet',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Prevent duplicate attendance for same cadet on same date
attendanceSchema.index({ cadetId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

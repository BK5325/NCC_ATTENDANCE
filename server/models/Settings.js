const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  institutionName: { type: String, default: 'ABC College' },
  nccUnit: { type: String, default: 'Army Wing' },
  academicYear: { type: String, default: '2026-27' },
  attendanceThreshold: { type: Number, default: 75 },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);

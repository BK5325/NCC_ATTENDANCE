const mongoose = require('mongoose');

const cadetSchema = new mongoose.Schema({
  regNo: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year', '2nd Year - B Certificate', '3rd Year - C Certificate']
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Cadet', cadetSchema);

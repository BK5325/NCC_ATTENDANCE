const mongoose = require('mongoose');

const uniformPaymentSchema = new mongoose.Schema({
  cadet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cadet',
    required: true
  },
  item: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('UniformPayment', uniformPaymentSchema);

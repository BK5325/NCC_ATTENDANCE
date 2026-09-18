const UniformPayment = require('../models/UniformPayment');
const Cadet = require('../models/Cadet');

// @desc    Get all uniform payments
// @route   GET /api/uniform-payments
// @access  Private (Admin/Staff)
const getPayments = async (req, res) => {
  try {
    const payments = await UniformPayment.find({})
      .populate('cadet', 'regNo name year')
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching uniform payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a uniform payment
// @route   POST /api/uniform-payments
// @access  Private (Admin/Staff)
const addPayment = async (req, res) => {
  try {
    const { cadetId, item, amount, date } = req.body;

    if (!cadetId || !item || !amount) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const cadet = await Cadet.findById(cadetId);
    if (!cadet) {
      return res.status(404).json({ message: 'Cadet not found' });
    }

    const payment = new UniformPayment({
      cadet: cadetId,
      item,
      amount,
      date: date || Date.now(),
      createdBy: req.user._id
    });

    const savedPayment = await payment.save();
    
    // Return populated response for frontend table
    const populatedPayment = await UniformPayment.findById(savedPayment._id)
      .populate('cadet', 'regNo name year')
      .populate('createdBy', 'name');

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error('Error adding uniform payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a uniform payment
// @route   PUT /api/uniform-payments/:id
// @access  Private (Admin/Staff)
const updatePayment = async (req, res) => {
  try {
    const payment = await UniformPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (req.user.role !== 'admin' && payment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }

    payment.cadet = req.body.cadetId || payment.cadet;
    payment.item = req.body.item || payment.item;
    payment.amount = req.body.amount || payment.amount;
    payment.date = req.body.date || payment.date;

    const savedPayment = await payment.save();
    
    const populatedPayment = await UniformPayment.findById(savedPayment._id)
      .populate('cadet', 'regNo name year')
      .populate('createdBy', 'name');

    res.json(populatedPayment);
  } catch (error) {
    console.error('Error updating uniform payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a uniform payment
// @route   DELETE /api/uniform-payments/:id
// @access  Private (Admin/Staff)
const deletePayment = async (req, res) => {
  try {
    const payment = await UniformPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Only allow admin or the user who created it to delete it
    if (req.user.role !== 'admin' && payment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await UniformPayment.deleteOne({ _id: payment._id });
    res.json({ message: 'Payment record removed' });
  } catch (error) {
    console.error('Error deleting uniform payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment
};

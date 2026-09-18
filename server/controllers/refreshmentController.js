const Refreshment = require('../models/Refreshment');

// @desc    Get all refreshments
// @route   GET /api/refreshments
// @access  Private (Admin/Staff)
const getRefreshments = async (req, res) => {
  try {
    const refreshments = await Refreshment.find({})
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 });
    res.json(refreshments);
  } catch (error) {
    console.error('Error fetching refreshments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a refreshment
// @route   POST /api/refreshments
// @access  Private (Admin/Staff)
const addRefreshment = async (req, res) => {
  try {
    const { name, quantity, price, date } = req.body;

    if (!name || !quantity || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const refreshment = new Refreshment({
      name,
      quantity,
      price,
      date: date || Date.now(),
      createdBy: req.user._id
    });

    const savedRefreshment = await refreshment.save();
    
    // Return populated response for frontend table
    const populatedRefreshment = await Refreshment.findById(savedRefreshment._id)
      .populate('createdBy', 'name');

    res.status(201).json(populatedRefreshment);
  } catch (error) {
    console.error('Error adding refreshment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a refreshment
// @route   PUT /api/refreshments/:id
// @access  Private (Admin/Staff)
const updateRefreshment = async (req, res) => {
  try {
    const refreshment = await Refreshment.findById(req.params.id);

    if (!refreshment) {
      return res.status(404).json({ message: 'Refreshment record not found' });
    }

    if (req.user.role !== 'admin' && refreshment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }

    refreshment.name = req.body.name || refreshment.name;
    refreshment.quantity = req.body.quantity || refreshment.quantity;
    refreshment.price = req.body.price || refreshment.price;
    refreshment.date = req.body.date || refreshment.date;

    const savedRefreshment = await refreshment.save();
    
    const populatedRefreshment = await Refreshment.findById(savedRefreshment._id)
      .populate('createdBy', 'name');

    res.json(populatedRefreshment);
  } catch (error) {
    console.error('Error updating refreshment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a refreshment
// @route   DELETE /api/refreshments/:id
// @access  Private (Admin/Staff)
const deleteRefreshment = async (req, res) => {
  try {
    const refreshment = await Refreshment.findById(req.params.id);

    if (!refreshment) {
      return res.status(404).json({ message: 'Refreshment record not found' });
    }

    // Only allow admin or the user who created it to delete it
    if (req.user.role !== 'admin' && refreshment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await Refreshment.deleteOne({ _id: refreshment._id });
    res.json({ message: 'Refreshment record removed' });
  } catch (error) {
    console.error('Error deleting refreshment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRefreshments,
  addRefreshment,
  updateRefreshment,
  deleteRefreshment
};

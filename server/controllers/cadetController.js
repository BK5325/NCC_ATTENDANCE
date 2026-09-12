const Cadet = require('../models/Cadet');

// @desc    Create a new cadet
// @route   POST /api/cadets
// @access  Private/Staff or Admin
const createCadet = async (req, res) => {
  try {
    const { regNo, name, year, email, phone } = req.body;

    const cadetExists = await Cadet.findOne({ regNo });

    if (cadetExists) {
      return res.status(400).json({ message: 'A cadet with this Registration Number already exists.' });
    }

    const cadet = await Cadet.create({
      regNo,
      name,
      year,
      email,
      phone,
      createdBy: req.user._id,
    });

    res.status(201).json(cadet);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all cadets
// @route   GET /api/cadets
// @access  Private/Staff or Admin
const getCadets = async (req, res) => {
  try {
    const { year, status, search } = req.query;
    
    let query = {};
    if (year) query.year = year;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } }
      ];
    }

    const cadets = await Cadet.find(query).sort({ regNo: 1 });
    res.json(cadets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get cadet by ID
// @route   GET /api/cadets/:id
// @access  Private/Staff or Admin
const getCadetById = async (req, res) => {
  try {
    const cadet = await Cadet.findById(req.params.id);
    if (cadet) {
      res.json(cadet);
    } else {
      res.status(404).json({ message: 'Cadet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cadet
// @route   PUT /api/cadets/:id
// @access  Private/Staff or Admin
const updateCadet = async (req, res) => {
  try {
    const cadet = await Cadet.findById(req.params.id);

    if (cadet) {
      cadet.name = req.body.name || cadet.name;
      cadet.year = req.body.year || cadet.year;
      cadet.email = req.body.email || cadet.email;
      cadet.phone = req.body.phone || cadet.phone;
      cadet.status = req.body.status || cadet.status;
      
      // Only check regNo if it's being changed
      if (req.body.regNo && req.body.regNo !== cadet.regNo) {
        const cadetExists = await Cadet.findOne({ regNo: req.body.regNo });
        if (cadetExists) {
          return res.status(400).json({ message: 'A cadet with this Registration Number already exists.' });
        }
        cadet.regNo = req.body.regNo;
      }

      const updatedCadet = await cadet.save();
      res.json(updatedCadet);
    } else {
      res.status(404).json({ message: 'Cadet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete cadet
// @route   DELETE /api/cadets/:id
// @access  Private/Admin
const deleteCadet = async (req, res) => {
  try {
    const cadet = await Cadet.findById(req.params.id);
    if (cadet) {
      // Delete associated attendance records
      const Attendance = require('../models/Attendance');
      await Attendance.deleteMany({ cadetId: cadet._id });
      
      await Cadet.deleteOne({ _id: cadet._id });
      res.json({ message: 'Cadet removed' });
    } else {
      res.status(404).json({ message: 'Cadet not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCadet,
  getCadets,
  getCadetById,
  updateCadet,
  deleteCadet
};

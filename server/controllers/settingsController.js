const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    const { institutionName, nccUnit, academicYear, attendanceThreshold } = req.body;
    if (institutionName !== undefined) settings.institutionName = institutionName;
    if (nccUnit !== undefined) settings.nccUnit = nccUnit;
    if (academicYear !== undefined) settings.academicYear = academicYear;
    if (attendanceThreshold !== undefined) settings.attendanceThreshold = attendanceThreshold;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSettings, updateSettings };

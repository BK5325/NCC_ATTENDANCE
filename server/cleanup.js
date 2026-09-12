const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Cadet = require('./models/Cadet');
require('dotenv').config();

const cleanUp = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const cadets = await Cadet.find();
    const cadetIds = cadets.map(c => c._id);

    // Delete attendance records that do not belong to any existing cadet
    const result = await Attendance.deleteMany({ cadetId: { $nin: cadetIds } });
    
    console.log(`Successfully deleted ${result.deletedCount} orphaned attendance records.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

cleanUp();

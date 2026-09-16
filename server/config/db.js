const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

let isConnected;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    // Throw error instead of process.exit(1) to avoid crashing the serverless function
    throw error;
  }
};

module.exports = connectDB;

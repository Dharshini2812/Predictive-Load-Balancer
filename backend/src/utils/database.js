const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/loadbalancer';
  
  if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
    console.warn('[DB INFO] MONGODB_URI not found. Starting in "Demo Mode" with in-memory data.');
    return; // Don't even try to connect, just use Demo Mode
  }

  // Mask password for logging
  const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
  console.log(`[DB] Attempting to connect to: ${maskedUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4 to avoid the ::1 (IPv6) localhost bug
    });
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.warn(`MongoDB Connection Failed: ${error.message}. Falling back to "Demo Mode".`);
    // Don't throw, just let the app run in Demo Mode
  }
};

module.exports = connectDB;
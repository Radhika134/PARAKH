const mongoose = require('mongoose');

let isConnected = false;

/**
 * connectDB
 * Connects to MongoDB using process.env.MONGO_URI.
 * Gracefully handles connection failures without abruptly crashing the application.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/parakh_db';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for fast feedback
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} / database: ${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Database connection failed: ${error.message}`);
    console.warn('[MongoDB Warning] Operating in degraded mode — Database persistence APIs will return offline status.');
  }
};

/**
 * isDbConnected
 * Returns current database connection status.
 */
const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;

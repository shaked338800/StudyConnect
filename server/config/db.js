// [REQ-16 MongoDB] Connection to MongoDB through Mongoose.
const mongoose = require('mongoose');

const RETRY_DELAY_MS = 5000;

// Connects to MongoDB. If MongoDB is not running yet, we log a clear message
// and try again later instead of crashing the server (requirement 24).
async function connectToDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyconnect';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected:', mongoose.connection.name);
  } catch (err) {
    console.error(`MongoDB connection failed (${err.message}). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectToDatabase, RETRY_DELAY_MS);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Returns a readable status for the health check.
// Kept here so controllers never need to import mongoose directly.
function getDbStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectToDatabase, getDbStatus };

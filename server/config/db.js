const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * Mongoose 7+ uses the new URL parser and unified topology by default,
 * so no extra options are needed.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

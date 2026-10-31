const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * Selects database target based on DB_ENV:
 *  - 'local' (default): Uses MONGO_URI
 *  - 'atlas': Uses MONGO_ATLAS_URI
 */
const connectDB = async () => {
  const dbEnv = (process.env.DB_ENV || 'local').toLowerCase().trim();
  let uri = '';
  let targetName = '';

  if (dbEnv === 'atlas') {
    uri = process.env.MONGO_ATLAS_URI;
    targetName = 'MongoDB Atlas';
  } else if (dbEnv === 'local') {
    uri = process.env.MONGO_URI;
    targetName = 'Local MongoDB';
  } else {
    console.error(`❌ Invalid DB_ENV: '${dbEnv}'. Supported values are 'local' or 'atlas'.`);
    process.exit(1);
  }

  if (!uri) {
    const varName = dbEnv === 'atlas' ? 'MONGO_ATLAS_URI' : 'MONGO_URI';
    console.error(`❌ Error: Database URI variable '${varName}' is missing or empty in server/.env.`);
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ ${targetName} connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ ${targetName} connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

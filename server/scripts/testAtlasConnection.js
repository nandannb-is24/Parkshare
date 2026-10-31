const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const testAtlas = async () => {
  const atlasURI = process.env.MONGO_ATLAS_URI;

  console.log('\n==================================================');
  console.log('   MongoDB Atlas Connection Test');
  console.log('==================================================\n');

  if (!atlasURI) {
    console.error('❌ Error: MONGO_ATLAS_URI is not defined in server/.env');
    console.error('   Please define MONGO_ATLAS_URI in server/.env before running this test.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas cluster...');
  // Note: atlasURI is intentionally NOT printed to protect credentials

  try {
    const conn = await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log('\n✅ Successfully connected to MongoDB Atlas!');
    console.log(`  Database Name: ${conn.connection.name}`);
    console.log(`  Cluster Host:  ${conn.connection.host}`);
    console.log(`  Ready State:   ${conn.connection.readyState === 1 ? 'Connected (1)' : conn.connection.readyState}`);
    console.log('==================================================\n');
  } catch (err) {
    console.error('\n❌ Connection Failed:');
    console.error(`  ${err.message}\n`);
    console.error('Troubleshooting Tips:');
    console.error('  1. Check Network Access in Atlas: Ensure your current IP address (or 0.0.0.0/0) is whitelisted.');
    console.error('  2. Check Database Access in Atlas: Ensure the username and password in MONGO_ATLAS_URI are correct.');
    console.error('  3. Ensure the database user has "readWriteAnyDatabase" or "readWrite@parkshare" privileges.');
    console.error('==================================================\n');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed.\n');
    }
  }
};

testAtlas();


const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const createAdmin = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkshare';

  console.log('\n==================================================');
  console.log('   ParkShare - One-Time Admin Account Setup');
  console.log('==================================================\n');

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.\n');

    // 1. Collect inputs from environment variables or terminal prompts
    let name = process.env.ADMIN_NAME;
    let email = process.env.ADMIN_EMAIL;
    let password = process.env.ADMIN_PASSWORD;
    let flatNumber = process.env.ADMIN_FLAT || 'Admin Office';

    if (!name) {
      name = await askQuestion('Enter Admin Name (e.g., Community Administrator): ');
    }

    if (!email) {
      email = await askQuestion('Enter Admin Email: ');
    }

    if (!name || !email) {
      console.error('\nError: Admin name and email are required.');
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`\nAccount with email "${normalizedEmail}" is ALREADY an administrator.`);
        console.log(`  Name: ${existingUser.name}`);
        console.log(`  Role: ${existingUser.role}`);
        console.log(`  User ID: ${existingUser._id}`);
        return;
      }

      // Existing user has role 'resident'
      console.log(`\nFound existing resident account for "${normalizedEmail}":`);
      console.log(`  Name: ${existingUser.name}`);
      console.log(`  Current Role: ${existingUser.role}`);
      console.log(`  Flat Number: ${existingUser.flatNumber}`);

      let confirmPromote = process.env.PROMOTE_EXISTING;
      if (!confirmPromote) {
        confirmPromote = await askQuestion(
          '\nDo you want to promote this resident account to Administrator? (y/N): '
        );
      }

      if (confirmPromote.toLowerCase() === 'y' || confirmPromote.toLowerCase() === 'yes') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('\nAccount successfully promoted to Administrator!');
        console.log(`  Email: ${existingUser.email}`);
        console.log(`  New Role: ${existingUser.role}`);
        console.log('\nYou can now log in using the existing password for this account.');
      } else {
        console.log('\nOperation aborted. No changes were made.');
      }
      return;
    }

    // 3. User does not exist, prompt for password and flat number if not set
    if (!password) {
      password = await askQuestion('Enter Admin Password (min 6 characters): ');
    }

    if (!password || password.length < 6) {
      console.error('\nError: Password must be at least 6 characters long.');
      process.exit(1);
    }

    if (!process.env.ADMIN_FLAT && flatNumber === 'Admin Office') {
      const inputFlat = await askQuestion(
        'Enter Admin Flat / Office Identifier [default: Admin Office]: '
      );
      if (inputFlat) flatNumber = inputFlat;
    }

    // 4. Create new admin user
    // The pre-save hook in User model automatically hashes the password with bcrypt (10 rounds)
    const newAdmin = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      flatNumber: flatNumber.trim(),
      role: 'admin',
    });

    await newAdmin.save();

    console.log('\n==================================================');
    console.log('   Administrator Account Created Successfully!');
    console.log('==================================================');
    console.log(`  User ID:     ${newAdmin._id}`);
    console.log(`  Name:        ${newAdmin.name}`);
    console.log(`  Email:       ${newAdmin.email}`);
    console.log(`  Role:        ${newAdmin.role}`);
    console.log(`  Flat/Office: ${newAdmin.flatNumber}`);
    console.log('==================================================');
    console.log('\nYou can now sign in at http://localhost:5173/login\n');
  } catch (err) {
    console.error('\nFailed to create or promote admin account:', err.message || err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.\n');
  }
};

createAdmin();


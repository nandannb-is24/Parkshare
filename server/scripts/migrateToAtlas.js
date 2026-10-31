const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const { BSON } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const COLLECTIONS = ['users', 'slots', 'bookings'];

function sanitizeUri(uri) {
  if (!uri) return '[UNDEFINED]';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

async function performBackup(localDb, backupDir) {
  console.log('--------------------------------------------------');
  console.log('1. PRE-MIGRATION BACKUP');
  console.log('--------------------------------------------------');

  let usedNativeMongodump = false;
  // Attempt mongodump if available
  try {
    execSync('mongodump --version', { stdio: 'ignore' });
    console.log('Native mongodump detected. Creating dump...');
    const localUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkshare';
    execSync(`mongodump --uri="${localUri}" --out="${backupDir}"`, { stdio: 'inherit' });
    usedNativeMongodump = true;
    console.log(`✅ Native mongodump completed into: ${backupDir}`);
  } catch (err) {
    console.log('mongodump utility not found on PATH. Using native BSON-preserving backup method...');
  }

  if (!usedNativeMongodump) {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const manifest = {
      timestamp: new Date().toISOString(),
      format: 'BSON',
      collections: {},
    };

    for (const colName of COLLECTIONS) {
      const col = localDb.collection(colName);
      const docs = await col.find({}).toArray();
      const indexes = await col.indexes();

      // Serialize documents as BSON buffer sequence (exact mongodump BSON format)
      const bsonBuffers = docs.map((doc) => BSON.serialize(doc));
      const combinedBuffer = Buffer.concat(bsonBuffers);

      const bsonPath = path.join(backupDir, `${colName}.bson`);
      const metaPath = path.join(backupDir, `${colName}.metadata.json`);

      fs.writeFileSync(bsonPath, combinedBuffer);
      fs.writeFileSync(
        metaPath,
        JSON.stringify({ indexes, count: docs.length }, null, 2),
        'utf8'
      );

      manifest.collections[colName] = {
        count: docs.length,
        sizeBytes: combinedBuffer.length,
        bsonFile: `${colName}.bson`,
        metadataFile: `${colName}.metadata.json`,
      };

      console.log(`  Backed up ${colName}: ${docs.length} document(s), ${combinedBuffer.length} bytes`);
    }

    const manifestPath = path.join(backupDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`✅ BSON backup completed into: ${backupDir}`);
  }

  // Verification of backup files
  console.log('Verifying backup files on disk...');
  for (const colName of COLLECTIONS) {
    const bsonPath = path.join(backupDir, `${colName}.bson`);
    if (!fs.existsSync(bsonPath)) {
      throw new Error(`Backup verification failed: ${bsonPath} does not exist`);
    }
    const buf = fs.readFileSync(bsonPath);
    let verifiedCount = 0;
    let offset = 0;
    while (offset < buf.length) {
      // First 4 bytes in BSON is the 32-bit little-endian document size
      const docSize = buf.readInt32LE(offset);
      const docBuf = buf.subarray(offset, offset + docSize);
      const doc = BSON.deserialize(docBuf);
      if (!doc || !doc._id) {
        throw new Error(`Corrupted document encountered at offset ${offset} in ${colName}.bson`);
      }
      verifiedCount++;
      offset += docSize;
    }
    const localCount = await localDb.collection(colName).countDocuments();
    if (verifiedCount !== localCount) {
      throw new Error(`Backup doc count mismatch for ${colName}: expected ${localCount}, found ${verifiedCount}`);
    }
    console.log(`  Verified ${colName}.bson: ${verifiedCount} valid BSON document(s) verified.`);
  }
  console.log('✅ Pre-migration backup verified successfully.\n');
}

async function runMigration() {
  console.log('==================================================');
  console.log('   ParkShare — Stage 8C.2: MongoDB Migration');
  console.log('==================================================\n');

  const localUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkshare';
  const atlasUri = process.env.MONGO_ATLAS_URI;

  if (!atlasUri) {
    console.error('❌ Error: MONGO_ATLAS_URI is not set in server/.env');
    process.exit(1);
  }

  console.log(`Source URI:      ${sanitizeUri(localUri)}`);
  console.log(`Destination URI: ${sanitizeUri(atlasUri)}`);
  console.log('');

  const timestamp = getTimestamp();
  const backupDir = path.join(__dirname, '../backups', timestamp);

  let localConn = null;
  let atlasConn = null;

  try {
    // 1. Connect to Local MongoDB
    console.log('Connecting to local MongoDB...');
    localConn = await mongoose.createConnection(localUri).asPromise();
    const localDb = localConn.db;
    console.log(`✅ Connected to local DB: ${localDb.databaseName}\n`);

    // 2. Perform and verify Pre-migration Backup
    await performBackup(localDb, backupDir);

    // 3. Connect to Atlas
    console.log('--------------------------------------------------');
    console.log('2. DESTINATION SAFETY CHECK');
    console.log('--------------------------------------------------');
    console.log('Connecting to MongoDB Atlas...');
    atlasConn = await mongoose.createConnection(atlasUri, {
      serverSelectionTimeoutMS: 10000,
    }).asPromise();
    const destDb = atlasConn.db;
    console.log(`✅ Connected to Atlas DB: ${destDb.databaseName}`);

    // Inspect destination collections
    console.log('Inspecting destination collections before migration...');
    const destCollections = await destDb.listCollections().toArray();
    const destColNames = destCollections.map((c) => c.name);

    let destinationHasData = false;
    for (const colName of COLLECTIONS) {
      let count = 0;
      if (destColNames.includes(colName)) {
        count = await destDb.collection(colName).countDocuments();
      }
      console.log(`  Atlas collection '${colName}': ${count} document(s)`);
      if (count > 0) {
        destinationHasData = true;
      }
    }

    if (destinationHasData) {
      throw new Error(
        'DESTINATION SAFETY VIOLATION: One or more destination collections contain records. ' +
        'Migration stopped immediately to prevent overwriting or duplicate data.'
      );
    }
    console.log('✅ Destination safety check passed: All destination collections are empty.\n');

    // 4. Report source counts before migration
    console.log('--------------------------------------------------');
    console.log('3. MIGRATION EXECUTION');
    console.log('--------------------------------------------------');
    console.log('Source document counts:');
    const sourceDocs = {};
    for (const colName of COLLECTIONS) {
      const docs = await localDb.collection(colName).find({}).toArray();
      sourceDocs[colName] = docs;
      console.log(`  Source '${colName}': ${docs.length} document(s)`);
    }

    // Dependency order: users, slots, bookings
    for (const colName of COLLECTIONS) {
      console.log(`\nMigrating collection: '${colName}'...`);
      const docs = sourceDocs[colName];

      if (docs.length > 0) {
        // Transfer documents preserving exact BSON types and ObjectIds
        const insertResult = await destDb.collection(colName).insertMany(docs, { ordered: true });
        console.log(`  Inserted ${insertResult.insertedCount} document(s) into Atlas '${colName}'.`);
      } else {
        console.log(`  Collection '${colName}' is empty locally. Creating collection if needed...`);
        // Ensure collection exists so indexes can be set
        await destDb.createCollection(colName).catch(() => {});
      }

      // Recreate indexes safely (excluding default _id_)
      const localIndexes = await localDb.collection(colName).indexes().catch(() => []);
      for (const idx of localIndexes) {
        if (idx.name === '_id_') continue;
        const keys = idx.key;
        const options = { name: idx.name };
        if (idx.unique) options.unique = true;
        if (idx.sparse) options.sparse = true;
        console.log(`  Recreating index on '${colName}': ${JSON.stringify(keys)} (unique: ${!!idx.unique})`);
        await destDb.collection(colName).createIndex(keys, options);
      }
      console.log(`  ✅ Collection '${colName}' migration complete.`);
    }

    // 5. Post-migration Verification
    console.log('\n--------------------------------------------------');
    console.log('4. POST-MIGRATION VERIFICATION');
    console.log('--------------------------------------------------');

    // 5.1 Document Counts
    console.log('Verifying document counts:');
    const verificationResults = {};
    for (const colName of COLLECTIONS) {
      const srcCount = sourceDocs[colName].length;
      const destCount = await destDb.collection(colName).countDocuments();
      const match = srcCount === destCount;
      verificationResults[colName] = { srcCount, destCount, match };
      console.log(`  ${colName}: Source=${srcCount}, Atlas=${destCount} -> ${match ? 'MATCH ✅' : 'MISMATCH ❌'}`);
      if (!match) {
        throw new Error(`Count mismatch for ${colName}!`);
      }
    }

    // 5.2 Relationship Integrity
    console.log('\nVerifying relationship integrity on Atlas:');
    const atlasUsers = await destDb.collection('users').find({}).toArray();
    const atlasSlots = await destDb.collection('slots').find({}).toArray();
    const atlasBookings = await destDb.collection('bookings').find({}).toArray();

    const userIds = new Set(atlasUsers.map((u) => u._id.toString()));
    const slotIds = new Set(atlasSlots.map((s) => s._id.toString()));

    const orphanedSlots = atlasSlots.filter((s) => !userIds.has(s.owner?.toString()));
    console.log(`  Slots with valid user owner: ${atlasSlots.length - orphanedSlots.length}/${atlasSlots.length}`);
    if (orphanedSlots.length > 0) {
      throw new Error(`Orphaned slots found on Atlas: ${orphanedSlots.length}`);
    }

    const orphanedUserBookings = atlasBookings.filter((b) => !userIds.has(b.user?.toString()));
    const orphanedSlotBookings = atlasBookings.filter((b) => !slotIds.has(b.slot?.toString()));
    console.log(`  Bookings with valid user reference: ${atlasBookings.length - orphanedUserBookings.length}/${atlasBookings.length}`);
    console.log(`  Bookings with valid slot reference: ${atlasBookings.length - orphanedSlotBookings.length}/${atlasBookings.length}`);
    if (orphanedUserBookings.length > 0 || orphanedSlotBookings.length > 0) {
      throw new Error('Orphaned bookings found on Atlas!');
    }
    console.log('  ✅ Relationship integrity 100% verified.');

    // 5.3 Role and Credential Hash Check
    console.log('\nVerifying user roles and password hashes:');
    const adminCountSrc = sourceDocs.users.filter((u) => u.role === 'admin').length;
    const residentCountSrc = sourceDocs.users.filter((u) => u.role === 'resident').length;
    const adminCountDest = atlasUsers.filter((u) => u.role === 'admin').length;
    const residentCountDest = atlasUsers.filter((u) => u.role === 'resident').length;

    console.log(`  Source Roles: Admins=${adminCountSrc}, Residents=${residentCountSrc}`);
    console.log(`  Atlas Roles:  Admins=${adminCountDest}, Residents=${residentCountDest}`);
    if (adminCountSrc !== adminCountDest || residentCountSrc !== residentCountDest) {
      throw new Error('User role counts do not match!');
    }

    // Verify admin email & password hash unchanged
    for (const srcUser of sourceDocs.users) {
      const destUser = atlasUsers.find((u) => u._id.toString() === srcUser._id.toString());
      if (!destUser) {
        throw new Error(`User ${srcUser._id} not found in Atlas!`);
      }
      if (destUser.email !== srcUser.email) {
        throw new Error(`Email mismatch for user ${srcUser._id}`);
      }
      if (destUser.password !== srcUser.password) {
        throw new Error(`Password hash mismatch for user ${srcUser._id}! Hash was modified or rehashed!`);
      }
      console.log(`  Verified user ${destUser.email}: Password hash unchanged and intact (${destUser.password.substring(0, 10)}...)`);
    }

    // 5.4 Index Verification
    console.log('\nVerifying indexes on Atlas:');
    for (const colName of COLLECTIONS) {
      const idxs = await destDb.collection(colName).indexes();
      console.log(`  Collection '${colName}' indexes:`);
      idxs.forEach((idx) => {
        console.log(`    - ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${!!idx.unique})`);
      });
    }

    // 5.5 Type Preservation Check
    console.log('\nVerifying BSON type preservation on sample documents:');
    if (atlasUsers.length > 0) {
      const sampleUser = atlasUsers[0];
      console.log(`  User _id type: ${sampleUser._id.constructor.name} (Value: ${sampleUser._id})`);
      console.log(`  User createdAt type: ${sampleUser.createdAt?.constructor?.name} (Value: ${sampleUser.createdAt?.toISOString()})`);
      if (sampleUser._id.constructor.name !== 'ObjectId') {
        throw new Error('User _id is not a BSON ObjectId!');
      }
      if (!(sampleUser.createdAt instanceof Date)) {
        throw new Error('User createdAt is not a Date object!');
      }
    }
    console.log('  ✅ BSON type preservation verified.');

    console.log('\n==================================================');
    console.log('   MIGRATION & VERIFICATION COMPLETED SUCCESSFULLY');
    console.log('==================================================');
    console.log(`Backup Location: ${backupDir}`);
    console.log('Source Database: Unchanged and intact');
    console.log('server/.env MONGO_URI: Unchanged (local)');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌ MIGRATION FAILED:');
    console.error(`  ${err.message}\n`);
    process.exit(1);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
  }
}

runMigration();


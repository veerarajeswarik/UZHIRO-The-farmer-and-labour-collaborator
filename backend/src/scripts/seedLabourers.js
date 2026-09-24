/**
 * Idempotent seed script for fictional demo labourer accounts (see
 * data/labourerSeed.js). Safe to re-run - upserts by email.
 *   Usage: npm run seed:labourers
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const LabourerProfile = require('../models/LabourerProfile');
const { demoLabourers, DEMO_PASSWORD } = require('../data/labourerSeed');

async function run() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('[seed:labourers] No database connection - set MONGODB_URI in backend/.env first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const { user: userData, profile: profileData } of demoLabourers) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({ ...userData, password: DEMO_PASSWORD, role: 'labourer' });
      created += 1;
    } else {
      user.set({ name: userData.name, phone: userData.phone, location: userData.location });
      await user.save();
      updated += 1;
    }

    await LabourerProfile.findOneAndUpdate(
      { user: user._id },
      { $set: { ...profileData, isDemoData: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`[seed:labourers] Done. Users created ${created}, updated ${updated}, total ${demoLabourers.length}.`);
  console.log(`[seed:labourers] Demo login password for all seeded labourers: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed:labourers] Failed:', err);
  process.exit(1);
});

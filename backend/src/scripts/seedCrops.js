/**
 * Idempotent seed script for the Crop reference dataset. Safe to re-run -
 * upserts by crop name instead of inserting duplicates.
 *   Usage: npm run seed:crops
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Crop = require('../models/Crop');
const crops = require('../data/cropSeed');

async function run() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('[seed:crops] No database connection - set MONGODB_URI in backend/.env first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const crop of crops) {
    const existed = await Crop.exists({ name: crop.name });
    await Crop.findOneAndUpdate(
      { name: crop.name },
      { $set: crop },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (existed) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`[seed:crops] Done. Created ${created}, updated ${updated}, total ${crops.length}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed:crops] Failed:', err);
  process.exit(1);
});

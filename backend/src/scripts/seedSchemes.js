/**
 * Idempotent seed script for Government Schemes. Safe to re-run - upserts
 * by name.
 *   Usage: npm run seed:schemes
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const GovernmentScheme = require('../models/GovernmentScheme');
const schemes = require('../data/schemeSeed');

async function run() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('[seed:schemes] No database connection - set MONGODB_URI in backend/.env first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const scheme of schemes) {
    const existed = await GovernmentScheme.exists({ name: scheme.name });
    await GovernmentScheme.findOneAndUpdate(
      { name: scheme.name },
      { $set: scheme },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    existed ? (updated += 1) : (created += 1);
  }

  console.log(`[seed:schemes] Done. Created ${created}, updated ${updated}, total ${schemes.length}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed:schemes] Failed:', err);
  process.exit(1);
});

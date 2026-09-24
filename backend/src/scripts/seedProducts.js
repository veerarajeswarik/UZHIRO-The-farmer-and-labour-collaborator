/**
 * Idempotent seed script for the Product (input) catalog. Requires crops to
 * already be seeded (npm run seed:crops) so seed products can be linked by
 * crop name.
 *   Usage: npm run seed:products
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Crop = require('../models/Crop');
const Product = require('../models/Product');
const { seedProducts, genericProducts } = require('../data/productSeed');

async function run() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('[seed:products] No database connection - set MONGODB_URI in backend/.env first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  const skipped = [];

  for (const { cropName, ...rest } of seedProducts) {
    const crop = await Crop.findOne({ name: cropName });
    if (!crop) {
      skipped.push(cropName);
      continue;
    }
    const doc = { ...rest, category: 'Seeds', crop: crop._id };
    const existed = await Product.exists({ category: 'Seeds', crop: crop._id, name: doc.name });
    await Product.findOneAndUpdate(
      { category: 'Seeds', crop: crop._id, name: doc.name },
      { $set: doc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    existed ? (updated += 1) : (created += 1);
  }

  for (const doc of genericProducts) {
    const existed = await Product.exists({ category: doc.category, crop: null, name: doc.name });
    await Product.findOneAndUpdate(
      { category: doc.category, crop: null, name: doc.name },
      { $set: doc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    existed ? (updated += 1) : (created += 1);
  }

  if (skipped.length) {
    console.warn(`[seed:products] Skipped seed products for missing crops: ${skipped.join(', ')}. Run npm run seed:crops first.`);
  }
  console.log(`[seed:products] Done. Created ${created}, updated ${updated}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed:products] Failed:', err);
  process.exit(1);
});

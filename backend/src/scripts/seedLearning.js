/**
 * Idempotent seed script for Learning Hub articles. Safe to re-run -
 * upserts by title.
 *   Usage: npm run seed:learning
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LearningArticle = require('../models/LearningArticle');
const articles = require('../data/learningSeed');

async function run() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('[seed:learning] No database connection - set MONGODB_URI in backend/.env first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const article of articles) {
    const existed = await LearningArticle.exists({ title: article.title });
    await LearningArticle.findOneAndUpdate(
      { title: article.title },
      { $set: article },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    existed ? (updated += 1) : (created += 1);
  }

  console.log(`[seed:learning] Done. Created ${created}, updated ${updated}, total ${articles.length}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed:learning] Failed:', err);
  process.exit(1);
});

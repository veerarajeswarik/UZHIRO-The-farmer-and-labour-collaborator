const mongoose = require('mongoose');

/**
 * Real Indian government agricultural schemes only. Every document here
 * must be backed by a verified, real official source URL and researched
 * facts - eligibility and benefits are never invented or guessed. See each
 * scheme's `officialSourceUrl`/`sourceName`. Where a figure can vary by
 * state or change over time, that is stated explicitly rather than
 * presented as a fixed guarantee.
 */
const governmentSchemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    eligibility: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: { validator: (a) => a.length > 0, message: 'At least one eligibility point is required.' },
    },
    benefits: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: { validator: (a) => a.length > 0, message: 'At least one benefit is required.' },
    },
    applicationInfo: { type: String, required: true, trim: true },
    officialSourceUrl: { type: String, required: true, trim: true },
    sourceName: { type: String, required: true, trim: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);

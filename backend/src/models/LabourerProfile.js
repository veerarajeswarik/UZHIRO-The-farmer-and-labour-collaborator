const mongoose = require('mongoose');

const WORK_TYPES = ['Harvesting', 'Planting', 'Weeding', 'Irrigation', 'Ploughing', 'General Farm Work'];

const workHistoryEntrySchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 300 },
    year: { type: Number, min: 1990 },
  },
  { _id: false }
);

/**
 * Work-specific data for a user with role "labourer". workTypes/
 * experienceYears/dailyWage/availability are captured at registration
 * (Phase B). Marketplace-facing fields added here in Phase G:
 * description/workHistory are labourer-editable; rating/ratingCount are
 * system-managed (null/0 for real accounts until a review system exists -
 * there is no review feature yet, so these stay honest rather than
 * fabricated). Demo seed profiles carry illustrative example ratings,
 * clearly marked `isDemoData`.
 */
const labourerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    workTypes: {
      type: [{ type: String, enum: WORK_TYPES }],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one work type is required',
      },
      index: true,
    },
    experienceYears: { type: Number, required: true, min: 0 },
    dailyWage: { type: Number, required: true, min: 0 },
    availability: { type: Boolean, default: true, index: true },

    description: { type: String, trim: true, maxlength: 500 },
    workHistory: [workHistoryEntrySchema],
    rating: { type: Number, min: 0, max: 5, default: null },
    ratingCount: { type: Number, default: 0, min: 0 },

    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabourerProfile', labourerProfileSchema);
module.exports.WORK_TYPES = WORK_TYPES;

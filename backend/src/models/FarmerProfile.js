const mongoose = require('mongoose');

const SOIL_TYPES = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Sandy Soil', 'Clay Soil', 'Other'];
const WATER_LEVELS = ['Low', 'Moderate', 'High'];

/**
 * Farm-specific data for a user with role "farmer". One profile per user.
 */
const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Farm
    farmName: { type: String, trim: true, maxlength: 120 },
    landAreaAcres: { type: Number, min: 0 },
    soilType: { type: String, enum: SOIL_TYPES },
    waterAvailability: { type: String, enum: WATER_LEVELS },

    // Optional
    previousCrops: [{ type: String, trim: true }],
    farmingExperienceYears: { type: Number, min: 0 },
    farmingPreferences: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
module.exports.SOIL_TYPES = SOIL_TYPES;
module.exports.WATER_LEVELS = WATER_LEVELS;

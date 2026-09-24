const mongoose = require('mongoose');

const SOIL_TYPES = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Sandy Soil', 'Clay Soil', 'Other'];
const WATER_LEVELS = ['Low', 'Moderate', 'High'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Year-round'];

const cultivationStageSchema = new mongoose.Schema(
  {
    stage: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

/**
 * Example/prototype per-acre economics used to seed the Cost & Profit
 * Estimator. These are NOT live prices - real seed/fertilizer prices come
 * from the Product catalog (Phase E) and real selling prices from the
 * Market Price service (Phase F). Until then, every figure here is a
 * labeled example the farmer can override.
 */
const economicsSchema = new mongoose.Schema(
  {
    seedCostPerAcre: { type: Number, required: true, min: 0 },
    fertilizerCostPerAcre: { type: Number, required: true, min: 0 },
    labourCostPerAcre: { type: Number, required: true, min: 0 },
    irrigationCostPerAcre: { type: Number, required: true, min: 0 },
    cropProtectionCostPerAcre: { type: Number, required: true, min: 0 },
    otherCostPerAcre: { type: Number, required: true, min: 0 },
    yieldPerAcreKg: { type: Number, required: true, min: 0 },
    sellingPricePerKg: { type: Number, required: true, min: 0 },
    isExampleData: { type: Boolean, default: true },
    note: {
      type: String,
      default:
        'Example/Prototype estimate - approximate figures for demonstration only, not live pricing. Replace with real input prices and market prices once available, or enter your own known costs.',
    },
  },
  { _id: false }
);

/**
 * Crop reference data used by the recommendation/comparison engine.
 * This is a compiled prototype dataset (see `source`/`lastUpdated`) based on
 * standard crop cultivation guidelines - not live pricing or a government
 * source. Farmers should verify locally before final decisions.
 */
const cropSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },

    suitableSoils: {
      type: [{ type: String, enum: SOIL_TYPES }],
      required: true,
      validate: { validator: (a) => a.length > 0, message: 'At least one suitable soil is required.' },
    },
    waterRequirement: { type: String, enum: WATER_LEVELS, required: true },
    suitableSeasons: {
      type: [{ type: String, enum: SEASONS }],
      required: true,
      validate: { validator: (a) => a.length > 0, message: 'At least one suitable season is required.' },
    },
    // Best-effort location/climate signal - matched loosely against the
    // farmer's free-text location. Not a precise geo/climate model.
    suitableRegions: [{ type: String, trim: true }],

    cultivationDurationDays: { type: Number, required: true, min: 1 },
    seedRequirementPerAcreKg: { type: Number, required: true, min: 0 },
    fertilizerRequirements: { type: String, trim: true },
    commonPests: [{ type: String, trim: true }],
    cultivationStages: [cultivationStageSchema],
    advantages: [{ type: String, trim: true }],
    considerations: [{ type: String, trim: true }],

    economics: economicsSchema,

    source: { type: String, trim: true, default: 'Compiled prototype reference dataset - verify with local agricultural extension services.' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', cropSchema);
module.exports.SOIL_TYPES = SOIL_TYPES;
module.exports.WATER_LEVELS = WATER_LEVELS;
module.exports.SEASONS = SEASONS;

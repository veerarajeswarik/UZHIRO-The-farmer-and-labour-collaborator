const mongoose = require('mongoose');

/**
 * Cached market price records. Every document here is populated ONLY from a
 * real fetch against the configured market price source (see
 * services/marketPrice.service.js) - this collection is never seeded with
 * invented numbers. If no live fetch has ever succeeded for a crop, no
 * document exists for it and the API reports the price as unavailable.
 */
const marketPriceSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true, trim: true, index: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', default: null },

    market: { type: String, required: true, trim: true },
    location: { type: String, trim: true },

    price: { type: Number, required: true, min: 0 }, // = modalPrice, kept for convenience
    unit: { type: String, required: true, trim: true, default: 'per quintal' },
    minPrice: { type: Number, min: 0 },
    maxPrice: { type: Number, min: 0 },
    modalPrice: { type: Number, required: true, min: 0 },

    date: { type: Date, required: true }, // the market's arrival/price date, not our fetch time
    source: { type: String, required: true, trim: true },
    fetchedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

marketPriceSchema.index({ cropName: 1, market: 1, date: -1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);

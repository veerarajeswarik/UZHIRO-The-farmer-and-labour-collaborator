const mongoose = require('mongoose');

const CATEGORIES = ['Seeds', 'Fertilizers', 'Organic Manure', 'Pesticides', 'Farming Tools'];

/**
 * Agricultural input catalog. `purchaseUrl` must always be a real, verified
 * link (or null) - never a fabricated product/listing URL. When no
 * reliable link exists, leave purchaseUrl unset and the UI shows
 * "Purchase link unavailable" instead of guessing.
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    // Optional: set for crop-specific items like seeds; left null for
    // generic inputs (fertilizer, tools, ...) usable across crops.
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', default: null },

    description: { type: String, trim: true },
    unit: { type: String, required: true, trim: true }, // e.g. "per kg", "per 45kg bag", "per litre"
    estimatedPrice: { type: Number, required: true, min: 0 },

    // Null when no verified online seller exists for this item (see purchaseUrl).
    seller: { type: String, trim: true, default: null },
    purchaseUrl: { type: String, trim: true, default: null },

    isExampleData: { type: Boolean, default: true },
    source: {
      type: String,
      trim: true,
      default:
        'Example/Prototype estimate - approximate price for demonstration, not live pricing. Follow the purchase link for current price and availability.',
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, crop: 1 });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;

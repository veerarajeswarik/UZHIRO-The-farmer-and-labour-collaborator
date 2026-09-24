const mongoose = require('mongoose');

const CATEGORIES = [
  'Crop cultivation',
  'Soil management',
  'Water management',
  'Pest management',
  'Natural farming',
  'Organic farming',
  'Seed selection',
  'Harvesting',
  'Storage',
  'Market awareness',
];

/**
 * Learning Hub content. General agricultural awareness material compiled
 * from widely published, uncontroversial farming practice knowledge - not
 * verbatim government text and not presented as official policy. See
 * `source` on each article.
 */
const learningArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    source: { type: String, required: true, trim: true },
  },
  { timestamps: true } // updatedAt covers the spec's "updatedAt" field
);

module.exports = mongoose.model('LearningArticle', learningArticleSchema);
module.exports.CATEGORIES = CATEGORIES;

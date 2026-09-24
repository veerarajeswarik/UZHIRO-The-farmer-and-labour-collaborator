const { body } = require('express-validator');
const { SOIL_TYPES, WATER_LEVELS, SEASONS } = require('../models/Crop');
const { CATEGORIES: PRODUCT_CATEGORIES } = require('../models/Product');
const { CATEGORIES: LEARNING_CATEGORIES } = require('../models/LearningArticle');

const createCropValidators = [
  body('name').trim().notEmpty().withMessage('Crop name is required.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('suitableSoils').isArray({ min: 1 }).withMessage('At least one suitable soil is required.'),
  body('suitableSoils.*').isIn(SOIL_TYPES).withMessage(`Soil must be one of: ${SOIL_TYPES.join(', ')}.`),
  body('waterRequirement').isIn(WATER_LEVELS).withMessage(`Water requirement must be one of: ${WATER_LEVELS.join(', ')}.`),
  body('suitableSeasons').isArray({ min: 1 }).withMessage('At least one suitable season is required.'),
  body('suitableSeasons.*').isIn(SEASONS).withMessage(`Season must be one of: ${SEASONS.join(', ')}.`),
  body('cultivationDurationDays').isFloat({ min: 1 }).withMessage('Cultivation duration (days) must be a positive number.'),
  body('seedRequirementPerAcreKg').isFloat({ min: 0 }).withMessage('Seed requirement must be a non-negative number.'),
];

const updateCropValidators = [
  body('suitableSoils').optional().isArray({ min: 1 }),
  body('suitableSoils.*').optional().isIn(SOIL_TYPES),
  body('waterRequirement').optional().isIn(WATER_LEVELS),
  body('suitableSeasons').optional().isArray({ min: 1 }),
  body('suitableSeasons.*').optional().isIn(SEASONS),
  body('cultivationDurationDays').optional().isFloat({ min: 1 }),
  body('seedRequirementPerAcreKg').optional().isFloat({ min: 0 }),
];

const createProductValidators = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('category').isIn(PRODUCT_CATEGORIES).withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}.`),
  body('unit').trim().notEmpty().withMessage('Unit is required (e.g. "per kg").'),
  body('estimatedPrice').isFloat({ min: 0 }).withMessage('Estimated price must be a non-negative number.'),
  body('crop').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid crop.'),
  body('purchaseUrl').optional({ checkFalsy: true }).isURL().withMessage('Purchase URL must be a valid, real URL.'),
];

const updateProductValidators = [
  body('category').optional().isIn(PRODUCT_CATEGORIES),
  body('estimatedPrice').optional().isFloat({ min: 0 }),
  body('crop').optional({ checkFalsy: true, nullable: true }).isMongoId(),
  body('purchaseUrl').optional({ checkFalsy: true }).isURL().withMessage('Purchase URL must be a valid, real URL.'),
];

const createMarketPriceValidators = [
  body('cropName').trim().notEmpty().withMessage('Crop name is required.'),
  body('market').trim().notEmpty().withMessage('Market/mandi name is required.'),
  body('modalPrice').isFloat({ min: 0 }).withMessage('Modal price must be a non-negative number.'),
  body('date').isISO8601().withMessage('A valid price date is required.'),
];

const createArticleValidators = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('category').isIn(LEARNING_CATEGORIES).withMessage(`Category must be one of: ${LEARNING_CATEGORIES.join(', ')}.`),
  body('summary').trim().notEmpty().isLength({ max: 300 }).withMessage('Summary is required (max 300 characters).'),
  body('content').trim().notEmpty().withMessage('Content is required.'),
];

const updateArticleValidators = [body('category').optional().isIn(LEARNING_CATEGORIES)];

const createSchemeValidators = [
  body('name').trim().notEmpty().withMessage('Scheme name is required.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('eligibility').custom((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v))).withMessage('At least one eligibility point is required.'),
  body('benefits').custom((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v))).withMessage('At least one benefit is required.'),
  body('applicationInfo').trim().notEmpty().withMessage('Application info is required.'),
  body('officialSourceUrl').isURL().withMessage('A valid official source URL is required.'),
  body('sourceName').trim().notEmpty().withMessage('Source name is required.'),
];

module.exports = {
  createCropValidators,
  updateCropValidators,
  createProductValidators,
  updateProductValidators,
  createMarketPriceValidators,
  createArticleValidators,
  updateArticleValidators,
  createSchemeValidators,
};

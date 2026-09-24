const { body } = require('express-validator');
const { SOIL_TYPES, WATER_LEVELS } = require('../models/FarmerProfile');

const updateProfileValidators = [
  body('farmName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('landAreaAcres').optional().isFloat({ min: 0 }).withMessage('Land area must be a non-negative number.'),
  body('soilType')
    .optional()
    .isIn(SOIL_TYPES)
    .withMessage(`Soil type must be one of: ${SOIL_TYPES.join(', ')}.`),
  body('waterAvailability')
    .optional()
    .isIn(WATER_LEVELS)
    .withMessage(`Water availability must be one of: ${WATER_LEVELS.join(', ')}.`),
  body('previousCrops').optional().isArray().withMessage('Previous crops must be a list.'),
  body('farmingExperienceYears')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Farming experience must be a non-negative number.'),
  body('farmingPreferences').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

module.exports = { updateProfileValidators };

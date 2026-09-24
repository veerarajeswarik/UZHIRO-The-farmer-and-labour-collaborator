const { body } = require('express-validator');

const OVERRIDABLE_FIELDS = [
  'seedCostPerAcre',
  'fertilizerCostPerAcre',
  'labourCostPerAcre',
  'irrigationCostPerAcre',
  'cropProtectionCostPerAcre',
  'otherCostPerAcre',
  'yieldPerAcreKg',
  'sellingPricePerKg',
];

const estimateValidators = [
  body('cropId').isMongoId().withMessage('A valid crop is required.'),
  body('landAreaAcres')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Land area must be a number greater than zero.'),
  ...OVERRIDABLE_FIELDS.map((field) =>
    body(field).optional().isFloat({ min: 0 }).withMessage(`${field} must be a non-negative number.`)
  ),
];

module.exports = { estimateValidators, OVERRIDABLE_FIELDS };

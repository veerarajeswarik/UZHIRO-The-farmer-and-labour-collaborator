const { body } = require('express-validator');
const { WORK_TYPES } = require('../models/LabourerProfile');

const updateProfileValidators = [
  body('workTypes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Select at least one work type.')
    .custom((arr) => arr.every((w) => WORK_TYPES.includes(w)))
    .withMessage(`Work types must be one of: ${WORK_TYPES.join(', ')}.`),
  body('experienceYears').optional().isFloat({ min: 0 }).withMessage('Experience (years) must be a non-negative number.'),
  body('dailyWage').optional().isFloat({ min: 0 }).withMessage('Daily wage must be a non-negative number.'),
  body('availability').optional().isBoolean().withMessage('Availability must be true or false.'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('workHistory').optional().isArray().withMessage('Work history must be a list.'),
  body('workHistory.*.description').optional().trim().notEmpty().withMessage('Each work history entry needs a description.'),
  body('workHistory.*.year').optional().isInt({ min: 1990 }).withMessage('Work history year must be valid.'),
];

module.exports = { updateProfileValidators };

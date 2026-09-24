const { body } = require('express-validator');
const { WORK_TYPES } = require('../models/LabourerProfile');
const { STATUSES } = require('../models/HiringRequest');

const createValidators = [
  body('labourerId').isMongoId().withMessage('A valid labourer is required.'),
  body('workType').isIn(WORK_TYPES).withMessage(`Work type must be one of: ${WORK_TYPES.join(', ')}.`),
  body('workDate').isISO8601().withMessage('A valid work date is required.'),
  body('numberOfDays').isInt({ min: 1 }).withMessage('Number of days must be at least 1.'),
  body('farmLocation').trim().notEmpty().withMessage('Farm location is required.'),
  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

const statusValidators = [body('status').isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}.`)];

module.exports = { createValidators, statusValidators };

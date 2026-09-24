const { body } = require('express-validator');
const { TASK_TYPES } = require('../models/FarmTask');

const createValidators = [
  body('title').trim().notEmpty().withMessage('Task title is required.'),
  body('type').isIn(TASK_TYPES).withMessage(`Type must be one of: ${TASK_TYPES.join(', ')}.`),
  body('dueDate').isISO8601().withMessage('A valid due date is required.'),
  body('cropId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid crop.'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

const updateValidators = [
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty.'),
  body('type').optional().isIn(TASK_TYPES).withMessage(`Type must be one of: ${TASK_TYPES.join(', ')}.`),
  body('dueDate').optional().isISO8601().withMessage('A valid due date is required.'),
  body('cropId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid crop.'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('status').optional().isIn(['Pending', 'Completed']).withMessage('Status must be Pending or Completed.'),
];

const generateFromCropValidators = [
  body('cropId').isMongoId().withMessage('A valid crop is required.'),
  body('plantingDate').isISO8601().withMessage('A valid planting date is required.'),
];

module.exports = { createValidators, updateValidators, generateFromCropValidators };

const { body } = require('express-validator');

const chatValidators = [
  body('message').trim().notEmpty().withMessage('Please enter a message.').isLength({ max: 2000 }).withMessage('Message is too long (max 2000 characters).'),
  body('history').optional().isArray().withMessage('History must be a list.'),
  body('history.*.role').optional().isIn(['user', 'assistant']).withMessage('Invalid history entry role.'),
  body('history.*.content').optional().isString().isLength({ max: 4000 }),
  body('cropId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid crop.'),
  body('includeWeather').optional().isBoolean(),
  body('saveHistory').optional().isBoolean(),
];

module.exports = { chatValidators };

const { body } = require('express-validator');
const { WORK_TYPES } = require('../models/LabourerProfile');

const baseFields = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('role').isIn(['farmer', 'labourer']).withMessage('Role must be farmer or labourer.'),
];

// Labourer-only fields, required only when role === 'labourer'.
const labourerFields = [
  body('workTypes')
    .if(body('role').equals('labourer'))
    .isArray({ min: 1 })
    .withMessage('Select at least one work type.')
    .custom((arr) => arr.every((w) => WORK_TYPES.includes(w)))
    .withMessage(`Work types must be one of: ${WORK_TYPES.join(', ')}.`),
  body('experienceYears')
    .if(body('role').equals('labourer'))
    .isFloat({ min: 0 })
    .withMessage('Experience (years) must be a non-negative number.'),
  body('dailyWage')
    .if(body('role').equals('labourer'))
    .isFloat({ min: 0 })
    .withMessage('Daily wage must be a non-negative number.'),
  body('availability')
    .if(body('role').equals('labourer'))
    .optional()
    .isBoolean()
    .withMessage('Availability must be true or false.'),
];

const registerValidators = [...baseFields, ...labourerFields];

const loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = { registerValidators, loginValidators };

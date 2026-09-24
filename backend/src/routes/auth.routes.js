const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidators, loginValidators } = require('../validators/auth.validators');
const { handleValidation } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tighter limit on auth endpoints to slow down credential stuffing/brute force.
// Skipped under the automated test suite (Jest sets NODE_ENV=test), which
// legitimately makes many register/login calls in one run.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, registerValidators, handleValidation, register);
router.post('/login', authLimiter, loginValidators, handleValidation, login);
router.get('/me', protect, getMe);

module.exports = router;

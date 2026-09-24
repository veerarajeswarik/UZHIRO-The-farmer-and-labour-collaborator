const express = require('express');
const rateLimit = require('express-rate-limit');
const { chat, getHistory, clearHistory } = require('../controllers/ai.controller');
const { chatValidators } = require('../validators/ai.validators');
const { handleValidation } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('farmer'));

// AI calls cost money and take longer - keep a tighter limit than the general API.
// Skipped under the automated test suite (Jest sets NODE_ENV=test).
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many messages sent - please wait a bit before asking again.' },
});

router.post('/chat', chatLimiter, chatValidators, handleValidation, chat);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

module.exports = router;

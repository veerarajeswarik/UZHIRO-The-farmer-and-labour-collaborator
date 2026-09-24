const express = require('express');
const { estimateProfit } = require('../controllers/profit.controller');
const { estimateValidators } = require('../validators/profit.validators');
const { handleValidation } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('farmer'));

router.post('/estimate', estimateValidators, handleValidation, estimateProfit);

module.exports = router;

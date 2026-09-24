const express = require('express');
const { listCrops, getCropById, getRecommendations, compareCrops, explainCrop } = require('../controllers/crop.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public browsing of the crop reference database.
router.get('/', listCrops);

// Farmer-specific, so declared before the generic /:id route.
router.get('/recommendations', protect, authorize('farmer'), getRecommendations);
router.get('/compare', protect, authorize('farmer'), compareCrops);

router.get('/:id', getCropById);
router.get('/:id/explain', protect, authorize('farmer'), explainCrop);

module.exports = router;

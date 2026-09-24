const express = require('express');
const { getProfile, updateProfile } = require('../controllers/farmer.controller');
const { updateProfileValidators } = require('../validators/farmer.validators');
const { handleValidation } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('farmer'));

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidators, handleValidation, updateProfile);

module.exports = router;

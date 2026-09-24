const express = require('express');
const {
  getOwnProfile,
  updateOwnProfile,
  searchLabourers,
  getLabourerById,
} = require('../controllers/labourer.controller');
const { updateProfileValidators } = require('../validators/labourer.validators');
const { handleValidation } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Own profile - labourer only. Declared before /:id so "profile" is never treated as an id.
router.get('/profile', protect, authorize('labourer'), getOwnProfile);
router.put('/profile', protect, authorize('labourer'), updateProfileValidators, handleValidation, updateOwnProfile);

// Marketplace browsing - farmer only.
router.get('/', protect, authorize('farmer'), searchLabourers);
router.get('/:id', protect, authorize('farmer'), getLabourerById);

module.exports = router;

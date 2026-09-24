const express = require('express');
const { createRequest, listFarmerRequests, listLabourerRequests, updateStatus } = require('../controllers/hiring.controller');
const { createValidators, statusValidators } = require('../validators/hiring.validators');
const { handleValidation } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('farmer'), createValidators, handleValidation, createRequest);
router.get('/farmer', protect, authorize('farmer'), listFarmerRequests);
router.get('/labourer', protect, authorize('labourer'), listLabourerRequests);
router.put('/:id/status', protect, authorize('farmer', 'labourer'), statusValidators, handleValidation, updateStatus);

module.exports = router;

const express = require('express');
const { listProducts, getProductById, getInputChecklist } = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', listProducts);
router.get('/for-crop/:cropId', protect, authorize('farmer'), getInputChecklist);
router.get('/:id', getProductById);

module.exports = router;

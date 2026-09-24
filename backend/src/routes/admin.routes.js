const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const adminUsers = require('../controllers/admin/adminUsers.controller');
const adminCrops = require('../controllers/admin/adminCrops.controller');
const adminProducts = require('../controllers/admin/adminProducts.controller');
const adminMarketPrices = require('../controllers/admin/adminMarketPrices.controller');
const adminLearning = require('../controllers/admin/adminLearning.controller');
const adminSchemes = require('../controllers/admin/adminSchemes.controller');
const adminReports = require('../controllers/admin/adminReports.controller');

const {
  createCropValidators,
  updateCropValidators,
  createProductValidators,
  updateProductValidators,
  createMarketPriceValidators,
  createArticleValidators,
  updateArticleValidators,
  createSchemeValidators,
} = require('../validators/admin.validators');

const router = express.Router();

// Every route below is admin-only - never exposed to farmers or labourers.
router.use(protect, authorize('admin'));

// Reports
router.get('/reports', adminReports.getReports);

// Users
router.get('/users', adminUsers.listUsers);
router.get('/users/:id', adminUsers.getUserById);
router.put('/users/:id/deactivate', adminUsers.deactivateUser);
router.put('/users/:id/activate', adminUsers.activateUser);
router.delete('/users/:id', adminUsers.deleteUser);

// Crops
router.get('/crops', adminCrops.listCrops);
router.post('/crops', createCropValidators, handleValidation, adminCrops.createCrop);
router.put('/crops/:id', updateCropValidators, handleValidation, adminCrops.updateCrop);
router.delete('/crops/:id', adminCrops.deleteCrop);

// Products
router.get('/products', adminProducts.listProducts);
router.post('/products', createProductValidators, handleValidation, adminProducts.createProduct);
router.put('/products/:id', updateProductValidators, handleValidation, adminProducts.updateProduct);
router.delete('/products/:id', adminProducts.deleteProduct);

// Market data
router.get('/market-prices', adminMarketPrices.listMarketPrices);
router.post('/market-prices', createMarketPriceValidators, handleValidation, adminMarketPrices.createMarketPrice);
router.put('/market-prices/:id', adminMarketPrices.updateMarketPrice);
router.delete('/market-prices/:id', adminMarketPrices.deleteMarketPrice);

// Learning content
router.get('/learning', adminLearning.listArticles);
router.post('/learning', createArticleValidators, handleValidation, adminLearning.createArticle);
router.put('/learning/:id', updateArticleValidators, handleValidation, adminLearning.updateArticle);
router.delete('/learning/:id', adminLearning.deleteArticle);

// Government schemes
router.get('/schemes', adminSchemes.listSchemes);
router.post('/schemes', createSchemeValidators, handleValidation, adminSchemes.createScheme);
router.put('/schemes/:id', adminSchemes.updateScheme);
router.delete('/schemes/:id', adminSchemes.deleteScheme);

module.exports = router;

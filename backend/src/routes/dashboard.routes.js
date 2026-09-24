const express = require('express');
const { getDashboard } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('farmer', 'labourer'), getDashboard);

module.exports = router;

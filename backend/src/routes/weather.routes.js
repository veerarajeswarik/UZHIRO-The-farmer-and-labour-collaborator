const express = require('express');
const { getWeather } = require('../controllers/weather.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('farmer'), getWeather);

module.exports = router;

const asyncHandler = require('express-async-handler');
const { getWeatherForLocation } = require('../services/weather.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/weather?location=<override> (protected, farmer only)
const getWeather = asyncHandler(async (req, res) => {
  const locationText = req.query.location || req.user.location;
  if (!locationText) {
    return sendError(res, 400, 'Please set a location in your profile, or provide one to look up.');
  }

  try {
    const weather = await getWeatherForLocation(locationText);
    sendSuccess(res, 200, weather);
  } catch (err) {
    if (err.code === 'LOCATION_NOT_FOUND') {
      return sendError(res, 404, err.message);
    }
    // Weather service unreachable/erroring - report honestly, never fabricate.
    return sendError(res, 503, `Weather data is temporarily unavailable. ${err.message}`);
  }
});

module.exports = { getWeather };

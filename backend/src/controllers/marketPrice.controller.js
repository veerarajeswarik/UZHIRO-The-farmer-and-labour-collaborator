const asyncHandler = require('express-async-handler');
const Crop = require('../models/Crop');
const { getMarketPrice } = require('../services/marketPrice.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

function serialize(result, crop) {
  if (result.available) {
    const r = result.record;
    return {
      available: true,
      crop: { id: crop._id, name: crop.name },
      market: r.market,
      location: r.location,
      price: r.price,
      unit: r.unit,
      minPrice: r.minPrice ?? null,
      maxPrice: r.maxPrice ?? null,
      modalPrice: r.modalPrice,
      date: r.date,
      updatedLabel: `Price data updated on ${new Date(r.date).toLocaleDateString('en-IN')}`,
      source: r.source,
      stale: Boolean(result.stale),
      staleNote: result.stale
        ? 'Could not reach the live price source just now - showing the most recent price we have on file.'
        : null,
    };
  }

  return {
    available: false,
    crop: { id: crop._id, name: crop.name },
    reason: result.reason,
    message: 'Live market price is not available right now for this crop.',
    fallback: crop.economics
      ? {
          price: crop.economics.sellingPricePerKg,
          unit: 'per kg',
          label: 'Example/Prototype estimate - not live pricing.',
        }
      : null,
  };
}

// GET /api/market-prices?crop=Groundnut&state=&market=  (public)
const getPriceByCropName = asyncHandler(async (req, res) => {
  const cropName = req.query.crop;
  if (!cropName) return sendError(res, 400, 'Please provide a crop name.');

  const crop = await Crop.findOne({ name: cropName });
  if (!crop) return sendError(res, 404, 'Crop not found.');

  const result = await getMarketPrice(crop.name, { cropId: crop._id, state: req.query.state, market: req.query.market });
  sendSuccess(res, 200, serialize(result, crop));
});

// GET /api/market-prices/:cropId (public)
const getPriceByCropId = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.cropId).catch(() => null);
  if (!crop) return sendError(res, 404, 'Crop not found.');

  const result = await getMarketPrice(crop.name, { cropId: crop._id, state: req.query.state, market: req.query.market });
  sendSuccess(res, 200, serialize(result, crop));
});

module.exports = { getPriceByCropName, getPriceByCropId };

const asyncHandler = require('express-async-handler');
const Crop = require('../models/Crop');
const FarmerProfile = require('../models/FarmerProfile');
const { calculateProfit } = require('../services/profitCalculator.service');
const { getMarketPrice } = require('../services/marketPrice.service');
const { OVERRIDABLE_FIELDS } = require('../validators/profit.validators');
const { sendSuccess, sendError } = require('../utils/apiResponse');

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * POST /api/profit/estimate (protected, farmer only)
 *
 * Body: { cropId, landAreaAcres?, seedCostPerAcre?, fertilizerCostPerAcre?,
 *         labourCostPerAcre?, irrigationCostPerAcre?, cropProtectionCostPerAcre?,
 *         otherCostPerAcre?, yieldPerAcreKg?, sellingPricePerKg? }
 *
 * Starts from the crop's example/prototype economics (Phase D), overridden
 * field-by-field by anything the farmer supplies. Land area defaults to the
 * farmer's farm profile if not provided. sellingPricePerKg additionally
 * tries a real, dated market price (Phase F) before falling back to the
 * example - see fieldSources.sellingPricePerKg ('user-provided' |
 * 'market-price' | 'example'). Every response says which fields are still
 * example data vs. real vs. farmer-supplied, per the "never present demo
 * values as live information" rule.
 */
const estimateProfit = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.body.cropId).catch(() => null);
  if (!crop) return sendError(res, 404, 'Crop not found.');

  if (!crop.economics) {
    return sendError(res, 404, 'Cost and profit estimates are not yet available for this crop.');
  }

  const profile = await FarmerProfile.findOne({ user: req.user._id });
  const landAreaAcres = req.body.landAreaAcres ?? profile?.landAreaAcres;

  if (!landAreaAcres || landAreaAcres <= 0) {
    return sendError(
      res,
      400,
      'Please provide a land area, or set your land area (acres) in your farm profile.'
    );
  }

  const fieldSources = {};
  const resolvedInputs = { landAreaAcres };
  let marketPriceMeta = null;

  for (const field of OVERRIDABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      resolvedInputs[field] = req.body[field];
      fieldSources[field] = 'user-provided';
      continue;
    }

    if (field === 'sellingPricePerKg') {
      const marketResult = await getMarketPrice(crop.name, { cropId: crop._id });
      if (marketResult.available) {
        resolvedInputs.sellingPricePerKg = round2(marketResult.record.modalPrice / 100); // quintal -> kg
        fieldSources.sellingPricePerKg = 'market-price';
        marketPriceMeta = {
          market: marketResult.record.market,
          location: marketResult.record.location,
          date: marketResult.record.date,
          source: marketResult.record.source,
          stale: Boolean(marketResult.stale),
        };
        continue;
      }
    }

    resolvedInputs[field] = crop.economics[field];
    fieldSources[field] = 'example';
  }

  let result;
  try {
    result = calculateProfit(resolvedInputs);
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  const usingAnyExampleData = Object.values(fieldSources).some((s) => s === 'example');

  sendSuccess(res, 200, {
    crop: { id: crop._id, name: crop.name },
    landAreaAcres,
    inputs: resolvedInputs,
    fieldSources,
    marketPrice: marketPriceMeta,
    usingExampleData: usingAnyExampleData,
    result,
    disclaimer: usingAnyExampleData
      ? `${crop.economics.note} Figures you did not override above use these example values.`
      : 'This estimate uses real market pricing and/or your own figures. Actual costs, yield and prices may still vary - treat this as planning guidance, not a guarantee.',
  });
});

module.exports = { estimateProfit };

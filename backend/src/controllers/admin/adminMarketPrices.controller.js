const asyncHandler = require('express-async-handler');
const MarketPrice = require('../../models/MarketPrice');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const { escapeRegex } = require('../../utils/regex');

const ALLOWED_FIELDS = ['cropName', 'crop', 'market', 'location', 'price', 'unit', 'minPrice', 'maxPrice', 'modalPrice', 'date', 'source'];

function pickFields(body) {
  const out = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

// GET /api/admin/market-prices?cropName=
const listMarketPrices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.cropName) filter.cropName = new RegExp(escapeRegex(req.query.cropName.trim()), 'i');

  const prices = await MarketPrice.find(filter).sort({ date: -1 }).limit(200);
  sendSuccess(res, 200, { prices, count: prices.length });
});

// POST /api/admin/market-prices - manual entry. Honestly labeled as
// admin-entered, distinct from the auto-fetched Agmarknet records (Phase F)
// - never presented as if it came from the live source.
const createMarketPrice = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body);
  const price = await MarketPrice.create({
    ...fields,
    modalPrice: fields.modalPrice ?? fields.price,
    price: fields.price ?? fields.modalPrice,
    source: fields.source || 'Manually entered by admin.',
    fetchedAt: new Date(),
  });
  sendSuccess(res, 201, { price });
});

// PUT /api/admin/market-prices/:id
const updateMarketPrice = asyncHandler(async (req, res) => {
  const price = await MarketPrice.findByIdAndUpdate(
    req.params.id,
    { $set: pickFields(req.body) },
    { new: true, runValidators: true }
  );
  if (!price) return sendError(res, 404, 'Market price record not found.');
  sendSuccess(res, 200, { price });
});

// DELETE /api/admin/market-prices/:id
const deleteMarketPrice = asyncHandler(async (req, res) => {
  const price = await MarketPrice.findByIdAndDelete(req.params.id);
  if (!price) return sendError(res, 404, 'Market price record not found.');
  sendSuccess(res, 200, { deleted: true });
});

module.exports = { listMarketPrices, createMarketPrice, updateMarketPrice, deleteMarketPrice };

const asyncHandler = require('express-async-handler');
const Crop = require('../../models/Crop');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const ALLOWED_FIELDS = [
  'name',
  'description',
  'suitableSoils',
  'waterRequirement',
  'suitableSeasons',
  'suitableRegions',
  'cultivationDurationDays',
  'seedRequirementPerAcreKg',
  'fertilizerRequirements',
  'commonPests',
  'cultivationStages',
  'advantages',
  'considerations',
  'economics',
  'source',
];

function pickFields(body) {
  const out = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

// GET /api/admin/crops
const listCrops = asyncHandler(async (req, res) => {
  const crops = await Crop.find().sort({ name: 1 });
  sendSuccess(res, 200, { crops, count: crops.length });
});

// POST /api/admin/crops
const createCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.create({ ...pickFields(req.body), lastUpdated: new Date() });
  sendSuccess(res, 201, { crop });
});

// PUT /api/admin/crops/:id
const updateCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findByIdAndUpdate(
    req.params.id,
    { $set: { ...pickFields(req.body), lastUpdated: new Date() } },
    { new: true, runValidators: true }
  );
  if (!crop) return sendError(res, 404, 'Crop not found.');
  sendSuccess(res, 200, { crop });
});

// DELETE /api/admin/crops/:id
const deleteCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findByIdAndDelete(req.params.id);
  if (!crop) return sendError(res, 404, 'Crop not found.');
  sendSuccess(res, 200, {
    deleted: true,
    note: 'Products, tasks or recommendations referencing this crop will no longer resolve it - review those separately.',
  });
});

module.exports = { listCrops, createCrop, updateCrop, deleteCrop };

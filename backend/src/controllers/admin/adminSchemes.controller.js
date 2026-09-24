const asyncHandler = require('express-async-handler');
const GovernmentScheme = require('../../models/GovernmentScheme');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const ALLOWED_FIELDS = [
  'name',
  'category',
  'description',
  'eligibility',
  'benefits',
  'applicationInfo',
  'officialSourceUrl',
  'sourceName',
];

function pickFields(body) {
  const out = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

// GET /api/admin/schemes
const listSchemes = asyncHandler(async (req, res) => {
  const schemes = await GovernmentScheme.find().sort({ name: 1 });
  sendSuccess(res, 200, { schemes, count: schemes.length });
});

// POST /api/admin/schemes
const createScheme = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.create({ ...pickFields(req.body), lastUpdated: new Date() });
  sendSuccess(res, 201, { scheme });
});

// PUT /api/admin/schemes/:id
const updateScheme = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.findByIdAndUpdate(
    req.params.id,
    { $set: { ...pickFields(req.body), lastUpdated: new Date() } },
    { new: true, runValidators: true }
  );
  if (!scheme) return sendError(res, 404, 'Scheme not found.');
  sendSuccess(res, 200, { scheme });
});

// DELETE /api/admin/schemes/:id
const deleteScheme = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.findByIdAndDelete(req.params.id);
  if (!scheme) return sendError(res, 404, 'Scheme not found.');
  sendSuccess(res, 200, { deleted: true });
});

module.exports = { listSchemes, createScheme, updateScheme, deleteScheme };

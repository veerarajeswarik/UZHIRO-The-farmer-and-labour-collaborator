const asyncHandler = require('express-async-handler');
const GovernmentScheme = require('../models/GovernmentScheme');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/schemes?category= (public)
const listSchemes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;

  const schemes = await GovernmentScheme.find(filter).sort({ name: 1 });
  sendSuccess(res, 200, { schemes, count: schemes.length });
});

// GET /api/schemes/:id (public)
const getSchemeById = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.findById(req.params.id).catch(() => null);
  if (!scheme) return sendError(res, 404, 'Scheme not found.');
  sendSuccess(res, 200, { scheme });
});

module.exports = { listSchemes, getSchemeById };

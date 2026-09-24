const asyncHandler = require('express-async-handler');
const FarmerProfile = require('../models/FarmerProfile');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/farmers/profile (protected, farmer only)
const getProfile = asyncHandler(async (req, res) => {
  const profile = await FarmerProfile.findOne({ user: req.user._id });
  if (!profile) {
    return sendError(res, 404, 'Farm profile not found.');
  }
  sendSuccess(res, 200, {
    profile,
    personal: {
      name: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      location: req.user.location,
    },
  });
});

// PUT /api/farmers/profile (protected, farmer only)
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'farmName',
    'landAreaAcres',
    'soilType',
    'waterAvailability',
    'previousCrops',
    'farmingExperienceYears',
    'farmingPreferences',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const profile = await FarmerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  sendSuccess(res, 200, { profile });
});

module.exports = { getProfile, updateProfile };

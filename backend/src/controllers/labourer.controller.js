const asyncHandler = require('express-async-handler');
const LabourerProfile = require('../models/LabourerProfile');
const { sendSuccess, sendError } = require('../utils/apiResponse');

function serializeForSearch(profile) {
  return {
    id: profile._id,
    userId: profile.user._id,
    name: profile.user.name,
    location: profile.user.location,
    workTypes: profile.workTypes,
    experienceYears: profile.experienceYears,
    dailyWage: profile.dailyWage,
    availability: profile.availability,
    rating: profile.rating,
    ratingCount: profile.ratingCount,
    description: profile.description || '',
    isDemoData: profile.isDemoData,
  };
}

function serializeDetail(profile) {
  return {
    ...serializeForSearch(profile),
    workHistory: profile.workHistory || [],
  };
}

// GET /api/labourers/profile (protected, labourer only) - own profile.
const getOwnProfile = asyncHandler(async (req, res) => {
  const profile = await LabourerProfile.findOne({ user: req.user._id }).populate('user', 'name location phone email');
  if (!profile) return sendError(res, 404, 'Labourer profile not found.');
  sendSuccess(res, 200, { profile: serializeDetail(profile) });
});

// PUT /api/labourers/profile (protected, labourer only)
const updateOwnProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['workTypes', 'experienceYears', 'dailyWage', 'availability', 'description', 'workHistory'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const profile = await LabourerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('user', 'name location phone email');

  if (!profile) return sendError(res, 404, 'Labourer profile not found.');
  sendSuccess(res, 200, { profile: serializeDetail(profile) });
});

// GET /api/labourers?location=&workType=&availability=&minExperience=&maxWage= (protected, farmer only)
const searchLabourers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.workType) filter.workTypes = req.query.workType;
  if (req.query.availability !== undefined) filter.availability = req.query.availability === 'true';
  if (req.query.minExperience) filter.experienceYears = { $gte: Number(req.query.minExperience) };
  if (req.query.maxWage) filter.dailyWage = { $lte: Number(req.query.maxWage) };

  let profiles = await LabourerProfile.find(filter)
    .populate('user', 'name location phone email isActive')
    .sort({ rating: -1, createdAt: -1 });

  // Only show active accounts.
  profiles = profiles.filter((p) => p.user && p.user.isActive);

  if (req.query.location) {
    const loc = req.query.location.toLowerCase();
    profiles = profiles.filter((p) => p.user.location?.toLowerCase().includes(loc));
  }

  sendSuccess(res, 200, {
    labourers: profiles.map(serializeForSearch),
    count: profiles.length,
  });
});

// GET /api/labourers/:id (protected, farmer only) - detail by LabourerProfile id.
const getLabourerById = asyncHandler(async (req, res) => {
  const profile = await LabourerProfile.findById(req.params.id).populate('user', 'name location phone email isActive');
  if (!profile || !profile.user?.isActive) return sendError(res, 404, 'Labourer not found.');
  sendSuccess(res, 200, { labourer: serializeDetail(profile) });
});

module.exports = { getOwnProfile, updateOwnProfile, searchLabourers, getLabourerById };

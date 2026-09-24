const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const LabourerProfile = require('../models/LabourerProfile');
const { signToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 * Creates the User and, based on role, an empty/seeded FarmerProfile or a
 * LabourerProfile populated with the work fields collected at signup.
 * Admin accounts are not created through this public endpoint.
 */
const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password, location, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return sendError(res, 409, 'An account with this email already exists.');
  }

  const user = await User.create({ name, phone, email, password, location, role });

  if (role === 'farmer') {
    await FarmerProfile.create({ user: user._id });
  } else if (role === 'labourer') {
    const { workTypes, experienceYears, dailyWage, availability } = req.body;
    await LabourerProfile.create({
      user: user._id,
      workTypes,
      experienceYears,
      dailyWage,
      availability: availability ?? true,
    });
  }

  const token = signToken(user._id);
  sendSuccess(res, 201, { token, user: user.toSafeObject() });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 401, 'Invalid email or password.');
  }
  if (!user.isActive) {
    return sendError(res, 403, 'This account has been deactivated.');
  }

  const token = signToken(user._id);
  sendSuccess(res, 200, { token, user: user.toSafeObject() });
});

// GET /api/auth/me (protected)
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };

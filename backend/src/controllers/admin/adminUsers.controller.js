const asyncHandler = require('express-async-handler');
const User = require('../../models/User');
const FarmerProfile = require('../../models/FarmerProfile');
const LabourerProfile = require('../../models/LabourerProfile');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const { escapeRegex } = require('../../utils/regex');

// GET /api/admin/users?role=&isActive=&q=
const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.q) {
    const re = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    filter.$or = [{ name: re }, { email: re }, { phone: re }];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, 200, { users: users.map((u) => u.toSafeObject()), count: users.length });
});

// GET /api/admin/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).catch(() => null);
  if (!user) return sendError(res, 404, 'User not found.');

  let profile = null;
  if (user.role === 'farmer') profile = await FarmerProfile.findOne({ user: user._id });
  if (user.role === 'labourer') profile = await LabourerProfile.findOne({ user: user._id });

  sendSuccess(res, 200, { user: user.toSafeObject(), profile });
});

// PUT /api/admin/users/:id/deactivate
const deactivateUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return sendError(res, 400, 'You cannot deactivate your own account.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return sendError(res, 404, 'User not found.');
  sendSuccess(res, 200, { user: user.toSafeObject() });
});

// PUT /api/admin/users/:id/activate
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!user) return sendError(res, 404, 'User not found.');
  sendSuccess(res, 200, { user: user.toSafeObject() });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return sendError(res, 400, 'You cannot delete your own account.');
  }
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, 'User not found.');

  await Promise.all([
    FarmerProfile.deleteOne({ user: user._id }),
    LabourerProfile.deleteOne({ user: user._id }),
    user.deleteOne(),
  ]);

  sendSuccess(res, 200, { deleted: true });
});

module.exports = { listUsers, getUserById, deactivateUser, activateUser, deleteUser };

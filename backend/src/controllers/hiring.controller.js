const asyncHandler = require('express-async-handler');
const HiringRequest = require('../models/HiringRequest');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Who may move a request from one status to another, and to what.
const ALLOWED_TRANSITIONS = {
  Pending: { farmer: ['Cancelled'], labourer: ['Accepted', 'Rejected'] },
  Accepted: { farmer: ['Cancelled', 'Completed'], labourer: ['Completed'] },
  Rejected: {},
  Cancelled: {},
  Completed: {},
};

function serialize(request, viewerRole) {
  // Contact details are only shown once a request has moved past Pending,
  // so labourers/farmers aren't exposed to each other before either side
  // has actually agreed to anything.
  const canSeeContact = ['Accepted', 'Completed'].includes(request.status);

  return {
    id: request._id,
    status: request.status,
    workType: request.workType,
    workDate: request.workDate,
    numberOfDays: request.numberOfDays,
    farmLocation: request.farmLocation,
    message: request.message || '',
    createdAt: request.createdAt,
    farmer: {
      id: request.farmer._id,
      name: request.farmer.name,
      phone: canSeeContact ? request.farmer.phone : null,
    },
    labourer: {
      id: request.labourer._id,
      name: request.labourer.name,
      phone: canSeeContact ? request.labourer.phone : null,
    },
    viewerRole,
  };
}

// POST /api/hiring (protected, farmer only)
const createRequest = asyncHandler(async (req, res) => {
  const { labourerId, workType, workDate, numberOfDays, farmLocation, message } = req.body;

  const labourer = await User.findById(labourerId);
  if (!labourer || labourer.role !== 'labourer' || !labourer.isActive) {
    return sendError(res, 404, 'Labourer not found.');
  }

  const request = await HiringRequest.create({
    farmer: req.user._id,
    labourer: labourer._id,
    workType,
    workDate,
    numberOfDays,
    farmLocation,
    message,
  });

  const populated = await request.populate([{ path: 'farmer', select: 'name phone' }, { path: 'labourer', select: 'name phone' }]);
  sendSuccess(res, 201, { request: serialize(populated, 'farmer') });
});

// GET /api/hiring/farmer (protected, farmer only)
const listFarmerRequests = asyncHandler(async (req, res) => {
  const requests = await HiringRequest.find({ farmer: req.user._id })
    .sort({ createdAt: -1 })
    .populate('farmer', 'name phone')
    .populate('labourer', 'name phone');
  sendSuccess(res, 200, {
    requests: requests.map((r) => serialize(r, 'farmer')),
    count: requests.length,
  });
});

// GET /api/hiring/labourer (protected, labourer only)
const listLabourerRequests = asyncHandler(async (req, res) => {
  const requests = await HiringRequest.find({ labourer: req.user._id })
    .sort({ createdAt: -1 })
    .populate('farmer', 'name phone')
    .populate('labourer', 'name phone');
  sendSuccess(res, 200, {
    requests: requests.map((r) => serialize(r, 'labourer')),
    count: requests.length,
  });
});

// PUT /api/hiring/:id/status (protected, farmer or labourer on this request)
const updateStatus = asyncHandler(async (req, res) => {
  const request = await HiringRequest.findById(req.params.id)
    .populate('farmer', 'name phone')
    .populate('labourer', 'name phone');
  if (!request) return sendError(res, 404, 'Hiring request not found.');

  let viewerRole;
  if (String(request.farmer._id) === String(req.user._id)) viewerRole = 'farmer';
  else if (String(request.labourer._id) === String(req.user._id)) viewerRole = 'labourer';
  else return sendError(res, 403, 'You do not have permission to update this request.');

  const { status: nextStatus } = req.body;
  const allowed = ALLOWED_TRANSITIONS[request.status]?.[viewerRole] || [];
  if (!allowed.includes(nextStatus)) {
    return sendError(
      res,
      400,
      `Cannot change status from ${request.status} to ${nextStatus} as the ${viewerRole}.`
    );
  }

  request.status = nextStatus;
  await request.save();

  sendSuccess(res, 200, { request: serialize(request, viewerRole) });
});

module.exports = { createRequest, listFarmerRequests, listLabourerRequests, updateStatus };

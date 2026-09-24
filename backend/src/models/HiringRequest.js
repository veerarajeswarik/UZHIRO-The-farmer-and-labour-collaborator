const mongoose = require('mongoose');
const { WORK_TYPES } = require('./LabourerProfile');

const STATUSES = ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'];

const hiringRequestSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    labourer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    workType: { type: String, enum: WORK_TYPES, required: true },
    workDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true, min: 1 },
    farmLocation: { type: String, required: true, trim: true },
    message: { type: String, trim: true, maxlength: 500 },

    status: { type: String, enum: STATUSES, default: 'Pending', index: true },
  },
  { timestamps: true } // createdAt = "Created date"
);

module.exports = mongoose.model('HiringRequest', hiringRequestSchema);
module.exports.STATUSES = STATUSES;

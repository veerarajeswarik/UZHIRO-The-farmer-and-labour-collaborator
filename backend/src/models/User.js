const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['farmer', 'labourer', 'admin'];

/**
 * Shared identity/auth record for every account. Role-specific farm/work
 * details live in FarmerProfile / LabourerProfile, linked 1:1 by user id -
 * keeps auth concerns separate from domain data.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, required: true },
    location: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const { _id, name, phone, email, role, location, isActive, createdAt } = this;
  return { id: _id, name, phone, email, role, location, isActive, createdAt };
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;

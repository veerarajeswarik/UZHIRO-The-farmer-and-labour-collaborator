const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Runs after an array of express-validator checks. Collects errors into one
 * friendly message instead of leaking express-validator's raw error shape.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(' ');
    return sendError(res, 400, message);
  }
  next();
}

module.exports = { handleValidation };

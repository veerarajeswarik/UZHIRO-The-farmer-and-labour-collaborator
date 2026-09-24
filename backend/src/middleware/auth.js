const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT and attaches the authenticated user to req.user.
 * Loads the user fresh from the DB (not just the token payload) so a
 * deactivated account is rejected immediately, not just on next token issue.
 */
async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return sendError(res, 401, 'Not authorized. Please log in.');
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      return sendError(res, 401, 'Not authorized. Please log in.');
    }

    req.user = user;
    next();
  } catch {
    return sendError(res, 401, 'Invalid or expired session. Please log in again.');
  }
}

/**
 * Restricts a route to specific roles. Use after protect().
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action.');
    }
    next();
  };
}

module.exports = { protect, authorize };

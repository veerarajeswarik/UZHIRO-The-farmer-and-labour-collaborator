/**
 * Consistent API response helpers used across every controller.
 * Success:  { success: true, data }
 * Error:    { success: false, message }
 */
function sendSuccess(res, statusCode, data) {
  return res.status(statusCode).json({ success: true, data });
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { sendSuccess, sendError };

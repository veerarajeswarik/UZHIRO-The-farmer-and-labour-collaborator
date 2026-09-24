const { sendError } = require('../utils/apiResponse');

/**
 * Catches unmatched routes.
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/**
 * Centralized error handler. Never leaks stack traces to the client -
 * they are only logged server-side.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || 'Something went wrong.';

  // Mongoose validation errors (e.g. missing/invalid fields on admin create/edit) -> 400.
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(' ');
  }
  // Mongoose CastError (e.g. malformed ObjectId in a route param) -> 400.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}.`;
  }
  // MongoDB duplicate key error (unique index violation) -> 409.
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = `A record with this ${field} already exists.`;
  }

  console.error(`[error] ${req.method} ${req.originalUrl} -`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong. Please try again later.';
  }

  sendError(res, statusCode, message);
}

module.exports = { notFound, errorHandler };

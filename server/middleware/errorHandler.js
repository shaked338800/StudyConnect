// [REQ-24 Error handling] Central error handler.
// Every error thrown in a route (including async errors - Express 5 forwards
// them automatically) arrives here, so the server answers with JSON
// instead of crashing.
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Body is not valid JSON, e.g. '{"name": '
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }

  // Body is bigger than the limit set in app.js
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }

  // Mongoose schema validation failed (required field missing, too long, ...)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Invalid MongoDB ObjectId, e.g. /api/posts/abc
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid value for ${err.path}` });
  }

  // Unique index violation, e.g. username already taken
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    return res.status(409).json({ error: `This ${field} is already in use` });
  }

  // Errors we created on purpose with a status (e.g. 403, 404)
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  // Anything else: log details on the server, send a generic message to the client
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Something went wrong on the server' });
}

module.exports = errorHandler;

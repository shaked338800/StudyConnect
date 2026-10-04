// [REQ-24] Rejects routes like /api/users/abc before they reach the database.
const { isValidObjectId } = require('../utils/validators');

function validateId(req, res, next) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

module.exports = validateId;

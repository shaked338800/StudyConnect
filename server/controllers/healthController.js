// [REQ-17 MVC - Controller] Handles the health-check request.
const { getDbStatus } = require('../config/db');

// GET /api/health
function getHealth(req, res) {
  res.json({
    server: 'ok',
    database: getDbStatus(),
    time: new Date().toISOString()
  });
}

module.exports = { getHealth };

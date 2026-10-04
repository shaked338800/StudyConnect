// [REQ-15 Node.js + Express] Builds the Express application.
const path = require('path');
const fs = require('fs');
const express = require('express');

const healthRoutes = require('./routes/healthRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies. The limit protects the server from huge bodies.
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/health', healthRoutes);

// Unknown /api routes -> JSON 404
app.use('/api', notFound);

// In production (lab / defense) Express also serves the built React app.
// During development Vite serves the client instead.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// Must be registered last
app.use(errorHandler);

module.exports = app;

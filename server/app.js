// [REQ-15 Node.js + Express] Builds the Express application.
const path = require('path');
const fs = require('fs');
const express = require('express');

const sessionMiddleware = require('./config/session');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON request bodies. The limit protects the server from huge bodies.
app.use(express.json({ limit: '1mb' }));

// Login sessions (cookie + session data kept on the server)
app.use(sessionMiddleware);

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);

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

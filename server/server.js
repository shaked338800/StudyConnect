// Entry point: creates the HTTP server and starts listening.
// We use http.createServer (instead of app.listen) so Socket.io can be
// attached to the same server later (Phase 6).
const http = require('http');
const app = require('./app');
const { connectToDatabase } = require('./config/db');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`StudyConnect server running on http://localhost:${PORT}`);
});

connectToDatabase();

// [REQ-24] Last safety net: log unexpected errors instead of letting the
// process die. Normal request errors never get here - they go to errorHandler.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

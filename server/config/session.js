// [REQ-21 Authentication] Session configuration.
// After login the server stores { userId } in a session; the browser only
// keeps a random session id inside an httpOnly cookie.
const crypto = require('crypto');
const session = require('express-session');

let secret = process.env.SESSION_SECRET;
if (!secret) {
  // The app still runs, but sessions will not survive a server restart
  console.warn('SESSION_SECRET is missing in .env - using a temporary random secret');
  secret = crypto.randomBytes(32).toString('hex');
}

// Exported as a variable so Socket.io can reuse the same sessions (Phase 6)
const sessionMiddleware = session({
  name: 'studyconnect.sid',
  secret,
  resave: false,             // don't re-save sessions that did not change
  saveUninitialized: false,  // don't create a session until the user logs in
  cookie: {
    httpOnly: true,          // JavaScript in the browser cannot read the cookie
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

module.exports = sessionMiddleware;

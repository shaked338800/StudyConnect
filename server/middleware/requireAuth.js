// [REQ-21 Authorization] Protects routes that need a logged-in user.
// If the session has a userId we copy it to req.userId for the controllers.
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in' });
  }
  req.userId = req.session.userId;
  next();
}

module.exports = requireAuth;

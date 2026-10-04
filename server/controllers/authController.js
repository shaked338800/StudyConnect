// [REQ-17 MVC - Controller] [REQ-21 Authentication] Register / login / logout.
const { createUser, verifyCredentials, findUserById } = require('../models/User');
const { validateRegister, validateLogin } = require('../utils/validators');

// Starts a fresh session for the user. regenerate() gives the browser a new
// session id on every login (protects against "session fixation" attacks).
function startSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId.toString();
      resolve();
    });
  });
}

// POST /api/auth/register
async function register(req, res) {
  const body = req.body || {};

  const error = validateRegister(body);
  if (error) {
    return res.status(400).json({ error });
  }

  // A duplicate username/email throws a MongoDB 11000 error,
  // which errorHandler turns into a 409 "already in use" response.
  const user = await createUser({
    username: body.username,
    email: body.email,
    password: body.password,
    fullName: body.fullName,
    institution: body.institution,
    fieldOfStudy: body.fieldOfStudy,
    bio: body.bio
  });

  await startSession(req, user._id);
  res.status(201).json({ user }); // toJSON removes passwordHash
}

// POST /api/auth/login
async function login(req, res) {
  const body = req.body || {};

  const error = validateLogin(body);
  if (error) {
    return res.status(400).json({ error });
  }

  const user = await verifyCredentials(body.username, body.password);
  if (!user) {
    // Same message for "no such user" and "wrong password",
    // so nobody can find out which usernames exist.
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  await startSession(req, user._id);
  res.json({ user });
}

// POST /api/auth/logout
function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('studyconnect.sid');
    res.json({ message: 'Logged out' });
  });
}

// GET /api/auth/me - who is logged in? (used when the React app starts)
async function getMe(req, res) {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  const user = await findUserById(req.session.userId);
  if (!user) {
    // The account was deleted while this session still existed
    req.session.destroy(() => res.json({ user: null }));
    return;
  }
  res.json({ user });
}

module.exports = { register, login, logout, getMe };

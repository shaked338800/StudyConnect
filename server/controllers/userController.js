// [REQ-17 MVC - Controller] [REQ-19 User: List / Search / Update / Delete]
const {
  listUsers,
  findPublicUserById,
  findUserById,
  updateUser,
  deleteUserById,
  checkPassword
} = require('../models/User');
const { countGroupsOwnedBy, removeUserFromAllGroups } = require('../models/StudyGroup');
const { isString, validateProfileUpdate } = require('../utils/validators');
const escapeRegex = require('../utils/escapeRegex');

// GET /api/users?q=text - list all users, or search them
async function getUsers(req, res) {
  const q = req.query.q;

  if (q !== undefined && (!isString(q) || q.length > 50)) {
    return res.status(400).json({ error: 'Search text must be at most 50 characters' });
  }

  const search = q && q.trim() ? new RegExp(escapeRegex(q.trim()), 'i') : null;
  const users = await listUsers(search);
  res.json({ users });
}

// GET /api/users/me - my full profile (including my private email)
async function getMyProfile(req, res) {
  const user = await findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
}

// GET /api/users/:id - someone's public profile (no email)
async function getUserById(req, res) {
  const user = await findPublicUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
}

// PUT /api/users/me - edit my own profile
async function updateMyProfile(req, res) {
  const body = req.body || {};

  const error = validateProfileUpdate(body);
  if (error) {
    return res.status(400).json({ error });
  }

  // Only these fields can be changed. Username and password are not
  // editable here, and unknown fields in the body are ignored.
  const changes = {
    email: body.email,
    fullName: body.fullName,
    institution: body.institution || '',
    fieldOfStudy: body.fieldOfStudy || '',
    bio: body.bio || ''
  };

  // Duplicate email -> MongoDB 11000 -> errorHandler sends 409
  const user = await updateUser(req.userId, changes);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
}

// DELETE /api/users/me - delete my own account (password required)
async function deleteMyAccount(req, res, next) {
  const body = req.body || {};

  if (!isString(body.password) || body.password === '') {
    return res.status(400).json({ error: 'Please enter your password to delete your account' });
  }

  const correct = await checkPassword(req.userId, body.password);
  if (!correct) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  // A group must always have an owner, so owners must delete their groups first
  const ownedGroups = await countGroupsOwnedBy(req.userId);
  if (ownedGroups > 0) {
    return res.status(409).json({
      error: `You own ${ownedGroups} study group(s). Delete them before deleting your account.`
    });
  }

  // Later phases: handle the user's posts / messages here as well
  await removeUserFromAllGroups(req.userId);
  await deleteUserById(req.userId);

  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('studyconnect.sid');
    res.json({ message: 'Account deleted' });
  });
}

module.exports = { getUsers, getMyProfile, getUserById, updateMyProfile, deleteMyAccount };

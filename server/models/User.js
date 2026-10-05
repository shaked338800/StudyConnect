// [REQ-17 MVC - Model] [REQ-18] User model.
// Only files in models/ use Mongoose. Controllers call the functions exported here.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true, // "Dana" and "dana" are the same user
      trim: true,
      match: [/^[a-z0-9_]{3,20}$/, 'Username must be 3-20 characters: letters, numbers or _']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    // We never store the real password - only its bcrypt hash.
    // select: false = not loaded from the DB unless we explicitly ask for it.
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: 2, maxlength: 60 },
    institution: { type: String, trim: true, maxlength: 80, default: '' },
    fieldOfStudy: { type: String, trim: true, maxlength: 80, default: '' },
    bio: { type: String, trim: true, maxlength: 300, default: '' }
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// Extra safety: even if a document was loaded with passwordHash,
// it is removed whenever the user is converted to JSON for a response.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

// Fields anyone logged in may see. Email is private (requirement 21).
const PUBLIC_FIELDS = 'username fullName institution fieldOfStudy bio createdAt';

const SALT_ROUNDS = 10;

// ---------- Data functions used by the controllers ----------

async function createUser({ username, email, password, fullName, institution, fieldOfStudy, bio }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ username, email, passwordHash, fullName, institution, fieldOfStudy, bio });
}

// Returns the user if username + password match, otherwise null
async function verifyCredentials(username, password) {
  const user = await User.findOne({ username: username.trim().toLowerCase() }).select('+passwordHash');
  if (!user) return null;
  const matches = await bcrypt.compare(password, user.passwordHash);
  return matches ? user : null;
}

async function checkPassword(userId, password) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

// Full profile (including email) - only for the user themself
function findUserById(id) {
  return User.findById(id);
}

// Public profile of any user
function findPublicUserById(id) {
  return User.findById(id).select(PUBLIC_FIELDS);
}

// Used by the advanced post search ("author" filter). Returns the user or null.
function findUserByUsername(username) {
  return User.findOne({ username: username.toLowerCase() }).select('_id');
}

// List users; if searchRegex is given, match it against several fields
function listUsers(searchRegex) {
  const filter = searchRegex
    ? {
        $or: [
          { username: searchRegex },
          { fullName: searchRegex },
          { institution: searchRegex },
          { fieldOfStudy: searchRegex }
        ]
      }
    : {};
  return User.find(filter).select(PUBLIC_FIELDS).sort({ username: 1 }).limit(100);
}

function updateUser(id, changes) {
  return User.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true });
}

function deleteUserById(id) {
  return User.findByIdAndDelete(id);
}

module.exports = {
  createUser,
  verifyCredentials,
  checkPassword,
  findUserById,
  findPublicUserById,
  findUserByUsername,
  listUsers,
  updateUser,
  deleteUserById
};

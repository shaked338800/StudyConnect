// [REQ-24 Server-side validation] Plain functions that check request input.
// Each function returns an error message (string), or null when the input is OK.
// The same rules are repeated on the client in client/src/utils/validation.js.

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Only real strings are accepted. This blocks objects like { "$ne": "" }
// from reaching MongoDB queries (NoSQL injection).
function isString(value) {
  return typeof value === 'string';
}

function isValidObjectId(id) {
  return isString(id) && OBJECT_ID_REGEX.test(id);
}

// Optional text field: may be missing, but if present must be a string <= max chars
function checkOptionalText(value, fieldName, max) {
  if (value === undefined) return null;
  if (!isString(value)) return `${fieldName} must be text`;
  if (value.trim().length > max) return `${fieldName} must be at most ${max} characters`;
  return null;
}

function checkFullName(value) {
  if (!isString(value) || value.trim().length < 2 || value.trim().length > 60) {
    return 'Full name must be 2-60 characters';
  }
  return null;
}

function checkEmail(value) {
  if (!isString(value) || value.trim().length > 100 || !EMAIL_REGEX.test(value.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

// Fields that appear on both the register form and the edit-profile form
function checkProfileFields(body) {
  return (
    checkOptionalText(body.institution, 'Institution', 80) ||
    checkOptionalText(body.fieldOfStudy, 'Field of study', 80) ||
    checkOptionalText(body.bio, 'Bio', 300)
  );
}

function validateRegister(body) {
  if (!isString(body.username) || !USERNAME_REGEX.test(body.username.trim())) {
    return 'Username must be 3-20 characters: letters, numbers or _';
  }
  // bcrypt only uses the first 72 bytes of a password, so we cap the length
  if (!isString(body.password) || body.password.length < 6 || body.password.length > 72) {
    return 'Password must be 6-72 characters';
  }
  return checkEmail(body.email) || checkFullName(body.fullName) || checkProfileFields(body);
}

function validateLogin(body) {
  if (!isString(body.username) || !isString(body.password) ||
      body.username.trim() === '' || body.password === '') {
    return 'Username and password are required';
  }
  return null;
}

function validateProfileUpdate(body) {
  return checkEmail(body.email) || checkFullName(body.fullName) || checkProfileFields(body);
}

const STUDY_FORMATS = ['online', 'in-person', 'hybrid'];

// Used for both creating and editing a study group
function validateGroup(body) {
  if (!isString(body.name) || body.name.trim().length < 3 || body.name.trim().length > 60) {
    return 'Group name must be 3-60 characters';
  }
  if (!isString(body.course) || body.course.trim().length < 2 || body.course.trim().length > 60) {
    return 'Course must be 2-60 characters';
  }
  if (!STUDY_FORMATS.includes(body.studyFormat)) {
    return 'Study format must be online, in-person or hybrid';
  }
  // Must be a real whole number (not "10", not 2.5)
  if (!Number.isInteger(body.maxMembers) || body.maxMembers < 2 || body.maxMembers > 100) {
    return 'Max members must be a whole number between 2 and 100';
  }
  return (
    checkOptionalText(body.description, 'Description', 500) ||
    checkOptionalText(body.institution, 'Institution', 80)
  );
}

module.exports = {
  isString,
  isValidObjectId,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateGroup
};

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

// A direct link to a video file, e.g. https://example.com/lecture.mp4
const VIDEO_URL_REGEX = /^https?:\/\/\S+\.(mp4|webm)(\?\S*)?$/i;

// Fields that can be set when creating AND editing a post.
// (group is only chosen on create - it is checked in the controller)
function validatePost(body) {
  if (!isString(body.title) || body.title.trim().length < 3 || body.title.trim().length > 100) {
    return 'Title must be 3-100 characters';
  }
  if (!isString(body.content) || body.content.trim().length < 1 || body.content.trim().length > 5000) {
    return 'Content must be 1-5000 characters';
  }
  if (!isString(body.course) || body.course.trim().length < 2 || body.course.trim().length > 60) {
    return 'Course must be 2-60 characters';
  }
  if (body.videoUrl !== undefined && body.videoUrl !== '') {
    if (!isString(body.videoUrl) || body.videoUrl.length > 500 || !VIDEO_URL_REGEX.test(body.videoUrl.trim())) {
      return 'Video URL must be an http(s) link to a .mp4 or .webm file';
    }
  }
  return null;
}

// ---------- [REQ-20] Advanced search parameters ----------

const MAX_SEARCH_LENGTH = 50;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const USERNAME_SEARCH_REGEX = /^[a-zA-Z0-9_]{1,20}$/;

// Optional text filter from the query string. Returns { value } or { error }.
// Missing or empty -> value ''. Query parameters must be ONE string
// (?course=a&course=b would arrive as an array -> rejected).
function readSearchText(query, name, label) {
  const value = query[name];
  if (value === undefined) return { value: '' };
  if (!isString(value)) return { error: `${label} must be text` };
  if (value.trim().length > MAX_SEARCH_LENGTH) {
    return { error: `${label} must be at most ${MAX_SEARCH_LENGTH} characters` };
  }
  return { value: value.trim() };
}

// "2026-10-05" -> Date at 00:00 local time on that day, or null if invalid.
// We rebuild the date and compare, so impossible dates like 2026-02-30 are rejected.
function parseDateOnly(text) {
  if (!DATE_REGEX.test(text)) return null;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

// Reads a date filter. Returns { value: Date | null } or { error }.
function readSearchDate(query, name, label) {
  const text = readSearchText(query, name, label);
  if (text.error) return text;
  if (text.value === '') return { value: null };
  const date = parseDateOnly(text.value);
  if (!date) return { error: `${label} must be a valid date (YYYY-MM-DD)` };
  return { value: date };
}

// Advanced search #1 - posts. Returns { error } or { filters }.
//   keyword  - contained in title or content
//   course   - contained in course
//   author   - exact username
//   dateFrom - posts created on or after this day (from 00:00)
//   dateTo   - posts created on or before this day (until 23:59:59.999)
function parsePostSearch(query) {
  const keyword = readSearchText(query, 'keyword', 'Keyword');
  const course = readSearchText(query, 'course', 'Course');
  const author = readSearchText(query, 'author', 'Author');
  const dateFrom = readSearchDate(query, 'dateFrom', 'From date');
  const dateTo = readSearchDate(query, 'dateTo', 'To date');

  const firstError = [keyword, course, author, dateFrom, dateTo].find((r) => r.error);
  if (firstError) return { error: firstError.error };

  if (author.value !== '' && !USERNAME_SEARCH_REGEX.test(author.value)) {
    return { error: 'Author must be a username (letters, numbers or _)' };
  }

  let dateToEnd = null;
  if (dateTo.value) {
    // include the whole "to" day
    dateToEnd = new Date(dateTo.value);
    dateToEnd.setHours(23, 59, 59, 999);
  }
  if (dateFrom.value && dateToEnd && dateFrom.value > dateToEnd) {
    return { error: 'From date must be before or equal to To date' };
  }

  return {
    filters: {
      keyword: keyword.value,
      course: course.value,
      author: author.value.toLowerCase(),
      dateFrom: dateFrom.value,
      dateTo: dateToEnd
    }
  };
}

// Advanced search #2 - study groups. Returns { error } or { filters }.
//   course, institution - contained in the field
//   studyFormat         - exactly one of the formats ('' = any)
//   openSpots           - 'true' = only groups where members < maxMembers
function parseGroupSearch(query) {
  const course = readSearchText(query, 'course', 'Course');
  const institution = readSearchText(query, 'institution', 'Institution');
  const studyFormat = readSearchText(query, 'studyFormat', 'Study format');
  const openSpots = readSearchText(query, 'openSpots', 'Open spots');

  const firstError = [course, institution, studyFormat, openSpots].find((r) => r.error);
  if (firstError) return { error: firstError.error };

  if (studyFormat.value !== '' && !STUDY_FORMATS.includes(studyFormat.value)) {
    return { error: 'Study format must be online, in-person or hybrid' };
  }
  if (!['', 'true', 'false'].includes(openSpots.value)) {
    return { error: 'Open spots must be true or false' };
  }

  return {
    filters: {
      course: course.value,
      institution: institution.value,
      studyFormat: studyFormat.value,
      onlyOpenSpots: openSpots.value === 'true'
    }
  };
}

// [REQ-28] Chat message text (used by the socket handler and the edit route)
function validateMessageText(text) {
  if (!isString(text) || text.trim().length < 1) {
    return 'Message cannot be empty';
  }
  if (text.trim().length > 1000) {
    return 'Message must be at most 1000 characters';
  }
  return null;
}

module.exports = {
  isString,
  isValidObjectId,
  validateMessageText,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateGroup,
  validatePost,
  parsePostSearch,
  parseGroupSearch
};

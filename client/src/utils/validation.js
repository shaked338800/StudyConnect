// [REQ-24 Client-side validation] Same rules as server/utils/validators.js.
// Each function returns an object { fieldName: 'error message' }.
// An empty object means the form is valid.

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkProfileFields(form, errors) {
  const fullName = form.fullName.trim();
  if (fullName.length < 2 || fullName.length > 60) {
    errors.fullName = 'Full name must be 2-60 characters';
  }
  if (!EMAIL_REGEX.test(form.email.trim()) || form.email.trim().length > 100) {
    errors.email = 'Please enter a valid email address';
  }
  if (form.institution.trim().length > 80) {
    errors.institution = 'At most 80 characters';
  }
  if (form.fieldOfStudy.trim().length > 80) {
    errors.fieldOfStudy = 'At most 80 characters';
  }
  if (form.bio.trim().length > 300) {
    errors.bio = 'At most 300 characters';
  }
}

export function validateRegisterForm(form) {
  const errors = {};
  if (!USERNAME_REGEX.test(form.username.trim())) {
    errors.username = '3-20 characters: letters, numbers or _';
  }
  if (form.password.length < 6 || form.password.length > 72) {
    errors.password = 'Password must be 6-72 characters';
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  checkProfileFields(form, errors);
  return errors;
}

export function validateLoginForm(form) {
  const errors = {};
  if (form.username.trim() === '') errors.username = 'Username is required';
  if (form.password === '') errors.password = 'Password is required';
  return errors;
}

export function validateProfileForm(form) {
  const errors = {};
  checkProfileFields(form, errors);
  return errors;
}

export const STUDY_FORMATS = ['online', 'in-person', 'hybrid'];

// form.maxMembers is the text from the input, so we convert it to a number first
export function validateGroupForm(form) {
  const errors = {};
  const name = form.name.trim();
  const course = form.course.trim();
  const maxMembers = Number(form.maxMembers);

  if (name.length < 3 || name.length > 60) {
    errors.name = 'Group name must be 3-60 characters';
  }
  if (course.length < 2 || course.length > 60) {
    errors.course = 'Course must be 2-60 characters';
  }
  if (!STUDY_FORMATS.includes(form.studyFormat)) {
    errors.studyFormat = 'Please choose a study format';
  }
  if (form.maxMembers === '' || !Number.isInteger(maxMembers) || maxMembers < 2 || maxMembers > 100) {
    errors.maxMembers = 'A whole number between 2 and 100';
  }
  if (form.description.trim().length > 500) {
    errors.description = 'At most 500 characters';
  }
  if (form.institution.trim().length > 80) {
    errors.institution = 'At most 80 characters';
  }
  return errors;
}

// [REQ-26] Same rule as the server: https://...mp4/.webm, or a path on our
// site like /videos/flower.mp4. (?!\/) blocks "//other-site.com/..." links.
export const VIDEO_URL_REGEX = /^(https?:\/\/\S+|\/(?!\/)\S+)\.(mp4|webm)(\?\S*)?$/i;

export function validatePostForm(form) {
  const errors = {};
  const title = form.title.trim();
  const content = form.content.trim();
  const course = form.course.trim();
  const videoUrl = form.videoUrl.trim();

  if (title.length < 3 || title.length > 100) {
    errors.title = 'Title must be 3-100 characters';
  }
  if (content.length < 1 || content.length > 5000) {
    errors.content = 'Content must be 1-5000 characters';
  }
  if (course.length < 2 || course.length > 60) {
    errors.course = 'Course must be 2-60 characters';
  }
  if (videoUrl !== '' && (videoUrl.length > 500 || !VIDEO_URL_REGEX.test(videoUrl))) {
    errors.videoUrl = 'Must link to a .mp4 or .webm file (https://... or /videos/...)';
  }
  return errors;
}

// ---------- [REQ-20] Advanced search forms ----------

function checkSearchLength(form, field, errors) {
  if (form[field].trim().length > 50) {
    errors[field] = 'At most 50 characters';
  }
}

// Dates come from <input type="date"> as "YYYY-MM-DD", so comparing the
// strings also compares the dates.
export function validatePostSearchForm(form) {
  const errors = {};
  checkSearchLength(form, 'keyword', errors);
  checkSearchLength(form, 'course', errors);
  const author = form.author.trim();
  if (author !== '' && !/^[a-zA-Z0-9_]{1,20}$/.test(author)) {
    errors.author = 'A username: letters, numbers or _';
  }
  if (form.dateFrom && form.dateTo && form.dateFrom > form.dateTo) {
    errors.dateTo = '"To" date must be on or after the "From" date';
  }
  return errors;
}

export function validateGroupSearchForm(form) {
  const errors = {};
  checkSearchLength(form, 'course', errors);
  checkSearchLength(form, 'institution', errors);
  if (form.studyFormat !== '' && !STUDY_FORMATS.includes(form.studyFormat)) {
    errors.studyFormat = 'Please choose a study format';
  }
  return errors;
}

// True when the errors object has no keys
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}

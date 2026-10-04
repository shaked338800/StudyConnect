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

// True when the errors object has no keys
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}

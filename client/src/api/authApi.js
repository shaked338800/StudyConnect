// [REQ-25 jQuery AJAX] Authentication requests.
// The session cookie is sent automatically by the browser (same origin).
import $ from 'jquery';

export function register(data) {
  return $.ajax({
    url: '/api/auth/register',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data)
  });
}

export function login(username, password) {
  return $.ajax({
    url: '/api/auth/login',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ username, password })
  });
}

export function logout() {
  return $.ajax({
    url: '/api/auth/logout',
    type: 'POST'
  });
}

// Returns { user } - user is null when nobody is logged in
export function getMe() {
  return $.ajax({
    url: '/api/auth/me',
    type: 'GET'
  });
}

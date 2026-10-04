// [REQ-25 jQuery AJAX] User requests: list, search, view, update, delete.
import $ from 'jquery';

// List all users, or search when q is not empty. jQuery turns
// { q } into the query string: /api/users?q=...
export function getUsers(q) {
  return $.ajax({
    url: '/api/users',
    type: 'GET',
    data: q ? { q } : {}
  });
}

export function getUser(id) {
  return $.ajax({
    url: '/api/users/' + encodeURIComponent(id),
    type: 'GET'
  });
}

export function getMyProfile() {
  return $.ajax({
    url: '/api/users/me',
    type: 'GET'
  });
}

export function updateMyProfile(data) {
  return $.ajax({
    url: '/api/users/me',
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(data)
  });
}

export function deleteMyAccount(password) {
  return $.ajax({
    url: '/api/users/me',
    type: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify({ password })
  });
}

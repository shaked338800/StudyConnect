// [REQ-25 jQuery AJAX] Post requests.
import $ from 'jquery';

// filters: { q, group } - both optional.
// jQuery turns them into the query string: /api/posts?q=...&group=...
export function getPosts(filters = {}) {
  const data = {};
  if (filters.q) data.q = filters.q;
  if (filters.group) data.group = filters.group;
  return $.ajax({
    url: '/api/posts',
    type: 'GET',
    data
  });
}

// [REQ-20] Advanced search #1.
// filters: { keyword, course, author, dateFrom, dateTo } - empty ones are not sent
export function searchPosts(filters) {
  const data = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key]) data[key] = filters[key];
  });
  return $.ajax({
    url: '/api/posts/search',
    type: 'GET',
    data // jQuery builds: /api/posts/search?keyword=...&course=...
  });
}

export function getPost(id) {
  return $.ajax({
    url: '/api/posts/' + encodeURIComponent(id),
    type: 'GET'
  });
}

export function createPost(data) {
  return $.ajax({
    url: '/api/posts',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data)
  });
}

export function updatePost(id, data) {
  return $.ajax({
    url: '/api/posts/' + encodeURIComponent(id),
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(data)
  });
}

export function deletePost(id) {
  return $.ajax({
    url: '/api/posts/' + encodeURIComponent(id),
    type: 'DELETE'
  });
}

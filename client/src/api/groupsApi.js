// [REQ-25 jQuery AJAX] StudyGroup requests.
import $ from 'jquery';

// List all groups, or a simple search when q is not empty
export function getGroups(q) {
  return $.ajax({
    url: '/api/groups',
    type: 'GET',
    data: q ? { q } : {}
  });
}

// [REQ-20] Advanced search #2.
// filters: { course, institution, studyFormat, openSpots (boolean) }
export function searchGroups(filters) {
  const data = {};
  if (filters.course) data.course = filters.course;
  if (filters.institution) data.institution = filters.institution;
  if (filters.studyFormat) data.studyFormat = filters.studyFormat;
  if (filters.openSpots) data.openSpots = 'true';
  return $.ajax({
    url: '/api/groups/search',
    type: 'GET',
    data
  });
}

export function getGroup(id) {
  return $.ajax({
    url: '/api/groups/' + encodeURIComponent(id),
    type: 'GET'
  });
}

export function createGroup(data) {
  return $.ajax({
    url: '/api/groups',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data)
  });
}

export function updateGroup(id, data) {
  return $.ajax({
    url: '/api/groups/' + encodeURIComponent(id),
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(data)
  });
}

export function deleteGroup(id) {
  return $.ajax({
    url: '/api/groups/' + encodeURIComponent(id),
    type: 'DELETE'
  });
}

export function joinGroup(id) {
  return $.ajax({
    url: '/api/groups/' + encodeURIComponent(id) + '/join',
    type: 'POST'
  });
}

export function leaveGroup(id) {
  return $.ajax({
    url: '/api/groups/' + encodeURIComponent(id) + '/leave',
    type: 'POST'
  });
}

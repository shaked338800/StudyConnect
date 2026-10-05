// [REQ-25 jQuery AJAX] Chat message requests over HTTP.
// (Sending a NEW message goes over Socket.io - see components/ChatBox.jsx.)
import $ from 'jquery';

// History of a group's chat, or a keyword search in it when q is not empty
export function getGroupMessages(groupId, q) {
  return $.ajax({
    url: '/api/messages/group/' + encodeURIComponent(groupId),
    type: 'GET',
    data: q ? { q } : {}
  });
}

export function updateMessage(id, text) {
  return $.ajax({
    url: '/api/messages/' + encodeURIComponent(id),
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ text })
  });
}

export function deleteMessage(id) {
  return $.ajax({
    url: '/api/messages/' + encodeURIComponent(id),
    type: 'DELETE'
  });
}

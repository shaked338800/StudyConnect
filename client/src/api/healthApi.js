// [REQ-25 jQuery AJAX] Server calls for the health check.
import $ from 'jquery';

export function getHealth() {
  return $.ajax({
    url: '/api/health',
    type: 'GET'
  });
}

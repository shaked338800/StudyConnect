// [REQ-25 jQuery AJAX] Global settings and handlers for every $.ajax call.
import $ from 'jquery';
import { notify } from './notify';

// Builds a readable message from a failed jQuery AJAX request.
export function getErrorMessage(xhr, textStatus) {
  if (xhr.responseJSON && xhr.responseJSON.error) {
    return xhr.responseJSON.error; // message sent by our errorHandler
  }
  if (textStatus === 'timeout') {
    return 'The server did not respond in time';
  }
  if (xhr.status === 0 || xhr.status >= 500) {
    return 'Cannot reach the server. Is it running?';
  }
  return `Request failed (${xhr.status})`;
}

export function setupAjax() {
  $.ajaxSetup({
    dataType: 'json', // we always expect JSON back from our server
    timeout: 10000    // 10 seconds
  });

  // Show / hide the loading indicator while any AJAX request is running
  $(document).ajaxStart(() => {
    $('#loading').stop(true, true).fadeIn(150);
  });
  $(document).ajaxStop(() => {
    $('#loading').stop(true, true).fadeOut(150);
  });

  // Every failed AJAX request shows a toast.
  // A single call can opt out with { global: false }.
  $(document).ajaxError((event, xhr, settings, thrownError) => {
    notify(getErrorMessage(xhr, xhr.statusText), 'error');
  });
}

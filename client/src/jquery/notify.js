// [REQ-25 jQuery] Toast notifications.
// jQuery creates and removes these elements inside #notify, which is
// outside the React root, so jQuery and React never touch the same DOM.
import $ from 'jquery';

// type: 'info' | 'success' | 'error'
export function notify(message, type = 'info') {
  const $toast = $('<div></div>')
    .addClass('toast toast-' + type)
    .text(message); // .text() (not .html()) so user content cannot inject HTML

  $('#notify').append($toast);

  $toast
    .hide()
    .fadeIn(200)
    .delay(3000)
    .fadeOut(400, function () {
      $(this).remove();
    });
}

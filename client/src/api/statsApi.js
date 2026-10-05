// [REQ-25 jQuery AJAX] [REQ-29] Statistics for the D3 charts.
// The numbers are calculated by MongoDB on every request.
import $ from 'jquery';

// -> { data: [{ course, count }, ...] }
export function getPostsByCourse() {
  return $.ajax({
    url: '/api/stats/posts-by-course',
    type: 'GET'
  });
}

// -> { data: [{ year, month, label: "2026-03", count }, ...] }
export function getPostsByMonth() {
  return $.ajax({
    url: '/api/stats/posts-by-month',
    type: 'GET'
  });
}

// [REQ-17 MVC - Controller] [REQ-29 D3 statistics]
// Only calls the model's aggregation functions and returns the result.
// The numbers are calculated from MongoDB on every request (never stored or hard-coded).
const { countPostsByCourse, countPostsByMonth } = require('../models/Post');

// GET /api/stats/posts-by-course -> { data: [{ course, count }, ...] }
async function getPostsByCourse(req, res) {
  const data = await countPostsByCourse();
  res.json({ data });
}

// GET /api/stats/posts-by-month -> { data: [{ year, month, label, count }, ...] }
async function getPostsByMonth(req, res) {
  const data = await countPostsByMonth();
  res.json({ data });
}

module.exports = { getPostsByCourse, getPostsByMonth };

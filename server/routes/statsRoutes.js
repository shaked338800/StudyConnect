// Maps URLs under /api/stats to controller functions (logged-in users only).
const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getPostsByCourse, getPostsByMonth } = require('../controllers/statsController');

const router = express.Router();

router.use(requireAuth);

router.get('/posts-by-course', getPostsByCourse);
router.get('/posts-by-month', getPostsByMonth);

module.exports = router;

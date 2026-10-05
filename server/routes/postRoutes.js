// Maps URLs under /api/posts to controller functions.
// Every route here requires a logged-in user.
const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const validateId = require('../middleware/validateId');
const {
  getPosts,
  getPost,
  createNewPost,
  updateExistingPost,
  deleteExistingPost
} = require('../controllers/postController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getPosts);
router.post('/', createNewPost);

router.get('/:id', validateId, getPost);
router.put('/:id', validateId, updateExistingPost);
router.delete('/:id', validateId, deleteExistingPost);

module.exports = router;

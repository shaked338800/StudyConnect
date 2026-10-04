// Maps URLs under /api/users to controller functions.
// Every route here requires a logged-in user.
const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const validateId = require('../middleware/validateId');
const {
  getUsers,
  getMyProfile,
  getUserById,
  updateMyProfile,
  deleteMyAccount
} = require('../controllers/userController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getUsers);

// "/me" routes must come before "/:id", otherwise "me" would be treated as an id
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.delete('/me', deleteMyAccount);

router.get('/:id', validateId, getUserById);

module.exports = router;

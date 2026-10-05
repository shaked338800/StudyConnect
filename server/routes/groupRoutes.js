// Maps URLs under /api/groups to controller functions.
// Every route here requires a logged-in user.
const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const validateId = require('../middleware/validateId');
const {
  getGroups,
  advancedSearchGroups,
  getGroup,
  createNewGroup,
  updateExistingGroup,
  deleteExistingGroup,
  joinGroup,
  leaveGroup
} = require('../controllers/groupController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getGroups);
router.post('/', createNewGroup);

// "/search" must come before "/:id", otherwise "search" would be treated as an id
router.get('/search', advancedSearchGroups);

router.get('/:id', validateId, getGroup);
router.put('/:id', validateId, updateExistingGroup);
router.delete('/:id', validateId, deleteExistingGroup);

router.post('/:id/join', validateId, joinGroup);
router.post('/:id/leave', validateId, leaveGroup);

module.exports = router;

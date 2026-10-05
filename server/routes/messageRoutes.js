// Maps URLs under /api/messages to controller functions.
// Every route here requires a logged-in user. (Sending uses Socket.io.)
const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const validateId = require('../middleware/validateId');
const { getGroupMessages, editMessage, removeMessage } = require('../controllers/messageController');

const router = express.Router();

router.use(requireAuth);

// :id here is the GROUP id
router.get('/group/:id', validateId, getGroupMessages);

// :id here is the MESSAGE id
router.put('/:id', validateId, editMessage);
router.delete('/:id', validateId, removeMessage);

module.exports = router;

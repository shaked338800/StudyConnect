// Maps URLs under /api/auth to controller functions.
const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);

module.exports = router;

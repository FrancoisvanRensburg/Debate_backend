const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { currentUser } = require('../controllers/user');

router.get('/me', auth, currentUser);

module.exports = router;


const cookieParser = require('cookie-parser');
// Make sure cookieParser is used in your main app.js (not here)

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');

router.get('/me', authController.me);
router.post('/register', authController.register);

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
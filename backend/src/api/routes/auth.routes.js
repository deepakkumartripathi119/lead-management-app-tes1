const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.get('/me', authCtrl.me);
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);

module.exports = router;
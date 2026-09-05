const express = require('express');
const router = express.Router();
const { signup, login, getMe, updatePassword, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validateSignup, validateLogin, validatePasswordUpdate } = require('../middleware/validate');

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, validatePasswordUpdate, updatePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateUser } = require('../middleware/validate');

// All routes require admin
router.use(authenticate, authorize('ADMIN'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', validateCreateUser, createUser);

module.exports = router;

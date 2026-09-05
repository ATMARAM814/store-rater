const express = require('express');
const router = express.Router();
const { getStores, createStore, getStoreById } = require('../controllers/store.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateStore } = require('../middleware/validate');

// All store routes require authentication
router.use(authenticate);

// GET stores — accessible by ADMIN and USER
router.get('/', authorize('ADMIN', 'USER'), getStores);

// GET store by ID — accessible by all authenticated users
router.get('/:id', getStoreById);

// POST create store — admin only
router.post('/', authorize('ADMIN'), validateCreateStore, createStore);

module.exports = router;

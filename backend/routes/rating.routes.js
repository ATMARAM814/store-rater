const express = require('express');
const router = express.Router();
const { submitRating, getStoreRatings, getRatingById, deleteRating } = require('../controllers/rating.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRating } = require('../middleware/validate');

router.use(authenticate);

// Submit/update rating — USER only
router.post('/', authorize('USER'), validateRating, submitRating);

// Delete rating — USER only
router.delete('/store/:storeId', authorize('USER'), deleteRating);

// Get ratings for a store — STORE_OWNER (and ADMIN)
router.get('/store/:storeId', authorize('STORE_OWNER', 'ADMIN'), getStoreRatings);

// Get single rating detail — STORE_OWNER and ADMIN
router.get('/:id', authorize('STORE_OWNER', 'ADMIN'), getRatingById);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAdminDashboard, getStoreOwnerDashboard } = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Admin dashboard
router.get('/admin', authorize('ADMIN'), getAdminDashboard);

// Store owner dashboard
router.get('/store-owner', authorize('STORE_OWNER'), getStoreOwnerDashboard);

module.exports = router;

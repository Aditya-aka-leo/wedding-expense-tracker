const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUserDashboard,
  getExpenseBreakdown,
  getAnalytics,
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected
router.get('/admin', protect, adminOnly, getAdminDashboard);
router.get('/user', protect, getUserDashboard);
router.get('/expense-breakdown', protect, getExpenseBreakdown);
router.get('/analytics', protect, adminOnly, getAnalytics);

module.exports = router;

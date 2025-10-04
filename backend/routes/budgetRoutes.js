const express = require('express');
const router = express.Router();
const {
  createOrUpdateBudget,
  getBudget,
  getBudgetSummary,
} = require('../controllers/budgetController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected
router.post('/', protect, adminOnly, createOrUpdateBudget);
router.get('/', protect, getBudget);
router.get('/summary', protect, getBudgetSummary);

module.exports = router;

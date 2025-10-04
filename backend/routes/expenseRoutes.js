const express = require('express');
const router = express.Router();
const {
  createExpense,
  getAllExpenses,
  getExpense,
  updateExpense,
  updateExpenseStatus,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected
router.post('/', protect, createExpense);
router.get('/', protect, getAllExpenses);
router.get('/:id', protect, getExpense);
router.put('/:id', protect, updateExpense);
router.put('/:id/status', protect, adminOnly, updateExpenseStatus);
router.delete('/:id', protect, deleteExpense);

module.exports = router;

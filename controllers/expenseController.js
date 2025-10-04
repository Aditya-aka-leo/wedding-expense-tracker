const Expense = require('../models/Expense');
const Task = require('../models/Task');
const Budget = require('../models/Budget');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { task, description, amount, date, receiptUrl } = req.body;

    if (!task || !amount || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide task, amount, and date' 
      });
    }

    // Verify task exists
    const taskExists = await Task.findById(task);
    if (!taskExists) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // If admin creates expense, auto-approve it
    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    const expense = await Expense.create({
      task,
      description,
      amount,
      date,
      receiptUrl,
      submittedBy: req.user.id,
      status,
    });

    // If auto-approved, update budget
    if (status === 'approved') {
      await updateBudgetAfterApproval(expense);
    }

    const populatedExpense = await Expense.findById(expense._id)
      .populate('task', 'name estimatedCost')
      .populate('submittedBy', 'mobile role');

    res.status(201).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getAllExpenses = async (req, res) => {
  try {
    const { status, task, submittedBy } = req.query;

    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (task) filter.task = task;
    if (submittedBy) filter.submittedBy = submittedBy;

    // If not admin, only show own expenses
    if (req.user.role !== 'admin') {
      filter.submittedBy = req.user.id;
    }

    const expenses = await Expense.find(filter)
      .populate('task', 'name estimatedCost')
      .populate('submittedBy', 'mobile role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('task', 'name estimatedCost')
      .populate('submittedBy', 'mobile role');

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Non-admin users can only view their own expenses
    if (req.user.role !== 'admin' && expense.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to view this expense' 
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update expense (only pending expenses)
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Only allow updating pending expenses
    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot update non-pending expenses' 
      });
    }

    // Only owner or admin can update
    if (req.user.role !== 'admin' && expense.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to update this expense' 
      });
    }

    const { task, description, amount, date, receiptUrl } = req.body;

    if (task) {
      const taskExists = await Task.findById(task);
      if (!taskExists) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      expense.task = task;
    }
    if (description !== undefined) expense.description = description;
    if (amount) expense.amount = amount;
    if (date) expense.date = date;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('task', 'name estimatedCost')
      .populate('submittedBy', 'mobile role');

    res.status(200).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve or reject expense
// @route   PUT /api/expenses/:id/status
// @access  Private/Admin
exports.updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status must be either approved or rejected' 
      });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Can only approve/reject pending expenses
    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Can only approve/reject pending expenses' 
      });
    }

    expense.status = status;
    await expense.save();

    // If approved, update budget
    if (status === 'approved') {
      await updateBudgetAfterApproval(expense);
    }

    const populatedExpense = await Expense.findById(expense._id)
      .populate('task', 'name estimatedCost')
      .populate('submittedBy', 'mobile role');

    res.status(200).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Cannot delete approved expenses
    if (expense.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete approved expenses' 
      });
    }

    // Only owner or admin can delete
    if (req.user.role !== 'admin' && expense.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to delete this expense' 
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to update budget after expense approval
const updateBudgetAfterApproval = async (expense) => {
  try {
    const budget = await Budget.findOne();
    if (budget) {
      budget.amountSpent += expense.amount;
      budget.remaining = budget.totalBudget - budget.amountSpent;
      await budget.save();
    }

    // Update task actual cost
    const task = await Task.findById(expense.task);
    if (task) {
      const approvedExpenses = await Expense.find({ 
        task: task._id, 
        status: 'approved' 
      });
      task.actualCost = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      await task.save();
    }
  } catch (error) {
    console.error('Error updating budget:', error);
  }
};

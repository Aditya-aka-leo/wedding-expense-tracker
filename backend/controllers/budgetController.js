const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Create or update budget
// @route   POST /api/budget
// @access  Private/Admin
exports.createOrUpdateBudget = async (req, res) => {
  try {
    const { totalBudget } = req.body;

    if (!totalBudget || totalBudget <= 0) {
      return res.status(400).json({ success: false, error: 'Please provide a valid total budget' });
    }

    // Check if budget already exists
    let budget = await Budget.findOne();

    if (budget) {
      // Update existing budget
      const previousTotal = budget.totalBudget;
      budget.totalBudget = totalBudget;
      budget.remaining = totalBudget - budget.amountSpent;
      await budget.save();

      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        budget,
      });
    } else {
      // Create new budget
      budget = await Budget.create({
        totalBudget,
        amountSpent: 0,
        remaining: totalBudget,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        budget,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current budget
// @route   GET /api/budget
// @access  Private
exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne().populate('createdBy', 'mobile role');

    if (!budget) {
      return res.status(404).json({ success: false, error: 'No budget found. Please create one first.' });
    }

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get budget summary
// @route   GET /api/budget/summary
// @access  Private
exports.getBudgetSummary = async (req, res) => {
  try {
    const budget = await Budget.findOne();

    if (!budget) {
      return res.status(404).json({ success: false, error: 'No budget found' });
    }

    // Calculate approved expenses total
    const approvedExpenses = await Expense.find({ status: 'approved' });
    const totalSpent = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate percentage used
    const percentageUsed = budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalBudget: budget.totalBudget,
        amountSpent: totalSpent,
        remaining: budget.totalBudget - totalSpent,
        percentageUsed: percentageUsed.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

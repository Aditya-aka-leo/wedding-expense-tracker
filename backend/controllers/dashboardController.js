const Budget = require('../models/Budget');
const Task = require('../models/Task');
const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get budget summary
    const budget = await Budget.findOne();
    const budgetSummary = budget ? {
      totalBudget: budget.totalBudget,
      amountSpent: budget.amountSpent,
      remaining: budget.remaining,
      percentageUsed: budget.totalBudget > 0 ? ((budget.amountSpent / budget.totalBudget) * 100).toFixed(2) : 0,
    } : null;

    // Get all tasks with actual costs
    const tasks = await Task.find();
    const tasksWithActual = await Promise.all(
      tasks.map(async (task) => {
        const approvedExpenses = await Expense.find({ 
          task: task._id, 
          status: 'approved' 
        });
        
        const actualCost = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        let budgetStatus = 'on-track';
        if (actualCost > task.estimatedCost) {
          budgetStatus = 'over-budget';
        } else if (actualCost < task.estimatedCost * 0.9) {
          budgetStatus = 'under-budget';
        }

        return {
          id: task._id,
          name: task.name,
          estimatedCost: task.estimatedCost,
          actualCost,
          budgetStatus,
          difference: actualCost - task.estimatedCost,
          status: task.status,
        };
      })
    );

    // Calculate total estimated vs actual
    const totalEstimated = tasks.reduce((sum, task) => sum + task.estimatedCost, 0);
    const totalActual = tasksWithActual.reduce((sum, task) => sum + task.actualCost, 0);

    // Get expense statistics
    const allExpenses = await Expense.find();
    const pendingExpenses = allExpenses.filter(exp => exp.status === 'pending');
    const approvedExpenses = allExpenses.filter(exp => exp.status === 'approved');
    const rejectedExpenses = allExpenses.filter(exp => exp.status === 'rejected');

    // Get over-budget alerts
    const overBudgetTasks = tasksWithActual.filter(task => task.budgetStatus === 'over-budget');

    // Get recent activities (last 10 expenses)
    const recentExpenses = await Expense.find()
      .populate('task', 'name')
      .populate('submittedBy', 'mobile')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      dashboard: {
        budget: budgetSummary,
        tasksSummary: {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'Completed').length,
          totalEstimated,
          totalActual,
          difference: totalActual - totalEstimated,
        },
        tasks: tasksWithActual,
        expenses: {
          total: allExpenses.length,
          pending: pendingExpenses.length,
          approved: approvedExpenses.length,
          rejected: rejectedExpenses.length,
        },
        alerts: {
          overBudgetTasks,
          pendingApprovals: pendingExpenses.length,
        },
        recentActivities: recentExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/dashboard/user
// @access  Private
exports.getUserDashboard = async (req, res) => {
  try {
    // Get user's expenses
    const userExpenses = await Expense.find({ submittedBy: req.user.id })
      .populate('task', 'name estimatedCost')
      .sort('-createdAt');

    // Group expenses by status
    const pending = userExpenses.filter(exp => exp.status === 'pending');
    const approved = userExpenses.filter(exp => exp.status === 'approved');
    const rejected = userExpenses.filter(exp => exp.status === 'rejected');

    // Calculate total submitted and approved amounts
    const totalSubmitted = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalApproved = approved.reduce((sum, exp) => sum + exp.amount, 0);

    // Get budget summary
    const budget = await Budget.findOne();
    const budgetSummary = budget ? {
      totalBudget: budget.totalBudget,
      amountSpent: budget.amountSpent,
      remaining: budget.remaining,
      percentageUsed: budget.totalBudget > 0 ? ((budget.amountSpent / budget.totalBudget) * 100).toFixed(2) : 0,
    } : null;

    res.status(200).json({
      success: true,
      dashboard: {
        budget: budgetSummary,
        myExpenses: {
          total: userExpenses.length,
          pending: pending.length,
          approved: approved.length,
          rejected: rejected.length,
          totalSubmitted,
          totalApproved,
        },
        recentExpenses: userExpenses.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get expense breakdown by task
// @route   GET /api/dashboard/expense-breakdown
// @access  Private
exports.getExpenseBreakdown = async (req, res) => {
  try {
    const tasks = await Task.find();

    const breakdown = await Promise.all(
      tasks.map(async (task) => {
        const approvedExpenses = await Expense.find({ 
          task: task._id, 
          status: 'approved' 
        });
        
        const totalAmount = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
          taskId: task._id,
          taskName: task.name,
          estimatedCost: task.estimatedCost,
          actualCost: totalAmount,
          expenseCount: approvedExpenses.length,
          percentage: 0, // Will calculate below
        };
      })
    );

    // Calculate percentages
    const totalActual = breakdown.reduce((sum, item) => sum + item.actualCost, 0);
    breakdown.forEach(item => {
      item.percentage = totalActual > 0 ? ((item.actualCost / totalActual) * 100).toFixed(2) : 0;
    });

    res.status(200).json({
      success: true,
      breakdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get analytics data
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    // Get all data
    const budget = await Budget.findOne();
    const tasks = await Task.find();
    const expenses = await Expense.find().populate('task submittedBy');
    const users = await User.find();

    // User statistics
    const userStats = await Promise.all(
      users.map(async (user) => {
        const userExpenses = await Expense.find({ submittedBy: user._id });
        const approvedExpenses = userExpenses.filter(exp => exp.status === 'approved');
        
        return {
          userId: user._id,
          mobile: user.mobile,
          role: user.role,
          totalExpenses: userExpenses.length,
          approvedExpenses: approvedExpenses.length,
          totalAmount: approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        };
      })
    );

    // Monthly expense trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          status: 'approved',
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalBudget: budget?.totalBudget || 0,
          totalSpent: budget?.amountSpent || 0,
          remaining: budget?.remaining || 0,
          totalTasks: tasks.length,
          totalUsers: users.length,
          totalExpenses: expenses.length,
        },
        userStats,
        monthlyExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

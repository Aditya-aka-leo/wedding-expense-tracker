const Task = require('../models/Task');
const Expense = require('../models/Expense');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res) => {
  try {
    const { name, estimatedCost, description } = req.body;

    if (!name || !estimatedCost) {
      return res.status(400).json({ success: false, error: 'Please provide task name and estimated cost' });
    }

    const task = await Task.create({
      name,
      estimatedCost,
      description,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('createdBy', 'mobile role');

    // For each task, calculate actual cost from approved expenses
    const tasksWithActual = await Promise.all(
      tasks.map(async (task) => {
        const approvedExpenses = await Expense.find({ 
          task: task._id, 
          status: 'approved' 
        });
        
        const actualCost = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Calculate budget status
        let budgetStatus = 'on-track';
        if (actualCost > task.estimatedCost) {
          budgetStatus = 'over-budget';
        } else if (actualCost < task.estimatedCost * 0.9) {
          budgetStatus = 'under-budget';
        }

        return {
          ...task.toObject(),
          actualCost,
          budgetStatus,
          difference: actualCost - task.estimatedCost,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: tasksWithActual.length,
      tasks: tasksWithActual,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'mobile role');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Get all expenses for this task
    const expenses = await Expense.find({ task: task._id })
      .populate('submittedBy', 'mobile role')
      .sort('-createdAt');

    // Calculate actual cost from approved expenses
    const approvedExpenses = expenses.filter(exp => exp.status === 'approved');
    const actualCost = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(200).json({
      success: true,
      task: {
        ...task.toObject(),
        actualCost,
        expenses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private/Admin
exports.updateTask = async (req, res) => {
  try {
    const { name, estimatedCost, description, status } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Update fields
    if (name) task.name = name;
    if (estimatedCost) task.estimatedCost = estimatedCost;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;

    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Check if there are approved expenses for this task
    const approvedExpenses = await Expense.find({ task: task._id, status: 'approved' });
    
    if (approvedExpenses.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete task with approved expenses' 
      });
    }

    // Delete all pending/rejected expenses for this task
    await Expense.deleteMany({ task: task._id });

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

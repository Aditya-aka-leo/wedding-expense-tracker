const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected
router.post('/', protect, adminOnly, createTask);
router.get('/', protect, getAllTasks);
router.get('/:id', protect, getTask);
router.put('/:id', protect, adminOnly, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;

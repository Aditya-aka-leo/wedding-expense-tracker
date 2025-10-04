const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  resetPin,
  getAllUsers,
  deleteUser,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Admin only routes
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/reset-pin/:userId', protect, adminOnly, resetPin);
router.delete('/users/:userId', protect, adminOnly, deleteUser);

module.exports = router;

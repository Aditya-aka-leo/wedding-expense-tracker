const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (but admin should approve or invite)
exports.register = async (req, res) => {
  try {
    const { mobile, pin, role } = req.body;

    // Validate input
    if (!mobile || !pin) {
      return res.status(400).json({ success: false, error: 'Please provide mobile number and PIN' });
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ success: false, error: 'PIN must be exactly 4 digits' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Mobile number already registered' });
    }

    // Hash PIN
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);

    // Create user
    const user = await User.create({
      mobile,
      pinHash,
      role: role || 'user', // Default to 'user' unless specified
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { mobile, pin } = req.body;

    // Validate input
    if (!mobile || !pin) {
      return res.status(400).json({ success: false, error: 'Please provide mobile number and PIN' });
    }

    // Find user by mobile
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check PIN
    const isMatch = await bcrypt.compare(pin, user.pinHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-pinHash');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset user PIN (Admin only)
// @route   PUT /api/auth/reset-pin/:userId
// @access  Private/Admin
exports.resetPin = async (req, res) => {
  try {
    const { newPin } = req.body;
    const { userId } = req.params;

    // Validate PIN format
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ success: false, error: 'PIN must be exactly 4 digits' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Hash new PIN
    const salt = await bcrypt.genSalt(10);
    user.pinHash = await bcrypt.hash(newPin, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'PIN reset successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-pinHash');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

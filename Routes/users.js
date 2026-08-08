const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getProfile,
  updateProfile
} = require('../controllers/userController');

const router = express.Router();

// route   GET /api/users/me
// desc    Get current user profile
// access  Private
router.get('/me', protect, getProfile);

// route   PUT /api/users/me
// desc    Update current user profile
// access  Private
router.put('/me', protect, updateProfile);

// route   GET /api/users
// desc    Get all users (admin only)
// access  Private/Admin
router.get('/', protect, adminOnly, getAllUsers);

// route   GET /api/users/:id
// desc    Get single user
// access  Private/Admin
router.get('/:id', protect, adminOnly, getUserById);

// route   PUT /api/users/:id
// desc    Update user
// access  Private/Admin
router.put('/:id', protect, adminOnly, updateUser);

// route   DELETE /api/users/:id
// desc    Delete user
// access  Private/Admin
router.delete('/:id', protect, adminOnly, deleteUser);

// route   POST /api/users/:id/block
// desc    Block user
// access  Private/Admin
router.post('/:id/block', protect, adminOnly, blockUser);

// route   POST /api/users/:id/unblock
// desc    Unblock user
// access  Private/Admin
router.post('/:id/unblock', protect, adminOnly, unblockUser);

module.exports = router;

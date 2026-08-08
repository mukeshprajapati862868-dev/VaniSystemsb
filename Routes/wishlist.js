const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlistController');

const router = express.Router();

// route   GET /api/wishlist
// desc    Get user's wishlist
// access  Private
router.get('/', protect, getWishlist);

// route   POST /api/wishlist/add
// desc    Add item to wishlist
// access  Private
router.post('/add', protect, [
  body('productId').notEmpty().withMessage('Product ID is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  addToWishlist(req, res);
});

// route   DELETE /api/wishlist/remove/:productId
// desc    Remove item from wishlist
// access  Private
router.delete('/remove/:productId', protect, removeFromWishlist);

// route   DELETE /api/wishlist/clear
// desc    Clear wishlist
// access  Private
router.delete('/clear', protect, clearWishlist);

module.exports = router;

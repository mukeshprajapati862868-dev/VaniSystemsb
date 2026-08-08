// const mongoose = require('mongoose');

// const wishlistSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   items: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product'
//   }]
// }, {
//   timestamps: true
// });

// // Index for user
// wishlistSchema.index({ userId: 1 });

// module.exports = mongoose.model('Wishlist', wishlistSchema);

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

// GET /api/wishlist
router.get('/', protect, getWishlist);

// POST /api/wishlist/add
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

// DELETE /api/wishlist/remove/:productId
router.delete('/remove/:productId', protect, removeFromWishlist);

// DELETE /api/wishlist/clear
router.delete('/clear', protect, clearWishlist);

module.exports = router;

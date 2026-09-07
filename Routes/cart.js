// ==============================
// routes/cartRoutes.js  (COMPLETE CLEAN)
// ==============================
const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

const router = express.Router();

// GET /api/cart
router.get('/', protect, getCart);

// POST /api/cart/add
router.post(
  '/add',
  protect,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    addToCart(req, res);
  }
);

// PUT /api/cart/update
router.put(
  '/update',
  protect,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    updateCartItem(req, res);
  }
);

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', protect, removeFromCart);

// DELETE /api/cart/clear
router.delete('/clear', protect, clearCart);

module.exports = router;

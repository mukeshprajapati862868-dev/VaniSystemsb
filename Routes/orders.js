const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  getOrderStats
} = require('../controllers/orderController');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (admin) or user orders (user)
// @access  Private
router.get('/', protect, getAllOrders);

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', protect, getAllOrders);

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics
// @access  Private/Admin
router.get('/stats/summary', protect, adminOnly, getOrderStats);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('customerAddress').notEmpty().withMessage('Customer address is required'),
  body('customerCity').notEmpty().withMessage('Customer city is required'),
  body('customerPinCode').notEmpty().withMessage('Customer PIN code is required'),
  body('items').isArray().withMessage('Items must be an array'),
  body('grandTotal').isNumeric().withMessage('Grand total must be a number')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  createOrder(req, res);
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, cancelOrder);

// @route   PUT /api/orders/:id/return
// @desc    Request return/refund
// @access  Private
router.put('/:id/return', protect, returnOrder);

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics
// @access  Private/Admin
router.get('/stats/summary', protect, adminOnly, getOrderStats);

module.exports = router;

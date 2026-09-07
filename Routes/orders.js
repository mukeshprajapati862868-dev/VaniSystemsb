// ==============================
// routes/orderRoutes.js (COMPLETE FIXED)
// ==============================

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

// ======================================================
// GET ALL ORDERS
// ======================================================

router.get('/', protect, getAllOrders);

// ======================================================
// GET MY ORDERS
// ======================================================

router.get('/my-orders', protect, getAllOrders);

// ======================================================
// GET ORDER STATS
// ======================================================

router.get('/stats/summary', protect, adminOnly, getOrderStats);

// ======================================================
// GET SINGLE ORDER
// ======================================================

router.get('/:id', protect, getOrderById);

// ======================================================
// CREATE ORDER
// ======================================================

router.post(
  '/',
  protect,
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items must be a non-empty array'),

    body('grandTotal')
      .isNumeric()
      .withMessage('Grand total must be a number'),

    body('paymentMethod')
      .notEmpty()
      .withMessage('Payment method is required')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return createOrder(req, res);
  }
);

// ======================================================
// UPDATE ORDER STATUS
// ======================================================

router.put(
  '/:id/status',
  protect,
  adminOnly,
  updateOrderStatus
);

// ======================================================
// CANCEL ORDER
// ======================================================

router.put(
  '/:id/cancel',
  protect,
  cancelOrder
);

// ======================================================
// RETURN ORDER
// ======================================================

router.put(
  '/:id/return',
  protect,
  returnOrder
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;

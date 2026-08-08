const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPaymentStats
} = require('../controllers/paymentController');

const router = express.Router();

// route   GET /api/payments
// desc    Get all payments (admin) or user payments (user)
// access  Private
router.get('/', protect, getAllPayments);

// route   GET /api/payments/:id
// desc    Get single payment
// access  Private
router.get('/:id', protect, getPaymentById);

// route   POST /api/payments
// desc    Record payment
// access  Private
router.post('/', protect, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('invoiceNumber').notEmpty().withMessage('Invoice number is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  createPayment(req, res);
});

// route   PUT /api/payments/:id/status
// desc    Update payment status
// access  Private/Admin
router.put('/:id/status', protect, adminOnly, updatePaymentStatus);

// route   GET /api/payments/stats/summary
// desc    Get payment statistics
// access  Private/Admin
router.get('/stats/summary', protect, adminOnly, getPaymentStats);

module.exports = router;

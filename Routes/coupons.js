const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');

const router = express.Router();

// @route   GET /api/coupons/active
// @desc    Get all active non-expired coupons visible to all logged-in users
// @access  Private — must come BEFORE /:id to avoid being caught as a param
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      status: 'active',
      validFrom: { $lte: now },
      validTo:   { $gte: now }
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: { coupons } });
  } catch (e) {
    console.error('Active coupons error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/coupons
// @desc    Get all coupons (admin) or active coupons (user)
// @access  Private
router.get('/', protect, getAllCoupons);

// @route   GET /api/coupons/:id
// @desc    Get single coupon
// @access  Private
router.get('/:id', protect, getCouponById);

// @route   POST /api/coupons
// @desc    Create new coupon
// @access  Private/Admin
router.post('/', protect, adminOnly, [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('discount').isNumeric().withMessage('Discount must be a number'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validTo').isISO8601().withMessage('Valid to date is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  createCoupon(req, res);
});

// @route   PUT /api/coupons/:id
// @desc    Update coupon
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateCoupon);

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, deleteCoupon);

// @route   POST /api/coupons/validate
// @desc    Validate coupon code
// @access  Private
router.post('/validate', protect, [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('cartTotal').isNumeric().withMessage('Cart total must be a number')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  validateCoupon(req, res);
});

module.exports = router;

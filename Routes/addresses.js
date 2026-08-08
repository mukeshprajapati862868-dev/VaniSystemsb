const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');

const router = express.Router();

// @route   GET /api/addresses
// @desc    Get user's addresses
// @access  Private
router.get('/', protect, getAllAddresses);

// @route   POST /api/addresses
// @desc    Add new address
// @access  Private
router.post('/', protect, [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('pincode').notEmpty().withMessage('PIN code is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  createAddress(req, res);
});

// @route   PUT /api/addresses/:id
// @desc    Update address
// @access  Private
router.put('/:id', protect, updateAddress);

// @route   DELETE /api/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/:id', protect, deleteAddress);

// @route   POST /api/addresses/:id/set-default
// @desc    Set address as default
// @access  Private
router.post('/:id/set-default', protect, setDefaultAddress);

module.exports = router;

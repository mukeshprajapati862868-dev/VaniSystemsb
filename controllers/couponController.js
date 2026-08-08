const Coupon = require('../models/Coupon');

/**
 * @desc    Get all coupons (admin) or active coupons (user)
 * @route   GET /api/coupons
 * @access  Private
 */
exports.getAllCoupons = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    
    // If not admin, only show active coupons
    if (req.user.role !== 'admin') {
      const now = new Date();
      query.status = 'active';
      query.validFrom = { $lte: now };
      query.validTo = { $gte: now };
    } else if (status) {
      query.status = status;
    }
    
    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        coupons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get single coupon
 * @route   GET /api/coupons/:id
 * @access  Private
 */
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { coupon }
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Create new coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
exports.createCoupon = async (req, res) => {
  try {
    // Check if coupon code already exists
    const codeExists = await Coupon.findOne({ code: req.body.code });
    if (codeExists) {
      return res.status(400).json({
        success: false,
        error: 'Coupon with this code already exists'
      });
    }

    const couponData = {
      ...req.body,
      createdBy: req.user.id,
      usedCount: 0
    };

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon }
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Update coupon
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    Object.assign(coupon, req.body);
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon }
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Validate coupon code
 * @route   POST /api/coupons/validate
 * @access  Private
 */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      status: 'active'
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid coupon code'
      });
    }

    // Check if coupon is expired
    const now = new Date();
    if (now < new Date(coupon.validFrom) || now > new Date(coupon.validTo)) {
      return res.status(400).json({
        success: false,
        error: 'Coupon has expired or is not yet valid'
      });
    }

    // Check minimum purchase
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase of ₹${coupon.minPurchase} required`
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'Coupon usage limit reached'
      });
    }

    // Calculate discount
    let discountAmount;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(cartTotal * coupon.discount / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discount;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon validated successfully',
      data: {
        coupon,
        discountAmount,
        finalAmount: cartTotal - discountAmount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

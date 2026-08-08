const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { createAndSendNotification } = require('./notificationController');

// Helper function to generate transaction ID
const generateTransactionId = () => `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * @desc    Get all payments (admin) or user payments (user)
 * @route   GET /api/payments
 * @access  Private
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    
    // If not admin, only show user's payments by userId
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }
    
    if (status) query.paymentStatus = status;
    
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get single payment
 * @route   GET /api/payments/:id
 * @access  Private
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.id });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // If not admin, only allow user to see their own payments
    if (req.user.role !== 'admin' && payment.customerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Record payment
 * @route   POST /api/payments
 * @access  Private
 */
exports.createPayment = async (req, res) => {
  try {
    // 💡 फ़िक्स: यदि टोकन (req.user) में ये फ़ील्ड्स अपरिभाषित (undefined) हैं, तो फ्रंटएंड (req.body) के डेटा का उपयोग किया जाएगा
    const targetName = (req.user && req.user.name) || req.body.customerName || req.body.name || 'Guest Customer';
    const targetEmail = (req.user && req.user.email) || req.body.customerEmail || req.body.email || 'customer@example.com';
    const targetPhone = (req.user && req.user.phone) || req.body.customerPhone || req.body.phone || '0000000000';

    // पेमेंट मेथड वैलिडेशन (Enum Safeguard)
    let finalPaymentMethod = 'UPI';
    const validMethods = ['Cash On Delivery', 'UPI', 'Debit Card', 'Credit Card', 'Wallet', 'Net Banking', 'EMI'];
    if (validMethods.includes(req.body.paymentMethod)) {
      finalPaymentMethod = req.body.paymentMethod;
    }

    const paymentData = {
      ...req.body,
      paymentMethod: finalPaymentMethod,
      transactionId: generateTransactionId(),
      userId: req.user.id,
      customerName: targetName,
      customerEmail: targetEmail,
      customerPhone: targetPhone,
      paymentStatus: req.body.paymentMethod === 'Cash On Delivery' ? 'Pending' : 'Paid'
    };

    const payment = await Payment.create(paymentData);

    // Update order payment status
    const order = await Order.findOne({ orderId: req.body.orderId });
    if (order) {
      order.paymentStatus = paymentData.paymentStatus;
      await order.save();
    }

    // Send payment notification to user
    const statusLabel = paymentData.paymentStatus === 'Paid' ? 'confirmed' : 'recorded (COD - to be collected on delivery)';
    await createAndSendNotification(req.app, {
      userId: req.user.id,
      userEmail: targetEmail,
      title: '💳 Payment ' + (paymentData.paymentStatus === 'Paid' ? 'Successful!' : 'Recorded - COD'),
      message: `Payment of ₹${paymentData.amount} for order ${paymentData.orderId} has been ${statusLabel}.`,
      type: 'payment'
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/payments/:id/status
 * @access  Private/Admin
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const payment = await Payment.findOne({ transactionId: req.params.id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    payment.paymentStatus = paymentStatus;

    if (paymentStatus === 'Refunded') {
      payment.refundAmount = payment.amount;
      payment.refundReason = req.body.refundReason || 'Refunded by admin';
      payment.refundDate = Date.now();

      // Update order status
      const order = await Order.findOne({ orderId: payment.orderId });
      if (order) {
        order.status = 'Refunded';
        await order.save();
      }
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get payment statistics
 * @route   GET /api/payments/stats/summary
 * @access  Private/Admin
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const payments = await Payment.find({});

    const stats = {
      total: payments.length,
      paid: payments.filter(p => p.paymentStatus === 'Paid').length,
      pending: payments.filter(p => p.paymentStatus === 'Pending').length,
      failed: payments.filter(p => p.paymentStatus === 'Failed').length,
      refunded: payments.filter(p => p.paymentStatus === 'Refunded').length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      paidAmount: payments.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

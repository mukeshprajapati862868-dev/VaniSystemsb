const Order = require('../models/Order');
const { createAndSendNotification } = require('./notificationController');

// Helper functions to generate unique IDs
const generateOrderId = () => `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
const generateInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
const generateTrackingNumber = () => `TRK-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;

/**
 * @desc    Get all orders (admin) or user orders (user)
 * @route   GET /api/orders
 * @access  Private
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }
    
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res) => {
  try {
    const generatedId = generateOrderId();
    
    // 💡 फ़िक्स: यदिreq.user.email अपरिभाषित (undefined) है, तोreq.body के ईमेल का उपयोग किया जाएगा
    const targetEmail = req.user.email || req.body.customerEmail || req.body.email || 'user@example.com';

    const orderData = {
      ...req.body,
      orderId: generatedId,
      invoiceNumber: generateInvoiceNumber(),
      trackingNumber: generateTrackingNumber(),
      userId: req.user.id,
      customerEmail: targetEmail,
      status: 'Pending',
      paymentStatus: req.body.paymentMethod === 'Cash On Delivery' ? 'Pending' : 'Paid',
      timeline: [{
        status: 'Order Placed',
        date: new Date().toLocaleString(),
        remarks: 'Order received successfully',
        adminName: 'System'
      }],
      tracking: {
        currentLocation: 'Processing Center',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        trackingHistory: [{
          status: 'Order Placed',
          location: 'Processing Center',
          date: new Date().toLocaleString(),
          time: new Date().toLocaleTimeString()
        }]
      }
    };

    const order = await Order.create(orderData);

    const io = req.app.get('io');
    if (io) io.to('admin-room').emit('new-order', order);

    await createAndSendNotification(req.app, {
      userId: req.user._id || req.user.id,
      userEmail: targetEmail,
      title: '📦 Order Placed Successfully!',
      message: `Thank you for your purchase. Your order ID is ${generatedId}.`,
      type: 'order'
    });

    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, remarks, location } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.status = status;
    order.timeline.push({ status, date: new Date().toLocaleString(), remarks: remarks || `Status updated to ${status}`, adminName: req.user.name || 'Admin' });

    if (location) {
      order.tracking.currentLocation = location;
      order.tracking.trackingHistory.push({ status, location, date: new Date().toLocaleString(), time: new Date().toLocaleTimeString() });
    }

    await order.save();

    const io = req.app.get('io');
    if (io) io.to(`user-${order.userId}`).emit('order-updated', order);

    // Status-specific notification messages
    let notifTitle = '🔔 Order Status Updated';
    let notifMessage = `Your order (${order.orderId}) status has changed to: ${status}.`;

    if (status === 'Delivered' || status === 'Completed') {
      notifTitle = '✅ Order Delivered!';
      notifMessage = `Great news! Your order (${order.orderId}) has been delivered successfully. Enjoy your purchase!`;
    } else if (status === 'Shipped') {
      notifTitle = '🚚 Order Shipped!';
      notifMessage = `Your order (${order.orderId}) is on its way! Expected delivery: ${order.tracking?.estimatedDelivery || 'soon'}.`;
    } else if (status === 'Confirmed') {
      notifTitle = '✔️ Order Confirmed';
      notifMessage = `Your order (${order.orderId}) has been confirmed and is being prepared.`;
    }

    await createAndSendNotification(req.app, {
      userId: order.userId,
      userEmail: order.customerEmail || 'user@example.com',
      title: notifTitle,
      message: notifMessage,
      type: 'order'
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (req.user.role !== 'admin' && order.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });
    if (['Delivered', 'Completed', 'Cancelled'].includes(order.status)) return res.status(400).json({ success: false, error: 'Cannot cancel' });

    order.status = 'Cancelled';
    order.cancellationReason = reason;
    order.timeline.push({ status: 'Cancelled', date: new Date().toLocaleString(), remarks: reason || 'Cancelled by user', adminName: req.user.name || 'Customer' });

    await order.save();

    const io = req.app.get('io');
    if (io) io.to('admin-room').emit('order-cancelled', order);

    await createAndSendNotification(req.app, {
      userId: order.userId,
      userEmail: order.customerEmail || 'user@example.com',
      title: '❌ Order Cancelled',
      message: `Order ${order.orderId} has been successfully cancelled.`,
      type: 'order'
    });

    res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Request return/refund for a delivered order
 * @route   PUT /api/orders/:id/return
 * @access  Private
 */
exports.returnOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Only the order owner can request return
    if (order.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Only delivered/completed orders can be returned
    if (!['Delivered', 'Completed'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Only delivered orders can be returned' });
    }

    order.status = 'Returned';
    order.returnReason = reason || 'Return requested by customer';
    order.refundStatus = 'Pending';
    order.refundAmount = order.grandTotal;
    order.timeline.push({
      status: 'Return Requested',
      date: new Date().toLocaleString(),
      remarks: reason || 'Return requested by customer',
      adminName: req.user.name || 'Customer'
    });

    await order.save();

    const io = req.app.get('io');
    if (io) io.to('admin-room').emit('return-requested', order);

    await createAndSendNotification(req.app, {
      userId: order.userId,
      userEmail: order.customerEmail,
      title: '↩️ Return Request Submitted',
      message: `Your return request for order ${order.orderId} has been submitted. Refund of ₹${order.grandTotal} will be processed within 5-7 business days.`,
      type: 'order'
    });

    res.status(200).json({ success: true, message: 'Return request submitted successfully', data: order });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
exports.getOrderStats = async (req, res) => {
  try {
    const orders = await Order.find({});
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      orders: orders.filter(o => o.status === 'Confirmed').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0)
    };
    res.status(200).json({ success: true, data: { stats } });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

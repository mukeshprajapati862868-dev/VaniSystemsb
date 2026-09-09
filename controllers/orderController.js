// // ==============================
// // controllers/orderController.js
// // ==============================

// const Order = require('../models/Order');

// // ======================================================
// // ORDER ID GENERATOR
// // ======================================================

// const generateOrderId = () => {
//   const timestamp = Date.now().toString().slice(-8);
//   const random = Math.floor(1000 + Math.random() * 9000);

//   return `ORD-${timestamp}-${random}`;
// };

// // ======================================================
// // INVOICE NUMBER GENERATOR
// // ======================================================

// const generateInvoiceNumber = () => {
//   const timestamp = Date.now().toString().slice(-8);
//   const random = Math.floor(100 + Math.random() * 900);

//   return `INV-${timestamp}-${random}`;
// };

// // ======================================================
// // TRACKING NUMBER GENERATOR
// // ======================================================

// const generateTrackingNumber = () => {
//   const timestamp = Date.now().toString().slice(-8);
//   const random = Math.floor(1000 + Math.random() * 9000);

//   return `TRK-${timestamp}-${random}`;
// };

// // ======================================================
// // CREATE AND SEND NOTIFICATION
// // ======================================================

// const createAndSendNotification = async (app, data) => {
//   try {
//     if (!app) {
//       return;
//     }

//     const notificationController = require('./notificationController');

//     if (
//       notificationController &&
//       typeof notificationController.createNotification === 'function'
//     ) {
//       await notificationController.createNotification({
//         body: data
//       });
//     }
//   } catch (error) {
//     console.error(
//       'Notification error:',
//       error.message
//     );
//   }
// };

// // ==============================
// // CREATE ORDER
// // ==============================

// exports.createOrder = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const generatedId = generateOrderId();

//     const targetEmail =
//       req.user?.email ||
//       req.body.customerEmail ||
//       'user@example.com';

//     const targetName =
//       req.body.customerName ||
//       req.user?.name ||
//       'Customer';

//     const targetPhone =
//       req.body.customerPhone ||
//       req.user?.phone ||
//       '';

//     const orderData = {
//       orderId: generatedId,

//       invoiceNumber:
//         generateInvoiceNumber(),

//       trackingNumber:
//         generateTrackingNumber(),

//       userId:
//         req.user._id ||
//         req.user.id,

//       customerEmail:
//         targetEmail,

//       customerName:
//         targetName,

//       customerPhone:
//         targetPhone,

//       customerAddress:
//         req.body.customerAddress || '',

//       customerCity:
//         req.body.customerCity || '',

//       customerPinCode:
//         req.body.customerPinCode || '',

//       items:
//         Array.isArray(req.body.items)
//           ? req.body.items
//           : [],

//       totalItems:
//         Number(req.body.totalItems) || 0,

//       subtotal:
//         Number(req.body.subtotal) || 0,

//       shippingCharge: 0,

//       tax: 0,

//       discount:
//         Number(req.body.discount) || 0,

//       grandTotal:
//         Number(req.body.grandTotal) || 0,

//       paymentMethod:
//         req.body.paymentMethod ||
//         'Cash On Delivery',

//       paymentStatus:
//         req.body.paymentMethod ===
//         'Cash On Delivery'
//           ? 'Pending'
//           : 'Paid',

//       status: 'Pending',

//       timeline: [
//         {
//           status: 'Order Placed',

//           date:
//             new Date().toLocaleString(),

//           remarks:
//             'Order received successfully',

//           adminName: 'System'
//         }
//       ],

//       tracking: {
//         currentLocation:
//           'Processing Center',

//         estimatedDelivery:
//           new Date(
//             Date.now() +
//             7 * 24 * 60 * 60 * 1000
//           ).toLocaleDateString(),

//         trackingHistory: [
//           {
//             status: 'Order Placed',

//             location:
//               'Processing Center',

//             date:
//               new Date().toLocaleString(),

//             time:
//               new Date().toLocaleTimeString()
//           }
//         ]
//       }
//     };

//     const order =
//       await Order.create(orderData);

//     // ==================================================
//     // SOCKET.IO ADMIN NOTIFICATION
//     // ==================================================

//     const io =
//       req.app.get('io');

//     if (io) {
//       io
//         .to('admin-room')
//         .emit(
//           'new-order',
//           order
//         );
//     }

//     // ==================================================
//     // USER NOTIFICATION
//     // ==================================================

//     await createAndSendNotification(
//       req.app,
//       {
//         userId:
//           req.user._id ||
//           req.user.id,

//         userEmail:
//           targetEmail,

//         title:
//           '📦 Order Placed Successfully!',

//         message:
//           `Thank you for your purchase. Your order ID is ${generatedId}.`,

//         type:
//           'order'
//       }
//     );

//     // ==================================================
//     // SUCCESS RESPONSE
//     // ==================================================

//     return res.status(201).json({
//       success: true,

//       message:
//         'Order created successfully',

//       data:
//         order
//     });

//   } catch (error) {

//     console.error(
//       'Create order error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       error:
//         error.message ||
//         'Server error'
//     });
//   }
// };

// // ==============================
// // GET ALL ORDERS
// // ==============================

// exports.getAllOrders = async (req, res) => {
//   try {

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const isAdmin =
//       req.user.role === 'admin' ||
//       req.user.role === 'Admin';

//     let orders;

//     if (isAdmin) {

//       orders =
//         await Order.find({})
//           .sort({
//             createdAt: -1
//           });

//     } else {

//       orders =
//         await Order.find({
//           userId:
//             req.user._id ||
//             req.user.id
//         })
//         .sort({
//           createdAt: -1
//         });
//     }

//     return res.status(200).json({
//       success: true,

//       count:
//         orders.length,

//       data: {
//         orders
//       }
//     });

//   } catch (error) {

//     console.error(
//       'Get all orders error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       error:
//         error.message ||
//         'Failed to fetch orders'
//     });
//   }
// };

// // ==============================
// // GET ORDER BY ID
// // ==============================

// exports.getOrderById = async (req, res) => {
//   try {

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         error: 'Authentication required'
//       });
//     }

//     const order =
//       await Order.findById(
//         req.params.id
//       );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         error: 'Order not found'
//       });
//     }

//     const isAdmin =
//       req.user.role === 'admin' ||
//       req.user.role === 'Admin';

//     const orderUserId =
//       order.userId
//         ? order.userId.toString()
//         : '';

//     const currentUserId =
//       (
//         req.user._id ||
//         req.user.id
//       ).toString();

//     if (
//       !isAdmin &&
//       orderUserId !== currentUserId
//     ) {
//       return res.status(403).json({
//         success: false,
//         error:
//           'You are not authorized to view this order'
//       });
//     }

//     return res.status(200).json({
//       success: true,

//       data: order
//     });

//   } catch (error) {

//     console.error(
//       'Get order by ID error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       error:
//         error.message ||
//         'Failed to fetch order'
//     });
//   }
// };

// // ==============================
// // UPDATE ORDER STATUS
// // ==============================

// exports.updateOrderStatus = async (
//   req,
//   res
// ) => {
//   try {

//     const {
//       status,
//       remarks
//     } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Order status is required'
//       });
//     }

//     const allowedStatuses = [
//       'Pending',
//       'Confirmed',
//       'Processing',
//       'Shipped',
//       'Out for Delivery',
//       'Delivered',
//       'Cancelled',
//       'Returned'
//     ];

//     const normalizedStatus =
//       String(status)
//         .trim();

//     if (
//       !allowedStatuses.includes(
//         normalizedStatus
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         error:
//           `Invalid order status. Allowed statuses: ${allowedStatuses.join(', ')}`
//       });
//     }

//     const order =
//       await Order.findById(
//         req.params.id
//       );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         error:
//           'Order not found'
//       });
//     }

//     order.status =
//       normalizedStatus;

//     if (
//       !Array.isArray(
//         order.timeline
//       )
//     ) {
//       order.timeline = [];
//     }

//     order.timeline.push({
//       status:
//         normalizedStatus,

//       date:
//         new Date().toLocaleString(),

//       remarks:
//         remarks ||
//         `Order status changed to ${normalizedStatus}`,

//       adminName:
//         req.user?.name ||
//         req.user?.email ||
//         'Admin'
//     });

//     if (
//       !order.tracking
//     ) {
//       order.tracking = {
//         currentLocation:
//           'Processing Center',

//         estimatedDelivery:
//           new Date(
//             Date.now() +
//             7 * 24 * 60 * 60 * 1000
//           ).toLocaleDateString(),

//         trackingHistory: []
//       };
//     }

//     if (
//       !Array.isArray(
//         order.tracking.trackingHistory
//       )
//     ) {
//       order.tracking.trackingHistory = [];
//     }

//     order.tracking.trackingHistory.push({
//       status:
//         normalizedStatus,

//       location:
//         order.tracking.currentLocation ||
//         'Processing Center',

//       date:
//         new Date().toLocaleString(),

//       time:
//         new Date().toLocaleTimeString()
//     });

//     await order.save();

//     const io =
//       req.app.get('io');

//     if (io) {
//       io
//         .to(`user-${order.userId}`)
//         .emit(
//           'order-status-updated',
//           order
//         );

//       io
//         .to('admin-room')
//         .emit(
//           'order-status-updated',
//           order
//         );
//     }

//     return res.status(200).json({
//       success: true,

//       message:
//         'Order status updated successfully',

//       data:
//         order
//     });

//   } catch (error) {

//     console.error(
//       'Update order status error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       error:
//         error.message ||
//         'Failed to update order status'
//     });
//   }
// };

// // ==============================
// // CANCEL ORDER
// // ==============================

// exports.cancelOrder = async (
//   req,
//   res
// ) => {
//   try {

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         error:
//           'Authentication required'
//       });
//     }

//     const order =
//       await Order.findById(
//         req.params.id
//       );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         error:
//           'Order not found'
//       });
//     }

//     const isAdmin =
//       req.user.role === 'admin' ||
//       req.user.role === 'Admin';

//     const orderUserId =
//       order.userId
//         ? order.userId.toString()
//         : '';

//     const currentUserId =
//       (
//         req.user._id ||
//         req.user.id
//       ).toString();

//     if (
//       !isAdmin &&
//       orderUserId !== currentUserId
//     ) {
//       return res.status(403).json({
//         success: false,
//         error:
//           'You are not authorized to cancel this order'
//       });
//     }

//     if (
//       order.status === 'Delivered'
//     ) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Delivered order cannot be cancelled'
//       });
//     }

//     if (
//       order.status === 'Cancelled'
//     ) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Order is already cancelled'
//       });
//     }

//     const reason =
//       req.body?.reason ||
//       'Order cancelled by customer';

//     order.status =
//       'Cancelled';

//     if (
//       !Array.isArray(
//         order.timeline
//       )
//     ) {
//       order.timeline = [];
//     }

//     order.timeline.push({
//       status:
//         'Cancelled',

//       date:
//         new Date().toLocaleString(),

//       remarks:
//         reason,

//       adminName:
//         isAdmin
//           ? (
//               req.user?.name ||
//               req.user?.email ||
//               'Admin'
//             )
//           : 'Customer'
//     });

//     if (
//       order.tracking
//     ) {

//       if (
//         !Array.isArray(
//           order.tracking.trackingHistory
//         )
//       ) {
//         order.tracking.trackingHistory = [];
//       }

//       order.tracking.trackingHistory.push({
//         status:
//           'Cancelled',

//         location:
//           order.tracking.currentLocation ||
//           'Processing Center',

//         date:
//           new Date().toLocaleString(),

//         time:
//           new Date().toLocaleTimeString()
//       });
//     }

//     await order.save();

//     const io =
//       req.app.get('io');

//     if (io) {
//       io
//         .to(`user-${order.userId}`)
//         .emit(
//           'order-cancelled',
//           order
//         );

//       io
//         .to('admin-room')
//         .emit(
//           'order-cancelled',
//           order
//         );
//     }

//     return res.status(200).json({
//       success: true,

//       message:
//         'Order cancelled successfully',

//       data:
//         order
//     });

//   } catch (error) {

//     console.error(
//       'Cancel order error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       error:
//         error.message ||
//         'Failed to cancel order'
//     });
//   }
// };

// // ==============================
// // RETURN ORDER
// // ==============================

// exports.returnOrder = async (
//   req,
//   res
// ) => {
//   try {

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         error:
//           'Authentication required'
//       });
//     }

//     const order =
//       await Order.findById(
//         req.params.id
//       );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         error:
//           'Order not found'
//       });
//     }

//     const isAdmin =
//       req.user.role === 'admin' ||
//       req.user.role === 'Admin';

//     const orderUserId =
//       order.userId
//         ? order.userId.toString()
//         : '';

//     const currentUserId =
//       (
//         req.user._id ||
//         req.user.id
//       ).toString();

//     if (
//       !isAdmin &&
//       orderUserId !== currentUserId
//     ) {
//       return res.status(403).json({
//         success: false,
//         error:
//           'You are not authorized to return this order'
//       });
//     }

//     if (
//       order.status !== 'Delivered'
//     ) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Only delivered orders can be returned'
//       });
//     }

//     const reason =
//       req.body?.reason ||
//       'Return requested by customer';

//     order.status =
//       'Returned';

//     if (
//       !Array.isArray(
//         order.timeline
//       )
//     ) {
//       order.timeline = [];
//     }

//     order.timeline.push({
//       status:
//         'Returned',

//       date:
//         new Date().toLocaleString(),

//       remarks:
//         reason,

//       adminName:
//         isAdmin
//           ? (
//               req.user?.name ||
//               req.user?.email ||
//               'Admin'
//             )
//           : 'Customer'
//     });

//     if (
//       order.tracking
//     ) {

//       if (
//         !Array.isArray(
//           order.tracking.trackingHistory
//         )
//       ) {
//         order.tracking.trackingHistory = [];
//       }

//       order.tracking.trackingHistory.push({
//         status:
//           'Returned',

//         location:
//           order.tracking.currentLocation ||
//           'Processing Center',

//         date:
//           new Date().toLocaleString(),

//         time:
//           new Date().toLocaleTimeString()
//       });
//     }

//     await order.save();

//     const io =
//       req.app.get('io');

//     if (io) {
//       io
//         .to(`user-${order.userId}`)
//         .emit(
//           'order-returned',
//           order
//         );

//       io
//         .to('admin-room')
//         .emit(
//           'order-returned',
//           order
//         );
//     }

//     return res.status(200).json({
//       success: true,

//       message:
//         'Order return processed successfully',

//       data:
//         order
//     });

//   } catch (error) {

//     console.error(
//       'Return order error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       error:
//         error.message ||
//         'Failed to return order'
//     });
//   }
// };

// // ==============================
// // GET ORDER STATS
// // ==============================

// exports.getOrderStats = async (
//   req,
//   res
// ) => {
//   try {

//     const totalOrders =
//       await Order.countDocuments();

//     const pendingOrders =
//       await Order.countDocuments({
//         status: 'Pending'
//       });

//     const confirmedOrders =
//       await Order.countDocuments({
//         status: 'Confirmed'
//       });

//     const processingOrders =
//       await Order.countDocuments({
//         status: 'Processing'
//       });

//     const shippedOrders =
//       await Order.countDocuments({
//         status: 'Shipped'
//       });

//     const outForDeliveryOrders =
//       await Order.countDocuments({
//         status: 'Out for Delivery'
//       });

//     const deliveredOrders =
//       await Order.countDocuments({
//         status: 'Delivered'
//       });

//     const cancelledOrders =
//       await Order.countDocuments({
//         status: 'Cancelled'
//       });

//     const returnedOrders =
//       await Order.countDocuments({
//         status: 'Returned'
//       });

//     const salesResult =
//       await Order.aggregate([
//         {
//           $match: {
//             status: {
//               $ne: 'Cancelled'
//             }
//           }
//         },
//         {
//           $group: {
//             _id: null,

//             totalSales: {
//               $sum: {
//                 $ifNull: [
//                   '$grandTotal',
//                   0
//                 ]
//               }
//             }
//           }
//         }
//       ]);

//     const totalSales =
//       salesResult.length > 0
//         ? salesResult[0].totalSales
//         : 0;

//     return res.status(200).json({
//       success: true,

//       data: {
//         totalOrders,

//         pendingOrders,

//         confirmedOrders,

//         processingOrders,

//         shippedOrders,

//         outForDeliveryOrders,

//         deliveredOrders,

//         cancelledOrders,

//         returnedOrders,

//         totalSales
//       }
//     });

//   } catch (error) {

//     console.error(
//       'Get order stats error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       error:
//         error.message ||
//         'Failed to fetch order statistics'
//     });
//   }
// };

// // ==============================
// // EXPORTS
// // ==============================

// module.exports = {
//   createOrder:
//     exports.createOrder,

//   getAllOrders:
//     exports.getAllOrders,

//   getOrderById:
//     exports.getOrderById,

//   updateOrderStatus:
//     exports.updateOrderStatus,

//   cancelOrder:
//     exports.cancelOrder,

//   returnOrder:
//     exports.returnOrder,

//   getOrderStats:
//     exports.getOrderStats
// };




// ==============================
// controllers/orderController.js
// ==============================
const Order = require('../models/Order');

// ======================================================
// ORDER ID GENERATOR
// ======================================================
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

// ======================================================
// INVOICE NUMBER GENERATOR
// ======================================================
const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${timestamp}-${random}`;
};

// ======================================================
// TRACKING NUMBER GENERATOR
// ======================================================
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRK-${timestamp}-${random}`;
};

// ======================================================
// CREATE AND SEND NOTIFICATION
// ======================================================
const createAndSendNotification = async (app, data) => {
  try {
    if (!app) {
      return;
    }
    const notificationController = require('./notificationController');
    if (
      notificationController &&
      typeof notificationController.createNotification === 'function'
    ) {
      await notificationController.createNotification({
        body: data
      });
    }
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

// ==============================
// CREATE ORDER
// ==============================
exports.createOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const generatedId = generateOrderId();

    const targetEmail =
      req.user?.email ||
      req.body.customerEmail ||
      'user@example.com';

    const targetName =
      req.body.customerName ||
      req.user?.name ||
      'Customer';

    const targetPhone =
      req.body.customerPhone ||
      req.user?.phone ||
      '';

    const orderData = {
      orderId: generatedId,
      invoiceNumber: generateInvoiceNumber(),
      trackingNumber: generateTrackingNumber(),
      userId: req.user._id || req.user.id,
      customerEmail: targetEmail,
      customerName: targetName,
      customerPhone: targetPhone,
      customerAddress: req.body.customerAddress || '',
      customerCity: req.body.customerCity || '',
      customerPinCode: req.body.customerPinCode || '',
      items: Array.isArray(req.body.items) ? req.body.items : [],
      totalItems: Number(req.body.totalItems) || 0,
      subtotal: Number(req.body.subtotal) || 0,
      shippingCharge: 0,
      tax: 0,
      discount: Number(req.body.discount) || 0,
      grandTotal: Number(req.body.grandTotal) || 0,
      paymentMethod: req.body.paymentMethod || 'Cash On Delivery',
      paymentStatus:
        req.body.paymentMethod === 'Cash On Delivery' ? 'Pending' : 'Paid',
      status: 'Pending',
      timeline: [
        {
          status: 'Order Placed',
          date: new Date().toLocaleString(),
          remarks: 'Order received successfully',
          adminName: 'System'
        }
      ],
      tracking: {
        currentLocation: 'Processing Center',
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        trackingHistory: [
          {
            status: 'Order Placed',
            location: 'Processing Center',
            date: new Date().toLocaleString(),
            time: new Date().toLocaleTimeString()
          }
        ]
      }
    };

    const order = await Order.create(orderData);

    // SOCKET.IO ADMIN NOTIFICATION
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-order', order);
    }

    // USER NOTIFICATION
    await createAndSendNotification(req.app, {
      userId: req.user._id || req.user.id,
      userEmail: targetEmail,
      title: '📦 Order Placed Successfully!',
      message: `Thank you for your purchase. Your order ID is ${generatedId}.`,
      type: 'order'
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

// ==============================
// GET ALL ORDERS
// ==============================
exports.getAllOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const isAdmin =
      req.user.role === 'admin' || req.user.role === 'Admin';

    let orders;

    if (isAdmin) {
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        userId: req.user._id || req.user.id
      }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch orders'
    });
  }
};

// ==============================
// GET ORDER BY ID
// ==============================
exports.getOrderById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Fixed: orderId se find kar rahe hain (custom ID)
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const isAdmin =
      req.user.role === 'admin' || req.user.role === 'Admin';

    const orderUserId = order.userId ? order.userId.toString() : '';
    const currentUserId = (req.user._id || req.user.id).toString();

    if (!isAdmin && orderUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch order'
    });
  }
};

// ==============================
// UPDATE ORDER STATUS
// ==============================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Order status is required'
      });
    }

    const allowedStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned'
    ];

    const normalizedStatus = String(status).trim();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid order status. Allowed statuses: ${allowedStatuses.join(', ')}`
      });
    }

    // Fixed: orderId se find kar rahe hain (custom ID)
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.status = normalizedStatus;

    if (!Array.isArray(order.timeline)) {
      order.timeline = [];
    }

    order.timeline.push({
      status: normalizedStatus,
      date: new Date().toLocaleString(),
      remarks: remarks || `Order status changed to ${normalizedStatus}`,
      adminName: req.user?.name || req.user?.email || 'Admin'
    });

    if (!order.tracking) {
      order.tracking = {
        currentLocation: 'Processing Center',
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        trackingHistory: []
      };
    }

    if (!Array.isArray(order.tracking.trackingHistory)) {
      order.tracking.trackingHistory = [];
    }

    order.tracking.trackingHistory.push({
      status: normalizedStatus,
      location: order.tracking.currentLocation || 'Processing Center',
      date: new Date().toLocaleString(),
      time: new Date().toLocaleTimeString()
    });

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${order.userId}`).emit('order-status-updated', order);
      io.to('admin-room').emit('order-status-updated', order);
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update order status'
    });
  }
};

// ==============================
// CANCEL ORDER
// ==============================
exports.cancelOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Fixed: orderId se find kar rahe hain
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const isAdmin =
      req.user.role === 'admin' || req.user.role === 'Admin';

    const orderUserId = order.userId ? order.userId.toString() : '';
    const currentUserId = (req.user._id || req.user.id).toString();

    if (!isAdmin && orderUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to cancel this order'
      });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({
        success: false,
        error: 'Delivered order cannot be cancelled'
      });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Order is already cancelled'
      });
    }

    const reason = req.body?.reason || 'Order cancelled by customer';

    order.status = 'Cancelled';

    if (!Array.isArray(order.timeline)) {
      order.timeline = [];
    }

    order.timeline.push({
      status: 'Cancelled',
      date: new Date().toLocaleString(),
      remarks: reason,
      adminName: isAdmin
        ? req.user?.name || req.user?.email || 'Admin'
        : 'Customer'
    });

    if (order.tracking) {
      if (!Array.isArray(order.tracking.trackingHistory)) {
        order.tracking.trackingHistory = [];
      }

      order.tracking.trackingHistory.push({
        status: 'Cancelled',
        location: order.tracking.currentLocation || 'Processing Center',
        date: new Date().toLocaleString(),
        time: new Date().toLocaleTimeString()
      });
    }

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${order.userId}`).emit('order-cancelled', order);
      io.to('admin-room').emit('order-cancelled', order);
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel order'
    });
  }
};

// ==============================
// RETURN ORDER
// ==============================
exports.returnOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Fixed: orderId se find kar rahe hain
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const isAdmin =
      req.user.role === 'admin' || req.user.role === 'Admin';

    const orderUserId = order.userId ? order.userId.toString() : '';
    const currentUserId = (req.user._id || req.user.id).toString();

    if (!isAdmin && orderUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to return this order'
      });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        error: 'Only delivered orders can be returned'
      });
    }

    const reason = req.body?.reason || 'Return requested by customer';

    order.status = 'Returned';

    if (!Array.isArray(order.timeline)) {
      order.timeline = [];
    }

    order.timeline.push({
      status: 'Returned',
      date: new Date().toLocaleString(),
      remarks: reason,
      adminName: isAdmin
        ? req.user?.name || req.user?.email || 'Admin'
        : 'Customer'
    });

    if (order.tracking) {
      if (!Array.isArray(order.tracking.trackingHistory)) {
        order.tracking.trackingHistory = [];
      }

      order.tracking.trackingHistory.push({
        status: 'Returned',
        location: order.tracking.currentLocation || 'Processing Center',
        date: new Date().toLocaleString(),
        time: new Date().toLocaleTimeString()
      });
    }

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${order.userId}`).emit('order-returned', order);
      io.to('admin-room').emit('order-returned', order);
    }

    return res.status(200).json({
      success: true,
      message: 'Order return processed successfully',
      data: order
    });
  } catch (error) {
    console.error('Return order error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to return order'
    });
  }
};

// ==============================
// GET ORDER STATS
// ==============================
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'Confirmed' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
    const outForDeliveryOrders = await Order.countDocuments({
      status: 'Out for Delivery'
    });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    const returnedOrders = await Order.countDocuments({ status: 'Returned' });

    const salesResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: { $ifNull: ['$grandTotal', 0] }
          }
        }
      }
    ]);

    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        totalSales
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch order statistics'
    });
  }
};

// ==============================
// EXPORTS
// ==============================
module.exports = {
  createOrder: exports.createOrder,
  getAllOrders: exports.getAllOrders,
  getOrderById: exports.getOrderById,
  updateOrderStatus: exports.updateOrderStatus,
  cancelOrder: exports.cancelOrder,
  returnOrder: exports.returnOrder,
  getOrderStats: exports.getOrderStats
};

// ==============================
// models/Order.js  (COMPLETE FIXED)
// ==============================
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerEmail: {
    type: String,
    default: ''
  },
  customerName: {
    type: String,
    default: 'Customer'
  },
  customerPhone: {
    type: String,
    default: ''
  },
  customerAddress: {
    type: String,
    default: ''
  },
  customerCity: {
    type: String,
    default: ''
  },
  customerPinCode: {
    type: String,
    default: ''
  },
  items: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    title: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  totalItems: {
    type: Number,
    required: true,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  shippingCharge: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash On Delivery', 'UPI', 'Debit Card', 'Credit Card', 'Wallet', 'Net Banking', 'EMI'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Ready To Ship', 'Shipped', 'Out For Delivery', 'Delivered', 'Completed', 'Cancelled', 'Returned', 'Refunded'],
    default: 'Pending'
  },
  timeline: [{
    status: String,
    date: String,
    remarks: String,
    adminName: String
  }],
  tracking: {
    currentLocation: {
      type: String,
      default: 'Processing Center'
    },
    estimatedDelivery: String,
    trackingHistory: [{
      status: String,
      location: String,
      date: String,
      time: String
    }]
  },
  cancellationReason: String,
  returnReason: String,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['Pending', 'Processed', 'Failed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

orderSchema.index({ userId: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);

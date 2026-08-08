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
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerAddress: {
    type: String,
    required: true
  },
  customerCity: {
    type: String,
    required: true
  },
  customerPinCode: {
    type: String,
    required: true
  },
  items: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    title: String,
    image: String,
    price: Number,
    discountPrice: Number,
    quantity: Number,
    gst: Number,
    shippingCharge: Number
  }],
  totalItems: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingCharge: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
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

// Index for search
orderSchema.index({ userId: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);

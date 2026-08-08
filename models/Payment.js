const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  orderId: {
    type: String,
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
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
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    upiId: String,
    cardLast4: String,
    bankName: String
  },
  refundAmount: Number,
  refundReason: String,
  refundDate: Date
}, {
  timestamps: true
});

// Index for search
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ customerEmail: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

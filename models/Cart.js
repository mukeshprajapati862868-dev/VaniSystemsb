const mongoose = require('mongoose');

// Each item in the cart stores the product reference by ID
// plus a snapshot of key fields so the cart still renders
// even if a product is later updated.
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    // Snapshot fields – populated from Product at add-time
    title: { type: String, default: '' },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    gst: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true   // one cart per user
    },
    items: [cartItemSchema],
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null
    },
    couponCode: { type: String, default: '' },
    subtotal: { type: Number, default: 0 },
    totalGST: { type: Number, default: 0 },
    totalShipping: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);

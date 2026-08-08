const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─────────────────────────────────────────────
// Helper: recalculate totals directly on a cart
// document (in-place mutation, call before save)
// ─────────────────────────────────────────────
function recalculateTotals(cart) {
  let subtotal = 0;
  let totalGST = 0;
  let totalShipping = 0;

  for (const item of cart.items) {
    const itemPrice = item.price || 0;
    const gstAmt = Math.round(itemPrice * (item.gst || 0) / 100);
    const shipping = item.shippingCharge || 0;

    subtotal += itemPrice * item.quantity;
    totalGST += gstAmt * item.quantity;
    totalShipping += shipping * item.quantity;
  }

  const couponDiscount = cart.couponDiscount || 0;

  cart.subtotal = subtotal;
  cart.totalGST = totalGST;
  cart.totalShipping = totalShipping;
  cart.grandTotal = subtotal + totalGST + totalShipping - couponDiscount;
}

// ─────────────────────────────────────────────
// Helper: format a cart document for the API
// response so the frontend always gets a
// consistent shape.
// ─────────────────────────────────────────────
function formatCart(cart) {
  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      title: item.title,
      price: item.price,
      image: item.image,
      category: item.category,
      description: item.description,
      gst: item.gst,
      shippingCharge: item.shippingCharge,
      discount: item.discount,
      // Convenience total for this line
      lineTotal: item.price * item.quantity
    })),
    appliedCoupon: cart.appliedCoupon,
    couponCode: cart.couponCode,
    subtotal: cart.subtotal,
    totalGST: cart.totalGST,
    totalShipping: cart.totalShipping,
    couponDiscount: cart.couponDiscount,
    grandTotal: cart.grandTotal,
    totalItems: cart.items.reduce((sum, i) => sum + i.quantity, 0)
  };
}

// ─────────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Return an empty cart shape – don't save until the user actually adds something
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.id,
          items: [],
          subtotal: 0,
          totalGST: 0,
          totalShipping: 0,
          couponDiscount: 0,
          grandTotal: 0,
          totalItems: 0
        }
      });
    }

    res.status(200).json({ success: true, data: formatCart(cart) });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching cart' });
  }
};

// ─────────────────────────────────────────────
// POST /api/cart/add
// body: { productId, quantity }
// ─────────────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    // Fetch the product from MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Stock check
    if (product.stock !== undefined && product.stock === 0) {
      return res.status(400).json({ success: false, error: 'Product is out of stock' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Use findOneAndUpdate with upsert so the operation is atomic
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [],
        couponDiscount: 0
      });
    }

    // Check if the product is already in the cart
    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    // Build the item snapshot from the live product data
    const itemSnapshot = {
      productId: product._id,
      title: product.title || product.name || '',
      price: product.discountPrice || product.price || 0,
      image: product.image || product.imageUrl || '',
      category: product.category || '',
      description: product.description || '',
      gst: product.gst || 0,
      shippingCharge: product.shippingCharge || 0,
      discount: product.discount || 0
    };

    if (existingIndex > -1) {
      // Increase quantity
      cart.items[existingIndex].quantity += qty;
      // Refresh snapshot in case product data changed
      Object.assign(cart.items[existingIndex], itemSnapshot);
    } else {
      cart.items.push({ ...itemSnapshot, quantity: qty });
    }

    recalculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: `${product.title} added to cart`,
      data: formatCart(cart)
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, error: 'Server error adding to cart' });
  }
};

// ─────────────────────────────────────────────
// PUT /api/cart/update
// body: { productId, quantity }
// ─────────────────────────────────────────────
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res.status(400).json({ success: false, error: 'productId and quantity are required' });
    }

    const qty = parseInt(quantity, 10);
    if (qty < 1) {
      return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = qty;
    recalculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: formatCart(cart)
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, error: 'Server error updating cart' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/cart/remove/:productId
// ─────────────────────────────────────────────
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const before = cart.items.length;
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId.toString()
    );

    if (cart.items.length === before) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    recalculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: formatCart(cart)
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, error: 'Server error removing item' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/cart/clear
// ─────────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Nothing to clear – return success
      return res.status(200).json({
        success: true,
        message: 'Cart is already empty',
        data: { userId: req.user.id, items: [], subtotal: 0, totalGST: 0, totalShipping: 0, couponDiscount: 0, grandTotal: 0, totalItems: 0 }
      });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    cart.couponCode = '';
    cart.subtotal = 0;
    cart.totalGST = 0;
    cart.totalShipping = 0;
    cart.couponDiscount = 0;
    cart.grandTotal = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: formatCart(cart)
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: 'Server error clearing cart' });
  }
};

// ─────────────────────────────────────────────
// POST /api/cart/apply-coupon
// body: { code }
// ─────────────────────────────────────────────
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }

    const Coupon = require('../models/Coupon');
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or expired coupon code' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(cart.subtotal * coupon.discount / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discount;
    }

    cart.appliedCoupon = coupon._id;
    cart.couponCode = coupon.code;
    cart.couponDiscount = discount;
    recalculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied. You save ₹${discount}!`,
      data: formatCart(cart)
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ success: false, error: 'Server error applying coupon' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/cart/remove-coupon
// ─────────────────────────────────────────────
exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.appliedCoupon = null;
    cart.couponCode = '';
    cart.couponDiscount = 0;
    recalculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      data: formatCart(cart)
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({ success: false, error: 'Server error removing coupon' });
  }
};

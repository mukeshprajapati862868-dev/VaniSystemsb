// ==============================
// controllers/cartController.js  (COMPLETE CLEAN)
// ==============================
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─────────────────────────────────────────────
// Helper: recalculate totals
// ─────────────────────────────────────────────
function recalculateTotals(cart) {
  let subtotal = 0;

  for (const item of cart.items) {
    const itemPrice = item.price || 0;
    subtotal += itemPrice * item.quantity;
  }

  const couponDiscount = cart.couponDiscount || 0;

  cart.subtotal = subtotal;
  cart.grandTotal = subtotal - couponDiscount;
}

// ─────────────────────────────────────────────
// Helper: format cart response
// ─────────────────────────────────────────────
function formatCart(cart) {
  return {
    _id: cart._id,
    userId: cart.userId,
    items: cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      title: item.title,
      price: item.price,
      image: item.image,
      description: item.description,
      lineTotal: (item.price || 0) * item.quantity,
    })),
    appliedCoupon: cart.appliedCoupon,
    couponCode: cart.couponCode,
    subtotal: cart.subtotal,
    couponDiscount: cart.couponDiscount || 0,
    grandTotal: cart.grandTotal,
    totalItems: cart.items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

// ─────────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.id,
          items: [],
          subtotal: 0,
          couponDiscount: 0,
          grandTotal: 0,
          totalItems: 0,
        },
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
// ─────────────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [],
        couponDiscount: 0,
      });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    // Clean snapshot (only existing fields)
    const itemSnapshot = {
      productId: product._id,
      title: product.title || '',
      price: product.price || 0,
      image: product.image || '',
      description: product.description || '',
    };

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
      Object.assign(cart.items[existingIndex], itemSnapshot);
    } else {
      cart.items.push({ ...itemSnapshot, quantity: qty });
    }

    recalculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: `${product.title} added to cart`,
      data: formatCart(cart),
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, error: 'Server error adding to cart' });
  }
};

// ─────────────────────────────────────────────
// PUT /api/cart/update
// ─────────────────────────────────────────────
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res.status(400).json({
        success: false,
        error: 'productId and quantity are required',
      });
    }

    const qty = parseInt(quantity, 10);
    if (qty < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1',
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
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
      data: formatCart(cart),
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
      (item) => item.productId.toString() !== productId.toString()
    );

    if (cart.items.length === before) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    recalculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: formatCart(cart),
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
      return res.status(200).json({
        success: true,
        message: 'Cart is already empty',
        data: {
          userId: req.user.id,
          items: [],
          subtotal: 0,
          couponDiscount: 0,
          grandTotal: 0,
          totalItems: 0,
        },
      });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    cart.couponCode = '';
    cart.subtotal = 0;
    cart.couponDiscount = 0;
    cart.grandTotal = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: formatCart(cart),
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: 'Server error clearing cart' });
  }
};

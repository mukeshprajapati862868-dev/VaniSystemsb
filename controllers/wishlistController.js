// const Wishlist = require('../models/Wishlist');
// const Product = require('../models/Product');

// /**
//  * @desc    Get user's wishlist
//  * @route   GET /api/wishlist
//  * @access  Private
//  */
// exports.getWishlist = async (req, res) => {
//   try {
//     let wishlist = await Wishlist.findOne({ userId: req.user.id });
//     if (!wishlist) {
//       wishlist = await Wishlist.create({
//         userId: req.user.id,
//         items: []
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: { wishlist }
//     });
//   } catch (error) {
//     console.error('Get wishlist error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Add item to wishlist
//  * @route   POST /api/wishlist/add
//  * @access  Private
//  */
// exports.addToWishlist = async (req, res) => {
//   try {
//     const { productId } = req.body;

//     // Check if product exists
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     let wishlist = await Wishlist.findOne({ userId: req.user.id });
//     if (!wishlist) {
//       wishlist = await Wishlist.create({
//         userId: req.user.id,
//         items: []
//       });
//     }

//     // Check if item already exists in wishlist
//     if (wishlist.items.includes(productId)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Item already in wishlist'
//       });
//     }

//     wishlist.items.push(productId);
//     await wishlist.save();

//     res.status(200).json({
//       success: true,
//       message: 'Item added to wishlist',
//       data: { wishlist }
//     });
//   } catch (error) {
//     console.error('Add to wishlist error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Remove item from wishlist
//  * @route   DELETE /api/wishlist/remove/:productId
//  * @access  Private
//  */
// exports.removeFromWishlist = async (req, res) => {
//   try {
//     let wishlist = await Wishlist.findOne({ userId: req.user.id });
//     if (!wishlist) {
//       return res.status(404).json({
//         success: false,
//         error: 'Wishlist not found'
//       });
//     }

//     wishlist.items = wishlist.items.filter(
//       item => item !== req.params.productId
//     );

//     await wishlist.save();

//     res.status(200).json({
//       success: true,
//       message: 'Item removed from wishlist',
//       data: { wishlist }
//     });
//   } catch (error) {
//     console.error('Remove from wishlist error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Clear wishlist
//  * @route   DELETE /api/wishlist/clear
//  * @access  Private
//  */
// exports.clearWishlist = async (req, res) => {
//   try {
//     let wishlist = await Wishlist.findOne({ userId: req.user.id });
//     if (!wishlist) {
//       return res.status(404).json({
//         success: false,
//         error: 'Wishlist not found'
//       });
//     }

//     wishlist.items = [];
//     await wishlist.save();

//     res.status(200).json({
//       success: true,
//       message: 'Wishlist cleared',
//       data: { wishlist }
//     });
//   } catch (error) {
//     console.error('Clear wishlist error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// ==========================================
// Wishlist Handler Functions
// ==========================================

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
exports.getWishlist = async (req, res) => {
  try {
    const db = req.app.get("db") || { wishlists: [] };
    
    if (!db.wishlists) {
      db.wishlists = [];
    }

    let wishlist = db.wishlists.find(w => w.userId === req.user.id);
    
    if (!wishlist) {
      wishlist = {
        userId: req.user.id,
        items: []
      };
      db.wishlists.push(wishlist);
      req.app.set("db", db);
    }

    res.status(200).json({
      success: true,
      data: { wishlist }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Add item to wishlist
 * @route   POST /api/wishlist/add
 * @access  Private
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const db = req.app.get("db") || { wishlists: [] };

    if (!db.wishlists) {
      db.wishlists = [];
    }

    let wishlist = db.wishlists.find(w => w.userId === req.user.id);
    if (!wishlist) {
      wishlist = {
        userId: req.user.id,
        items: []
      };
      db.wishlists.push(wishlist);
    }

    if (wishlist.items.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Item already in wishlist'
      });
    }

    wishlist.items.push(productId);
    req.app.set("db", db);

    res.status(200).json({
      success: true,
      message: 'Item added to wishlist',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Remove item from wishlist
 * @route   DELETE /api/wishlist/remove/:productId
 * @access  Private
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const db = req.app.get("db");
    if (!db || !db.wishlists) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist database not found'
      });
    }

    let wishlist = db.wishlists.find(w => w.userId === req.user.id);
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    wishlist.items = wishlist.items.filter(
      item => item !== req.params.productId
    );
    req.app.set("db", db);

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist/clear
 * @access  Private
 */
exports.clearWishlist = async (req, res) => {
  try {
    const db = req.app.get("db");
    if (!db || !db.wishlists) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist database not found'
      });
    }

    let wishlist = db.wishlists.find(w => w.userId === req.user.id);
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    req.app.set("db", db);

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

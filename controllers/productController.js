// const Product = require('../models/Product');

// /**
//  * @desc    Get all products
//  * @route   GET /api/products
//  * @access  Public
//  */
// exports.getAllProducts = async (req, res) => {
//   try {
//     const { search, category, featured, status, page = 1, limit = 12 } = req.query;

//     // Build query
//     const query = {};
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { sku: { $regex: search, $options: 'i' } }
//       ];
//     }
//     if (category) query.category = category;
//     if (featured === 'true') query.featured = true;
//     if (status) query.status = status;

//     const skip = (page - 1) * limit;
//     const products = await Product.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Product.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: {
//         products,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get products error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };



// /**
//  * @desc    Get single product
//  * @route   GET /api/products/:id
//  * @access  Public
//  */
// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: { product }
//     });
//   } catch (error) {
//     console.error('Get product error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Create new product
//  * @route   POST /api/products
//  * @access  Private/Admin
//  */
// exports.createProduct = async (req, res) => {
//   try {
//     console.log('Create product request body:', req.body);
//     console.log('Create product user:', req.user);

//     // Check if SKU already exists
//     const skuExists = await Product.findOne({ sku: req.body.sku });
//     if (skuExists) {
//       return res.status(400).json({
//         success: false,
//         error: 'Product with this SKU already exists'
//       });
//     }

//     const productData = { ...req.body };
    
//     // Only add createdBy if user exists and has valid ObjectId
//     if (req.user?.id && req.user.id.match(/^[0-9a-fA-F]{24}$/)) {
//       productData.createdBy = req.user.id;
//     }

//     const product = await Product.create(productData);

//     res.status(201).json({
//       success: true,
//       message: 'Product created successfully',
//       data: { product }
//     });
//   } catch (error) {
//     console.error('Create product error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Update product
//  * @route   PUT /api/products/:id
//  * @access  Private/Admin
//  */
// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     Object.assign(product, req.body);
//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: 'Product updated successfully',
//       data: { product }
//     });
//   } catch (error) {
//     console.error('Update product error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /**
//  * @desc    Delete product
//  * @route   DELETE /api/products/:id
//  * @access  Private/Admin
//  */
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     await Product.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       success: true,
//       message: 'Product deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete product error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

const Product = require('../models/Product');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, featured, status, page = 1, limit = 12 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res) => {
  try {
    console.log('Incoming Payload Data Verified.');

    // 1. Check if SKU already exists
    const skuExists = await Product.findOne({ sku: req.body.sku });
    if (skuExists) {
      return res.status(400).json({
        success: false,
        error: 'Product with this SKU already exists'
      });
    }

    const productData = { ...req.body };
    
    // 2. Safe Fallback Processing Engine for Base64 and Multer paths
    if (req.file && req.file.path) {
       productData.image = req.file.path; 
    } else if (req.body.image) {
       // If frontend explicitly passes storage base64, map it directly
       productData.image = req.body.image;
    } else {
       productData.image = ''; // Default Fallback string
    }

    // Only add createdBy if user exists and has valid ObjectId
    if (req.user?.id && req.user.id.match(/^[0-9a-fA-F]{24}$/)) {
      productData.createdBy = req.user.id;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updateData = { ...req.body };
    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    }

    Object.assign(product, updateData);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

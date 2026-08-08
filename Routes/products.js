// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const { protect, adminOnly } = require('../middleware/auth');
// const {
//   getAllProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct
// } = require('../controllers/productController');

// const router = express.Router();

// // route   GET /api/products
// // desc    Get all products
// // access  Public
// router.get('/', getAllProducts);

// // route   GET /api/products/:id
// // desc    Get single product
// // access  Public
// router.get('/:id', getProductById);

// // route   POST /api/products
// // desc    Create new product
// // access  Public (for admin panel)
// router.post('/', [
//   body('title').trim().notEmpty().withMessage('Title is required'),
//   body('category').notEmpty().withMessage('Category is required'),
//   body('price').isNumeric().withMessage('Price must be a number'),
//   body('sku').trim().notEmpty().withMessage('SKU is required')
// ], (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       errors: errors.array()
//     });
//   }
//   createProduct(req, res);
// });

// // route   PUT /api/products/:id
// // desc    Update product
// // access  Private/Admin
// router.put('/:id', protect, adminOnly, updateProduct);

// // route   DELETE /api/products/:id
// // desc    Delete product
// // access  Private/Admin
// router.delete('/:id', protect, adminOnly, deleteProduct);

// module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const router = express.Router();

// route   GET /api/products
router.get('/', getAllProducts);

// route   GET /api/products/:id
router.get('/:id', getProductById);

// route   POST /api/products
// Fixed validation middleware execution flow
router.post(
  '/', 
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('sku').trim().notEmpty().withMessage('SKU is required')
  ], 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    // Safeguarded forward loop
    createProduct(req, res, next);
  }
);

// route   PUT /api/products/:id
router.put('/:id', updateProduct);

// route   DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;

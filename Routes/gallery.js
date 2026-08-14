const express = require('express');
const { body, validationResult } = require('express-validator');
const galleryController = require('../controllers/galleryController');

const router = express.Router();

// Upload image
router.post(
  '/upload',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('dataUrl').notEmpty().withMessage('dataUrl is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    galleryController.uploadFromDataUrl(req, res);
  }
);

// Get all images
router.get('/', galleryController.getGalleryImages);

// Delete image
router.delete('/:id', galleryController.deleteGalleryImage);

module.exports = router;

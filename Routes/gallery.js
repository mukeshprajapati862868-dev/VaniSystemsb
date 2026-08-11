const express = require('express');
const { body, validationResult } = require('express-validator');
const galleryController = require('../controllers/galleryController');

const router = express.Router();

router.post('/upload', [
  body('name').notEmpty().withMessage('Name is required'),
  body('dataUrl').notEmpty().withMessage('dataUrl is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  galleryController.uploadFromDataUrl(req, res);
});

router.get('/', (req, res) => {
  galleryController.getGalleryImages(req, res);
});

module.exports = router;

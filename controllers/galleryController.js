const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

exports.uploadFromDataUrl = async (req, res) => {
  try {
    const { name, dataUrl } = req.body;

    if (!name || !dataUrl) {
      return res.status(400).json({
        success: false,
        error: 'Name and dataUrl are required'
      });
    }

    // Base64 validation
    const matches = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
    if (!matches) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data. Only png, jpeg, jpg, webp allowed'
      });
    }

    const ext = matches[2]; // png / jpeg / jpg / webp
    const base64Data = matches[3];

    // Double extension fix
    const cleanName = name
      .replace(/\.(png|jpeg|jpg|webp)$/i, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const filename = `${Date.now()}-${cleanName}.${ext}`;
    const uploadDir = path.join(__dirname, '..', 'uploads', 'gallery');

    // Folder create if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    // Save in database
    const gallery = await Gallery.create({
      name: cleanName,
      filename: filename,
      path: `/uploads/gallery/${filename}`
    });

    return res.status(201).json({
      success: true,
      data: gallery
    });

  } catch (error) {
    console.error('Gallery upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

exports.getGalleryImages = async (req, res) => {
  try {
    const galleryImages = await Gallery.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: galleryImages
    });
  } catch (error) {
    console.error('Get gallery images error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', image.path.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

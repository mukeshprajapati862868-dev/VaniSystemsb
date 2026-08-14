const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

// Accepts base64 dataUrl or multipart (handled elsewhere)
exports.uploadFromDataUrl = async (req, res) => {
  try {
    const { name, dataUrl } = req.body;

    if (!name || !dataUrl) {
      return res.status(400).json({ success: false, error: 'Name and dataUrl are required' });
    }

    // Parse base64 data URL
    const matches = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
    if (!matches) {
      return res.status(400).json({ success: false, error: 'Invalid image data' });
    }

    const ext = matches[2]; // png | jpeg | jpg | webp
    const base64Data = matches[3];

    // ✅ FIXED: name se extension hata do taaki double extension na aaye
    const cleanName = name.replace(/\.(png|jpeg|jpg|webp)$/i, '').replace(/\s+/g, '-');
    const filename = `${Date.now()}-${cleanName}.${ext}`;

    const uploadDir = path.join(__dirname, '..', 'uploads', 'gallery');
    
    // Folder create karo (agar nahi hai)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const gallery = await Gallery.create({
      name: cleanName,
      filename,
      path: `/uploads/gallery/${filename}`
    });

    res.status(201).json({ success: true, data: gallery });

  } catch (error) {
    // ✅ Real error ab response me bhi dikhega (temporary debugging ke liye)
    console.error('Gallery upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message,        // real error message
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getGalleryImages = async (req, res) => {
  try {
    const galleryImages = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: galleryImages });
  } catch (error) {
    console.error('Get gallery images error:', error);
    res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
};

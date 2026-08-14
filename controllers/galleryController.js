const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

// ==================== UPLOAD ====================
exports.uploadFromDataUrl = async (req, res) => {
  // Sabse pehle response bhejne layak banao
  try {
    console.log('===== GALLERY UPLOAD HIT =====');

    if (!req.body) {
      return res.status(400).json({ success: false, error: 'No body received' });
    }

    const { name, dataUrl } = req.body;

    console.log('Name:', name);
    console.log('dataUrl present:', !!dataUrl);
    console.log('dataUrl length:', dataUrl ? dataUrl.length : 0);

    if (!name || !dataUrl) {
      return res.status(400).json({
        success: false,
        error: 'Name and dataUrl are required'
      });
    }

    // ===== Base64 check =====
    const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);

    if (!matches) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Only PNG, JPEG, JPG, WEBP allowed'
      });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const base64Data = matches[2];

    // ===== Clean filename =====
    let cleanName = String(name)
      .replace(/\.(png|jpe?g|webp)$/gi, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'image';

    const filename = `${Date.now()}-${cleanName}.${ext}`;
    console.log('Final filename:', filename);

    // ===== Folder create =====
    const uploadDir = path.join(__dirname, '..', 'uploads', 'gallery');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Folder created');
    }

    const filePath = path.join(uploadDir, filename);

    // ===== Write file =====
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    console.log('File written successfully');

    // ===== Save to DB =====
    const gallery = await Gallery.create({
      name: cleanName,
      filename: filename,
      path: `/uploads/gallery/${filename}`
    });

    console.log('Saved to DB:', gallery._id);

    return res.status(201).json({
      success: true,
      data: gallery
    });

  } catch (error) {
    console.error('===== UPLOAD ERROR =====');
    console.error(error.message);
    console.error(error.stack);

    // Hamesha proper JSON bhejo
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ==================== GET ALL ====================
exports.getGalleryImages = async (req, res) => {
  try {
    const galleryImages = await Gallery.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: galleryImages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ==================== UPDATE ====================
exports.updateGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    if (req.body.name) {
      image.name = req.body.name;
      await image.save();
    }

    return res.status(200).json({ success: true, data: image });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ==================== DELETE ====================
exports.deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

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
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
